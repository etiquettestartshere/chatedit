import { MODULE, userAuthor } from "./const.mjs";
import { Editing } from "./editing.mjs";

export default class Editor extends FormApplication {

  /** @override */
  constructor(message) {
    super();
    this.message = message;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      closeOnSubmit: true,
      editable: true,
      resizable: true,
      width: 408,
      height: 830,
      popOut: true,
      title: "CHATEDIT.EDITS.Title",
      template: `modules/${MODULE}/templates/edit-form.hbs`,
      classes: [MODULE, "edit-form"]
    });
  }

  /** @override */
  getData(options) {

    // Prepare possible speakers for optgroups only if they have valid members
    const player = [{ value: game.user.id, name: game.user.name }];
    const characters = Object.entries(CONFIG.Actor.typeLabels).map(([type, label]) => ({
      actors: Array.from(game.scenes.viewed.tokens.values()).reduce((acc, t) => {
        if (t.actor?.type === type && t.isOwner) acc.push({
          value: t.id,
          name: t.actor?.name
        }); return acc;
      }, []),
      label,
      type,
    })).filter((a) => a.actors.length);

    // Prepare selected
    const USERAUTHOR = userAuthor();
    let selected = '';
    this.message.speaker.token ?
      selected = this.message.speaker.token :
      selected = this.message[USERAUTHOR].id;

    // Prepare data & handle linebreaks
    return foundry.utils.mergeObject(options, {
      player,
      characters,
      selected,
      alias: this.message.speaker.alias ?? null,
      content: this.message.content.replace(/< *br *\/?>/gm, '\r')
    });
  }

  /** @override */
  activateListeners(html) {
    const speaker = html[0].querySelector('select[name="speaker"]');
    let alias = html[0].querySelector('input[name="alias"]');
    Editing._alias(speaker, alias);

    // Handle close and clear
    html[0].querySelector('button[data-action="close"]').addEventListener('click', () => {
      this.close();
    });
    html[0].querySelector('button[data-action="clearAlias"]').addEventListener('click', () => {
      alias.value = null;
    });
  }

  /** @override */
  async _updateObject(event, data) {
    await Editing._submitEditorData(this.message, data);
  }

  /** @override */
  close(options) {
    Editing._editors.delete(this.message.id);
    return super.close(options);
  }
}