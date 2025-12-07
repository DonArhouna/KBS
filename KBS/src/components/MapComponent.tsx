
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  defaultLocation?: { lat: number; lng: number };
  height?: string;
  showBothLocations?: boolean;
  showOnlyMain?: boolean;
}

const MapComponent = ({ 
  onLocationSelect, 
  defaultLocation = { lat: 14.7104, lng: -17.4526 }, // Centered on main location when showing only main
  height = "400px",
  showBothLocations = true,
  showOnlyMain = false
}: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // KB&S locations
  const locations = {
    main: {
      coords: [14.6928, -17.4467], // Kounoune - Villa 103 Cité ANCAR 2
      address: "Villa 103 Cité ANCAR 2, Kounoune",
      type: "Siège social"
    },
    depot: {
      coords: [14.7280956, -17.458417], // Maristes, Dakar
      address: "Maristes, Dakar", 
      type: "Dépôt"
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use OpenStreetMap with Mapbox GL JS (no token required)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [defaultLocation.lng, defaultLocation.lat],
      zoom: showOnlyMain ? 13 : 11
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoaded(true);
      
      if (showOnlyMain) {
        // Show only main location
        const location = locations.main;
        
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cssText = `
          background-color: #22c55e;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        // Add icon
        const icon = document.createElement('div');
        icon.innerHTML = '📍';
        icon.style.fontSize = '12px';
        el.appendChild(icon);

        // Create marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.coords[1], location.coords[0]])
          .addTo(map.current!);

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #22c55e;">${location.type}</h4>
              <p style="margin: 0; font-size: 14px;">${location.address}</p>
            </div>
          `);

        marker.setPopup(popup);
        
        // Center on main location
        map.current.setCenter([location.coords[1], location.coords[0]]);
        
      } else if (showBothLocations) {
        // Add markers for both locations
        Object.entries(locations).forEach(([key, location]) => {
          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.cssText = `
            background-color: #22c55e;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          `;
          
          // Add icon
          const icon = document.createElement('div');
          icon.innerHTML = '📍';
          icon.style.fontSize = '12px';
          el.appendChild(icon);

          // Create marker
          const marker = new mapboxgl.Marker(el)
            .setLngLat([location.coords[1], location.coords[0]])
            .addTo(map.current!);

          // Create popup
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px;">
                <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #22c55e;">${location.type}</h4>
                <p style="margin: 0; font-size: 14px;">${location.address}</p>
              </div>
            `);

          marker.setPopup(popup);
        });

        // Fit map to show both locations
        const bounds = new mapboxgl.LngLatBounds();
        Object.values(locations).forEach(location => {
          bounds.extend([location.coords[1], location.coords[0]]);
        });
        map.current.fitBounds(bounds, { padding: 50 });
      } else {
        // Single marker for interaction
        const marker = new mapboxgl.Marker({ draggable: true })
          .setLngLat([defaultLocation.lng, defaultLocation.lat])
          .addTo(map.current!);

        // Handle marker drag
        marker.on('dragend', async () => {
          if (!onLocationSelect) return;
          
          const lngLat = marker.getLngLat();
          const address = `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
          
          onLocationSelect({
            lat: lngLat.lat,
            lng: lngLat.lng,
            address
          });
        });

        // Handle map click
        map.current.on('click', (e) => {
          if (!onLocationSelect) return;
          
          marker.setLngLat(e.lngLat);
          const address = `${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(6)}`;
          
          onLocationSelect({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
            address
          });
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [defaultLocation, onLocationSelect, showBothLocations, showOnlyMain]);

  const openNavigation = (location: 'main' | 'depot') => {
    const coords = locations[location].coords;
    const address = locations[location].address;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}&destination_place_id=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full">
      <div 
        ref={mapContainer} 
        style={{ height }}
        className="w-full rounded-lg border"
      />
      
      {showOnlyMain && (
        <div className="mt-4">
          <Card className="border border-kbs-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-kbs-green" />
                <h4 className="font-semibold text-sm">Adresse principale</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{locations.main.address}</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => openNavigation('main')}
                className="w-full border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Y aller
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {showBothLocations && !showOnlyMain && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-kbs-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-kbs-green" />
                <h4 className="font-semibold text-sm">Siège social</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{locations.main.address}</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => openNavigation('main')}
                className="w-full border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Y aller
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-kbs-green/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-kbs-green" />
                <h4 className="font-semibold text-sm">Dépôt</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{locations.depot.address}</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => openNavigation('depot')}
                className="w-full border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Y aller
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!showBothLocations && !showOnlyMain && (
        <p className="text-sm text-gray-600 mt-2">
          Cliquez ou faites glisser le marqueur pour sélectionner une localisation
        </p>
      )}
    </div>
  );
};

export default MapComponent;
