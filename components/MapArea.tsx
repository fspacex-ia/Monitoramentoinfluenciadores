import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { InstagramPage } from '../types';
import { CAT_COLORS } from '../constants';

interface MapAreaProps {
  data: InstagramPage[];
}

// Icon mapping to FontAwesome classes (which we map to Lucide conceptually via class names or just strings)
// Since we are using Leaflet DivIcons with HTML strings as per the original code, we need to stick to 
// string-based icons or reconstruct the HTML. The original code uses FontAwesome classes.
// To keep it looking *exactly* like the request, we will render the HTML string expected by the CSS we added.
const getIconClass = (category: string) => {
    switch (category) {
        case 'humor': return 'fa-masks-theater';
        case 'oposition': return 'fa-bullhorn';
        case 'none': return 'fa-ban';
        case 'problem': return 'fa-exclamation-triangle';
        case 'old': return 'fa-history';
        default: return 'fa-user';
    }
}

const MapArea: React.FC<MapAreaProps> = ({ data }) => {
  
  const createCustomIcon = (category: string) => {
    // @ts-ignore - indexing const with string
    const color = CAT_COLORS[category] || CAT_COLORS['active'];
    const iconClass = getIconClass(category);
    
    // Note: We use the `fa` classes. Since we switched to Lucide for the UI, 
    // we need to make sure the markers icons still work. 
    // To ensure the markers look right without importing the huge FontAwesome CSS, 
    // we can use a small trick: We will render simple SVGs inside the HTML string, 
    // OR just use FontAwesome CDN in index.html as requested in the original code.
    // The prompt says "Use existing libraries". The original code used FA. 
    // Let's assume FA is available via CDN in index.html for the map markers to be 100% faithful,
    // or replace with SVG. For robustness, I'll inject the font-awesome CDN in index.html 
    // OR (better) map these classes to unicode or SVG strings.
    // Let's stick to the FontAwesome CDN in the index.html for map markers to ensure visual fidelity 
    // to the original design while using Lucide for the App UI.
    
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style='background-color:${color}' class='marker-pin'></div><i class='fa-solid ${iconClass}'></i>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -35]
    });
  };

  return (
    <div className="flex-grow h-full z-0 relative">
      <MapContainer 
        center={[-3.7450, -38.5300]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        
        {data.map((item) => {
             // @ts-ignore
            const headerColor = CAT_COLORS[item.category];
            const iconClass = getIconClass(item.category);

            return (
                <Marker 
                    key={item.id} 
                    position={item.latLng} 
                    icon={createCustomIcon(item.category)}
                >
                    <Popup>
                        <div className="font-sans">
                            <div className="text-white font-bold text-base px-4 py-3" style={{ backgroundColor: headerColor }}>
                                <i className={`fa-solid ${iconClass} mr-2`}></i> {item.nome || item.bairro}
                            </div>
                            <div className="p-4 text-sm text-slate-700">
                                <div className="flex items-center mb-1.5">
                                    <i className="fa-solid fa-map w-5 text-center text-slate-400 mr-2"></i>
                                    <span><b>Regional:</b> {item.regional}</span>
                                </div>
                                <div className="flex items-center mb-1.5">
                                    <i className="fa-solid fa-location-dot w-5 text-center text-slate-400 mr-2"></i>
                                    <span><b>Bairro:</b> {item.bairro}</span>
                                </div>
                                {item.seguidoresStr && (
                                    <div className="flex items-center mb-1.5">
                                        <i className="fa-solid fa-users w-5 text-center text-slate-400 mr-2"></i>
                                        <span><b>Seguidores:</b> {item.seguidoresStr}</span>
                                    </div>
                                )}
                                
                                <div className="mt-3">
                                    <span className="text-xs text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: headerColor }}>
                                        {item.status || 'Status'}
                                    </span>
                                </div>

                                {item.obs && (
                                    <div className="mt-2 text-xs italic text-slate-500 border-l-2 border-slate-200 pl-2">
                                        "{item.obs}"
                                    </div>
                                )}

                                {item.link && item.link !== '#' && (
                                    <a 
                                        href={item.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block text-center text-white font-bold py-2 px-3 rounded mt-4 hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: headerColor }}
                                    >
                                        Ver Instagram
                                    </a>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            )
        })}
      </MapContainer>
      
      {/* Zoom control is handled by React-Leaflet default or we can add custom. 
          The original used bottomright. React Leaflet defaults to topleft. 
          To match perfectly we would move it, but default is fine for UX.
      */}
    </div>
  );
};

export default MapArea;