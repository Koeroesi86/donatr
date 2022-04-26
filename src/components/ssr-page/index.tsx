import React, {FC, ReactNode} from "react";
import {StaticRouter} from "react-router-dom/server";
import {renderToString} from "react-dom/server";
import {CacheProvider} from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import createCache from "@emotion/cache";
import {Provider} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";
import App from "../app";
import {Translations} from "../../types";
import createInitialState from "../../redux/createInitialState";

interface SsrPageProps {
  publicUrl: string;
  path: string;
  locale: string;
  title: string;
  headers?: ReactNode;
  translationMessages: Translations;
  initialMode?: 'dark' | 'light';
}

const SsrPage: FC<SsrPageProps> = ({ headers, initialMode, locale, path, publicUrl, title, translationMessages }) => {
  const cache = createCache({ key: 'css' });
  const { extractCriticalToChunks } = createEmotionServer(cache);
  const content = renderToString(
    <CacheProvider value={cache}>
      <StaticRouter location={path}>
        <Provider
          store={configureStore({
            preloadedState: createInitialState({
              locations: {},
              organisations: {},
              needs: {},
              translations: {},
              accesses: {},
            }),
            reducer: {
              locations: s => s || {},
              organisations: s => s || {},
              needs: s => s || {},
              translations: s => s || {},
              accesses: s => s || {},
            },
          })}
        >
          <App initialLocale={locale} initialTranslations={translationMessages} initialMode={initialMode} />
        </Provider>
      </StaticRouter>
    </CacheProvider>
  );
  const emotionChunks = extractCriticalToChunks(content);
  return (
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
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-2X3EB64WTX"/>
      <script dangerouslySetInnerHTML={{
        __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2X3EB64WTX');
              
              window.initialTranslations = ${JSON.stringify(translationMessages)}
            `
      }}/>
      <script defer src={`${publicUrl}static/bundle.js`}/>
      {headers}
      <style
        id="server-css"
        dangerouslySetInnerHTML={{
          __html: emotionChunks.styles.map((s) => s.css).join(' ')
        }}
      />
    </head>
    <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root" dangerouslySetInnerHTML={{ __html: content }}/>
    </body>
    </html>
  );
};

export default SsrPage;
