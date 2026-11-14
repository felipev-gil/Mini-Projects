export function findCountries(countries, query) {
 const normalize = value => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
 const value = normalize(query.trim());
 if (!value) return [];
 return countries.filter(country => normalize(country.name).includes(value) || normalize(country.official).includes(value) || country.code.toLowerCase() === value).sort((a,b) => a.name.localeCompare(b.name));
}

