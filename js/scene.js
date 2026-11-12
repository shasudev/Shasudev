
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var boost = 0;
  window.__shasuBoost = function () { boost = 12; };
    var brandImg = document.querySelector(".brand img");
  if (!brandImg || !window.THREE) return;
  var T = window.THREE;
  var canvas = document.createElement("canvas");
  canvas.className = "gl";
  canvas.setAttribute("aria-hidden", "true");
  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "low-power" }); } catch (e) { return; }
  document.body.insertBefore(canvas, document.body.firstChild);
  document.documentElement.classList.add("gl-on");
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.z = 8;
  var rig = new T.Group(); scene.add(rig);
  var tilt = new T.Group(); tilt.rotation.x = 0.6155; rig.add(tilt);
  var spin = new T.Group(); spin.rotation.y = Math.PI / 4; tilt.add(spin);

  /* logo texture on every face */
  var cvs = document.createElement("canvas"); cvs.width = cvs.height = 512;
  var cc = cvs.getContext("2d");
  cc.fillStyle = "#08090b"; cc.fillRect(0, 0, 512, 512);
  var tex = new T.CanvasTexture(cvs);
  var mat = new T.MeshStandardMaterial({ color: 0x0b0c0f, metalness: 0.9, roughness: 0.22, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55 });
  var box = new T.BoxGeometry(2.4, 2.4, 2.4);
  spin.add(new T.Mesh(box, mat));
  var edges = new T.LineSegments(new T.EdgesGeometry(box), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
  spin.add(edges);
  var ico = new T.LineSegments(new T.EdgesGeometry(new T.IcosahedronGeometry(2.7, 0)), new T.LineBasicMaterial({ color: 0xbfc6ff, transparent: true, opacity: 0.3 }));
  spin.add(ico);
  var core = new T.Mesh(new T.OctahedronGeometry(0.55, 0), new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 }));
  spin.add(core);

  var N = 140, pos = new Float32Array(N * 3), i;
  for (i = 0; i < N; i++) {
    var r = 3.2 + Math.random() * 2.6, u = Math.random() * 2 - 1, a = Math.random() * 6.283, s = Math.sqrt(1 - u * u);
    pos[i * 3] = r * s * Math.cos(a); pos[i * 3 + 1] = r * u * 0.8; pos[i * 3 + 2] = r * s * Math.sin(a);
  }
  var pg = new T.BufferGeometry();
  pg.setAttribute("position", new T.BufferAttribute(pos, 3));
  var pts = new T.Points(pg, new T.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.7 }));
  rig.add(pts);

  scene.add(new T.AmbientLight(0xffffff, 0.18));
  var lights = [0x6fe7ff, 0xff7ad9, 0xffd479, 0xa78bfa].map(function (c) { var l = new T.PointLight(c, 1.6, 30); scene.add(l); return l; });

  var img = new Image();
  img.onload = function () { cc.drawImage(img, 40, 40, 432, 432); tex.needsUpdate = true; if (reduce) draw(0); };
  img.src = brandImg.currentSrc || brandImg.src;

  var base = { sc: 1, W: 8, H: 5.5, wide: true };
  function layout() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    base.H = 2 * camera.position.z * Math.tan(camera.fov * Math.PI / 360);
    base.W = base.H * camera.aspect;
    base.wide = w >= 900;
    base.sc = base.wide ? Math.min(base.W * 0.5, base.H * 0.95) / 5.4 : base.W * 0.8 / 5.4;
    if (reduce) draw(lastT);
  }
  window.addEventListener("resize", layout);

  var lastT = 0, lastY = window.scrollY;
  var mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener("pointermove", function (e) {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function draw(t) {
    var dt = Math.min(0.05, Math.max(0, t - lastT)); lastT = t;
    var sy = window.scrollY;
    boost *= Math.pow(0.35, dt);
    spin.rotation.y += dt * (0.22 + boost) + (sy - lastY) * 0.004;
    lastY = sy;
    cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06;
    rig.rotation.y = cx * 0.35; rig.rotation.x = cy * 0.25;
    var maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var pr = Math.min(1, Math.max(0, sy / maxS));
    var k = Math.min(1, sy / (window.innerHeight * 0.7));
    var sway = Math.sin(pr * Math.PI * 5);
    var tx = base.W * (base.wide ? 0.27 : 0.12) * sway;
    var ty = base.H * 0.1 * Math.cos(pr * Math.PI * 4);
    rig.position.x += (tx - rig.position.x) * 0.06;
    rig.position.y += (ty - rig.position.y) * 0.06;
    rig.scale.setScalar(base.sc * (1 - 0.15 * k));
    canvas.style.opacity = ((base.wide ? 0.72 : 0.5) + k * 0.28).toFixed(3);
    core.rotation.x += dt; core.rotation.y += dt * 1.3;
    ico.rotation.y -= dt * 0.18; ico.rotation.x += dt * 0.07;
    pts.rotation.y = t * 0.03;
    ico.material.color.setHSL((t * 0.04) % 1, 0.8, 0.75);
    lights.forEach(function (l, k) {
      var an = t * 0.5 + k * 1.57;
      l.position.set(Math.cos(an) * 5, Math.sin(an * 1.3) * 4, 3 + Math.sin(an) * 2);
    });
    renderer.render(scene, camera);
  }
  window.addEventListener("scroll", function () { if (reduce) requestAnimationFrame(function () { draw(lastT); }); }, { passive: true });
  layout();
  if (!reduce) {
    (function loop(now) {
      if (!document.hidden) draw(now / 1000);
      requestAnimationFrame(loop);
    })(0);
  }

  /* konami code */
  var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], pi = 0, toast = null, tt = null;
  document.addEventListener("keydown", function (e) {
    if (e.target && e.target.tagName === "INPUT") return;
    pi = (e.keyCode === seq[pi]) ? pi + 1 : (e.keyCode === seq[0] ? 1 : 0);
    if (pi === seq.length) {
      pi = 0; boost = 14;
      if (!toast) { toast = document.createElement("div"); toast.className = "toast"; document.body.appendChild(toast); }
      toast.textContent = "礼 雅 律  ·  modo samurái";
      toast.classList.add("on");
      clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("on"); }, 3200);
    }
  });
})();
