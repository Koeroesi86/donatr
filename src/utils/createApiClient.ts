import {PathToFilters, PathToType, Resources} from "../types";
import axios from "axios";

const createApiClient = (origin: string) => {
  const instance = axios.create({
    baseURL: `${origin.replace(/\/$/, '')}/api/`,
    validateStatus: (status) => status < 400,
  });
  
  return {
    all: <P extends Resources>(resource: Resources, params?: PathToFilters[P]) =>
      instance.get<PathToType[P][]>(resource, {params}).then((r) => r.data),
    one: <P extends Resources>(resource: Resources, id: string) =>
      instance.get<PathToType[P]>(`${resource}/${id}`).then((r) => r.data),
  };
};

export default createApiClient;
