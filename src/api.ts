import { v4 as uuid } from "uuid";
import {AccessFilters, LocationResource, NeedResource, ResponseEvent, Worker} from "./types";
import * as token from "./utils/token";
import { hasAccess } from "./utils";
import createScheduleGC from "./utils/createScheduleGC";
import createEtag from "./utils/createEtag";
import createKeepAliveCallback from "./utils/createKeepAliveCallback";
import createProvider from "./utils/createProvider";

const keepAliveCallback = createKeepAliveCallback(30 * 60 * 1000);

const scheduleGC = createScheduleGC(30 * 1000);

const provider = createProvider('json');

const getResponseHeaders = (headers: ResponseEvent["headers"] = {}) => ({
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, PUT, GET, DELETE, OPTIONS',
  ...headers,
});

const createResponse = (statusCode: number, data: any, headers: ResponseEvent["headers"] = {}): ResponseEvent => {
  return ({
    statusCode,
    headers: getResponseHeaders(headers),
    body: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    isBase64Encoded: false,
  });
};

const createCacheableResponse = (
  statusCode: number,
  data: any,
  ifModifiedSince: Date,
  lastEtag?: string,
  lastModified?: string,
  headers: ResponseEvent["headers"] = {},
): ResponseEvent => {
  const body = [201, 304].includes(statusCode) ? '' : JSON.stringify(data, null, 2);
  const byteLength = Buffer.byteLength(body, 'utf8');

  let isModified = true;
  const currentEtag = createEtag(body, byteLength);

  if (lastEtag === currentEtag) {
    isModified = false;
  } else if (lastModified) {
    const lastModifiedSince = new Date(lastModified);
    if (ifModifiedSince.toUTCString() === lastModifiedSince.toUTCString()) {
      isModified = false;
    }
  }

  const actualStatusCode = 200 === statusCode && !isModified ? 304 : statusCode;
  const actualBody = actualStatusCode === 304 ? '' : body;

  return createResponse(actualStatusCode, actualBody, {
    ...headers,
    'Cache-Control': 'public, max-age=0',
    'Content-Length': byteLength.toString(),
    'ETag': currentEtag,
    'Last-Modified': ifModifiedSince.toUTCString(),
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
        callback(createCacheableResponse(
          200,
          organisations.result,
          new Date(organisations.modified),
          event.headers['if-none-match'],
          event.headers['if-modified-since']
        ));
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
        callback(createCacheableResponse(
          200,
          organisation.result,
          new Date(organisation.modified),
          event.headers['if-none-match'],
          event.headers['if-modified-since']
        ));
        return;
      }
      callback(createCacheableResponse(
        404,
        { message: 'no endpoint like this.' },
        new Date(),
        event.headers['if-none-match'],
        event.headers['if-modified-since']
      ));
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
        callback(createCacheableResponse(
          200,
          locations.result,
          new Date(locations.modified),
          event.headers['if-none-match'],
          event.headers['if-modified-since']
        ));
        return;
      }
      if (event.pathFragments.length === 3) {
        if (['PUT', 'DELETE'].includes(event.httpMethod)) {
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          const loc = await provider.getLocation(event.pathFragments[2]);
          if (
            !hasAccess({ locationId: event.pathFragments[2] }, tokenAccess)
            && !hasAccess({ organisationId: loc.result.organisationId }, tokenAccess)
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
          callback(createCacheableResponse(
            200,
            location.result,
            new Date(location.modified),
            event.headers['if-none-match'],
            event.headers['if-modified-since']
          ));
          return;
        }
      }
      callback(createCacheableResponse(
        404,
        { message: 'no endpoint like this.' },
        new Date(),
        event.headers['if-none-match'],
        event.headers['if-modified-since']
      ));
      return;
    }

    if (event.pathFragments[1] === 'needs') {
      if (event.pathFragments.length === 2) {
        if (event.httpMethod === 'POST') {
          const content = JSON.parse(event.body) as NeedResource;
          const location = await provider.getLocation(content.locationId);
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          if (
            !hasAccess({ organisationId: location.result.organisationId }, tokenAccess)
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
          search: event.queryStringParameters.search,
          locationId: event.queryStringParameters.locationId,
        }, event.headers['x-target-locale']);

        callback(createCacheableResponse(
          200,
          needs.result,
          new Date(needs.modified),
          event.headers['if-none-match'],
          event.headers['if-modified-since']
        ));
        return;
      }
      if (event.pathFragments.length === 3) {
        if (['PUT', 'DELETE'].includes(event.httpMethod)) {
          const need = await provider.getNeed(event.pathFragments[2]);
          const location = await provider.getLocation(need.result.locationId);
          const tokenAccess = await token.deserialize(event.headers['x-access-token']);
          if (
            !hasAccess({ locationId: need.result.locationId }, tokenAccess)
            && !hasAccess({ organisationId: location.result.organisationId }, tokenAccess)
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
          callback(createCacheableResponse(
            200,
            need.result,
            new Date(need.modified),
            event.headers['if-none-match'],
            event.headers['if-modified-since']
          ));
          return;
        }
      }
      callback(createCacheableResponse(
        404,
        { message: 'no endpoint like this.' },
        new Date(),
        event.headers['if-none-match'],
        event.headers['if-modified-since']
      ));
      return;
    }

    if (event.pathFragments[1] === 'translations') {
      if (event.pathFragments.length === 2) {
        const translations = await provider.getTranslations();
        callback(createCacheableResponse(
          200,
          translations.result,
          new Date(translations.modified),
          event.headers['if-none-match'],
          event.headers['if-modified-since']
        ));
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
        callback(createCacheableResponse(
          200,
          translation.result,
          new Date(translation.modified),
          event.headers['if-none-match'],
          event.headers['if-modified-since']
        ));
        return;
      }

      callback(createCacheableResponse(
        404,
        { message: 'no endpoint like this.' },
        new Date(),
        event.headers['if-none-match'],
        event.headers['if-modified-since']
      ));
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
        callback(createResponse(200, accesses.result));
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
          callback(createResponse(200, access.result));
          return;
        }
      }
    }

    if (event.pathFragments[1] === 'resolve-access' && event.pathFragments.length === 3) {
      const { result: [access] } = await provider.getAccesses({ code: decodeURIComponent(event.pathFragments[2]) });
      if (access) {
        callback(createResponse(200, access, { 'x-access-token': await token.serialize(access) }));
        return;
      }
    }
  } catch (e) {
    console.error(e);
    callback(createResponse(e.statusCode || 400, { message: e.message }));
    return;
  } finally {
    scheduleGC();
  }

  callback(createCacheableResponse(
    404,
    { message: 'no endpoint like this.' },
    new Date(),
    event.headers['if-none-match'],
    event.headers['if-modified-since']
  ));
};

export default worker;