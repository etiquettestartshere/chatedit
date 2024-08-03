//import { marked } from "marked";
//import { marked } from '../node_modules/marked/lib/marked.esm.js';
import { loc, MODULE_NAME } from "./common.js";

export class MarkdownHook {
  static init() {
    if (game.settings.get(MODULE_NAME, "markdown")) {
      Hooks.on("preCreateChatMessage", MarkdownHook.processMarkdown);
      Hooks.on("renderChatMessage", MarkdownHook._lastP);
    };
  };

  static async processMarkdown(message) {
    let newMessage = marked.parse(message.content, {
      gfm: true,
      breaks: true
    }).trimEnd();
    await message.updateSource({content: newMessage});
  };

  static _lastP(message, [html]) {
    const body = html.querySelector('.chat-message .message-content');
    const paras = body.querySelectorAll('p');
    if (!foundry.utils.isEmpty(paras)) {
      const last = Array.from(paras).at(-1);
      last.classList.add("last-para");
      const first = Array.from(paras).at(0);
      first.classList.add("first-para");
    };
  };
};

/*
export default class Markdown {
  static init() {
    libWrapper.register(
      MODULE_NAME,
      "ChatLog.prototype.processMessage",
      async function (wrapper, message, ...args) {
        let trimmed = message.trim();
        let prefix = "";
        if (trimmed.startsWith("/")) prefix = trimmed.split(" ")[0];
        let suffix = trimmed.substring(prefix.length !== 0 ? prefix.length + 1 : 0);
        if (game.settings.get(MODULE_NAME, "markdown")) {
          let originalSuffix;
          switch (prefix) {
            case "":
            case "/ooc":
            case "/ic":
            case "/emote":
            case "/em":
            case "/whisper": 
            case "/w":
              [ originalSuffix, suffix ] = await Markdown.processMessage(suffix);
              break;
            default:
              break;
          }
        }

        return await wrapper(`${prefix}${prefix !== "" ? " " : ""}${suffix}`, ...args);
      },
      "WRAPPER");
  }

  static async processMessage(message) {
    const originalMessage = message;
    message = marked.parse(message, {
      breaks: true
    }).trimEnd();
    if (message.startsWith('<p>')) {message = message.substring(3);console.warn("p")};
    if (message.endsWith('</p>')) {message = message.substring(0, message.length - 4);console.warn("/p")};
    const newLine = /(<\/?[ a-z]+>)\n(<\/?[ a-z]+>?)/;
    console.warn(newLine);
    while (newLine.test(message)) message = message.replace(newLine, '$1$2');
    return [ originalMessage, message ];
  }
}*/