import React, {FC, useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Box, CircularProgress, Tab, Tabs} from "@mui/material";
import {useIntl} from "react-intl";
import {Access} from "../../types";
import EditOrganisations from "../edit-organisations";
import EditOrganisation from "../edit-organisation";
import EditLocation from "../edit-location";
import EditAccesses from "../edit-accesses";
import EditTranslations from "../edit-translations";
import useApiClient from "../../hooks/useApiClient";
import useResolveAccess from "../../hooks/useResolveAccess";

interface TabPanelProps {
  current?: string;
  value: string;
}

const TabPanel: FC<TabPanelProps> = ({ value, current, children }) => {
  if (value !== current) return null;
  return (
    <Box sx={{ p: 2 }}>
      {children}
    </Box>
  );
}

const EditRouteProtected: FC = () => {
  const {code} = useParams();
  const intl = useIntl();
  const apiClient = useApiClient<'access'>('access');
  const resolveAccess = useResolveAccess();
  const [access, setAccess] = useState<Access>();
  const navigate = useNavigate();
  const tabs = useMemo(() => {
    if (!access) return [];

    return [
      ("all" in access && access.all && {
        label: intl.formatMessage({ id: 'page.edit.organisations.title' }),
        key: 'edit-all-organisations',
      }),
      ("organisationIds" in access && access.organisationIds.length && {
        label: intl.formatMessage({ id: 'page.edit.organisations.title' }),
        key: 'edit-organisations',
      }),
      ("locationIds" in access && access.locationIds && access.locationIds.length && {
        label: intl.formatMessage({ id: 'page.edit.locations.title' }),
        key: 'edit-locations',
      }),
      ("all" in access && access.all && {
        label: intl.formatMessage({ id: 'page.edit.accesses.title' }),
        key: 'edit-accesses',
      }),
      (access.translations && {
        label: intl.formatMessage({ id: 'edit.translations.title' }),
        key: 'edit-translations',
      }),
    ].filter(Boolean);
  }, [access, intl]);
  const [selectedTab, setSelectedTab] = useState<string>();
  
  useEffect(() => {
    resolveAccess(code)
      .then(setAccess)
      .catch(() => navigate('/edit'));
  }, [apiClient, code, navigate, resolveAccess]);

  useEffect(() => {
    if (tabs.length > 0) setSelectedTab(tabs[0].key);
  }, [tabs]);
  
  if (!access) {
    return <CircularProgress />;
  }

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={(e, t) => setSelectedTab(t)} aria-label="tabs">
          {tabs.map((tab) => (
            <Tab label={tab.label} value={tab.key} key={`tab-control-${tab.key}`} />
          ))}
        </Tabs>
      </Box>
      <TabPanel value="edit-all-organisations" current={selectedTab}>
        <EditOrganisations />
      </TabPanel>
      <TabPanel value="edit-organisations" current={selectedTab}>
        {"organisationIds" in access && access.organisationIds.map((id) => (
          <EditOrganisation key={`edit-organisaion-${id}`} id={id} />
        ))}
      </TabPanel>
      <TabPanel value="edit-locations" current={selectedTab}>
        {"locationIds" in access && access.locationIds.map((id) => (
          <EditLocation key={`edit-location-${id}`} id={id} />
        ))}
      </TabPanel>
      <TabPanel value="edit-accesses" current={selectedTab}>
        <EditAccesses currentCode={code} />
      </TabPanel>
      <TabPanel value="edit-translations" current={selectedTab}>
        <EditTranslations />
      </TabPanel>
    </>
  );
};

export default EditRouteProtected;
