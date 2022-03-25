import React, {FC} from "react";
import {Organisation, Translations} from "../../types";
import SsrPage from "../ssr-page";

interface SsrOrganisationPageProps {
  publicUrl: string;
  path: string;
  locale: string;
  title: string;
  organisation: Organisation;
  translationMessages: Translations;
  initialMode?: 'dark' | 'light';
}

const SsrOrganisationPage: FC<SsrOrganisationPageProps> = ({
  locale,
  organisation,
  path,
  publicUrl,
  title,
  translationMessages,
  initialMode,
}) => (
  <SsrPage
    title={`${organisation.name} | ${title}`}
    locale={locale}
    path={path}
    publicUrl={publicUrl}
    translationMessages={translationMessages}
    initialMode={initialMode}
    headers={<>
      <meta property="og:url" content={`${publicUrl}/organisations/${organisation.id}`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${organisation.name} | ${title}`} />
      {/*<meta property="og:description" content="" />*/}
      <meta property="og:image" content={`${publicUrl}/static/images/fb_cover.jpg`} />
      <meta property="og:locale" content={locale.replace('-', '_')} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={`${organisation.name} | ${title}`} />
      {/*<meta name="twitter:description" content="" />*/}
      <meta name="twitter:image" content={`${publicUrl}/static/images/fb_cover.jpg`} />
    </>}
  />
);

export default SsrOrganisationPage;
