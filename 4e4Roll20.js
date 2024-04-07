// ==UserScript==
// @name         4e4roll20
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Creates a ui for roll20 that allows for importing dnd 4e character sheets and rolling powers from them.
// @author       jackson pollard
// @match        https://app.roll20.net/editor/
// @icon         https://cdn-icons-png.flaticon.com/512/6729/6729800.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function onDOMLoad(){
        let uiContainer = document.createElement('div');
        uiContainer.innerHTML = `
        <div id="charBox" style="display: flex; flex-direction: row; justify-content: space-between;">
            <input id="charName" style="margin: 5px 5px 5px 5px; width: 100%" disabled value="No character found" type="text">
        </div>
        <div style="display: flex; flex-direction: row; width: 100%; justify-content: space-between;" id="powerActions">
        </div>
        <div style="display: flex; flex-direction: row; justify-content: space-between;">
            <input style="margin: 5px 5px 5px 5px; width: 100%;" type="file" id="uploadedFile" />
            <span id="usePower" style="
                padding: 5px;
                margin: 5px 5px 5px 5px;
                min-width: 70px;
                border-radius: 5px;
                background-color: var(--primary-dark);
                display: inline-grid;
                align-items: center;
                text-align: center;
                cursor: pointer;">
                    Use Power
            </span>
        </div>`;
        document.getElementById('textchat-input').appendChild(uiContainer);

        let actionBox = document.getElementById('powerActions');

        let elStyles = 'margin: 5px 5px 5px 5px;';

        //Create and append ui elements
        let selectList = document.createElement("select");
        selectList.id = 'powerDropdown';
        selectList.style = elStyles + ' width: 75%';
        actionBox.appendChild(selectList);
        let targetsInput = document.createElement("input");
        targetsInput.type = 'number';
        targetsInput.id = 'myTargets';
        targetsInput.placeholder = '# of Targets';
        targetsInput.style = elStyles + ' width: 25%;';
        actionBox.appendChild(targetsInput);

        document.getElementById("usePower").addEventListener("click",function() {
            let powerQuery = document.getElementById('powerDropdown').value;
            powerQuery = powerQuery.split('||');
            let targets = parseInt(document.getElementById('myTargets').value || 1);
            let macro = window.constructMacro(window.powerObject[powerQuery[0]], powerQuery.length > 1 ? window.powerObject[powerQuery[0]]['WeaponMap'][powerQuery[1]] : {}, targets);
            document.querySelectorAll('[title="Text Chat Input"]')[0].value = macro;
            document.getElementById('chatSendBtn').click();
            if (window.autoCheck && window.frames?.length > 1){
                for (let y = 1; y < window.frames?.length; y++){
                    let w = window.frames[y];
                    for (let x = 1; x < 100; x++){
                        if (w?.document?.querySelector(`[name="attr_power-${ x }-name"]`)?.value?.replaceAll(' ', '')?.toLowerCase() === window.powerObject[powerQuery[0]].Name.replaceAll(' ', '').toLowerCase()){
                            if (w?.document?.querySelectorAll(`[name="attr_power-${ x }-used"]`)?.[0]){
                                w.document.querySelectorAll(`[name="attr_power-${ x }-used"]`)[0].click();
                            }
                        }
                    }
                }
            }
        });

        const fileInputElement = document.getElementById('uploadedFile');

        // Improved dice process with or handler and multiple dice matching.
        function processDiceFormula(macroString, wDice){
            let statMods = window.foundCharacter.statMods;
            let reconstructedString = macroString.replaceAll('[W]', wDice || '[W]');
            if (statMods){
                let stats = ['Charisma', 'Constitution', 'Dexterity', 'Strength', 'Wisdom', 'Intelligence'];
                for (let stat of stats){
                    for (let stat2 of stats){
                        if (stat !== stat2 && reconstructedString.includes(`${ stat } or ${ stat2 } Modifier`)){
                            reconstructedString = reconstructedString.replaceAll(`${ stat } or ${ stat2 } Modifier`,
                                                                                 statMods[`${ stat } Modifier`] > statMods[`${ stat2 } Modifier`] ? statMods[`${ stat } Modifier`] : statMods[`${ stat2 } Modifier`]);
                        }
                    }
                }
                for (let stat in statMods){
                    reconstructedString = reconstructedString.replaceAll(stat, statMods[stat]);
                }
            }
            reconstructedString.replaceAll(' + ', '+');
            reconstructedString.replaceAll(' + ', '+');
            // Dice algorithm found here: https://stackoverflow.com/questions/52252114/dd-style-compound-dice-expression-regex
            let diceFound = reconstructedString.match(/[0-9][0-9]*d[0-9][0-9]*/g);
            if (diceFound?.length){
                let matchedSet = [];
                for (let x = 0; x < diceFound.length; x++){
                    let add = true;
                    for (let y = 0; y < diceFound.length; y++){
                        if (x !== y && !(diceFound[x] !== diceFound[y]) && diceFound[y].includes(diceFound[x])){
                            add = false;
                        }
                    }
                    if (add && !matchedSet.includes(diceFound[x])){
                        matchedSet.push(diceFound[x]);
                    }
                }
                for (let match of matchedSet){
                    reconstructedString = reconstructedString.replaceAll(match, `[[${ match }]]`);
                }
            }
            return reconstructedString;
        }

        function constructMacro(power, weapon, targets){
            let macro = `&{template:default} {{name=${power.Name}}}`;
            let attributes = ['Flavor','Power','Charge','Display','Channel Divinity','Power Type','Attack','Effect','Aftereffect','Axe','Mace','Heavy Blade','Spear or Polearm','Hit','Miss','Power Usage','Keywords','Action Type','Attack Type','Target','Targets','Requirement','Special','Weapon','Crit Description','Conditions'];
            let processForDice = ['Flavor','Power','Charge','Display','Channel Divinity','Power Type','Attack','Effect','Aftereffect','Axe','Mace','Heavy Blade','Spear or Polearm','Hit','Miss','Power Usage','Keywords','Action Type','Attack Type','Target','Targets','Requirement','Special','Weapon','Crit Description','Conditions'];
            for (let att of attributes){
                if (power?.[att]?.replaceAll(' ', '') || weapon?.[att]?.replaceAll(' ', '')){
                    if (processForDice.includes(att)){
                        macro += processDiceFormula(`{{${ att }=${ power[att] || weapon[att] }}}`);
                    }
                    else {
                        macro += `{{${ att }=${ power[att] || weapon[att] }}}`;
                    }
                }
            }
            if (power['Attack Bonus'] || weapon['Attack Bonus']){
                macro += `{{attack=[[1d20+${ power['Attack Bonus'] || weapon['Attack Bonus'] || 0 }]]}}`;
                for (let x = 1; x < targets; x++){
                    macro += `{{attack ${ x+1 }=[[1d20+${ power['Attack Bonus'] || weapon['Attack Bonus'] || 0 }]]}}`;
                }
            }
            macro += power?.Damage?.replaceAll(' ', '') || weapon?.Damage?.replaceAll(' ', '') ? `{{damage=[[${ power['Damage'] || weapon['Damage'] }]]}}` : '';
            macro += power?.['Crit Damage']?.replaceAll(' ', '') || weapon?.['Crit Damage']?.replaceAll(' ', '') ? `{{Crit Damage=[[${ power['Crit Damage'] || weapon['Crit Damage'] }]]}}` : '';
            return macro;
        }

        // Add macro constructor to the window context
        window.constructMacro = constructMacro;

        function buildPowerDropdown(powersConstruct){
            let pd = document.getElementById('powerDropdown');
            pd.innerHTML = '';
            for (let p of powersConstruct) {
                if (p?.Weapons?.length){
                    for (let w of p?.Weapons){
                        let option = document.createElement("option");
                        option.text = p.Name + ', Weapon: ' + w.Weapon;
                        option.value = p.Name + '||' + w.Weapon;
                        pd.appendChild(option);
                    }
                }
                else{
                    let option = document.createElement("option");
                    option.text = p.Name;
                    option.value = p.Name;
                    pd.appendChild(option);
                }
            }
        }

        function buildCharacter(characterObj){
            window.foundCharacter = characterObj;
            window.autoCheck = localStorage.getItem('powerBoxAutoCheck');
            document.getElementById('charBox').innerHTML = `
                <input id="charName" style="margin: 5px 5px 5px 5px; width: 74%" disabled value="Character: ${characterObj.name}" type="text">
                <input id="charLevel" style="margin: 5px 5px 5px 5px; width: 22%" disabled value="Level: ${characterObj.level}" type="text">
                <input type="checkbox" id="autoCheck" title="Automatically check off powers."/>
            `;
            document.getElementById("autoCheck").checked = window.autoCheck ? true : false;
            document.getElementById("autoCheck").addEventListener("click",function() {
                window.autoCheck = !window.autoCheck;
                localStorage.setItem('powerBoxAutoCheck', window.autoCheck);
            });
        }

        function parseForDice(detail){
            let reconstructedDetail = detail;
            return reconstructedDetail
        }

        // Check localStorage for an existing character
        let foundCharacter = localStorage.getItem('powerBox');

        if (foundCharacter){
            foundCharacter = JSON.parse(foundCharacter);
            buildCharacter(foundCharacter);
            window.powerObject = foundCharacter.powerObject;
            buildPowerDropdown(foundCharacter.powersConstruct);
        }

        window.dispatchEvent(new Event('resize'));

        // Add event listener to the file input
        fileInputElement.addEventListener('change', (event) => {
            var file = document.getElementById("uploadedFile").files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = function(){
                var parser = new DOMParser();
                var doc = parser.parseFromString(reader.result, "text/xml");
                let name = doc.getElementsByTagName('name')[0].innerHTML;
                let level = doc.getElementsByTagName('Level')[0].innerHTML;
                let experience = doc.getElementsByTagName('Experience')[0].innerHTML;
                let carriedMoney = doc.getElementsByTagName('CarriedMoney')[0].innerHTML;
                let storedMoney = doc.getElementsByTagName('StoredMoney')[0].innerHTML;

                // Construct stat mod array
                let statMods = {};
                let stats = ['Strength', 'Intelligence', 'Wisdom', 'Charisma', 'Constitution', 'Dexterity'];
                for (let stat of stats){
                    statMods[`${ stat } modifier`] = doc.querySelectorAll(`[name="${ stat } modifier"]`)[0].parentElement.getAttribute('value');
                }
                window.statMods = statMods;

                // Construct the power set
                let powers = doc.getElementsByTagName('Power');
                let powersConstruct = [];
                window.powerObject = {};
                for (let x = 0; x < powers.length; x++){
                    console.log(powers[x].getAttribute('name'));
                    let tempPower = {
                        Name: powers[x].getAttribute('name')
                    };
                    let specs = powers[x].getElementsByTagName('specific');
                    let weirdFields = ['Aftereffect', 'Axe', 'Mace', 'Heavy Blade', 'Spear or Polearm'];
                    for (let y = 0; y < specs.length; y++){
                        tempPower[specs[y].getAttribute('name')] = specs[y].innerHTML;
                    }
                    for (let field of weirdFields){
                        for (let y = 0; y < specs.length; y++){
                            if (specs[y].getAttribute('name').includes(field)){
                                tempPower[field] = specs[y].innerHTML;
                            }
                        }
                    }
                    let weapons = powers[x].getElementsByTagName('Weapon');
                    tempPower.Weapons = [];
                    tempPower.WeaponMap = {};

                    // Construct the weapon set for each power
                    for (let y = 0; y < weapons.length; y++){
                        let tempWeapon = {};
                        tempWeapon.Weapon = weapons[y].getAttribute('name');
                        tempWeapon['Attack Bonus'] = weapons[y].getElementsByTagName('AttackBonus')[0].innerHTML;
                        tempWeapon.Damage = weapons[y].getElementsByTagName('Damage')[0].innerHTML;
                        if (weapons[y].getElementsByTagName('CritDamage')?.length){
                            tempWeapon['Crit Damage'] = weapons[y].getElementsByTagName('CritDamage')[0].innerHTML;
                        }
                        else {
                            tempWeapon['Crit Damage'] = weapons[y].getElementsByTagName('Damage')[0].innerHTML.replace('d','*');
                        }
                        if (weapons[y].getElementsByTagName('Conditions')?.length){
                            tempWeapon.Conditions = weapons[y].getElementsByTagName('Conditions')[0].innerHTML;
                        }
                        if (weapons[y].getElementsByTagName('CritComponent')?.length){
                            tempWeapon['Crit Description'] = weapons[y].getElementsByTagName('CritComponent')[0].innerHTML;
                        }
                        tempPower.Weapons.push(tempWeapon);
                        tempPower.WeaponMap[tempWeapon.Weapon] = tempWeapon;
                    }
                    powersConstruct.push(tempPower);
                    window.powerObject[tempPower.Name] = tempPower;

                    // Add Charge power options
                    if (tempPower.Name === 'Melee Basic Attack' || tempPower.Name === 'Bull Rush Attack'){
                        let chargePower = Object.assign({}, tempPower);
                        chargePower.Name = `Charge (${ chargePower.Name })`;
                        chargePower.Flavor = `You throw yourself into the fight, dashing forward and launching an attack. ${ chargePower.Flavor }`;
                        chargePower.Charge = `Move your speed as part of the charge and make an attack at the end of your move. You gain a +1 bonus to the attack roll.`
                        chargePower.Weapons = [];
                        for (let wpn of tempPower.Weapons) {
                            let tmp = Object.assign({}, wpn);
                            tmp['Attack Bonus'] = tmp['Attack Bonus'] ? parseInt(tmp['Attack Bonus'])+1 : 1;
                            chargePower.Weapons.push(tmp);
                        }
                        powersConstruct.push(chargePower);
                        window.powerObject[chargePower.Name] = chargePower;
                    }
                }

                let magicItems = doc.querySelectorAll('LootTally > loot >RulesElement[type="Magic Item"]');
                if (magicItems?.length){
                    for (let item of magicItems){
                        let flavor = item.querySelector('Flavor');
                        let power = item.querySelector('specific[name="Power"]');
                        let tempPower = {
                            Name: item.getAttribute('name'),
                            Flavor: flavor?.innerHTML || '',
                            Power: power?.innerHTML || ''
                        };
                        if (tempPower?.Power){
                            powersConstruct.push(tempPower);
                            window.powerObject[tempPower.Name] = tempPower;
                        }
                    }
                }

                console.log(powersConstruct.length);

                //Create and append the options
                powersConstruct = powersConstruct.sort((p1, p2)=>{
                    if (p1.Name < p2.Name) {
                        return -1;
                    } else if (p2.Name < p1.Name) {
                        return 1;
                    }
                    return 0;
                });
                let characterObj = {
                    powersConstruct: powersConstruct,
                    powerObject: window.powerObject,
                    name,
                    carriedMoney,
                    storedMoney,
                    experience,
                    level,
                    statMods
                };
                window.foundCharacter = characterObj;
                buildCharacter(characterObj);
                buildPowerDropdown(powersConstruct);
                localStorage.setItem('powerBox', JSON.stringify(characterObj));
            };
        });
    }
    function timer (){
        if (document.getElementById('chatSendBtn')){
            onDOMLoad();
        }
        else{
            setTimeout(timer, 500);
        }
    }
    setTimeout(timer, 0);
})();
