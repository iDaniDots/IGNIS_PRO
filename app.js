'use strict';
// Edita esta lista para cambiar el contenido del catálogo.
const components = [
  {id:'esp32',name:'ESP32',type:'Controladores',label:'Controlador',short:'El cerebro que conecta y coordina el proyecto.',tag:'Wi-Fi + Bluetooth',what:'Es una familia de microcontroladores con conectividad inalámbrica. En una placa de desarrollo permite conectar sensores y programar el comportamiento de un prototipo.',use:'Recibe las señales de los sensores, procesa datos y puede comunicarlos por Wi-Fi. Sus salidas permiten controlar otros componentes mediante los circuitos adecuados.',project:'Su función en el sistema es concentrar las lecturas y coordinar las respuestas del buzzer y del servomotor.',note:'La distribución de pines depende de la placa utilizada. Consulta el modelo antes de realizar conexiones.',source:'https://documentation.espressif.com/esp32_datasheet_en.html'},
  {id:'mq2',name:'MQ-2',type:'Sensores',label:'Sensor',short:'Detecta humo y responde a ciertos gases inflamables.',tag:'Humo / gas',what:'Es un sensor semiconductor sensible al humo y a diversos gases inflamables. Los módulos suelen incorporar un ajuste de umbral.',use:'Se utiliza para observar cambios en la señal asociados a la presencia de humo o gases. Requiere calentamiento y condiciones de calibración apropiadas.',project:'En el sistema aporta una señal para explorar la detección de humo o gases inflamables.',note:'Una lectura analógica sin calibrar no equivale a una concentración exacta en ppm.',source:'https://www.winsen-sensor.com/sensors/combustible-sensor/mq2.html'},
  {id:'flama',name:'Sensor de flama',type:'Sensores',label:'Sensor',short:'Percibe radiación infrarroja asociada a una llama.',tag:'Luz infrarroja',what:'Es un módulo óptico sensible a determinadas longitudes de onda infrarrojas. Sus características dependen del modelo.',use:'Ayuda a detectar una fuente de radiación en su campo de visión. Su respuesta puede verse afectada por la iluminación y otras fuentes infrarrojas.',project:'Complementa la lectura de otros sensores al explorar la presencia de una llama en el prototipo.',note:'Su alcance, ángulo y conexiones deben verificarse con la ficha del módulo utilizado.'},
  {id:'dht11',name:'DHT11',type:'Sensores',label:'Sensor',short:'Una forma sencilla de medir temperatura y humedad.',tag:'Temperatura / humedad',what:'Es un sensor digital que entrega mediciones de temperatura y humedad relativa del aire.',use:'Permite observar condiciones ambientales en prácticas de electrónica y proyectos educativos.',project:'Su función en el sistema es aportar una referencia de temperatura y humedad del ambiente.',note:'La precisión, frecuencia de lectura y alimentación deben consultarse en la ficha del módulo.'},
  {id:'bme280',name:'BME280',type:'Sensores',label:'Sensor',short:'Tres variables ambientales en un solo componente.',tag:'Ambiente',what:'Es un sensor de Bosch que integra medición de temperatura, humedad relativa y presión atmosférica.',use:'Se emplea para registrar condiciones ambientales. El circuito integrado admite comunicación I²C y SPI.',project:'Permite explorar la medición de variables ambientales y su envío desde el ESP32.',note:'No mide gases. Las conexiones disponibles dependen de la placa adaptadora.',source:'https://www.bosch-sensortec.com/en/products/environmental-sensors/humidity-sensors-bme280'},
  {id:'bme680',name:'BME680',type:'Sensores',label:'Sensor',short:'Medición ambiental con respuesta a gases.',tag:'Ambiente / gas',what:'Es un sensor de Bosch que reúne temperatura, humedad, presión y una medición de resistencia de gas.',use:'Permite observar condiciones ambientales y cambios en la respuesta del elemento sensible a gases.',project:'Se incluye como una alternativa para reunir varias lecturas ambientales en el prototipo.',note:'La resistencia de gas no identifica por sí sola un gas específico. Los índices de calidad del aire requieren procesamiento adicional.',source:'https://www.bosch-sensortec.com/en/products/environmental-sensors/gas-sensors/bme680'},
  {id:'buzzer',name:'Buzzer',type:'Actuadores',label:'Actuador',short:'Transforma una señal eléctrica en un aviso sonoro.',tag:'Sonido',what:'Es un componente que produce sonido. Existen modelos activos y pasivos con formas de control diferentes.',use:'Sirve para emitir avisos, tonos o indicaciones audibles dentro de un proyecto electrónico.',project:'En el sistema se utiliza como salida sonora para representar una condición de alerta.',note:'Un buzzer activo suele sonar al alimentarse; uno pasivo necesita una señal oscilante.'},
  {id:'servo',name:'Servomotor',type:'Actuadores',label:'Actuador',short:'Convierte una instrucción en movimiento controlado.',tag:'Movimiento',what:'Es un actuador que integra motor y control. Los modelos de posición permiten orientar un eje dentro de un rango determinado.',use:'Permite mover pequeños mecanismos mediante una señal de control y una alimentación apropiada.',project:'Representa una respuesta mecánica controlada por el ESP32 dentro del prototipo.',note:'El rango de giro y el consumo dependen del modelo. La alimentación debe dimensionarse para el motor.'}
];

