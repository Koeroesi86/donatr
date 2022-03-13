import React, {FC, useCallback, useEffect, useState} from "react";
import {TranslationsResource} from "../../types";
import {ApiClient} from "../../utils";
import {Accordion, AccordionDetails, AccordionSummary, TextField} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {FormattedMessage} from "react-intl";
import CountryFlag from "../country-flag";
import debounce from "lodash.debounce";
import CreateTranslationForm from "../create-translation-form";

const api = new ApiClient<TranslationsResource>('translations');

interface DebouncedTextFieldProps {
  onChange: (value: string) => void | Promise<void>;
  defaultValue: string;
  label: string;
  helperText: string;
}

const DebouncedTextField: FC<DebouncedTextFieldProps> = ({ defaultValue, helperText, label, onChange }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(debounce(onChange, 500), [onChange]);

  return (
    <TextField
      label={label}
      defaultValue={defaultValue}
      helperText={helperText}
      fullWidth
      sx={{ my: 2 }}
      onChange={(e) => debouncedOnChange(e.target.value)}
    />
  );
}

const EditTranslations: FC = () => {
  const [fallback, setFallback] = useState<TranslationsResource>();
  const [translations, setTranslations] = useState<TranslationsResource[]>([]);
  const refresh = useCallback(() => {
    api.all().then(setTranslations)
  }, []);

  useEffect(() => {
    api.one('en').then(setFallback);
    refresh();
  }, [refresh]);

  if (!fallback) {
    return null;
  }

  return (
    <>
      {translations.map((translation) => (
        <Accordion key={`edit-translation-${translation.id}`}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <CountryFlag code={translation.id.split('-').pop().toLowerCase()} width="30" />
          </AccordionSummary>
          <AccordionDetails>
            {Object.keys(fallback.translations).sort().map((key) => (
              <DebouncedTextField
                key={`edit-translation-${translation.id}-input-${key}`}
                label={key}
                defaultValue={translation.translations[key]}
                helperText={fallback.translations[key]}
                onChange={(text) => {
                  api.update({
                    id: translation.id,
                    translations: {
                      ...translation.translations,
                      [key]: text,
                    }
                  }).then(() => refresh());
                }}
              />
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <FormattedMessage id="edit.translations.new.title" />
        </AccordionSummary>
        <AccordionDetails>
          <CreateTranslationForm
            fallback={fallback.translations}
            existingIds={translations.map(t => t.id)}
            onSubmit={(t) => {
              api.update(t).then(() => refresh()).catch(console.error)
            }}
          />
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default EditTranslations;
