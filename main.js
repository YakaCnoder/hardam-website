(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      mainNav.style.display = isOpen ? "flex" : "";
    });
  }

  /* ---------- "Now Serving" queue board cycling ---------- */
  var departments = [
    { name: "Registrar's Office", prefix: "A", window: "03" },
    { name: "Billing & Cashier", prefix: "B", window: "05" },
    { name: "Outpatient (OPD)", prefix: "C", window: "02" },
    { name: "Business Permits", prefix: "D", window: "07" }
  ];
  var ticketEl = document.getElementById("ticketNumber");
  var windowEl = document.getElementById("windowNumber");
  var nameEl = document.querySelector(".board-name");
  var upNextEl = document.getElementById("upNext");
  var seq = 47;
  var deptIndex = 0;

  function pad(n) {
    return n.toString().padStart(3, "0");
  }

  function renderTicket() {
    var dept = departments[deptIndex];
    if (!ticketEl || !windowEl || !nameEl || !upNextEl) return;

    ticketEl.style.opacity = 0;
    setTimeout(function () {
      ticketEl.textContent = dept.prefix + pad(seq);
      windowEl.textContent = dept.window;
      nameEl.textContent = dept.name;
      upNextEl.innerHTML = "";
      for (var i = 1; i <= 3; i++) {
        var li = document.createElement("li");
        li.textContent = dept.prefix + pad(seq + i);
        upNextEl.appendChild(li);
      }
      ticketEl.style.opacity = 1;
    }, reduceMotion ? 0 : 180);
  }

  function advanceTicket() {
    seq += 1;
    if (seq % 6 === 0) {
      deptIndex = (deptIndex + 1) % departments.length;
      seq = 40 + Math.floor(Math.random() * 5);
    }
    renderTicket();
  }

  renderTicket();
  if (!reduceMotion) {
    setInterval(advanceTicket, 2600);
  }

  /* ---------- Count-up stats & KPIs ---------- */
  var countEls = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var countObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  countEls.forEach(function (el) {
    countObserver.observe(el);
  });

  /* ---------- Reveal dashboard chart bars ---------- */
  var chart = document.querySelector(".mock-chart");
  if (chart) {
    var chartObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            chart.classList.add("in-view");
            chartObserver.unobserve(chart);
          }
        });
      },
      { threshold: 0.3 }
    );
    chartObserver.observe(chart);
  }

  /* ---------- Dark / light mode ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("hardam-theme"); } catch (e) {}
  if (stored === "dark") root.setAttribute("data-theme", "dark");

  function setToggleIcon() {
    if (!themeToggle) return;
    var isDark = root.getAttribute("data-theme") === "dark";
    themeToggle.innerHTML = isDark
      ? '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v1.6M9 13.4V15M15 9h-1.6M4.6 9H3M13 13l-1.1-1.1M6.1 6.1L5 5M13 5l-1.1 1.1M6.1 11.9L5 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="9" r="3.4" stroke="currentColor" stroke-width="1.5"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15.5 10.8A6.5 6.5 0 017.2 2.5a6.7 6.7 0 100 13 6.5 6.5 0 008.3-4.7z" fill="currentColor"/></svg>';
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
  setToggleIcon();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", "dark");
      }
      try { localStorage.setItem("hardam-theme", isDark ? "light" : "dark"); } catch (e) {}
      setToggleIcon();
    });
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var q = item.querySelector(".faq-q");
    if (!q) return;
    q.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      faqItems.forEach(function (i) { i.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* ---------- Contact form (static site — no backend) ---------- */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("formStatus");
      if (status) status.textContent = "Thanks — this is a preview form. Connect it to your email or CRM endpoint to go live.";
    });
  }

  /* ---------- Back-to-top button ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("visible", window.scrollY > 600);
    });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
