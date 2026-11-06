'use strict';
(() => {
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defs = [
  {key:'temperature',name:'Temperatura',symbol:'°',binary:false,hint:'Sensor ambiental',min:10,max:65},
  {key:'smoke',name:'Detección de humo',symbol:'≋',binary:true,hint:'Señal digital de detección'},
  {key:'flame',name:'Detección de flama',symbol:'<svg viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 2c2 7-8 9-8 16a7 7 0 0 0 14 0c0-4-2-7-4-8 0 5-4 5-4 9-3-4 5-8 2-17Z"/></svg>',binary:true,hint:'Sensor óptico'},
  {key:'gas',name:'Señal del MQ-2',symbol:'⌁',binary:false,hint:'Lectura sin convertir a ppm',min:200,max:3400},
  {key:'humidity',name:'Humedad',symbol:'◒',binary:false,hint:'Humedad relativa',min:0,max:100},
  {key:'resistance',name:'Resistencia de gas',symbol:'Ω',binary:false,hint:'BME680 · no equivale a ppm',min:4,max:60},
  {key:'pressure',name:'Presión atmosférica',symbol:'↕',binary:false,hint:'Sensor ambiental',optional:true,min:980,max:1040}
];

let mode = 'offline',
    ready = false,
    states = new Map(),
    mapping = {},
    history = [],
    demoTimer = null,
    demoAlert = false,
    demoFlame = false,
    demoPreset = 'normal',
    manualSim = { temp: 24.5, gas: 700, hum: 52, active: false },
    lastReceived = null,
    previousAlert = null,
    dialogFocus = null,
    hoverX = null;

const dialog = $('connection-dialog');

function log(message) {
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleTimeString('es-MX')} · ${message}`;
  $('live-log').prepend(li);
  while ($('live-log').children.length > 20) $('live-log').lastChild.remove();
}

function message(text) {
  $('connection-message').textContent = text;
  $('config-status').textContent = text;
}

function resetHistory() {
  history = [];
  lastReceived = null;
  $('download-readings').disabled = true;
  $('export-json').disabled = true;
  previousAlert = null;
  draw();
}

function active() {
  return mode === 'demo' || (mode === 'live' && ready);
}

function read(key) {
  if (!active()) return null;
  const def = defs.find(d => d.key === key);
  const id = mapping[key];
  const entity = states.get(id);
  if (!entity || ['unknown', 'unavailable', ''].includes(entity.state) || entity.state == null) return null;
  let value;
  if (def.binary) {
    if (!['on', 'off', '1', '0'].includes(String(entity.state))) return null;
    value = ['on', '1'].includes(String(entity.state)) ? 1 : 0;
  } else {
    if (String(entity.state).trim() === '') return null;
    value = Number(entity.state);
    if (!Number.isFinite(value)) return null;
  }
  return {
    value,
    unit: def.binary ? '' : String(entity.attributes?.unit_of_measurement || ''),
    entity: id,
    updated: entity.last_updated
  };
}

function record() {
  if (!active()) return;
  const values = {};
  for (const def of defs) {
    const v = read(def.key);
    if (v) values[def.key] = v;
  }
  if (!Object.keys(values).length) return;
  lastReceived = new Date();
  history.push({time: lastReceived.toISOString(), mode, values});
  if (history.length > 1500) history.shift();
  $('download-readings').disabled = false;
  $('export-json').disabled = false;
}

function render() {
  const visible = defs.filter(d => !d.optional || mapping[d.key]);
  let count = 0;
  const values = {};
  $('live-metrics').innerHTML = visible.map(d => {
    const v = read(d.key);
    values[d.key] = v;
    if (v) count++;
    let value = '—',
        unit = '',
        hint = active() ? (mapping[d.key] ? 'Lectura no disponible' : 'Sin sensor asignado') : 'Esperando conexión';
    let fillPct = 0;
    if (v) {
      value = d.binary ? (v.value ? 'Detectado' : 'Sin detección') : v.value.toLocaleString('es-MX', {maximumFractionDigits: d.key === 'gas' ? 2 : 1});
      unit = v.unit;
      hint = mode === 'demo' ? 'Dato simulado' : `${v.updated ? 'Actualizado ' + new Date(v.updated).toLocaleTimeString('es-MX') : 'Dato recibido'} · ${d.hint}`;
      if (d.binary) {
        fillPct = v.value ? 100 : 18;
      } else if (typeof d.min === 'number' && typeof d.max === 'number') {
        fillPct = Math.max(8, Math.min(100, Math.round(((v.value - d.min) / (d.max - d.min)) * 100)));
      }
    }
    return `<article class="live-metric ${!v ? 'missing' : ''} ${d.binary && v?.value ? 'triggered' : ''}" style="--metric-fill:${fillPct}%"><div class="metric-top"><span>${d.name}</span><span class="metric-symbol" aria-hidden="true">${d.symbol}</span></div><div class="metric-value"><strong class="${d.binary ? 'state-value' : ''}">${esc(value)}</strong><small>${esc(unit)}</small></div><small>${esc(hint)}</small></article>`;
  }).join('');

  $('available-count').textContent = `${count} de ${visible.length} lecturas disponibles`;

  const alert = !!(values.smoke?.value || values.flame?.value),
        complete = !!(values.smoke && values.flame);
  const banner = $('summary-banner');
  banner.className = 'summary-banner' + (alert ? ' alert' : complete ? ' normal' : '');
  $('summary-icon').textContent = alert ? '!' : complete ? '✓' : '◌';

  let title = 'A la espera de tus sensores',
      text = 'Conecta tu sistema para ver las lecturas reales de temperatura, humo y flama.';
  if (active()) {
    if (alert) {
      title = (mode === 'demo' ? 'Simulación · ' : '') + 'Señal de detección activa';
      text = [values.smoke?.value ? 'Humo detectado' : '', values.flame?.value ? 'Flama detectada' : ''].filter(Boolean).join(' · ') + '. Consulta las lecturas de tu prototipo.';
    } else if (complete) {
      title = mode === 'demo' ? 'Simulación · sin detecciones' : 'Sin señales de detección activas';
      text = 'Las señales configuradas de humo y flama están inactivas. Consulta también las demás lecturas.';
    } else {
      title = 'Faltan señales de detección';
      text = 'Asigna las señales de humo y flama para completar esta vista. Los sensores ambientales pueden mostrarse de forma independiente.';
    }
  }
  if (alert !== previousAlert && active()) {
    if (previousAlert !== null || alert) {
      log(alert ? 'Se recibió una señal de detección activa.' : 'Las señales de detección dejaron de estar activas.');
    }
    previousAlert = alert;
  }

  $('summary-title').textContent = title;
  $('summary-text').textContent = text;
  $('last-sync').textContent = lastReceived ? (active() ? 'Recibido ' : 'Última sesión ') + lastReceived.toLocaleTimeString('es-MX') : 'Sin actualizaciones';

  $('source-badge').textContent = mode === 'demo' ? 'SIMULACIÓN' : mode === 'live' && ready ? 'EN VIVO' : mode === 'connecting' ? 'CONECTANDO' : 'SIN CONEXIÓN';
  $('source-badge').className = 'source-badge ' + (mode === 'demo' ? 'demo' : mode === 'live' && ready ? 'live' : '');
  $('connection-light').className = mode === 'demo' ? 'demo' : mode === 'live' && ready ? 'live' : '';
  $('live-status').textContent = mode === 'demo' ? 'Simulación activa' : mode === 'live' && ready ? 'Conectado' : mode === 'connecting' ? 'Conectando…' : 'Desconectado';
  $('provider-label').textContent = mode === 'demo' ? 'Datos de ejemplo' : mode === 'live' && ready ? 'Home Assistant · conectado' : 'Home Assistant · sin conectar';
  $('source-caption').textContent = mode === 'demo' ? 'SIMULACIÓN / sin mediciones físicas' : mode === 'live' && ready ? 'ESP32 / datos recibidos por Home Assistant' : 'ESP32 / esperando conexión';
  $('disconnect-button').disabled = mode === 'offline';
  $('demo-event').hidden = mode !== 'demo';
  $('demo-button').textContent = mode === 'demo' ? 'Finalizar simulación ↗' : 'Explorar una simulación ↗';
  $('demo-description').textContent = mode === 'demo' ? 'Estos valores son ficticios. No vienen de tus sensores.' : 'Prueba la interfaz con datos de ejemplo.';
  draw();
}

function setOffline(text) {
  mode = 'offline';
  ready = false;
  states.clear();
  clearInterval(demoTimer);
  demoTimer = null;
  $('connect-ha').disabled = false;
  $('ha-token').value = '';
  $('entity-config').hidden = true;
  message(text);
  render();
}

const client = new IgnisHA({
  onStates: list => {
    states = new Map(list.filter(s => s && typeof s.entity_id === 'string').map(s => [s.entity_id, s]));
    populateSelectors();
  },
  onReady: () => {
    ready = true;
    mode = 'live';
    $('connect-ha').disabled = false;
    $('entity-config').hidden = false;
    message('Conexión lista. Elige los sensores de tu prototipo y pulsa Mostrar lecturas.');
    log('Home Assistant conectado. Elige las señales que deseas mostrar.');
    render();
  },
  onState: (id, state) => {
    if (state) states.set(id, state);
    else states.delete(id);
    if (Object.values(mapping).includes(id) && ready && mode === 'live') {
      record();
      render();
    }
  },
  onError: text => {
    setOffline(text);
    $('connection-light').className = 'error';
    log(text);
  }
});

function disconnect() {
  client.disconnect();
  setOffline('Conexión cerrada. Puedes conectar otra vez cuando quieras.');
  log('Sesión finalizada. Las lecturas anteriores quedan solo en el historial.');
}

function populateSelectors() {
  const wrap = $('entity-selectors');
  wrap.replaceChildren();
  defs.forEach(d => {
    const group = document.createElement('div'),
          label = document.createElement('label'),
          select = document.createElement('select');
    label.htmlFor = `entity-${d.key}`;
    label.textContent = d.name + (d.optional ? ' (opcional)' : '');
    select.id = label.htmlFor;
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = 'Sin asignar';
    select.append(blank);
    [...states.values()]
      .filter(s => s.entity_id.startsWith(d.binary ? 'binary_sensor.' : 'sensor.'))
      .sort((a, b) => a.entity_id.localeCompare(b.entity_id))
      .forEach(s => {
        const o = document.createElement('option');
        o.value = s.entity_id;
        o.textContent = `${s.attributes?.friendly_name || s.entity_id} · ${s.entity_id}`;
        select.append(o);
      });
    if (states.has(mapping[d.key])) select.value = mapping[d.key];
    group.append(label, select);
    wrap.append(group);
  });
}

function openDialog(event) {
  dialogFocus = event.currentTarget;
  if (mode === 'demo') {
    disconnect();
    resetHistory();
  }
  dialog.showModal();
  $('ha-token').value = '';
  if (ready && mode === 'live') {
    populateSelectors();
    $('entity-config').hidden = false;
  }
}

document.querySelectorAll('[data-open-connect]').forEach(b => b.addEventListener('click', openDialog));
$('close-connection').onclick = () => dialog.close();
dialog.addEventListener('close', () => {
  $('ha-token').value = '';
  dialogFocus?.focus();
});

$('connection-form').addEventListener('submit', event => {
  event.preventDefault();
  client.disconnect();
  clearInterval(demoTimer);
  demoTimer = null;
  mode = 'connecting';
  ready = false;
  states.clear();
  resetHistory();
  $('entity-config').hidden = true;
  $('connect-ha').disabled = true;
  message('Buscando Home Assistant y sus sensores…');
  render();
  const token = $('ha-token').value.trim();
  $('ha-token').value = '';
  client.connect($('ha-url').value.trim(), token);
});

$('apply-entities').onclick = () => {
  if (!ready) return;
  const next = {};
  for (const d of defs) {
    const id = $(`entity-${d.key}`).value;
    if (id) next[d.key] = id;
  }
  if (!Object.keys(next).length) {
    message('Selecciona al menos una lectura para mostrar.');
    return;
  }
  if (new Set(Object.values(next)).size !== Object.keys(next).length) {
    message('Cada lectura debe usar un sensor diferente. Revisa la selección.');
    return;
  }
  mapping = next;
  resetHistory();
  $('zone-title').textContent = $('zone-name').value.trim() || 'Estación principal';
  record();
  render();
  message('Recibiendo cambios de tus sensores en tiempo real.');
  log('Lecturas del prototipo asignadas al panel.');
  dialog.close();
};

$('disconnect-button').onclick = disconnect;

function demoSample() {
  const t = Date.now() / 4000,
        now = new Date().toISOString();
  let tempVal = demoAlert ? 48 + Math.sin(t) * 2 : 24.5 + Math.sin(t) * 1.5;
  let gasVal = Math.round((demoAlert ? 2400 : 700) + 90 * Math.sin(t * 0.8));
  let humVal = 52 + 6 * Math.sin(t * 0.7);
  let resVal = demoAlert ? 9 + 2 * Math.sin(t) : 24 + 3 * Math.sin(t);

  if (manualSim.active) {
    tempVal = Number(manualSim.temp) + Math.sin(t) * 0.3;
    gasVal = Math.round(Number(manualSim.gas) + 15 * Math.sin(t));
    humVal = Number(manualSim.hum);
  }

  const data = {
    temperature: [tempVal, '°C'],
    smoke: [demoAlert ? 'on' : 'off', ''],
    flame: [demoFlame ? 'on' : 'off', ''],
    gas: [gasVal, 'ADC'],
    humidity: [humVal, '%'],
    resistance: [resVal, 'kΩ'],
    pressure: [1011 + 2 * Math.sin(t * 0.3), 'hPa']
  };
  states = new Map();
  defs.forEach(d => {
    if (d.optional) return;
    const [v, u] = data[d.key];
    mapping[d.key] = `demo.${d.key}`;
    states.set(mapping[d.key], {state: String(v), attributes: {unit_of_measurement: u}, last_updated: now});
  });
  record();
  render();
}

function startDemoWithPreset(presetName) {
  client.disconnect();
  clearInterval(demoTimer);
  if (mode !== 'demo') {
    mode = 'demo';
    ready = false;
    mapping = {};
    resetHistory();
  }
  demoPreset = presetName;
  manualSim.active = false;
  if (presetName === 'normal') {
    demoAlert = false;
    demoFlame = false;
    manualSim = { temp: 24.5, gas: 700, hum: 52, active: false };
  } else if (presetName === 'smoke') {
    demoAlert = true;
    demoFlame = false;
    manualSim = { temp: 39.0, gas: 2350, hum: 44, active: true };
  } else if (presetName === 'flame') {
    demoAlert = false;
    demoFlame = true;
    manualSim = { temp: 54.0, gas: 1250, hum: 32, active: true };
  } else if (presetName === 'critical') {
    demoAlert = true;
    demoFlame = true;
    manualSim = { temp: 64.0, gas: 2980, hum: 24, active: true };
  }
  $('sim-temp-slider').value = String(manualSim.temp);
  $('sim-temp-out').textContent = `${manualSim.temp} °C`;
  $('sim-gas-slider').value = String(manualSim.gas);
  $('sim-gas-out').textContent = `${manualSim.gas} ADC`;
  $('sim-hum-slider').value = String(manualSim.hum);
  $('sim-hum-out').textContent = `${manualSim.hum} %`;

  $('demo-event').textContent = demoAlert ? 'Restablecer simulación' : 'Simular detección de humo';
  message('Simulación: las lecturas son ficticias y cambian cada dos segundos.');
  demoSample();
  clearInterval(demoTimer);
  demoTimer = setInterval(demoSample, 2000);
}

$('demo-button').onclick = () => {
  if (mode === 'demo') {
    disconnect();
    mapping = {};
    render();
    return;
  }
  client.disconnect();
  clearInterval(demoTimer);
  mode = 'demo';
  ready = false;
  mapping = {};
  resetHistory();
  demoAlert = false;
  demoFlame = false;
  manualSim.active = false;
  $('demo-event').textContent = 'Simular detección de humo';
  message('Simulación: las lecturas son ficticias y cambian cada dos segundos.');
  log('Inicio de simulación. No se utilizan sensores físicos.');
  demoSample();
  demoTimer = setInterval(demoSample, 2000);
};

$('demo-event').onclick = () => {
  demoAlert = !demoAlert;
  $('demo-event').textContent = demoAlert ? 'Restablecer simulación' : 'Simular detección de humo';
  demoSample();
  log(demoAlert ? 'Detección de humo simulada.' : 'Evento simulado restablecido.');
};

// Interactive Simulation Workbench Presets & Sliders
document.querySelectorAll('[data-sim-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-sim-preset]').forEach(b => b.classList.toggle('active', b === btn));
    startDemoWithPreset(btn.dataset.simPreset);
    log(`Escenario de laboratorio aplicado: ${btn.textContent.trim()}.`);
    window.showIgnisToast?.(`Escenario: ${btn.textContent.trim()}`, 'Datos simulados actualizados en el panel');
  });
});

['sim-temp-slider', 'sim-gas-slider', 'sim-hum-slider'].forEach(id => {
  $(id).addEventListener('input', () => {
    manualSim.temp = Number($('sim-temp-slider').value || 24.5);
    manualSim.gas = Number($('sim-gas-slider').value || 700);
    manualSim.hum = Number($('sim-hum-slider').value || 52);
    manualSim.active = true;
    $('sim-temp-out').textContent = `${manualSim.temp} °C`;
    $('sim-gas-out').textContent = `${manualSim.gas} ADC`;
    $('sim-hum-out').textContent = `${manualSim.hum} %`;
    if (mode !== 'demo') {
      mode = 'demo';
      ready = false;
      resetHistory();
      demoTimer = setInterval(demoSample, 2000);
    }
    demoSample();
  });
});

function updateKpiStrip(values, unit) {
  if (!values.length) {
    $('stat-min').textContent = '—';
    $('stat-avg').textContent = '—';
    $('stat-max').textContent = '—';
    $('stat-delta').textContent = '—';
    $('stat-samples').textContent = '0';
    return;
  }
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const avgV = values.reduce((a, b) => a + b, 0) / values.length;
  const delta = values.length > 1 ? values.at(-1) - values.at(-2) : 0;
  const u = unit ? ` ${unit}` : '';
  $('stat-min').textContent = `${minV.toFixed(1)}${u}`;
  $('stat-avg').textContent = `${avgV.toFixed(1)}${u}`;
  $('stat-max').textContent = `${maxV.toFixed(1)}${u}`;
  $('stat-delta').textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}${u}`;
  $('stat-samples').textContent = String(values.length);
}

function draw() {
  const c = $('live-chart'),
        ctx = c.getContext('2d');
  if (!ctx) return;
  const isDark = document.documentElement?.getAttribute?.('data-theme') === 'dark';
  const gridColor = isDark ? '#24383a' : '#e4e8dc';
  const textColor = isDark ? '#99a8a1' : '#788574';
  const strokeColor = isDark ? '#f49d65' : '#c56b38';
  const chartStyle = $('chart-style').value || 'area';
  const w = c.clientWidth || 600,
        h = 215,
        ratio = window.devicePixelRatio || 1;
  c.width = w * ratio;
  c.height = h * ratio;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, w, h);
  ctx.font = '10px monospace';

  const key = $('live-variable').value,
        points = history.filter(r => r.values[key]).slice(-60);
  const left = 48,
        right = w - 14,
        top = 20,
        bottom = h - 26;

  ctx.fillStyle = textColor;
  if (!points.length) {
    updateKpiStrip([], '');
    ctx.textAlign = 'center';
    ctx.fillText('Esperando lecturas de esta señal', w / 2, h / 2);
    $('chart-caption').textContent = 'El historial comenzará al recibir datos de esta señal.';
    return;
  }

  const units = new Set(points.map(p => p.values[key].unit));
  if (units.size > 1) {
    $('chart-caption').textContent = 'Cambió la unidad de esta señal. Inicia una nueva sesión para comparar los valores.';
    return;
  }

  const values = points.map(p => p.values[key].value),
        unit = points.at(-1).values[key].unit;
  updateKpiStrip(values, unit);

  let min = Math.min(...values),
      max = Math.max(...values),
      pad = Math.max((max - min) * 0.2, 0.5);
  min -= pad;
  max+= pad;

  for (let i = 0; i < 4; i++) {
    const yPos = top + (bottom - top) * i / 3;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, yPos);
    ctx.lineTo(right, yPos);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillStyle = textColor;
    ctx.fillText((max - (max - min) * i / 3).toFixed(1), left - 8, yPos + 3);
  }

  const start = Date.parse(points[0].time),
        end = Date.parse(points.at(-1).time);
  const x = i => left + (right - left) * (end === start ? 0.5 : (Date.parse(points[i].time) - start) / (end - start));
  const y = v => bottom - (v - min) / (max - min) * (bottom - top);

  if (chartStyle === 'bars') {
    const barW = Math.max(4, Math.min(18, (right - left) / (values.length * 1.6)));
    values.forEach((v, i) => {
      const bx = x(i) - barW / 2;
      const by = y(v);
      ctx.fillStyle = isDark ? 'rgba(244, 157, 101, 0.75)' : 'rgba(197, 107, 56, 0.78)';
      ctx.fillRect(bx, by, barW, bottom - by);
    });
  } else {
    ctx.beginPath();
    values.forEach((v, i) => {
      if (i === 0) ctx.moveTo(x(i), y(v));
      else if (chartStyle === 'step') {
        ctx.lineTo(x(i), y(values[i - 1]));
        ctx.lineTo(x(i), y(v));
      } else {
        ctx.lineTo(x(i), y(v));
      }
    });
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.lineTo(x(values.length - 1), bottom);
    ctx.lineTo(x(0), bottom);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, isDark ? 'rgba(244, 157, 101, 0.28)' : 'rgba(213, 128, 74, 0.24)');
    g.addColorStop(1, 'rgba(213, 128, 74, 0.01)');
    ctx.fillStyle = g;
    ctx.fill();
  }

  // Latest point pulse
  const lastX = x(values.length - 1),
        lastY = y(values.at(-1));
  ctx.fillStyle = isDark ? 'rgba(244, 157, 101, 0.25)' : 'rgba(197, 107, 56, 0.22)';
  ctx.beginPath();
  ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Interactive hover crosshair
  if (hoverX !== null && points.length > 0) {
    let closestIdx = 0, minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(x(i) - hoverX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }
    const cx = x(closestIdx), cy = y(values[closestIdx]);
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(24,39,40,0.22)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx, bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    const label = `${values[closestIdx].toFixed(1)} ${unit} · ${new Date(points[closestIdx].time).toLocaleTimeString('es-MX')}`;
    const boxW = Math.max(115, label.length * 6.2);
    const boxX = Math.min(Math.max(left, cx - boxW / 2), right - boxW);
    ctx.fillStyle = isDark ? '#192a2c' : '#182728';
    ctx.fillRect(boxX, top - 16, boxW, 18);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(label, boxX + boxW / 2, top - 4);
  }

  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.fillText(new Date(points[0].time).toLocaleTimeString('es-MX'), left, h - 7);
  ctx.textAlign = 'right';
  ctx.fillText(new Date(points.at(-1).time).toLocaleTimeString('es-MX'), right, h - 7);

  $('chart-caption').textContent = `${!active() ? 'Historial de sesión finalizada · ' : mode === 'demo' ? 'Simulación · ' : 'Datos recibidos · '}${points.length} muestras visibles · ${unit || 'sin unidad'}`;
}

