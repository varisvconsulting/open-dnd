const CORSPROXY_ULR = 'https://corsproxy.io/?';
const SPREADSHEED_ID = '1FvMqrnt5MnwbhKFfjVkT7HFT3fC8yKnyvrQnPtjxrPQ';


async function loadCsvRows(subsheet_id, use_corsproxy = true) {
    var url = "https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + encodeURIComponent(`/export?format=csv&gid=${subsheet_id}&_v=${Date.now()}`);
    if (use_corsproxy) {
        url = CORSPROXY_ULR + url;
    }
    
    const text = await fetch(SpellCsvUrl, {caches: 'no-store'}).then(r => r.text());
    const rows = await parseCSV(text);
    return rows;
}