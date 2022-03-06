import getResourceIds from "../getResourceIds";
import path from "path";
import fs from "fs";

interface BaseResource {
  id: string;
}

export default class JsonResource<T extends BaseResource> {
  private readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  all = async (): Promise<T[]> => {
    const ids = await getResourceIds(this.basePath);
    const all = await Promise.all(ids.map(async (id) => this.one(id)));

    return all.filter(Boolean);
  };

  one = async (id: string): Promise<T | undefined> => {
    const fileName = path.resolve(this.basePath, `./${id}.json`);

    if (!fs.existsSync(fileName)) return undefined;

    const content = await fs.promises.readFile(fileName, 'utf8');
    const need: T = JSON.parse(content);

    return need;
  };

  remove = async (id: string): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./${id}.json`);

    if (!fs.existsSync(fileName)) return;

    await fs.promises.unlink(fileName);
  };

  set = async (data: T): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./need/${data.id}.json`);
    await fs.promises.writeFile(fileName, JSON.stringify(data, null, 2), 'utf8');
  }
}