$('live-variable').onchange = draw;
$('chart-style').onchange = draw;
window.addEventListener('resize', draw);

const chartCanvas = $('live-chart');
chartCanvas.addEventListener('mousemove', e => {
  if (!chartCanvas.getBoundingClientRect) return;
  const r = chartCanvas.getBoundingClientRect();
  hoverX = e.clientX - r.left;
  draw();
});
chartCanvas.addEventListener('mouseleave', () => {
  hoverX = null;
  draw();
});

function csvCell(value) {
  let s = String(value ?? '');
  if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}

$('download-readings').onclick = () => {
  if (!history.length) return;
  const cols = ['fecha_iso', 'fuente', ...defs.flatMap(d => [d.key, `${d.key}_unidad`, `${d.key}_sensor`])];
  const csv = '\uFEFF' + [
    cols,
    ...history.map(row => [
      row.time,
      row.mode === 'demo' ? 'simulado' : 'home_assistant',
      ...defs.flatMap(d => {
        const v = row.values[d.key];
        return [v?.value ?? '', v?.unit ?? '', v?.entity ?? ''];
      })
    ])
  ].map(row => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = `IGNIS_${history[0].mode}_${Date.now()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  log(`CSV descargado · ${history.length} muestras de la sesión.`);
  window.showIgnisToast?.('Historial CSV descargado', `${history.length} muestras exportadas`);
};

$('export-json').onclick = () => {
  if (!history.length) return;
  const payload = {
    proyecto: 'IGNIS TC2',
    estacion: $('zone-title').textContent,
    exportado_en: new Date().toISOString(),
    muestras_totales: history.length,
    historial: history
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = `IGNIS_${history[0].mode}_${Date.now()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  log(`JSON descargado · ${history.length} muestras de la sesión.`);
  window.showIgnisToast?.('Reporte JSON descargado', `${history.length} muestras exportadas`);
};

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('appeared');
        observer.unobserve(e.target);
      }
    });
  }, {threshold: 0.06});
  document.querySelectorAll('.purpose-section, .catalog-section .section-top, .comparison-section .section-top, .guide, .applications, .glossary-section, .faq-section, .about, .pinout-section, .actuators-lab-section, .esphome-section, .quiz-section').forEach(el => {
    el.classList.add('will-appear');
    observer.observe(el);
  });
}

window.addEventListener('pagehide', () => {
  client.disconnect();
  clearInterval(demoTimer);
});

render();
})();
