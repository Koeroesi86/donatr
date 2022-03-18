import useApiClient from "../useApiClient";
import {useEffect, useState} from "react";
import {NeedResource, NeedsFilters} from "../../types";
import {sortByNames} from "../../utils";

const useNeeds = (filter?: NeedsFilters) => {
  const api = useApiClient<'needs'>('needs');
  const [needs, setNeeds] = useState<NeedResource[]>([]);

  useEffect(() => {
    api.all(filter).then((n) => setNeeds(n.sort(sortByNames))).catch(console.error);
  }, [api, filter]);

  return needs;
}

export default useNeeds;
