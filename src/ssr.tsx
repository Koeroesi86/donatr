import React from "react";
import {renderToString} from "react-dom/server";
import cookie from "cookie";
import acceptLanguage from "accept-language";
// @ts-ignore
import {sitemapBuilder} from "react-router-sitemap";
import {Worker} from "./types";
import SsrPage from "./components/ssr-page";
import createApiClient from "./utils/createApiClient";
import SsrOrganisationPage from "./components/ssr-organisation-page";
import SsrLocationPage from "./components/ssr-location-page";
import createKeepAliveCallback from "./utils/createKeepAliveCallback";
import createScheduleGC from "./utils/createScheduleGC";
import ensureMode from "./utils/ensureMode";
import routes from "./utils/routes";
import SsrMainPage from "./components/ssr-main-page";

const keepAliveCallback = createKeepAliveCallback(10 * 60 * 1000);

const scheduleGC = createScheduleGC(30 * 1000);

const publicUrl: string = process.env.PUBLIC_URL || '/';

const apiClient = createApiClient(publicUrl);

const definedRoutes = routes.filter(route => route.path && route.path !== '*').map(route => route.path);

const worker: Worker = async (event, callback): Promise<void> => {
  keepAliveCallback();

  try {
    const cookies = cookie.parse(event.headers.cookie || '');
    const locales = await apiClient.all<'translations'>('translations');
    const localeIds = locales.map((l) => l.id);
    acceptLanguage.languages(localeIds);

    const detectedLanguage = cookies.language && localeIds.includes(cookies.language)
      ? cookies.language
      : acceptLanguage.get(event.headers['accept-language']);
    const translation = locales.find((t) => t.id === detectedLanguage);
    let pageTitle = translation.translations['site.name'] || '';
    let locale = translation.id;

    if (event.path === '/manifest.json') {
      callback({
        statusCode: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          $schema: 'https://json.schemastore.org/web-manifest-combined.json',
          short_name: pageTitle,
          name: pageTitle,
          start_url: '/',
          display: 'standalone',
          background_color: "#fff",
        }, null, 2),
      });
      return;
    }

    if (event.path === '/sitemap.xml') {
      const sitemap = sitemapBuilder(
        publicUrl,
        routes
          .filter((r) => r.path !== '*' && r.path !== '/edit')
          .map((r) => r.path)
      );
      callback({
        statusCode: 200,
        headers: {
          'content-type': 'application/xml; charset=utf-8'
        },
        body: sitemap.toString(),
      });
      return;
    }

    if (event.pathFragments.length === 0) {
      callback({
        statusCode: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        },
        body: '<!DOCTYPE html>' + renderToString(
          <SsrMainPage
            publicUrl={publicUrl}
            path={event.path}
            locale={locale}
            title={pageTitle}
            translationMessages={translation.translations}
            initialMode={ensureMode(cookies.mode)}
          />
        ),
      });
      return;
    }

    if (event.pathFragments[0] === 'organisations') {
      if (event.pathFragments.length === 1) {
        callback({
          statusCode: 200,
          headers: {
            'content-type': 'text/html; charset=utf-8'
          },
          body: '<!DOCTYPE html>' + renderToString(
            <SsrPage
              publicUrl={publicUrl}
              path={event.path}
              locale={locale}
              title={pageTitle}
              translationMessages={translation.translations}
              initialMode={ensureMode(cookies.mode)}
            />
          ),
        });
        return;
      }
      if (event.pathFragments.length === 2) {
        const organisation = await apiClient.one<'organisations'>('organisations', event.pathFragments[1]);
        if (organisation) {
          callback({
            statusCode: 200,
            headers: {
              'content-type': 'text/html; charset=utf-8'
            },
            body: '<!DOCTYPE html>' + renderToString(
              <SsrOrganisationPage
                publicUrl={publicUrl}
                path={event.path}
                locale={locale}
                title={pageTitle}
                organisation={organisation}
                translationMessages={translation.translations}
              />
            ),
          });
          return;
        }
      }
    }

    if (event.pathFragments[0] === 'locations') {
      if (event.pathFragments.length === 1) {
        callback({
          statusCode: 200,
          headers: {
            'content-type': 'text/html; charset=utf-8'
          },
          body: '<!DOCTYPE html>' + renderToString(
            <SsrPage
              publicUrl={publicUrl}
              path={event.path}
              locale={locale}
              title={pageTitle}
              translationMessages={translation.translations}
              initialMode={ensureMode(cookies.mode)}
            />
          ),
        });
        return;
      }

      if (event.pathFragments.length === 2) {
        const location = await apiClient.one<'locations'>('locations', event.pathFragments[1]);
        if (location) {
          const organisation = await apiClient.one<'organisations'>('organisations', location.organisationId);
          callback({
            statusCode: 200,
            headers: {
              'content-type': 'text/html; charset=utf-8'
            },
            body: '<!DOCTYPE html>' + renderToString(
              <SsrLocationPage
                publicUrl={publicUrl}
                path={event.path}
                locale={locale}
                title={pageTitle}
                organisation={organisation}
                location={location}
                translationMessages={translation.translations}
              />
            ),
          });
          return;
        }
      }
    }

    if (event.pathFragments[0] === 'needs') {
      callback({
        statusCode: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        },
        body: '<!DOCTYPE html>' + renderToString(
          <SsrPage
            publicUrl={publicUrl}
            path={event.path}
            locale={locale}
            title={pageTitle}
            translationMessages={translation.translations}
            initialMode={ensureMode(cookies.mode)}
          />
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
          <SsrPage
            publicUrl={publicUrl}
            path={event.path}
            locale={locale}
            title={pageTitle}
            translationMessages={translation.translations}
            initialMode={ensureMode(cookies.mode)}
          />
        ),
      });
      return;
    }

    callback({
      statusCode: definedRoutes.includes(event.path) ? 200 : 404,
      headers: {
        'content-type': 'text/html; charset=utf-8'
      },
      body: '<!DOCTYPE html>' + renderToString(
        <SsrPage
          publicUrl={publicUrl}
          path={event.path}
          locale={locale}
          title={pageTitle}
          translationMessages={translation.translations}
          initialMode={ensureMode(cookies.mode)}
        />
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
        <SsrPage
          publicUrl={publicUrl}
          path={event.path}
          locale={'en'}
          title={''}
          translationMessages={{}}
          initialMode={ensureMode()}
        />
      ),
    });
  } finally {
    scheduleGC();
  }
};

export default worker;
