'use strict';
const learningData = {
  esp32: {signal:'Procesamiento y comunicación',role:'Coordina las entradas y salidas',example:'Recibir lecturas y enviarlas por Wi-Fi'},
  mq2: {signal:'Respuesta a humo y gases inflamables',role:'Entrada: percibir cambios del entorno',example:'Explorar variaciones ante la presencia de humo'},
  flama: {signal:'Radiación infrarroja',role:'Entrada: percibir una fuente de luz',example:'Explorar la detección óptica de una llama'},
  dht11: {signal:'Temperatura y humedad',role:'Entrada: medir el ambiente',example:'Consultar las condiciones de una habitación'},
  bme280: {signal:'Temperatura, humedad y presión',role:'Entrada: medir el ambiente',example:'Registrar condiciones en una estación ambiental'},
  bme680: {signal:'Temperatura, humedad, presión y resistencia de gas',role:'Entrada: observar variables ambientales',example:'Explorar cambios en el ambiente y en la respuesta a gases'},
  buzzer: {signal:'Sonido',role:'Salida: emitir un aviso',example:'Reproducir un tono al cumplirse una condición'},
  servo: {signal:'Movimiento',role:'Salida: mover un mecanismo',example:'Orientar una pequeña compuerta de demostración'}
};

const selectedComponents = new Set(['dht11', 'bme280', 'bme680']);
const picker = document.getElementById('compare-picker');

function renderComparison() {
  picker.innerHTML = components.map(c =>
    `<button class="compare-chip ${selectedComponents.has(c.id) ? 'selected' : ''}" data-compare="${c.id}" aria-pressed="${selectedComponents.has(c.id)}"><span>${selectedComponents.has(c.id) ? '✓' : '+'}</span> ${c.name}</button>`
  ).join('');
  const selected = components.filter(c => selectedComponents.has(c.id));
  const rows = [
    ['Componente', c => `<div class="compare-art">${art(c.id)}</div><strong>${c.name}</strong>`],
    ['Tipo', c => `<span class="tag">${c.label}</span>`],
    ['Qué mide o produce', c => learningData[c.id].signal],
    ['Función principal', c => learningData[c.id].role],
    ['Ejemplo de uso', c => learningData[c.id].example],
    ['Para tener en cuenta', c => c.note]
  ];
  document.getElementById('compare-body').innerHTML = selected.length
    ? rows.map(([title, value], index) =>
        `<tr><th scope="row">${title}</th>${selected.map(c => index === 0 ? `<th scope="col">${value(c)}</th>` : `<td>${value(c)}</td>`).join('')}</tr>`
      ).join('')
    : '<tr><td class="comparison-empty">Selecciona un componente para comenzar la comparación.</td></tr>';
}

picker.addEventListener('click', e => {
  const button = e.target.closest('[data-compare]');
  if (!button) return;
  const id = button.dataset.compare;
  const message = document.getElementById('compare-message');
  if (selectedComponents.has(id)) {
    selectedComponents.delete(id);
  } else if (selectedComponents.size < 3) {
    selectedComponents.add(id);
  } else {
    message.textContent = 'Ya elegiste 3 componentes. Quita uno para agregar otro.';
    return;
  }
  message.textContent = `${selectedComponents.size} de 3 componentes seleccionados.`;
  renderComparison();
  picker.querySelector(`[data-compare="${id}"]`)?.focus();
});

