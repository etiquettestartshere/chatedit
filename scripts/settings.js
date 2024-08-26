
import { MODULE } from "./const.js";

export class ModuleSettings {

  static init() {
    ModuleSettings._showEdited();
    ModuleSettings._md();
  }

  static _showEdited() {
    game.settings.register(MODULE, 'showEdited', {
      name: "Show Edited",
      hint: "Show a small label when messages have been edited.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: false,
      onChange: false
    });
  }

  static _md() {
    game.settings.register(MODULE, 'markdown', {
      name: "Use Markdown",
      hint: "Use markdown formatting for chat messages.",
      type: Boolean,
      config: true,
      default: true,
      requiresReload: true,
      scope: "client",
    });

  }
}