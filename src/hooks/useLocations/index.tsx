import useApiClient from "../useApiClient";
import {useEffect, useState} from "react";
import {LocationResource, LocationsFilters} from "../../types";

const useLocations = (filter?: LocationsFilters) => {
  const api = useApiClient<'locations'>('locations');
  const [locations, setLocations] = useState<LocationResource[]>([]);

  useEffect(() => {
    api.all(filter).then(setLocations).catch(console.error);
  }, [api, filter]);

  return locations;
}

export default useLocations;
