# IGNIS · Sistema de detección de incendios

La página muestra las lecturas directamente en su centro de monitoreo. Home Assistant funciona como fuente de datos: no se abre otro panel ni se incrusta su interfaz.

## 1. Abrir la página

Extrae el ZIP completo. Para explorar el diseño y el catálogo puedes abrir `index.html` por doble clic.

Para conectar Home Assistant local, recomendamos abrir una terminal en esta carpeta y ejecutar:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

En Windows puedes usar `py` en lugar de `python`. Abre **http://localhost:8000**. También puedes utilizar Live Server en Visual Studio Code.

La página no requiere instalar paquetes de JavaScript; Bootstrap y todos los archivos visuales están incluidos.

## 2. Preparar las lecturas en Home Assistant

1. Comprueba que tu ESP32 ya aparece en Home Assistant mediante ESPHome o MQTT.
2. Verifica allí que los sensores entregan valores reales.
3. Asegúrate de que la computadora puede abrir Home Assistant desde la misma red.
4. En tu perfil de Home Assistant, busca la sección Seguridad y crea un **token de acceso de larga duración**. Utiliza una cuenta con acceso a los sensores y permiso para recibir sus cambios.

La configuración y carga de ESPHome dependen del cableado de tus placas. Esta actualización conserva tus equipos y no cambia su programación. El sensor debe estar funcionando antes de mostrarlo aquí.

## 3. Mostrar las lecturas en IGNIS

1. Pulsa **Conectar dispositivo** o **Configurar**.
2. Introduce la dirección de Home Assistant, por ejemplo `http://192.168.1.50:8123`, y pega tu token.
3. Pulsa **Conectar y buscar sensores**.
4. Elige las señales que correspondan a tu prototipo. Puedes usar sensores de distintas ESP32 dentro del mismo panel.
5. Escribe un nombre para el panel y pulsa **Mostrar lecturas en el panel**.

Los selectores muestran tanto el nombre de cada sensor como su identificador, para distinguir dispositivos con nombres parecidos. No se asignan automáticamente sensores ajenos a tu prototipo.

| Lectura en IGNIS | Señal que debes elegir |
| --- | --- |
| Temperatura | Un sensor numérico de temperatura |
| Detección de humo | Una señal `binary_sensor` que indique detección activa mediante `on` |
| Detección de flama | Una señal `binary_sensor` que indique detección activa mediante `on` |
| Señal del MQ-2 | Una lectura numérica del sensor, con su unidad original |
| Humedad | Un sensor numérico de humedad |
| Resistencia de gas | La resistencia medida por el BME680, conservando su unidad original |
| Presión atmosférica (opcional) | Un sensor numérico de presión |

Las tarjetas conservan las unidades proporcionadas por Home Assistant. La web no convierte una lectura ADC en ppm ni una resistencia en un índice de calidad del aire. Tampoco aplica umbrales de incendio a la temperatura: refleja las señales de detección configuradas en el prototipo.

Para humo y flama, la entidad debe presentar `on` al detectar y `off` cuando no detecta. Revisa la inversión de lógica de los módulos en ESPHome si tu cableado la necesita. No asignes dos veces la misma entidad a variables diferentes.

## 4. Qué significa el estado del panel

- **Sin conexión:** no hay valores actuales. Las tarjetas muestran guiones.
- **Faltan señales de detección:** hay conexión, pero humo o flama no están asignados o no entregan un estado válido.
- **Sin señales de detección activas:** las señales configuradas de humo y flama están disponibles y ambas están inactivas. Esto no equivale a certificar que un lugar sea seguro.
- **Señal de detección activa:** humo o flama están activos según Home Assistant.
- **Simulación:** los datos son ficticios y las tarjetas lo indican. Una detección simulada solo modifica la interfaz.

Si se pierde la conexión o Home Assistant informa `unavailable` / `unknown`, los datos dejan de mostrarse como lecturas actuales. Una lectura binaria puede permanecer estable durante mucho tiempo; la interfaz utiliza el estado informado por Home Assistant y muestra la hora de actualización del sensor. El historial permanece disponible, identificado como una sesión finalizada.

## 5. Gráfica y descarga

La gráfica muestra hasta 60 muestras recibidas durante la sesión para la variable elegida. El CSV conserva hasta 1500 muestras, incluyendo fecha, origen, valor, unidad e identificador del sensor. Se registra una muestra al asignar los sensores y después de cada cambio de una señal asignada; no es un muestreo con intervalo fijo.

El historial empieza al conectar y asignar sensores: no recupera el historial previo de Home Assistant. Al comenzar otra conexión, aplicar otra selección o iniciar una simulación comienza un historial nuevo. Descarga primero lo que quieras conservar. Recargar la página borra la sesión.

## 6. Acceso y red

El token se usa solo durante la sesión y se retira del campo al conectar. No se almacena en localStorage, no se incluye en el ZIP y no aparece en el CSV. Debes volver a introducirlo si recargas o reconectas. No publiques tu token en GitHub ni dentro del código.

Si usas una dirección HTTP local, abre IGNIS por HTTP local. Una página HTTPS —incluido GitHub Pages— no puede conectarse a un servidor WebSocket local sin cifrar en navegadores que bloquean contenido mixto. Para alojar el panel por HTTPS necesitas acceso HTTPS válido a Home Assistant. No desactives la protección del navegador para resolverlo.

Comprueba el acceso a la red local y sus permisos. Algunas redes escolares aíslan los dispositivos. No necesitas modificar CORS para esta conexión WebSocket ni instalar extensiones. Si tu instalación tiene un proxy o reglas de origen, deben permitir el acceso desde el origen donde abras IGNIS.

## 7. Alcance de esta actualización

- Nueva identidad IGNIS y diseño con portada, animaciones discretas y panel integrado.
- Eliminada la sección “Demostración en clase”, las indicaciones para el profesor y el bloque independiente de integración.
- Catálogo, fichas, comparador, ejemplos y glosario conservados.
- Cliente WebSocket real: autenticación, consulta inicial, recepción de cambios y comprobación de conexión.
- Consulta de datos: esta página no modifica automatizaciones ni activa actuadores físicos.

Se verificaron la interfaz en navegador y 11 pruebas automatizadas con datos de prueba para la conexión, cambios de sensores, señales no disponibles y pérdida de comunicación. No se ha conectado esta entrega a tu Home Assistant ni a tus placas físicas: falta introducir tu dirección y token y seleccionar sus sensores.

El proyecto es un prototipo académico y no sustituye un sistema de protección contra incendios certificado.

## Archivos

- `index.html`: estructura de la página y ventana de conexión.
- `ignis.css`: nueva identidad visual y diseño adaptable.
- `styles.css`: estilos del catálogo y las secciones conservadas.
- `ha-client.js`: conexión a Home Assistant por `/api/websocket`.
- `monitoreo.js`: tarjetas, estados, gráfica, simulación y CSV.
- `app.js` / `explore.js`: catálogo, fichas, comparador y contenido educativo.
- `tests/`: pruebas ejecutables con Node.js, sin dependencias adicionales.

Para ejecutar las pruebas desde la carpeta del proyecto:

```bash
node --test tests/*.test.cjs
```

Documentación oficial de la API: https://contributors.home-assistant.io/core/internals/websocket-api/
