var CHAR_CLASS_DATA = {
    core_classes: [],
    class_data: {}
}


// async function loadCharClassCSV(){
//     const CharClassCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
//         `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=308079445&_v=${Date.now()}`
//     );
//     const list = document.getElementById('char_class_display');

//     try {
//         const text = await fetch(CharClassCsvUrl, {caches: 'no-store'}).then(r => r.text());
//         console.log(text);
//         const rows = await parseClassCSV(text);

//         let char_class_menu_panel = document.getElementById("char_class_display");
//         char_class_menu_panel.replaceChildren(); 
//         let class_btn_list = document.getElementById("class_tab_buttons");

//         let _c = 0;
//         for (const row of rows) {
//             var [class_name, archetype, lvl, s_name, s_description] = row;
//             if (_c != 0) {
//                 if (!CHAR_CLASS_DATA.core_classes.includes(class_name)) {
//                     console.log("ADDING NEW CLASS DATA: ", class_name);
//                     CHAR_CLASS_DATA.core_classes.push(class_name);
//                     CHAR_CLASS_DATA.class_data[class_name] = [];

//                     //make class menu tab button for class
//                     let c_btn = document.createElement("button");
//                     c_btn.className = "tab_button class_tab_button";
//                     c_btn.innerHTML=class_name;
//                     class_btn_list.appendChild(c_btn);

//                     // make panel for class
//                     let c_panel = document.createElement("div");
//                     c_panel.id = `char_class_${class_name}`; 
//                     c_panel.className = "char_class_panel";
//                     c_panel.style.display = "none"; 
//                     char_class_menu_panel.appendChild(c_panel)

//                     c_btn.addEventListener("click", () => {
//                         // Remove active from all buttons
//                         document.querySelectorAll(".class_tab_button").forEach(btn => {
//                             btn.classList.remove("active");
//                         });

//                         // Activate this button
//                         c_btn.classList.add("active");

//                         // Hide all panels
//                         document.querySelectorAll(".char_class_panel").forEach(panel => {
//                             panel.style.display = "none";
//                         });

//                         // Show this panel
//                         c_panel.style.display = "block";
//                     });
//                 }
    
//                 if (archetype) {
//                     const archName = archetype.trim();

//                     // Track this archetype
//                     classArchetypes.get(class_name).add(archName);

//                     // Add to data model if you want
//                     if (!CHAR_CLASS_DATA.class_data[class_name].some(a => a.archetype === archName)) {
//                         CHAR_CLASS_DATA.class_data[class_name].push({ archetype: archName, abilities: [] });
//                     }

//                     // Create archetype tab container (once)
//                     let tabsContainer = classPanel.querySelector('.archetype-tabs');
//                     if (!tabsContainer) {
//                         tabsContainer = document.createElement('div');
//                         tabsContainer.className = 'archetype-tabs';
//                         tabsContainer.innerHTML = `<h2>Archetypes</h2>`;
//                         classPanel.appendChild(tabsContainer);
//                     }

//                     // Create archetype content panel (once)
//                     let contentId = `arch_${class_name}_${archName}`;
//                     let archContent = document.getElementById(contentId);
//                     if (!archContent) {
//                         archContent = document.createElement('div');
//                         archContent.id = contentId;
//                         archContent.className = 'archetype-content';
//                         archContent.style.display = 'none';
//                         classPanel.appendChild(archContent);
//                     }

//                     // Add ability box
//                     const box = createAbilityBox(s_name, s_description);
//                     archContent.appendChild(box);

//                     // Create tab button (once)
//                     if (!tabsContainer.querySelector(`[data-arch="${archName}"]`)) {
//                         const tabBtn = document.createElement('button');
//                         tabBtn.className = 'arch-tab';
//                         tabBtn.textContent = archName;
//                         tabBtn.dataset.arch = archName;
//                         tabsContainer.appendChild(tabBtn);

//                         tabBtn.addEventListener('click', () => {
//                             // Deactivate all tabs in this panel
//                             tabsContainer.querySelectorAll('.arch-tab').forEach(b => b.classList.remove('active'));
//                             tabBtn.classList.add('active');

//                             // Hide all archetype contents in this panel
//                             classPanel.querySelectorAll('.archetype-content').forEach(c => c.style.display = 'none');

//                             // Show this one
//                             archContent.style.display = 'block';
//                         });
//                     }
//                 }
//                 else
//                 {
//                     let char_class_panel = document.getElementById(`char_class_${class_name}`);
//                     CHAR_CLASS_DATA.class_data[class_name].push({
//                         level: lvl,
//                         name: s_name,
//                         description: s_description
//                     })

//                     let c_panel = document.createElement("div");
//                     c_panel.id = `char_class_ability_box`;
//                     c_panel.innerHTML =`
//                         <div class="class_ability_name"><h3>${s_name}</h3></div>
//                         <div class="class_ability_desc">${makeNotationToHtml(s_description)}</div>
//                     `
//                     char_class_panel.appendChild(c_panel);
//                 }
//             }
//             _c += 1;
//         }
//     } catch(e) {
//         console.log("failed to load char class data: ", e);
//     }