const cases = {
  ambiente: {
    title: 'Una pequeña estación ambiental.',
    text: 'Un sensor obtiene información del aire y el ESP32 puede procesarla y comunicarla. La elección depende de las variables que quieras observar.',
    ids: ['bme280', 'esp32'],
    steps: [
      'El BME280 mide temperatura, humedad y presión.',
      'El ESP32 recibe y procesa las lecturas.',
      'Un programa puede enviar los datos a una interfaz.'
    ],
    tip: 'Para temperatura y humedad puedes explorar el DHT11. El BME280 añade presión; el BME680 también incorpora una respuesta a gases.'
  },
  aviso: {
    title: 'Una lectura que se convierte en sonido.',
    text: 'Un ejemplo educativo puede relacionar la lectura de un sensor con una condición programada para activar un aviso.',
    ids: ['mq2', 'esp32', 'buzzer'],
    steps: [
      'El MQ-2 entrega una señal que cambia según las condiciones.',
      'El programa compara la lectura con un criterio definido.',
      'El ESP32 controla un buzzer para emitir un aviso.'
    ],
    tip: 'El umbral y la calibración son parte del diseño del prototipo. La señal sin calibrar no representa una concentración exacta de gas.'
  },
  movimiento: {
    title: 'De una instrucción al movimiento.',
    text: 'Un servomotor puede mostrar una respuesta mecánica, por ejemplo al orientar una pequeña compuerta en una maqueta.',
    ids: ['esp32', 'servo'],
    steps: [
      'El programa establece una posición objetivo.',
      'El ESP32 genera la señal de control.',
      'El servomotor mueve el mecanismo dentro del rango de su modelo.'
    ],
    tip: 'El motor necesita una alimentación adecuada a su consumo. La señal de control y la alimentación cumplen funciones diferentes.'
  }
};

function componentPills(ids) {
  return ids.map(id => {
    const c = components.find(item => item.id === id);
    return `<span class="component-pill">${c.name}</span>`;
  }).join('');
}

function renderCase(id) {
  const c = cases[id];
  document.getElementById('usecase-panel').innerHTML = `
    <span class="example-label">EJEMPLO ILUSTRATIVO</span>
    <div class="case-illustrations">${c.ids.map(item => `<div>${art(item)}</div>`).join('')}</div>
    <h3>${c.title}</h3>
    <p>${c.text}</p>
    <div class="component-pills">${componentPills(c.ids)}</div>
    <ol>${c.steps.map(step => `<li>${step}</li>`).join('')}</ol>
    <p class="case-tip">${c.tip}</p>
  `;
}

document.querySelectorAll('.usecase-tab').forEach(button =>
  button.addEventListener('click', () => {
    document.querySelectorAll('.usecase-tab').forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    renderCase(button.dataset.case);
  })
);

const tasks = {
  ambiente: {
    ids: ['dht11', 'bme280', 'bme680'],
    text: 'Estos sensores permiten explorar temperatura y humedad. Compara sus fichas para conocer qué otras variables añade cada uno.'
  },
  gas: {
    ids: ['mq2', 'bme680'],
    text: 'El MQ-2 es sensible al humo y a ciertos gases inflamables; el BME680 entrega una resistencia de gas. Son mediciones diferentes y requieren interpretación.'
  },
  sonido: {
    ids: ['buzzer'],
    text: 'El buzzer es el actuador que produce sonido. El tipo activo o pasivo determina cómo se controla.'
  },
  motor: {
    ids: ['servo'],
    text: 'El servomotor permite explorar movimiento controlado. Consulta el rango y la alimentación del modelo que tengas.'
  },
  control: {
    ids: ['esp32'],
    text: 'El ESP32 ejecuta el programa, procesa las entradas y permite explorar la comunicación inalámbrica.'
  }
};

function renderTask() {
  const task = tasks[document.getElementById('task-select').value];
  const container = document.getElementById('task-results');
  container.innerHTML = `
    <div class="task-matches">
      ${task.ids.map(id => `<div class="task-component" data-task-id="${id}" tabindex="0" role="button" aria-label="Abrir ficha de ${components.find(c => c.id === id).name}">${art(id)}<strong>${components.find(c => c.id === id).name}</strong></div>`).join('')}
    </div>
    <div>
      <span class="example-label">COMPONENTES PARA EXPLORAR</span>
      <p>${task.text}</p>
      <a href="#catalogo" class="text-link">Consultar las fichas del catálogo ↗</a>
    </div>
  `;
}

document.getElementById('task-results').addEventListener('click', e => {
  const card = e.target.closest('[data-task-id]');
  if (card && typeof window.openComponentDetail === 'function') {
    window.openComponentDetail(card.dataset.taskId, card);
  }
});

document.getElementById('task-select').addEventListener('change', renderTask);

