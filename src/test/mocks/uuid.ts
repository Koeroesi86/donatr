// Replaces the ESM-only uuid in tests with predictable ids: id-1, id-2, ...
let counter = 0;

export const v4 = () => `id-${++counter}`;
