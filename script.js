"use strict";
var DONORS=[
{id:"d1",name:"Afternoon bites",loc:"Student Union, side door B",win:"Today, 4:30 to 6:00 pm",delivery:true,items:[{id:"i1",name:"Vegetable wraps",left:12,diet:["Vegetarian"]},{id:"i2",name:"Fruit cups",left:20,diet:["Vegan","Halal"]},{id:"i3",name:"Chicken sandwiches",left:6,diet:["Halal"]}]},
{id:"d2",name:"Fresh bakes",loc:"Library north entrance",win:"Today, 5:30 to 7:00 pm",delivery:false,items:[{id:"i4",name:"Bread loaves",left:9,diet:["Vegan"]},{id:"i5",name:"Cheese rolls",left:3,diet:["Vegetarian"]}]},
{id:"d3",name:"Evening hot meals",loc:"Hall A front lobby",win:"Today, 8:00 to 9:00 pm",delivery:true,items:[{id:"i6",name:"Lentil curry and rice",left:14,diet:["Vegan","Halal"]},{id:"i7",name:"Chicken stew and rice",left:8,diet:["Halal"]}]},
{id:"d4",name:"Tomorrow’s lunch",loc:"Student Union, side door B",win:"Tomorrow, 12:30 to 1:30 pm",delivery:false,items:[{id:"i8",name:"Pizza slices",left:18,diet:["Vegetarian"]},{id:"i9",name:"Bottled water",left:30,diet:["Vegan"]}]}];
var DROPS=["Hall A front lobby","Library north entrance","Sports centre gate","Residence B mailroom"];
var KEY="campusTable.v1",MAXQ=2,MAXACTIVE=3;
var S={alias:null,stock:{},orders:[],listings:[],extra:[],n:100},sel={},filter="All";
try{var raw=localStorage.getItem(KEY);if(raw)S=JSON.parse(raw)}catch(e){}
S.stock=S.stock||{};S.orders=S.orders||[];S.listings=S.listings||[];S.extra=S.extra||[];S.n=S.n||100;
if(!S.listings.length&&!S.orders.length&&!S.extra.length)S.listings.push({id:1,bid:1,food:"Bread rolls",qty:24,by:"17:30",st:"new"});
S.extra.forEach(function(x){var d=donor(x.did);if(d)d.items.push({id:x.id,name:esc(x.name),left:x.qty,diet:x.diet?[x.diet]:[],alg:x.alg})});
DONORS.forEach(function(d){d.items.forEach(function(i){if(S.stock[i.id]==null)S.stock[i.id]=i.left})});
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function $(id){return document.getElementById(id)}
function donor(id){return DONORS.filter(function(d){return d.id===id})[0]}
function item(id){var r;DONORS.forEach(function(d){d.items.forEach(function(i){if(i.id===id)r=i})});return r}
function code(){var c="ABCDEFGHJKMNPQRSTUVWXYZ23456789",s="CT-";for(var i=0;i<4;i++)s+=c[Math.floor(Math.random()*c.length)];return s}
function toast(t){var n=document.createElement("div");n.className="toast";n.setAttribute("role","status");n.textContent=t;document.body.appendChild(n);setTimeout(function(){n.remove()},3500)}
function chip(){$("idchip").textContent=S.alias?"Anonymous ID: "+S.alias:"No sign-up needed. You are browsing anonymously."}
function active(){return S.orders.filter(function(o){return o.status==="Reserved"||o.status==="Ready"}).length}
function picked(did){var d=donor(did),r=[];d.items.forEach(function(i){if(sel[i.id])r.push({id:i.id,name:i.name,qty:sel[i.id]})});return r}

