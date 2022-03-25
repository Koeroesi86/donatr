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
  />
);

export default SsrOrganisationPage;
