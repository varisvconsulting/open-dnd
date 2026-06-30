var player_races = {};

async function loadPlayerRacesCSV() {
    const PRCsvUrl= `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=1936715235`;
    // const csvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
    //         `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=1936715235&_v=${Date.now()}`
    //     );
    const list = document.getElementById('race_list');
    list.textContent = 'Loading…';
    try {
        const text = await fetch(PRCsvUrl, {caches: 'no-store'}).then(r => r.text());
        const rows = await parseCSV(text);
        var _c = 0
        for (const row of rows) {
            var [name='',
                 types='',
                 description='',
                 attribute_bonus='',
                 size='',
                 speed='',
                 traits='',
                 proficiencies=''
                ] = row;
            
            _c +=1;
                if (_c <= 1) { continue; } //cus the first few tabs arent part of the stuff
            player_races[name] = {};
            player_races[name]["name"]=name;
            player_races[name]["types"]=types
            player_races[name]["description"]=description;
            player_races[name]["attribute_bonus"]=attribute_bonus;
            player_races[name]["size"]=size;
            player_races[name]["speed"]=speed;
            player_races[name]["traits"]=traits;
            player_races[name]["proficiencies"]=proficiencies
        }
    } catch (e) {
        list.textContent = 'Sorry—could not load data.';
        console.log(e)
    }
}

async function populatePlayerRaces() {
    const list = document.getElementById("race_list")
    list.replaceChildren()
    // var keys = Object.keys(player_races);
    for (const [key, value] of Object.entries(player_races)) {
        var item_card = document.createElement('div');
        var item_data = value
        console.log("populating entry... " + key)
        // item_card.dataset.group = magic_class;
        item_card.classList = ["spell-card"];

        item_card.innerHTML = `
            <div class="player_race_header">
                <h3>${escapeHtml(capitalize(item_data["name"]))} </h3>
            </div>
            <div class="race_desc_box">
                <div class="entry-property"><b>type</b>: ${value["types"]}</div>
                <div class="entry-property"><b>size</b>: ${value["size"]}</div>
                <div class="entry-property"><b>attribute bonus</b>: ${value["attribute_bonus"]}</div>
                <div class="entry-property"><b>proficiencies</b>: ${value["proficiencies"]}</div>
                <div class="entry-property"><b>speed</b>: ${value["speed"]}</div>
                <br>
                <div class="entry-property">${PlayerRaceTraitNotationToHtml(value["traits"])}</div>
                <p>${value["description"]}<p>
                
            </div>
            `;
        list.appendChild(item_card);
    }
}


function PlayerRaceTraitNotationToHtml(text) {
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

async function initialRaceSetup() {
    var a = await loadPlayerRacesCSV();
    var b = await populatePlayerRaces();
}