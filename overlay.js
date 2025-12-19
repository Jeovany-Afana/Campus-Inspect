import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

/* ========= 1) Firebase config (reprends le tien) ========= */
const firebaseConfig = {
    apiKey: "YOUR_KEY",
    authDomain: "YOUR_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ========= 2) Config overlay ========= */
const CFG = {
    loginUrl: "./login/index.html",

    // Firestore paths:
    electionDocPath: ["elections", "active"],              // doc(db, "elections","active")
    candidatesCollectionPath: ["elections", "active", "candidates"], // collection sous elections/active/candidates
    candidateIds: ["c1", "c2"],

    // Si Firestore n’a pas openAt: fallback "demain 11h"
    fallbackOpenHour: 11,
    fallbackCloseHour: 16,

    emojis: ["🎉","✨","🗳️","🔥","🎊","⭐️"]
};

/* ========= 3) DOM ========= */
const overlay = document.getElementById("pvoSimple");
const statusEl = document.getElementById("pvoSStatus");
const targetEl = document.getElementById("pvoSTarget");
const footEl   = document.getElementById("pvoSFoot");

const dEl = document.getElementById("pvoSD");
const hEl = document.getElementById("pvoSH");
const mEl = document.getElementById("pvoSM");
const sEl = document.getElementById("pvoSS");

const c1 = {
    img: document.getElementById("cand1Img"),
    name: document.getElementById("cand1Name"),
    slogan: document.getElementById("cand1Slogan"),
};
const c2 = {
    img: document.getElementById("cand2Img"),
    name: document.getElementById("cand2Name"),
    slogan: document.getElementById("cand2Slogan"),
};

document.getElementById("pvoSLoginBtn")?.setAttribute("href", CFG.loginUrl);

/* ========= 4) Utils ========= */
const pad2 = (n) => String(Math.max(0, n)).padStart(2, "0");

function formatFR(date){
    try{
        return new Intl.DateTimeFormat("fr-FR", {
            weekday:"long", day:"2-digit", month:"long", hour:"2-digit", minute:"2-digit"
        }).format(date);
    }catch{
        return date.toLocaleString();
    }
}

function computeFallbackWindow(){
    const now = new Date();
    const open = new Date(now);
    open.setDate(open.getDate() + 1);
    open.setHours(CFG.fallbackOpenHour, 0, 0, 0);

    const close = new Date(open);
    close.setHours(CFG.fallbackCloseHour, 0, 0, 0);

    return { open, close };
}

function isElectionOpen(data){
    const raw = (data?.statut ?? data?.status ?? data?.state ?? "").toString().toLowerCase().trim();
    if (raw === "open") return true;
    if (data?.isOpen === true) return true;
    return false;
}

function setOverlayVisible(visible){
    if (!overlay) return;
    overlay.style.display = visible ? "flex" : "none";
    document.body.classList.toggle("pvo-active", visible);
}

/* ========= 5) Confetti emojis (canvas) ========= */
const canvas = document.getElementById("pvoConfetti");
const ctx = canvas.getContext("2d");
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas(){
    canvas.width = Math.floor(innerWidth * DPR);
    canvas.height = Math.floor(innerHeight * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener("resize", resizeCanvas, {passive:true});
resizeCanvas();

const parts = [];
function burst(n=80){
    const cx = innerWidth/2;
    const y = innerHeight * 0.18;

    for(let i=0;i<n;i++){
        const emoji = CFG.emojis[(Math.random()*CFG.emojis.length)|0];
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random()*7;
        parts.push({
            x:cx + (Math.random()*60-30),
            y:y + (Math.random()*20-10),
            vx: Math.cos(a)*sp,
            vy: Math.sin(a)*sp - (3 + Math.random()*3),
            g: 0.12 + Math.random()*0.08,
            r: Math.random()*Math.PI*2,
            vr:(Math.random()-0.5)*0.18,
            life: 80 + (Math.random()*40|0),
            size: 16 + (Math.random()*16|0),
            emoji
        });
    }
}

function loop(){
    ctx.clearRect(0,0,innerWidth, innerHeight);
    for(let i=parts.length-1;i>=0;i--){
        const p = parts[i];
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.g;
        p.r += p.vr;
        p.vx *= 0.985;
        p.vy *= 0.985;

        const alpha = Math.max(0, p.life/120);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.font = `${p.size}px system-ui`;
        ctx.fillText(p.emoji, -p.size/2, p.size/2);
        ctx.restore();

        if(p.life <= 0 || p.y > innerHeight + 40) parts.splice(i,1);
    }
    requestAnimationFrame(loop);
}
loop();

/* ========= 6) Candidates (Firestore) ========= */
function setCandidateFallback(ui, letter, name="Candidat", slogan="—"){
    ui.name.textContent = name;
    ui.slogan.textContent = slogan;
    ui.img.src =
        `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='54' height='54'%3E%3Crect width='54' height='54' rx='16' fill='%234f46e5'/%3E%3Ctext x='27' y='34' text-anchor='middle' font-size='20' fill='white' font-family='Arial'%3E${letter}%3C/text%3E%3C/svg%3E`;
}

function applyCandidate(ui, data, letter){
    const name = data?.name || data?.nom || "Candidat";
    const slogan = data?.slogan || data?.programme || "—";
    const photoURL = data?.photoURL || data?.photoURLOk || data?.image || "";

    ui.name.textContent = name;
    ui.slogan.textContent = `« ${slogan} »`;

    if (photoURL){
        ui.img.src = photoURL;
        ui.img.onerror = () => setCandidateFallback(ui, letter, name, `« ${slogan} »`);
    } else {
        setCandidateFallback(ui, letter, name, `« ${slogan} »`);
    }
}

async function loadCandidatesOnce(){
    try{
        const base = CFG.candidatesCollectionPath;
        const c1Ref = doc(db, ...base, CFG.candidateIds[0]);
        const c2Ref = doc(db, ...base, CFG.candidateIds[1]);
        const [s1, s2] = await Promise.all([getDoc(c1Ref), getDoc(c2Ref)]);

        applyCandidate(c1, s1.exists() ? s1.data() : null, "A");
        applyCandidate(c2, s2.exists() ? s2.data() : null, "B");
    }catch(e){
        setCandidateFallback(c1, "A", "Candidat 1", "—");
        setCandidateFallback(c2, "B", "Candidat 2", "—");
    }
}

/* ========= 7) Countdown ========= */
let openAt = null;
let closeAt = null;
let tmr = null;
let did60=false, did10=false, did0=false;

function updateTargetText(){
    if (!openAt) return;
    targetEl.textContent = `${formatFR(openAt)} (créneau ${pad2(openAt.getHours())}h–${pad2(closeAt.getHours())}h)`;
}

function tick(){
    if (!openAt || !closeAt) return;

    const now = new Date();

    // petit status texte
    if (now >= openAt && now <= closeAt) statusEl.textContent = "Créneau en cours (attente activation admin)";
    else if (now > closeAt) statusEl.textContent = "Créneau terminé (en attente)";
    else statusEl.textContent = "Vote pas encore ouvert";

    const diff = openAt - now;

    if (diff <= 0){
        dEl.textContent = "00";
        hEl.textContent = "00";
        mEl.textContent = "00";
        sEl.textContent = "00";

        if(!did0){
            did0=true;
            burst(220);
            footEl.textContent = "🎉 C’est l’heure ! Si l’admin ouvre, tu peux voter maintenant.";
        }
        return;
    }

    const total = Math.floor(diff/1000);
    const days = Math.floor(total / (3600*24));
    const hours = Math.floor((total % (3600*24)) / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    dEl.textContent = pad2(days);
    hEl.textContent = pad2(hours);
    mEl.textContent = pad2(mins);
    sEl.textContent = pad2(secs);

    if(total <= 60 && !did60){
        did60=true;
        burst(90);
        footEl.textContent = "⏳ Plus qu’1 minute… prépare-toi !";
    }
    if(total <= 10 && !did10){
        did10=true;
        burst(140);
        footEl.textContent = "🔥 10 secondes… LET’S GO !";
        if(navigator.vibrate) navigator.vibrate([80,40,80]);
    }
}

function startCountdown(){
    if (tmr) clearInterval(tmr);
    tick();
    tmr = setInterval(tick, 1000);
}

/* ========= 8) Election listener (hide/show overlay) ========= */
function listenElection(){
    const ref = doc(db, ...CFG.electionDocPath);

    onSnapshot(ref, (snap) => {
        // si doc absent => on affiche quand même avec fallback
        if (!snap.exists()){
            setOverlayVisible(true);
            const w = computeFallbackWindow();
            openAt = w.open;
            closeAt = w.close;
            updateTargetText();
            startCountdown();
            return;
        }

        const data = snap.data();

        // si élection open => overlay disparaît
        if (isElectionOpen(data)){
            setOverlayVisible(false);
            return;
        }

        // sinon overlay visible
        setOverlayVisible(true);

        // récupère openAt/closeAt depuis Firestore si dispo
        const startTs = data?.startDate || data?.openAt || data?.startAt;
        const endTs   = data?.endDate   || data?.closeAt || data?.endAt;

        if (startTs?.toDate){
            openAt = startTs.toDate();
            closeAt = endTs?.toDate ? endTs.toDate() : (() => {
                const tmp = new Date(openAt);
                tmp.setHours(CFG.fallbackCloseHour, 0, 0, 0);
                return tmp;
            })();

            // reset milestones
            did60=false; did10=false; did0=false;

            updateTargetText();
            startCountdown();
        } else {
            // fallback si pas de dates dans Firestore
            const w = computeFallbackWindow();
            openAt = w.open; closeAt = w.close;
            did60=false; did10=false; did0=false;
            updateTargetText();
            startCountdown();
        }
    });
}

/* ========= 9) Copier horaire ========= */
document.getElementById("pvoSCopyBtn")?.addEventListener("click", async () => {
    if (!openAt || !closeAt) return;

    const text = `Campus Vote — ouverture : ${formatFR(openAt)} (créneau ${pad2(openAt.getHours())}h–${pad2(closeAt.getHours())}h).`;
    try{
        await navigator.clipboard.writeText(text);
        burst(70);
        footEl.textContent = "📋 Horaire copié ! À tout à l’heure.";
    }catch{
        burst(50);
        footEl.textContent = "📋 Copie manuelle : " + text;
    }
});

/* ========= 10) Init ========= */
(function init(){
    // overlay visible au début (si tu veux le montrer direct)
    setOverlayVisible(true);
    burst(50);

    // charge candidats
    loadCandidatesOnce();

    // écoute statut élection + horaires
    listenElection();

    // au cas où l’init prend du temps, fallback chrono rapide
    const w = computeFallbackWindow();
    openAt = w.open; closeAt = w.close;
    updateTargetText();
    startCountdown();
})();
