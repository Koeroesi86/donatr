import useApiClient from "../useApiClient";
import {useEffect, useState} from "react";
import {OrganisationResource} from "../../types";
import {sortByNames} from "../../utils";

const useOrganisations = () => {
  const api = useApiClient<'organisations'>('organisations');
  const [organisations, setOrganisations] = useState<OrganisationResource[]>([]);
  
  useEffect(() => {
    api.all().then((o) => setOrganisations(o.sort(sortByNames))).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return organisations;
};

export default useOrganisations;
