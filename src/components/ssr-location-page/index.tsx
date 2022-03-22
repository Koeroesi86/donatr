import React, {FC} from "react";
import {Location, Organisation} from "../../types";
// TODO: window is not defined
// import {StaticRouter} from "react-router-dom/server";
// import App from "../app";

interface SsrLocationPagePageProps {
  publicUrl: string;
  path: string;
  locale: string;
  title: string;
  organisation: Organisation;
  location: Location;
}

const SsrLocationPage: FC<SsrLocationPagePageProps> = ({ location, organisation, path, publicUrl, title }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="manifest" href={`${publicUrl}manifest.json`}/>
      <title>{`${organisation.name} | ${location.name} | ${title}`}</title>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link rel="stylesheet" href={`${publicUrl}static/leaflet.css`}/>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-207L6CE7EN" />
      <script dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-207L6CE7EN');
      `}} />
      <script defer src={`${publicUrl}static/js/bundle.js`} />
    </head>
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root" />
    </body>
  </html>
);

export default SsrLocationPage;
