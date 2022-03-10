import React from "react";
import {renderToString} from "react-dom/server";

const Default = (): string => {
  const publicUrl = process.env.PUBLIC_URL;

  return '<!DOCTYPE html>' + renderToString(
    <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="manifest" href={`${publicUrl}manifest.json`}/>
      <title>Help Ukraine</title>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link
        rel="stylesheet"
        href="/static/leaflet.css"
      />
    </head>
    <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"/>
    </body>
    </html>
  );
};

export default Default;