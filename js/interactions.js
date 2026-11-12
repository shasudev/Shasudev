
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* scroll progress */
  var bar = document.getElementById("progress");
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* active nav link */
  if ("IntersectionObserver" in window) {
    var links = {};
    document.querySelectorAll("nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle("active", k === e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { navIO.observe(s); });
  }

  /* reveal on scroll */
  if (!reduce && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll("main section .tag, main section h2, main section .sub, main section .card, main section .chan, main section .item, main section .about > *, main section .empty, main section .copy");
    targets.forEach(function (el) {
      el.classList.add("rv");
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", Math.min(sibs, 5) * 0.08 + "s");
    });
    root.classList.add("js-rv");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* card spotlight */
  document.addEventListener("pointermove", function (e) {
    var t = e.target.closest ? e.target.closest(".card, .chan") : null;
    if (!t) return;
    var r = t.getBoundingClientRect();
    t.style.setProperty("--mx", (e.clientX - r.left) + "px");
    t.style.setProperty("--my", (e.clientY - r.top) + "px");
  });

  /* diamond cursor */
  if (fine && !reduce) {
    var facets = [
      ["8,14 14,6 14,14", "195 95% 78%"], ["14,6 20,14 14,14", "265 90% 78%"], ["14,6 26,6 20,14", "0 0% 96%"],
      ["26,6 20,14 26,14", "325 90% 76%"], ["26,6 32,14 26,14", "45 95% 78%"],
      ["8,14 14,14 20,36", "215 90% 58%"], ["14,14 20,14 20,36", "280 85% 62%"], ["20,14 26,14 20,36", "335 85% 62%"], ["26,14 32,14 20,36", "170 85% 52%"]
    ];
    var polys = facets.map(function (f) { return '<polygon points="' + f[0] + '" fill="hsl(' + f[1] + ' / .78)"/>'; }).join("");
    var gem = document.createElement("div");
    gem.className = "gem";
    gem.innerHTML = '<div class="gem-in"><span class="gem-glow"></span>' +
      '<svg viewBox="0 0 40 40" aria-hidden="true"><defs>' +
      '<linearGradient id="gsh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<clipPath id="gclip"><path d="M8 14L14 6H26L32 14L20 36Z"/></clipPath></defs>' +
      '<g class="facets">' + polys + '</g>' +
      '<path d="M8 14L14 6H26L32 14L20 36Z" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1" stroke-linejoin="round"/>' +
      '<path d="M8 14H32M14 6L20 14L26 6M14 14L20 36L26 14" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".6"/>' +
      '<g clip-path="url(#gclip)"><g><animateTransform attributeName="transform" type="translate" from="-30 0" to="60 0" dur="2.8s" repeatCount="indefinite"/><rect x="0" y="0" width="10" height="40" fill="url(#gsh)" transform="skewX(-20)"/></g></g>' +
      '</svg></div>';
    var cv = document.createElement("canvas");
    cv.className = "spark";
    document.body.appendChild(cv);
    document.body.appendChild(gem);
    root.classList.add("has-cursor");

    var cx = cv.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { cv.width = window.innerWidth * dpr; cv.height = window.innerHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener("resize", size);

    var x = -100, y = -100, gx = -100, gy = -100, seen = false, lastEmit = 0, ps = [], running = false;

    function emit(n, burst) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, sp = burst ? 1 + Math.random() * 2.6 : 0.2 + Math.random() * 0.7;
        ps.push({ x: x + (Math.random() - 0.5) * 14, y: y + (Math.random() - 0.5) * 14, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + (burst ? 0 : 0.15),
          life: 0, max: (burst ? 700 : 900) * (0.6 + Math.random() * 0.6), s: (burst ? 3 : 1.8) + Math.random() * 2.4,
          h: Math.floor((performance.now() / 12 + Math.random() * 80) % 360) });
      }
      if (!running) { running = true; requestAnimationFrame(draw); }
    }
    function draw() {
      cx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ps = ps.filter(function (p) { return p.life < p.max; });
      ps.forEach(function (p) {
        p.life += 16; p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy *= 0.985;
        var al = Math.max(0, 1 - p.life / p.max), l = p.s * (0.6 + al);
        cx.strokeStyle = "hsla(" + p.h + ",95%,74%," + al + ")";
        cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(p.x - l, p.y); cx.lineTo(p.x + l, p.y); cx.moveTo(p.x, p.y - l); cx.lineTo(p.x, p.y + l); cx.stroke();
        cx.fillStyle = "hsla(" + p.h + ",100%,88%," + al + ")";
        cx.fillRect(p.x - 0.6, p.y - 0.6, 1.2, 1.2);
      });
      if (ps.length) requestAnimationFrame(draw);
      else { running = false; cx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
    }

    document.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; gx = x; gy = y; gem.classList.add("cur-on"); }
      var hot = e.target.closest && e.target.closest("a, button, input, textarea");
      gem.classList.toggle("hot", !!hot);
      var now = performance.now();
      if (now - lastEmit > 45) { lastEmit = now; emit(hot ? 2 : 1, false); }
    });
    document.addEventListener("mousedown", function () { gem.classList.add("down"); emit(16, true); });
    document.addEventListener("mouseup", function () { gem.classList.remove("down"); });
    document.documentElement.addEventListener("mouseleave", function () { gem.classList.remove("cur-on"); });
    document.documentElement.addEventListener("mouseenter", function () { if (seen) gem.classList.add("cur-on"); });
    (function loop() {
      gx += (x - gx) * 0.4; gy += (y - gy) * 0.4;
      gem.style.transform = "translate(" + gx + "px," + gy + "px)";
      requestAnimationFrame(loop);
    })();
  }
})();
