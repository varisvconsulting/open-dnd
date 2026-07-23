var CHAR_CLASS_DATA = {
    core_classes: [],
    class_data: {}
}


async function loadCharClassCSV(){
    const CharClassCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
        `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=308079445&_v=${Date.now()}`
    );
    const list = document.getElementById('char_class_display');

    try {
        const text = await fetch(CharClassCsvUrl, {caches: 'no-store'}).then(r => r.text());
        console.log(text);
        const rows = await parseClassCSV(text);

        let char_class_menu_panel = document.getElementById("char_class_display");
        char_class_menu_panel.replaceChildren(); 
        let class_btn_list = document.getElementById("class_tab_buttons");

        let _c = 0;
        for (const row of rows) {
            var [class_name, archetype, lvl, s_name, s_description] = row;
            if (_c != 0) {
                if (!CHAR_CLASS_DATA.core_classes.includes(class_name)) {
                    console.log("ADDING NEW CLASS DATA: ", class_name);
                    CHAR_CLASS_DATA.core_classes.push(class_name);
                    CHAR_CLASS_DATA.class_data[class_name] = {
                        archetypes: {},
                        archetype_abilities: {},
                        abilities: [],

                    };

                    //make class menu tab button for class
                    let c_btn = document.createElement("button");
                    c_btn.className = "tab_button class_tab_button";
                    c_btn.innerHTML=class_name;
                    class_btn_list.appendChild(c_btn);

                    // make panel for class
                    let c_panel = document.createElement("div");
                    c_panel.id = `char_class_${class_name}`; 
                    c_panel.className = "char_class_panel";
                    c_panel.style.display = "none"; 
                    char_class_menu_panel.appendChild(c_panel);

                    c_btn.addEventListener("click", () => {
                        // Remove active from all buttons
                        document.querySelectorAll(".class_tab_button").forEach(btn => {
                            btn.classList.remove("active");
                        });

                        // Activate this button
                        c_btn.classList.add("active");

                        // Hide all panels
                        document.querySelectorAll(".char_class_panel").forEach(panel => {
                            panel.style.display = "none";
                        });

                        // Show this panel
                        c_panel.style.display = "block";
                    });
                }

                let lvlboxName = `class_${class_name}_lvl_${lvl}`;
                let lvlbox = document.getElementById(lvlboxName);
                if (!lvlbox) {
                    lvlbox = document.createElement("div");
                    lvlbox.id = lvlboxName;
                    class_panel.appendChild(lvlbox);
                }
    
                if (archetype) {
                    
                    const archName = archetype.trim();
                    let a_lvl = lvl;
                    if (!CHAR_CLASS_DATA.class_data[class_name].archetypes.hasOwnProperty(archName)) {
                        CHAR_CLASS_DATA.class_data[class_name].archetypes[archName] = lvl;
                    } else {
                        a_lvl = CHAR_CLASS_DATA.class_data[class_name].archetypes[archName];
                    }
                    const archLvlPanelName = `char_class_${class_name}_${a_lvl}`;
                    const archPanelName = `archetype_panel_${archetype}`;
                    const archLvLPanelButtonlistName = `char_class_${class_name}_${a_lvl}_buttons`;
                    const archSelectButtonName = `archetype_${archetype}_button`;

                    const allArchNameHTMLClass = `${class_name}_arch_ability`;
                    const archNameHTMLClass = `${class_name}_arch_${archName}`;
                    
                    let class_arch_lvl_buttonlist = document.getElementById(archLvLPanelButtonlistName);
                    let arch_button = document.getElementById(archSelectButtonName);

                    if (!class_arch_lvl_buttonlist) {
                        class_arch_lvl_buttonlist = document.createElement("div");
                        class_arch_lvl_buttonlist.id = archLvLPanelButtonlistName;
                        class_arch_lvl_buttonlist.className = "archetype_buttons";
                        lvlbox.appendChild(class_arch_lvl_buttonlist);
                    }

                    if (!arch_button) {
                        arch_button = document.createElement("button");
                        arch_button.id = archSelectButtonName;
                        arch_button.classList.add(`arch_${class_name}_${a_lvl}_btn`);
                        arch_button.classList.add(`tab_button`);
                        class_arch_lvl_buttonlist.appendChild(arch_button);
                        arch_button.textContent = archName;
                        arch_button.addEventListener('click', () => {
                            // Remove active from all archetype buttons in this level
                            
                            document.querySelectorAll(`.arch_${class_name}_${a_lvl}_btn`).forEach(btn => {
                                btn.classList.remove("active");
                            });
                            arch_button.classList.add("active");
                            setVisibleByClass(`.${allArchNameHTMLClass}`,false);

                            // Show this one
                            setVisibleByClass(`.${archNameHTMLClass}`, true, "block");
                        });
                    }

                    let c_panel = document.createElement("div");
                    c_panel.id = `char_class_ability_box`;
                    c_panel.classList.add(archNameHTMLClass);
                    c_panel.classList.add(allArchNameHTMLClass)
                    c_panel.innerHTML =`
                        <div class="class_ability_name"><h3>${s_name}</h3></div>
                        <div class="class_ability_desc">${makeNotationToHtml(s_description)}</div>
                    `
                    lvlbox.appendChild(c_panel);
                    if (!CHAR_CLASS_DATA.class_data[class_name].archetype_abilities.hasOwnProperty(archName)){
                        CHAR_CLASS_DATA.class_data[class_name].archetype_abilities[archName]=[]
                    }
                    CHAR_CLASS_DATA.class_data[class_name].archetype_abilities[archName].push({
                        level: lvl,
                        name: s_name,
                        description: s_description  
                    });
                }
                else
                {
                    let char_class_panel = document.getElementById(`char_class_${class_name}`);
                    CHAR_CLASS_DATA.class_data[class_name].abilities.push({
                        level: lvl,
                        name: s_name,
                        description: s_description
                    });

                    let c_panel = document.createElement("div");
                    c_panel.id = `char_class_ability_box`;
                    c_panel.innerHTML =`
                        <div class="class_ability_name"><h3>${s_name}</h3></div>
                        <div class="class_ability_desc">${makeNotationToHtml(s_description)}</div>
                    `
                    char_class_panel.appendChild(c_panel);
                }
            }
            _c += 1;
        }
    } catch(e) {
        console.log("failed to load char class data: ", e);
    }

    console.log(CHAR_CLASS_DATA);
}

function makeClassBaseline(className) {
    let class_panel = document.getElementById(className);
    if (!class_panel) {
        let char_class_menu_panel = document.getElementById("char_class_display");

        let c_panel = document.createElement("div");
        c_panel.id = `char_class_${class_name}`; 
        c_panel.className = "char_class_panel";
        c_panel.style.display = "none"; 
        char_class_menu_panel.appendChild(c_panel);
    }
}

function parseClassCSV(text) {
    const rows = text.trim().split(/\r?\n/);
    const output = [];

    for (const row of rows) {
        if (!row.trim()) continue; // skip empty lines

        const row_data = [];
        let field = "";
        let quoted = false;
        let i = 0;

        while (i < row.length) {
            const c = row[i];

            if (c === '"') {
                quoted = !quoted;
                i++;
                continue;
            }

            if (c === ',' && !quoted) {
                // end of field
                row_data.push(field);
                field = "";
            } else {
                field += c;
            }

            i++;
        }
        row_data.push(field);
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

async function initialCharClassSetup(){
    var a = await loadCharClassCSV();
}