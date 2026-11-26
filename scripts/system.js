globalThis.activateLogging = false;

import { OmniaPnPCharacterData } from "./data/character.mjs";
import { OmniaPnPCharacterSheet } from "./sheets/character-sheet.mjs";

Hooks.once("init", () => {
  console.log("OmniaPnP | Initializing OmniaPnP");

  CONFIG.Combat.initiative = {
    formula: "1d20 + @initiative.total",
    decimals: 0
  };

  // Register data model
  CONFIG.Actor.dataModels.character = OmniaPnPCharacterData;

  // Register sheet
  foundry.documents.collections.Actors.registerSheet(
    "OmniaPnP",
    OmniaPnPCharacterSheet,
    {
      types: ["character"],
      makeDefault: true
    }
  );

  // Register Handlebars helpers
  Handlebars.registerHelper('multiply', function(a, b, c) {
    if (c) {
      // Three arguments: (current * b) / c * 100
      return (a * b) / c;
    }
    // Two arguments: a * b
    return a * b;
  });
});

// Set HP defaults before actor creation completes; do not persist an update from preCreateActor.
Hooks.on("preCreateActor", (actor) => {
  if (actor.type === "character") {
    actor.updateSource({
      "system.hp.value": actor.system.hp?.value ?? 10,
      "system.hp.total": actor.system.hp?.total ?? 10
    });
  }
});
