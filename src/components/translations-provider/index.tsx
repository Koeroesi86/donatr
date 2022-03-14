import React, {createContext, FC, useEffect, useState} from "react";
import {TranslationsResource} from "../../types";
import {CircularProgress} from "@mui/material";
import useApiClient from "../../hooks/useApiClient";

export const TranslationsContext = createContext<TranslationsResource[]>([]);

interface TranslationsProviderProps {}

const TranslationsProvider: FC<TranslationsProviderProps> = ({ children }) => {
  const api = useApiClient<'translations'>('translations');
  const [translations, setTranslations] = useState<TranslationsResource[]>([]);
  
  useEffect(() => {
    api.all().then((t) => {
      setTranslations(t);
      console.log('translations', t)
    });
  }, [api]);
  
  // if (translations.length === 0) {
  //   return <CircularProgress />;
  // }
  return (
    <TranslationsContext.Provider value={translations}>
      {children}
    </TranslationsContext.Provider>
  )
}

export default TranslationsProvider;
