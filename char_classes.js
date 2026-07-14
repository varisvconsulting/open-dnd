var CHAR_CLASS_DATA = {
    core_classes: [],
    class_data: {}
}


async function loadCharClassCSV(){
    const CharClassCsvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
        `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=308079445&_v=${Date.now()}`
    );
    const list = document.getElementById('armor-list');
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
                    c_btn.classList = ["class_tab_button"];
                    c_btn.innerHTML=class_name;
                    class_btn_list.appendChild(c_btn);
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
                }
            }
            _c += 1;
        }
    } catch(e) {
        console.log("failed to load char class data: ", e);
    }

    console.log(CHAR_CLASS_DATA);
}

async function initialCharClassSetup(){
    var a = await loadCharClassCSV();
}