import { MODULE, CHATEDIT_CONST, SETTINGS, localize } from "./const.mjs";
import { Editing } from "./editing.mjs";

export class ProcessChat {
  static init() {
    if (game.settings.get(MODULE, SETTINGS.MARKDOWN)) {
      Hooks.on("preCreateChatMessage", ProcessChat.processShowdown);
      ProcessChat._showdownOptions();
      ProcessChat.enrichers();
    }
    Hooks.on("renderChatMessage", ProcessChat._edited);
    Hooks.on("renderChatMessage", ProcessChat._ooc);
  }

  /**
   * Make em dashes.
   */
  static enrichers() {
    CONFIG.TextEditor.enrichers.push(
      {
        pattern: /--/gim,
        enricher: async () => { return "—" }
      }
    );
  }

  /**
   * Parse the message with Showdown.
   * @param {ChatMessage} message The ChatMessage to be parsed.
   */
  static async processShowdown(message) {

    // Filter out messages that shouldn't be edited
    if (message.isRoll) return;
    if (message.content.includes('<button')) return;
    if (message.content.includes('class=\"action-content\"')) return;
    if (!foundry.utils.isEmpty(message.flags?.[game.system.id])) return;

    // The id of the user making the message
    const userid = game.user.id;

    // Create the parser and parse
    const parser = new showdown.Converter({ extensions: ["inline"] });
    let parsed = parser.makeHtml(message.content);

    // Call the pre process hook and process
    const callback = Hooks.call("chatedit.preProcessChatMessage", message, parsed, parser, userid);
    if (!callback) return;
    await message.updateSource({ content: parsed });

    // Call the processed hook
    Hooks.callAll("chatedit.processChatMessage", message, parsed, parser, userid);
  }

  /**
   * Configure Showdown.
   */
  static _showdownOptions() {
    showdown.setFlavor('github');
    showdown.setOption('noHeaderId', true);
    showdown.setOption('ghMentions', false);
    showdown.setOption('simpleLineBreaks', true);
    showdown.setOption('splitAdjacentBlockquotes', true);
    showdown.setOption('moreStyling', true);
    showdown.setOption('disableForced4SpacesIndentedSublists', true);
    showdown.setOption('smartIndentationFix', true);
    if (game.settings.get(MODULE, SETTINGS.EMOJI)) showdown.setOption('emoji', true);
    showdown.extension("inline", function () {
      return [{
        type: "output",
        filter: function (markdown) {
          return markdown.replace(/<\/?p[^>]*>/gm, "");
        }
      }];
    });
  }

  /**
   * Insert the edited marker.
   * @param {ChatMessage} message The ChatMessage to be parsed.
   * @param {HTMLElement} html HTML contents of the message.
   */
  static _edited(message, [html]) {
    const flag = message.flags?.chatedit?.edited;
    if (!flag) return;
    const show = game.settings.get(MODULE, SETTINGS.SHOW);
    if (!show) return;
    let edited;
    if (show === 1) edited = `<span class="chatedited"> ${localize('CHATEDIT.EDITS.Flag')}<span>`;
    else if (show === 2) edited = '<i class="fa-solid fa-eraser"></i>';
    const meta = html.querySelector('.message-timestamp');
    meta.insertAdjacentHTML('afterend', edited);
  }

  /**
   * Add a css class to ooc messages.
   * @param {ChatMessage} message The ChatMessage.
   * @param {HTMLElement} html HTML contents of the message.
   */
  static _ooc(message, [html]) {
    if (message.isRoll) return;
    let STYLETYPE = Editing.styleType();
    if (message[STYLETYPE] === CHATEDIT_CONST.CHAT_MESSAGE_STYLES.OOC) html.classList.add("ooc");
  }
}