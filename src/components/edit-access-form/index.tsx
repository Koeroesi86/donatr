import React, {FC} from "react";
import {Box, Card, CardContent, Checkbox, FormControlLabel, TextField} from "@mui/material";
import {Access, Organisation, OrganisationsAccess} from "../../types";
import {useIntl} from "react-intl";

interface EditAccessFormProps {
  access: Access;
  organisations: Organisation[];
  onChange: (access: Access) => void | Promise<void>;
}

const EditAccessForm: FC<EditAccessFormProps> = ({ access, onChange, organisations }) => {
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
            <Box key={`access-organisation-${access.id}-${organisation.id}`}>
              <FormControlLabel
                label={organisation.name}
                control={
                  <Checkbox
                    checked={"organisationIds" in access && access.organisationIds.includes(organisation.id)}
                    // indeterminate={"locationIds" in access}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
                {organisation.locations.map((loc) => (
                  <FormControlLabel
                    key={`access-location-${access.id}-${organisation.id}-${loc.id}`}
                    label={loc.name}
                    control={
                      <Checkbox
                        checked={"locationIds" in access && access.locationIds.includes(loc.id)}
                        indeterminate={"organisationIds" in access && access.organisationIds.includes(loc.organisationId)}
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
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

export default EditAccessForm;
