const SPREADSHEET_ID = '1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ';  // ← replace
const SHEET_GID      = '1';                         // ← tab number, usually 1

var weapon_data = [];
var armor_data = [];
var shield_data = [];

var WEAPON_CATEGORY_FILTER = "all";
var WEAPON_GROUP_FILTER = "all";


async function loadArmorCsv() {
    const ArmorCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
        `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=1007930722&_v=${Date.now()}`
    );
    const list = document.getElementById('armor-list');
    list.textContent = `Loading…`;

    try {
        const text = await fetch(ArmorCsvUrl, {caches: 'no-store'}).then(r => r.text());
        const rows = await parseCSV(text);
        let _c = 0;
        for (const row of rows) {
            var [a_name, a_type, a_ac, a_bulk, a_block, a_protection, a_damage_reduction, a_slow, a_stealth_disadvantage] = row;
            if (_c != 0) {
                armor_data.push([a_name, a_type, a_ac, a_bulk, a_block, a_protection, a_damage_reduction, a_slow, a_stealth_disadvantage]);
            } 
            _c += 1;
        }
    } catch(e) {
        console.log("failed to load armor data: ", e);
    }
}

async function loadShieldCsv() {
    const ArmorCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
        `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=1366718996&_v=${Date.now()}`
    );
    const list = document.getElementById('armor-list');
    list.textContent = `Loading…`;

    try {
        const text = await fetch(ArmorCsvUrl, {caches: 'no-store'}).then(r => r.text());
        const rows = await parseCSV(text);
        let _c = 0;
        for (const row of rows) {
            var [s_name, s_type, s_ac, s_bulk, s_block, s_actions, properties] = row;
            if (_c != 0) {
                shield_data.push([s_name, s_type, s_ac, s_bulk, s_block, s_actions, properties]);
            } 
            _c += 1;
        }
    } catch(e) {
        console.log("failed to load armor data: ", e);
    }
}

async function loadWeaponsCsv() {
        //const csvUrl= `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv?&gid=0`;
        const WeaponCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
             `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=0&_v=${Date.now()}`
           );
        const list = document.getElementById('weapons-list');
        list.textContent = 'Loading…';
    
    //Core type	weapon group	name	damage	general properties	misc properties	attack maneuvers	tactical maneuvers	crit properties	strategy
        try {
            const text = await fetch(WeaponCsvUrl, {caches: 'no-store'}).then(r => r.text());
            const rows = await parseCSV(text);
            var _c = 0
            for (const row of rows) {
                var [wpn_category='', wpn_group='', name='', damage='', general_prop='',misc_prop='',attack_man='',tactic_man='',crit_prop=''] = row;
                versatile_damage = '';
                _c +=1;
                if (_c <= 2) { continue; } //cus the first few tabs arent part of the stuff

                var general_prop_list = general_prop.split(',');
                for (prop of general_prop_list) {
                    if (prop.includes("two-handed")) {
                        misc_prop += ", two-handed"
                        general_prop = general_prop.replace("two-handed", "")
                    }
                    else if (prop.includes("light")) {
                        misc_prop += ", light"
                        general_prop = general_prop.replace("light", "")
                    }
                    else if (prop.includes("agile")) {
                        misc_prop += ", agile"
                        general_prop = general_prop.replace("agile", "")
                    }
                    else if (prop.includes("unwieldy")) {
                        misc_prop += ", unwieldy"
                        general_prop = general_prop.replace("unwieldy", "")
                    }
                    
                }

                general_prop = getCleanCommasString(general_prop);
                misc_prop = getCleanCommasString(misc_prop);
                weapon_data.push([wpn_category, wpn_group, name, damage, general_prop,misc_prop,attack_man,tactic_man,crit_prop])    
            }
        } catch (e) {
            list.textContent = 'Sorry—could not load data.';
            console.log(e)
        }
    }