function renderBrowse(){
var f=["All","Delivery available","Vegetarian","Halal","Vegan"];
var h='<div class="chips" role="group" aria-label="Filter food">'+f.map(function(x){return '<button class="chip" data-f="'+x+'" aria-pressed="'+(x===filter)+'">'+x+'</button>'}).join("")+'</div>';
var n=0;
DONORS.forEach(function(d){
if(filter==="Delivery available"&&!d.delivery)return;
var its=d.items.filter(function(i){return filter==="All"||filter==="Delivery available"||i.diet.indexOf(filter)>-1});
if(!its.length)return;n++;
h+='<article class="card" data-d="'+d.id+'"><h3>'+d.name+'</h3><dl class="meta"><dt>Pickup</dt><dd>'+d.loc+'</dd><dt>When</dt><dd>'+d.win+'</dd><dt>Delivery</dt><dd>'+(d.delivery?"Available to a drop point":"Pickup only")+'</dd></dl>';
its.forEach(function(i){
var left=S.stock[i.id],q=sel[i.id]||0,cls=left===0?"gone":left<=3?"low":"";
h+='<div class="item"><div><span class="nm">'+i.name+'</span>'+i.diet.map(function(t){return '<span class="tag">'+t+'</span>'}).join("")+(i.alg?'<span class="tag">'+i.alg+'</span>':'')+'</div>'
+'<div class="count '+cls+'" aria-live="polite">'+(left===0?'<b>Gone</b>':'<b>'+left+'</b>left')+'</div>'
+'<div class="step"><button data-m="'+i.id+'" aria-label="One less '+i.name+'"'+(q<1?" disabled":"")+'>\u2212</button><output id="q-'+i.id+'">'+q+'</output><button data-p="'+i.id+'" aria-label="One more '+i.name+'"'+(q>=Math.min(MAXQ,left)?" disabled":"")+'>+</button></div></div>'});
h+='<div class="foot"><button class="btn" data-r="'+d.id+'" disabled>Reserve</button></div></article>'});
if(!n)h+='<p class="empty">Nothing matches that filter right now. Try “All”.</p>';
$("browse").innerHTML=h;DONORS.forEach(function(d){btn(d.id)})}
function btn(did){var b=document.querySelector('[data-r="'+did+'"]');if(!b)return;var t=0;picked(did).forEach(function(x){t+=x.qty});b.disabled=t===0;b.textContent=t?"Reserve "+t+(t>1?" items":" item"):"Reserve"}

function renderOrders(){
if(!S.orders.length){$("orders").innerHTML='<p class="empty">Nothing reserved yet. Pick what you need from the available food.</p>';return}
$("orders").innerHTML=S.orders.slice().reverse().map(function(o){var d=donor(o.did);
return '<article class="card order"><p class="code">'+o.code+'</p><span class="badge">'+o.status+'</span><dl class="meta" style="margin-top:.7rem"><dt>Food</dt><dd>'+o.items.map(function(i){return i.qty+" \u00d7 "+i.name}).join(", ")+'</dd><dt>Menu</dt><dd>'+d.name+'</dd><dt>'+(o.mode==="delivery"?"Drop point":"Collect at")+'</dt><dd>'+(o.mode==="delivery"?o.drop:d.loc)+'</dd><dt>When</dt><dd>'+d.win+'</dd></dl><p class="note">Show this code. No name or ID is needed.</p>'
+((o.status==="Reserved"||o.status==="Ready")?'<div class="row"><button class="btn" data-c="'+o.code+'">Mark collected</button>'+(o.status==="Reserved"?'<button class="btn danger" data-x="'+o.code+'">Cancel reservation</button>':'')+'</div>':'')+'</article>'}).join("")}

