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
