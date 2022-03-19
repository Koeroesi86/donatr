import {useMemo} from "react";
import axios from "axios";
import {PathToFilters, PathToResource, PathToType, Resources} from "../../types";
import useApiToken from "../useApiToken";
import {useIntl} from "react-intl";

const useApiClient = <P extends Resources>(resource: Resources) => {
  const {getToken} = useApiToken();
  const intl = useIntl();
  const instance = useMemo(() =>
    axios.create({
      baseURL: `/api/${resource}`,
      headers: {
        'x-access-token': getToken(),
        'x-target-locale': intl.locale.split('-')[0],
      },
      validateStatus: (status) => status < 400,
    }), [getToken, intl.locale, resource]);
  
  return useMemo(() => ({
    all: (params?: PathToFilters[P]) =>
      instance.get<PathToType[P][]>('/', {params}).then((r) => r.data),
    one: (id: string) =>
      instance.get<PathToType[P]>(`/${id}`).then((r) => r.data),
    create: (data: Omit<PathToResource[P], 'id'>) =>
      instance.post<PathToType[P][]>('/', data).then((r) => r.data),
    update: (data: PathToResource[P]) =>
      instance.put<PathToType[P]>(`/${data.id}`, data).then((r) => r.data),
    remove: (data: PathToResource[P]): Promise<void> =>
      instance.delete(`/${data.id}`).then(() => Promise.resolve()),
  }), [instance]);
};

export default useApiClient;
