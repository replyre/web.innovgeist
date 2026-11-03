gsap.registerPlugin(ScrollTrigger);

/* ── Navbar scroll state ── */
const navbar = document.getElementById("navbar");
const onNavScroll = () => navbar.classList.toggle("is-scrolled", window.scrollY > 24);
window.addEventListener("scroll", onNavScroll, { passive: true });
onNavScroll(); // set correct state on load (transparent at top)

/* ── Mobile menu ── */
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
hamburgerBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("is-open");
});
mobileMenu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => mobileMenu.classList.remove("is-open"))
);

/* ── Theme toggle (persisted) ── */
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;
const savedTheme = localStorage.getItem("ig-theme");
if (savedTheme) root.setAttribute("data-theme", savedTheme);
themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem("ig-theme", next);
});

/* ── Reveal-on-scroll for .reveal elements ── */
gsap.utils.toArray(".reveal").forEach((el) => {
  gsap.fromTo(
    el,
    { opacity: 0, y: 28 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    }
  );
});

/* ── Overlay-wipe reveal on section headings ── */
gsap.utils.toArray(".wipe-overlay").forEach((el) => {
  gsap.to(el, {
    scaleX: 0,
    duration: 0.9,
    ease: "power3.inOut",
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });
});

/* ── Per-section background parallax ── */
gsap.utils.toArray(".grid-bg").forEach((section) => {
  gsap.to(section, {
    backgroundPosition: "28px 56px",
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
});

/* ── Floating WhatsApp visibility ── */
const waFloat = document.getElementById("waFloat");
ScrollTrigger.create({
  trigger: ".hero",
  start: "bottom top",
  onEnter: () => waFloat.classList.add("is-visible"),
  onLeaveBack: () => waFloat.classList.remove("is-visible"),
});

/* ── Contact form → FormSubmit ── */
const leadForm = document.getElementById("leadForm");
const formStatus = document.getElementById("formStatus");
const formSubmitBtn = document.getElementById("formSubmitBtn");

leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formStatus.textContent = "";
  formStatus.className = "form-status";
  formSubmitBtn.disabled = true;
  formSubmitBtn.textContent = "Sending…";

  const data = new FormData(leadForm);
  const payload = {
    "Full Name": data.get("name"),
    "Phone / WhatsApp": data.get("phone"),
    "Business Name": data.get("business"),
    "Interested Package": data.get("package"),
    Message: data.get("message") || "—",
    _subject: "New Website Package Enquiry — Innovgeist",
    _captcha: "false",
    _template: "table",
  };

  try {
    const res = await fetch("https://formsubmit.co/ajax/replyrgupta@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      formStatus.textContent = "Thanks — we'll reach out shortly. You can also WhatsApp us directly for a faster reply.";
      formStatus.classList.add("success");
      leadForm.reset();
    } else {
      throw new Error("Non-OK response");
    }
  } catch (err) {
    formStatus.textContent = "Something went wrong. Please WhatsApp us directly at +91-9305602733.";
    formStatus.classList.add("error");
  } finally {
    formSubmitBtn.disabled = false;
    formSubmitBtn.textContent = "Send Enquiry";
  }
});

/* ── Live capture form (AI & Automation demo) ── */
const captureForm = document.getElementById("captureForm");
if (captureForm) {
  const captureBtn = document.getElementById("captureBtn");
  const captureStatus = document.getElementById("captureStatus");
  const captureDone = document.getElementById("captureDone");
  const captureRecord = document.getElementById("captureRecord");

  captureForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    captureStatus.textContent = "";
    captureStatus.className = "form-status";
    captureBtn.disabled = true;
    captureBtn.textContent = "Capturing…";

    const data = new FormData(captureForm);
    const record = {
      Name: data.get("name"),
      Email: data.get("email"),
      "Phone / WhatsApp": data.get("phone"),
      Business: data.get("business") || "—",
      Needs: data.get("need"),
    };
    const payload = {
      ...record,
      _subject: "New Live-Capture Lead — Innovgeist site",
      _captcha: "false",
      _template: "table",
    };

    try {
      const res = await fetch("https://formsubmit.co/ajax/replyrgupta@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Non-OK response");

      // Show the captured record — demonstrates exactly what the flow does
      captureRecord.innerHTML = "";
      Object.entries(record).forEach(([key, value]) => {
        const dt = document.createElement("dt");
        dt.textContent = key;
        const dd = document.createElement("dd");
        dd.textContent = value;
        captureRecord.append(dt, dd);
      });
      captureForm.hidden = true;
      captureDone.hidden = false;
    } catch (err) {
      captureStatus.textContent = "Couldn't send just now — please WhatsApp us at +91-9305602733.";
      captureStatus.classList.add("error");
    } finally {
      captureBtn.disabled = false;
      captureBtn.textContent = "Capture My Details";
    }
  });
}

