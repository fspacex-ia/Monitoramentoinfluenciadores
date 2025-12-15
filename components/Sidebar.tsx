import React from 'react';
import { Stats, FilterState } from '../types';
import { CAT_COLORS } from '../constants';
import { Filter, Users, MapPin, Hash, Activity, X } from 'lucide-react';

interface SidebarProps {
  stats: Stats;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableRegionais: string[];
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  stats, 
  filters, 
  setFilters, 
  availableRegionais,
  isOpen,
  onClose
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, minFollowers: parseInt(e.target.value) }));
  };

  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-50 w-full sm:w-[380px] bg-slate-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-6 relative shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
           <MapPin className="w-6 h-6" /> Mapa Instagram
        </h1>
        <p className="mt-1 text-sm font-light opacity-90">Análise de páginas por bairros de Fortaleza</p>
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center hover:-translate-y-1 transition-transform">
            <span className="text-2xl font-bold text-indigo-500">{stats.bairros}</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Bairros</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center hover:-translate-y-1 transition-transform">
            <span className="text-2xl font-bold text-indigo-500">{stats.paginas}</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Páginas</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center hover:-translate-y-1 transition-transform">
            <span className="text-2xl font-bold text-indigo-500">{formatNumber(stats.seguidores)}</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Seguidores</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center hover:-translate-y-1 transition-transform">
            <span className="text-2xl font-bold text-indigo-500">{formatNumber(stats.media)}</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Média</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg mb-4">
            <Filter className="w-5 h-5 text-indigo-500" /> Filtros Avançados
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">Regional</label>
            <select 
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={filters.regional}
              onChange={(e) => setFilters(prev => ({ ...prev, regional: e.target.value }))}
            >
              <option value="Todas">Todas as Regionais</option>
              {availableRegionais.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Seguidores Mínimos: <span className="text-indigo-600 font-bold">{filters.minFollowers >= 1000 ? `${filters.minFollowers / 1000}k` : filters.minFollowers}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="150000" 
              step="1000" 
              value={filters.minFollowers}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0</span>
              <span>150k+</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={filters.showActive}
                onChange={(e) => setFilters(prev => ({ ...prev, showActive: e.target.checked }))}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-3 text-sm text-slate-700">Mostrar Páginas Ativas</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={filters.showProblematic}
                onChange={(e) => setFilters(prev => ({ ...prev, showProblematic: e.target.checked }))}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-3 text-sm text-slate-700">Mostrar Páginas com Problemas</span>
            </label>
          </div>
        </div>

        {/* Legend */}
        <div>
           <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg mb-4">
            <Activity className="w-5 h-5 text-indigo-500" /> Legenda
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
             <div className="flex items-center"><div style={{ backgroundColor: CAT_COLORS.active }} className="w-4 h-4 rounded mr-2 shrink-0"></div> Ativas</div>
             <div className="flex items-center"><div style={{ backgroundColor: CAT_COLORS.problem }} className="w-4 h-4 rounded mr-2 shrink-0"></div> Baixo Engajamento</div>
             <div className="flex items-center"><div style={{ backgroundColor: CAT_COLORS.humor }} className="w-4 h-4 rounded mr-2 shrink-0"></div> Humor</div>
             <div className="flex items-center"><div style={{ backgroundColor: CAT_COLORS.oposition }} className="w-4 h-4 rounded mr-2 shrink-0"></div> Oposição</div>
             <div className="flex items-center"><div style={{ backgroundColor: CAT_COLORS.old }} className="w-4 h-4 rounded mr-2 shrink-0"></div> Antigas</div>
             <div className="flex items-center"><div style={{ backgroundColor: CAT_COLORS.none }} className="w-4 h-4 rounded mr-2 shrink-0"></div> Sem Página</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;