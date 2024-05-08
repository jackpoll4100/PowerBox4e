# PowerBox4e
A tool for using ```.dnd4e``` character sheets in Roll20.
Note that this tool does not use the Roll20 api and so should not require you to be a Pro member to make use of it.

## Overview
This is a ```UserScript```, meaning it needs to be used with a browser extension like [TamperMonkey](https://www.tampermonkey.net/) or [ViolentMonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) etc.

When enabled, it injects an additional set of user interface tools into the Roll20 ui whenever you load into a game. These should appear below the chat box and should look something like this:

![image](https://github.com/jackpoll4100/PowerBox4e/assets/43215677/4edd7c40-1220-4243-b81b-45d4716db3c9)
![image](https://github.com/jackpoll4100/PowerBox4e/assets/43215677/13731669-4408-48eb-81ba-5b0e0b2d667f)

The goal of this tool is to make it easier to use the sheet built in the 4e character creator as the main source of truth for your character and prevent the friction of needing to manually enter power details and learn how macros work to be able to use 4e powers in Roll20.

## Getting Started

Once you add the userscript to the extension of your choice, the first step in using it is preparing and uploading your character sheet.

First, find the ```.dnd4e``` character sheet file created by the character builder. It should be in a directory like this: ```Documents\ddi\Saved Characters```.

You then need to run it through a program called [DetailAdder](https://github.com/CBLoader/DetailAdder/releases/tag/v2.0).
This formats it properly so that the extension can get the right details about powers etc.
To do this, just extract the contents of the zip file and run the exe, then select your character sheet.
This should give you a new version of your character sheet named something like ```<You character name>Detail.dnd4e```.

Next, from Roll20, load into you game and hit the "choose file" button at the bottom of the page, it should look like this:

![image](https://github.com/jackpoll4100/PowerBox4e/assets/43215677/aa8f8c46-9a52-41ca-b40a-579f07c49a35)

This will allow you to select your character sheet and upload it.

**Important: Make sure to select the version of your sheet with Detail in the name.**

Now you should be all set. The important info about your character should be saved in the bowser, so after initially uploading your character sheet, you should only need to reupload when something on your character sheet changes (i.e. b/c you levelled up, got a new item, etc.).

## Using Power Box

The main things Power Box supports right now:

-Roll and display power cards.

-Roll skill checks.

-Roll saving throws.

Things that aren't currently supported but may be in the future:

-Tracking character resources (HP, AP, Surges, Gold, etc.).

-Pinning power macros to a tool bar.

### To Roll a Power

Note: For however many weapons you have added to your character sheet, each power/weapon combo will appear in the dropdown. You simply need to select the one that matches the weapon you are wanting to use when there are multiple options.

1) Select the power (or power/weapon combo if there are multiple) you want to use from the dropdown above the file selector (You can type with the dropdown open to search/filter to the power you want).
2) Hit the "Use Power" button.

This will automatically roll the power and display it in full in the chat.
There are several convenience features you can use while rolling powers as well:

1) You can specify a number of targets (the default is 1 if not specified), this is how many attacks you are making with this power (for example an AOE attack might need to roll several attacks at once). By default, only one damage roll will be made as that is typical of most multi target attacks, but if you have a power that requires rolling damage separately per target, there is a setting in the settings menu which will toggle this behavior. The settings menu defaults to hidden but can be accessed by toggling the "Power Box" button here:

![image](https://github.com/jackpoll4100/PowerBox4e/assets/43215677/1b12798a-542c-4dca-88fe-dff45ec98bfa)

2) You can add situational modifiers in the "Situational Modifiers" menu, this is also hidden behind the toggle (modifiers still apply after closing the menu, and will persist until you reset/remove them). For powers the relevant modifiers are "Attack Modifier" and "Damage Modifier". These work with numbers or dice formulas:

![image](https://github.com/jackpoll4100/PowerBox4e/assets/43215677/3a8ba899-7924-49da-93a8-322acf7dd8f4)

### To Roll a Skill Check
1) Select the skill you want to use from skill dropdown (You can type with the dropdown open to search/filter to the skill you want).
2) Hit the "Skill Check" button.

This will roll the skill check in the chat.
Note:
Similar to powers, you can apply a situational modifier to a skill check using the "Skill Modifier" input under the "Situational Modifiers" menu.

### To Roll a Saving Throw
1) Hit the "Saving Throw" button.

Note:
Similar to powers and skill checks, you can apply a situational modifier to a skill check using the "Saving Throw Modifier" input under the "Situational Modifiers" menu.

## Other Features

Besides the settings mentioned above, there is also an "Auto check powers" setting in the settings menu. When enabled, this will auto check off used powers in your character sheet once you have used them. There are a few caveats to this:

1) You must be using the default roll20 D&D 4e character sheet.
2) The power name used on your character sheet must match the name of the power on your sheet in the character builder.
3) You must have your character sheet open in the same tab when rolling powers.

Besides the situational modifiers explained above, you can also track situational defense modifiers in the "Situational Modifiers" menu. Note that this is purely for keeping track during a session and has no mechanical effect at the moment.

Note:
Settings are saved to your browser storage along with your character sheet and so will persist whenever you come back to roll20.
Situational Modifiers do not do this currnetly, they are tracked only so long as the browser tab where you have applied them is open.

## Caveats/Known Issues:

-In the default Roll20 macro template, power cards take up quite a lot of space, partially because 4e powers have a lot in them and partially due to the layout of the power cards. I'm looking into making a custom roll template that saves space but if so it would require pro access to add it to your game or I'd need to get it added to the 4e sheet. I've thought about adjusting it to use the 4e character sheet macro but that one doesn't support as many attributes as I want and ends up looking garbled when used currently.

-There is not currently a "delete character" button. You can always just upload a new sheet and it will overwrite whatever is there, but if you want to delete your character info completely for some reason, you have to do it from the inspector by deleting the key named "powerBox" from the Roll20 LocalStorage under the Application tab. I don't recommend messing with this stuff unless you know what you're doing already, its more hassle than its worth but I will be adding a delete character button soon to handle this automatically.

-Item Powers have less info than other powers since they don't have the same power card metadata in the character sheet.

-If you don't want the ui controls to appear, you just need to toggle off the script from the extension menu.

-I've tested this with quite a few character sheets and classes but obviously 4e has an insane amount of powers and interactions between those powers and feats, secondary powers, etc., so there are bound to buggy powers and issues I haven't encountered yet. If you hit a bug/a power that doesn't work properly, the best thing to do if you're sending me a bug report is to summarize what happened, what settings or situational mods you had turned on, and send a copy of the macro log. If you open the web inspector you should see that each power macro will appear in the console with a message like: ```Power Box - Executing Macro: <Macro here>```, this is what is most helpful. Sharing the character sheet file is also very helpful.
