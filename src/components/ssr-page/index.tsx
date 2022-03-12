import React, {FC} from "react";
// TODO: window is not defined
// import {StaticRouter} from "react-router-dom/server";
// import App from "../app";

interface SsrPageProps {
  publicUrl: string;
  path: string;
  locale: string;
}

const SsrPage: FC<SsrPageProps> = ({ locale, path, publicUrl }) => (
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
      <link rel="stylesheet" href={`${publicUrl}static/leaflet.css`}/>
      <script defer src={`${publicUrl}static/js/bundle.js`} />
    </head>
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root" />
    </body>
  </html>
);

export default SsrPage;
