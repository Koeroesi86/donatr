import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import debounce from "lodash.debounce";
import crypto from "crypto";
import {AccessFilters, LocationResource, NeedResource, Provider, ResponseEvent, Worker} from "./types";
import {JsonProvider} from "./providers";
import * as token from "./utils/token";
import { hasAccess } from "./utils";


const keepAliveTimeout = 30 * 60 * 1000;
const keepAliveCallback = debounce(() => {
  console.log('Shutting down API due to inactivity.');
  process.exit(0);
}, keepAliveTimeout);

// TODO
console.log('process.env.DATA_BASE_PATH', process.env.DATA_BASE_PATH)

const provider: Provider = new JsonProvider({
  basePath: process.env.DATA_BASE_PATH || (
    fs.existsSync(path.resolve('/var/www/help.koro.si/data'))
      ? path.resolve('/var/www/help.koro.si/data') : path.resolve(process.cwd(), './.data')
  ),
});

const getResponseHeaders = (headers: ResponseEvent["headers"] = {}) => ({
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, PUT, GET, DELETE, OPTIONS',
  ...headers,
});

const etag = (body: string, byteLength: number) => {
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

  return `"${byteLength.toString(16)}-${hash}"`
};

const createResponse = (statusCode: number, data: any, headers: ResponseEvent["headers"] = {}): ResponseEvent => {
  return ({
    statusCode,
    headers: getResponseHeaders(headers),
    body: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    isBase64Encoded: false,
  });
};

const createCacheableResponse = (statusCode: number, data: any, headers: ResponseEvent["headers"] = {}): ResponseEvent => {
  const body = [201, 304].includes(statusCode) ? '' : JSON.stringify(data, null, 2);
  const byteLength = Buffer.byteLength(body, 'utf8');
  return createResponse(statusCode, body, {
    ...headers,
    'Cache-Control': 'public, max-age=0',
    'Content-Length': byteLength.toString(),
    'ETag': etag(body, byteLength),
  });
}

const ensureId = (id: string, resource: { id: string }) => {
  if (id !== resource.id) {
    throw new Error('Invalid ID');
  }
};

