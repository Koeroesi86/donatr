import {useContext} from "react";
import {ApiTokenContext} from "../../components/api-token-provider";

const useApiToken = () => useContext(ApiTokenContext);

export default useApiToken;