function fillArmorCards(){
    const list = document.getElementById('armor-list');
    list.replaceChildren();
    for (const i of armor_data) {
        var [a_name, a_type, a_ac, a_bulk, a_block, a_protection, a_damage_reduction, a_slow, a_stealth_disadvantage] = i;
        var item_card = document.createElement('div');
        item_card.dataset.name = a_name;

        let card_class = "light";
        if (a_type === `medium`) {card_class = "medium"} else if (a_type ===`heavy`) {card_class = "heavy"}
        item_card.classList = [`armor-card armor-${String(card_class)}`];

        item_card.innerHTML = `
            <div class="armor-header">
                <div><h3>${escapeHtml(a_name)}</h3> <i>${a_type}<i></div>
                <span class="misc-prop">AC: ${a_ac}</span>
            </div>
            <div class="armor-card-content">
                <div>
                    <div>Block: ${(a_block) ? a_block:`0`} / ${a_protection ? `+${a_protection}` : "-"}</div>
                    <div>${a_damage_reduction ? `DR: ${a_damage_reduction}`:``}</div>
                </div>
                ${((a_damage_reduction) || (a_stealth_disadvantage)) ? `
                    <div>
                        ${(a_bulk) ? `<div>bulk: ${a_bulk}</div>`:``}
                        ${(a_slow) ? `<div>slow: ${a_slow}</div>`:``}
                        ${a_stealth_disadvantage ? '<div>Stealth disadvantage</div>':''}
                    </div>
                    `:``}
            </dib>
        `;
        list.appendChild(item_card);
    }
}

function fillShieldCards(){
    const list = document.getElementById('shield-list');
    list.replaceChildren();
    for (const i of shield_data) {
        var [s_name, s_type, s_ac, s_bulk, s_block, s_actions, properties] = i
        
        var item_card = document.createElement('div');
        item_card.classList = ["shield-row"];       
        item_card.innerHTML = `
            <div class="shield-header">
                <h3>${escapeHtml(s_name)}</h3>
                <span class="itm_type">${escapeHtml(type)}</span>
            </div>
                <span>AC: +${s_ac}</span>
                ${s_block ? `<span>Block: ${s_block}</span>`:``}
                ${s_bulk ? `<span>Bulk: ${s_bulk}</span>`:``}
                ${s_actions ? `<span>Actions: ${s_actions}</span>`:``}
                ${properties ? `<span>Properties: ${properties}</span>`:``}
            </div>`;
        list.appendChild(item_card);
    }
}

function fillWeaponCards(GroupOrCategory) {
    const list = document.getElementById('weapons-list');
    list.replaceChildren();
    console.log("populating - " + GroupOrCategory);
    for (const i of weapon_data) {
        var [wpn_category='', wpn_group='', name='', damage='', general_prop='',misc_prop='',attack_man='',tactic_man='',crit_prop=''] = i
        
        var item_card = document.createElement('div');
        item_card.dataset.group = wpn_group;
        item_card.classList = ["weapon-row"];
        
        if ((wpn_category.includes(GroupOrCategory)) || (wpn_group.includes(GroupOrCategory)) || (GroupOrCategory == "all")) {
            
            var versatile_damage = '';
            var versatile_attack_prop = '';
            if (attack_man.includes("/")) {
                versatile_attack_prop = attack_man.split("/")[1]
                attack_man = attack_man.split("/")[0];
            }
            var general_prop_list = general_prop.split(',');
            for (prop of general_prop_list) {
                // console.log(prop);
                if (prop.includes("versatile")) {
                    versatile_damage = prop;
                    general_prop = general_prop.replace(prop,"");
                    if (general_prop.startsWith(',')) { general_prop = general_prop.replace(',',"");}
                }
            }

            item_card.innerHTML = `
                <div class="weapon-header">
                    <h3>${escapeHtml(name)}</h3>
                    <span class="damage">${escapeHtml(damage)}${versatile_damage ? `<span class="versatile">/ ${versatile_damage}</span>` : ''}</span>
                </div>
                ${(misc_prop || versatile_attack_prop) ? 
                    `<div class="misc-props">
                        <div>${escapeHtml(misc_prop)}</div>
                        ${versatile_attack_prop ? `<span class="versatile"> / ${versatile_attack_prop}</span>` : ''} 
                    </div>` : ''}
                <div class="maneuvers-grid">
                    <div class="column"><h4>General</h4><p>${escapeHtml(general_prop || '-')}</p></div>
                    <div class="column"><h4>Attacks</h4><p>${escapeHtml(attack_man || '-')}</p></div>
                    <div class="column"><h4>Tactical</h4><p>${escapeHtml(tactic_man || '-')}</p></div>
                    <div class="column"><h4>Crit</h4><p>${escapeHtml(crit_prop|| '-')}</p></div>
                </div>`;
            console.log("adding from " + GroupOrCategory + " - " + name);
            list.appendChild(item_card);
        }
    }

}

function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

