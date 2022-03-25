import React, {FC} from "react";
import {Translations} from "../../types";
import SsrPage from "../ssr-page";

interface SsrMainPageProps {
  publicUrl: string;
  path: string;
  locale: string;
  title: string;
  translationMessages: Translations;
  initialMode?: 'dark' | 'light';
}

const SsrMainPage: FC<SsrMainPageProps> = ({ initialMode, locale, path, publicUrl, title, translationMessages }) => (
  <SsrPage
    title={title}
    locale={locale}
    path={path}
    publicUrl={publicUrl}
    translationMessages={translationMessages}
    initialMode={initialMode}
    headers={<>
      <meta property="og:url" content={publicUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      {/*<meta property="og:description" content="" />*/}
      <meta property="og:image" content={`${publicUrl}/static/images/fb_cover.jpg`} />
      <meta property="og:locale" content={locale.replace('-', '_')} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      {/*<meta name="twitter:description" content="" />*/}
      <meta name="twitter:image" content={`${publicUrl}/static/images/fb_cover.jpg`} />
    </>}
  />
);

export default SsrMainPage;
