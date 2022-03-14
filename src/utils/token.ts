import jwt, {Jwt, JwtPayload} from "jsonwebtoken";
import {Access} from "../types";

const secret = 'secret';

export const serialize = async (access: Access): Promise<string> => {
  const result = await new Promise<string>((resolve, reject) => jwt.sign({
    access,
  }, secret, { expiresIn: '7d' }, (err: Error | null, token?: string) => {
    if (err) reject(err);
    resolve(token);
  }));
  return result;
};

interface AccessToken extends Jwt {
  payload: { access: Access } & JwtPayload
}
export const deserialize = async (token: string): Promise<Access> => {
  const decoded = await new Promise<AccessToken>((resolve, reject) =>
    jwt.verify(token, secret, { complete: true }, (err, d: AccessToken) => {
      if (err) reject(err);
      resolve(d);
    })
  );
  return decoded.payload.access;
};