async function parseWeaponCSV(text) {
    var rows = text.split(/\r?\n/);
    var output = []
    for (const row of rows) {
        const row_data = []
        var field = ""
        var quoted = false
        // console.log(row)
        for (const c of row) {
            if (c == '"') { quoted = !quoted;}
            if ((c == ',') && (!quoted)) {
                field = field.replace(/\\"/g, '"');
                row_data.push(field);
                field = "";
            } else {
                if ((c!="\\") && (c!="\"")){
                    field += c;
                }
            }
        }
        console.log(row_data)
        output.push(row_data);
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

function updateWeaponGroupFilter(){
    let wpn_g_filter = document.querySelector("[data-weapon-group-filter]");
    wpn_g_filter.replaceChildren();
    const wpn_groups_simple = ["daggers & knives","simple polearms","light arms","medium arms","heavy arms","simple bows","simple crossbows","thrown & other"];
    const wpn_groups_martial = ["axes","hammers & cudgels", "martial polearms", "light blades", "medium blades", "heavy blades", "segmented arms", "fist weapons", "light bows", "heavy bows", "martial crossbows"];

    let finalList = ["all"];
    if ((WEAPON_CATEGORY_FILTER === "all") || (WEAPON_CATEGORY_FILTER === "simple")) {
        finalList = [...finalList, ...wpn_groups_simple];
    }

    if ((WEAPON_CATEGORY_FILTER === "all") || (WEAPON_CATEGORY_FILTER === "martial")) {
        finalList = [...finalList, ...wpn_groups_martial];
    }

    finalList.forEach(item => {
        console.log(item)
        const f_option = document.createElement("option");
        f_option.value = item
        f_option.textContent = item;
        wpn_g_filter.appendChild(f_option);
    });


}


function bindItemButtons(){
    document.querySelectorAll("[data-weapon-category-filter]").forEach((select) => select.addEventListener('change', () => { 
        WEAPON_CATEGORY_FILTER = select.value;
        updateWeaponGroupFilter();
        fillWeaponCards(WEAPON_CATEGORY_FILTER);
    }));

    document.querySelectorAll("[data-weapon-group-filter]").forEach((select) => select.addEventListener('change', () => { 
        WEAPON_GROUP_FILTER = select.value.toLowerCase().trim();
        fillWeaponCards(WEAPON_GROUP_FILTER);
    }));

    document.querySelectorAll(".items_tab_button").forEach((btn) => {
        btn.addEventListener('click', () => {
            console.log("clicked ", btn.textContent);
            const category = btn.textContent.toLowerCase().trim();

            if (category === "weapons") {
                setVisibleByClass(".weapons-list", true, "grid");
                setVisibleByClass(".armor-list", false);
                setVisibleByClass(".weapon_tab_buttons", true, "flex");
            }
            else if (category === "armor") {
                setVisibleByClass(".weapons-list", false);
                setVisibleByClass(".armor-list", true, "grid");
                setVisibleByClass(".weapon_tab_buttons", false);
            }

            else if (category === "shields") {
                setVisibleByClass(".weapons-list", false);
                setVisibleByClass(".armor-list", false);
                setVisibleByClass(".weapon_tab_buttons", false);
                setVisibleByClass(".shield-list", "grid")
            }

            document.querySelectorAll(".items_tab_button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

async function initialItemsSetup() {
    var a = await loadWeaponsCsv();
    var b = await fillWeaponCards("all");
    var c = await loadArmorCsv();
    var d = await fillArmorCards();
    var e = await fillShieldCards();
    bindItemButtons();

    document.querySelectorAll('.weapon_tab_buttons .tab_button').forEach(btn => {
        btn.addEventListener('click', () => {
            // retain active for css
            document.querySelectorAll('.weapon_tab_buttons .tab_button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            let _cat = btn.textContent;
            if (_cat === "all"){
                setVisibleByClass('.wt_simple', true, 'flex');
                setVisibleByClass('.wt_martial', true, 'flex');
            }
            
            if (_cat === "simple") {
                setVisibleByClass('.wt_simple', true, 'flex');
                setVisibleByClass('.wt_martial', false);
            }
            
            if (_cat === "martial") {
                setVisibleByClass('.wt_simple', false);
                setVisibleByClass('.wt_martial', true, 'flex');
            } 

            var c = fillWeaponCards(btn.textContent);
            

        });
    });

    console.log(a," ",b);
}