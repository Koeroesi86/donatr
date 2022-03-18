import useApiClient from "../useApiClient";
import {useEffect, useState} from "react";
import {OrganisationResource} from "../../types";

const useOrganisations = () => {
  const api = useApiClient<'organisations'>('organisations');
  const [organisations, setOrganisations] = useState<OrganisationResource[]>([]);
  
  useEffect(() => {
    api.all().then(setOrganisations).catch(console.error);
  }, [api]);
  
  return organisations;
};

export default useOrganisations;
