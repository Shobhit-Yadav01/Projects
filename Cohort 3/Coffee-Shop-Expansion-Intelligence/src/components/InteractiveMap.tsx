import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Bike, 
  Store, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Sparkles,
  Info
} from 'lucide-react';
import { BikeRouteSegment, CandidateLocation, ExistingStore } from '../types.js';

interface InteractiveMapProps {
  candidates: CandidateLocation[];
  existingStores: ExistingStore[];
  bikeRoutes: BikeRouteSegment[];
  selectedCandidate: CandidateLocation | null;
  onSelectCandidate: (candidate: CandidateLocation) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  candidates,
  existingStores,
  bikeRoutes,
  selectedCandidate,
  onSelectCandidate
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  const [showBikeRoutes, setShowBikeRoutes] = useState(true);
  const [showExistingStores, setShowExistingStores] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center on Central London
      const map = L.map(mapContainerRef.current, {
        center: [51.515, -0.11],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // Dark / modern carto tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright' })
        .addAttribution('&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>')
        .addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Ensure proper sizing with ResizeObserver
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  // Update Layers & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !routesLayerRef.current) return;

    // Clear previous
    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();

    // 1. Draw Bike Routes
    if (showBikeRoutes) {
      bikeRoutes.forEach((route) => {
        const isSuperhighway = route.type === 'cycle_superhighway';
        const color = isSuperhighway ? '#0284c7' : '#10b981'; // Sky-600 vs Emerald-500
        const weight = isSuperhighway ? 4 : 3;

        const polyline = L.polyline(route.coordinates, {
          color,
          weight,
          opacity: 0.85,
          dashArray: route.type === 'quietway' ? '6, 6' : undefined
        });

        polyline.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <strong style="color: ${color};">${route.name}</strong><br/>
            <span>Type: ${route.type.replace('_', ' ')} · Daily Flow: ~${route.daily_cyclist_volume.toLocaleString()} cyclists</span>
          </div>
        `, { sticky: true });

        routesLayerRef.current?.addLayer(polyline);
      });
    }

    // 2. Draw Existing Stores
    if (showExistingStores) {
      existingStores.forEach((store) => {
        const storeIcon = L.divIcon({
          className: 'custom-existing-store-marker',
          html: `
            <div style="
              background-color: #78350f;
              border: 2px solid #fef3c7;
              border-radius: 50%;
              width: 26px;
              height: 26px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
              color: white;
              font-size: 11px;
            ">
              ☕
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker([store.latitude, store.longitude], { icon: storeIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; min-width: 180px;">
            <div style="font-weight: bold; color: #78350f; margin-bottom: 2px;">${store.store_name}</div>
            <div style="font-size: 11px; color: #64748b;">${store.area} · Current Branch</div>
            <hr style="margin: 6px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span>Monthly Sales:</span>
              <strong>£${store.monthly_sales.toLocaleString()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span>Daily Customers:</span>
              <strong>${store.daily_customers}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span>Operating Age:</span>
              <strong>${store.store_age_months} mos</strong>
            </div>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 3. Draw Candidate Locations
    candidates.forEach((cand) => {
      const isTop = cand.status === 'Recommended';
      const isStrong = cand.status === 'Strong Candidate';
      const isSelected = selectedCandidate?.id === cand.id;

      let bgColor = '#5F6368'; // Slate/Grey
      let borderColor = '#FFFFFF';
      let pinText = `${cand.overallScore}`;

      if (isTop) {
        bgColor = '#F9AB00'; // Google Amber
        borderColor = '#FFFFFF';
        pinText = `★ ${cand.overallScore}`;
      } else if (isStrong) {
        bgColor = '#4285F4'; // Google Blue
        borderColor = '#FFFFFF';
      }

      const candidateIcon = L.divIcon({
        className: 'custom-candidate-marker',
        html: `
          <div style="
            background: ${bgColor};
            color: ${isTop ? '#202124' : '#FFFFFF'};
            border: ${isSelected ? '3px solid #EA4335' : `2px solid ${borderColor}`};
            border-radius: 6px;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: 700;
            font-family: sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: transform 0.15s ease;
          ">
            ${pinText}
          </div>
        `,
        iconSize: [36, 24],
        iconAnchor: [18, 12]
      });

      const marker = L.marker([cand.latitude, cand.longitude], { icon: candidateIcon });
      
      marker.on('click', () => {
        onSelectCandidate(cand);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #202124; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; background: ${bgColor}; color: ${isTop ? '#202124' : '#fff'}; padding: 1px 5px; border-radius: 4px;">
              ${cand.status.toUpperCase()}
            </span>
            <span style="font-size: 13px; font-weight: 800; color: #202124;">${cand.overallScore} / 100</span>
          </div>
          <div style="font-weight: bold; font-size: 13px; color: #202124;">${cand.name}</div>
          <div style="font-size: 11px; color: #5F6368; margin-bottom: 6px;">${cand.area}</div>
          
          <hr style="margin: 6px 0; border: 0; border-top: 1px solid #DADCE0;"/>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 6px;">
            <div>🚴 Cycling: <strong>${cand.cyclingScore}/100</strong></div>
            <div>👥 Traffic: <strong>${cand.avgFootTrafficPerHour}/hr</strong></div>
            <div>🛡️ Isolation: <strong>${cand.saturationScore}/100</strong></div>
            <div>💷 Est Rev: <strong>£${(cand.estimatedMonthlyRevenue/1000).toFixed(0)}k</strong></div>
          </div>

          <div style="font-size: 10px; color: #3C4043; background: #F8F9FA; padding: 4px 6px; border-radius: 4px; border: 1px solid #DADCE0;">
            <strong>Nearest Route:</strong> ${cand.nearestBikeRouteDistMeters}m to ${cand.nearestBikeRouteName}
          </div>
        </div>
      `);

      markersLayerRef.current?.addLayer(marker);
    });

  }, [candidates, existingStores, bikeRoutes, showBikeRoutes, showExistingStores, selectedCandidate]);

  // Recenter if selectedCandidate changes
  useEffect(() => {
    if (selectedCandidate && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedCandidate.latitude, selectedCandidate.longitude], 14, {
        duration: 0.8
      });
    }
  }, [selectedCandidate]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => {
    if (candidates[0] && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([candidates[0].latitude, candidates[0].longitude], 13);
    }
  };

  return (
    <div className="bg-white border border-[#DADCE0] rounded-lg overflow-hidden shadow-xs my-4">
      
      {/* Map Header Toolbar */}
      <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-[#DADCE0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#4285F4]" />
          <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Spatial Intelligence & Cycling Network Map
          </h3>
          <span className="text-[11px] text-[#70757A] hidden sm:inline">
            (WGS84 Coordinates & ST_DISTANCE Spatial Joins)
          </span>
        </div>

        {/* Layer Toggles & Map Controls */}
        <div className="flex items-center space-x-1.5">
          
          {/* Toggle Bike Routes */}
          <button
            onClick={() => setShowBikeRoutes(!showBikeRoutes)}
            className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
              showBikeRoutes 
                ? 'bg-[#E8F0FE] text-[#1967D2] border-[#4285F4] font-semibold' 
                : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F8F9FA]'
            }`}
            title="Toggle Transport cycling superhighways and quietways"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Bike Routes</span>
          </button>

          {/* Toggle Existing Stores */}
          <button
            onClick={() => setShowExistingStores(!showExistingStores)}
            className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
              showExistingStores 
                ? 'bg-[#FEF7E0] text-[#B06000] border-[#F9AB00] font-semibold' 
                : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F8F9FA]'
            }`}
            title="Toggle current coffee shop chain locations"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Existing Stores</span>
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetCenter}
            className="p-1 rounded text-[#5F6368] hover:text-[#202124] hover:bg-[#E8EAED] border border-[#DADCE0] transition-colors cursor-pointer"
            title="Reset Map to Top Candidate"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Stage */}
      <div className="relative w-full h-[400px] sm:h-[450px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Zoom Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col space-y-1 bg-white border border-[#DADCE0] rounded-md p-1 shadow-md">
          <button
            onClick={handleZoomIn}
            className="p-1 text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA] rounded transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA] rounded transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Legend */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 border border-[#DADCE0] rounded-lg p-2.5 shadow-md text-xs text-[#3C4043] max-w-[270px]">
          <div className="font-bold text-[10px] uppercase tracking-wider text-[#5F6368] mb-1">Map Legend</div>
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#F9AB00] flex-shrink-0" />
              <span>Recommended Top Location</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#4285F4] flex-shrink-0" />
              <span>Strong Candidates (Score &ge; 78)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#5F6368] flex-shrink-0" />
              <span>Moderate / Low Priority</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#78350F] border border-[#FEF3C7] flex-shrink-0" />
              <span>Current Company Store</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-1 bg-[#0284C7] rounded flex-shrink-0" />
              <span>Cycle Superhighway (CS-3 / CS-6)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-1 bg-[#10B981] border-dashed rounded flex-shrink-0" />
              <span>Quietway / Protected Track</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