// ============================================================================
// NUEVO MÓDULO 1: Mapa Interactivo de Pines y Conexiones del ESP32
// ============================================================================
const pinoutData = {
  bme280: {
    name: 'BME280 / BME680 (Bus I²C)',
    protocol: 'Comunicación I²C (Dirección 0x76 / 0x77)',
    advice: 'Conecta VCC a 3.3V del ESP32. Los pines GPIO 21 (SDA) y GPIO 22 (SCL) permiten compartir el bus con otros dispositivos I²C.',
    pins: [
      { modPin: 'VCC', espPin: '3V3', role: 'Alimentación 3.3 V', coord: [82, 74], color: '#ef6b48' },
      { modPin: 'GND', espPin: 'GND', role: 'Tierra común', coord: [418, 74], color: '#8ba39c' },
      { modPin: 'SDA', espPin: 'GPIO 21', role: 'Datos seriales I²C', coord: [418, 170], color: '#4cc4a4' },
      { modPin: 'SCL', espPin: 'GPIO 22', role: 'Reloj serial I²C', coord: [418, 138], color: '#f59e66' }
    ]
  },
  mq2: {
    name: 'Sensor de Humo y Gas MQ-2',
    protocol: 'Salida Analógica (ADC1) + Umbral Digital',
    advice: 'Usa un canal de ADC1 (como GPIO 34) porque ADC2 entra en conflicto con el Wi-Fi del ESP32. Adapta el nivel lógico de 5V a 3.3V con divisor resistivo.',
    pins: [
      { modPin: 'VCC', espPin: 'VIN (5V)', role: 'Calefactor del sensor', coord: [82, 266], color: '#ef6b48' },
      { modPin: 'GND', espPin: 'GND', role: 'Tierra común', coord: [418, 74], color: '#8ba39c' },
      { modPin: 'AOUT', espPin: 'GPIO 34', role: 'Entrada analógica ADC1_CH6', coord: [82, 106], color: '#f59e66' },
      { modPin: 'DOUT', espPin: 'GPIO 27', role: 'Señal binaria de detección', coord: [82, 202], color: '#4cc4a4' }
    ]
  },
  flama: {
    name: 'Sensor Óptico de Flama (IR)',
    protocol: 'Entrada Digital (Comparador LM393)',
    advice: 'La salida DO cambia de estado al superar el umbral infrarrojo ajustado en el potenciómetro del módulo.',
    pins: [
      { modPin: 'VCC', espPin: '3V3', role: 'Alimentación lógica 3.3 V', coord: [82, 74], color: '#ef6b48' },
      { modPin: 'GND', espPin: 'GND', role: 'Tierra común', coord: [418, 74], color: '#8ba39c' },
      { modPin: 'DO', espPin: 'GPIO 26', role: 'Detección digital de flama', coord: [82, 170], color: '#f59e66' }
    ]
  },
  dht11: {
    name: 'Sensor Ambiental DHT11',
    protocol: 'Bus Digital Single-Wire',
    advice: 'Incluye resistencia pull-up en la placa adaptadora. Realiza lecturas cada 2 segundos o más.',
    pins: [
      { modPin: 'VCC', espPin: '3V3', role: 'Alimentación 3.3 V', coord: [82, 74], color: '#ef6b48' },
      { modPin: 'DATA', espPin: 'GPIO 4', role: 'Señal digital de datos', coord: [418, 234], color: '#4cc4a4' },
      { modPin: 'GND', espPin: 'GND', role: 'Tierra común', coord: [418, 74], color: '#8ba39c' }
    ]
  },
  buzzer: {
    name: 'Buzzer (Aviso Sonoro)',
    protocol: 'Salida Digital / PWM (LEDC)',
    advice: 'Si el consumo supera la corriente segura del pin GPIO, conéctalo mediante un transistor NPN o MOSFET.',
    pins: [
      { modPin: 'POS (+)', espPin: 'GPIO 19', role: 'Control de tono / activación', coord: [418, 202], color: '#f59e66' },
      { modPin: 'NEG (-)', espPin: 'GND', role: 'Tierra común', coord: [418, 74], color: '#8ba39c' }
    ]
  },
  servo: {
    name: 'Servomotor (Compuerta)',
    protocol: 'Modulación por Ancho de Pulso (PWM 50 Hz)',
    advice: 'Alimenta el motor desde una fuente de 5V adecuada y une su GND con el GND del ESP32.',
    pins: [
      { modPin: 'V+ (Rojo)', espPin: '5V Externo', role: 'Alimentación de potencia', coord: [82, 266], color: '#ef6b48' },
      { modPin: 'PWM (Naranja)', espPin: 'GPIO 18', role: 'Pulso de posición (50 Hz)', coord: [418, 266], color: '#4cc4a4' },
      { modPin: 'GND (Café)', espPin: 'GND', role: 'Referencia común', coord: [418, 74], color: '#8ba39c' }
    ]
  }
};