// Ilustraciones vectoriales esquemáticas con detalles técnicos; no representan un pinout.
function art(id) {
  const pins = Array.from({length: 12}, (_, i) =>
    `<rect x="${57 + i * 11}" y="44" width="5" height="14" rx="1.5" fill="#d4be83"/><rect x="${57 + i * 11}" y="142" width="5" height="14" rx="1.5" fill="#d4be83"/>`
  ).join('');
  let shape = '';
  if (id === 'esp32') {
    shape = `${pins}<rect x="44" y="54" width="162" height="92" rx="8" fill="#1e3836" stroke="#3c5e5a" stroke-width="1.5"/><path d="M56 68h32M56 130h32" stroke="#385b56" stroke-width="1.5"/><rect x="94" y="63" width="76" height="66" rx="4" fill="#c4d0c7" stroke="#86988b" stroke-width="1.2"/><path d="M178 67h18v8h-12v8h12v8h-12v8h12v8h-12v8h12v13" fill="none" stroke="#d8c383" stroke-width="2.8" stroke-linecap="round"/><rect x="34" y="84" width="24" height="30" rx="3" fill="#cfd6d4" stroke="#7d8f8b"/><rect x="34" y="90" width="9" height="18" fill="#4b605d"/><rect x="69" y="72" width="11" height="14" rx="2" fill="#a7b5a8"/><rect x="69" y="114" width="11" height="14" rx="2" fill="#a7b5a8"/><text x="106" y="91" font-size="9.5" font-weight="bold" fill="#3b4d43" font-family="monospace">ESP32</text><text x="106" y="104" font-size="6.5" fill="#506257" font-family="monospace">WROOM-32</text><circle cx="84" cy="133" r="3.5" fill="#6be089"/><circle cx="84" cy="133" r="6.5" fill="#6be089" fill-opacity=".25"/>`;
  } else if (id === 'mq2') {
    shape = `<rect x="68" y="96" width="118" height="54" rx="6" fill="#23615f" stroke="#3f8582" stroke-width="1.2"/><path d="M86 148v20m14-20v20m14-20v20m14-20v20" stroke="#cbb57f" stroke-width="5" stroke-linecap="round"/><ellipse cx="128" cy="99" rx="39" ry="14" fill="#77948d"/><path d="M89 96V65h78v31" fill="#b4c2b6"/><ellipse cx="128" cy="65" rx="39" ry="16" fill="#d3dcd0" stroke="#7f9183" stroke-width="1.2"/>${Array.from({length: 6}, (_, i) => `<path d="M${100 + i * 10} 55v19" stroke="#748874" stroke-width="2"/>`).join('')}<rect x="163" y="111" width="14" height="16" rx="2" fill="#5784c2"/><circle cx="170" cy="119" r="3.5" fill="#d0dff2"/><circle cx="82" cy="119" r="3" fill="#f0985b"/>`;
  } else if (id === 'servo') {
    shape = `<path d="M80 124Q38 170 44 106" fill="none" stroke="#c99659" stroke-width="5" stroke-linecap="round"/><rect x="74" y="74" width="108" height="72" rx="8" fill="#395c82" stroke="#5882ad" stroke-width="1.2"/><rect x="71" y="90" width="114" height="12" fill="#5889b0"/><rect x="62" y="102" width="134" height="10" rx="3" fill="#2f4d6b"/><rect x="118" y="47" width="22" height="28" rx="5" fill="#ced6c9"/><rect x="87" y="40" width="84" height="13" rx="6.5" fill="#f0efe2" stroke="#b5bdb0"/><circle cx="129" cy="46.5" r="5.5" fill="#8b9685"/><circle cx="101" cy="46.5" r="2.2" fill="#9ea899"/><circle cx="157" cy="46.5" r="2.2" fill="#9ea899"/><text x="99" y="130" font-size="11" font-weight="bold" fill="#d9eae6" font-family="monospace">SERVO</text>`;
  } else if (id === 'buzzer') {
    shape = `<path d="M113 132v36m30-36v36" stroke="#cab282" stroke-width="5" stroke-linecap="round"/><ellipse cx="128" cy="122" rx="46" ry="18" fill="#1b322f"/><path d="M82 83v39h92V83" fill="#243f39"/><ellipse cx="128" cy="83" rx="46" ry="20" fill="#385249" stroke="#527065"/><ellipse cx="128" cy="83" rx="13" ry="6.5" fill="#0d1f1c"/><path d="M106 52q22-12 44 0M114 43q14-8 28 0" fill="none" stroke="#e98b53" stroke-width="2" stroke-linecap="round" stroke-opacity=".7"/><text x="149" y="85" fill="#bed4b9" font-size="14" font-family="monospace">+</text>`;
  } else if (id === 'dht11') {
    shape = `<path d="M104 136v32m24-32v32m24-32v32" stroke="#cbb885" stroke-width="5" stroke-linecap="round"/><rect x="86" y="46" width="83" height="95" rx="6" fill="#48899c" stroke="#6eb0c2" stroke-width="1.2"/><rect x="95" y="56" width="65" height="71" rx="4" fill="#68a3b2"/>${Array.from({length: 6}, (_, i) => `<rect x="101" y="${62 + i * 9}" width="53" height="4" rx="1.5" fill="#326475"/>`).join('')}<text x="106" y="134" font-size="7.5" fill="#d8eff5" font-family="monospace">DHT11</text>`;
  } else if (id === 'flama') {
    shape = `<rect x="66" y="96" width="126" height="46" rx="6" fill="#2b6461" stroke="#488a86" stroke-width="1.2"/><path d="M85 142v24m14-24v24m14-24v24" stroke="#cab483" stroke-width="5" stroke-linecap="round"/><path d="M91 97V69m16 28V69" stroke="#aebba9" stroke-width="3"/><path d="M84 75V54a15 15 0 0130 0v21z" fill="#1e332d" stroke="#4f6e64"/><circle cx="99" cy="54" r="5" fill="#e98b53" fill-opacity=".35"/><rect x="132" y="102" width="25" height="21" rx="2" fill="#4b7ba3"/><circle cx="144.5" cy="112.5" r="6" fill="#c5d0c1"/><rect x="166" y="108" width="17" height="11" rx="1.5" fill="#1c3732"/><circle cx="174" cy="128" r="3" fill="#f29a5e"/>`;
  } else {
    const primary = id === 'bme680' ? '#4d658a' : '#5e5280';
    const border = id === 'bme680' ? '#708cb5' : '#8274a8';
    shape = `<rect x="74" y="52" width="108" height="95" rx="8" fill="${primary}" stroke="${border}" stroke-width="1.4"/><circle cx="87" cy="65" r="5" fill="#d4c485"/><circle cx="169" cy="65" r="5" fill="#d4c485"/><rect x="106" y="76" width="44" height="40" rx="5" fill="#c1ccc0" stroke="#8fa194"/><circle cx="128" cy="96" r="5.5" fill="#32453c"/>${Array.from({length: 6}, (_, i) => `<rect x="${88 + i * 14}" y="135" width="7" height="25" rx="1.5" fill="#cbb882"/>`).join('')}<text x="101" y="129" font-size="8.5" font-weight="bold" fill="#eef2e6" font-family="monospace">${id.toUpperCase()}</text>`;
  }
  return `<svg viewBox="0 0 250 200" role="img" aria-label="Ilustración esquemática de ${components.find(c => c.id === id)?.name || id}">${shape}</svg>`;
}

