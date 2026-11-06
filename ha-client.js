/* Home Assistant WebSocket client. No credentials are stored. */
'use strict';
(function(root){
class IgnisHA {
  constructor({onStates=()=>{},onState=()=>{},onReady=()=>{},onError=()=>{}}={}){Object.assign(this,{onStates,onState,onReady,onError});this.socket=null;this.timeout=null;this.heartbeat=null;this.pongTimer=null;this.sequence=3;this.ready=false;}
  disconnect(){const old=this.socket;this.socket=null;this.ready=false;clearTimeout(this.timeout);clearTimeout(this.pongTimer);clearInterval(this.heartbeat);if(old){old.onclose=null;old.onerror=null;old.onmessage=null;old.close();}}
  connect(address,accessToken){
    this.disconnect();let token=accessToken;let url;
    try{url=new URL(address);if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash||!['','/'].includes(url.pathname))throw Error();url.protocol=url.protocol==='https:'?'wss:':'ws:';url.pathname='/api/websocket';}catch{this.onError('Revisa la dirección. Usa http://IP:8123 o tu dirección HTTPS, sin rutas ni contraseñas.');return;}
    if(!token.trim()){this.onError('Falta la clave de acceso de Home Assistant.');return;}
    if(root.location?.protocol==='https:'&&url.protocol==='ws:'){token='';this.onError('Esta página HTTPS requiere una conexión HTTPS a Home Assistant. Para una dirección HTTP local, abre IGNIS desde un servidor HTTP local.');return;}
    let socket;try{socket=new root.WebSocket(url.href);this.socket=socket;}catch{token='';this.onError('No se pudo abrir la conexión. Revisa la dirección y los permisos de red.');return;}
    const current=()=>this.socket===socket;
    const fail=message=>{if(!current())return;token='';this.disconnect();this.onError(message);};
    this.timeout=setTimeout(()=>fail('Home Assistant no respondió a tiempo. Revisa la red, la dirección y el acceso desde tu navegador.'),12000);
    socket.onerror=()=>fail('No se pudo conectar con Home Assistant. Revisa la red y que su dirección esté accesible.');
    socket.onclose=()=>fail('Se perdió la conexión. Las lecturas se han retirado del panel; vuelve a conectar.');
    socket.onmessage=event=>{if(!current())return;let m;try{m=JSON.parse(event.data);}catch{fail('El servidor devolvió una respuesta que no se pudo interpretar.');return;}
      if(m.type==='auth_required'){socket.send(JSON.stringify({type:'auth',access_token:token}));token='';}
      else if(m.type==='auth_invalid'){fail('Home Assistant rechazó la clave de acceso. Revisa el token e inténtalo otra vez.');}
      else if(m.type==='auth_ok'){socket.send(JSON.stringify({id:1,type:'subscribe_events',event_type:'state_changed'}));}
      else if(m.type==='result'&&m.success===false){fail('Home Assistant no permitió consultar las lecturas. Revisa los permisos de la cuenta utilizada.');}
      else if(m.type==='result'&&m.id===1){socket.send(JSON.stringify({id:2,type:'get_states'}));}
      else if(m.type==='result'&&m.id===2){if(!Array.isArray(m.result)){fail('La lista de sensores recibida no es válida.');return;}clearTimeout(this.timeout);this.ready=true;this.onStates(m.result);this.onReady();this.heartbeat=setInterval(()=>{if(!current())return;socket.send(JSON.stringify({id:++this.sequence,type:'ping'}));clearTimeout(this.pongTimer);this.pongTimer=setTimeout(()=>fail('La conexión dejó de responder. Vuelve a conectar para recuperar las lecturas.'),10000);},25000);}
      else if(m.type==='pong'){clearTimeout(this.pongTimer);}
      else if(m.type==='event'&&m.id===1&&m.event?.data?.entity_id){const d=m.event.data;this.onState(d.entity_id,d.new_state);}
    };
  }
}
root.IgnisHA=IgnisHA;
})(globalThis);