function renderPinout(modKey) {
  const data = pinoutData[modKey] || pinoutData.bme280;
  const infoEl = document.getElementById('pinout-detail-box');
  const svgEl = document.getElementById('pinout-svg-stage');
  if (!infoEl || !svgEl) return;

  infoEl.innerHTML = `
    <span class="example-label">${data.protocol}</span>
    <h3 style="margin:6px 0 8px;font-size:20px">${data.name}</h3>
    <p style="font-size:12.5px;color:var(--muted);line-height:1.7;margin:0 0 12px">${data.advice}</p>
    <table class="pinout-wiring-table">
      <thead><tr><th>Pin Módulo</th><th>Pin ESP32</th><th>Función en el prototipo</th></tr></thead>
      <tbody>
        ${data.pins.map(p => `<tr><td><strong>${p.modPin}</strong></td><td><span class="pin-badge">${p.espPin}</span></td><td>${p.role}</td></tr>`).join('')}
      </tbody>
    </table>
  `;

  const leftLabels = ['3V3', 'GPIO 34', 'GPIO 35', 'GPIO 26', 'GPIO 27', 'GPIO 14', 'VIN (5V)'];
  const rightLabels = ['GND', 'GPIO 23', 'GPIO 22', 'GPIO 21', 'GPIO 19', 'GPIO 4', 'GPIO 18'];

  const leftPinsSvg = leftLabels.map((lbl, idx) => {
    const y = 74 + idx * 32;
    const activePin = data.pins.find(p => p.espPin === lbl);
    return `
      <g>
        <rect x="115" y="${y - 6}" width="18" height="12" rx="2" fill="${activePin ? activePin.color : '#c7b47c'}"/>
        <text x="105" y="${y + 3}" text-anchor="end" font-family="monospace" font-size="10" fill="${activePin ? '#ffd2a6' : '#8fa99f'}" font-weight="${activePin ? '700' : '400'}">${lbl}</text>
        ${activePin ? `<circle cx="82" cy="${y}" r="8" fill="${activePin.color}" fill-opacity=".28"/><circle cx="82" cy="${y}" r="4" fill="${activePin.color}"/>` : ''}
      </g>
    `;
  }).join('');

  const rightPinsSvg = rightLabels.map((lbl, idx) => {
    const y = 74 + idx * 32;
    const activePin = data.pins.find(p => p.espPin === lbl);
    return `
      <g>
        <rect x="367" y="${y - 6}" width="18" height="12" rx="2" fill="${activePin ? activePin.color : '#c7b47c'}"/>
        <text x="395" y="${y + 3}" text-anchor="start" font-family="monospace" font-size="10" fill="${activePin ? '#ffd2a6' : '#8fa99f'}" font-weight="${activePin ? '700' : '400'}">${lbl}</text>
        ${activePin ? `<circle cx="418" cy="${y}" r="8" fill="${activePin.color}" fill-opacity=".28"/><circle cx="418" cy="${y}" r="4" fill="${activePin.color}"/>` : ''}
      </g>
    `;
  }).join('');

  const wiresSvg = data.pins.map((p, idx) => {
    const [px, py] = p.coord;
    const tx = 250 + (idx - (data.pins.length - 1) / 2) * 32;
    const ty = 322;
    return `<path class="data-link-line" d="M${px} ${py} C ${px} ${(py + ty) / 2}, ${tx} ${(py + ty) / 2}, ${tx} ${ty}" fill="none" stroke="${p.color}" stroke-width="2.2"/>`;
  }).join('');

  svgEl.innerHTML = `
    <svg viewBox="0 0 500 350" role="img" aria-label="Esquema de conexiones sugeridas en ESP32 para ${data.name}">
      <rect x="133" y="34" width="234" height="256" rx="14" fill="#182f30" stroke="#486b68" stroke-width="2"/>
      <rect x="172" y="54" width="156" height="112" rx="6" fill="#bcc8c0" stroke="#7f948a"/>
      <text x="250" y="105" text-anchor="middle" font-family="monospace" font-size="15" font-weight="bold" fill="#233836">ESP32-WROOM</text>
      <text x="250" y="125" text-anchor="middle" font-family="monospace" font-size="10" fill="#435953">WI-FI + BLE SOC</text>
      <rect x="222" y="268" width="56" height="26" rx="4" fill="#cad2d0" stroke="#6d7f7c"/>
      <circle cx="165" cy="252" r="4.5" fill="#5ce08b"/>
      ${leftPinsSvg}
      ${rightPinsSvg}
      ${wiresSvg}
      <rect x="155" y="314" width="190" height="28" rx="7" fill="#243f41" stroke="#6aa395"/>
      <text x="250" y="332" text-anchor="middle" font-family="monospace" font-size="10.5" fill="#ffd2a6" font-weight="bold">${data.name.toUpperCase()}</text>
    </svg>
  `;
}

