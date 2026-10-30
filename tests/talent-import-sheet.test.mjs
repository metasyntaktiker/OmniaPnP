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
    id: "actor-id",
    system: { talents: [{ name: "Existing talent", base1: "str", base2: "agi", base3: "wil", value: 5 }] },
    update: async updateData => { sheet.updateData = updateData; }
  };
  return sheet;
}

function mockImportFeedback() {
  const chatMessages = [];
  const notifications = [];
  globalThis.ChatMessage = {
    getSpeaker: ({ actor }) => ({ actor: actor.id }),
    create: async message => { chatMessages.push(message); }
  };
  globalThis.game = { i18n: { format: () => "Import complete" } };
  globalThis.ui = { notifications: { info: message => notifications.push(message) } };
  return { chatMessages, notifications };
}

test("import replaces existing talents with imported talents", async () => {
  const { chatMessages, notifications } = mockImportFeedback();
  const sheet = createSheet("Talent\nNew talent\tAgility\tStrength\tWill\t10\t2\t12");

  await sheet._onImportTalents({ preventDefault() {} });

  assert.deepEqual(sheet.updateData["system.talents"], [
    { name: "New talent", base1: "agi", base2: "str", base3: "wil", value: 2 }
  ]);
  assert.deepEqual(chatMessages, [{ speaker: { actor: "actor-id" }, content: "Import complete" }]);
  assert.deepEqual(notifications, ["Import complete"]);
});

test("import without valid talent rows clears existing talents", async () => {
  const { chatMessages } = mockImportFeedback();
  const sheet = createSheet("Charactername\tImported character");

  await sheet._onImportTalents({ preventDefault() {} });

  assert.equal(sheet.updateData.name, "Imported character");
  assert.equal(sheet.updateData["prototypeToken.name"], "Imported character");
  assert.deepEqual(sheet.updateData["system.talents"], []);
  assert.deepEqual(chatMessages, [{ speaker: { actor: "actor-id" }, content: "Import complete" }]);
});

test("import without a character name leaves the prototype token name unchanged", async () => {
  mockImportFeedback();
  const sheet = createSheet("Talent\nNew talent\tAgility\tStrength\tWill\t10\t2\t12");

  await sheet._onImportTalents({ preventDefault() {} });

  assert.equal(Object.hasOwn(sheet.updateData, "prototypeToken.name"), false);
});
