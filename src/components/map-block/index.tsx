import React, {FC, ReactNode, useEffect, useRef, useState} from "react";
import {render} from "react-dom";
import {MapContainer, Marker, Popup, TileLayer, useMapEvents} from "react-leaflet";
import {LatLngExpression, DomUtil, Control} from "leaflet";
import {Box} from "@mui/material";
import LocationIcon from '@mui/icons-material/GpsFixed';

interface MapBlockProps {
  center?: LatLngExpression;
  className?: string;
  zoom?: number;
  markers: { lat: number; lng: number; popup: ReactNode, key: string }[];
}

const LocationMarker: FC = () => {
  const map = useMapEvents({
    locationfound(e) {
      const zoom = map.getZoom();
      map.flyTo(e.latlng, zoom < 9 ? zoom * 2 : 18);
    }
  });

  useEffect(() => {
    const centerControl = new Control({ position: 'topleft' });

    centerControl.onAdd = () => {
      const div = DomUtil.create('div', '');
      render(
        <Box
          onClick={() => map.locate()}
          sx={{
            width: '34px',
            height: '34px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            border: '2px solid rgba(0, 0, 0, 0.2)',
            color: '#000',
            borderRadius: '4px',
            boxSizing: 'border-box',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f4f4f4',
            },
        }}
        >
          <LocationIcon width={20} height={20} />
        </Box>,
        div
      );
      return div;
    };

    map.addControl(centerControl);
  }, [map]);
  return null;
};

const MapBlock: FC<MapBlockProps> = ({ markers, className, center: initialCenter, zoom = 6 }) => {
  const timer = useRef();
  const [center] = useState(initialCenter);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
  }, [markers]);

  return (
    <MapContainer center={center} zoom={zoom} className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
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