document.querySelectorAll('[data-pinout-mod]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-pinout-mod]').forEach(b => b.classList.toggle('active', b === btn));
    renderPinout(btn.dataset.pinoutMod);
  });
});
renderPinout('bme280');

// ============================================================================
// NUEVO MÓDULO 2: Laboratorio Interactivo de Actuadores (Servo PWM + Buzzer)
// ============================================================================
const servoSlider = document.getElementById('servo-angle-slider');
const servoHorn = document.getElementById('servo-horn-group');
const servoAngleOut = document.getElementById('servo-angle-out');
const pwmPulseOut = document.getElementById('pwm-pulse-out');
const pwmDutyOut = document.getElementById('pwm-duty-out');
const servoStateOut = document.getElementById('servo-state-out');

function updateServoLab(angle) {
  const deg = Math.max(0, Math.min(180, Number(angle) || 0));
  if (servoSlider) servoSlider.value = String(deg);
  if (servoAngleOut) servoAngleOut.textContent = `${deg}°`;
  const pulseUs = Math.round(500 + (deg / 180) * 1900);
  const dutyPct = ((pulseUs / 20000) * 100).toFixed(1);
  if (pwmPulseOut) pwmPulseOut.textContent = `${pulseUs} µs`;
  if (pwmDutyOut) pwmDutyOut.textContent = `${dutyPct}%`;
  if (servoStateOut) {
    servoStateOut.textContent = deg === 0 ? 'Cerrada' : deg < 75 ? 'Apertura parcial' : deg < 150 ? 'Ventilación activa' : 'Evacuación máxima';
  }
  if (servoHorn) {
    servoHorn.setAttribute('transform', `rotate(${deg - 90} 150 105)`);
  }
  document.querySelectorAll('[data-servo-preset]').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.servoPreset) === deg);
  });
}

if (servoSlider) {
  servoSlider.addEventListener('input', () => updateServoLab(servoSlider.value));
  document.querySelectorAll('[data-servo-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      updateServoLab(btn.dataset.servoPreset);
      window.showIgnisToast?.(`Servomotor orientado a ${btn.dataset.servoPreset}°`, 'Señal PWM de 50 Hz actualizada');
    });
  });
  updateServoLab(90);
}

// Buzzer Web Audio Synthesizer
let audioCtx = null, buzzerOsc = null, buzzerGain = null, buzzerTimer = null;
const buzzerFreqSlider = document.getElementById('buzzer-freq-slider');
const buzzerFreqOut = document.getElementById('buzzer-freq-out');
const buzzerStatusOut = document.getElementById('buzzer-status-out');
const buzzerWaveGroup = document.getElementById('buzzer-wave-rings');

function stopBuzzerSound() {
  clearInterval(buzzerTimer);
  buzzerTimer = null;
  if (buzzerOsc) {
    try { buzzerOsc.stop(); buzzerOsc.disconnect(); } catch {}
    buzzerOsc = null;
  }
  if (buzzerStatusOut) buzzerStatusOut.textContent = 'En silencio';
  if (buzzerWaveGroup) buzzerWaveGroup.style.opacity = '0.2';
}

