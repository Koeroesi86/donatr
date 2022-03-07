import axios from "axios";

interface BaseResource {
  id: string;
}

export default class ApiClient<T extends BaseResource, OmitFields extends keyof T, F extends { [k: string]: string } = undefined> {
  private readonly resource: string;

  constructor(resource: 'locations' | 'organisations' | 'needs' | 'access') {
    this.resource = resource;
  }

  all = (filters?: F): Promise<T[]> => {
    const url = new URL(window.location.origin);
    url.pathname = `/api/${this.resource}`;
    if (filters) {
      Object.keys(filters).forEach(key => {
        url.searchParams.set(key, filters[key]);
      });
    }
    return axios.get<T[]>(url.toJSON()).then(r => r.data);
  };

  one = (id: string): Promise<T> =>
    axios.get<T>(`/api/${this.resource}/${id}`).then(r => r.data);

  create = (data: Omit<Omit<T, OmitFields>, 'id'>): Promise<T[]> =>
    axios.post<T[]>(`/api/${this.resource}`, data).then(r => r.data);

  update = (data: Omit<T, OmitFields>): Promise<T> =>
    // @ts-ignore
    axios.put<T>(`/api/${this.resource}/${data.id}`, data).then(r => r.data);

  remove = (data: Omit<T, OmitFields>): Promise<void> =>
    // @ts-ignore
    axios.delete(`/api/${this.resource}/${data.id}`);
}
