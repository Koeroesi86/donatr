import React, {FC, useEffect, useMemo, useState} from "react";
import {LatLngExpression} from "leaflet";
import {MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents} from "react-leaflet";
import {geocoders} from "leaflet-control-geocoder";
import {Autocomplete, Button, TextField} from "@mui/material";
import {FormattedMessage, useIntl} from "react-intl";
import debounce from "lodash.debounce";
import {PickedLocation} from "../../types";

const geocoder = new geocoders.Nominatim();

interface PickerProps {
  onPick: (pick: { lat: number; lng: number; }, zoom: number) => void | Promise<void>;
}
const Picker: FC<PickerProps> = ({ onPick }) => {
  const map = useMap();
  useMapEvents({
    click: (e) => {
      onPick(e.latlng, map.getZoom());
    },
  });

  return null;
};

interface SearchProps {
  picked?: PickedLocation;
  onSelect: (picked: PickedLocation) => void | Promise<void>;
}
const Search: FC<SearchProps> = ({ picked, onSelect }) => {
  const intl = useIntl();
  const [term, setTerm] = useState(picked?.text || '');
  const [options, setOptions] = useState<PickedLocation[]>([]);
  const search = useMemo(() => debounce((t: string) => {
    geocoder.geocode(t).then((results) => {
      setOptions(results.map<PickedLocation>((r) => ({
        lat: r.center.lat,
        lng: r.center.lng,
        text: r.name,
      })));
    });
  }, 1000), []);

  useEffect(() => {
    search(term);
  }, [term, search]);

  return (
    <Autocomplete
      value={picked}
      inputValue={term}
      options={options}
      filterOptions={(a) => a}
      filterSelectedOptions
      autoComplete
      getOptionLabel={(option: string | PickedLocation) => typeof option === 'string' ? option : option.text}
      onChange={(e, newValue: PickedLocation) => onSelect(newValue)}
      onInputChange={(e, newInputValue) => setTerm(newInputValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={intl.formatMessage({ id: 'input.location.search.location.label' })}
          fullWidth
        />
      )}
    />
  )
}

interface LocationPickerProps {
  picked?: PickedLocation;
  onSave: (picked: PickedLocation) => void | Promise<void>;
}

const LocationPicker: FC<LocationPickerProps> = ({ onSave, picked }) => {
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | undefined>(picked);
  const [center] = useState<LatLngExpression>({
    lat: picked?.lat || 47.497913,
    lng: picked?.lng || 19.040236,
  });
  return (
    <>
      <Search picked={pickedLocation} onSelect={setPickedLocation} />
      <MapContainer
        style={{ minHeight: '400px' }}
        center={center}
        zoom={6}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <Picker
          onPick={(p, zoom) => {
            geocoder.reverse(p, zoom).then((results) => {
              if (!results[0]) return;
              const current = results[0];

              setPickedLocation({
                lat: current.center.lat,
                lng: current.center.lng,
                text: current.name,
              });
            });
          }}
        />
        {pickedLocation && (
          <Marker
            position={{ lat: pickedLocation.lat, lng: pickedLocation.lng }}
            ref={m => { m?.openPopup?.(); }}
          >
            <Popup>
              {pickedLocation.text}
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <Button onClick={() => pickedLocation && onSave(pickedLocation)} disabled={!pickedLocation}>
        <FormattedMessage id="input.location.set.location.label" />
      </Button>
    </>
  );
};

export default LocationPicker;
