import React, {FC, useCallback, useEffect, useState} from "react";
import {LatLngExpression} from "leaflet";
import {MapConsumer, MapContainer, Marker, Popup, TileLayer, useMapEvents} from "react-leaflet";
import * as LCG from "leaflet-control-geocoder";
import {GeocodingResult} from "leaflet-control-geocoder/dist/geocoders";
import {Autocomplete, Button, TextField} from "@mui/material";
import {FormattedMessage, useIntl} from "react-intl";
import debounce from "lodash.debounce";
import {PickedLocation} from "../../types";

// @ts-ignore
const geocoder = new LCG.geocoders.nominatim();

interface PickerProps {
  onPick: (pick: { lat: number; lng: number; }) => void | Promise<void>;
}
const Picker: FC<PickerProps> = ({ onPick }) => {
  useMapEvents({
    click: (e) => {
      onPick(e.latlng);
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
  const search = useCallback(debounce((t: string) => {
    geocoder.geocode(t, (results: GeocodingResult[]) => {
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
  const [pickedLocation, setPickedLocation] = useState<PickedLocation>(picked);
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
        <MapConsumer>
          {(map) => (
            <Picker
              onPick={(p) => {
                geocoder.reverse(p, map.getZoom(), (results: GeocodingResult[]) => {
                  if (!results[0]) return;
                  const current = results[0];

                  setPickedLocation({
                    lat: current.center.lat,
                    lng: current.center.lng,
                    text: current.name,
                  });
                })
              }}
            />
          )}
        </MapConsumer>
        {pickedLocation && (
          <Marker
            position={{ lat: pickedLocation.lat, lng: pickedLocation.lng }}
            ref={m => m && m.openPopup && m.openPopup()}
          >
            <Popup>
              {pickedLocation.text}
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <Button onClick={() => onSave(pickedLocation)} disabled={!pickedLocation}>
        <FormattedMessage id="input.location.set.location.label" />
      </Button>
    </>
  );
};

export default LocationPicker;
