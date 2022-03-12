const sortByNames = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

export default sortByNames;
