export const MODULE = "chatedit";
export const CHATEDIT_CONST = {
  CHAT_MESSAGE_STYLES: {
    EMOTE: 3,
    IC: 2,
    OOC: 1,
    OTHER: 0
  }
};
export const SETTINGS = {
  APPV2: "appv2",
  EDIT: "allowEdit",
  EMOJI: "emoji",
  MARKDOWN: "markdown",
  SHOW: "showEdited"
};
export const localize = (key) => game.i18n.localize(key);