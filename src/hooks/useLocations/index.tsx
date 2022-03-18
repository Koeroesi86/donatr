import useApiClient from "../useApiClient";
import {useEffect, useState} from "react";
import {LocationResource, LocationsFilters} from "../../types";
import {sortByNames} from "../../utils";

const useLocations = (filter?: LocationsFilters) => {
  const api = useApiClient<'locations'>('locations');
  const [locations, setLocations] = useState<LocationResource[]>([]);

  useEffect(() => {
    api.all(filter).then((l) => setLocations(l.sort(sortByNames))).catch(console.error);
  }, [api, filter]);

  return locations;
}

export default useLocations;
