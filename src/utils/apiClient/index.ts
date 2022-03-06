import axios from "axios";

interface BaseResource {
  id: string;
}

export default class ApiClient<T extends BaseResource, C> {
  private readonly resource: string;

  constructor(resource: 'locations' | 'organisations' | 'needs') {
    this.resource = resource;
  }

  all = (): Promise<T[]> =>
    axios.get<T[]>(`/api/${this.resource}`).then(r => r.data);
  one = (id: string): Promise<T> =>
    axios.get<T>(`/api/${this.resource}/${id}`).then(r => r.data);
  create = (data: C): Promise<T[]> =>
    axios.post<T[]>(`/api/${this.resource}`, data).then(r => r.data);
  update = (data: T): Promise<T> =>
    axios.put<T>(`/api/${this.resource}/${data.id}`, data).then(r => r.data);
  remove= (data: T): Promise<void> =>
    axios.delete(`/api/${this.resource}/${data.id}`);
}
