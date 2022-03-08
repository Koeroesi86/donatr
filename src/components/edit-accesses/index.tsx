import React, {FC, useCallback, useEffect, useState} from "react";
import {Access, AccessFilters, Organisation} from "../../types";
import {ApiClient} from "../../utils";
import EditAccess from "../edit-access";

const api = new ApiClient<Access, undefined, AccessFilters>('access');
const apiOrganisation = new ApiClient<Organisation, 'locations'>('organisations');

const EditAccesses: FC = () => {
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>();

  const refresh = useCallback(() => {
    api.all().then(setAccesses);
    apiOrganisation.all().then(setOrganisations);
  }, []);

  const update = useCallback((data: Access) => {
    api.update(data).then(() => refresh());
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!organisations) {
    return null;
  }

  return (
    <>
      {accesses.map((access) => (
        <EditAccess
          key={`access-${access.id}`}
          access={access}
          onChange={update}
          organisations={organisations}
        />
      ))}
    </>
  );
};

export default EditAccesses;
