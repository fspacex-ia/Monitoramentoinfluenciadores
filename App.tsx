import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MapArea from './components/MapArea';
import { parseRawData } from './utils/parsing';
import { InstagramPage, Stats, FilterState } from './types';
import { Menu } from 'lucide-react';

// Include FontAwesome for the map markers as requested by the original code's style
const FontAwesomeLink = () => (
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
);

const App: React.FC = () => {
  // --- Data Initialization ---
  // Memoize parsing so it only runs once
  const allData = useMemo(() => parseRawData(), []);

  // --- State ---
  const [filters, setFilters] = useState<FilterState>({
    regional: 'Todas',
    minFollowers: 0,
    showActive: true,
    showProblematic: true
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Derived Data (Regionais) ---
  const availableRegionais = useMemo(() => {
    const regions = new Set<string>(allData.map(d => d.regional));
    return Array.from(regions).sort((a, b) => {
      // Smart sort for "Regional 1", "Regional 2", "Regional 10"
      const numA = parseInt((a as string).replace(/\D/g, '')) || 99;
      const numB = parseInt((b as string).replace(/\D/g, '')) || 99;
      return numA - numB;
    });
  }, [allData]);

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      // 1. Regional Filter
      if (filters.regional !== "Todas" && item.regional !== filters.regional) return false;

      // 2. Followers Filter
      if ((item.seguidoresNum || 0) < filters.minFollowers) return false;

      // 3. Category Groups Filter
      const isProblematicGroup = ['problem', 'none', 'old'].includes(item.category);
      if (isProblematicGroup && !filters.showProblematic) return false;
      if (!isProblematicGroup && !filters.showActive) return false;

      return true;
    });
  }, [allData, filters]);

  // --- Statistics Logic ---
  const stats: Stats = useMemo(() => {
    const uniqueBairros = new Set(filteredData.map(d => d.bairro)).size;
    const totalPaginas = filteredData.length;
    const totalSeguidores = filteredData.reduce((acc, curr) => acc + (curr.seguidoresNum || 0), 0);
    const mediaSeguidores = totalPaginas > 0 ? (totalSeguidores / totalPaginas) : 0;

    return {
      bairros: uniqueBairros,
      paginas: totalPaginas,
      seguidores: totalSeguidores,
      media: mediaSeguidores
    };
  }, [filteredData]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      <FontAwesomeLink />
      
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-white p-2.5 rounded-full shadow-lg text-indigo-600 hover:bg-slate-50 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <Sidebar 
        stats={stats}
        filters={filters}
        setFilters={setFilters}
        availableRegionais={availableRegionais}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Map Area */}
      <MapArea data={filteredData} />
    </div>
  );
};

export default App;