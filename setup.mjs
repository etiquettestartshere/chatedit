import { loc } from "./scripts/common.js";
import Editing from "./scripts/editing.js";
import Markdown, { Cleanup } from "./scripts/markdown.js";
import { moduleSettings } from "./scripts/settings.js";

Hooks.once("init", () => {
  Editing.init();
  moduleSettings.init();
  Markdown.init();
  Cleanup.init();
});

Hooks.once("setup", () => {
  Editing.setup();
});