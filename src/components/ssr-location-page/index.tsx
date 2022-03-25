import React, {FC} from "react";
import {Location, Organisation, Translations} from "../../types";
import SsrPage from "../ssr-page";

interface SsrLocationPagePageProps {
  publicUrl: string;
  path: string;
  locale: string;
  title: string;
  organisation: Organisation;
  location: Location;
  translationMessages: Translations;
  initialMode?: 'dark' | 'light';
}

const SsrLocationPage: FC<SsrLocationPagePageProps> = ({
  locale,
  location,
  organisation,
  path,
  publicUrl,
  title,
  translationMessages,
  initialMode,
}) => (
  <SsrPage
    title={`${organisation.name} | ${location.name} | ${title}`}
    locale={locale}
    path={path}
    publicUrl={publicUrl} translationMessages={translationMessages}
    initialMode={initialMode}
  />
);

export default SsrLocationPage;
