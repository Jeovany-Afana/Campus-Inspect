import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

/* ===== Firebase config ===== */
const firebaseConfig = {
    apiKey: "AIzaSyDibbuBJ2p88T26P0BAB-o_exunK0GYFdA",
    authDomain: "inspecteur-de-classes.firebaseapp.com",
    projectId: "inspecteur-de-classes",
    storageBucket: "inspecteur-de-classes.appspot.com",
    messagingSenderId: "572661846292",
    appId: "1:572661846292:web:aeb0374db2d414fef9f201"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ===== Elements ===== */
const overlayEl = document.getElementById("preVoteOverlay");
const wrapEl = document.getElementById("pvoWrap");
const statusLabel = document.getElementById("pvoStatusLabel");
const kickerText = document.getElementById("pvoKickerText");

const targetTextEl = document.getElementById("pvoTargetText");
const footerTimeEl = document.getElementById("pvoFooterTime");
const toastEl = document.getElementById("pvoToast");
const copyBtn = document.getElementById("pvoCopyTime");

const canvas = document.getElementById("pvoConfetti");
const ctx = canvas?.getContext("2d");

const stacks = {
    days: document.getElementById("stackDays"),
    hours: document.getElementById("stackHours"),
    minutes: document.getElementById("stackMinutes"),
    seconds: document.getElementById("stackSeconds"),
};

const nums = {
    days: document.getElementById("pvoDays"),
    hours: document.getElementById("pvoHours"),
    minutes: document.getElementById("pvoMinutes"),
    seconds: document.getElementById("pvoSeconds"),
};

const candUI = {
    c1: {
        card: document.getElementById("pvoCand1"),
        img: document.getElementById("pvoCand1Img"),
        name: document.getElementById("pvoCand1Name"),
        party: document.getElementById("pvoCand1Party"),
    },
    c2: {
        card: document.getElementById("pvoCand2"),
        img: document.getElementById("pvoCand2Img"),
        name: document.getElementById("pvoCand2Name"),
        party: document.getElementById("pvoCand2Party"),
    },
};

/* ===== State ===== */
let countdownInterval = null;
let openAt = null;
let closeAt = null;
let didTenSecBurst = false;
let confettiRAF = null;
let particles = [];
let lastElectionOpen = false;

/* ===== Utils ===== */
const pad2 = (n) => String(Math.max(0, n)).padStart(2, "0");

function formatDateFR(d) {
    try {
        return new Intl.DateTimeFormat("fr-FR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        }).format(d);
    } catch {
        return d.toLocaleString();
    }
}

function showOverlay() {
    if (!overlayEl) return;
    overlayEl.style.display = "flex";
    document.body.classList.add("pvo-no-scroll");
}

function hideOverlayWithCelebration() {
    // petite célébration + fade out
    bigConfettiBurst();
    setTimeout(() => {
        if (!overlayEl) return;
        overlayEl.style.transition = "opacity .35s ease";
        overlayEl.style.opacity = "0";
        setTimeout(() => {
            overlayEl.style.display = "none";
            document.body.classList.remove("pvo-no-scroll");
            stopCountdown();
            stopConfetti();
        }, 380);
    }, 220);
}

function stopCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = null;
}

function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("pvo-show");
    setTimeout(() => toastEl.classList.remove("pvo-show"), 1600);
}

/* ===== Compute next window (11:00 -> 16:00) ===== */
function computeNextWindow() {
    const now = new Date();
    const candidate = new Date(now);
    candidate.setHours(11, 0, 0, 0);

    if (now >= candidate) {
        candidate.setDate(candidate.getDate() + 1);
        candidate.setHours(11, 0, 0, 0);
    }

    const close = new Date(candidate);
    close.setHours(16, 0, 0, 0);

    return { open: candidate, close };
}

function setCountdownTarget(open, close) {
    openAt = open;
    closeAt = close;
    didTenSecBurst = false;

    targetTextEl.textContent = formatDateFR(openAt);
    footerTimeEl.textContent = `Vote ${pad2(openAt.getHours())}h–${pad2(closeAt.getHours())}h`;

    // “demain” si c’est vraiment demain
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow =
        openAt.getFullYear() === tomorrow.getFullYear() &&
        openAt.getMonth() === tomorrow.getMonth() &&
        openAt.getDate() === tomorrow.getDate();

    kickerText.textContent = isTomorrow ? "Rendez-vous demain" : "Rendez-vous à la prochaine ouverture";

    startCountdown();
}

