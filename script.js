document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () { header.classList.toggle("open"); });
    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () { header.classList.remove("open"); });
    });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mockupBack = document.querySelector(".mockup-back");
  var mockupFront = document.querySelector(".mockup-front");
  var scrollTicking = false;
  function onScrollEffects() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (!reduceMotion && mockupBack && mockupFront) {
      mockupBack.style.setProperty("--py", Math.min(y * 0.08, 40) + "px");
      mockupFront.style.setProperty("--py2", Math.max(y * -0.06, -34) + "px");
    }
    scrollTicking = false;
  }
  window.addEventListener("scroll", function () {
    if (scrollTicking) return;
    scrollTicking = true;
    setTimeout(onScrollEffects, 16);
  }, { passive: true });
  onScrollEffects();

  // Reveal on scroll, with alternating left/right/scale variants for grid items
  var revealGroups = [
    { sel: ".stat-item, .honesty-note", variant: "reveal" },
    { sel: ".process-step, .mini-service, .addon-strip", variant: "scale" },
    { sel: ".card, .tier-card, .value-item, .review-card, .work-card, .insight-card", variant: "sides" }
  ];
  var revealTargets = [];
  revealGroups.forEach(function (group) {
    document.querySelectorAll(group.sel).forEach(function (el, i) {
      if (el.dataset.revealed) return;
      el.dataset.revealed = "1";
      if (group.variant === "scale") {
        el.classList.add("reveal-scale");
      } else if (group.variant === "sides") {
        el.classList.add(i % 2 === 0 ? "reveal-left" : "reveal-right");
      } else {
        el.classList.add("reveal");
      }
      el.style.transitionDelay = Math.min(i % 4, 3) * 90 + "ms";
      revealTargets.push(el);
    });
  });

  if ("IntersectionObserver" in window && revealTargets.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("visible"); });
  }

  var counters = document.querySelectorAll("[data-count-to]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 900;
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor(progress * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); counterObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  // --- Scroll progress bar ---
  var progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.appendChild(progressBar);
  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // --- Scroll-down cue on the homepage hero ---
  var hero = document.querySelector(".hero");
  if (hero && !reduceMotion) {
    var cue = document.createElement("div");
    cue.className = "scroll-cue";
    cue.innerHTML = '<span>Scroll</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
    hero.appendChild(cue);
  }

  // --- Cursor spotlight glow over dark / hero sections ---
  var isFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (isFinePointer && !reduceMotion) {
    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    var glowZones = document.querySelectorAll(".hero, .section-dark, .cta-band, .page-hero");
    glowZones.forEach(function (zone) { zone.classList.add("glow-zone"); });
    document.addEventListener("mousemove", function (e) {
      var overZone = e.target.closest(".glow-zone");
      glow.style.opacity = overZone ? "1" : "0";
      glow.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px)";
    });

    // --- 3D tilt on cards ---
    document.querySelectorAll(".card, .tier-card").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = "translateY(-4px) rotateX(" + (y * -6) + "deg) rotateY(" + (x * 8) + "deg)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });

    // --- Magnetic pull on primary buttons ---
    document.querySelectorAll(".btn-primary, .btn-coral").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + x * 0.18 + "px, " + (y * 0.28 - 2) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  // --- Ambient network background, site-wide: a faint, cursor-reactive node field ---
  (function () {
    var canvas = document.createElement("canvas");
    canvas.className = "ambient-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext("2d");
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, nodes;
    var mouse = { x: -9999, y: -9999, active: false };
    var NODE_COUNT_PER_PX = 1 / 26000; // scales with viewport area

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var count = Math.max(22, Math.min(60, Math.round(w * h * NODE_COUNT_PER_PX)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: 1.2 + Math.random() * 1.6,
          coral: Math.random() < 0.14
        });
      }
    }

    document.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    document.addEventListener("mouseleave", function () { mouse.active = false; });

    var LINK_DIST = 150;
    var MOUSE_LINK_DIST = 180;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        for (var j = i + 1; j < nodes.length; j++) {
          var o = nodes[j];
          var dx = n.x - o.x, dy = n.y - o.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = "rgba(59, 76, 240, " + (0.09 * (1 - dist / LINK_DIST)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(o.x, o.y);
            ctx.stroke();
          }
        }

        if (mouse.active) {
          var mdx = n.x - mouse.x, mdy = n.y - mouse.y;
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < MOUSE_LINK_DIST) {
            ctx.strokeStyle = "rgba(255, 107, 74, " + (0.22 * (1 - mdist / MOUSE_LINK_DIST)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = n.coral ? "rgba(255, 107, 74, 0.35)" : "rgba(59, 76, 240, 0.28)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    draw();
  })();
});

