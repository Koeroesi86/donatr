import useApiClient from "../useApiClient";
import {useEffect} from "react";
import {sortByNames} from "../../utils";
import {useAppDispatch, useAppSelector} from "../../redux";
import {getOrganisations} from "../../redux/selectors";
import organisationsReducer from "../../redux/organisationsReducer";

const useOrganisations = () => {
  const api = useApiClient<'organisations'>('organisations');
  const organisations = useAppSelector(getOrganisations());
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (organisations.length === 0) {
      api.all().then((o) => dispatch(organisationsReducer.actions.setOrganisations(o))).catch(console.error);
    }
  }, [api, dispatch, organisations.length]);
  
  return organisations.sort(sortByNames);
};

export default useOrganisations;
