import { Editing, EditingV2 } from "./scripts/editing.js";
import { ProcessChat } from "./scripts/processing.js";
import { ModuleSettings } from "./scripts/settings.js";

Hooks.once("init", ModuleSettings.init);
//Hooks.once("init", Editing.init);
Hooks.once("init", EditingV2.init);
Hooks.once("init", ProcessChat.init);