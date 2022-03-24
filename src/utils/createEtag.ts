import crypto from "crypto";

const createEtag = (body: string, byteLength: number) => {
  if (body.length === 0) {
    // fast-path empty
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
  }

  // compute hash of entity
  const hash = crypto
    .createHash('sha1')
    .update(body, 'utf8')
    .digest('base64')
    .substring(0, 27);

  return `"${byteLength.toString(16)}-${hash}"`;
};

export default createEtag;
