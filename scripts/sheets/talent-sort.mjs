export function sortTalentsByName(talents) {
  return [...talents].sort((first, second) =>
    first.name.localeCompare(second.name, undefined, { sensitivity: "base" })
  );
}