var BIZ=[{id:1,name:"Corner Bakery",kind:"Bakery",km:1.2,a:40},{id:2,name:"Greenfield Grocer",kind:"Grocery",km:2.4,a:130},{id:3,name:"Sunrise Caf\u00e9",kind:"Caf\u00e9",km:3.1,a:210},{id:4,name:"Mama\u2019s Kitchen",kind:"Restaurant",km:4.6,a:300},{id:5,name:"Central Hotel Buffet",kind:"Hotel",km:6.8,a:80},{id:6,name:"Farmers\u2019 Co-op Store",kind:"Market",km:8.9,a:170}];
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function bn(id){var b=BIZ.filter(function(x){return x.id==id})[0];return b?b.name:"Unknown"}
function nid(){return ++S.n}
function lst(id,st){S.listings.forEach(function(l){if(l.id===id)l.st=st});save();renderTeam()}
function addMenu(id){var l=S.listings.filter(function(x){return x.id===id})[0];if(!l)return;
var did=$("psec").value,x={did:did,id:"n"+nid(),name:l.food,qty:l.qty,diet:$("pdiet").value,alg:$("palg").value};
S.extra.push(x);donor(did).items.push({id:x.id,name:esc(x.name),left:x.qty,diet:x.diet?[x.diet]:[],alg:x.alg});S.stock[x.id]=x.qty;l.st="prepped";save();renderTeam();renderBrowse();toast("Added to the menu under \u201c"+donor(did).name+"\u201d.")}
function lrow(l,btn){return '<div class="row2"><div><strong>'+esc(l.food)+'</strong> \u00d7 '+l.qty+'<br><small>'+bn(l.bid)+', by '+l.by+'</small></div>'+btn+'</div>'}
function renderTeam(){
var r=+$("radius").value,list=BIZ.filter(function(b){return b.km<=r}).sort(function(a,b){return a.km-b.km});
$("rv").textContent=r;
$("bizList").innerHTML=list.length?list.map(function(b){return '<div class="row2"><div><strong>'+b.name+'</strong><br><small>'+b.kind+'</small></div><span class="pill">'+b.km.toFixed(1)+' km</span></div>'}).join(""):'<p class="empty">No businesses in this radius. Widen the search.</p>';
var sb=$("lbiz"),cb=sb.value;sb.innerHTML=list.map(function(b){return '<option value="'+b.id+'">'+b.name+' ('+b.km.toFixed(1)+' km)</option>'}).join("");if(cb)sb.value=cb;
var ps=$("psec"),pc=ps.value;ps.innerHTML=DONORS.map(function(d){return '<option value="'+d.id+'">'+d.name+'</option>'}).join("");if(pc)ps.value=pc;
var g='<circle r="100" fill="none" stroke="var(--line)"/><circle r="'+(r*10)+'" fill="var(--act)" fill-opacity=".12" stroke="var(--act)" stroke-dasharray="3 3"/><circle r="6" fill="var(--num)"/><text y="20" text-anchor="middle" font-size="9" fill="var(--muted)">Hub</text>';
BIZ.forEach(function(b){var on=b.km<=r,rad=b.km*10,x=rad*Math.cos(b.a*Math.PI/180),y=rad*Math.sin(b.a*Math.PI/180);g+='<circle cx="'+x+'" cy="'+y+'" r="5" fill="'+(on?"var(--act)":"var(--muted)")+'" opacity="'+(on?1:.4)+'"/>'});
$("radar").innerHTML=g;
var L=S.listings,names={"new":"Alert sent",claimed:"Claimed",collected:"Collected",prepped:"On menu"};
$("alerts").innerHTML=L.length?L.slice().reverse().map(function(l){return lrow(l,'<span class="pill'+(l.st==="new"?" go":"")+'">'+names[l.st]+'</span>')}).join(""):'<p class="empty">No leftovers reported yet. Use the form to send the first alert.</p>';
var cq=L.filter(function(l){return l.st==="new"||l.st==="claimed"});
$("collQ").innerHTML=cq.length?cq.map(function(l){return lrow(l,l.st==="new"?'<button class="btn sm" data-claim="'+l.id+'">Claim</button>':'<button class="btn sm" data-got="'+l.id+'">Mark collected</button>')}).join(""):'<p class="empty">Nothing to collect. New alerts appear here.</p>';
var pq=L.filter(function(l){return l.st==="collected"});
$("prepQ").innerHTML=pq.length?pq.map(function(l){return lrow(l,'<button class="btn sm" data-prep="'+l.id+'">Add to menu</button>')}).join(""):'<p class="empty">No collected food yet.</p>';
var dk=S.orders.filter(function(o){return o.status==="Reserved"||o.status==="Ready"});
$("desk").innerHTML=dk.length?dk.slice().reverse().map(function(o){var d=donor(o.did);return '<div class="row2"><div><strong>'+o.code+'</strong><br><small>'+o.items.map(function(i){return i.qty+" \u00d7 "+i.name}).join(", ")+'<br>'+(o.mode==="delivery"?"Deliver to "+o.drop:"Collect at "+d.loc)+'</small></div>'+(o.status==="Reserved"?'<button class="btn sm" data-pack="'+o.code+'">Mark packed</button>':'<button class="btn sm" data-hand="'+o.code+'">Mark handed over</button>')+'</div>'}).join(""):'<p class="empty">No reservations to hand over. They appear here by code only.</p>';
$("b-prep").textContent=pq.length;$("b-cd").textContent=cq.length+dk.length}
$("radius").oninput=renderTeam;
$("leftForm").onsubmit=function(e){e.preventDefault();var f=$("lfood").value.trim(),q=+$("lqty").value;
if(!$("lbiz").value){$("lerr").textContent="Choose a business within the radius.";return}
if(!f||q<1){$("lerr").textContent="Add the food and at least 1 portion.";return}
$("lerr").textContent="";S.listings.push({id:nid(),bid:+$("lbiz").value,food:f,qty:q,by:$("lby").value||"18:00",st:"new"});$("lfood").value="";save();renderTeam();toast("Alert sent to the collection team.")};