/* ===== Flip animation helper ===== */
function flipTo(unit, newValue) {
    const stack = stacks[unit];
    const current = nums[unit];
    if (!stack || !current) return;

    const prev = current.textContent;
    if (prev === newValue) return;

    // create old span
    const oldSpan = document.createElement("span");
    oldSpan.className = "pvo-num pvo-numOld";
    oldSpan.textContent = prev;

    stack.insertBefore(oldSpan, current);

    // set new
    current.textContent = newValue;

    // animate flip
    stack.classList.remove("pvo-flip");
    // force reflow
    void stack.offsetWidth;
    stack.classList.add("pvo-flip");

    // cleanup
    setTimeout(() => {
        oldSpan.remove();
        stack.classList.remove("pvo-flip");
    }, 260);
}

/* ===== Countdown ===== */
function updateCountdown() {
    const now = new Date();

    // status text
    if (now >= openAt && now <= closeAt) {
        statusLabel.textContent = "Créneau en cours (attente activation admin)";
    } else if (now > closeAt) {
        statusLabel.textContent = "Créneau terminé (en attente)";
    } else {
        statusLabel.textContent = "Vote pas encore ouvert";
    }

    const diff = openAt - now;

    if (diff <= 0) {
        flipTo("days", "00");
        flipTo("hours", "00");
        flipTo("minutes", "00");
        flipTo("seconds", "00");
        if (!didTenSecBurst) {
            // petit effet quand on atteint 0 (mais on attend open Firestore)
            miniConfettiBurst(0.55);
            didTenSecBurst = true;
        }
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    flipTo("days", pad2(days));
    flipTo("hours", pad2(hours));
    flipTo("minutes", pad2(minutes));
    flipTo("seconds", pad2(seconds));

    // T-10s burst (suspense)
    if (totalSeconds <= 10 && !didTenSecBurst) {
        miniConfettiBurst(0.85);
        didTenSecBurst = true;
        showToast("🔥 Ouverture imminente !");
        if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    }
}

function startCountdown() {
    stopCountdown();
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

/* ===== Candidates ===== */
function safeSetCandidate(ui, data) {
    const name = data?.name || "Candidat";
    const party = data?.party || data?.faculty || "—";
    const photoURL = data?.photoURL || data?.photoURLOk || "";

    ui.name.textContent = name;
    ui.party.textContent = party;

    if (photoURL) {
        ui.img.src = photoURL;
        ui.img.onload = () => ui.card.classList.add("pvo-loaded");
        ui.img.onerror = () => {
            ui.img.removeAttribute("src");
            ui.card.classList.add("pvo-loaded");
        };
    } else {
        ui.img.removeAttribute("src");
        ui.card.classList.add("pvo-loaded");
    }
}

async function loadCandidatesForOverlay() {
    try {
        const c1Ref = doc(db, "elections", "active", "candidates", "c1");
        const c2Ref = doc(db, "elections", "active", "candidates", "c2");
        const [s1, s2] = await Promise.all([getDoc(c1Ref), getDoc(c2Ref)]);
        safeSetCandidate(candUI.c1, s1.exists() ? s1.data() : null);
        safeSetCandidate(candUI.c2, s2.exists() ? s2.data() : null);
    } catch {
        candUI.c1.name.textContent = "Candidat 1";
        candUI.c2.name.textContent = "Candidat 2";
    }
}

/* ===== Firestore election status ===== */
function isElectionOpen(data) {
    const raw = (data?.statut ?? data?.status ?? data?.state ?? "").toString().toLowerCase().trim();
    if (raw === "open") return true;
    if (data?.isOpen === true) return true;
    return false;
}

function listenElectionStatus() {
    const electionRef = doc(db, "elections", "active");

    onSnapshot(electionRef, (snap) => {
        if (!snap.exists()) {
            showOverlay();
            return;
        }

        const data = snap.data();
        const open = isElectionOpen(data);

        if (open) {
            // if just transitioned -> celebrate then hide
            if (!lastElectionOpen) {
                lastElectionOpen = true;
                hideOverlayWithCelebration();
            } else {
                // already open
                overlayEl.style.display = "none";
                document.body.classList.remove("pvo-no-scroll");
            }
            return;
        }

        lastElectionOpen = false;
        showOverlay();

        // If Firestore has startDate/endDate -> prefer those
        const startTs = data?.startDate || data?.openAt || data?.startAt;
        const endTs = data?.endDate || data?.closeAt || data?.endAt;

        if (startTs?.toDate) {
            const openDate = startTs.toDate();
            const closeDate = endTs?.toDate ? endTs.toDate() : (() => {
                const tmp = new Date(openDate);
                tmp.setHours(16, 0, 0, 0);
                return tmp;
            })();
            setCountdownTarget(openDate, closeDate);
        }
    });
}

/* ===== Spotlight + Tilt (mobile friendly) ===== */
function setupSpotlightAndTilt() {
    if (!wrapEl || !overlayEl) return;

    const update = (clientX, clientY) => {
        const r = wrapEl.getBoundingClientRect();
        const x = ((clientX - r.left) / r.width) * 100;
        const y = ((clientY - r.top) / r.height) * 100;

        wrapEl.style.setProperty("--sx", `${x}%`);
        wrapEl.style.setProperty("--sy", `${y}%`);

        // tilt (small)
        const dx = (x - 50) / 50; // -1..1
        const dy = (y - 50) / 50;
        const max = 6; // degrees
        const rx = (-dy * max).toFixed(2);
        const ry = (dx * max).toFixed(2);

        wrapEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const reset = () => {
        wrapEl.style.transform = `rotateX(0deg) rotateY(0deg)`;
        wrapEl.style.setProperty("--sx", `50%`);
        wrapEl.style.setProperty("--sy", `30%`);
    };

    overlayEl.addEventListener("mousemove", (e) => update(e.clientX, e.clientY), { passive: true });
    overlayEl.addEventListener("mouseleave", reset, { passive: true });

    overlayEl.addEventListener("touchmove", (e) => {
        const t = e.touches?.[0];
        if (t) update(t.clientX, t.clientY);
    }, { passive: true });

    overlayEl.addEventListener("touchend", reset, { passive: true });

    reset();
}

/* ===== Confetti Engine (no library) ===== */
function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function addParticles(amount, power = 1) {
    const colors = ["#4F46E5", "#F5A71C", "#10B981", "#FFFFFF"];
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < amount; i++) {
        const fromLeft = Math.random() < 0.5;
        const x = fromLeft ? rand(-30, w * 0.25) : rand(w * 0.75, w + 30);
        const y = rand(h * 0.2, h * 0.6);

        const vx = (fromLeft ? rand(1.5, 5.2) : rand(-5.2, -1.5)) * power;
        const vy = rand(-5.5, -1.5) * power;

        particles.push({
            x, y,
            vx, vy,
            g: rand(0.12, 0.22) * power,
            r: rand(2.2, 4.4),
            rot: rand(0, Math.PI * 2),
            vr: rand(-0.18, 0.18),
            life: rand(70, 120),
            color: pick(colors),
            shape: Math.random() < 0.35 ? "rect" : "circle",
        });
    }
}

function draw() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles = particles.filter(p => p.life > 0);

    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.g;
        p.rot += p.vr;
        p.life -= 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life / 40);

        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
            ctx.fillRect(-p.r, -p.r * 0.7, p.r * 2.2, p.r * 1.4);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    if (particles.length > 0) {
        confettiRAF = requestAnimationFrame(draw);
    } else {
        stopConfetti();
    }
}

