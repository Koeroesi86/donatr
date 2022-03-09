import React, {FC} from "react";
import {Access, Organisation} from "../../types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import {useIntl} from "react-intl";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditAccessForm from "../edit-access-form";

interface EditAccessProps {
  access: Access;
  organisations: Organisation[];
  onChange: (access: Access) => void | Promise<void>;
}

const EditAccess: FC<EditAccessProps> = ({ access, onChange, organisations }) => {
  const intl = useIntl();
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