/* ── Diwali Spin & Win ── */
(() => {
  const END = new Date("2026-11-15T23:59:59+05:30");
  if (Date.now() > END.getTime()) return;

  // Google Apps Script web app URL (see apps-script/diwali-spin.gs)
  const SPIN_ENDPOINT = "https://script.google.com/macros/s/AKfycbwdEI2unb4rXXNcvI5ewi97bBpswG0snDH3WUc0r3wtWqCc2EOanpx2oIjdQ9q8gG5amg/exec";
  const STORE_KEY = "ig-diwali-spin-2026";
  const WA_NUMBER = "919305602733";
  const EMAIL = "sales@innovgeist.com";

  // Order and labels must match PRIZES in apps-script/diwali-spin.gs.
  // Odds live on the server only.
  const PRIZES = [
    { label: "FREE Website", size: 14, full: "a FREE single-page website", jackpot: true },
    { label: "₹1,000 OFF Starter", size: 54, full: "₹1,000 off the Starter website" },
    { label: "FREE SEO Audit", size: 64, full: "a FREE SEO audit" },
    { label: "₹5,000 OFF Pro", size: 30, full: "₹5,000 off the Pro website" },
    { label: "FREE Extra Page", size: 36, full: "one extra page FREE" },
    { label: "FREE Hosting 3 Yrs", size: 14, full: "FREE hosting for 3 years", jackpot: true },
    { label: "₹2,000 OFF Growth", size: 40, full: "₹2,000 off the Growth website" },
    { label: "FREE Google Listing", size: 34, full: "FREE Google Business Profile setup" },
    { label: "FREE Logo", size: 30, full: "a FREE logo design" },
    { label: "FREE Hosting Yr 2", size: 44, full: "FREE hosting for the 2nd year" },
  ];

  const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,59}$/u;
  const PHONE_RE = /^(?:\+91[\s-]?|0)?([6-9]\d{4})[\s-]?(\d{5})$/;
  const EMAIL_RE = /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
  const CODE_RE = /^DIWALI-[A-Z2-9]{6}$/;
  const ERRORS = {
    invalid_name: "Please enter your name (letters only).",
    invalid_contact: "Enter a valid 10-digit mobile number or email address.",
    consent_required: "Please accept the Terms & Conditions to spin.",
    offer_ended: "The Diwali offer has ended.",
    busy: "Lots of people are spinning right now — please try again in a minute.",
  };
  const GENERIC_ERROR = "Couldn't connect just now. Please try again.";

  const cleanName = (v) => {
    const s = v.normalize("NFC").replace(/\s+/g, " ").trim();
    return NAME_RE.test(s) ? s : null;
  };
  const parseContact = (raw) => {
    const v = raw.trim();
    if (v.length > 254) return null;
    const m = v.match(PHONE_RE);
    if (m) return { type: "Phone", value: m[1] + m[2] };
    if (EMAIL_RE.test(v)) return { type: "Email", value: v.toLowerCase() };
    return null;
  };

  const bar = document.getElementById("diwaliBar");
  const floatBtn = document.getElementById("spinFloat");
  const modal = document.getElementById("spinModal");
  const wheel = document.getElementById("wheel");
  const form = document.getElementById("spinForm");
  const nameIn = document.getElementById("spinName");
  const contactIn = document.getElementById("spinContact");
  const hpIn = document.getElementById("spinWebsite");
  const consentIn = document.getElementById("spinConsent");
  const errorEl = document.getElementById("spinError");
  const spinBtn = document.getElementById("spinBtn");
  const resultEl = document.getElementById("spinResult");
  const subEl = document.getElementById("spinSub");
  if (!bar || !floatBtn || !modal || !wheel) return;

  const STARTS = PRIZES.map((_, i) => PRIZES.slice(0, i).reduce((a, p) => a + p.size, 0));
  const MID = PRIZES.map((p, i) => STARTS[i] + p.size / 2);
  const CX = 160, CY = 160, R = 150;
  const NS = "http://www.w3.org/2000/svg";
  const pt = (deg, r) => {
    const a = (deg * Math.PI) / 180;
    return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
  };
  const el = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  };

  PRIZES.forEach((p, i) => {
    const a0 = STARTS[i], a1 = a0 + p.size;
    const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
    const fill = p.jackpot ? "#F59E0B" : i % 2 ? "#2A2118" : "#1D1A17";
    const ink = p.jackpot ? "#17130F" : "#F5F0EB";
    wheel.append(el("path", {
      d: `M${CX},${CY} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`,
      fill, stroke: "#0C0A09", "stroke-width": 1.5,
    }));
    const t = el("text", {
      x: CX + R * 0.6, y: CY, fill: ink,
      "text-anchor": "middle", "dominant-baseline": "middle",
      transform: `rotate(${MID[i] - 90} ${CX} ${CY})`,
    });
    t.textContent = p.label;
    wheel.append(t);
  });

  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      return d && PRIZES[d.index] && CODE_RE.test(d.code) ? d : null;
    } catch (e) { return null; }
  };
  const save = (data) => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
  };

  let angle = 0;
  const setAngle = (deg, transition) => {
    wheel.style.transition = transition || "none";
    wheel.style.transform = `rotate(${deg}deg)`;
    angle = deg;
  };
  const restAngle = (index) => 360 - MID[index];

  let raf = 0;
  const startSpinning = () => {
    let last = performance.now();
    let speed = 0;
    const tick = (now) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      speed = Math.min(speed + 1800 * dt, 1080);
      setAngle(angle + speed * dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };
  const stopSpinning = () => cancelAnimationFrame(raf);

  const landOn = (index) => new Promise((resolve) => {
    stopSpinning();
    const jitter = (Math.random() - 0.5) * PRIZES[index].size * 0.7;
    const target = restAngle(index) + jitter;
    let final = angle + 360 * 4;
    final += (((target - final) % 360) + 360) % 360;
    requestAnimationFrame(() => {
      setAngle(final, "transform 4.4s cubic-bezier(0.2, 0.6, 0.25, 1)");
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      wheel.addEventListener("transitionend", finish, { once: true });
      setTimeout(finish, 4800);
    });
  });

  const showResult = (data, repeat) => {
    const prize = PRIZES[data.index];
    document.getElementById("spinPrize").textContent = prize.label;
    document.getElementById("spinCode").textContent = data.code;
    const msg = `Hi Innovgeist! I won ${prize.full} in your Diwali Spin & Win.\n\nCoupon code: ${data.code}\nName: ${data.name}\n${data.contactType}: ${data.contact}\n\nI'd like to redeem this offer.`;
    document.getElementById("spinWa").href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    document.getElementById("spinMail").href =
      `mailto:${EMAIL}?subject=${encodeURIComponent(`Diwali Spin & Win — Coupon ${data.code}`)}&body=${encodeURIComponent(msg)}`;
    subEl.textContent = repeat
      ? `${data.name}, you've already spun — here's your offer. Share this coupon code with us before 15 Nov to claim it.`
      : `Congratulations, ${data.name}! Share this coupon code with us before 15 Nov to claim it.`;
    form.hidden = true;
    resultEl.hidden = false;
  };

  const lockForm = (locked) => {
    spinBtn.disabled = locked;
    spinBtn.textContent = locked ? "Spinning…" : "Spin The Wheel";
    nameIn.disabled = contactIn.disabled = consentIn.disabled = locked;
  };

  const open = (e) => {
    if (e) e.preventDefault();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const saved = load();
    if (saved) {
      setAngle(restAngle(saved.index));
      showResult(saved, false);
    } else {
      nameIn.focus();
    }
  };
  const close = () => {
    if (spinBtn.disabled) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  const copyBtn = document.getElementById("spinCopy");
  const copyText = document.getElementById("spinCopyText");
  copyBtn.addEventListener("click", async () => {
    const code = document.getElementById("spinCode").textContent;
    try {
      await navigator.clipboard.writeText(code);
      copyText.textContent = "Copied";
    } catch (e) {
      const r = document.createRange();
      r.selectNodeContents(document.getElementById("spinCode"));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      copyText.textContent = "Selected";
    }
    setTimeout(() => { copyText.textContent = "Copy"; }, 2000);
  });

  bar.hidden = false;
  floatBtn.hidden = false;
  document.body.classList.add("diwali-on");
  bar.addEventListener("click", open);
  floatBtn.addEventListener("click", open);
  document.getElementById("spinClose").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });

  let autoSeen = false;
  try { autoSeen = sessionStorage.getItem("ig-diwali-popup") === "1"; } catch (e) {}
  if (!autoSeen && !load()) {
    setTimeout(() => {
      if (!modal.hidden) return;
      open();
      try { sessionStorage.setItem("ig-diwali-popup", "1"); } catch (e) {}
    }, 1500);
  }

  const requestSpin = async (payload) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(SPIN_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (spinBtn.disabled) return;
    const name = cleanName(nameIn.value);
    const contact = parseContact(contactIn.value);
    if (!name) { errorEl.textContent = ERRORS.invalid_name; nameIn.focus(); return; }
    if (!contact) { errorEl.textContent = ERRORS.invalid_contact; contactIn.focus(); return; }
    if (!consentIn.checked) { errorEl.textContent = ERRORS.consent_required; consentIn.focus(); return; }
    if (!/^https:\/\/script\.google\.com\//.test(SPIN_ENDPOINT)) { errorEl.textContent = GENERIC_ERROR; return; }

    errorEl.textContent = "";
    lockForm(true);
    startSpinning();

    let res;
    try {
      res = await requestSpin({
        name,
        contact: contact.value,
        consent: true,
        website: hpIn ? hpIn.value : "",
      });
    } catch (err) {
      res = null;
    }

    const valid = res && res.ok === true
      && Number.isInteger(res.index) && PRIZES[res.index]
      && res.label === PRIZES[res.index].label
      && typeof res.code === "string" && CODE_RE.test(res.code);

    if (!valid) {
      stopSpinning();
      lockForm(false);
      errorEl.textContent = (res && ERRORS[res.error]) || GENERIC_ERROR;
      return;
    }

    const data = { name, contact: contact.value, contactType: contact.type, index: res.index, code: res.code };
    save(data);
    await landOn(res.index);
    lockForm(false);
    showResult(data, res.repeat === true);
  });
})();
