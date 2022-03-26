import RemarkBreaks from "remark-breaks";
import RemarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import React, {FC} from "react";
import {Link} from "@mui/material";

interface OrganisationDescriptionProps {
  description: string;
}

const OrganisationDescription: FC<OrganisationDescriptionProps> = ({ description }) => (
  <ReactMarkdown
    linkTarget="_blank"
    skipHtml
    unwrapDisallowed
    children={description}
    remarkPlugins={[RemarkBreaks, RemarkGfm]}
    components={{
      link: (p) =>
        <Link target="_blank" href={p.href}>{p.children}</Link>,
      a: (p) =>
        <Link target="_blank" href={p.href}>{p.children}</Link>,
    }}
  />
);

export default OrganisationDescription;