function startConfetti() {
    if (!ctx) return;
    if (!confettiRAF) confettiRAF = requestAnimationFrame(draw);
}

function stopConfetti() {
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    confettiRAF = null;
    particles = [];
    ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function miniConfettiBurst(power = 1) {
    resizeCanvas();
    addParticles(70, power);
    startConfetti();
}

function bigConfettiBurst() {
    resizeCanvas();
    addParticles(180, 1.1);
    startConfetti();
}

/* ===== Copy schedule ===== */
async function copySchedule() {
    const text = `Campus Vote — Ouverture du vote : ${formatDateFR(openAt)} (créneau ${pad2(openAt.getHours())}h–${pad2(closeAt.getHours())}h).`;
    try {
        await navigator.clipboard.writeText(text);
        showToast("Horaire copié ✅");
    } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        showToast("Horaire copié ✅");
    }

    // confetti + haptic
    miniConfettiBurst(0.95);
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
}

/* ===== Init ===== */
(function init() {
    if (!overlayEl) return;

    showOverlay();

    // default target = next 11:00
    const { open, close } = computeNextWindow();
    setCountdownTarget(open, close);

    // candidates
    loadCandidatesForOverlay();

    // spotlight + tilt
    setupSpotlightAndTilt();

    // confetti canvas resize
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    // copy button
    copyBtn?.addEventListener("click", copySchedule);

    // listen firestore
    listenElectionStatus();
})();
