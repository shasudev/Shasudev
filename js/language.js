
(function () {
  var current = "es";
  var nodes = document.querySelectorAll("[data-es]");
  function apply(lang) {
    current = lang;
    nodes.forEach(function (n) {
      var t = n.getAttribute("data-" + lang);
      if (t === null) return;
      /* keep nested .sample chips: only replace the first text node when children exist */
      if (n.children.length) {
        var tn = Array.prototype.find.call(n.childNodes, function (c) { return c.nodeType === 3; });
        if (tn) tn.nodeValue = t;
      } else { n.textContent = t; }
    });
    document.documentElement.lang = lang;
    document.getElementById("b-es").setAttribute("aria-pressed", String(lang === "es"));
    document.getElementById("b-en").setAttribute("aria-pressed", String(lang === "en"));
    try { localStorage.setItem("shasu-lang", lang); } catch (e) {}
  }
  document.getElementById("b-es").addEventListener("click", function () { apply("es"); });
  document.getElementById("b-en").addEventListener("click", function () { apply("en"); });
  try { var s = localStorage.getItem("shasu-lang"); if (s === "en") apply("en"); } catch (e) {}

  var btn = document.getElementById("copybtn");
  btn.addEventListener("click", function () {
    var done = function () { btn.textContent = current === "es" ? "Copiado" : "Copied"; setTimeout(function () { btn.textContent = btn.getAttribute("data-" + current); }, 1500); };
    try {
      navigator.clipboard.writeText("@shasudev").then(done, function () {
        var r = document.createRange(); r.selectNodeContents(document.getElementById("handle"));
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      });
    } catch (e) {
      var r = document.createRange(); r.selectNodeContents(document.getElementById("handle"));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    }
  });
})();
