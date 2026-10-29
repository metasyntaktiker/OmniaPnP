import assert from "node:assert/strict";
import test from "node:test";
import { sortTalentsByName } from "../scripts/sheets/talent-sort.mjs";

test("sorts talents alphabetically without case sensitivity", () => {
  const talents = [
    { name: "Zoology" },
    { name: "athletics" },
    { name: "Alchemy" }
  ];

  assert.deepEqual(
    sortTalentsByName(talents).map(talent => talent.name),
    ["Alchemy", "athletics", "Zoology"]
  );
  assert.deepEqual(talents.map(talent => talent.name), ["Zoology", "athletics", "Alchemy"]);
});