function playBuzzerPattern(pattern) {
  stopBuzzerSound();
  const freq = Number(buzzerFreqSlider?.value || 2200);
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  buzzerOsc = audioCtx.createOscillator();
  buzzerGain = audioCtx.createGain();
  buzzerOsc.type = pattern === 'sirena' ? 'sawtooth' : 'square';
  buzzerOsc.frequency.value = freq;
  buzzerGain.gain.value = 0.08;
  buzzerOsc.connect(buzzerGain);
  buzzerGain.connect(audioCtx.destination);
  buzzerOsc.start();

  if (buzzerWaveGroup) buzzerWaveGroup.style.opacity = '1';
  if (buzzerStatusOut) {
    buzzerStatusOut.textContent = pattern === 'alerta' ? 'Pulso intermitente' : pattern === 'sirena' ? 'Barrido de alerta' : 'Tono de prueba';
  }

  let step = 0;
  buzzerTimer = setInterval(() => {
    step++;
    if (!buzzerOsc || !buzzerGain) return;
    if (pattern === 'alerta') {
      buzzerGain.gain.value = step % 2 === 0 ? 0.08 : 0.0;
    } else if (pattern === 'sirena') {
      buzzerOsc.frequency.value = step % 2 === 0 ? freq : Math.max(600, freq - 650);
    }
  }, 240);

  setTimeout(() => stopBuzzerSound(), 3200);
}

if (buzzerFreqSlider) {
  buzzerFreqSlider.addEventListener('input', () => {
    if (buzzerFreqOut) buzzerFreqOut.textContent = `${buzzerFreqSlider.value} Hz`;
    if (buzzerOsc) buzzerOsc.frequency.value = Number(buzzerFreqSlider.value);
  });
  document.querySelectorAll('[data-buzzer-pattern]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.buzzerPattern;
      if (p === 'stop') {
        stopBuzzerSound();
        window.showIgnisToast?.('Buzzer silenciado');
      } else {
        playBuzzerPattern(p);
        window.showIgnisToast?.('Prueba acústica activada', `Frecuencia base: ${buzzerFreqSlider.value} Hz`);
      }
    });
  });
}

// ============================================================================
// NUEVO MÓDULO 3: Generador Interactivo de Configuración ESPHome (YAML)
// ============================================================================
const yamlOutput = document.getElementById('yaml-output');
const yamlNodeName = document.getElementById('yaml-node-name');

