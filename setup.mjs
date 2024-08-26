import Editing from "./scripts/editing.js";
import { ProcessChat } from "./scripts/processing.js";
import { ModuleSettings } from "./scripts/settings.js";

Hooks.once("init", () => {
  ModuleSettings.init();
  Editing.init();
  ProcessChat.init();
})

Hooks.once("setup", () => {
  Editing.setup();
})