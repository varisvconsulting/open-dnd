var spell_data = [];
var creature_data = [];

var spell_tab_display_mode = 0; // 0 is list, 1 is grid
var spell_selector_class = "all";
var spell_selector_lvl = "all";

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
        spell_data = spell_data.sort((a, b) => {
            // First sort by level
            if (a[1] !== b[1]) {
                return a[1] - b[1];
            }
            // If level is same, sort by name
            return a[2].localeCompare(b[2]);
        });
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
        var text = await fetch(CreatureCsvUrl, {caches: 'no-store'}).then(r => r.text());
        var rows = await parseCSV(text);
        var _c = 0
        console.log("total creatures - " + rows.length);
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
                                    "cha": cha,
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
    const spellSearch = document.getElementById('spell-search-input').value;

    for (const i of spell_data) {
        let [magic_class='', spell_lvl='', spell_name='', spell_type='',spell_casting='', spell_components='',range='', duration='',effect_text='',higher_level='',passive='',upgrades='',creatures=''] = i

        if (!((magic_class.includes(spell_selector_class)) || (spell_selector_class == "all"))) { /*console.log("ignoring button for class ", spell_name);*/ continue;}
        if (!((spell_lvl.includes(spell_selector_lvl)) || (spell_selector_lvl == "all"))) { /*console.log("ignoring button for wrong lvl ", spell_name);*/ continue;}

        if (spellSearch != "") {
            let matchesSearch = false;
            for (val of i){
                if (String(val).toLowerCase().trim().includes(spellSearch.toLowerCase().trim())){
                    matchesSearch = true;
                    // console.log("match found at ", spell_name, " at ", val);
                    break;
                }
            }

            if (!matchesSearch) { continue; }
        }
        


        let entry = document.createElement('button');
        entry.classList.add('entry');
        entry.dataset.name = spell_name
        entry.dataset.spell_lvl = spell_lvl;
        entry.dataset.magic_class = magic_class;
        entry.innerHTML = `
            <b>${spell_name}</b>
            <span>${spell_lvl}, ${magic_class}, ${spell_type}</span>
        `;
        list.appendChild(entry);
        entry.addEventListener('click', (e) => {
            // retain active for css
            
            fillSpellListMainCard(e.currentTarget.dataset.name);
            console.log("clicked ", e.currentTarget.dataset.name);
            
        });
    }

}

function updateSpellCards() {
    console.log("update spells called");

    const searchInput = document.getElementById('spell-search-input').value.toLowerCase().trim();

    for (const i of spell_data) {
        // Get the spell card from the END of the array (safest)
        const spell_card = i[i.length - 1];

        if (!(spell_card instanceof HTMLElement)) {
            console.log("spell card data not present");
            continue;
        }

        const [magic_class = '', spell_lvl = '', spell_name = ''] = i;

        // Filtering logic
        if (!((magic_class.includes(spell_selector_class)) || (spell_selector_class == "all"))) {
            spell_card.style.display = "none";
            continue;
        }

        if (!((spell_lvl.includes(spell_selector_lvl)) || (spell_selector_lvl == "all"))) {
            spell_card.style.display = "none";
            continue;
        }

        // Search filter
        if (searchInput !== "") {
            let matchesSearch = false;
            for (const val of i) {
                if (String(val).toLowerCase().includes(searchInput)) {
                    matchesSearch = true;
                    break;
                }
            }

            if (!matchesSearch) {
                spell_card.style.display = "none";
                continue;
            }
        }

        spell_card.style.display = "block";
    }
}

function updateSpellCardsOld(){
    console.log("update spells called");
    for (const i of spell_data) {
        const spell_card = i[i.length - 1];
        if (spell_card){
            if (!((magic_class.includes(spell_selector_class)) || (spell_selector_class == "all"))) { continue;}
            if (!((spell_lvl.includes(spell_selector_lvl)) || (spell_selector_lvl == "all"))) { continue;}

            const spellSearch = document.getElementById('spell-search-input').value;
            if (spellSearch != "") {
                let matchesSearch = false;
                for (val of i){
                    if (String(val).toLowerCase().trim().includes(spellSearch.toLowerCase().trim())){
                        matchesSearch = true;
                        break;
                    }
                }

                if (!matchesSearch) { 
                    spell_card.style.display = "none";
                    continue; 
                }
            }
            spell_card.style.display = "block";

        }
        else {
            console.log("spell card data not present");
        }
    }
}

function fillSpellCards(selector_class = "",selector_lvl = "") {
    const list = document.getElementById('spell-grid');
    if (list === null) {return}
    list.replaceChildren();

    if (selector_class === "") {selector_class = spell_selector_class;}
    if (selector_lvl === "") {selector_lvl = spell_selector_lvl}

    for (const i of spell_data) {
        var [magic_class='', spell_lvl='', spell_name='', spell_type='',spell_casting='', spell_components='',range='', duration='',effect_text='',higher_level='',passive='',upgrades='',creatures=''] = i
        
        var item_card = genSpellCard(spell_name);

        if (item_card != null) {
            item_card.dataset.group = magic_class;
            item_card.dataset.spell_lvl = spell_lvl;
            item_card.classList = ["spell-card"];
            list.appendChild(item_card);
            i.push(item_card);
        }
    }

    fillSpellButtonList(magic_class,selector_class);
    // buttons = document.querySelectorAll("#spell_tab_list button").forEach(b => {
        
    // });
}