// Toast Notifications
function showIgnisToast(title, detail = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'ignis-toast';
  toast.innerHTML = `<strong>${title}</strong>${detail ? `<span>${detail}</span>` : ''}`;
  container.append(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'opacity 0.25s, transform 0.25s';
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}
window.showIgnisToast = showIgnisToast;

const cards = document.getElementById('cards'),
      search = document.getElementById('search'),
      dialog = document.getElementById('detail');
let category = 'Todos', previousFocus;

const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function openComponentDetail(id, triggerEl) {
  const c = components.find(item => item.id === id);
  if (!c || !dialog) return;
  if (triggerEl) previousFocus = triggerEl;
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-art">${art(c.id)}</div>
    <span class="type-label">${c.label} · ${c.tag}</span>
    <h2 id="detail-title">${c.name}</h2>
    <h3>¿Qué es?</h3>
    <p>${c.what}</p>
    <h3>¿Para qué sirve?</h3>
    <p>${c.use}</p>
    <h3>Su función en el sistema</h3>
    <p>${c.project}</p>
    <h3>Para tener en cuenta</h3>
    <p>${c.note}</p>
    ${c.source ? `<a class="source-link" href="${c.source}" target="_blank" rel="noopener noreferrer">Consultar documentación del fabricante ↗</a>` : ''}
    <p style="font-size:10.5px;margin-top:20px;opacity:0.75">Ilustración esquemática. La apariencia y conexiones dependen del módulo utilizado.</p>
  `;
  dialog.setAttribute('aria-labelledby', 'detail-title');
  dialog.showModal();
}
window.openComponentDetail = openComponentDetail;

function render() {
  const query = normalize(search.value.trim());
  const results = components.filter(c =>
    (category === 'Todos' || c.type === category) &&
    normalize([c.name, c.short, c.type, c.tag, c.what].join(' ')).includes(query)
  );
  cards.innerHTML = results.map(c => `
    <div class="col-12 col-md-6 col-lg-4">
      <article class="component-card">
        <div class="card-art">
          ${art(c.id)}
          <span class="art-code">${String(components.indexOf(c) + 1).padStart(2, '0')} / ${c.id.toUpperCase()}</span>
        </div>
        <div class="card-body-custom">
          <span class="type-label">${c.label}</span>
          <h3>${c.name}</h3>
          <p class="card-description">${c.short}</p>
          <div class="card-bottom">
            <span class="tag">${c.tag}</span>
            <button class="detail-button" data-id="${c.id}" aria-label="Ver ficha de ${c.name}">Ver ficha <span>↗</span></button>
          </div>
        </div>
      </article>
    </div>
  `).join('');
  document.getElementById('result-count').textContent = `Mostrando ${results.length} ${results.length === 1 ? 'componente' : 'componentes'}`;
  document.getElementById('empty').hidden = results.length > 0;
}

// Mouse spotlight tracking on component cards
cards.addEventListener('mousemove', e => {
  const card = e.target.closest('.component-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
});

document.querySelectorAll('.filter').forEach(button =>
  button.addEventListener('click', () => {
    category = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(b => {
      const active = b === button;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    render();
  })
);

search.addEventListener('input', render);

document.getElementById('reset').addEventListener('click', () => {
  search.value = '';
  document.querySelector('[data-filter="Todos"]').click();
  search.focus();
});

cards.addEventListener('click', event => {
  const button = event.target.closest('[data-id]');
  if (!button) return;
  openComponentDetail(button.dataset.id, button);
});

document.getElementById('close-detail').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      dialog.close();
    }
  }
});
dialog.addEventListener('close', () => previousFocus?.focus());

// Interactive Hero Building Nodes
const heroNodeInfo = document.getElementById('hero-node-info');
const heroNodes = {
  temp: { title: 'NODO 01 · TEMPERATURA Y AMBIENTE', desc: 'Sensores BME280 / BME680 / DHT11 registran variaciones térmicas y humedad.', id: 'bme280' },
  smoke: { title: 'NODO 02 · HUMO Y FLAMA', desc: 'Módulo MQ-2 y sensor óptico infrarrojo supervisan señales de combustión.', id: 'mq2' },
  esp32: { title: 'NODO 03 · CONTROLADOR ESP32', desc: 'Concentra las lecturas y las transmite por Wi-Fi hacia Home Assistant.', id: 'esp32' }
};
document.querySelectorAll('[data-hero-node]').forEach(node => {
  const activate = () => {
    const info = heroNodes[node.dataset.heroNode];
    if (info && heroNodeInfo) {
      heroNodeInfo.innerHTML = `<span><strong>${info.title}:</strong> ${info.desc}</span>`;
    }
  };
  node.addEventListener('mouseenter', activate);
  node.addEventListener('click', () => {
    const info = heroNodes[node.dataset.heroNode];
    if (info) openComponentDetail(info.id, node);
  });
});

// Theme Toggle (Light / Dark Control Room)
const themeBtn = document.getElementById('theme-toggle');
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeBtn) {
    themeBtn.textContent = theme === 'dark' ? '☀' : '☾';
    themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
  try { localStorage.setItem('ignis_theme', theme); } catch {}
  window.dispatchEvent(new Event('resize'));
}
if (themeBtn) {
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem('ignis_theme') || 'light'; } catch {}
  applyTheme(savedTheme);
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showIgnisToast(next === 'dark' ? 'Modo Control Room activado' : 'Modo Editorial Claro activado');
  });
}

// Command Palette (#cmd-dialog)
const cmdDialog = document.getElementById('cmd-dialog');
const cmdInput = document.getElementById('cmd-input');
const cmdList = document.getElementById('cmd-list');
const cmdActions = [
  { label: 'Ir al Centro de monitoreo en vivo', tag: 'Sección', action: () => { location.hash = '#monitoreo'; } },
  { label: 'Iniciar simulación de sensores', tag: 'Simulador', action: () => { location.hash = '#monitoreo'; document.getElementById('demo-button')?.click(); } },
  { label: 'Explorar Mapa Interactivo de Pines ESP32', tag: 'Hardware', action: () => { location.hash = '#pinout-section'; } },
  { label: 'Abrir Laboratorio de Actuadores (Servo + Buzzer)', tag: 'Laboratorio', action: () => { location.hash = '#actuadores-lab'; } },
  { label: 'Generar Código YAML para ESPHome', tag: 'Configuración', action: () => { location.hash = '#esphome-generator'; } },
  { label: 'Responder Quiz de Autoevaluación', tag: 'Académico', action: () => { location.hash = '#quiz-section'; } },
  { label: 'Alternar Tema Claro / Oscuro', tag: 'Apariencia', action: () => { themeBtn?.click(); } },
  ...components.map(c => ({
    label: `Ver ficha técnica: ${c.name}`,
    tag: c.label,
    action: () => openComponentDetail(c.id)
  }))
];

function renderCmdPalette(filterText = '') {
  if (!cmdList) return;
  const q = normalize(filterText.trim());
  const matches = cmdActions.filter(item => normalize(`${item.label} ${item.tag}`).includes(q));
  cmdList.innerHTML = matches.map((item, idx) =>
    `<button type="button" class="cmd-item" data-cmd-idx="${cmdActions.indexOf(item)}"><span>${item.label}</span><small>${item.tag}</small></button>`
  ).join('') || `<div style="padding:14px;font-size:12px;color:var(--muted)">Sin coincidencias.</div>`;
}

if (cmdDialog && cmdInput && cmdList) {
  document.getElementById('open-cmd')?.addEventListener('click', () => {
    cmdInput.value = '';
    renderCmdPalette('');
    cmdDialog.showModal();
    cmdInput.focus();
  });
  document.getElementById('close-cmd')?.addEventListener('click', () => cmdDialog.close());
  cmdInput.addEventListener('input', () => renderCmdPalette(cmdInput.value));
  cmdList.addEventListener('click', e => {
    const btn = e.target.closest('[data-cmd-idx]');
    if (!btn) return;
    const item = cmdActions[Number(btn.dataset.cmdIdx)];
    cmdDialog.close();
    item?.action();
  });
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdDialog.open) cmdDialog.close();
      else document.getElementById('open-cmd')?.click();
    }
  });
}

// Ambient Thermal Particle Canvas (#ember-canvas)
const emberCanvas = document.getElementById('ember-canvas');
if (emberCanvas && emberCanvas.getContext && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const ectx = emberCanvas.getContext('2d');
  let particles = [];
  const resizeEmbers = () => {
    emberCanvas.width = window.innerWidth;
    emberCanvas.height = window.innerHeight;
  };
  resizeEmbers();
  window.addEventListener('resize', resizeEmbers);
  for (let i = 0; i < 28; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1.2 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.15 - Math.random() * 0.35,
      a: 0.12 + Math.random() * 0.25
    });
  }
  const tickEmbers = () => {
    ectx.clearRect(0, 0, emberCanvas.width, emberCanvas.height);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = emberCanvas.height + 10; p.x = Math.random() * emberCanvas.width; }
      if (p.x < -10) p.x = emberCanvas.width + 10;
      if (p.x > emberCanvas.width + 10) p.x = -10;
      ectx.beginPath();
      ectx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ectx.fillStyle = isDark ? `rgba(245, 158, 102, ${p.a})` : `rgba(194, 86, 45, ${p.a * 0.7})`;
      ectx.fill();
    }
    requestAnimationFrame(tickEmbers);
  };
  requestAnimationFrame(tickEmbers);
}

// Scroll Progress & Header Elevation
const progressBar = document.getElementById('scroll-progress');
const headerEl = document.querySelector('.ignis-header');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  if (progressBar && docHeight > 0) {
    progressBar.style.width = `${Math.min(100, (scrollTop / docHeight) * 100)}%`;
  }
  if (headerEl) {
    headerEl.classList.toggle('scrolled', scrollTop > 20);
  }
}, { passive: true });

render();
