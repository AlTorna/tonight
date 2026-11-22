var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxuc59ihD4VgBpJG8PKkE6s4MHIqHr4m7z7GewExYZQteip5VJphK-uFdTB6ZpXm7W3/exec';
var SECRET = 'slsososieosl8l3soj';
var TARGET = 5;
var $ = function(id){ return document.getElementById(id); };

function iso(d){ var m=('0'+(d.getMonth()+1)).slice(-2), day=('0'+d.getDate()).slice(-2); return d.getFullYear()+'-'+m+'-'+day; }
function shiftDate(){ var d=new Date(); if (d.getHours() < 5) d.setDate(d.getDate()-1); return iso(d); }
var SD = shiftDate();
var QK='q:'+SD, CK='c:'+SD;
function load(k,fb){ try{ var v=localStorage.getItem(k); return v===null?fb:JSON.parse(v); }catch(e){ return fb; } }
function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

var queue = load(QK,[]), sent = load(CK,0);

function toast(msg, bad){
  var t = $('toast'); t.textContent = msg; t.className = 'toast show' + (bad?' bad':'');
  clearTimeout(toast._t); toast._t = setTimeout(function(){ t.className = 'toast'; }, 2200);
}

function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); 
}

function render(){
  $('sd').textContent = SD;
  $('n').textContent = sent;
  var d = $('dots'); d.innerHTML='';
  for (var i=0;i<TARGET;i++){ var s=document.createElement('div'); s.className = i<sent?'dot on':'dot'; d.appendChild(s); }
}

function post(row){
  return fetch(ENDPOINT, {
    method:'POST', mode:'no-cors',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({ secret:SECRET, action:'append', date:SD, row:row })
  });
}

function flush(){
  if (!queue.length) return;
  post(queue[0]).then(function(){
    queue.shift(); sent++; save(QK,queue); save(CK,sent); render();
    toast('sent · ' + sent + '/' + TARGET);
    if (navigator.vibrate) navigator.vibrate(18);
    flush();
  }).catch(function(){ toast('queued — no signal', true); });
}

function collect(){
  var v = function(id){ return $(id).value.trim(); };
  return [ v('fn'), v('ln'), v('em'), v('ph'), v('co'), v('wb'), v('li'), v('lo'), SD, v('ch'), v('st'), v('fu') ];
}
function clear(){ ['co','fn','ln','em','ph','wb','li','lo','fu'].forEach(function(i){ $(i).value=''; }); }

$('go').onclick = function(){
  var row = collect();
  if (!row[4] && !row[0]) { toast('company or name required', true); 
  if (!validEmail(row[2])) { toast('valid email required', true); $('em').focus(); 
  if (navigator.vibrate) navigator.vibrate([12,60,12]); return; } ;
  if (navigator.vibrate) navigator.vibrate([12,60,12]); return; 
  }
  
  queue.push(row); save(QK, queue);
  clear(); toast('queued'); if (navigator.vibrate) navigator.vibrate(10);
  flush();
};

fetch(ENDPOINT + '?secret=' + SECRET).then(function(r){ return r.json(); })
  .then(function(j){ $('ep').textContent = j.ok ? 'endpoint ok' : 'endpoint says no'; })
  .catch(function(){ $('ep').textContent = 'endpoint unreachable'; });

var deferred;
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; $('inst').style.display='block'; });
$('inst').onclick = function(){ if (!deferred) return; deferred.prompt(); deferred = null; $('inst').style.display='none'; };

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function(){ navigator.serviceWorker.register('./sw.js'); });
}

render(); flush();