//     console.log(CHAR_CLASS_DATA);
// }

async function loadCharClassCSV() {
    const CharClassCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
        `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=308079445&_v=${Date.now()}`
    );

    try {
        const text = await fetch(CharClassCsvUrl, { cache: 'no-store' }).then(r => r.text());
        const rows = await parseClassCSV(text);

        const classBtnList = document.getElementById("class_tab_buttons");
        const mainPanelsContainer = document.getElementById("char_class_display");

        mainPanelsContainer.replaceChildren();

        // Track data per class
        const classArchetypes = new Map(); // className → Set of archetype names

        let _c = 0;
        for (const row of rows) {
            if (_c === 0) { _c++; continue; } // skip header

            const [class_name, archetype, lvl, s_name, s_description] = row;

            if (!class_name) continue;

            // === 1. Ensure class exists (button + main panel) ===
            if (!CHAR_CLASS_DATA.core_classes.includes(class_name)) {
                CHAR_CLASS_DATA.core_classes.push(class_name);
                CHAR_CLASS_DATA.class_data[class_name] = [];

                // Class tab button
                const c_btn = document.createElement("button");
                c_btn.className = "tab_button class_tab_button";
                c_btn.textContent = class_name;
                classBtnList.appendChild(c_btn);

                // Main class panel
                const c_panel = document.createElement("div");
                c_panel.id = `char_class_${class_name}`;
                c_panel.className = "char_class_panel";
                c_panel.style.display = "none";
                mainPanelsContainer.appendChild(c_panel);

                // Click handler for class tab
                c_btn.addEventListener("click", () => {
                    document.querySelectorAll(".class_tab_button").forEach(b => b.classList.remove("active"));
                    c_btn.classList.add("active");

                    document.querySelectorAll(".char_class_panel").forEach(p => p.style.display = "none");
                    c_panel.style.display = "block";
                });

                classArchetypes.set(class_name, new Set());
            }

            const classPanel = document.getElementById(`char_class_${class_name}`);

            // === 2. Base ability (no archetype) ===
            if (!archetype || archetype.trim() === "") {
                CHAR_CLASS_DATA.class_data[class_name].push({
                    level: lvl,
                    name: s_name,
                    description: s_description,
                    isBase: true
                });

                const box = createAbilityBox(s_name, s_description);
                // Optionally wrap all base abilities in a container
                let baseContainer = classPanel.querySelector('.base-abilities');
                if (!baseContainer) {
                    baseContainer = document.createElement('div');
                    baseContainer.className = 'base-abilities';
                    baseContainer.innerHTML = `<h2>Base Class Abilities</h2>`;
                    classPanel.appendChild(baseContainer);
                }
                baseContainer.appendChild(box);

            // === 3. Archetype ability ===
            } else {
                const archName = archetype.trim();

                // Track this archetype
                classArchetypes.get(class_name).add(archName);

                // Add to data model if you want
                if (!CHAR_CLASS_DATA.class_data[class_name].some(a => a.archetype === archName)) {
                    CHAR_CLASS_DATA.class_data[class_name].push({ archetype: archName, abilities: [] });
                }

                // Create archetype tab container (once)
                let tabsContainer = classPanel.querySelector('.archetype-tabs');
                if (!tabsContainer) {
                    tabsContainer = document.createElement('div');
                    tabsContainer.className = 'archetype-tabs';
                    tabsContainer.innerHTML = `<h2>Archetypes</h2>`;
                    classPanel.appendChild(tabsContainer);
                }

                // Create archetype content panel (once)
                let contentId = `arch_${class_name}_${archName}`;
                let archContent = document.getElementById(contentId);
                if (!archContent) {
                    archContent = document.createElement('div');
                    archContent.id = contentId;
                    archContent.className = 'archetype-content';
                    archContent.style.display = 'none';
                    classPanel.appendChild(archContent);
                }

                // Add ability box
                const box = createAbilityBox(s_name, s_description);
                archContent.appendChild(box);

                // Create tab button (once)
                if (!tabsContainer.querySelector(`[data-arch="${archName}"]`)) {
                    const tabBtn = document.createElement('button');
                    tabBtn.className = 'arch-tab';
                    tabBtn.textContent = archName;
                    tabBtn.dataset.arch = archName;
                    tabsContainer.appendChild(tabBtn);

                    tabBtn.addEventListener('click', () => {
                        // Deactivate all tabs in this panel
                        tabsContainer.querySelectorAll('.arch-tab').forEach(b => b.classList.remove('active'));
                        tabBtn.classList.add('active');

                        // Hide all archetype contents in this panel
                        classPanel.querySelectorAll('.archetype-content').forEach(c => c.style.display = 'none');

                        // Show this one
                        archContent.style.display = 'block';
                    });
                }
            }

            _c++;
        }

        // Optional: Activate first archetype tab for each class
        document.querySelectorAll('.char_class_panel').forEach(panel => {
            const firstTab = panel.querySelector('.arch-tab');
            if (firstTab) firstTab.click();
        });

        console.log("CHAR_CLASS_DATA:", CHAR_CLASS_DATA);

    } catch (e) {
        console.error("Failed to load char class data:", e);
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