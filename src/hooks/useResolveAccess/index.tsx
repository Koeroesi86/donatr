import axios from "axios";
import {useCallback} from "react";
import useApiToken from "../useApiToken";
import {Access} from "../../types";

const useResolveAccess = () => {
  const {setToken} = useApiToken();
  return useCallback((code: string) => {
    return axios.get<Access>(`/api/resolve-access/${code}`).then((response) => {
      setToken(response.headers['x-access-token']);
      return response.data;
    });
  }, [setToken]);
};

export default useResolveAccess;
