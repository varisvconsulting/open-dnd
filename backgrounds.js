var backgrounds = {};

async function loadBackgroundsCSV() {
    const BackgroundCsvUrl= `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=782758810`;
    // const csvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
    //         `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=1936715235&_v=${Date.now()}`
    //     );
    const list = document.getElementById('background_list');
    list.textContent = 'Loading…';
    try {
        const text = await fetch(BackgroundCsvUrl, {caches: 'no-store'}).then(r => r.text());
        const rows = await parseCSV(text);
        var _c = 0
        for (const row of rows) {
            var [name='',
                 proficiencies='',
                 description='',
                ] = row;
            
            _c +=1;
            if (_c <= 1) { continue; } //cus the first few tabs arent part of the stuff
            backgrounds[name] = {};
            backgrounds[name]["name"]=name;
            backgrounds[name]["proficiencies"]=proficiencies;
            backgrounds[name]["description"]=description;
        }
    } catch (e) {
        list.textContent = 'Sorry—could not load data.';
        console.log(e)
    }
}

async function populateBackgrounds() {
    const list = document.getElementById("background_list")
    list.replaceChildren()
    // var keys = Object.keys(player_races);
    for (const [key, value] of Object.entries(backgrounds)) {
        var item_card = document.createElement('div');
        var item_data = value;
        console.log("populating entry... " + key);
        console.log(value);
        // item_card.dataset.group = magic_class;
        item_card.classList = ["spell-card"];

        item_card.innerHTML = `
            <div class="spell-header">
                <h3>${escapeHtml(capitalize(item_data["name"]))} </h3>
            </div>
            <div class="race_desc_box">
                <div class="entry-property"><b>proficiencies</b>: ${value["proficiencies"]}</div>
                <br>
                <div class="entry-property">${BackgroundNotationToHtml(value["description"])}</div>
            </div>
            `;
        list.appendChild(item_card);
    }
}


function BackgroundNotationToHtml(text) {
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

async function initialBackgroundSetup() {
    var a = await loadBackgroundsCSV();
    var b = await populateBackgrounds();
}