function buildEspHomeYaml() {
  if (!yamlOutput) return;
  const rawName = (yamlNodeName?.value || 'ignis-nodo-principal').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'ignis-nodo';
  const checked = new Set(
    [...document.querySelectorAll('[data-yaml-comp]:checked')].map(el => el.dataset.yamlComp)
  );

  const lines = [
    `# Configuración generada por IGNIS para ESPHome`,
    `esphome:`,
    `  name: ${rawName}`,
    `  friendly_name: "IGNIS Estación Principal"`,
    ``,
    `esp32:`,
    `  board: esp32dev`,
    `  framework:`,
    `    type: arduino`,
    ``,
    `wifi:`,
    `  ssid: !secret wifi_ssid`,
    `  password: !secret wifi_password`,
    ``,
    `api:`,
    `  # Conecta directamente con Home Assistant`,
    `ota:`,
    `  - platform: esphome`,
    ``
  ];

  if (checked.has('bme280') || checked.has('bme680')) {
    lines.push(
      `i2c:`,
      `  sda: GPIO21`,
      `  scl: GPIO22`,
      `  scan: true`,
      ``
    );
  }

  lines.push(`sensor:`);
  if (checked.has('bme280')) {
    lines.push(
      `  - platform: bme280_i2c`,
      `    temperature:`,
      `      name: "Temperatura Ambiente"`,
      `    humidity:`,
      `      name: "Humedad Relativa"`,
      `    pressure:`,
      `      name: "Presión Atmosférica"`,
      `    address: 0x76`,
      `    update_interval: 5s`
    );
  }
  if (checked.has('bme680')) {
    lines.push(
      `  - platform: bme680`,
      `    temperature:`,
      `      name: "BME680 Temperatura"`,
      `    humidity:`,
      `      name: "BME680 Humedad"`,
      `    pressure:`,
      `      name: "BME680 Presión"`,
      `    gas_resistance:`,
      `      name: "Resistencia de Gas"`,
      `    address: 0x77`,
      `    update_interval: 5s`
    );
  }
  if (checked.has('dht11')) {
    lines.push(
      `  - platform: dht`,
      `    pin: GPIO4`,
      `    model: DHT11`,
      `    temperature:`,
      `      name: "DHT11 Temperatura"`,
      `    humidity:`,
      `      name: "DHT11 Humedad"`,
      `    update_interval: 5s`
    );
  }
  if (checked.has('mq2')) {
    lines.push(
      `  - platform: adc`,
      `    pin: GPIO34`,
      `    name: "Señal del MQ-2"`,
      `    attenuation: 12db`,
      `    update_interval: 2s`
    );
  }

  if (checked.has('mq2') || checked.has('flama')) {
    lines.push(``, `binary_sensor:`);
    if (checked.has('mq2')) {
      lines.push(
        `  - platform: gpio`,
        `    pin:`,
        `      number: GPIO27`,
        `      inverted: true`,
        `    name: "Detección de Humo"`,
        `    device_class: smoke`
      );
    }
    if (checked.has('flama')) {
      lines.push(
        `  - platform: gpio`,
        `    pin:`,
        `      number: GPIO26`,
        `      inverted: true`,
        `    name: "Detección de Flama"`,
        `    device_class: heat`
      );
    }
  }

  if (checked.has('buzzer') || checked.has('servo')) {
    lines.push(``, `output:`);
    if (checked.has('buzzer')) {
      lines.push(
        `  - platform: ledc`,
        `    pin: GPIO19`,
        `    id: ignis_buzzer_out`
      );
    }
    if (checked.has('servo')) {
      lines.push(
        `  - platform: ledc`,
        `    pin: GPIO18`,
        `    id: ignis_servo_pwm`,
        `    frequency: 50Hz`
      );
    }
  }

  yamlOutput.textContent = lines.join('\n');
}

document.querySelectorAll('[data-yaml-comp]').forEach(chk => chk.addEventListener('change', buildEspHomeYaml));
yamlNodeName?.addEventListener('input', buildEspHomeYaml);
buildEspHomeYaml();

document.getElementById('copy-yaml-btn')?.addEventListener('click', () => {
  const text = yamlOutput?.textContent || '';
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  window.showIgnisToast?.('Configuración YAML copiada', 'Lista para pegar en tu panel de ESPHome');
});

