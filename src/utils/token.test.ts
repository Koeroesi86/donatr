import jwt from "jsonwebtoken";
import {deserialize, serialize} from "./token";
import {Access} from "../types";

const access: Access = { id: '1', code: 'abc', organisationIds: ['org-1'], translations: true };

describe('token', () => {
  it('round-trips an access through serialize and deserialize', async () => {
    const token = await serialize(access);

    expect(await deserialize(token)).toEqual(access);
  });

  it('issues tokens that expire in 7 days', async () => {
    const { payload } = jwt.decode(await serialize(access), { complete: true }) as jwt.Jwt;
    const { iat, exp } = payload as jwt.JwtPayload;

    expect((exp ?? 0) - (iat ?? 0)).toBe(7 * 24 * 60 * 60);
  });

  it('rejects a token that was tampered with', async () => {
    const [header, , signature] = (await serialize(access)).split('.');
    const forgedPayload = Buffer.from(JSON.stringify({ access: { ...access, all: true } })).toString('base64url');

    await expect(deserialize(`${header}.${forgedPayload}.${signature}`)).rejects.toThrow('invalid signature');
  });

  it('rejects a token signed with another secret', async () => {
    const token = jwt.sign({ access }, 'another-secret');

    await expect(deserialize(token)).rejects.toThrow('invalid signature');
  });

  it('rejects an expired token', async () => {
    const token = jwt.sign({ access }, 'secret', { expiresIn: -10 });

    await expect(deserialize(token)).rejects.toThrow('jwt expired');
  });

  it('rejects a missing token', async () => {
    await expect(deserialize(undefined as unknown as string)).rejects.toThrow();
  });
});
