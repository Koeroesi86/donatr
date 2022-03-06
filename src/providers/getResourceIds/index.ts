import fs from "fs";

const getResourceIds = async (dirName: string): Promise<string[]> => {
  if (!fs.existsSync(dirName)) {
    return [];
  }

  const fileNames = await fs.promises.readdir(dirName);
  const ids = fileNames
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));

  return ids;
};

export default getResourceIds;
