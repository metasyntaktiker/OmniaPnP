import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8"));
}

function expandLocalizationKeys(messages) {
  const root = {};
  for (const [key, value] of Object.entries(messages)) {
    const parts = key.split(".");
    let current = root;
    for (const part of parts.slice(0, -1)) {
      assert.ok(
        current[part] === undefined || typeof current[part] === "object",
        `Localization key "${key}" conflicts with a string value`
      );
      current[part] ??= {};
      current = current[part];
    }

    const leaf = parts.at(-1);
    assert.ok(
      current[leaf] === undefined || typeof current[leaf] !== "object",
      `Localization key "${key}" conflicts with a nested namespace`
    );
    current[leaf] = value;
  }
  return root;
}

test("system manifest has the expected Foundry compatibility and entry point", async () => {
  const manifest = await readJson("system.json");

  assert.equal(manifest.id, "OmniaPnP");
  assert.equal(manifest.compatibility.minimum, "13");
  assert.equal(manifest.compatibility.verified, "16");
  assert.ok(manifest.esmodules.includes("scripts/system.js"));
});

for (const locale of ["en", "de"]) {
  test(`${locale} localization parses and dotted keys have no namespace conflicts`, async () => {
    const messages = await readJson(`lang/${locale}.json`);
    const tree = expandLocalizationKeys(messages);
    const expectedStats = locale === "en"
      ? { SP: "Spirit", RST: "Resistance", RES: "Resilience", TOU: "Toughness", INIT: "Initiative", DOD: "Dodge" }
      : { SP: "Geist", RST: "Widerstand", RES: "Belastbarkeit", TOU: "Zähigkeit", INIT: "Initiative", DOD: "Ausweichen" };

    assert.equal(typeof tree.OmniaPnP.Import.Tab, "string");
    assert.equal(typeof tree.OmniaPnP.Import.NoData, "string");
    assert.equal(typeof tree.OmniaPnP.Import.Success, "string");
    for (const [key, label] of Object.entries(expectedStats)) {
      assert.equal(tree.OmniaPnP[key], label);
      assert.equal(typeof tree.OmniaPnP[`${key}_MouseOver`], "string");
    }
    assert.equal(
      tree.OmniaPnP.CharacterSheet.Species,
      locale === "en" ? "Species" : "Spezies"
    );
  });
}

test("English and German localizations contain the same translation keys", async () => {
  const english = await readJson("lang/en.json");
  const german = await readJson("lang/de.json");
  assert.deepEqual(Object.keys(german).sort(), Object.keys(english).sort());
});

test("chat roll results include an expandable target breakdown", async () => {
  const sheetSource = await readFile(new URL("../scripts/sheets/character-sheet.mjs", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../styles/OmniaPnP.css", import.meta.url), "utf8");

  assert.match(sheetSource, /<details class="omnia-roll-details">/);
  assert.match(sheetSource, /<summary>\s*<h4 class="dice-formula">\$\{resultIcon\}<\/h4>\s*<\/summary>/);
  assert.doesNotMatch(sheetSource, /<dl>/);
  assert.match(sheetSource, /omnia-roll-equation-row/);
  assert.match(sheetSource, /OmniaPnP\.Roll\.IntermediateResult/);
  assert.match(sheetSource, /OmniaPnP\.Roll\.Result/);
  assert.match(sheetSource, /baseTarget: attributeTotal/);
  assert.match(stylesheet, /\.omnia-roll-details summary/);
});
