import React, {FC} from "react";
import {Organisation} from "../../types";
import SsrPage from "../ssr-page";

interface SsrOrganisationPageProps {
  publicUrl: string;
  path: string;
  locale: string;
  title: string;
  organisation: Organisation;
}

const SsrOrganisationPage: FC<SsrOrganisationPageProps> = ({ locale, organisation, path, publicUrl, title }) => (
  <SsrPage title={`${organisation.name} | ${title}`} locale={locale} path={path} publicUrl={publicUrl} />
);

export default SsrOrganisationPage;
