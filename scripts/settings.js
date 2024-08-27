
import { MODULE } from "./const.js";

export class ModuleSettings {

  static init() {
    ModuleSettings._showEdited();
    ModuleSettings._md();
    ModuleSettings._v2();
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

  static _v2() {
    game.settings.register(MODULE, 'appv2', {
      name: "Use ApplicationV2",
      hint: "Use the ApplicationV2 editor with native darkmode support.",
      type: Boolean,
      config: true,
      default: false,
      requiresReload: true,
      scope: "client",
    });
  }
}