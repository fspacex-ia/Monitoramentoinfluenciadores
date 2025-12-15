export type CategoryType = 'active' | 'problem' | 'humor' | 'oposition' | 'old' | 'none';

export interface InstagramPage {
  id: string;
  nome: string;
  bairro: string;
  regional: string;
  seguidoresNum: number;
  seguidoresStr: string;
  link: string;
  obs: string;
  status: string;
  category: CategoryType;
  latLng: [number, number];
}

export interface Stats {
  bairros: number;
  paginas: number;
  seguidores: number;
  media: number;
}

export interface FilterState {
  regional: string;
  minFollowers: number;
  showActive: boolean;
  showProblematic: boolean;
}
