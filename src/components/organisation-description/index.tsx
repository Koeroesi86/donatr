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
    skipHtml
    unwrapDisallowed
    remarkPlugins={[RemarkBreaks, RemarkGfm]}
    components={{
      a: (p) =>
        <Link target="_blank" href={p.href}>{p.children}</Link>,
    }}
  >
    {description}
  </ReactMarkdown>
);

export default OrganisationDescription;