const worker: Worker = async (event, callback) => {
  keepAliveCallback();

  try {
    if (event.pathFragments[1] === 'organisations') {
      if (event.pathFragments.length === 2) {
        if (event.httpMethod === 'POST') {
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          if (!("all" in tokenAccess) || !tokenAccess.all) {
            callback(createResponse(401, { message: "Nope." }));
            return;
          }
          await provider.setOrganisation({
            ...JSON.parse(event.body),
            id: uuid(),
          });
        }
        const organisations = await provider.getOrganisations();
        callback(createCacheableResponse(200, organisations));
        return;
      }
      if (event.pathFragments.length === 3) {
        if (event.httpMethod === 'PUT') {
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          if (!hasAccess({ organisationId: event.pathFragments[2] }, tokenAccess)) {
            callback(createResponse(401, { message: "Nope." }));
            return;
          }
          const content = JSON.parse(event.body);
          ensureId(event.pathFragments[2], content);
          await provider.setOrganisation(content);
        }
        if (event.httpMethod === 'DELETE') {
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          if (
            (!("all" in tokenAccess) || !tokenAccess.all)
            && (!("organisationIds" in tokenAccess) || !tokenAccess.organisationIds.includes(event.pathFragments[2]))
          ) {
            callback(createResponse(401, { message: "Nope." }));
            return;
          }
          await provider.removeOrganisation(event.pathFragments[2])
          callback(createResponse(200, ''));
          return;
        }
        const organisation = await provider.getOrganisation(event.pathFragments[2]);
        callback(createCacheableResponse(200, organisation));
        return;
      }
      callback(createCacheableResponse(404, { message: 'no endpoint like this.' }));
      return;
    }

    if (event.pathFragments[1] === 'locations') {
      if (event.pathFragments.length === 2) {
        if (event.httpMethod === 'POST') {
          const content = JSON.parse(event.body) as LocationResource;
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          if (!hasAccess({ organisationId: content.organisationId }, tokenAccess)) {
            callback(createResponse(401, { message: "Nope." }));
            return;
          }
          await provider.setLocation({
            ...content,
            id: uuid(),
          });
        }
        const locations = await provider.getLocations({
          organisationId: event.queryStringParameters.organisationId,
        });
        callback(createCacheableResponse(200, locations));
        return;
      }
      if (event.pathFragments.length === 3) {
        if (['PUT', 'DELETE'].includes(event.httpMethod)) {
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          const loc = await provider.getLocation(event.pathFragments[2]);
          if (
            !hasAccess({ locationId: event.pathFragments[2] }, tokenAccess)
            && !hasAccess({ organisationId: loc.organisationId }, tokenAccess)
          ) {
            callback(createResponse(401, { message: "Nope." }));
            return;
          }
        }
        if (event.httpMethod === 'PUT') {
          const content = JSON.parse(event.body);
          ensureId(event.pathFragments[2], content);
          await provider.setLocation(content);
        }
        if (event.httpMethod === 'DELETE') {
          await provider.removeLocation(event.pathFragments[2]);
          callback(createResponse(200, ''));
          return;
        }
        const location = await provider.getLocation(event.pathFragments[2], event.headers['x-target-locale']);
        if (location) {
          callback(createCacheableResponse(200, location));
          return;
        }
      }
      callback(createCacheableResponse(404, { message: 'no endpoint like this.' }));
      return;
    }

    if (event.pathFragments[1] === 'needs') {
      if (event.pathFragments.length === 2) {
        if (event.httpMethod === 'POST') {
          const content = JSON.parse(event.body) as NeedResource;
          const location = await provider.getLocation(content.locationId);
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          if (
            !hasAccess({ organisationId: location.organisationId }, tokenAccess)
            && !hasAccess({ locationId: content.locationId }, tokenAccess)
          ) {
            callback(createResponse(401, { message: "Nope." }));
            return;
          }
          await provider.setNeed({
            ...JSON.parse(event.body),
            id: uuid(),
          })
        }
        const needs = await provider.getNeeds({
          search: event.queryStringParameters.s,
          locationId: event.queryStringParameters.locationId,
        }, event.headers['x-target-locale']);

        callback(createCacheableResponse(200, needs));
        return;
      }
      if (event.pathFragments.length === 3) {
        if (['PUT', 'DELETE'].includes(event.httpMethod)) {
          const need = await provider.getNeed(event.pathFragments[2]);
          const location = await provider.getLocation(need.locationId);
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          if (
            !hasAccess({ locationId: need.locationId }, tokenAccess)
            && !hasAccess({ organisationId: location.organisationId }, tokenAccess)
          ) {
            callback(createResponse(401, { message: "Nope." }));
            return;
          }
        }
        if (event.httpMethod === 'PUT') {
          const content = JSON.parse(event.body);
          ensureId(event.pathFragments[2], content);
          await provider.setNeed(content);
        }
        if (event.httpMethod === 'DELETE') {
          await provider.removeNeed(event.pathFragments[2]);
          callback(createResponse(200, ''));
          return;
        }
        const need = await provider.getNeed(event.pathFragments[2], event.headers['x-target-locale']);
        if (need) {
          callback(createCacheableResponse(200, need));
          return;
        }
      }
      callback(createCacheableResponse(404, { message: 'no endpoint like this.' }));
      return;
    }

    if (event.pathFragments[1] === 'translations') {
      if (event.pathFragments.length === 2) {
        const translations = await provider.getTranslations();
        callback(createCacheableResponse(200, translations));
        return;
      }

      if (event.pathFragments.length === 3) {
        if (event.httpMethod === 'PUT') {
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          if (!hasAccess({ translations: true }, tokenAccess)) {
            callback(createResponse(401, { message: "Nope." }));
            return;
          }
          const content = JSON.parse(event.body);
          ensureId(event.pathFragments[2], content);
          await provider.setTranslations(content);
        }
        const translation = await provider.getTranslation(event.pathFragments[2]);
        callback(createCacheableResponse(200, translation));
        return;
      }

      callback(createCacheableResponse(404, { message: 'no endpoint like this.' }));
      return;
    }

    if (event.pathFragments[1] === 'access') {
      const tokenAccess = await token.deserialize(event.headers['x-access-token']);
      if (!hasAccess({ accesses: true }, tokenAccess)) {
        callback(createResponse(401, { message: "Nope." }));
        return;
      }

      if (event.pathFragments.length === 2) {
        if (event.httpMethod === 'POST') {
          await provider.setAccess({
            ...JSON.parse(event.body),
            id: uuid(),
          });
        }
        const filters = event.queryStringParameters as AccessFilters;
        const accesses = await provider.getAccesses(filters);
        callback(createResponse(200, accesses));
        return;
      }

      if (event.pathFragments.length === 3) {
        if (event.httpMethod === 'PUT') {
          const content = JSON.parse(event.body);
          ensureId(event.pathFragments[2], content);
          await provider.setAccess(content);
        }
        if (event.httpMethod === 'DELETE') {
          await provider.removeAccess(event.pathFragments[2]);
          callback(createResponse(200, ''));
          return;
        }
        const access = await provider.getAccess(event.pathFragments[2]);
        if (access) {
          callback(createResponse(200, access));
          return;
        }
      }
    }

    if (event.pathFragments[1] === 'resolve-access' && event.pathFragments.length === 3) {
      const [access] = await provider.getAccesses({ code: decodeURIComponent(event.pathFragments[2]) });
      if (access) {
        callback(createResponse(200, access, { 'x-access-token': await token.serialize(access) }));
        return;
      }
    }
  } catch (e) {
    console.error(e);
    callback(createResponse(e.statusCode || 400, { message: e.message }));
    return;
  }

  callback(createCacheableResponse(404, { message: 'no endpoint like this.' }));
};

export default worker;