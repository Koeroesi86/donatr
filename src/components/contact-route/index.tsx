import React, {FC} from "react";
import {useIntl} from "react-intl";
import {styled} from "@mui/styles";
import {Container} from "@mui/material";

const Iframe = styled('iframe')({
  display: 'block',
  margin: '0 auto',
  maxWidth: '100%',
  width: 640,
  minHeight: 1200,
  border: 0,
  opacity: '1 !important',
});

const ContactRoute: FC = () => {
  const intl = useIntl();
  return (
    <Container maxWidth="lg">
      <Iframe src={intl.formatMessage({ id: 'page.contact.iframe' })} style={{ opacity: 0 }}>
        Loading…
      </Iframe>
    </Container>
  );
};

export default ContactRoute;
