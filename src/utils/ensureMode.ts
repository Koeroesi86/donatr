const ensureMode = (mode?: string): 'light' | 'dark' | undefined => {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  return undefined;
}

export default ensureMode;