function openReserve(did){
var d=donor(did),p=picked(did);
$("dlg").innerHTML='<h2>Confirm reservation</h2><p>'+p.map(function(i){return i.qty+" \u00d7 "+i.name}).join(", ")+'<br><span class="note">'+d.name+', '+d.win+'</span></p>'
+'<label class="opt"><input type="radio" name="mode" value="pickup" checked> Collect at '+d.loc+'</label>'
+(d.delivery?'<label class="opt"><input type="radio" name="mode" value="delivery"> Deliver to a drop point</label><select id="drop" aria-label="Drop point" hidden>'+DROPS.map(function(x){return '<option>'+x+'</option>'}).join("")+'</select>':'<p class="note">Delivery isn’t offered for this menu.</p>')
+'<p class="note">Whoever hands over your food only sees your code. Handover is contactless.</p><div class="row" style="display:flex;gap:.6rem;justify-content:flex-end"><button class="btn alt" id="no">Go back</button><button class="btn" id="yes">Confirm</button></div>';
$("dlg").showModal();
document.querySelectorAll('input[name="mode"]').forEach(function(r){r.onchange=function(){var s=$("drop");if(s)s.hidden=r.value!=="delivery"||!r.checked}});
$("no").onclick=function(){$("dlg").close()};
$("yes").onclick=function(){
if(active()>=MAXACTIVE){toast("You have 3 active pickups. Collect or cancel one first.");$("dlg").close();return}
for(var k=0;k<p.length;k++){if(S.stock[p[k].id]<p[k].qty){toast("Someone just took some of that. Counts have been updated.");sel={};$("dlg").close();renderBrowse();return}}
var mode=document.querySelector('input[name="mode"]:checked').value;
if(!S.alias)S.alias="Guest-"+(1000+Math.floor(Math.random()*9000));
p.forEach(function(i){S.stock[i.id]-=i.qty});
var o={code:code(),did:did,items:p,mode:mode,drop:mode==="delivery"?$("drop").value:null,status:"Reserved"};
S.orders.push(o);save();sel={};$("dlg").close();chip();renderBrowse();show("orders");toast("Reserved. Your code is "+o.code)}}

function show(t){document.querySelectorAll("main section").forEach(function(s){s.hidden=s.id!==t});document.querySelectorAll("nav button").forEach(function(b){b.setAttribute("aria-selected",b.dataset.tab===t)});
if(t==="orders")renderOrders();renderTeam();if(t==="browse")renderBrowse()}

document.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var d=b.dataset;
if(d.tab)return show(d.tab);
if(d.claim){lst(+d.claim,"claimed");return toast("Claimed. Head to the pickup.")}
if(d.got){lst(+d.got,"collected");return toast("Collected. Sent to prep.")}
if(d.prep)return addMenu(+d.prep);
if(d.pack||d.hand){var cd=d.pack||d.hand;S.orders.forEach(function(o){if(o.code===cd)o.status=d.pack?"Ready":"Collected"});save();renderTeam();return toast(d.pack?"Packed in a plain bag.":"Handed over.")}
if(d.f){filter=d.f;return renderBrowse()}
if(d.p||d.m){var id=d.p||d.m,q=(sel[id]||0)+(d.p?1:-1);sel[id]=Math.max(0,Math.min(q,MAXQ,S.stock[id]));return renderBrowse()}
if(d.r)return openReserve(d.r);
if(d.c){S.orders.forEach(function(o){if(o.code===d.c)o.status="Collected"});save();return renderOrders()}
if(d.x){S.orders.forEach(function(o){if(o.code===d.x&&o.status==="Reserved"){o.items.forEach(function(i){S.stock[i.id]+=i.qty});o.status="Cancelled"}});save();toast("Reservation cancelled. The food is available again.");return renderOrders()}
if(b.id==="wipe"){try{localStorage.removeItem(KEY)}catch(x){}location.reload()}});
chip();renderBrowse();renderTeam();
