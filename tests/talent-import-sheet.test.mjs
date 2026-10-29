import assert from "node:assert/strict";
import test from "node:test";

globalThis.foundry = {
  applications: {
    api: { HandlebarsApplicationMixin: Base => Base },
    sheets: { ActorSheetV2: class {} }
  }
};

const { PnS2CharacterSheet } = await import("../scripts/sheets/character-sheet.mjs");

function createSheet(importText) {
  const sheet = Object.create(PnS2CharacterSheet.prototype);
  sheet.element = { querySelector: () => ({ value: importText }) };
  sheet.actor = {
    system: { talents: [{ name: "Existing talent", base1: "str", base2: "agi", base3: "wil", value: 5 }] },
    update: async updateData => { sheet.updateData = updateData; }
  };
  return sheet;
}

test("import replaces existing talents with imported talents", async () => {
  globalThis.game = { i18n: { format: () => "Import complete" } };
  globalThis.ui = { notifications: { info: () => {} } };
  const sheet = createSheet("Talent\nNew talent\tAgility\tStrength\tWill\t10\t2\t12");

  await sheet._onImportTalents({ preventDefault() {} });

  assert.deepEqual(sheet.updateData["system.talents"], [
    { name: "New talent", base1: "agi", base2: "str", base3: "wil", value: 2 }
  ]);
});

test("import without valid talent rows clears existing talents", async () => {
  globalThis.game = { i18n: { format: () => "Import complete" } };
  globalThis.ui = { notifications: { info: () => {} } };
  const sheet = createSheet("Charactername\tImported character");

  await sheet._onImportTalents({ preventDefault() {} });

  assert.deepEqual(sheet.updateData["system.talents"], []);
});
