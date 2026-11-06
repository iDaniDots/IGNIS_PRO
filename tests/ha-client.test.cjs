const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../ha-client.js'),'utf8');
function setup(protocol='http:'){
 const sockets=[],timeouts=new Map(),intervals=new Map();let seq=0;
 class Socket {constructor(url){this.url=url;this.sent=[];this.closed=false;sockets.push(this);}send(data){this.sent.push(JSON.parse(data));}close(){this.closed=true;}receive(data){this.onmessage?.({data:JSON.stringify(data)});}}
 const context={URL,WebSocket:Socket,location:{protocol},setTimeout(fn){const id=++seq;timeouts.set(id,fn);return id;},clearTimeout(id){timeouts.delete(id);},setInterval(fn){const id=++seq;intervals.set(id,fn);return id;},clearInterval(id){intervals.delete(id);}};
 vm.runInNewContext(source,context);const events=[];
 const client=new context.IgnisHA({onStates:s=>events.push(['states',s]),onState:(id,s)=>events.push(['state',id,s]),onReady:()=>events.push(['ready']),onError:m=>events.push(['error',m])});
 return {client,sockets,events,timeouts,intervals};
}
function authenticate(x){x.client.connect('http://ha.test:8123','fake-test-token');const s=x.sockets.at(-1);s.receive({type:'auth_required'});s.receive({type:'auth_ok'});s.receive({type:'result',id:1,success:true});s.receive({type:'result',id:2,success:true,result:[{entity_id:'sensor.temp',state:'24'}]});return s;}
test('authenticates, subscribes before snapshot and streams updates',()=>{const x=setup(),s=authenticate(x);assert.equal(s.url,'ws://ha.test:8123/api/websocket');assert.equal(s.sent[0].access_token,'fake-test-token');assert.equal(s.sent[1].type,'subscribe_events');assert.equal(s.sent[2].type,'get_states');assert.equal(x.client.ready,true);s.receive({type:'event',id:1,event:{data:{entity_id:'sensor.temp',new_state:{state:'29'}}}});assert.equal(x.events.at(-1)[0],'state');assert.equal(x.events.at(-1)[2].state,'29');x.client.disconnect();assert.equal(x.intervals.size,0);assert.equal(x.timeouts.size,0);});
test('invalid authentication clears connection',()=>{const x=setup();x.client.connect('http://ha.test:8123','bad');x.sockets[0].receive({type:'auth_invalid'});assert.equal(x.client.ready,false);assert.equal(x.sockets[0].closed,true);assert.match(x.events[0][1],/rechazó/);});
test('loss of connection invalidates live state and clears timers',()=>{const x=setup(),s=authenticate(x);s.onclose();assert.equal(x.client.ready,false);assert.equal(x.client.socket,null);assert.equal(x.intervals.size,0);assert.equal(x.events.at(-1)[0],'error');});
test('subscription permission failure does not present live data',()=>{const x=setup();x.client.connect('http://ha.test:8123','fake');x.sockets[0].receive({id:1,type:'result',success:false,error:{code:'unauthorized'}});assert.equal(x.client.ready,false);assert.equal(x.events.at(-1)[0],'error');});
test('HTTP connection from HTTPS is explained before transmitting token',()=>{const x=setup('https:');x.client.connect('http://ha.test:8123','fake');assert.equal(x.sockets.length,0);assert.match(x.events[0][1],/HTTPS/);});
test('rejects non-HTTP address and credentials embedded in URL',()=>{for(const address of ['ftp://ha.test','http://user:pass@ha.test','http://ha.test/path']){const x=setup();x.client.connect(address,'fake');assert.equal(x.sockets.length,0);assert.equal(x.events[0][0],'error');}});
test('connect timeout and missing heartbeat response invalidate connection',()=>{const x=setup();x.client.connect('http://ha.test:8123','fake');[...x.timeouts.values()][0]();assert.equal(x.client.ready,false);assert.equal(x.events[0][0],'error');const y=setup(),s=authenticate(y);[...y.intervals.values()][0]();assert.equal(s.sent.at(-1).type,'ping');[...y.timeouts.values()][0]();assert.equal(y.client.ready,false);assert.match(y.events.at(-1)[1],/dejó de responder/);});
