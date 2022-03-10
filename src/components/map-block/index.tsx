import React, {FC, ReactNode} from "react";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import {LatLngExpression} from "leaflet";

interface MapBlockProps {
  center: LatLngExpression;
  className?: string;
  zoom?: number;
  markers: { lat: number; lng: number; popup: ReactNode }[];
}

const MapBlock: FC<MapBlockProps> = ({ markers, className, center, zoom = 6 }) => (
  <MapContainer center={center} zoom={zoom} className={className}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {markers.map((marker) => (
      <Marker position={{ lat: marker.lat, lng: marker.lng }} key={`marker-${marker.lat}-${marker.lng}`}>
        <Popup>
          {marker.popup}
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);

export default MapBlock;
