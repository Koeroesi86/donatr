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
export const useMap = shim;
export const useMapEvents = shim;

// Only used in client side effects (see map-block), so they are never called on the server
export const Control = class {};
export const DomUtil = {
  create: () => null,
};

export const geocoders = {
  Nominatim: class {}
};
