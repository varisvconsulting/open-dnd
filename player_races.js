var player_races = {};

async function loadPlayerRacesCSV() {
    const csvUrl= `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=1936715235`;
    // const csvUrl = 'https://corsproxy.io/?' + encodeURIComponent(
    //         `https://docs.google.com/spreadsheets/d/1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ/export?format=csv&gid=1936715235&_v=${Date.now()}`
    //     );
    const list = document.getElementById('race_list');
    list.textContent = 'Loading…';
    try {
        const text = await fetch(csvUrl, {caches: 'no-store'}).then(r => r.text());
        const rows = await parseCSV(text);
        var _c = 0
        for (const row of rows) {
            var [name='',
                 description='',
                 attribute_bonus='',
                 size='',
                 speed=''
                ] = row;
            
            _c +=1;
                if (_c <= 1) { continue; } //cus the first few tabs arent part of the stuff
            player_races[name] = {};
            player_races[name]["name"]=name;
            player_races[name]["description"]=description;
            player_races[name]["attribute_bonus"]=attribute_bonus;
            player_races[name]["speed"]=speed;
        }
    } catch (e) {
        list.textContent = 'Sorry—could not load data.';
        console.log(e)
    }
}

async function populatePlayerRaces() {
    const list = document.getElementById("race_list")
    list.replaceChildren()
    var keys = Object.keys(player_races);
    for (const r of player_races) {
        var item_card = document.createElement('div');
        var item_data = player_races[r["name"]]
        
        item_card.dataset.group = magic_class;
        item_card.classList = ["spell-card"];

        item_card.innerHTML = `
            <div class="spell-header">
                <h3>${escapeHtml(capitalize(spell_name))} </h3>
                <span class="spell-type"><i> - level ${spell_lvl}, ${escapeHtml(spell_type)}</i></span>
            </div>
            <div class="spell-mechanics">
                size: ${r["size"]}
                description: ${r["dscription"]}
                attributes: ${r["attribute_bonus"]}
                speed: ${r["speed"]}
            </div>
            `;
    }
}

async function initialRaceSetup() {
    var a = await loadPlayerRacesCSV()
    populatePlayerRaces()
}