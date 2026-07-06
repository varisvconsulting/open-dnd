var spell_data = []
var creature_data = []


async function loadSpellCsvOld() {
    //const csvUrl= `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv?&gid=0`;
    const SpellCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
            `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=7929475&_v=${Date.now()}`
        );
    const list = document.getElementById('spell-list');
    list.textContent = 'Loading…';
    try {
        const text = await fetch(SpellCsvUrl, {caches: 'no-store'}).then(r => r.text());
        const rows = await parseCSV(text);
        var _c = 0
        for (const row of rows) {
            var [magic_class='', spell_lvl='', spell_name='', spell_type='',spell_casting='', spell_components='',range='',duration='',effect_text='',higher_level='',passive='',upgrades='',creatures=''] = row;
            _c +=1;
            if (_c <= 1) { continue; } //cus the first few tabs arent part of the stuff

            spell_data.push([magic_class, spell_lvl, spell_name, spell_type, spell_casting, spell_components, range, duration, effect_text, higher_level, passive, upgrades,creatures]);    
        }
    } catch (e) {
        list.textContent = 'Sorry—could not load data.';
        console.log(e);
    }
}

async function loadSpellCsv() {
    
    const list = document.getElementById('spell-grid');
    list.textContent = 'Loading…';

    try {
        const rows = await loadCsvRows('7929475');
        var _c = 0
        for (const row of rows) {
            var [magic_class='', spell_lvl='', spell_name='', spell_type='',spell_casting='', spell_components='',range='',duration='',effect_text='',higher_level='',passive='',upgrades='',creatures=''] = row;
            _c +=1;
            if (_c <= 1) { continue; } //cus the first few tabs arent part of the stuff

            spell_data.push([magic_class, spell_lvl, spell_name, spell_type, spell_casting, spell_components, range, duration, effect_text, higher_level, passive, upgrades,creatures]);    
        }
    } catch (e) {
        list.textContent = 'Sorry—could not load data.';
        console.log(e);
    }
}

async function loadCreatureCsv(){
    const CreatureCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
            `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=421278889&_v=${Date.now()}`
        );
    try {
        var text = await fetch(csvUrl, {caches: 'no-store'}).then(r => r.text());
        var rows = await parseCSV(text);
        var _c = 0
        // console.log("total spells - " + rows.length);
        for (const row of rows) {
            var [name='', meta='', cr='', ac='',block='', hp='',speed='',str='',dex='',con='',int='',wis='',cha='',traits='',properties='',actions=''] = row;
            _c +=1;
                if (_c <= 1) { continue; } //cus the first few tabs arent part of the stuff

            creature_data[name] = { "name": name,
                                    "meta": meta, 
                                    "cr": cr,
                                    "ac": ac,
                                    "block": block, 
                                    "hp": hp,
                                    "speed": speed,
                                    "str": str,
                                    "dex": dex,
                                    "con": con,
                                    "int": int,
                                    "wis": wis,
                                    "cha":cha,
                                    "traits": traits,
                                    "properties": properties,
                                    "actions": actions};    
        }
    } catch (e) {
        console.log(e);
    }
}

function constructCreatureCard(name){
    name = name.trim()
    if (name in creature_data){
        var c = creature_data[name];

        var all_properties = c["properties"].split("|");
        var properties_text = "<ul>";
        for (i of all_properties){
            properties_text += `<li><strong>${i.split(":")[0]}:</strong> ${i.split(":")[1]}</li>`;
        }
        properties_text += "</ul>";

        var all_actions = c["actions"].split("|");
        var actions_text = "<ul>";
        for (i of all_actions){
            actions_text += `<li><strong>${i.split(":")[0]}:</strong> ${i.split(":")[1]}</li>`;
        }
        actions_text += "</ul>";

        var rez = `
        <div class="monster-card">
            <header class="monster-header">
                <link rel="stylesheet" href="monstercard.css">
                <h2>${capitalize(c["name"])}</h2>
                <span class="meta">${c["meta"]}</span>
            </header>
            
            <section class="stats-grid">
                <div class="stat">HP: ${c["hp"]}</div>
                <div class="stat">AC: ${c["ac"]}</div>
                <div class="stat">DEF: ${c["block"] ? `${c["block"]}` : `-` }</div>
                <div class="stat">STR: ${c["str"]}</div>
                <div class="stat">DEX: ${c["dex"]}</div>
                <div class="stat">CON: ${c["con"]}</div>
                <div class="stat">INT: ${c["int"]}</div>
                <div class="stat">WIS: ${c["wis"]}</div>
                <div class="stat">CHA: ${c["cha"]}</div>
            </section>
            speed: ${c["speed"]}
            ${c["traits"] ? `
            <section class="abilities">
                <h3>traits</h3>
                <p class="meta">${c["traits"]}</p>
            </section>
            ` : ''}
            ${c["properties"] ? `
            <section class="abilities">
                <h3>properties</h3>
                ${properties_text}
            </section>
            ` : ''}
            ${c["actions"] ? `
            <section class="abilities">
                <h3>actions</h3>
                ${actions_text}
            </section>
            ` : ''}
        </div>
        `;
        // console.log(rez);
        return rez;
    }
    console.log("failed to find referenced creature - " + name);
    console.log(creature_data);
    return "";
}

