var CHAR_CLASS_DATA = {
    core_classes: [],
    class_data: {}
}


async function loadCharClassCSV(){
    const CharClassCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
        `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=308079445&_v=${Date.now()}`
    );
    const list = document.getElementById('char_class_display');
    list.textContent = `Loading…`;

    try {
        const text = await fetch(CharClassCsvUrl, {caches: 'no-store'}).then(r => r.text());
        const rows = await parseCSV(text);
        let _c = 0;
        for (const row of rows) {
            var [class_name, is_archetype, archetype_name, lvl, s_name, s_description] = row;
            if (_c != 0) {
                if (!CHAR_CLASS_DATA.core_classes.includes(class_name)) {
                    CHAR_CLASS_DATA.core_classes.push(class_name)
                    CHAR_CLASS_DATA.class_data[class_name] = []
                    let class_btn_list = document.getElementById("class_tab_buttons");
                    let c_btn = document.createElement("button");
                    c_btn.classList = ["tab_button class_tab_button"];
                    c_btn.innerHTML=class_name;
                    class_btn_list.appendChild(c_btn);

                    let char_menu_panel = document.getElementById("char_class_display");
                    let c_panel = document.createElement("div");
                    c_panel.id = `char_class_${class_name}`;
                    char_menu_panel.appendChild(c_panel)

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
    
                if (is_archetype) {
                    // todo
                }
                else
                {
                    CHAR_CLASS_DATA.class_data[class_name].push({
                        level: lvl,
                        name: s_name,
                        description: s_description
                    })

                    let char_menu_panel = document.getElementById(`char_class_${class_name}`);
                    let c_panel = document.createElement("div");
                    c_panel.id = `char_class_ability_box`;
                    c_panel.innerHTML =`
                        <div class="class_ability_name"><h>${s_name}</h></div>
                        <div class="class_ability_desc">${parseCSV(s_description)}</div>
                    `
                    char_menu_panel.appendChild(c_panel);
                }
            }
            _c += 1;
        }
    } catch(e) {
        console.log("failed to load char class data: ", e);
    }

    console.log(CHAR_CLASS_DATA);
}

async function parseCSV(text) {
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

async function initialCharClassSetup(){
    var a = await loadCharClassCSV();
}