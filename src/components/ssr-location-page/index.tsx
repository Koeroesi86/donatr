import React, {FC} from "react";
import {Location, Organisation} from "../../types";
import SsrPage from "../ssr-page";

interface SsrLocationPagePageProps {
  publicUrl: string;
  path: string;
  locale: string;
  title: string;
  organisation: Organisation;
  location: Location;
}

const SsrLocationPage: FC<SsrLocationPagePageProps> = ({ locale, location, organisation, path, publicUrl, title }) => (
  <SsrPage title={`${organisation.name} | ${location.name} | ${title}`} locale={locale} path={path} publicUrl={publicUrl} />
);

export default SsrLocationPage;