function fillSpellButtonList(type="all", lvl="all"){
    const list = document.getElementById('spell_tab_list');
    list.replaceChildren();

    for (const i of spell_data) {
        let [magic_class='', spell_lvl='', spell_name='', spell_type='',spell_casting='', spell_components='',range='', duration='',effect_text='',higher_level='',passive='',upgrades='',creatures=''] = i

        if (!((magic_class.includes(selector_class)) || (selector_class == "all"))) { console.log("ignoring button for class ", spell_name); continue;}
        if (!((spell_lvl.includes(selector_lvl)) || (selector_lvl == "all"))) { console.log("ignoring button for wrong lvl ", spell_name); continue;}

        let entry = document.createElement('button');
        entry.classList.add('entry');
        entry.dataset.name = spell_name
        item_card.dataset.spell_lvl = spell_lvl;
        item_card.dataset.magic_class = magic_class;
        entry.innerHTML = `
            <b>${spell_name}</b>
            <span>${spell_lvl}, ${magic_class}, ${spell_type}</span>
        `;
        list.appendChild(entry);
        entry.addEventListener('click', (e) => {
            // retain active for css
            
            fillSpellListMainCard(e.currentTarget.dataset.name);
            console.log("clicked ", e.currentTarget.dataset.name);
            console.log("clicked ", this.dataset.name);
            
        });
    }
}

function fillSpellCards(selector_class,selector_lvl) {
    const list = document.getElementById('spell-grid');
    if (list === null) {return}
    list.replaceChildren();
    // fillSpellButtonList();

    for (const i of spell_data) {
        var [magic_class='', spell_lvl='', spell_name='', spell_type='',spell_casting='', spell_components='',range='', duration='',effect_text='',higher_level='',passive='',upgrades='',creatures=''] = i
        
        var item_card = document.createElement('div');
        item_card.dataset.group = magic_class;
        item_card.dataset.spell_lvl = spell_lvl;
        item_card.classList = ["spell-card"];

        var creatureCardData = "";
        if (creatures){
            var cr = creatures.split(";");
            for (c of cr){
                creatureCardData += constructCreatureCard(c);
            }
        }
        
        if (!((magic_class.includes(selector_class)) || (selector_class == "all"))) { console.log("nah"); continue;}
        if (!((spell_lvl.includes(selector_lvl)) || (selector_lvl == "all"))) { console.log("no - " + selector_class + " " + selector_lvl); continue;}

        item_card.innerHTML = `
            <div class="spell-header">
                <h3>${escapeHtml(capitalize(spell_name))} </h3>
                <span class="spell-type"><i> - level ${spell_lvl}, ${escapeHtml(spell_type)}</i></span>
            </div>
            <div class="spell-mechanics">
                ${spell_casting ? `<p>Casting: <i>${spell_casting}</i></p>` : ``}
                ${spell_components ? `<p>Components: <i>${spell_components}</i></p>` : ``}
                ${range ? `<p>Range: <i>${range}</i></p>` : ``}
                ${duration ? `<p>Duration: <i>${duration}</i></p>` : ``}
            </div>
            <div class="spell-effect">
                <p><b>Effect:</b> ${makeNotationToHtml(effect_text)}</p>
                ${higher_level ? `<p><b>Upcast:</b> ${makeNotationToHtml(higher_level)}</p>` : ''}
                ${passive ? `<p><b>Passive:</b> ${makeNotationToHtml(passive)}</p>` : ''}
                ${upgrades ? `<p><b>Upgrades:</b> ${makeNotationToHtml(upgrades)}</p>` : ''}
            </div>
            
            ${creatures? creatureCardData : "" }
            `;
        // console.log("adding from " + selector_class + " - " + selector_lvl + ": " + spell_name + " - " + creatures);
        list.appendChild(item_card)
    }

    fillSpellButtonList(magic_class,selector_class);
    // buttons = document.querySelectorAll("#spell_tab_list button").forEach(b => {
        
    // });
}

