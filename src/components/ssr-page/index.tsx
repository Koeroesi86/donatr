import React, {FC, ReactNode} from "react";
// TODO: window is not defined (leaflet)
// import {StaticRouter} from "react-router-dom/server";
// import App from "../app";

interface SsrPageProps {
  publicUrl: string;
  path: string;
  locale: string;
  title: string;
  headers?: ReactNode;
}

const SsrPage: FC<SsrPageProps> = ({ headers, locale, path, publicUrl, title }) => (
  <html lang={locale.split('-')[0]}>
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="manifest" href={`${publicUrl}manifest.json`}/>
      <title>{title}</title>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link rel="stylesheet" href={`${publicUrl}static/leaflet.css`}/>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-207L6CE7EN"/>
      <script dangerouslySetInnerHTML={{
        __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
    
            gtag('config', 'G-207L6CE7EN');
          `
      }}/>
      <script defer src={`${publicUrl}bundle.js`}/>
      {headers}
    </head>
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root"/>
    </body>
  </html>
);

export default SsrPage;
