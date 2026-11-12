
(function () {
  var C = [
    ["k","const"],["p"," express = "],["f","require"],["p","("],["s","\"express\""],["p",");\n"],
    ["k","const"],["p"," app = "],["f","express"],["p","();\n\n"],
    ["c","// Mi API: quien soy y que hago\n"],
    ["p","app."],["f","get"],["p","("],["s","\"/\""],["p",", (req, res) => {\n  res."],["f","json"],["p","({\n    marca: "],["s","\"Shasu Dev\""],["p",",\n    autor: "],["s","\"Jesús Lucero\""],["p",",\n    rol: "],["s","\"Ingeniero de software\""],["p",",\n    stack: ["],["s","\"JavaScript\""],["p",", "],["s","\"Node.js\""],["p",", "],["s","\"Express\""],["p","],\n  });\n});\n\n"],
    ["p","app."],["f","listen"],["p","("],["n","3000"],["p",", () => {\n  console."],["f","log"],["p","("],["s","\"Servidor listo en :3000\""],["p",");\n});"]
  ];
  var pre = document.getElementById("code");
  var term = document.getElementById("term");
  var termtxt = document.getElementById("termtxt");
  if (!pre) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timer = null;

  function showTerm() {
    termtxt.innerHTML = '<b>$</b> node server.js<br><span class="ok">Servidor listo en http://localhost:3000</span>';
  }
  function clearTerm() { termtxt.innerHTML = '<b>$</b> <span class="caret"></span>'; }

  if (reduce) {
    C.forEach(function (t) { var s = document.createElement("span"); s.className = t[0]; s.textContent = t[1]; pre.appendChild(s); });
    showTerm();
    return;
  }

  function run() {
    pre.innerHTML = "";
    clearTerm();
    var caret = document.createElement("span");
    caret.className = "caret";
    pre.appendChild(caret);
    var ti = 0, ci = 0, cur = null;
    function step() {
      if (ti >= C.length) {
        caret.remove();
        showTerm();
        timer = setTimeout(run, 7000);
        return;
      }
      var tok = C[ti];
      if (ci === 0) { cur = document.createElement("span"); cur.className = tok[0]; pre.insertBefore(cur, caret); }
      var ch = tok[1].charAt(ci);
      cur.textContent += ch;
      ci++;
      if (ci >= tok[1].length) { ti++; ci = 0; }
      timer = setTimeout(step, ch === "\n" ? 170 : 16 + Math.random() * 34);
    }
    timer = setTimeout(step, 500);
  }
  run();
})();
