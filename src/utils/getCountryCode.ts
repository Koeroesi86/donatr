const getCountryCode = (locale: string): string =>
  (locale.split('-').pop() ?? '').toLowerCase();

export default getCountryCode;
