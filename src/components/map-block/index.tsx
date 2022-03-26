import React, {FC, ReactNode, useEffect, useRef} from "react";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import {LatLngExpression} from "leaflet";

interface MapBlockProps {
  center?: LatLngExpression;
  className?: string;
  zoom?: number;
  markers: { lat: number; lng: number; popup: ReactNode, key: string }[];
}

const MapBlock: FC<MapBlockProps> = ({ markers, className, center, zoom = 6 }) => {
  const timer = useRef();
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
  }, [markers])
  return (
    <MapContainer center={center} zoom={zoom} className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker
          key={marker.key}
          position={{lat: marker.lat, lng: marker.lng}}
          ref={m => {
            if (markers.length === 1 && m && m.openPopup) {
              // @ts-ignore
              timer.current = setTimeout(() => m.openPopup(), 10);
            }
          }}
        >
          <Popup>
            {marker.popup}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapBlock;
