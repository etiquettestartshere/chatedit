
import { MODULE_NAME, loc, localized } from "./common.js";

export default class Editing {
  static #Form = class Form extends FormApplication {
    static get defaultOptions() {
      return foundry.utils.mergeObject(FormApplication.defaultOptions, {
        closeOnSubmit: true,
        editable: true,
        resizable: true,
        width: 400,
        popOut: true,
        title: localized("editing.title"),
        template: "modules/chatedit/templates/edit-form.hbs",
      });
    }
  
    #message;
  
    constructor(message) {
      super({});
      this.#message = message;
    }
  
    getData(options) {
      const actorGroups = Object.entries(CONFIG.Actor.typeLabels)
        .map(([ type, label ]) => ({
          actors: Array.from(game.scenes.viewed.tokens.values())
            .filter((token) => token.actor?.type == type)
            .filter((token) => token.actor?.ownership[game.user.id] == CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
            .map((token) => ({ id: `token-${token.id}`, name: token.name })),
          label,
          type,
        }))
        .filter((group) => group.actors.length != 0);
  
      const players = [ { id: `user-${game.user.id}`, name: game.user.name } ];
  
      let selected = "";
      if (this.#message.speaker.token)
        selected = `token-${this.#message.speaker.token}`;
      else
        selected = `user-${this.#message.user.id}`;
  
      return foundry.utils.mergeObject(options, {
        selected,
        players,
        actorGroups,
        messageText: this.#message.content //.replace(/< *br *\/?>/gm, "\n")
          .replace(/<p +class="chatedited">.+/, '')
          //.replace(/[\r\n]{2,}/, '<br><br>')
          //.replace(/(\r\n|\r|\n)+/im, '<br>')
      });
    }
  
    activateListeners(html) {
      super.activateListeners(html);
      html.find("#cancel").on("click", async () => await this.close());
    }
  
    async _updateObject(_event, data) {
      let content;
      if (game.settings.get(MODULE_NAME, "showEdited")) {
        content = data.content += ` <p class="chatedited bullshit">(edited)</p>`;
      } else {
        content = data.content;
      }  
      
      let id, speaker, token, type, user;
      if (data.speaker.startsWith("user-")) {
        id = data.speaker.substring("user-".length);
        user = game.users.get(id);
        speaker = ChatMessage._getSpeakerFromUser({ user });
        type = CONST.CHAT_MESSAGE_STYLES.OOC;
      } else {
        id = data.speaker.substring("token-".length);
        token = game.scenes.viewed.tokens.get(id);
        speaker = ChatMessage.getSpeaker({ token });
        if (this.#message.style != CONST.CHAT_MESSAGE_STYLES.EMOTE)
          type = CONST.CHAT_MESSAGE_STYLES.IC;
      }

      if (speaker.alias === undefined) speaker.alias = null;

      this.#message.update({
        content,
        speaker,
        type,
        user,
      });
    }

    close(options) {
      Editing.#openEditors.delete(this.#message);
      return super.close(options);
    }
  };

  static #openEditors = new WeakMap();
  
  /**
   * @param {string} messageId
   * @returns {boolean} `true` if the active user can edit the specified message.
   */
  static #canEditMessage(messageId) {
    // If the message isn't from the current session, then it won't
    // be present in this map, and therefore cannot be edited.
    if (!ui.chat.collection.has(messageId)) return false;

    const messageData = ui.chat.collection.get(messageId);

    // If the message is a roll, nobody can edit it.
    if (messageData.isRoll) return false;

    // If editing is disabled, then we can't use this menu.
    //if (!Settings.allowEditing) return false;

    // If we're not the user who sent this message, we can't edit it.
    if (messageData.user.id != game.userId) return false;

