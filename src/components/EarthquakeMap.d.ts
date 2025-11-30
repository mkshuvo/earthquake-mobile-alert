import React from 'react';

export interface EarthquakeMapProps {
  onEarthquakeSelect: (id: string) => void;
  onLegendOpen?: () => void;
}

export declare const EarthquakeMap: React.FC<EarthquakeMapProps>;
