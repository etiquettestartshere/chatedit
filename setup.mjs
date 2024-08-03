import { loc } from "./scripts/common.js";
import Editing from "./scripts/editing.js";
import { MarkdownHook } from "./scripts/markdown.js";
import { moduleSettings } from "./scripts/settings.js";

Hooks.once("init", () => {
  Editing.init();
  moduleSettings.init();
  MarkdownHook.init();
});

Hooks.once("setup", () => {
  Editing.setup();
});

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).markedSmartypantsLite={})}(this,(function(e){"use strict";e.markedSmartypantsLite=function(){return{tokenizer:{inlineText(e){const t=this.rules.inline.text.exec(e);if(!t)return;const n=t[0].replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…");return{type:"text",raw:t[0],text:n}}}}}}));