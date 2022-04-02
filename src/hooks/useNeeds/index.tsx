import useApiClient from "../useApiClient";
import {useEffect} from "react";
import {NeedsFilters} from "../../types";
import {sortByNames} from "../../utils";
import {useAppDispatch, useAppSelector} from "../../redux";
import {getNeeds} from "../../redux/selectors";
import needsReducer from "../../redux/needsReducer";

const useNeeds = (filter?: NeedsFilters) => {
  const api = useApiClient<'needs'>('needs');
  const needs = useAppSelector(getNeeds());
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (needs.length === 0) {
      api.all()
        .then((n) => dispatch(needsReducer.actions.setNeeds(n)))
        .catch(console.error);
    }
  }, [api, dispatch, needs.length]);

  return needs
    .filter(n => filter && filter.search ? n.name.includes(filter.search) : true)
    .filter(n => filter && filter.locationId ? n.locationId === filter.locationId : true)
    .sort(sortByNames);
}

export default useNeeds;
