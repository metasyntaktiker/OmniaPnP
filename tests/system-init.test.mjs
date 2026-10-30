import assert from "node:assert/strict";
import test from "node:test";

const hooks = {};

globalThis.CONFIG = { Actor: { dataModels: {} }, Combat: {} };
globalThis.Hooks = {
  once: (name, callback) => { hooks[name] = callback; },
  on: () => {}
};
globalThis.foundry = {
  abstract: { DataModel: class {} },
  applications: {
    api: { HandlebarsApplicationMixin: Base => Base },
    sheets: { ActorSheetV2: class {} }
  },
  data: { fields: {} },
  documents: { collections: { Actors: { registerSheet: () => {} } } }
};
globalThis.Handlebars = { registerHelper: () => {} };

await import("../scripts/system.js");

test("Foundry combat initiative includes the character initiative total", () => {
  hooks.init();

  assert.deepEqual(CONFIG.Combat.initiative, {
    formula: "1d20 + @initiative.total",
    decimals: 0
  });
});
