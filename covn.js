function getFactor(u) {
    if (u === 'm' || u === 'kg' || u === 'kmh') return 1;
    if (u === 'km') return 1000;
    if (u === 'cm') return 0.01;
    if (u === 'mi') return 1609.34;
    if (u === 'g') return 0.001;
    if (u === 'lb') return 0.453592;
    if (u === 'ms') return 3.6;
    return 1;
}

function runConv() {
    const val = parseFloat(document.getElementById('convVal').value);
    const cat = document.getElementById('convCat').value;
    const from = document.getElementById('unitFrom').value;
    const to = document.getElementById('unitTo').value;
    const out = document.getElementById('convOut');

    if (isNaN(val)) { out.textContent = '0'; return; }

    let res = 0;
    if (cat === 'temp') {
        if (from === to) res = val;
        else if (from === 'c') res = (val * 9 / 5) + 32;
        else res = (val - 32) * 5 / 9;
    } else {
        res = (val * getFactor(from)) / getFactor(to);
    }

    out.textContent = Number(res.toFixed(4)) + ' ' + to;
}

function updateUnits() {
    const cat = document.getElementById('convCat').value;
    const uFrom = document.getElementById('unitFrom');
    const uTo = document.getElementById('unitTo');
    let html = '';
    if (cat === 'len') html = '<option value="m">Метры (м)</option><option value="km">Километры (км)</option><option value="cm">Сантиметры (см)</option><option value="mi">Мили (mi)</option>';
    if (cat === 'wt') html = '<option value="kg">Килограммы (кг)</option><option value="g">Граммы (г)</option><option value="lb">Фунты (lb)</option>';
    if (cat === 'temp') html = '<option value="c">Цельсий (°C)</option><option value="f">Фаренгейт (°F)</option>';
    if (cat === 'spd') html = '<option value="kmh">км/ч</option><option value="ms">м/с</option>';
    uFrom.innerHTML = html;
    uTo.innerHTML = html;
    uTo.selectedIndex = 1;
    runConv();
}