document.getElementById('download-yaml-btn')?.addEventListener('click', () => {
  const text = yamlOutput?.textContent || '';
  const url = URL.createObjectURL(new Blob([text], {type: 'text/yaml;charset=utf-8'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(yamlNodeName?.value || 'ignis-esp32').trim()}.yaml`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  window.showIgnisToast?.('Archivo .yaml descargado');
});

// ============================================================================
// NUEVO MÓDULO 4: Autoevaluación / Quiz Interactivo de IGNIS
// ============================================================================
const quizQuestions = [
  {
    q: '1. ¿Qué función cumple el microcontrolador ESP32 dentro de la arquitectura de IGNIS?',
    opts: [
      'Recibir señales de los sensores, procesarlas y transmitirlas por Wi-Fi a Home Assistant',
      'Medir directamente la concentración exacta de monóxido en partes por millón',
      'Sustituir la fuente de alimentación de potencia de los servomotores',
      'Almacenar permanentemente los tokens de acceso en el archivo CSV'
    ],
    ans: 0,
    exp: 'Correcto: el ESP32 coordina las entradas de los sensores, ejecuta la lógica programada y comunica los estados por Wi-Fi.'
  },
  {
    q: '2. ¿Qué diferencia principal distingue al sensor BME680 frente al modelo BME280?',
    opts: [
      'El BME680 incorpora un elemento sensible a gases que entrega una medición de resistencia óhmica',
      'El BME280 es un actuador mecánico mientras que el BME680 es un buzzer',
      'El BME680 solo mide radiación infrarroja de llamas directas',
      'No existe ninguna diferencia; ambos entregan únicamente temperatura'
    ],
    ans: 0,
    exp: 'Exacto: además de temperatura, humedad y presión, el BME680 mide la resistencia de su capa sensible a gases.'
  },
  {
    q: '3. ¿Cómo se interpreta la lectura analógica del módulo MQ-2 en este panel académico?',
    opts: [
      'Como una señal relativa sin calibrar que se muestra separada de la señal binaria de detección',
      'Como una certificación oficial de seguridad industrial en ppm',
      'Como la lectura de presión barométrica en hectopascales (hPa)',
      'Como una señal de reloj I²C para sincronizar el servomotor'
    ],
    ans: 0,
    exp: 'Muy bien: la lectura analógica sin calibrar no equivale a ppm exactos y se presenta por separado de la detección binaria.'
  },
  {
    q: '4. ¿Qué ocurre en el Centro de Monitoreo de IGNIS si se pierde la conexión con Home Assistant?',
    opts: [
      'Retira las lecturas actuales para no mostrar valores obsoletos como vigentes y pasa a SIN CONEXIÓN',
      'Inventa lecturas aleatorias haciéndolas pasar por sensores reales conectados',
      'Conserva congelados los últimos valores como si siguieran en vivo indefinidamente',
      'Envía el token de acceso por correo electrónico'
    ],
    ans: 0,
    exp: 'Correcto: por transparencia técnica, al perderse la conexión se invalidan las lecturas en vivo y solo queda el historial previo.'
  }
];

let quizIdx = 0, quizScore = 0, quizAnswered = false;
function renderQuiz() {
  const bodyEl = document.getElementById('quiz-body');
  const scoreEl = document.getElementById('quiz-score-badge');
  if (!bodyEl || !scoreEl) return;
  scoreEl.textContent = `Puntaje: ${quizScore} / ${quizQuestions.length}`;

  if (quizIdx >= quizQuestions.length) {
    bodyEl.innerHTML = `
      <div class="quiz-feedback">
        <strong>¡Autoevaluación completada! Obtuviste ${quizScore} de ${quizQuestions.length} respuestas correctas.</strong>
        <p style="margin:6px 0 0;color:var(--muted)">Ya dominas el flujo de señales, sensores, actuadores y la integración con Home Assistant de IGNIS.</p>
      </div>
      <button type="button" class="primary-link" id="quiz-restart-btn">Volver a intentar el reto ↗</button>
    `;
    document.getElementById('quiz-restart-btn')?.addEventListener('click', () => {
      quizIdx = 0;
      quizScore = 0;
      quizAnswered = false;
      renderQuiz();
    });
    return;
  }

  const item = quizQuestions[quizIdx];
  bodyEl.innerHTML = `
    <h3 style="font-size:19px;font-weight:700;margin:0 0 12px">${item.q}</h3>
    <div class="quiz-options">
      ${item.opts.map((opt, i) => `<button type="button" class="quiz-opt-btn" data-quiz-opt="${i}">${opt}</button>`).join('')}
    </div>
    <div id="quiz-exp-box" hidden></div>
    <button type="button" class="primary-link" id="quiz-next-btn" hidden>Siguiente pregunta ↗</button>
  `;

  bodyEl.querySelectorAll('[data-quiz-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (quizAnswered) return;
      quizAnswered = true;
      const chosen = Number(btn.dataset.quizOpt);
      const isRight = chosen === item.ans;
      if (isRight) quizScore++;
      scoreEl.textContent = `Puntaje: ${quizScore} / ${quizQuestions.length}`;
      bodyEl.querySelectorAll('[data-quiz-opt]').forEach(b => {
        b.disabled = true;
        const idx = Number(b.dataset.quizOpt);
        if (idx === item.ans) b.classList.add('correct');
        else if (idx === chosen) b.classList.add('wrong');
      });
      const expBox = document.getElementById('quiz-exp-box');
      if (expBox) {
        expBox.hidden = false;
        expBox.className = 'quiz-feedback';
        expBox.textContent = item.exp;
      }
      const nextBtn = document.getElementById('quiz-next-btn');
      if (nextBtn) {
        nextBtn.hidden = false;
        nextBtn.onclick = () => {
          quizIdx++;
          quizAnswered = false;
          renderQuiz();
        };
      }
    });
  });
}
renderQuiz();

renderComparison();
renderCase('ambiente');
renderTask();
