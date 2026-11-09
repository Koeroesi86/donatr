import type { Readable } from "node:stream";

// the webserver streams the request body to the worker instead of putting it into the event
const readBody = async (event: { bodyStream: Readable }): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of event.bodyStream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
};

export default readBody;
