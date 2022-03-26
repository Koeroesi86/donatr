import React, {FC, ReactNode} from "react";
import {StaticRouter} from "react-router-dom/server";
import {renderToString} from "react-dom/server";
import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import createCache from "@emotion/cache";
import App from "../app";
import {Translations} from "../../types";

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
        <App initialLocale={locale} initialTranslations={translationMessages} initialMode={initialMode} />
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
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-207L6CE7EN"/>
      <script dangerouslySetInnerHTML={{
        __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
      
              gtag('config', 'G-207L6CE7EN');
              
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
