import React from "react";
import debounce from "lodash.debounce";
import {renderToString} from "react-dom/server";
import cookie from "cookie";
import {Worker} from "./types";
import SsrPage from "./components/ssr-page";

const keepAliveTimeout = 10 * 60 * 1000;
const keepAliveCallback = debounce(() => {
  console.log('Shutting down SSR due to inactivity.');
  process.exit(0);
}, keepAliveTimeout);

const publicUrl: string = process.env.PUBLIC_URL || '/';

const worker: Worker = async (event, callback): Promise<void> => {
  keepAliveCallback();

  const cookies = cookie.parse(event.headers.cookie || '');
  let pageTitle = 'Help Ukraine';
  let locale = 'en';

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
};

export default worker;
