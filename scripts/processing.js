import { MODULE } from "./const.js";

export class ProcessChat {
  static init() {
    if (game.settings.get(MODULE, "markdown")) {
      Hooks.on("preCreateChatMessage", ProcessChat.processMarkdown);
      Hooks.on("renderChatMessage", ProcessChat._edited);
      Hooks.on("renderChatMessage", ProcessChat._lastPara);
    };
  }

  static async processMarkdown(message) {
    if (message?.flags.dnd5e || !foundry.utils.isEmpty(message.rolls)) return;
    let newMessage = marked.parseInline(message.content, {
      gfm: true,
      breaks: true
    }).trimEnd();
    await message.updateSource({content: newMessage});
  }

  static async _edited(message, [html]) {
    const flag = message.flags?.chatedit;
    if (!flag) return;
    const newhtml = '<span class="chatedited"><em>(edited)</em><span>';
    const meta = html.querySelector('.message-metadata');
    meta.insertAdjacentHTML('beforeend', newhtml);
  }

  static _lastPara(message, [html]) {
    const body = html.querySelector('.chat-message .message-content');
    const paras = body.querySelectorAll('p');
    if (!foundry.utils.isEmpty(paras)) {
      const last = Array.from(paras).at(-1);
      last.classList.add("last-para");
      const first = Array.from(paras).at(0);
      first.classList.add("first-para");
    };
  }
}