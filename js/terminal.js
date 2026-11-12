
(function () {
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 3D tilt on cards */
  if (fine && !reduce) {
    document.querySelectorAll("main .card").forEach(function (c) {
      c.classList.add("tilt");
      c.addEventListener("transitionend", function (e) {
        if (e.propertyName === "opacity" && c.classList.contains("in")) { c.classList.remove("rv", "in"); c.style.removeProperty("--d"); }
      });
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty("--ry", (px * 10).toFixed(2) + "deg");
        c.style.setProperty("--rx", (-py * 8).toFixed(2) + "deg");
      });
      c.addEventListener("pointerleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
  }

  /* interactive terminal */
  var out = document.getElementById("tout"), tin = document.getElementById("tin"), tsh = document.getElementById("tsh");
  if (!out || !tin) return;
  var WA = "https://wa.me/51989168816?text=Hola%20Shasu%20Dev%2C%20vi%20tu%20portafolio%20y%20quiero%20hablar%20de%20un%20proyecto.";
  function a(h, t) { return '<a href="' + h + '" target="_blank" rel="noopener">' + t + "</a>"; }
  function en() { return document.documentElement.lang === "en"; }
  function L(es, eng) { return en() ? eng : es; }

  var ALIAS = {
    help: ["help", "ayuda", "?", "h"], about: ["about", "sobre", "sobre-mi", "whoami", "quien"],
    skills: ["skills", "habilidades", "stack"], projects: ["projects", "proyectos", "ls"],
    services: ["services", "servicios"], principles: ["principles", "principios", "bushido"],
    contact: ["contact", "contacto"], github: ["github", "git"], youtube: ["youtube"], tiktok: ["tiktok"],
    whatsapp: ["whatsapp", "wa"], linkedin: ["linkedin"], lang: ["lang", "idioma"], clear: ["clear", "cls", "limpiar"],
    hire: ["hire", "contratar"]
  };
  var map = {}, names = [];
  Object.keys(ALIAS).forEach(function (k) { ALIAS[k].forEach(function (n) { map[n] = k; if (/^[a-z-]{3,}$/.test(n)) names.push(n); }); });
  names.sort();

  var CMD = {
    help: function () { return L(
      '<span class="hl">Comandos disponibles</span>\n  ayuda        esta lista\n  sobre-mi     quién soy\n  habilidades  mi stack\n  proyectos    lo que he construido\n  servicios    lo que puedo hacer por ti\n  principios   cómo trabajo\n  contacto     cómo escribirme\n  github  youtube  tiktok  linkedin  whatsapp\n  idioma en    cambiar a inglés\n  limpiar      borrar la pantalla',
      '<span class="hl">Available commands</span>\n  help         this list\n  about        who I am\n  skills       my stack\n  projects     what I have built\n  services     what I can do for you\n  principles   how I work\n  contact      how to reach me\n  github  youtube  tiktok  linkedin  whatsapp\n  lang es      switch to Spanish\n  clear        clear the screen'); },
    about: function () { return L(
      'Jesús Fernando Lucero Purihuamán · <span class="hl">Shasu Dev</span>\nIngeniero de software en Perú. Construyo webs, sistemas y automatizaciones, y comparto lo que aprendo en YouTube y TikTok.',
      'Jesús Fernando Lucero Purihuamán · <span class="hl">Shasu Dev</span>\nSoftware engineer in Peru. I build websites, systems and automations, and share what I learn on YouTube and TikTok.'); },
    skills: function () { return '<span class="hl">frontend</span>   HTML  CSS  JavaScript  TypeScript  React\n<span class="hl">backend</span>    Node.js  Python  REST APIs  SQL\n<span class="hl">' + L("herramientas", "tooling") + '</span>  Git  GitHub  Docker  Linux  Figma'; },
    projects: function () { return '<span class="hl">Pandatec</span>  ' + L("sistema de gestión para negocios de celulares", "management system for mobile phone shops") + '\n  ' + a("https://pandatec.onrender.com/index.html", "pandatec.onrender.com") + '\n<span class="dim">' + L("Más proyectos pronto. Mira la sección Proyectos.", "More projects soon. See the Projects section.") + '</span>'; },
    services: function () { return L(
      '1. Páginas y sitios web\n2. Aplicaciones y sistemas a medida\n3. Automatización y APIs',
      '1. Websites\n2. Custom apps and systems\n3. Automation and APIs'); },
    principles: function () { return '礼  ' + L("Respeto: lo que acuerdo, lo cumplo.", "Respect: what I agree to, I deliver.") + '\n雅  ' + L("Elegancia: código limpio, diseño sobrio.", "Elegance: clean code, restrained design.") + '\n律  ' + L("Disciplina: práctica diaria y entrega a tiempo.", "Discipline: daily practice, delivery on time."); },
    contact: function () { return 'whatsapp  ' + a(WA, "+51 989 168 816") + '\ngithub    ' + a("https://github.com/shasudev", "github.com/shasudev") + '\nyoutube   ' + a("https://www.youtube.com/@shasudev", "@shasudev") + '\ntiktok    ' + a("https://www.tiktok.com/@shasudev", "@shasudev") + '\nlinkedin  ' + a("https://www.linkedin.com/in/shasudev", "in/shasudev"); },
    github: function () { return a("https://github.com/shasudev", "github.com/shasudev"); },
    youtube: function () { return a("https://www.youtube.com/@shasudev", "youtube.com/@shasudev"); },
    tiktok: function () { return a("https://www.tiktok.com/@shasudev", "tiktok.com/@shasudev"); },
    linkedin: function () { return a("https://www.linkedin.com/in/shasudev", "linkedin.com/in/shasudev"); },
    whatsapp: function () { return a(WA, "+51 989 168 816"); },
    hire: function () { return '<span class="pr">' + L("Permiso concedido.", "Permission granted.") + '</span> ' + L("Escríbeme y empezamos: ", "Write to me and let's start: ") + a(WA, "WhatsApp"); }
  };

  function line(html, cls) { var d = document.createElement("div"); d.className = "ln" + (cls ? " " + cls : ""); d.innerHTML = html; out.appendChild(d); return d; }
  function echo(text) {
    var d = document.createElement("div"); d.className = "ln";
    var p = document.createElement("span"); p.className = "pr"; p.textContent = "visitante@shasudev:~$ ";
    d.appendChild(p); d.appendChild(document.createTextNode(text)); out.appendChild(d);
  }
  function bottom() { tsh.scrollTop = tsh.scrollHeight; }

  function run(raw, silentScroll) {
    var txt = raw.trim(); if (!txt) return;
    echo(txt);
    var parts = txt.toLowerCase().split(/\s+/), c = parts[0];
    if (c === "sudo") {
      var rest = parts.slice(1).join(" ");
      if (/^(hire|contratar)(\s+shasu(\s*dev)?)?$/.test(rest)) line(CMD.hire());
      else line(L("visitante no está en el archivo sudoers. Este incidente será reportado.", "visitante is not in the sudoers file. This incident will be reported."));
    } else if (map[c] === "clear") { out.innerHTML = ""; }
    else if (map[c] === "lang") {
      var t = parts[1];
      if (t === "en" || t === "es") { var b = document.getElementById("b-" + t); if (b) b.click(); line(t === "en" ? "Language: English" : "Idioma: español"); }
      else line(L("Uso: idioma es | idioma en", "Usage: lang es | lang en"));
    } else if (map[c] && CMD[map[c]]) { line(CMD[map[c]]()); }
    else {
      var d = line(""); d.textContent = L("comando no encontrado: ", "command not found: ") + txt;
      line('<span class="dim">' + L("Escribe ayuda para ver los comandos.", "Type help to see the commands.") + "</span>");
    }
    if (!silentScroll) bottom();
  }

  /* initial state: greeting + help */
  line('<span class="dim">' + L("Terminal de Shasu Dev. Escribe un comando y presiona Enter.", "Shasu Dev terminal. Type a command and press Enter.") + "</span>");
  run(L("ayuda", "help"), true);

  var hist = [], hi = 0;
  tin.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { var v = tin.value; if (v.trim()) { hist.push(v); hi = hist.length; } tin.value = ""; run(v); }
    else if (e.key === "ArrowUp") { if (hi > 0) { hi--; tin.value = hist[hi]; } e.preventDefault(); }
    else if (e.key === "ArrowDown") { if (hi < hist.length - 1) { hi++; tin.value = hist[hi]; } else { hi = hist.length; tin.value = ""; } e.preventDefault(); }
    else if (e.key === "Tab") {
      e.preventDefault();
      var v2 = tin.value.toLowerCase();
      if (v2) { var m = names.filter(function (n) { return n.indexOf(v2) === 0; }); if (m.length) tin.value = m[0]; }
    }
  });
  tsh.addEventListener("click", function (e) { if (!e.target.closest("a")) { try { tin.focus({ preventScroll: true }); } catch (x) { tin.focus(); } } });
  var btns = document.getElementById("tcmds");
  btns.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-cmd]"); if (!b) return;
    run(b.getAttribute("data-cmd"));
  });
})();
