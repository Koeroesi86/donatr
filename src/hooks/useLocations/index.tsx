import useApiClient from "../useApiClient";
import {useEffect} from "react";
import {LocationsFilters} from "../../types";
import {sortByNames} from "../../utils";
import {useAppDispatch, useAppSelector} from "../../redux";
import {getLocations} from "../../redux/selectors";
import locationsReducer from "../../redux/locationsReducer";

const useLocations = (filter?: LocationsFilters) => {
  const api = useApiClient<'locations'>('locations');
  const locations = useAppSelector(getLocations());
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (locations.length === 0) {
      api.all().then((l) => dispatch(locationsReducer.actions.setLocations(l))).catch(console.error);
    }
  }, [api, dispatch, locations.length]);

  return locations
    .filter(l => filter && filter.organisationId ? l.organisationId === filter.organisationId : true)
    .sort(sortByNames);
}

export default useLocations;
