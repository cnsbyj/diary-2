// 1. إعدادات Supabase (تأكد من وضع بياناتك الصحيحة هنا)
const SUPABASE_URL = 'https://qzivgtccfgtijkbhnrpm.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_sDpI7CKbD68--hYLmwaHEw_n1G6_u5B'; 

const users = {
    "dd": { password: "112233", name: "دحوم", role: "writer" },
    "mona": { password: "123", name: "منى", role: "reader" }
};

const months = [
    { name: "مايو", idx: 4 }, { name: "يونيو", idx: 5 }, { name: "يوليو", idx: 6 },
    { name: "أغسطس", idx: 7 }, { name: "سبتمبر", idx: 8 }, { name: "أكتوبر", idx: 9 },
    { name: "نوفمبر", idx: 10 }, { name: "ديسمبر", idx: 11 }
];

const arabicDays = ["", "اليوم الأول", "اليوم الثاني", "اليوم الثالث", "اليوم الرابع", "اليوم الخامس", "اليوم السادس", "اليوم السابع", "اليوم الثامن", "اليوم التاسع", "اليوم العاشر", "اليوم الحادي عشر", "اليوم الثاني عشر", "اليوم الثالث عشر", "اليوم الرابع عشر", "اليوم الخامس عشر", "اليوم السادس عشر", "اليوم السابع عشر", "اليوم الثامن عشر", "اليوم التاسع عشر", "اليوم العشرون", "اليوم الحادي والعشرون", "اليوم الثاني والعشرون", "اليوم الثالث والعشرون", "اليوم الرابع والعشرون", "اليوم الخامس والعشرون", "اليوم السادس والعشرون", "اليوم السابع والعشرون", "اليوم الثامن والعشرون", "اليوم التاسع والعشرون", "اليوم الثلاثون"];

let currentUser = null;
let activeMonthIdx = null;

// تاريخ بداية المشروع (اليوم الأول لمنى)
const projectStartDate = new Date("2026-05-10T00:00:00");

function showAlert(msg) {
    const alertMsg = document.getElementById('alert-message');
    if (alertMsg) {
        alertMsg.innerText = msg;
        document.getElementById('custom-alert').classList.remove('hidden');
    } else {
        alert(msg);
    }
}

function closeAlert() {
    document.getElementById('custom-alert').classList.add('hidden');
}

// --- اتصال Supabase ---
async function fetchNoteFromServer(key) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/notes?key=eq.${key}&select=content`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const data = await response.json();
        return data.length > 0 ? data[0].content : null;
    } catch (e) { return null; }
}

async function saveNoteToServer(key, content) {
    await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ key, content })
    });
}

// --- منطق الدخول والواجهة ---
function login() {
    const u = document.getElementById('username').value.trim().toLowerCase();
    const p = document.getElementById('password').value.trim();
    if (users[u] && users[u].password === p) {
        currentUser = u;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        document.getElementById('welcome-msg').innerText = "أهلاً " + users[u].name;
        showYears();
    } else {
        showAlert("بيانات الدخول غلط ");
    }
}

function showYears() {
    document.getElementById('years-view').classList.remove('hidden');
    document.getElementById('months-view').classList.add('hidden');
    document.getElementById('days-view').classList.add('hidden');
}

function showMonths() {
    activeMonthIdx = null;
    document.getElementById('years-view').classList.add('hidden');
    document.getElementById('months-view').classList.remove('hidden');
    document.getElementById('days-view').classList.add('hidden');
    document.getElementById('editor-section').classList.add('hidden');
    
    const grid = document.getElementById('months-grid');
    grid.innerHTML = "";
    const now = new Date();
    const currentMonthNow = now.getMonth();

    months.forEach((m) => {
        const card = document.createElement('div');
        card.className = "month-card fade-in";
        card.innerText = m.name;

        // قفل الشهور المستقبلية لمنى فقط
        if (currentUser === "mina" && m.idx > currentMonthNow) {
            card.classList.add('locked');
            card.onclick = () => showAlert("هذا الشهر لم يأتِ أوانه بعد.. ❤️");
        } else {
            card.onclick = () => showDays(m.idx);
        }
        grid.appendChild(card);
    });
}

function showDays(monthIdx) {
    activeMonthIdx = monthIdx;
    document.getElementById('months-view').classList.add('hidden');
    document.getElementById('days-view').classList.remove('hidden');
    const container = document.getElementById('day-selector-container');
    container.innerHTML = "";
    
    const now = new Date();
    const diffTime = now - projectStartDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // إذا دخلت منى، يظهر لها اليوم المسموح به حالياً فقط
    if (currentUser === "mina") {
        if (diffDays < 1) {
            showAlert("انتظري ياحبي❤️");
            showMonths();
            return;
        }
        // إظهار الأيام من 1 إلى اليوم الحالي فقط لمنى
        const grid = document.createElement('div');
        grid.style.display = "flex"; grid.style.flexWrap = "wrap"; grid.style.justifyContent = "center"; grid.style.gap = "10px";
        
        for (let i = 1; i <= diffDays && i <= 30; i++) {
            const tag = document.createElement('div');
            tag.className = "day-tag fade-in";
            tag.style.cursor = "pointer";
            tag.innerText = arabicDays[i] || `اليوم ${i}`;
            tag.onclick = () => openNote(i);
            grid.appendChild(tag);
        }
        container.appendChild(grid);
    } else {
        // أنت يظهر لك كل الأيام لتكتب فيها مسبقاً
        const grid = document.createElement('div');
        grid.style.display = "flex"; grid.style.flexWrap = "wrap"; grid.style.justifyContent = "center"; grid.style.gap = "8px";
        for (let i = 1; i <= 30; i++) {
            const b = document.createElement('button');
            b.innerText = i; b.className = "back-btn"; b.style.margin = "0";
            b.onclick = () => openNote(i);
            grid.appendChild(b);
        }
        container.appendChild(grid);
    }
}

async function openNote(day) {
    document.getElementById('editor-section').classList.remove('hidden');
    const input = document.getElementById('note-input');
    input.value = "🌸";
    
    const key = `note-${activeMonthIdx}-${day}`;
    const serverContent = await fetchNoteFromServer(key);
    
    window.currentOpenDay = day;

    if (users[currentUser].role === "reader") {
        input.readOnly = true;
        document.getElementById('save-btn').classList.add('hidden');
        input.value = serverContent || "";
        if (!serverContent) {
            input.placeholder = ""; 
            input.value = "لم يكتب لكِ حبيبكِ شيئاً بعد لهذا اليوم.. 🌸";
        }
    } else {
        input.readOnly = false;
        document.getElementById('save-btn').classList.remove('hidden');
        input.value = serverContent || "";
        input.placeholder = "اكتب لمنى هنا... ❤️";
    }
}

async function saveNote() {
    const text = document.getElementById('note-input').value;
    const key = `note-${activeMonthIdx}-${window.currentOpenDay}`;
    await saveNoteToServer(key, text);
    showAlert("تم حفظ الكلام ");
}

function logout() { location.reload(); }