    return true;
  }

  static async #editMessage(messageId) {
    if (!Editing.#canEditMessage(messageId)) {
      ui.notifications.warn(_("editing.edit-not-allowed"));
      return;
    }

    const messageData = ui.chat.collection.get(messageId);

    let editor = Editing.#openEditors.get(messageData);
    if (editor) {
      // If there's already an editor for this message, bring it to the top.
      editor.bringToTop();
    } else {
      editor = new Editing.#Form(messageData);
      
      try {
        await editor._render(true);
      } catch (error) {
        // We're responsible for throwing the error hook if the editor fails to
        // render -- this is what is done by `Application.prototype.render`.
        editor._state = Application.RENDER_STATES.ERROR;
        Hooks.onError("Application#render", error, {
          msg: `An error occurred while rendering ${editor.constructor.name} ${editor.appId}`,
          log: "error",
        });
      }
      
      Editing.#openEditors.set(messageData, editor);
    }

    // TODO: Focus the text field on the editor
    //editor.focus();
  }

  static #makeInCharacter(messageId) {
    if (!Editing.#canEditMessage(messageId)) {
      ui.notifications.warn(_("editing.contextualize-not-allowed"));
      return;
    }
    if (!Editing.#isOutOfCharacter(messageId)) {
      ui.notifications.warn(_("editing.already-in-character"));
      return;
    }
    
    const message = ui.chat.collection.get(messageId);
    const speaker = ChatMessage.getSpeaker({ actor: game.user.character });
    message.update({ type: CONST.CHAT_MESSAGE_STYLES.IC, speaker });
  }

  static #makeOutOfCharacter(messageId) {
    if (!Editing.#canEditMessage(messageId)) {
      ui.notifications.warn(_("editing.contextualize-not-allowed"));
      return;
    }
    if (!Editing.#isInCharacter(messageId)) {
      ui.notifications.warn(_("editing.already-in-character"));
      return;
    }
    
    const message = ui.chat.collection.get(messageId);
    const speaker = ChatMessage._getSpeakerFromUser({ user: game.user });
    message.update({ type: CONST.CHAT_MESSAGE_STYLES.OOC, speaker });
  }

  static init() {

    libWrapper.register(
      MODULE_NAME,
      "ChatLog.prototype._getEntryContextOptions",
      function (wrapper, ...args) {
        const options = wrapper(...args);

        const makeInCharacter = {
          name: localized("editing.in-character"),
          icon: "<i class=\"fas fa-user-secret\"></i>",
          condition: ([li]) => {
            const messageId = li.getAttribute("data-message-id");
            return Editing.#isOutOfCharacter(messageId) && game.user.character != null;
          },
          callback: ([li]) => {
            const messageId = li.getAttribute("data-message-id");
            Editing.#makeInCharacter(messageId);
          },
        };

        const makeOutOfCharacter = {
          name: localized("editing.out-of-character"),
          icon: "<i class=\"fas fa-user\"></i>",
          condition: ([li]) => {
            const messageId = li.getAttribute("data-message-id");
            return Editing.#isInCharacter(messageId);
          },
          callback: ([li]) => {
            const messageId = li.getAttribute("data-message-id");
            Editing.#makeOutOfCharacter(messageId);
          },
        };

        const editOption = {
          name: localized("editing.context-menu"),
          icon: "<i class=\"fas fa-pencil-alt\"></i>",
          condition: ([li]) => {
            const messageId = li.getAttribute("data-message-id");
            return Editing.#canEditMessage(messageId);
          },
          callback: ([li]) => {
            const messageId = li.getAttribute("data-message-id");
            Editing.#editMessage(messageId);
          },
        };

        const concealOption = options.find((option) => option.name.includes("Conceal"));
        const concealOptionIndex = options.indexOf(concealOption);

        if (concealOptionIndex != -1) {
          options.splice(concealOptionIndex + 1, 0, makeInCharacter, makeOutOfCharacter);
        } else {
          options.push(makeInCharacter);
          options.push(makeOutOfCharacter);
        }

        const deleteOption = options.find((option) => option.name.includes("Delete"));
        const deleteOptionIndex = options.indexOf(deleteOption);

        if (deleteOptionIndex != -1) {
          options.splice(deleteOptionIndex, 0, editOption);
        } else {
          options.push(editOption);
        }

        return options;
      },
      "WRAPPER");
  }

  static #isInCharacter(messageId) {
    if (!Editing.#canEditMessage(messageId)) return false;
    const messageData = ui.chat.collection.get(messageId);
    return messageData.speaker.actor != null && messageData. speaker.token != null;
  }

  static #isOutOfCharacter(messageId) {
    if (!Editing.#canEditMessage(messageId)) return false;
    const messageData = ui.chat.collection.get(messageId);
    return messageData.speaker.actor == null && messageData.speaker.token == null;;
  }

  static setup() {
    const editMarkerTemplate = document.createElement("template");
    editMarkerTemplate.innerHTML = `<span class="chatedit edited">${loc("editing.flag")}</span>`;
  }
}
