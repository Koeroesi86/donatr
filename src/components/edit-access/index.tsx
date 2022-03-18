import React, {FC} from "react";
import {Access, OrganisationResource} from "../../types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditAccessForm from "../edit-access-form";

interface EditAccessProps {
  access: Access;
  organisations: OrganisationResource[];
  onChange: (access: Access) => void | Promise<void>;
}

const EditAccess: FC<EditAccessProps> = ({ access, onChange, organisations }) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {access.code}
      </AccordionSummary>
      <AccordionDetails>
        <EditAccessForm
          access={access}
          organisations={organisations}
          onChange={onChange}
        />
      </AccordionDetails>
    </Accordion>
  )
};

export default EditAccess;
