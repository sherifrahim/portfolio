/* ==========================================================================
   Sherif Rahim — portfolio
   Vanilla JS, no dependencies. Sections:
   utils · theme · KQL highlighter · intro · hero (role cuts, terminal, network)
   · scroll engine (reel cuts, dolly, zoom, timeline, HUD) · reveals · tilt/magnetic
   · detection tabs · projects (filter, screenshots, lightbox) · palette · misc
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- utils ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var pad = function (n, l) { n = String(n); while (n.length < (l || 2)) n = "0" + n; return n; };
  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var vh = window.innerHeight, vw = window.innerWidth;

  /* ---------- toast ---------- */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    if (!toastEl) return;
    $("span", toastEl).textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }
  function copyText(text, okMsg) {
    var done = function () { toast(okMsg || "Copied to clipboard"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Press Ctrl+C to copy"); }
      document.body.removeChild(ta);
    }
  }

  /* ---------- theme ---------- */
  var themeBtn = $("#theme-toggle");
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "light" ? "#f5f7fb" : "#06080c");
    netColor();
  }
  function toggleTheme() { applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light"); }
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  /* ---------- KQL highlighter ---------- */
  var KW = {};
  ("let where summarize project extend join kind inner leftanti on by in has has_any has_all contains startswith endswith " +
   "order sort top take limit distinct union asc desc and or not between render barchart timechart piechart true false " +
   "let print datatable materialize")
    .split(" ").forEach(function (k) { KW[k] = 1; });
  var TOKEN = /(\/\/.*$)|(@?"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(\d+(?:\.\d+)?(?:ms|[smhdw])?)\b|\b([A-Za-z_][A-Za-z0-9_]*)\b|(\|)/g;
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function highlightLine(line) {
    var out = "", last = 0, m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(line))) {
      out += esc(line.slice(last, m.index));
      var t = m[0];
      if (m[1]) out += '<span class="tk-c">' + esc(t) + "</span>";
      else if (m[2]) out += '<span class="tk-s">' + esc(t) + "</span>";
      else if (m[3]) out += '<span class="tk-n">' + esc(t) + "</span>";
      else if (m[5]) out += '<span class="tk-o">|</span>';
      else if (KW[t]) out += '<span class="tk-k">' + t + "</span>";
      else if (line.charAt(m.index + t.length) === "(") out += '<span class="tk-f">' + t + "</span>";
      else out += esc(t);
      last = m.index + t.length;
    }
    return out + esc(line.slice(last));
  }
  function kqlHtml(text) { return text.split("\n").map(highlightLine).join("\n"); }

  /* ======================================================================
     INTRO — title card, boot sequence, jump-cut flash, curtain split
     ====================================================================== */
  var heroStarted = false;
  var intro = $("#intro");
  var introTimers = [];
  function later(fn, ms) { var t = setTimeout(fn, ms); introTimers.push(t); return t; }

  function runIntro() {
    if (!intro) { startHero(); return; }
    if (reduced || store.get("introSeen")) { intro.remove(); startHero(); return; }
    store.set("introSeen", "1");
    root.style.overflow = "hidden";

    var boot = $("#boot"), pct = $("#intro-pct"), flash = $(".flash", intro);
    var lines = [
      "> <b>init</b> soc.environment",
      "> loading detection content ........ <span class='ok'>ok</span>",
      "> onboarding telemetry sources ..... <span class='ok'>ok</span>",
      "> correlating signals ............... <span class='ok'>ok</span>",
      "> <b>all systems nominal</b>"
    ];
    var start = performance.now(), dur = 1500, shown = 0, finished = false;

    function frame(now) {
      if (finished) return;
      var p = clamp((now - start) / dur, 0, 1);
      var e = 1 - Math.pow(1 - p, 3);
      pct.textContent = pad(Math.round(e * 100), 3);
      var want = Math.floor(p * (lines.length + 0.4));
      while (shown < Math.min(want, lines.length)) { boot.innerHTML += lines[shown++] + "<br>"; }
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    later(function () { // jump cut → title card
      flash.classList.add("go");
      intro.classList.add("title-on");
    }, dur + 120);
    later(finish, dur + 120 + 1750);

    function finish() {
      if (finished) return; finished = true;
      introTimers.forEach(clearTimeout);
      intro.classList.add("out");
      later(startHero, 380);
      setTimeout(function () { root.style.overflow = ""; if (intro && intro.parentNode) intro.remove(); }, 1100);
    }
    var skip = $("#intro-skip");
    function skipNow() { if (!finished) { intro.classList.add("title-on"); finish(); } }
    skip.addEventListener("click", skipNow);
    window.addEventListener("keydown", function k(e) {
      if (finished) { window.removeEventListener("keydown", k); return; }
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") { e.preventDefault(); skipNow(); }
    });
  }

  /* ======================================================================
     HERO — role jump cuts, terminal typing, camera pull-back
     ====================================================================== */
  var roles = ["SOC & Security Engineer", "Detection Engineer", "Threat Hunter", "Sentinel & Defender XDR Specialist", "KQL Author"];
  function roleCuts() {
    var el = $("#role"); if (!el || reduced) return;
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      i = (i + 1) % roles.length;
      el.textContent = roles[i];
      el.classList.remove("punch"); void el.offsetWidth; el.classList.add("punch");
    }, 2300);
  }

  function terminalType() {
    var pre = $("#term-code"), rows = $$("#term-results .row");
    if (!pre) return;
    var text = pre.textContent;
    function showRows() { rows.forEach(function (r, i) { setTimeout(function () { r.classList.add("show"); }, reduced ? 0 : 260 * i + 120); }); }
    if (reduced) { pre.innerHTML = kqlHtml(text); showRows(); return; }
    pre.innerHTML = "";
    var i = 0;
    (function step() {
      i += 2;
      pre.innerHTML = kqlHtml(text.slice(0, i)) + '<span class="caret" style="display:inline-block;width:7px;height:1em;background:var(--accent);vertical-align:-2px;margin-left:1px;animation:blink 1s steps(2) infinite"></span>';
      if (i < text.length) setTimeout(step, 16 + Math.random() * 22);
      else { pre.innerHTML = kqlHtml(text); setTimeout(showRows, 300); }
    })();
  }

  function startHero() {
    if (heroStarted) return; heroStarted = true;
    root.classList.add("hero-go");
    var g = $("#hero-grid");
    if (g && !reduced) { g.classList.add("pull"); g.addEventListener("animationend", function () { g.classList.remove("pull"); }, { once: true }); }
    $$("#hero-grid .reveal").forEach(function (el) { el.classList.add("in"); });
    terminalType();
    roleCuts();
    setTimeout(function () { $$("#hero-grid .reveal").forEach(function (el) { el.classList.add("settled"); }); }, 1500);
  }

  /* ---------- network canvas ---------- */
  var canvas = $("#net"), ctx = canvas && canvas.getContext("2d");
  var nodes = [], cw = 0, ch = 0, dpr = 1, mouse = { x: -999, y: -999 }, netOn = true, netRGB = "52,211,192";
  function netColor() {
    var c = getComputedStyle(root).getPropertyValue("--accent").trim();
    var m = /^#?([0-9a-f]{6})$/i.exec(c);
    if (m) { var n = parseInt(m[1], 16); netRGB = ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255); }
  }
  function netSize() {
    if (!canvas) return;
    var r = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = r.width; ch = r.height;
    canvas.width = cw * dpr; canvas.height = ch * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(clamp((cw * ch) / 15000, 24, 95));
    nodes = [];
    for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * cw, y: Math.random() * ch, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.6 + 0.6, hot: Math.random() < 0.08 });
  }
  function netDraw(move) {
    ctx.clearRect(0, 0, cw, ch);
    var link = 135, i, j, a, b, dx, dy, d;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      if (move) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > cw) a.vx *= -1;
        if (a.y < 0 || a.y > ch) a.vy *= -1;
        dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150 && d > 1) { a.x -= (dx / d) * 0.6; a.y -= (dy / d) * 0.6; }
      }
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
        if (d < link * link) {
          ctx.strokeStyle = "rgba(" + netRGB + "," + (0.2 * (1 - Math.sqrt(d) / link)) + ")";
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
      if (d < 190) { ctx.strokeStyle = "rgba(" + netRGB + "," + (0.5 * (1 - d / 190)) + ")"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      ctx.fillStyle = a.hot ? "rgba(248,113,113,.9)" : "rgba(" + netRGB + ",.75)";
      ctx.beginPath(); ctx.arc(a.x, a.y, a.hot ? a.r + 1.2 : a.r, 0, 6.2832); ctx.fill();
      if (a.hot) { ctx.strokeStyle = "rgba(248,113,113,.25)"; ctx.beginPath(); ctx.arc(a.x, a.y, a.r + 6 + Math.sin(performance.now() / 300 + i) * 2, 0, 6.2832); ctx.stroke(); }
    }
  }
  function netLoop() { if (netOn && !document.hidden) netDraw(true); requestAnimationFrame(netLoop); }
  if (canvas) {
    netColor(); netSize();
    window.addEventListener("resize", function () { vh = innerHeight; vw = innerWidth; netSize(); if (reduced) netDraw(false); });
    $("#home").addEventListener("pointermove", function (e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    $("#home").addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });
    new IntersectionObserver(function (en) { netOn = en[0].isIntersecting; }).observe($("#home"));
    if (reduced) netDraw(false); else requestAnimationFrame(netLoop);
  }

  /* ---------- hero terminal tilt + cursor glow ---------- */
  var term = $("#terminal");
  if (term && finePointer && !reduced) {
    var tw = $(".terminal-wrap");
    tw.addEventListener("pointermove", function (e) {
      var r = tw.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      term.style.transform = "rotateY(" + (x * 9).toFixed(2) + "deg) rotateX(" + (-y * 9).toFixed(2) + "deg)";
    });
    tw.addEventListener("pointerleave", function () { term.style.transform = ""; });
  }
  var glow = $("#cursor-glow");
  if (glow && finePointer && !reduced) {
    var gx = 0, gy = 0, gp = false;
    window.addEventListener("pointermove", function (e) {
      gx = e.clientX; gy = e.clientY;
      if (!gp) { gp = true; requestAnimationFrame(function () { glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0) translate(-50%,-50%)"; glow.classList.add("on"); gp = false; }); }
    }, { passive: true });
  }

  /* ======================================================================
     SCROLL ENGINE — progress, nav, spy, dolly, reel cuts, zoom, timeline, HUD
     ====================================================================== */
  var nav = $("#nav"), progress = $("#scroll-progress"), heroGrid = $("#hero-grid");
  var reel = $("#reel"), reelTrack = $("#reel-track"), shots = $$(".shot", reel || document);
  var ticks = $$(".reel-ticks i"), reelFlash = $("#reel-flash"), reelTC = $("#reel-tc"), reelNo = $("#reel-shotno");
  var timeline = $("#timeline"), zoomers = $$("[data-zoom]"), marquee = $("#marquee-track");
  var scenes = $$("[data-scene]"), hudSc = $("#hud-sc"), spyLinks = $$("[data-spy]");
  var curShot = 0, skew = 0, lastY = window.scrollY, ticking = false, curScene = -1;

  if (reduced && reel) reel.classList.add("static");
  var credits = $("#credits"); if (reduced && credits) credits.classList.add("static");

  function tc(sec) {
    var s = Math.floor(sec), f = Math.floor((sec - s) * 24);
    return pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60) + ":" + pad(f);
  }

  function cutTo(i) {
    shots.forEach(function (s, k) { s.classList.toggle("active", k === i); });
    ticks.forEach(function (t, k) { t.classList.toggle("on", k === i); });
    if (reelNo) reelNo.textContent = "Shot " + pad(i + 1) + " / " + pad(shots.length);
    if (reelFlash) { reelFlash.classList.remove("go"); void reelFlash.offsetWidth; reelFlash.classList.add("go"); }
    curShot = i;
  }

  function update() {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - vh;

    // progress + nav
    progress.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    nav.classList.toggle("scrolled", y > 30);

    // hero dolly-out
    if (heroGrid && !reduced && !heroGrid.classList.contains("pull")) {
      var hp = clamp(y / (vh * 0.9), 0, 1);
      heroGrid.style.transform = hp > 0 ? "translateY(" + (-hp * 40).toFixed(1) + "px) scale(" + (1 - hp * 0.08).toFixed(4) + ")" : "";
      heroGrid.style.opacity = hp > 0 ? (1 - hp * 0.95).toFixed(3) : "";
    }

    // reel — scrubbed jump cuts + letterbox
    var cb = 0;
    if (reel && reelTrack) {
      var rr = reelTrack.getBoundingClientRect();
      if (!reel.classList.contains("static")) {
        var total = reelTrack.offsetHeight - vh;
        var p = clamp(-rr.top / total, 0, 1);
        var n = shots.length, idx = Math.min(n - 1, Math.floor(p * n)), within = p * n - idx;
        if (idx !== curShot && rr.top < vh && rr.bottom > 0) cutTo(idx);
        shots[curShot].style.setProperty("--kb", clamp(within, 0, 1).toFixed(3));
        reel.style.setProperty("--rp", p.toFixed(3));
        $(".reel-progress", reel).style.setProperty("--rp", p.toFixed(3));
        if (reelTC) reelTC.textContent = tc(p * 24);
        var inE = clamp((vh * 0.85 - rr.top) / (vh * 0.45), 0, 1);
        var outE = clamp((rr.bottom - vh * 0.15) / (vh * 0.45), 0, 1);
        cb = Math.min(inE, outE);
      }
    }
    root.style.setProperty("--cb", cb.toFixed(3));

    // timeline draw
    if (timeline) {
      var tr = timeline.getBoundingClientRect();
      timeline.style.setProperty("--tl", clamp((vh * 0.65 - tr.top) / tr.height, 0, 1).toFixed(3));
    }

    // scroll-driven zoom on screenshots
    if (!reduced) zoomers.forEach(function (z) {
      var r = z.parentElement.getBoundingClientRect();
      var pz = clamp((vh * 0.95 - r.top) / (vh * 0.7), 0, 1);
      z.style.setProperty("--z", (1.22 - 0.22 * pz).toFixed(3));
    });

    // marquee whip from scroll velocity
    var v = y - lastY; lastY = y;
    var target = clamp(-v * 0.28, -14, 14);
    skew += (target - skew) * 0.2;
    if (marquee) marquee.style.setProperty("--skew", skew.toFixed(2) + "deg");

    // scene + nav spy
    var mid = vh * 0.4, sc = 0;
    scenes.forEach(function (s, i) { if (s.getBoundingClientRect().top <= mid) sc = i; });
    if (sc !== curScene) {
      curScene = sc;
      if (hudSc) hudSc.textContent = "SC " + pad(sc + 1) + "/" + pad(scenes.length) + " · " + scenes[sc].getAttribute("data-scene").toUpperCase();
      var id = scenes[sc].id;
      spyLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-spy") === id); });
    }
    if (Math.abs(skew) > 0.05 || Math.abs(v) > 0) schedule();
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", function () { vh = innerHeight; vw = innerWidth; schedule(); });
  // relax marquee skew after scrolling stops
  setInterval(function () { if (Math.abs(skew) > 0.05) schedule(); }, 80);

  /* HUD running timecode */
  var hudTc = $("#hud-tc");
  if (hudTc && !reduced) setInterval(function () { if (!document.hidden) hudTc.textContent = tc(performance.now() / 1000); }, 83);

  /* ======================================================================
     REVEALS + COUNTERS
     ====================================================================== */
  var cc = $("#contact-card");
  if (cc) { // observe the parent: a clip-path'd element reports as not intersecting
    new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { cc.classList.add("in"); o.disconnect(); } }, { threshold: 0.2 }).observe(cc.parentElement);
  }
  if (credits) credits.classList.add("watch");
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-to")) || 0, pre = el.getAttribute("data-prefix") || "";
    var num = el.closest(".num");
    function end() { el.textContent = pre + to; if (num) { num.classList.remove("pop"); void num.offsetWidth; num.classList.add("pop"); } }
    if (reduced || to === 0) { setTimeout(end, 500); return; }
    var t0 = performance.now(), d = 1400;
    (function f(now) {
      var p = clamp((now - t0) / d, 0, 1), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = pre + Math.round(to * e);
      if (p < 1) requestAnimationFrame(f); else end();
    })(t0);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add("in");
      io.unobserve(el);
      var d = parseFloat((el.style.getPropertyValue("--d") || "0")) || 0;
      setTimeout(function () { el.classList.add("settled"); }, 1200 + d * 1000);
      $$(".count", el).forEach(function (c) { setTimeout(function () { countUp(c); }, 250 + d * 1000); });
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .watch").forEach(function (el) {
    if (el.closest("#hero-grid")) return; // hero reveals are released by the intro
    io.observe(el);
  });

  /* ======================================================================
     TILT · MAGNETIC · CARD GLOW
     ====================================================================== */
  if (finePointer && !reduced) {
    $$(".tilt").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateZ(0)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }
  document.addEventListener("pointermove", function (e) {
    var c = e.target.closest && e.target.closest(".card");
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (e.clientX - r.left) + "px");
    c.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  /* ======================================================================
     EXPERIENCE — expand
     ====================================================================== */
  $$(".more-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var role = b.closest(".role"), open = role.classList.toggle("open");
      b.setAttribute("aria-expanded", open);
      b.firstChild.nodeValue = open ? "Show less " : "Show more ";
    });
  });

  /* ======================================================================
     DETECTION — tabs, line-by-line cuts, copy
     ====================================================================== */
  var notes = [
    "Pairs a failure threshold with a time-bounded success join, so a lone typo never alerts — only a credential that finally worked.",
    "Office spawning PowerShell with an encoded payload is rarely legitimate — a high-signal pivot for macro-delivered phishing. Tune with an allow-list of known automation.",
    "Credential theft without dropping a tool: rundll32 calls comsvcs.dll's MiniDump export against LSASS. Corroborate with Defender for Endpoint's own credential-theft alerts.",
    "Start the cost conversation with data: rank tables by billable GB, then decide what to filter, sample or move to a cheaper tier — without losing detection-critical sources."
  ];
  $$("code.kql").forEach(function (code) {
    var lines = code.textContent.split("\n");
    code.innerHTML = lines.map(function (l, i) { return '<span class="ln" style="--i:' + i + '">' + highlightLine(l) + "</span>"; }).join("");
  });
  var dtabs = $$(".dtab"), dpanes = $$(".code-pane");
  function selectTab(i, focus) {
    dtabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i); t.tabIndex = k === i ? 0 : -1; });
    dpanes.forEach(function (p, k) { p.classList.toggle("active", k === i); });
    $("#code-title").textContent = dpanes[i].getAttribute("data-file");
    $("#code-note").textContent = notes[i];
    if (focus) dtabs[i].focus();
  }
  dtabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(i); });
    t.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); selectTab((i + 1) % dtabs.length, true); }
      if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); selectTab((i - 1 + dtabs.length) % dtabs.length, true); }
    });
  });
  var copyBtn = $("#copy-code");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    var pane = $(".code-pane.active code");
    copyText(pane.textContent.replace(/\n{2,}/g, "\n"), "KQL copied");
  });

  /* ======================================================================
     PROJECTS — filter, screenshot switcher, lightbox
     ====================================================================== */
  var filters = $$(".filter"), cards = $$(".project");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var cat = f.getAttribute("data-f");
      filters.forEach(function (x) { x.setAttribute("aria-pressed", x === f); });
      var k = 0;
      cards.forEach(function (c) {
        var show = cat === "all" || c.getAttribute("data-cat").split(" ").indexOf(cat) > -1;
        c.classList.toggle("hide", !show);
        if (show) {
          c.classList.remove("in", "settled"); void c.offsetWidth;
          (function (el, d) { setTimeout(function () { el.classList.add("in"); setTimeout(function () { el.classList.add("settled"); }, 800); }, d); })(c, 60 * k++);
        }
      });
    });
  });

  var shotTabs = $$(".shot-tab"), shotImgs = $$("#tfii-view img"), tfiiUrl = $("#tfii-url"), shotIdx = 0, shotAuto = true, shotTimer;
  function showShot(i) {
    shotIdx = i;
    shotImgs.forEach(function (im, k) { im.classList.toggle("on", k === i); });
    shotTabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i); });
    if (tfiiUrl) tfiiUrl.textContent = shotTabs[i].getAttribute("data-url");
    var t = shotTabs[i]; if (t.scrollIntoView && shotTabs[0].parentElement.scrollWidth > shotTabs[0].parentElement.clientWidth) shotTabs[0].parentElement.scrollTo({ left: t.offsetLeft - 16, behavior: "smooth" });
  }
  shotTabs.forEach(function (t, i) { t.addEventListener("click", function () { shotAuto = false; showShot(i); }); });
  if (shotTabs.length && !reduced) {
    shotTimer = setInterval(function () {
      var vis = $("#tfii-view").getBoundingClientRect(); var inView = vis.top < vh && vis.bottom > 0;
      if (shotAuto && inView && !document.hidden) showShot((shotIdx + 1) % shotTabs.length);
    }, 4200);
  }

  var lb = $("#lightbox"), lbImg = lb && $("img", lb), lbCap = lb && $(".cap", lb);
  function openLB(src, alt, e) {
    if (!lb) return;
    lbImg.src = src; lbImg.alt = alt || ""; lbCap.textContent = alt || "";
    var ox = 50, oy = 50;
    if (e && e.clientX != null) { ox = clamp(50 + (e.clientX - vw / 2) / Math.min(1400, vw * 0.9) * 100, -20, 120); oy = clamp(50 + (e.clientY - vh / 2) / (vh * 0.8) * 100, -20, 120); }
    lb.style.setProperty("--ox", ox + "%"); lb.style.setProperty("--oy", oy + "%");
    lbImg.style.animation = "none"; void lbImg.offsetWidth; lbImg.style.animation = "";
    lb.classList.add("open"); root.style.overflow = "hidden";
  }
  function closeLB() { if (lb && lb.classList.contains("open")) { lb.classList.remove("open"); root.style.overflow = ""; } }
  if (lb) lb.addEventListener("click", closeLB);
  var tview = $("#tfii-view");
  if (tview) tview.addEventListener("click", function (e) { shotAuto = false; var im = $("img.on", tview); openLB(im.currentSrc || im.src, im.alt, e); });
  $$(".proj-media img").forEach(function (im) {
    im.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); openLB(im.currentSrc || im.src, im.alt, e); });
  });

  /* ======================================================================
     COMMAND PALETTE
     ====================================================================== */
  var pal = $("#palette"), palIn = $("#palette-input"), palList = $("#palette-list"), palItems = [], palSel = 0, palPrev = null;
  var go = function (id) { return function () { var t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }; };
  var open = function (u) { return function () { window.open(u, "_blank", "noopener"); }; };
  var commands = [
    { g: "Navigate", t: "Home", i: "i-play", k: "hero top", run: go("home") },
    { g: "Navigate", t: "The Reel", i: "i-play", k: "what i do showreel", run: go("reel") },
    { g: "Navigate", t: "About", i: "i-shield", k: "bio summary", run: go("about") },
    { g: "Navigate", t: "Experience", i: "i-layers", k: "work jobs timeline", run: go("experience") },
    { g: "Navigate", t: "Detection engineering (KQL)", i: "i-terminal", k: "queries sentinel kql", run: go("detection") },
    { g: "Navigate", t: "Projects", i: "i-code", k: "work github", run: go("projects") },
    { g: "Navigate", t: "Toolkit", i: "i-database", k: "skills stack", run: go("skills") },
    { g: "Navigate", t: "Certifications", i: "i-award", k: "sc-200 security+ cpt", run: go("certs") },
    { g: "Navigate", t: "Contact", i: "i-mail", k: "email hire", run: go("contact") },
    { g: "Projects", t: "TFII — ThreatFeed Intelligence Platform", i: "i-radar", k: "threat intel ioc", run: open("https://github.com/sherifrahim/TFII"), s: "GitHub" },
    { g: "Projects", t: "CertPrep — Microsoft security exam prep", i: "i-flask", k: "sc-200 quiz lab", run: open("https://github.com/sherifrahim/CertPrep"), s: "GitHub" },
    { g: "Projects", t: "Sentinel Workbooks", i: "i-chart", k: "weekly soc report", run: open("https://github.com/sherifrahim/Sentinel-Workbooks"), s: "GitHub" },
    { g: "Projects", t: "Kestrel — Android automation", i: "i-code", k: "shizuku tasker", run: open("https://github.com/sherifrahim/kestrel"), s: "GitHub" },
    { g: "Projects", t: "GetFit — offline workout tracker", i: "i-phone", k: "android fitness", run: open("https://github.com/sherifrahim/GetFitPro"), s: "GitHub" },
    { g: "Projects", t: "Neoteric OS", i: "i-phone", k: "aosp rom android", run: open("https://github.com/Neoteric-OS"), s: "GitHub" },
    { g: "Actions", t: "Reveal email address", i: "i-mail", k: "mail contact hire", run: function () { go("contact")(); setTimeout(revealEmail, 700); } },
    { g: "Actions", t: "Copy email address", i: "i-copy", k: "mail", run: function () { copyText(getEmail(), "Email copied"); } },
    { g: "Actions", t: "Toggle light / dark theme", i: "i-sun", k: "theme", run: toggleTheme },
    { g: "Actions", t: "Replay the intro", i: "i-play", k: "title card cinematic", run: function () { try { sessionStorage.removeItem("introSeen"); } catch (e) {} location.reload(); } },
    { g: "Links", t: "LinkedIn", i: "i-linkedin", k: "social", run: open("https://www.linkedin.com/in/sherifrahim"), s: "↗" },
    { g: "Links", t: "GitHub profile", i: "i-github", k: "social", run: open("https://github.com/sherifrahim"), s: "↗" },
    { g: "Links", t: "Medium", i: "i-code", k: "blog writing", run: open("https://medium.com/@sherifrahim"), s: "↗" }
  ];
  function renderPalette(q) {
    q = (q || "").toLowerCase().trim();
    var terms = q.split(/\s+/).filter(Boolean);
    palItems = commands.filter(function (c) { var hay = (c.t + " " + c.k + " " + c.g).toLowerCase(); return terms.every(function (t) { return hay.indexOf(t) > -1; }); });
    palSel = 0;
    if (!palItems.length) { palList.innerHTML = '<div class="palette-empty">No matches — try "kql", "projects" or "contact".</div>'; return; }
    var html = "", last = "";
    palItems.forEach(function (c, i) {
      if (c.g !== last) { html += '<div class="palette-group">' + c.g + "</div>"; last = c.g; }
      html += '<button class="palette-item" role="option" data-i="' + i + '" aria-selected="' + (i === 0) + '"><svg class="icon"><use href="#' + c.i + '"/></svg><span>' + esc(c.t) + "</span>" + (c.s ? "<small>" + c.s + "</small>" : "") + "</button>";
    });
    palList.innerHTML = html;
  }
  function paintSel() {
    $$(".palette-item", palList).forEach(function (el) { var on = +el.getAttribute("data-i") === palSel; el.setAttribute("aria-selected", on); if (on) el.scrollIntoView({ block: "nearest" }); });
  }
  function openPalette() { palPrev = document.activeElement; pal.classList.add("open"); palIn.value = ""; renderPalette(""); palIn.focus(); }
  function closePalette() { pal.classList.remove("open"); if (palPrev && palPrev.focus) palPrev.focus(); }
  function runSel() { var c = palItems[palSel]; if (!c) return; closePalette(); setTimeout(c.run, 60); }
  if (pal) {
    palIn.addEventListener("input", function () { renderPalette(palIn.value); });
    palList.addEventListener("click", function (e) { var b = e.target.closest(".palette-item"); if (b) { palSel = +b.getAttribute("data-i"); runSel(); } });
    palList.addEventListener("pointermove", function (e) { var b = e.target.closest(".palette-item"); if (b) { var i = +b.getAttribute("data-i"); if (i !== palSel) { palSel = i; paintSel(); } } });
    pal.addEventListener("click", function (e) { if (e.target === pal) closePalette(); });
    palIn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); palSel = Math.min(palItems.length - 1, palSel + 1); paintSel(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); palSel = Math.max(0, palSel - 1); paintSel(); }
      else if (e.key === "Enter") { e.preventDefault(); runSel(); }
    });
    var ob = $("#open-palette"); if (ob) ob.addEventListener("click", openPalette);
  }
  window.addEventListener("keydown", function (e) {
    var typing = /^(input|textarea|select)$/i.test((e.target.tagName || ""));
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.classList.contains("open") ? closePalette() : openPalette(); }
    else if (e.key === "/" && !typing && !pal.classList.contains("open")) { e.preventDefault(); openPalette(); }
    else if (e.key === "Escape") { closePalette(); closeLB(); closeMenu(); }
  });

  /* ======================================================================
     MISC — mobile menu, copy email, year, console
     ====================================================================== */
  var menuBtn = $("#menu-btn"), links = $("#nav-links");
  function closeMenu() { if (links) { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); } }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { var o = links.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o); });
    $$("a", links).forEach(function (a) { a.addEventListener("click", closeMenu); });
  }
  /* Email is never present in the markup or as a literal: it is rebuilt at runtime and only shown on click. */
  var EP = ["bW9jLmxpYW1n", "QDEwMDJtaWhh", "cmZpcmVocw=="];
  function getEmail() { try { return atob(EP.join("")).split("").reverse().join(""); } catch (e) { return ""; } }
  var emailShown = false;
  function revealEmail() {
    var box = $("#email-reveal"), btn = $("#reveal-email");
    if (!box || emailShown) return;
    emailShown = true;
    var addr = getEmail();
    var pill = document.createElement("span"); pill.className = "email-addr"; pill.textContent = addr;
    var write = document.createElement("a"); write.className = "btn btn-primary"; write.href = "mail" + "to:" + addr; write.textContent = "Write to me";
    var copy = document.createElement("button"); copy.type = "button"; copy.className = "btn"; copy.textContent = "Copy";
    copy.addEventListener("click", function () { copyText(addr, "Email copied"); });
    box.appendChild(pill); box.appendChild(write); box.appendChild(copy);
    box.classList.add("show");
    if (btn) btn.style.display = "none";
  }
  var rb = $("#reveal-email"); if (rb) rb.addEventListener("click", revealEmail);
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  try {
    console.log("%c SR %c  Looks like you read the source. Detection engineers do that. Say hi from the contact section.", "background:#34d3c0;color:#04110f;font-weight:700;padding:3px 6px;border-radius:4px", "color:#34d3c0");
  } catch (e) {}

  /* ---------- boot ---------- */
  schedule();
  runIntro();
})();
