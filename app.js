// Переключение разделов
function openTool(id, btn) {
    document.querySelectorAll('.tool, .nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

// 1. Задачи (с сохранением в localStorage)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
function renderTodos() {
    const list = document.getElementById('todoList');
    list.innerHTML = tasks.map((t, i) => `<div class="todo-item"><span>${t}</span><button class="del-btn" onclick="delTodo(${i})">✕</button></div>`).join('');
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
function addTodo() {
    const inp = document.getElementById('todoInput');
    if (inp.value.trim()) { tasks.push(inp.value.trim()); inp.value = ''; renderTodos(); }
}
function delTodo(i) { tasks.splice(i, 1); renderTodos(); }
renderTodos();

// 2. ИМТ
function calcBMI() {
    const h = +document.getElementById('height').value / 100;
    const w = +document.getElementById('weight').value;
    if (h > 0 && w > 0) document.getElementById('bmiOut').textContent = 'Ваш ИМТ: ' + (w / (h * h)).toFixed(1);
}

// 3. Таймер
let sec = 1500, interval = null;
function startTimer() {
    if (interval) { clearInterval(interval); interval = null; return; }
    interval = setInterval(() => {
        if (sec <= 0) { clearInterval(interval); return; }
        sec--;
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        document.getElementById('timeDisplay').textContent = `${m}:${s}`;
    }, 1000);
}

// 4. Автосохранение заметок
const noteArea = document.getElementById('noteArea');
noteArea.value = localStorage.getItem('savedNote') || '';
noteArea.addEventListener('input', () => localStorage.setItem('savedNote', noteArea.value));
// 5. Обычный калькулятор
const cDisp = document.getElementById('calcDisplay');
const cAdd = v => cDisp.value += v;
const cClr = () => cDisp.value = '';
const cDel = () => cDisp.value = cDisp.value.slice(0, -1);
function cRun() {
    try { cDisp.value = eval(cDisp.value.replace(/%/g, '/100')) || '0'; }
    catch { cDisp.value = 'Ошибка'; }
}
// 6. Генератор паролей
function makePass() {
    const len = +document.getElementById('passLen').value;
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (document.getElementById('useNum').checked) chars += '0123456789';
    if (document.getElementById('useSym').checked) chars += '!@#$%^&*()_+-=';

    let pass = '';
    const array = new Uint32Array(len);
    crypto.getRandomValues(array); // Криптостойкая генерация
    for (let i = 0; i < len; i++) {
        pass += chars[array[i] % chars.length];
    }
    document.getElementById('passOut').value = pass;
}

function copyPass() {
    const out = document.getElementById('passOut');
    if (!out.value) return;
    navigator.clipboard.writeText(out.value);
    const old = out.value;
    out.value = 'Скопировано!';
    setTimeout(() => out.value = old, 1000);
}
// Модуль Финансы (с автосохранением)
let finData = JSON.parse(localStorage.getItem('finData')) || [];

function renderFin() {
    let total = 0;
    const list = document.getElementById('finList');
    
    list.innerHTML = finData.map((item, i) => {
        total += item.val;
        const color = item.val > 0 ? '#26fed7' : '#f37b7b';
        const sign = item.val > 0 ? '+' : '';
        return `<div class="fin-item">
            <span>${item.desc}</span>
            <div>
                <b style="color:${color}; margin-right:10px;">${sign}${item.val.toLocaleString('ru-RU')}</b>
                <button class="del-btn" onclick="delFin(${i})">✕</button>
            </div>
        </div>`;
    }).join('');

    const balEl = document.getElementById('finBal');
    balEl.textContent = total.toLocaleString('ru-RU') + ' сом';
    balEl.style.color = total >= 0 ? '#26fed7' : '#f37b7b';
    localStorage.setItem('finData', JSON.stringify(finData));
}

function addFin(sign) {
    const desc = document.getElementById('finDesc').value.trim() || (sign > 0 ? 'Доход' : 'Расход');
    const amt = Math.abs(+document.getElementById('finAmt').value);
    if (!amt) return;

    finData.unshift({ desc, val: amt * sign });
    document.getElementById('finDesc').value = '';
    document.getElementById('finAmt').value = '';
    renderFin();
}

function delFin(i) {
    finData.splice(i, 1);
    renderFin();
}

renderFin();
// Модуль Счётчик текста
function analyzeText() {
    const text = document.getElementById('txtInput').value;
    
    // Символы с пробелами и без
    const chars = text.length;
    const noSpace = text.replace(/\s+/g, '').length;
    
    // Подсчёт слов (убираем лишние пробелы и переносы строк)
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    
    // Время чтения (в среднем 180 слов в минуту = 3 слова в секунду)
    const totalSec = Math.ceil(words / 3);
    const timeStr = totalSec < 60 
        ? `${totalSec} сек` 
        : `${Math.floor(totalSec / 60)} мин ${totalSec % 60} сек`;

    document.getElementById('stChars').textContent = chars;
    document.getElementById('stNoSpace').textContent = noSpace;
    document.getElementById('stWords').textContent = words;
    document.getElementById('stTime').textContent = timeStr;
}

function clearTextStat() {
    document.getElementById('txtInput').value = '';
    analyzeText();
}
// Модуль Колесо выбора
let wheelAngle = 0;
let isSpinning = false;
const wheelColors = ['#f37b7b', '#26fed7', '#60a5fa', '#fbbf24', '#a78bfa', '#34d399', '#f472b6'];

function getWheelList() {
    return document.getElementById('wheelItems').value
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(Boolean);
}

function drawWheel() {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const items = getWheelList();
    const cx = 150, cy = 150, r = 148;
    
    ctx.clearRect(0, 0, 300, 300);
    if (!items.length) return;

    const arc = (2 * Math.PI) / items.length;
    items.forEach((text, i) => {
        const start = i * arc;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, start + arc);
        ctx.fillStyle = wheelColors[i % wheelColors.length];
        ctx.fill();
        ctx.strokeStyle = '#22252d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Текст внутри сектора
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#181a20';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(text.slice(0, 14), r - 14, 5);
        ctx.restore();
    });
}

function spinWheel() {
    const items = getWheelList();
    if (isSpinning || items.length < 2) return;
    
    isSpinning = true;
    document.getElementById('wheelRes').textContent = 'Крутим...';
    
    // Случайный поворот от 5 до 10 полных оборотов
    const extraDeg = Math.floor(1800 + Math.random() * 1800);
    wheelAngle += extraDeg;
    
    const canvas = document.getElementById('wheelCanvas');
    canvas.style.transform = `rotate(${wheelAngle}deg)`;

    setTimeout(() => {
        isSpinning = false;
        // Вычисляем сектор под верхней стрелкой (270 градусов)
        const actualDeg = wheelAngle % 360;
        const pointerDeg = (270 - actualDeg + 360) % 360;
        const sectorSize = 360 / items.length;
        const winIndex = Math.floor(pointerDeg / sectorSize);
        
        document.getElementById('wheelRes').textContent = '🎉 Выпало: ' + items[winIndex];
    }, 4000);
}
drawWheel();
// Модуль Здоровье и Режим
// 1. Дыхательный тренажёр
let breathTimer = null;
function toggleBreath() {
    const circle = document.getElementById('breathCircle');
    const btn = document.getElementById('breathBtn');
    if (breathTimer) {
        clearInterval(breathTimer);
        breathTimer = null;
        circle.className = 'breath-circle';
        circle.textContent = 'Готовы?';
        btn.textContent = 'Начать практику';
        return;
    }
    btn.textContent = 'Остановить';
    let step = 0;
    const runStep = () => {
        if (step === 0) { circle.textContent = 'Вдох...'; circle.classList.add('inhale'); }
        else if (step === 1) { circle.textContent = 'Держим'; }
        else if (step === 2) { circle.textContent = 'Выдох...'; circle.classList.remove('inhale'); }
        else { circle.textContent = 'Пауза'; }
        step = (step + 1) % 4;
    };
    runStep();
    breathTimer = setInterval(runStep, 4000);
}

// 2. Трекер воды (с автоматическим сбросом на новый день)
const todayKey = new Date().toLocaleDateString();
let waterData = JSON.parse(localStorage.getItem('waterData')) || { date: todayKey, ml: 0 };
if (waterData.date !== todayKey) waterData = { date: todayKey, ml: 0 };

function addWater(amount) {
    waterData.ml = Math.max(0, waterData.ml + amount);
    localStorage.setItem('waterData', JSON.stringify(waterData));
    renderWater();
}
function renderWater() {
    document.getElementById('waterTxt').textContent = `${waterData.ml} / 2000 мл`;
    const pct = Math.min(100, (waterData.ml / 2000) * 100);
    document.getElementById('waterFill').style.width = pct + '%';
}
renderWater();

// 3. Калькулятор циклов сна (по 90 минут)
function calcSleep() {
    const val = document.getElementById('wakeTime').value;
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    const wakeMins = h * 60 + m;
    const cycles = // 9 часов, 7.5 часов и 6 часов сна
    document.getElementById('sleepOut').innerHTML = cycles.map(c => {
        let bedMins = (wakeMins - c * 90 - 15 + 1440) % 1440;
        const bh = String(Math.floor(bedMins / 60)).padStart(2, '0');
        const bm = String(bedMins % 60).padStart(2, '0');
        return `<div class="sleep-pill">${bh}:${bm} <small style="color:#9ca3af;">(${c * 1.5}ч)</small></div>`;
    }).join('');
}
calcSleep();


