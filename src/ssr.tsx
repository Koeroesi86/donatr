import React from "react";
import debounce from "lodash.debounce";
import {renderToString} from "react-dom/server";
import {Worker} from "./types";
import SsrPage from "./components/ssr-page";

const keepAliveTimeout = 10 * 60 * 1000;
const keepAliveCallback = debounce(() => {
  console.log('Shutting down SSR due to inactivity.');
  process.exit(0);
}, keepAliveTimeout);

// TODO
console.log('process.env.PUBLIC_URL', process.env.PUBLIC_URL);
const publicUrl: string = process.env.PUBLIC_URL || '/';

const worker: Worker = async (event, callback) => {
  keepAliveCallback();

  callback({
    statusCode: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8'
    },
    body: '<!DOCTYPE html>' + renderToString(
      <SsrPage publicUrl={publicUrl} path={event.path} locale={'en'} />
    ),
  });
};

export default worker;
