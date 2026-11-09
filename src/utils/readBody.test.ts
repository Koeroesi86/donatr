/**
 * @jest-environment node
 */
import { Readable } from "node:stream";
import readBody from "./readBody";

describe('readBody', () => {
  it('joins the streamed parts, including multibyte characters split across chunks', async () => {
    const bytes = Buffer.from('{"name":"Segítsünk"}');
    const bodyStream = Readable.from([bytes.subarray(0, 12), bytes.subarray(12)]);

    expect(await readBody({ bodyStream })).toBe('{"name":"Segítsünk"}');
  });

  it('is empty for a request without a body', async () => {
    expect(await readBody({ bodyStream: Readable.from([]) })).toBe('');
  });
});