function fillSpellListMainCard(s_name) {
    if (isEmptyValue(s_name)) {
        // todo
    } else {
        var target = null;
        for (const i of spell_data) {
            var [magic_class='', spell_lvl='', spell_name='', spell_type='',spell_casting='', spell_components='',range='', duration='',effect_text='',higher_level='',passive='',upgrades='',creatures=''] = i
            if (spell_name === s_name) {
                const holder = document.getElementById("spell_tab_list_card");
                holder.replaceChildren();
                var item_card = document.createElement('div');
                item_card.innerHTML = `
                    <div class="spell-header">
                        <h3>${escapeHtml(capitalize(spell_name))} </h3>
                        <span class="spell-type"><i> - level ${spell_lvl}, ${escapeHtml(spell_type)}</i></span>
                    </div>
                    <div class="spell-mechanics">
                        ${spell_casting ? `<p>Casting: <i>${spell_casting}</i></p>` : ``}
                        ${spell_components ? `<p>Components: <i>${spell_components}</i></p>` : ``}
                        ${range ? `<p>Range: <i>${range}</i></p>` : ``}
                        ${duration ? `<p>Duration: <i>${duration}</i></p>` : ``}
                    </div>
                    <div class="spell-effect">
                        <p><b>Effect:</b> ${makeNotationToHtml(effect_text)}</p>
                        ${higher_level ? `<p><b>Upcast:</b> ${makeNotationToHtml(higher_level)}</p>` : ''}
                        ${passive ? `<p><b>Passive:</b> ${makeNotationToHtml(passive)}</p>` : ''}
                        ${upgrades ? `<p><b>Upgrades:</b> ${makeNotationToHtml(upgrades)}</p>` : ''}
                    </div>
                    ${creatures? creatureCardData : "" }
                `;
                holder.appendChild(item_card);
                return;
            }
        }
    }
}

function capitalize(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}

function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

async function parseCSV(text) {
    var rows = text.split(/\r?\n/);
    var output = []
    for (const row of rows) {
        const row_data = []
        var field = ""
        var quoted = false
        // console.log(row)
        for (let i =0; i<row.length; i++) {
            var c = row[i];
            if (c == '"') { quoted = !quoted;}
            if ((c == ',') && (!quoted)) {
                field = field.replace(/\\"/g, '"');
                row_data.push(field);
                field = "";
                if ((i == row.length - 1)&&(c==",")){
                    row_data.push('');
                    break;
                }

            } 
            else {
                if ((c!="\\") && (c!="\"")){
                    field += c;
                }
                if (i == row.length-1) {
                    field = field.replace(/\\"/g, '"');
                    row_data.push(field);
                }
            }
        }
        // console.log(row_data);
        output.push(row_data);
    }
    return output;
}

function makeNotationToHtml(text) {
    var output = "";
    for (i in text) {
        var c = text[i];
        if (c == "|") {
            output += "<br>";
        }
        else if (c == "["){
            output += "<ul><li>";
        }
        else if (c == ";"){
            output += "</li><li>";
        }
        else if (c == "]"){
            output += "</li></ul>";
        }
        else {
            output += c;
        }
    }
    return output;
}

function getCleanCommasString(text) {
    var rez = ""
    var arr = text.split(",")
    var _c = 0
    for (a of arr) {
        if ((a) && (a != " ")) {
            if (_c>0) {rez += ", ";}
            rez += a;
            _c =  _c+1;
        }
    }
    return rez;
}

function setSpellsLayout(layout_t){
    console.log("grid/list btns pressed");
    if (layout_t === "grid"){
        // setVisibleByClass(".spell_tab_large_grid", true, "grid");
        setVisibleByClass(".spell_tab_large_list", false)
        setVisibleByClass(".spell_tab_large_grid", true, "grid");
        document.querySelector("#spell-opt-btn-list")?.classList.remove('active')
        document.querySelector("#spell-opt-btn-grid")?.classList.add('active')
    }

    if (layout_t === "list"){
        // setVisibleByClass(".spell_tab_large_grid", false);
        setVisibleByClass(".spell_tab_large_list", true, "grid");
        setVisibleByClass(".spell_tab_large_grid", false);
        document.querySelector("#spell-opt-btn-list")?.classList.add('active')
        document.querySelector("#spell-opt-btn-grid")?.classList.remove('active')
    }
}

function bindSpellButtons(){
    document.querySelector("#spell-opt-btn-grid")?.addEventListener('click', () => {setSpellsLayout("grid")});
    document.querySelector("#spell-opt-btn-list")?.addEventListener('click', () => {setSpellsLayout("list")});
}

async function initialSpellSetup() {
    var a = await loadSpellCsv();
    var b = await loadCreatureCsv();
    var c = await fillSpellCards("all","all");
    bindSpellButtons();
}