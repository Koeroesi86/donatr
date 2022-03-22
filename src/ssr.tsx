import React from "react";
import debounce from "lodash.debounce";
import {renderToString} from "react-dom/server";
import cookie from "cookie";
import acceptLanguage from "accept-language";
import {Worker} from "./types";
import SsrPage from "./components/ssr-page";
import createApiClient from "./utils/createApiClient";

const keepAliveTimeout = 10 * 60 * 1000;
const keepAliveCallback = debounce(() => {
  console.log('Shutting down SSR due to inactivity.');
  process.exit(0);
}, keepAliveTimeout);

const publicUrl: string = process.env.PUBLIC_URL || '/';

const apiClient = createApiClient(publicUrl);

const worker: Worker = async (event, callback): Promise<void> => {
  keepAliveCallback();

  try {
    const cookies = cookie.parse(event.headers.cookie || '');
    const locales = await apiClient.all<'translations'>('translations');
    const localeIds = locales.map((l) => l.id);
    acceptLanguage.languages(localeIds);

    const detectedLanguage = cookies.locale && localeIds.includes(cookies.locale)
      ? cookies.locale
      : acceptLanguage.get(event.headers['accept-language']);
    const translation = locales.find((t) => t.id === detectedLanguage);
    let pageTitle = translation.translations['site.name'] || '';
    let locale = translation.id;

    if (event.pathFragments.length === 0) {
      callback({
        statusCode: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        },
        body: '<!DOCTYPE html>' + renderToString(
          <SsrPage publicUrl={publicUrl} path={event.path} locale={locale} title={pageTitle} />
        ),
      });
      return;
    }

    if (event.pathFragments[0] === 'organisations') {
      callback({
        statusCode: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        },
        body: '<!DOCTYPE html>' + renderToString(
          <SsrPage publicUrl={publicUrl} path={event.path} locale={locale} title={pageTitle} />
        ),
      });
      return;
    }

    if (event.pathFragments[0] === 'locations') {
      callback({
        statusCode: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        },
        body: '<!DOCTYPE html>' + renderToString(
          <SsrPage publicUrl={publicUrl} path={event.path} locale={locale} title={pageTitle} />
        ),
      });
      return;
    }

    if (event.pathFragments[0] === 'needs') {
      callback({
        statusCode: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        },
        body: '<!DOCTYPE html>' + renderToString(
          <SsrPage publicUrl={publicUrl} path={event.path} locale={locale} title={pageTitle} />
        ),
      });
      return;
    }

    if (event.pathFragments[0] === 'edit') {
      callback({
        statusCode: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        },
        body: '<!DOCTYPE html>' + renderToString(
          <SsrPage publicUrl={publicUrl} path={event.path} locale={locale} title={pageTitle} />
        ),
      });
      return;
    }

    callback({
      statusCode: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8'
      },
      body: '<!DOCTYPE html>' + renderToString(
        <SsrPage publicUrl={publicUrl} path={event.path} locale={locale} title={pageTitle} />
      ),
    });
  } catch (e) {
    console.error(e.message);
    callback({
      statusCode: 400,
      headers: {
        'content-type': 'text/html; charset=utf-8'
      },
      body: '<!DOCTYPE html>' + renderToString(
        <SsrPage publicUrl={publicUrl} path={event.path} locale={'en'} title={''} />
      ),
    });
  }
};

export default worker;
