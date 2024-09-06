import { MODULE } from "./const.mjs";
import { Editing } from "./editing.mjs";

const ApplicationV2 = foundry.applications?.api?.ApplicationV2 ?? (class { });
const HandlebarsApplicationMixin = foundry.applications?.api?.HandlebarsApplicationMixin ?? (cls => cls);
export default class EditorV2 extends HandlebarsApplicationMixin(ApplicationV2) {

  /** @override */
  constructor(message) {
    super();
    this.message = message;
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      handler: EditorV2._onSubmit,
    },
    tag: "form",
    position: {
      width: 408,
      height: 830
    },
    classes: [MODULE, "edit-form-v2"],
    window: {
      title: "CHATEDIT.EDITS.Title",
      icon: "fa-solid fa-eraser",
      minimizable: true,
      resizable: true,
      contentClasses: ["standard-form"]
    },
    actions: {
      clearAlias: EditorV2._clear
    }
  }

  /** @override */
  static PARTS = {
    form: {
      template: `modules/${MODULE}/templates/edit-form-v2.hbs`
    }
  }

  /** @override */
  async _prepareContext(options) {

    // Prepare possible speakers for selectOptions
    const chars = game.scenes.viewed.tokens.values().reduce((acc, t) => {
      if (t.isOwner) acc.push({
        value: t.id,
        label: t.actor?.name,
        group: CONFIG.Actor.typeLabels[t.actor?.type],
        selected: (this.message.speaker.token === t.id) ? true : false
      })
      return acc;
    }, []);
    const users = [{
      value: game.user.id,
      label: game.user.name,
      group: "USER.RolePlayer",
      selected: this.message.speaker.token ? false : true
    }];
    const speakers = users.concat(chars);

    // Prepare data & handle linebreaks
    return foundry.utils.mergeObject(options, {
      speakers,
      alias: this.message.speaker.alias ?? null,
      content: this.message.content.replace(/< *br *\/?>/gim, "\n")
    });
  }

  /** @override */
  _onRender() {
    const speaker = this.element['speaker'];
    let alias = this.element['alias'];
    Editing._alias(speaker, alias);
  }

  /**
   * The form data submission handler.
   * @param {SubmitEvent} event The form submission event.
   * @param {HTMLElement} form  The form HTML element.
   * @param {FormDataExtended} formData  The formData, from which we want the object.
   */
  static async _onSubmit(event, form, formData) {
    let data = formData.object;
    await Editing._submitEditorData(this.message, data);
  }

  /**
   * Action to clear the alias input.
   */
  static _clear() {
    this.element['alias'].value = null;
  }

  /** @override */
  close(options) {
    Editing._editors.delete(this.message.id);
    return super.close(options);
  }
}