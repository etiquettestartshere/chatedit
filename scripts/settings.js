
import { MODULE_NAME } from "./common.js";

export class moduleSettings {

  static init() {
    moduleSettings._showEdited();
    moduleSettings._md();
  };

  static _showEdited() {
    game.settings.register(MODULE_NAME, 'showEdited', {
      name: "Show Edited",
      hint: "Show a small label when messages have been edited.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: false,
      onChange: false
    });
  };
  
  static _md() {
    game.settings.register(MODULE_NAME, 'markdown', {
      name: "Use Markdown",
      hint: "Use markdown formatting for chat messages.",
      type: Boolean,
      config: true,
      default: true,
      requiresReload: true,
      scope: "client",
    });

  }
};