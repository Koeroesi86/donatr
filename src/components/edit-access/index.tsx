import React, {FC, Fragment} from "react";
import {Access, Organisation, OrganisationsAccess} from "../../types";
import {Box, Card, CardContent, Checkbox, FormControlLabel, TextField} from "@mui/material";
import {useIntl} from "react-intl";

interface EditAccessProps {
  access: Access;
  organisations: Organisation[];
  onChange: (access: Access) => void | Promise<void>;
}

const EditAccess: FC<EditAccessProps> = ({ access, onChange, organisations }) => {
  const intl = useIntl();
  return (
    <>
      <TextField
        label={intl.formatMessage({ id: 'input.access.code' })}
        variant="standard"
        defaultValue={access.code}
        fullWidth
        onChange={(e) => onChange({
          ...access,
          code: e.target.value,
        })}
      />
      <FormControlLabel
        label={intl.formatMessage({ id: 'input.access.all.checkbox' })}
        control={
          <Checkbox
            defaultChecked={"all" in access ? access.all : false}
            onChange={(e) => {
              if (e.target.checked) {
                onChange({
                  id: access.id,
                  code: access.code,
                  translations: access.translations,
                  all: true,
                });
              }
            }}
          />
        }
      />
      <FormControlLabel
        label={intl.formatMessage({ id: 'input.access.translations.checkbox' })}
        control={
          <Checkbox
            defaultChecked={access.translations}
            onChange={(e) => onChange({
              ...access,
              translations: e.target.checked,
            })}
          />
        }
      />
      <Card>
        <CardContent>
          {organisations.map((organisation) => (
            <FormControlLabel
              key={`access-organisation-${access.id}-${organisation.id}`}
              label={organisation.name}
              control={
                <Checkbox
                  defaultChecked={"organisationIds" in access && access.organisationIds.includes(organisation.id)}
                  onChange={(e) => {
                    const a: OrganisationsAccess = {
                      id: access.id,
                      code: access.code,
                      translations: access.translations,
                      organisationIds: "organisationIds" in access ? access.organisationIds : []
                    };
                    if (e.target.checked) {
                      a.organisationIds.push(organisation.id);
                    } else {
                      a.organisationIds.splice(a.organisationIds.indexOf(organisation.id), 1);
                    }
                    onChange(a);
                  }}
                />
              }
            />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          {organisations.map((o) => (
            <Fragment key={`access-location-${access.id}-${o.id}`}>
              {o.locations.map((loc) => (
                <FormControlLabel
                  key={`access-location-${access.id}-${o.id}-${loc.id}`}
                  label={<>{loc.name}<br /><small>{o.name}</small></>}
                  control={
                    <Checkbox
                      defaultChecked={"locationIds" in access && access.locationIds.includes(loc.id)}
                      onChange={(e) => {
                        const a: OrganisationsAccess = {
                          id: access.id,
                          code: access.code,
                          translations: access.translations,
                          organisationIds: "locationIds" in access ? access.locationIds : []
                        };
                        if (e.target.checked) {
                          a.organisationIds.push(loc.id);
                        } else {
                          a.organisationIds.splice(a.organisationIds.indexOf(loc.id), 1);
                        }
                        onChange(a);
                      }}
                    />
                  }
                />
              ))}
            </Fragment>
          ))}
        </CardContent>
      </Card>
    </>
  )
};

export default EditAccess;
