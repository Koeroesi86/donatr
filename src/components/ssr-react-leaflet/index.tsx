import React, {FC} from "react";

const shim: FC = () => null;

export const MapContainer: FC<{className: string}> = ({ className }) =>
  <div
    className={[
      className,
      'leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom'
    ].join(' ')}
  />;
export const Marker = shim;
export const Popup = shim;
export const TileLayer = shim;
export const MapConsumer = shim;
export const useMapEvents = shim;

export const geocoders= {
  nominatim: class {}
};
