const SPREADSHEET_ID = '1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ';  // ← replace
const SHEET_GID      = '1';                         // ← tab number, usually 1

var weapon_data = []

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

function bindItemButtons(){
    document.querySelector("[data-filter]").forEach((select) => select.addEventListener('change', () => { 
        console.log("got pressed filter: ", select);
    }));
}

async function initialWeaponsSetup() {
    var a = await loadWeaponsCsv();
    var b = await fillWeaponCards("all");
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