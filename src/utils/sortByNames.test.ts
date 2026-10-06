import sortByNames from "./sortByNames";

describe('sortByNames', () => {
  it('sorts resources alphabetically by name', () => {
    const sorted = [{ name: 'banana' }, { name: 'apple' }, { name: 'cherry' }].sort(sortByNames);

    expect(sorted.map((r) => r.name)).toEqual(['apple', 'banana', 'cherry']);
  });

  it('sorts accented names with locale awareness', () => {
    const sorted = [{ name: 'Zebra' }, { name: 'Árpád' }, { name: 'Aladár' }].sort(sortByNames);

    expect(sorted.map((r) => r.name)).toEqual(['Aladár', 'Árpád', 'Zebra']);
  });
});
