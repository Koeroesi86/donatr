import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import {JsonProvider} from "./providers";
import {Provider, ResponseEvent, Worker} from "./types";
import debounce from "lodash.debounce";

const keepAliveTimeout = 30 * 1000;
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

const createResponse = (statusCode: number, data: any, headers: ResponseEvent["headers"] = {}): ResponseEvent => ({
  statusCode,
  headers: getResponseHeaders(headers),
  body: JSON.stringify(data, null, 2),
  isBase64Encoded: false,
})

const worker: Worker = async (event, callback) => {
  keepAliveCallback();

  try {
    if (event.pathFragments[1] === 'organisations') {
      if (event.pathFragments.length === 2) {
        if (event.httpMethod === 'POST') {
          await provider.setOrganisation({
            ...JSON.parse(event.body),
            id: uuid(),
          });
        }
        const organisations = await provider.getOrganisations();
        callback(createResponse(200, organisations));
        return;
      }
      if (event.pathFragments.length === 3) {
        if (event.httpMethod === 'PUT') {
          await provider.setOrganisation(JSON.parse(event.body));
        }
        if (event.httpMethod === 'DELETE') {
          await provider.removeOrganisation(event.pathFragments[2])
          callback(createResponse(200, ''));
          return;
        }
        const organisation = await provider.getOrganisation(event.pathFragments[2]);
        callback(createResponse(200, organisation));
        return;
      }
      callback(createResponse(404, { message: 'no endpoint like this.' }));
      return;
    }

    if (event.pathFragments[1] === 'locations') {
      if (event.pathFragments.length === 2) {
        if (event.httpMethod === 'POST') {
          await provider.setLocation({
            ...JSON.parse(event.body),
            id: uuid(),
          });
        }
        const locations = await provider.getLocations({
          organisationId: event.queryStringParameters.organisationId,
        });
        callback(createResponse(200, locations));
        return;
      }
      if (event.pathFragments.length === 3) {
        if (event.httpMethod === 'PUT') {
          await provider.setLocation(JSON.parse(event.body));
        }
        if (event.httpMethod === 'DELETE') {
          await provider.removeLocation(event.pathFragments[2]);
          callback(createResponse(200, ''));
          return;
        }
        const location = await provider.getLocation(event.pathFragments[2]);
        callback(createResponse(200, location));
        return;
      }
      callback(createResponse(404, { message: 'no endpoint like this.' }));
      return;
    }

    if (event.pathFragments[1] === 'needs') {
      if (event.pathFragments.length === 2) {
        if (event.httpMethod === 'POST') {
          await provider.setNeed({
            ...JSON.parse(event.body),
            id: uuid(),
          })
        }
        const needs = await provider.getNeeds({
          search: event.queryStringParameters.s,
          locationId: event.queryStringParameters.locationId,
        });
        callback(createResponse(200, needs));
        return;
      }
      if (event.pathFragments.length === 3) {
        if (event.httpMethod === 'PUT') {
          await provider.setNeed(JSON.parse(event.body));
        }
        if (event.httpMethod === 'DELETE') {
          await provider.removeNeed(event.pathFragments[2]);
          callback(createResponse(200, ''));
          return;
        }
        const need = await provider.getNeed(event.pathFragments[2]);
        callback(createResponse(200, need));
        return;
      }
      callback(createResponse(404, { message: 'no endpoint like this.' }));
      return;
    }

    if (event.pathFragments[1] === 'translations') {
      if (!event.pathFragments[2]) throw new Error('No language specified.')

      if (event.pathFragments.length === 3) {
        const translations = await provider.getTranslations(event.pathFragments[2].replace('-', '_'));
        callback(createResponse(200, translations));
        return;
      }
      callback(createResponse(404, { message: 'no endpoint like this.' }));
      return;
    }

    if (event.pathFragments[1] === 'access') {
      if (event.pathFragments.length === 2) {
        const accesses = await provider.getAccesses();
        callback(createResponse(200, accesses));
        return;
      }

      if (event.pathFragments.length === 3) {
        if (event.httpMethod === 'PUT') {
          await provider.setAccess(JSON.parse(event.body));
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
  } catch (e) {
    console.error(e);
    callback(createResponse(e.statusCode || 400, { message: e.message }));
    return;
  }

  callback(createResponse(404, { message: 'no endpoint like this.' }));
};

export default worker;