import React, {createContext, FC, useCallback, useState} from "react";

interface ApiTokenProviderContext {
  setToken: (token: string) => void;
  getToken: () => string;
}

export const ApiTokenContext = createContext<ApiTokenProviderContext>({
  setToken: () => {},
  getToken: () => '',
});

interface ApiTokenProviderProps {
  initialToken?: string;
}

const ApiTokenProvider: FC<ApiTokenProviderProps> = ({ children, initialToken = '' }) => {
  const [token, setToken] = useState(initialToken);
  const getToken = useCallback<ApiTokenProviderContext['getToken']>(() => token, [token]);
  return (
    <ApiTokenContext.Provider value={{setToken, getToken}}>
      {children}
    </ApiTokenContext.Provider>
  );
};

export default ApiTokenProvider;
