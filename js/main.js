/* Native, event-driven enhancements. The page remains readable without JS. */
(() => {
  'use strict';

  document.body.classList.add('js');

  const navigation = document.querySelector('#navigation');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileQuery = window.matchMedia('(max-width: 800px)');

  function closeMenu(restoreFocus = false) {
    const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    if (restoreFocus && wasOpen) menuButton.focus();
  }

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.header-inner')) closeMenu();
  });
  document.addEventListener('focusin', (event) => {
    if (!event.target.closest('.header-inner')) closeMenu();
  });
  mobileQuery.addEventListener('change', () => closeMenu());

  // Keep the original Spanish copy in memory; never replace nested markup.
  let language = 'es';
  const translatedNodes = [...document.querySelectorAll('[data-en]')].map((node) => ({
    node, es: node.textContent, en: node.dataset.en,
  }));
  const translatedImages = [...document.querySelectorAll('[data-alt-en]')].map((node) => ({
    node, es: node.alt, en: node.dataset.altEn,
  }));
  const languageButtons = document.querySelectorAll('[data-lang]');
  const terminalInput = document.querySelector('#terminal-input');
  const description = document.querySelector('meta[name="description"]');
  const spanishDescription = description.content;
  const text = (es, en) => language === 'en' ? en : es;

  function setLanguage(next) {
    if (next !== 'es' && next !== 'en') return;
    language = next;
    document.documentElement.lang = next;
    translatedNodes.forEach((entry) => { entry.node.textContent = entry[next]; });
    translatedImages.forEach((entry) => { entry.node.alt = entry[next]; });
    languageButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === next));
    });
    document.title = text('Shasu Dev — Software con intención', 'Shasu Dev — Software with intention');
    description.content = text(spanishDescription, 'Shasu Dev · Jesús Fernando Lucero Purihuamán. Websites, custom systems and automations, built in Peru. Explore my work and let’s talk.');
    document.querySelector('meta[property="og:locale"]').content = next === 'en' ? 'en_US' : 'es_PE';
    navigation.setAttribute('aria-label', text('Principal', 'Main navigation'));
    document.querySelectorAll('.brand').forEach((brand) => {
      brand.setAttribute('aria-label', text('Shasu Dev — inicio', 'Shasu Dev — home'));
    });
    document.querySelector('.project-preview').setAttribute('aria-label', text('Pandatec — abrir proyecto en una nueva pestaña', 'Pandatec — open project in a new tab'));
    document.querySelector('#terminal-output').setAttribute('aria-label', text('Respuestas de la terminal', 'Terminal responses'));
    terminalInput.placeholder = text('ayuda', 'help');
    try { localStorage.setItem('shasu-lang', next); } catch { /* Storage may be blocked. */ }
  }

  languageButtons.forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  });
  try {
    if (localStorage.getItem('shasu-lang') === 'en') setLanguage('en');
  } catch { /* Spanish is the default, including in private/offline contexts. */ }
  document.querySelector('#year').textContent = String(new Date().getFullYear());

  // Browser-managed observation replaces per-frame scroll handlers.
  if ('IntersectionObserver' in window) {
    const links = [...navigation.querySelectorAll('a[href^="#"]')];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) {
        entries.forEach((entry) => {
          const link = links.find((item) => item.hash === `#${entry.target.id}`);
          if (link) link.removeAttribute('aria-current');
        });
        return;
      }
      links.forEach((link) => {
        if (link.hash === `#${visible[0].target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -45% 0px', threshold: [0, 0.15, 0.4] });
    links.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section) observer.observe(section);
    });
  }

  // A small portfolio command interpreter, with no dynamic code execution or system access.
  const output = document.querySelector('#terminal-output');
  const form = document.querySelector('#terminal-form');
  const history = [];
  let historyIndex = 0;
  let draft = '';
  const aliases = new Map();
  const commands = {
    help: ['help', 'ayuda', '?'],
    about: ['about', 'sobre', 'sobre-mi', 'whoami'],
    projects: ['projects', 'proyectos', 'ls'],
    skills: ['skills', 'habilidades', 'stack'],
    services: ['services', 'servicios'],
    contact: ['contact', 'contacto', 'whatsapp', 'wa', 'hire', 'contratar'],
    github: ['github', 'git'],
    principles: ['principles', 'principios'],
    lang: ['lang', 'idioma'],
    clear: ['clear', 'limpiar', 'cls'],
  };
  Object.entries(commands).forEach(([name, variations]) => {
    variations.forEach((alias) => aliases.set(alias, name));
  });

  function appendLine(value, className = '') {
    const paragraph = document.createElement('p');
    if (className) paragraph.className = className;
    paragraph.textContent = value;
    output.append(paragraph);
    // Bound memory and DOM growth during long sessions.
    while (output.children.length > 80) output.firstElementChild.remove();
    return paragraph;
  }

  function appendLink(label, url) {
    const paragraph = appendLine('');
    const link = document.createElement('a');
    link.textContent = label;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    paragraph.append(link);
  }

  function executeCommand(raw) {
    const command = raw.trim().slice(0, 160);
    if (!command) return;
    appendLine(`visitante:~$ ${command}`, 'terminal-echo');
    history.push(command);
    if (history.length > 100) history.shift();
    historyIndex = history.length;
    draft = '';
    const [name, argument] = command.toLowerCase().split(/\s+/);

    switch (aliases.get(name)) {
      case 'help':
        appendLine(text('ayuda        lista de comandos\nsobre-mi     quién soy\nproyectos    trabajo seleccionado\nhabilidades  herramientas\nservicios    qué puedo construir\nprincipios   cómo trabajo\ncontacto     conversemos\ngithub       repositorios\nidioma en    cambiar a inglés\nlimpiar      borrar la pantalla\n\n↑ ↓ historial · Tab autocompletar', 'help         available commands\nabout        who I am\nprojects     selected work\nskills       my toolbox\nservices     what I build\nprinciples   how I work\ncontact      let’s talk\ngithub       repositories\nlang es      switch to Spanish\nclear        clear the screen\n\n↑ ↓ history · Tab autocomplete'));
        break;
      case 'about':
        appendLine(text('Jesús Fernando Lucero Purihuamán · Shasu Dev\nIngeniero de software en Perú. Desarrollo webs, sistemas y automatizaciones, y comparto lo que aprendo.', 'Jesús Fernando Lucero Purihuamán · Shasu Dev\nSoftware engineer in Peru. I build websites, systems and automations, and share what I learn.'));
        break;
      case 'projects':
        appendLine(text('Pandatec · Sistema de gestión para negocios de celulares.', 'Pandatec · Management system for mobile phone shops.'));
        appendLink('↗ pandatec.onrender.com', 'https://pandatec.onrender.com/index.html');
        break;
      case 'skills':
        appendLine('Frontend  HTML · CSS · JavaScript · TypeScript · React\nBackend   Node.js · Python · REST APIs · SQL\nTooling   Git · GitHub · Docker · Linux · Figma');
        break;
      case 'services':
        appendLine(text('01  Sitios web y portafolios\n02  Aplicaciones y sistemas a medida\n03  Automatización e integración de APIs', '01  Websites and portfolios\n02  Custom applications and systems\n03  Automation and API integrations'));
        break;
      case 'principles':
        appendLine(text('礼 Respeto por tu tiempo y confianza.\n雅 Elegancia: simple, claro y bien hecho.\n律 Disciplina y cuidado en cada detalle.', '礼 Respect for your time and trust.\n雅 Elegance: simple, clear and well made.\n律 Discipline and care in every detail.'));
        break;
      case 'contact':
        appendLink('↗ WhatsApp · +51 989 168 816', 'https://wa.me/51989168816?text=Hola%20Shasu%20Dev%2C%20quiero%20conversar%20sobre%20un%20proyecto.');
        break;
      case 'github':
        appendLink('↗ github.com/shasudev', 'https://github.com/shasudev');
        break;
      case 'lang':
        if (argument === 'es' || argument === 'en') {
          setLanguage(argument);
          appendLine(text('Idioma: español', 'Language: English'));
        } else appendLine(text('Uso: idioma es | idioma en', 'Usage: lang es | lang en'));
        break;
      case 'clear':
        output.replaceChildren();
        break;
      default:
        appendLine(text(`Comando no encontrado: ${name}. Escribe ayuda.`, `Command not found: ${name}. Type help.`));
    }
    output.scrollTop = output.scrollHeight;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    executeCommand(terminalInput.value);
    terminalInput.value = '';
  });
  terminalInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (historyIndex === history.length) draft = terminalInput.value;
      historyIndex = Math.max(0, historyIndex - 1);
      terminalInput.value = history[historyIndex] ?? draft;
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      terminalInput.value = history[historyIndex] ?? draft;
    } else if (event.key === 'Tab' && !event.shiftKey && terminalInput.value.trim()) {
      const prefix = terminalInput.value.trim().toLowerCase();
      const matches = [...aliases.keys()].filter((key) => key.startsWith(prefix));
      if (matches.length) {
        event.preventDefault();
        terminalInput.value = matches[0];
        if (matches.length > 1) {
          appendLine(matches.join('  '));
          output.scrollTop = output.scrollHeight;
        }
      }
    }
  });
  document.querySelector('.terminal-shortcuts').addEventListener('click', (event) => {
    const button = event.target.closest('[data-command]');
    if (!button) return;
    const name = button.dataset.command;
    const alias = language === 'es' ? commands[name][1] : name;
    executeCommand(alias);
  });
})();
