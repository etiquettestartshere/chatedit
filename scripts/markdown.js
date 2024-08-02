//import { marked } from "marked";
import { loc, MODULE_NAME } from "./common.js";

export default class Markdown {
  static init() {
    libWrapper.register(
      MODULE_NAME,
      "ChatLog.prototype.processMessage",
      async function (wrapper, message, ...args) {
        // The message, but with leading and trailing whitespace trimmed.
        let trimmed = message.trim();

        // The command at the start of the message, if any.
        let prefix = "";
        if (trimmed.startsWith("/")) prefix = trimmed.split(" ")[0];

        // The rest of the message, without the prefix.
        let suffix = trimmed.substring(prefix.length !== 0 ? prefix.length + 1 : 0);

        if (game.settings.get(MODULE_NAME, "markdown")) {
          // The suffix, before markdown gets processed.
          let originalSuffix;

          switch (prefix) {
            case "":
            case "/ooc":
            case "/ic":
            case "/emote":
            case "/whisper": case "/w":
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
      headerIds: false,
      breaks: true
    }).trimEnd();
    //if (message.startsWith('<p>')) message = message.substr(3);
    //if (message.endsWith('</p>')) message = message.substr(0, message.length - 4);
    const newLine = /(<\/?[ a-z]+>)\n(<\/?[ a-z]+>?)/;
    while (newLine.test(message)) message = message.replace(newLine, '$1$2');
    return [ originalMessage, message ];
  }
}

export class Cleanup {
  static init() {
    Hooks.on("renderChatMessage", Cleanup._lastP);
  };

  static _lastP(message, [html]) {
    const body = html.querySelector('.chat-message .message-content');
    const paras = body.querySelectorAll('p');
    if (!foundry.utils.isEmpty(paras)) {
      const last = Array.from(paras).at(-1);
      last.classList.add("last-para");
      //if (Array.from(last.classList).includes("chatedited")) console.warn("edited");
      //last.style.marginBottom = '0px';
    };  
  };
};