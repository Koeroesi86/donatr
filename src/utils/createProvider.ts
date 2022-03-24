import {JsonProvider, MockProvider} from "../providers";
import {Provider} from "../types";

const createProvider = (variant: 'json'|'mock'): Provider => {
  switch (variant) {
    case 'json':
      return new JsonProvider({ basePath: process.env.DATA_BASE_PATH });
    case 'mock':
      return new MockProvider();
    default: throw new Error(`Unknown variant: ${variant}`);
  }
};

export default createProvider;