(function () {
  var questions = [
    { q: "Where does your business currently have a presence online?", options: [
      { t: "Nowhere really, just word of mouth", s: 1 },
      { t: "A Facebook or Instagram page, nothing else", s: 2 },
      { t: "An old website that's rarely updated", s: 2 },
      { t: "A website that actually works well for us", s: 4 }
    ]},
    { q: "How does your website look on a phone?", options: [
      { t: "Don't have one to check", s: 1 },
      { t: "A bit awkward, wasn't built for mobile", s: 2 },
      { t: "Okay, but could be better", s: 3 },
      { t: "Looks great, built mobile-first", s: 4 }
    ]},
    { q: "Are you found on Google when someone searches for what you do?", options: [
      { t: "Not that we know of", s: 1 },
      { t: "Sometimes, if they search our exact name", s: 2 },
      { t: "Usually, for local searches", s: 3 },
      { t: "Yes, consistently near the top", s: 4 }
    ]},
    { q: "Where does your business data live?", options: [
      { t: "Scattered across email, spreadsheets and people's heads", s: 1 },
      { t: "In a few systems, but not well connected", s: 2 },
      { t: "Mostly in central systems (CRM, accounting, etc.)", s: 3 },
      { t: "Centralised, organised and easy to access", s: 4 }
    ]},
    { q: "Do you run any paid ads (Facebook, Instagram, Google)?", options: [
      { t: "No, never tried", s: 1 },
      { t: "Tried once, didn't manage it well", s: 2 },
      { t: "Yes, but not sure it's working", s: 3 },
      { t: "Yes, and we track what it brings in", s: 4 }
    ]},
    { q: "What happens to enquiries that come in?", options: [
      { t: "They can get missed or forgotten", s: 1 },
      { t: "We reply eventually", s: 2 },
      { t: "We reply quickly, tracked loosely", s: 3 },
      { t: "Every lead is tracked and followed up automatically", s: 4 }
    ]}
  ];

  var current = 0;
  var scores = [];
  var body = document.getElementById("quiz-body");
  var fill = document.getElementById("quiz-progress-fill");
  var stepLabel = document.getElementById("quiz-step-label");
  var pctLabel = document.getElementById("quiz-percent-label");
  var metaRow = document.getElementById("quiz-meta-row");
  var progressTrack = document.querySelector(".quiz-progress-track");
  if (!body) return;

  function renderQuestion() {
    var qd = questions[current];
    var pct = Math.round((current / questions.length) * 100);
    fill.style.width = pct + "%";
    stepLabel.textContent = "Question " + (current + 1) + " of " + questions.length;
    pctLabel.textContent = pct + "%";

    var html = '<div class="quiz-question"><h3>' + qd.q + '</h3><div class="quiz-options">';
    qd.options.forEach(function (opt) {
      html += '<button type="button" class="quiz-option" data-score="' + opt.s + '">' + opt.t + "</button>";
    });
    html += "</div></div>";
    body.innerHTML = html;

    body.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        scores.push(parseInt(btn.getAttribute("data-score"), 10));
        current++;
        if (current < questions.length) { renderQuestion(); } else { renderResult(); }
      });
    });
  }

  function renderResult() {
    metaRow.style.display = "none";
    progressTrack.style.display = "none";
    var total = scores.reduce(function (a, b) { return a + b; }, 0);
    var max = questions.length * 4;
    var pct = Math.round((total / max) * 100);
    var tag, heading, desc, ctaText;
    if (total <= 12) {
      tag = "Foundation stage"; heading = "There's real headroom here";
      desc = "The basics aren't quite in place yet, which is completely normal and very fixable. A properly built, hosted site with basic SEO would make the biggest difference right now.";
      ctaText = "See the Silver plan";
    } else if (total <= 19) {
      tag = "Growing steadily"; heading = "You've got a base, now build on it";
      desc = "The foundations are there. Adding full SEO and consistent social media would be the next real step up.";
      ctaText = "See the Gold plan";
    } else {
      tag = "Ahead of most"; heading = "You're doing better than most";
      desc = "Solid digital presence already. AI and automation, scoped to your business, would likely be the highest-leverage next move.";
      ctaText = "See AI & automation";
    }
    body.innerHTML =
      '<div class="quiz-result">' +
      '<div class="score-ring" style="--pct:' + pct + ';"><div class="score-ring-inner"><span class="num">' + total + '</span><span class="of">out of ' + max + '</span></div></div>' +
      '<span class="tag">' + tag + '</span>' +
      '<h3>' + heading + '</h3>' +
      '<p>' + desc + '</p>' +
      '<div class="quiz-result-actions">' +
      '<a href="services.html" class="btn btn-primary">' + ctaText + '</a>' +
      '<a href="index.html#contact" class="btn btn-outline">Talk it through instead</a>' +
      '</div></div>';
  }

  renderQuestion();
})();

(function () {
  var KEY = "adaptum-cookie-consent";
  var banner = document.getElementById("cookie-banner");
  var acceptBtn = document.getElementById("cookie-accept");
  var declineBtn = document.getElementById("cookie-decline");
  if (!banner) return;

  function loadAnalytics() {
    if (typeof window.__gaLoad === "function") window.__gaLoad();
  }

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}

  if (stored === "accepted") {
    loadAnalytics();
  } else if (stored !== "declined") {
    banner.hidden = false;
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      try { localStorage.setItem(KEY, "accepted"); } catch (e) {}
      banner.hidden = true;
      loadAnalytics();
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener("click", function () {
      try { localStorage.setItem(KEY, "declined"); } catch (e) {}
      banner.hidden = true;
    });
  }
})();
