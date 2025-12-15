import { RAW_DATA_STRING, COORDENADAS_FORTALEZA, COORD_DEFAULT, MAP_REGIONAIS } from '../constants';
import { InstagramPage, CategoryType } from '../types';

function getCoordenadas(bairro: string): [number, number] {
  const bairroLimpo = bairro.trim().toLowerCase();
  let coords = COORD_DEFAULT;
  
  for (const [key, value] of Object.entries(COORDENADAS_FORTALEZA)) {
      if (bairroLimpo.includes(key.toLowerCase()) || key.toLowerCase().includes(bairroLimpo)) {
          coords = value;
          break;
      }
  }
  // Add jitter to avoid stacking perfectly on top of each other
  const jitterLat = (Math.random() - 0.5) * 0.004;
  const jitterLng = (Math.random() - 0.5) * 0.004;
  return [coords[0] + jitterLat, coords[1] + jitterLng];
}

function getRegionalByBairro(bairro: string): string | null {
  const bairroNorm = bairro.toLowerCase().trim();
  for (const [regional, listaBairros] of Object.entries(MAP_REGIONAIS)) {
      if (listaBairros.some(b => bairroNorm.includes(b.toLowerCase()) || b.toLowerCase().includes(bairroNorm))) {
          return regional;
      }
  }
  return null;
}

function parseSeguidores(str: string): number {
  if(!str) return 0;
  // Handle formats like "2,4 mil", "10k", etc.
  let numStr = str.toLowerCase().replace(',', '.').replace(/[^\d.mk]/g, '');
  let multiplier = 1;
  if (str.toLowerCase().includes('milhões') || str.toLowerCase().includes('milhoes')) multiplier = 1000000;
  else if (str.toLowerCase().includes('mil') || str.toLowerCase().includes('k')) multiplier = 1000;
  
  const parsed = parseFloat(numStr);
  return isNaN(parsed) ? 0 : parsed * multiplier;
}

function categorizeItem(item: Partial<InstagramPage>, obs: string): CategoryType {
  const obsLower = (obs || "").toLowerCase();
  
  if (obsLower.includes("humor")) return 'humor';
  if (obsLower.includes("oposição") || obsLower.includes("governo") || obsLower.includes("prefeitura")) return 'oposition';
  if (obsLower.includes("antiga") || obsLower.includes("2023") || obsLower.includes("2024") || obsLower.includes("inativo") || obsLower.includes("faz muito tempo")) return 'old';
  if (obsLower.includes("não tem") || item.seguidoresNum === 0) return 'none';
  if (obsLower.includes("pessimo") || obsLower.includes("péssimo") || obsLower.includes("baixo")) return 'problem';
  
  return 'active';
}

export function parseRawData(): InstagramPage[] {
  const lines = RAW_DATA_STRING.split('\n');
  let modoProblema = false;
  let currentSection = "";
  const regexSeguidores = /(\d+([.,]\d+)?\s*(mil|milhões|k)?)/i;
  const data: InstagramPage[] = [];

  lines.forEach((line, index) => {
    line = line.trim();
    if (!line) return;

    if (line.includes("NÃO TEM PÁGINA")) { modoProblema = true; currentSection = "NÃO TEM PÁGINA"; return; }
    if (line.toUpperCase().includes("REGIONAL")) { modoProblema = false; currentSection = line.trim(); return; }
    if (line.includes("INDICAÇÃO")) { modoProblema = false; currentSection = "Indicação"; return; }
    if (line.startsWith("Nome Seguidores") || line.startsWith("Bairro Máx.seguidores")) return;

    let item: Partial<InstagramPage> = { id: `item-${index}` };
    const match = line.match(regexSeguidores);

    if (match) {
        const strSeguidores = match[0];
        const parts = line.split(strSeguidores);
        const parteEsq = parts[0].trim();
        const parteDir = parts.slice(1).join(strSeguidores).trim(); 

        if (!modoProblema) {
            item.nome = parteEsq;
            item.seguidoresStr = strSeguidores;
            item.seguidoresNum = parseSeguidores(strSeguidores);
            
            const linkMatch = parteDir.match(/(https?:\/\/\S+)/);
            if (linkMatch) {
                item.link = linkMatch[0];
                item.bairro = parteDir.replace(item.link, '').trim();
            } else {
                item.link = "#";
                item.bairro = parteDir;
            }
            item.status = "Ativa";
            item.obs = ""; // Default empty obs for active pages unless specified
        } else {
            item.bairro = parteEsq;
            item.obs = parteDir;
            item.seguidoresStr = strSeguidores;
            item.seguidoresNum = parseSeguidores(strSeguidores);
            item.status = (item.obs?.toLowerCase().includes("não tem") || item.seguidoresNum === 0) 
                ? "Inexistente" : "Baixo Engajamento";
            item.nome = item.bairro; // fallback name
            item.link = "#";
        }
    } else if (line.toLowerCase().includes("não tem") || line.includes("---")) {
        const parts = line.split("---");
        item.bairro = parts[0].trim();
        item.obs = "Não tem página / Dados insuficientes";
        item.status = "Inexistente";
        item.seguidoresNum = 0;
        item.seguidoresStr = "0";
        item.nome = item.bairro;
        item.link = "#";
    }

    if (item.bairro) {
        item.latLng = getCoordenadas(item.bairro);
        
        let reg = getRegionalByBairro(item.bairro);
        if (!reg) {
             if (currentSection.toUpperCase().includes("REGIONAL")) {
                 const num = currentSection.replace(/\D/g, '');
                 if (num) reg = "Regional " + num;
                 else reg = currentSection;
             }
             else {
                 reg = "Outros";
             }
        }
        item.regional = reg;
        item.category = categorizeItem(item, item.obs || "");
        
        data.push(item as InstagramPage);
    }
  });

  return data;
}
