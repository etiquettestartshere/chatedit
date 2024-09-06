# Chat Edit
A module for editing and styling chat messages. It is a lightweight chat editor, with no module dependencies and no external libraries. It is *not* a 'chat enhancement' module (though it might be mistaken for one). Its intent is to bring the Foundry chat message experience to the bare minimum of acceptability for text roleplay.

## Features
<p style="text-align: center"><img src="https://i.imgur.com/eR38L51.png" style="border: none"></p>

Allows the editing of chat messages that *you* created (GMs cannot edit messages from other users); change the speaker (potential speakers include only owned tokens on the currently viewed scene), alias, and style, and process chat messages with Foundry's built-in markdown processor (Showdown) for *emphasis*, **bold**, and ~~more~~.

## Settings
- Allow Editing (on by default). *World setting*.
- Show Edited Messages: show message, show icon, do not show (shows icon by default). *World setting*.
- Markdown Styling (on by default). *Client setting*.
- Allow Emojis (off by default). *World setting*.
- Use ApplicationV2 (on my default for Version 12, disabled in Version 11), if for some reason, you want to stick with the Application V1 style. *Client setting*.

## Dual Version Support
Currently supports both version 11 and version 12 of Foundry.

## System Requirements
This module is, to the best of my abilities, designed to be system agnostic. The most obvious failure point would be allowing messages that are not supposed to be edited to be edited, or the (edited) message or icon displaying incorrectly depending on system's chat cards. I have currently tested it on dnd5e and swb. If you find that it does not function as desired on another system, please make a github issue about it and compatibility will be investigated.

## Hooks
The below hooks are intended for module developers or world script enjoyers who may be touching or processing ChatMessages, to ensure that their changes happen before or after this module's changes, or for whatever other reason.
```js
/**
 * Hook called before the markdown processing is completed and applied. Return `false` to prevent processing.
 * @param {ChatMessage} message       The ChatMessage to be processed.
 * @param {string} parsed             The message content after being parsed by Showdown.
 * @param {showdown.Converter} parser The Showdown parser.
 * @param {string} userid             The id of the user who created or is processing the message.
 */
Hooks.call("chatedit.preProcessChatMessage", message, parsed, parser, userid);
```
```js
/**
 * Hook called after the message is processed.
 * @param {ChatMessage} message       The ChatMessage to be processed.
 * @param {string} parsed             The message content after being parsed by Showdown.
 * @param {showdown.Converter} parser The Showdown parser.
 * @param {string} userid             The id of the user who created or is processing the message.
 */
Hooks.callAll("chatedit.processChatMessage", message, parsed, parser, userid);
```
```js
/**
 * Hook called before the edit is completed and applied. Return `false` to prevent processing.
 * @param {ChatMessage} message      The ChatMessage to be processed.
 * @param {string} parsed            The message content after being parsed by Showdown.
 * @param {object} [changed]         Differential data that will be used to update the document.
 * @param {string} [changed.content] The message content as edited by the application.
 * @param {object} [changed.speaker] The speaker object as edited by the application.
 * @param {number} [changed.style]   The edited type (version 11) or style (version 12) of the message document.
 * @param {string} [changed.flags]   The message flags, which may contain module data.
 * @param {object} data              The formData from the application.
 * @param {string} userid            The id of the user who created or is processing the message.
 */
Hooks.call("chatedit.preEditChatMessage", message, { content, speaker, style, flags }, data, userid);
```
```js
/**
 * Hook called after the edit is completed.
 * @param {ChatMessage} message      The ChatMessage to be processed.
 * @param {string} parsed            The message content after being parsed by Showdown.
 * @param {object} [changed]         Differential data that will be used to update the document.
 * @param {string} [changed.content] The message content as edited by the application.
 * @param {object} [changed.speaker] The speaker object as edited by the application.
 * @param {number} [changed.style]   The edited type (version 11) or style (version 12) of the message document.
 * @param {string} [changed.flags]   The message flags, which may contain module data.
 * @param {object} data              The formData from the application.
 * @param {string} userid            The id of the user who created or is processing the message.
 */
Hooks.callAll("chatedit.editChatMessage", message, { content, speaker, style, flags }, data, userid);
```

### Future Plans
Once I consider this module stable and feature complete, version 11 support will be dropped, and I will release a lighter weight v12 only version. Due to the uncertain nature of appv2/themev2 requirements for version 13, whether or not chat messages and the chat sidebar and popout experience a full deprecation of appv1 will determine whether this module survives into v13. Most likely, if the transition to appv2 is too arduous (and in particular, if it breaks the ability for foundry's tiny chat to be resized), I will stop using foundry altogether. Thus, this module is MIT licensed and anyone who wants to can pick it up with no hassle.
___

###### **Technical Details**

**Scope:** A custom application (one for appv1 and appv2) to edit chat messages, accessible from chat message context menus, and an implementation of Showdown as bundled by Foundry on preCreate hooks to add markdown parsing to message content. If "Show Edited Messages" is enabled, messages that are edited will be flagged once by a `chatedit: { edited: Boolean }` flag. The only other data modified is the `content` and `speaker` of chat messages when they are edited, or processed by Showdown.

**License:** MIT license.

**Additional Info:** Thank you to the original (to my knowledge) chat editor module DF Chat Enhancements and its author flamewave000, and to Karakara's Chat Enhancements and its author Julia. This module carries forward some ideas originally from (to my knowledge) DF Chat Enhancements, and a few ideas from Karakara's, too (though the approach of this module varies). Thanks also to Zhell, Flix, mxzf, esheyw, ChaosOS, and Ethaks for putting up with me as I struggled to bring a chat editor module into the modern era. Thanks especially to Mana, who told me to use Showdown rather than bundling an external markdown library.