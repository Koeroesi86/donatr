import useApiClient from "../useApiClient";
import {useEffect, useState} from "react";
import {NeedResource, NeedsFilters} from "../../types";

const useNeeds = (filter?: NeedsFilters) => {
  const api = useApiClient<'needs'>('needs');
  const [needs, setNeeds] = useState<NeedResource[]>([]);

  useEffect(() => {
    api.all(filter).then(setNeeds).catch(console.error);
  }, [api, filter]);

  return needs;
}

export default useNeeds;