function initMobileSpellDetails() {
    const container = document.querySelector('.spell_tab_large_list');
    if (!container) return;

    // Click handler for spell list items
    const spellList = document.getElementById('spell_tab_list');
    if (spellList) {
        spellList.addEventListener('click', function(e) {
            const entry = e.target.closest('.entry');
            if (entry) {
                fillSpellListMainCard(entry.dataset.name);
                container.classList.add('details-open');
            }
        });
    }

    // Back button handler (delegated)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('mobile-back-btn')) {
            container.classList.remove('details-open');
        }
    });
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
                var item_card = genSpellCard(spell_name);
                holder.appendChild(item_card);

                const cardHolder = document.getElementById("spell_tab_list_card");
                if (!cardHolder) return;

                // Add back button for mobile
                
                let backBtn = cardHolder.querySelector('.mobile-back-btn');
                if (!backBtn) {
                    backBtn = document.createElement('button');
                    backBtn.className = 'mobile-back-btn';
                    backBtn.innerHTML = '← Back to List';
                    backBtn.style.cssText = `
                        background: #477765;
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 999px;
                        margin-bottom: 15px;
                        font-size: 1rem;
                        cursor: pointer;
                    `;
                    cardHolder.prepend(backBtn);
                }
                return;
            }
        }
    }
}

function genSpellCard(s_name) {
     if (isEmptyValue(s_name)) {
        return null
    } else {
        var target = null;
        for (const i of spell_data) {
            var [magic_class='', spell_lvl='', spell_name='', spell_type='',spell_casting='', spell_components='',range='', duration='',effect_text='',higher_level='',passive='',upgrades='',creatures=''] = i
            if (spell_name === s_name) {
                var item_card = document.createElement('div');
                var creatureCardData = "";
                if (creatures){
                    var cr = creatures.split(";");
                    for (c of cr){
                        creatureCardData += constructCreatureCard(c);
                    }
                }
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
                
                return item_card
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
        spell_tab_display_mode = 1 // 0 is list, 1 is grid
        setVisibleByClass(".spell_tab_large_list", false)
        setVisibleByClass(".spell_tab_large_grid", true, "grid");
        document.querySelector("#spell-opt-btn-list")?.classList.remove('active')
        document.querySelector("#spell-opt-btn-grid")?.classList.add('active')
    }

    if (layout_t === "list"){
        spell_tab_display_mode = 0 // 0 is list, 1 is grid
        setVisibleByClass(".spell_tab_large_list", true, "grid");
        setVisibleByClass(".spell_tab_large_grid", false);
        document.querySelector("#spell-opt-btn-list")?.classList.add('active')
        document.querySelector("#spell-opt-btn-grid")?.classList.remove('active')
    }
}

function bindSpellButtons(){
    document.querySelector("#spell-opt-btn-grid")?.addEventListener('click', () => {setSpellsLayout("grid");});
    document.querySelector("#spell-opt-btn-list")?.addEventListener('click', () => {setSpellsLayout("list");});
    document.getElementById('spell-search-input').addEventListener('input', () => {updateSpellCards(spell_selector_class, spell_selector_lvl); fillSpellButtonList();});

    document.querySelectorAll('.spell_tab_buttons .category').forEach(btn => {
        btn.addEventListener('click', () => {
            spell_selector_class = btn.textContent;
            updateSpellCards();
            console.log("selector pressed");
            document.querySelectorAll('.spell_tab_buttons .category').forEach(button => {
                if (button.textContent.trim() === spell_selector_class) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
        });
    });

    document.querySelectorAll('.spell_tab_buttons .level').forEach(btn => {
        btn.addEventListener('click', () => {
            let selector_lvl = 0;
            if (btn.textContent == "cantrips") {selector_lvl = 0}
            else {
                selector_lvl = btn.textContent;
            }
            spell_selector_lvl = selector_lvl
            updateSpellCards();
            console.log("selector pressed");

            document.querySelectorAll('.spell_tab_buttons .level').forEach(button => {
                if ((button.textContent.trim() === spell_selector_lvl) || ((button.textContent == "cantrips") && (spell_selector_lvl == "0"))) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
        });
    });

    // let searchInput = document.getElementById('spell-search-input');
    // searchInput.addEventListener('input', () => {
    //     const query = searchInput.value;
    //     console.log('Current input:', query);
        
    //     // You can call your search function here
    //     // yourSearchFunction(query);
    // });
}

async function initialSpellSetup() {
    var a = await loadSpellCsv();
    var b = await loadCreatureCsv();
    var c = await fillSpellCards("all","all");
    initMobileSpellDetails();
    bindSpellButtons();
    fillSpellListMainCard(spell_data[0][2]); //#corresponds to name. gotta clean it up;
}