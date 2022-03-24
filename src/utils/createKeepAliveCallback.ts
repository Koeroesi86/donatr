import debounce from "lodash.debounce";

const createKeepAliveCallback = (keepAliveTimeout: number) => debounce(() => {
  console.log('Shutting down API due to inactivity.');
  process.exit(0);
}, keepAliveTimeout);

export default createKeepAliveCallback;
