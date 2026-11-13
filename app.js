(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var pad=function(n){return String(n).padStart(2,'0')};
var nf=new Intl.NumberFormat('en-US');
var WD=['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];

var CUR={VND:{sym:'₫',dec:0,pre:false},CAD:{sym:'C$',dec:2,pre:true},USD:{sym:'US$',dec:2,pre:true}};
var CURS=['VND','CAD','USD'];
var CATS={
  Allowance:{kind:'in',vi:'Được cho',v:'--c-allow'},
  Earnings:{kind:'in',vi:'Tự kiếm',v:'--c-earn'},
  Fixed:{kind:'out',vi:'Cố định',v:'--c-fixed'},
  Needed:{kind:'out',vi:'Cần thiết',v:'--c-need'},
  Wanted:{kind:'out',vi:'Muốn',v:'--c-want'},
  Saving:{kind:'sv',vi:'Tiết kiệm',v:'--c-save'}
};
var ORDER=['Allowance','Earnings','Fixed','Needed','Wanted','Saving'];
var CHIPCATS=['Needed','Wanted','Fixed','Allowance','Earnings','Saving','none'];
var ICONS={
  home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  tx:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  stats:'<path d="M3 21h18M6 21V11M12 21V4M18 21v-7"/>',
  save:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'
};
var TABS=[{id:'home',hash:'tong-quan',label:'Tổng quan'},{id:'tx',hash:'giao-dich',label:'Giao dịch'},{id:'stats',hash:'thong-ke',label:'Thống kê'},{id:'save',hash:'tiet-kiem',label:'Tiết kiệm'}];

function defaultCur(){var l=(navigator.language||'').toLowerCase();if(l.indexOf('vi')===0)return 'VND';if(/-ca$/.test(l))return 'CAD';if(l.indexOf('en')===0)return 'USD';return 'VND'}
function todayStr(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
var state={tab:'home',ym:todayStr().slice(0,7),months:{},loaded:false,error:null,slow:false,mode:'db',
  cur:defaultCur(),filter:{cat:'all',q:''},edit:null,fx:null};
var FXR={};
var coll=null,unsub=null,charts=[],queues={},loadTimer=null,delTimer=null,ro=false,viewOther=false;

/* ---------- currency ---------- */
/* Rates come only from the exchanges the user records (sent vs received), never from the market. */
function buildRates(){
  var m={};
  allItems().forEach(function(it){
    if(it.c!=='fx'||!(it.a>0)||!(it.a2>0)||!it.k||!it.k2||it.k===it.k2)return;
    var key=[it.k,it.k2].sort().join('|'),o=m[key];
    if(!o||it.d>=o.d)m[key]={a:it.a,k:it.k,a2:it.a2,k2:it.k2,d:it.d};
  });
  FXR=m;
}
function rateFor(from,to){
  if(from===to)return 1;
  var p=FXR[[from,to].sort().join('|')];
  if(p)return p.k===from?p.a2/p.a:p.a/p.a2;
  for(var i=0;i<CURS.length;i++){
    var c=CURS[i];if(c===from||c===to)continue;
    if(FXR[[from,c].sort().join('|')]&&FXR[[c,to].sort().join('|')])return rateFor(from,c)*rateFor(c,to);
  }
  return null;
}
function conv(a,from,to){from=from||'VND';if(from===to)return a;var r=rateFor(from,to);return r==null?null:a*r}
function rateText(a,k,a2,k2){
  if(!(a>0)||!(a2>0)||k===k2)return '';
  return a2<a?'1 '+k2+' = '+money(a/a2,k):'1 '+k+' = '+money(a2/a,k2);
}
function money(n,c){c=c||state.cur;var d=CUR[c].dec,s=Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});return CUR[c].pre?CUR[c].sym+s:s+' '+CUR[c].sym}
var fmt=function(n){return money(n)};
var fmtS=function(n){return (n<0?'−':'')+money(n)};
function fmtN(n){var d=CUR[state.cur].dec;return Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}
function tick(v){var a=Math.abs(v);if(state.cur==='VND'){if(a>=1e6)return (v/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+'tr';if(a>=1e3)return (v/1e3)+'k';return v}
  if(a>=1e6)return (v/1e6)+'M';if(a>=1e3)return (v/1e3)+'k';return v}
function fmtInput(v,cur){
  if(cur==='VND'){var d=v.replace(/\D/g,'');return d?nf.format(+d):''}
  v=v.replace(/[^\d.]/g,'');var i=v.indexOf('.');var ip=i<0?v:v.slice(0,i),dp=i<0?null:v.slice(i+1).replace(/\./g,'').slice(0,2);
  ip=ip.replace(/^0+(?=\d)/,'');var s=ip?nf.format(+ip):(i<0?'':'0');
  return dp===null?s:(s||'0')+'.'+dp;
}
function parseAmt(v,cur){var n=cur==='VND'?parseInt(String(v).replace(/\D/g,''),10):parseFloat(String(v).replace(/,/g,''));if(!isFinite(n))return 0;return cur==='VND'?n:Math.round(n*100)/100}

function monthLong(ym){var p=ym.split('-');return 'Tháng '+(+p[1])+'/'+p[0]}
function monthShort(ym){var p=ym.split('-');return 'T'+(+p[1])+'/'+p[0].slice(2)}
function daysIn(ym){var p=ym.split('-').map(Number);return new Date(p[0],p[1],0).getDate()}
function dayLabel(d){var p=d.split('-').map(Number);return WD[new Date(p[0],p[1]-1,p[2]).getDay()]+', '+p[2]+'/'+p[1]}
function shiftYm(ym,n){var p=ym.split('-').map(Number);var d=new Date(p[0],p[1]-1+n,1);return d.getFullYear()+'-'+pad(d.getMonth()+1)}
function val(it){var v=conv(Number(it.a)||0,it.k||'VND',state.cur);return v==null?0:v}
function noRate(it){return it.c!=='fx'&&it.c!=='none'&&(it.k||'VND')!==state.cur&&rateFor(it.k||'VND',state.cur)==null}

function totals(items){
  var t={Allowance:0,Earnings:0,Fixed:0,Needed:0,Wanted:0,Saving:0};
  (items||[]).forEach(function(it){if(t[it.c]!==undefined)t[it.c]+=val(it)});
  t.income=t.Allowance+t.Earnings;t.variable=t.Needed+t.Wanted;t.expenses=t.Fixed+t.variable;
  t.balance=t.income-t.expenses-t.Saving;return t;
}
function monthRange(){
  var keys=Object.keys(state.months).sort(),cur=todayStr().slice(0,7);
  var first=keys.length?keys[0]:cur,last=keys.length&&keys[keys.length-1]>cur?keys[keys.length-1]:cur;
  if(first>cur)first=cur;
  var out=[],m=first;while(m<=last&&out.length<600){out.push(m);m=shiftYm(m,1)}
  return out;
}
function allItems(){var o=[];Object.keys(state.months).forEach(function(ym){(state.months[ym]||[]).forEach(function(it){o.push(it)})});return o}
function findItem(id){
  var keys=Object.keys(state.months);
  for(var i=0;i<keys.length;i++){var arr=state.months[keys[i]]||[];for(var j=0;j<arr.length;j++){if(arr[j].id===id)return {ym:keys[i],idx:j,item:arr[j]}}}
  return null;
}
function cssv(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
function P(){var o={};['ink','muted','line','surface','c-allow','c-earn','c-fixed','c-need','c-want','c-save','s-income','s-exp','s-var','accent'].forEach(function(k){o[k]=cssv('--'+k)});return o}
function catColor(c){return c==='none'?'var(--line)':'var('+CATS[c].v+')'}

/* ---------- storage: shared Firestore ledger (only 2 allowed accounts, see firestore.rules) ---------- */
var LS={
  get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},
  set:function(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
};
function settingsObj(){return {cur:state.cur}}
function applySettings(s){if(s&&s.cur&&CUR[s.cur])state.cur=s.cur}
function loadSettings(){try{applySettings(JSON.parse(LS.get('nbm:settings')||'null'))}catch(e){}}
function dbWrite(id,data){
  queues[id]=(queues[id]||Promise.resolve()).then(function(){return coll.doc(id).set(data)}).catch(function(e){
    toast(e&&e.code==='permission-denied'?'Tài khoản này không có quyền ghi.':'Chưa lưu được. Sẽ tự thử lại khi có mạng.');
  });
}
function persistMonth(ym,items){dbWrite('m-'+ym,{ym:ym,items:items})}
function persistSettings(){LS.set('nbm:settings',JSON.stringify(settingsObj()))}
function downloadText(name,text,type){
  var a=document.createElement('a'),u=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));
  a.href=u;a.download=name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(u);a.remove()},1500);
}
function writeMonth(ym,items){
  state.months=Object.assign({},state.months);state.months[ym]=items;
  persistMonth(ym,items);render();
}
function clone(arr){return (arr||[]).map(function(x){return Object.assign({},x)})}
function newId(){return 't'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function upsert(tx,oldId){
  var ym=tx.d.slice(0,7),ops=[];
  var found=oldId?findItem(oldId):null;
  if(found&&found.ym===ym){var a=clone(state.months[ym]);a[found.idx]=tx;ops.push([ym,a])}
  else{
    if(found){var o=clone(state.months[found.ym]);o.splice(found.idx,1);ops.push([found.ym,o])}
    var n=clone(state.months[ym]);n.push(tx);ops.push([ym,n]);
  }
  ops.forEach(function(p){writeMonth(p[0],p[1])});
}
function removeItem(id){var f=findItem(id);if(!f)return;var a=clone(state.months[f.ym]);a.splice(f.idx,1);writeMonth(f.ym,a)}

/* ---------- render ---------- */
function destroyCharts(){charts.forEach(function(c){try{c.destroy()}catch(e){}});charts=[]}
function curSeg(){
  return '<div class="seg" role="group" aria-label="Đơn vị tiền hiển thị">'+CURS.map(function(c){return '<button data-act="cur" data-cur="'+c+'" aria-pressed="'+(state.cur===c)+'">'+c+'</button>'}).join('')+'</div><button class="linkbtn" data-act="fx">Đổi tiền</button><button class="linkbtn" data-act="remind" aria-label="Nhắc nhở và tài khoản">🔔</button>';
}
function renderNav(){
  var h=TABS.map(function(t){return '<button data-act="tab" data-tab="'+t.id+'"'+(state.tab===t.id?' aria-current="page"':'')+'><svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+ICONS[t.id]+'</svg><span>'+t.label+'</span></button>'}).join('');
  $('#nav-side').innerHTML=h;$('#nav-bottom').innerHTML=h;
  var s=curSeg();$('#cur-top').innerHTML=s;$('#cur-side').innerHTML=s;
}
function render(){
  destroyCharts();buildRates();renderNav();
  var v=$('#view');
  if(state.error){v.innerHTML='<div class="empty"><b>Chưa mở được sổ</b>'+esc(state.error)+'</div>';return}
  if(!state.loaded){v.innerHTML='<div class="skel"></div><div class="skel"></div>'+(state.slow?'<p class="notice">Chưa tải được dữ liệu. Kiểm tra mạng, sổ sẽ tự tải khi kết nối được.</p>':'');return}
  var views={home:viewHome,tx:viewTx,stats:viewStats,save:viewSave};
  var miss=allItems().filter(noRate).length;
  v.innerHTML=(ro?'<div class="nudge"><p>Đang xem sổ của em (chỉ xem).</p><div class="acts"><button class="btn small primary" data-act="switch">Về sổ của anh</button></div></div>':'')+(miss?'<div class="nudge"><p>'+miss+' khoản bằng tiền khác chưa có tỷ giá sang '+state.cur+', nên chưa tính vào tổng. Ghi một lần đổi tiền để có tỷ giá.</p><div class="acts"><button class="btn small primary" data-act="fx">Ghi đổi tiền</button></div></div>':'')+views[state.tab]();
  var after={home:chartsHome,stats:chartsStats,save:chartsSave}[state.tab];
  if(after&&typeof Chart!=='undefined')after();
}
function monthbar(){
  var r=monthRange(),i=r.indexOf(state.ym);
  return '<div class="monthbar"><button class="ibtn" data-act="prev" aria-label="Tháng trước"'+(i<=0?' disabled':'')+'>‹</button><div class="mid"><strong>'+monthLong(state.ym)+'</strong><small>1/'+(+state.ym.slice(5))+' – '+daysIn(state.ym)+'/'+(+state.ym.slice(5))+'</small></div><button class="ibtn" data-act="next" aria-label="Tháng sau"'+(i>=r.length-1?' disabled':'')+'>›</button></div>';
}
function nudge(){
  var today=todayStr();
  if(state.ym!==today.slice(0,7)||new Date().getHours()<17)return '';
  var has=(state.months[state.ym]||[]).some(function(it){return it.d===today});
  if(has)return '';
  return '<div class="nudge"><p>Hôm nay bạn chưa ghi khoản nào.</p><div class="acts"><button class="btn small primary" data-act="add">Ghi khoản chi</button><button class="btn small" data-act="nospend">Hôm nay không chi</button></div></div>';
}
function startCard(){
  return '<section class="card start"><h1>Chào mừng đến Nghĩa Béo Money</h1><p>Ghi lại thu nhập, chi tiêu và tiết kiệm mỗi ngày, rồi xem tổng kết theo tháng.</p>'+
   '<ol><li><span>1. Chọn đơn vị tiền</span><div class="seg" role="group" aria-label="Đơn vị tiền hiển thị">'+CURS.map(function(c){return '<button data-act="cur" data-cur="'+c+'" aria-pressed="'+(state.cur===c)+'">'+c+'</button>'}).join('')+'</div></li>'+
   '<li><span>2. Ghi khoản đầu tiên</span><button class="btn primary" data-act="add">+ Thêm khoản</button></li></ol></section>';
}

function viewHome(){
  var items=state.months[state.ym]||[],T=totals(items);
  if(!allItems().length)return startCard();
  var used=T.expenses+T.Saving,base=Math.max(T.income,used,1e-9);
  var seg=[['Fixed',T.Fixed],['Needed',T.Needed],['Wanted',T.Wanted],['Saving',T.Saving]].filter(function(s){return s[1]>0}).map(function(s){return '<i style="width:'+(s[1]/base*100)+'%;background:var('+CATS[s[0]].v+')" title="'+s[0]+'"></i>'}).join('');
  var pct=T.income>0?Math.round(used/T.income*100):null;
  var h=nudge()+monthbar();
  if(!items.length)return h+'<div class="empty"><b>Chưa có giao dịch tháng này</b>Bấm nút Thêm để ghi khoản đầu tiên.</div>';
  h+='<section class="hero"><span class="lbl">Còn lại tháng này</span><b class="big num'+(T.balance<0?' neg':'')+'">'+fmtS(T.balance)+'</b><span class="sub">Thu nhập − Chi tiêu − Tiết kiệm</span>'+
    '<dl class="stats"><div><dt>Thu nhập</dt><dd class="num">'+fmt(T.income)+'</dd></div><div><dt>Chi tiêu</dt><dd class="num">'+fmt(T.expenses)+'</dd></div><div><dt>Tiết kiệm</dt><dd class="num">'+fmt(T.Saving)+'</dd></div></dl>'+
    '<div class="usebar" role="img" aria-label="Phần thu nhập đã dùng">'+seg+'</div><div class="usecap"><span>'+(pct==null?'Chưa có thu nhập':'Đã dùng '+pct+'% thu nhập (chi + tiết kiệm)')+'</span><span>Fixed · Needed · Wanted · Saving</span></div></section>';
  var exp=T.expenses;
  var leg=['Fixed','Needed','Wanted'].map(function(c){return '<div><span class="dot" style="background:var('+CATS[c].v+')"></span><span>'+c+'</span><b class="num">'+fmtN(T[c])+'</b><span class="p num">'+(exp?Math.round(T[c]/exp*100):0)+'%</span></div>'}).join('');
  var mx=Math.max(T.income,T.expenses,T.Saving,1e-9);
  function tr(cls,name,v,color){return '<div class="tr '+cls+'"><span class="nm"><span class="dot" style="background:'+color+'"></span><span>'+name+'</span></span><span class="bar"><i style="width:'+Math.min(100,v/mx*100)+'%;background:'+color+'"></i></span><span class="amt num">'+fmtN(v)+'</span></div>'}
  var tree=tr('top','Thu nhập',T.income,'var(--s-income)')+tr('l1','Allowance',T.Allowance,'var(--c-allow)')+tr('l1','Earnings',T.Earnings,'var(--c-earn)')+
    tr('top','Chi tiêu',T.expenses,'var(--s-exp)')+tr('l1','Fixed',T.Fixed,'var(--c-fixed)')+tr('l1','Variable',T.variable,'var(--s-var)')+tr('l2','Needed',T.Needed,'var(--c-need)')+tr('l2','Wanted',T.Wanted,'var(--c-want)')+
    tr('top','Tiết kiệm',T.Saving,'var(--c-save)');
  var top=items.filter(function(i){return CATS[i.c]&&CATS[i.c].kind==='out'}).sort(function(a,b){return val(b)-val(a)}).slice(0,5);
  var topH=top.length?top.map(function(i){return rowHtml(i,true)}).join(''):'<p class="notice">Chưa có khoản chi nào.</p>';
  h+='<div class="grid">'+
   '<section class="card"><h2 class="ct">Chi tiêu chia theo nhóm</h2>'+(exp?'<div class="donutwrap"><div class="donutbox"><canvas id="c-donut" aria-label="Biểu đồ tròn chi tiêu"></canvas></div><div class="dleg">'+leg+'</div></div>':'<p class="notice">Chưa có khoản chi nào để chia.</p>')+'</section>'+
   '<section class="card"><h2 class="ct">Thu, chi và tiết kiệm ('+state.cur+')</h2><div class="tree">'+tree+'</div></section>'+
   '<section class="card" style="grid-column:1/-1"><h2 class="ct">Chi theo ngày</h2><div class="chart"><canvas id="c-daily" aria-label="Biểu đồ chi theo ngày"></canvas></div></section>'+
   '<section class="card" style="grid-column:1/-1"><h2 class="ct">5 khoản chi lớn nhất</h2><div class="list">'+topH+'</div></section></div>';
  return h;
}
function rowHtml(it,showDate){
  if(it.c==='fx'){
    return '<button class="row" data-act="edit" data-id="'+esc(it.id)+'"><span class="dot" style="background:transparent;border:1.5px solid var(--accent)"></span><span class="rt"><b>Đổi tiền</b><small>'+money(it.a,it.k)+' → '+money(it.a2,it.k2)+' · '+rateText(it.a,it.k,it.a2,it.k2)+(it.n?' · '+esc(it.n):'')+'</small></span><span class="amt num">⇄</span></button>';
  }
  var c=CATS[it.c],none=it.c==='none',k=it.k||'VND';
  var sign=none?'':(c.kind==='in'?'+':c.kind==='out'?'−':'');
  var cls=none?'':(c.kind==='in'?'in':c.kind==='sv'?'sv':'');
  var meta=(none?'Không chi':it.c)+(showDate?' · '+it.d.slice(8)+'/'+it.d.slice(5,7):'')+(!none&&k!==state.cur?(noRate(it)?' · chưa có tỷ giá':' · gốc '+money(it.a,k)):'')+(it.n?' · '+esc(it.n):'');
  return '<button class="row'+(none?' nospend':'')+'" data-act="edit" data-id="'+esc(it.id)+'"><span class="dot" style="background:'+(none?'transparent;border:1.5px solid var(--muted)':catColor(it.c))+'"></span><span class="rt"><b>'+esc(it.t)+'</b><small>'+meta+'</small></span><span class="amt num '+cls+'">'+(none?'':noRate(it)?sign+money(it.a,k):sign+money(val(it)))+'</span></button>';
}
function txListHtml(){
  var items=(state.months[state.ym]||[]).map(function(x,i){return {x:x,i:i}});
  var f=state.filter,q=f.q.trim().toLowerCase();
  items=items.filter(function(o){return (f.cat==='all'||o.x.c===f.cat)&&(!q||(o.x.t+' '+(o.x.n||'')).toLowerCase().indexOf(q)>=0)});
  if(!items.length)return '<div class="empty"><b>Không có giao dịch</b>'+(f.cat!=='all'||q?'Thử đổi bộ lọc hoặc từ khóa.':'Bấm nút Thêm để ghi khoản đầu tiên.')+'</div>';
  items.sort(function(a,b){return a.x.d<b.x.d?1:a.x.d>b.x.d?-1:b.i-a.i});
  var out='',cur='',buf=[];
  function flush(){if(!buf.length)return;var tot=buf.reduce(function(s,o){return s+(CATS[o.x.c]&&CATS[o.x.c].kind==='out'?val(o.x):0)},0);
    out+='<h3 class="dayh"><span>'+dayLabel(cur)+'</span><span class="num">'+(tot?'−'+money(tot):'')+'</span></h3><div class="list">'+buf.map(function(o){return rowHtml(o.x)}).join('')+'</div>';buf=[]}
  items.forEach(function(o){if(o.x.d!==cur){flush();cur=o.x.d}buf.push(o)});flush();
  return '<div class="card">'+out+'</div>';
}
function viewTx(){
  var f=state.filter;
  var chips=['all'].concat(ORDER,['fx']).map(function(c){return '<button class="chip" data-act="fcat" data-cat="'+c+'" aria-pressed="'+(f.cat===c)+'">'+(c==='all'?'Tất cả':c==='fx'?'Đổi tiền':'<span class="dot" style="background:var('+CATS[c].v+')"></span>'+c)+'</button>'}).join('');
  return monthbar()+'<div class="hdr"><h1 class="pt">Giao dịch</h1><button class="btn small" data-act="csv">Xuất CSV</button></div><input class="search" id="q" type="search" placeholder="Tìm theo hoạt động hoặc ghi chú" value="'+esc(f.q)+'" aria-label="Tìm giao dịch"><div class="chips">'+chips+'</div><div id="txlist">'+txListHtml()+'</div>';
}
function viewStats(){
  var r=monthRange();
  if(!allItems().length)return '<div class="empty"><b>Chưa có dữ liệu thống kê</b>Thêm giao dịch để xem biểu đồ theo tháng.</div>';
  var rows=r.slice().reverse().map(function(ym){var T=totals(state.months[ym]);return '<tr><td>'+monthLong(ym)+'</td>'+['income','Allowance','Earnings','expenses','Fixed','variable','Needed','Wanted','Saving'].map(function(k){return '<td class="num">'+fmtN(T[k])+'</td>'}).join('')+'</tr>'}).join('');
  return '<h1 class="pt">Thống kê theo tháng</h1><div class="grid">'+
   '<section class="card"><h2 class="ct">Thu nhập: Income, Allowance, Earnings</h2><div class="chart"><canvas id="c-sa" aria-label="Biểu đồ cột thu nhập theo tháng"></canvas></div></section>'+
   '<section class="card"><h2 class="ct">Chi tiêu: Expenses, Fixed, Variable, Needed, Wanted</h2><div class="chart"><canvas id="c-sb" aria-label="Biểu đồ cột chi tiêu theo tháng"></canvas></div></section>'+
   '<section class="card" style="grid-column:1/-1"><h2 class="ct">Bảng số liệu ('+state.cur+')</h2><div class="scroll"><table><thead><tr><th>Tháng</th><th>Income</th><th>Allowance</th><th>Earnings</th><th>Expenses</th><th>Fixed</th><th>Variable</th><th>Needed</th><th>Wanted</th><th>Saving</th></tr></thead><tbody>'+rows+'</tbody></table></div></section></div>';
}
function viewSave(){
  var r=monthRange(),cum=0;
  var rows=r.map(function(ym){var s=totals(state.months[ym]).Saving;cum+=s;return {ym:ym,s:s,cum:cum}});
  var total=cum,cur=todayStr().slice(0,7),curS=totals(state.months[cur]).Saving;
  var list=rows.slice().reverse().map(function(o){return '<tr><td>'+monthLong(o.ym)+'</td><td class="num">'+fmtN(o.s)+'</td><td class="num">'+fmtN(o.cum)+'</td></tr>'}).join('');
  return '<div class="hdr"><h1 class="pt">Tiết kiệm</h1><button class="btn small primary" data-act="addsave">+ Ghi tiết kiệm</button></div>'+
   '<section class="hero"><span class="lbl">Tổng đã tiết kiệm</span><b class="big num">'+fmt(total)+'</b><span class="sub">Cộng dồn từ '+monthLong(r[0])+'</span>'+
   '<dl class="stats"><div><dt>Tháng này</dt><dd class="num">'+fmt(curS)+'</dd></div><div><dt>Số tháng</dt><dd class="num">'+r.length+'</dd></div><div><dt>Trung bình/tháng</dt><dd class="num">'+fmt(r.length?total/r.length:0)+'</dd></div></dl></section>'+
   '<div class="grid"><section class="card"><h2 class="ct">Tiết kiệm mỗi tháng</h2><div class="chart"><canvas id="c-sv1" aria-label="Biểu đồ tiết kiệm mỗi tháng"></canvas></div></section>'+
   '<section class="card"><h2 class="ct">Tổng cộng dồn</h2><div class="chart"><canvas id="c-sv2" aria-label="Biểu đồ tiết kiệm cộng dồn"></canvas></div></section>'+
   '<section class="card" style="grid-column:1/-1"><h2 class="ct">Theo tháng ('+state.cur+')</h2><div class="scroll"><table><thead><tr><th>Tháng</th><th>Saving</th><th>Cộng dồn</th></tr></thead><tbody>'+list+'</tbody></table></div></section></div>';
}

/* ---------- charts ---------- */
function baseOpts(legend){
  var p=P();
  return {responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},
    plugins:{legend:{display:!!legend,position:'top',align:'start',labels:{color:p.muted,usePointStyle:true,pointStyle:'rectRounded',boxWidth:8,boxHeight:8,font:{size:12}}},
      tooltip:{backgroundColor:p.surface,titleColor:p.ink,bodyColor:p.ink,borderColor:p.line,borderWidth:1,padding:10,cornerRadius:8,boxPadding:4,
        callbacks:{label:function(c){return ' '+c.dataset.label+': '+fmt(c.parsed.y)}}}},
    scales:{x:{grid:{display:false},ticks:{color:p.muted,font:{size:11}},border:{color:p.line}},
      y:{beginAtZero:true,grid:{color:p.line},border:{display:false},ticks:{color:p.muted,font:{size:11},callback:tick,maxTicksLimit:5}}}};
}
function mk(id,cfg){var el=document.getElementById(id);if(!el)return;charts.push(new Chart(el,cfg))}
function chartsHome(){
  var p=P(),items=state.months[state.ym]||[],T=totals(items);
  if(T.expenses>0)mk('c-donut',{type:'doughnut',data:{labels:['Fixed','Needed','Wanted'],datasets:[{data:[T.Fixed,T.Needed,T.Wanted],backgroundColor:[p['c-fixed'],p['c-need'],p['c-want']],borderColor:p.surface,borderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:false,animation:false,cutout:'64%',plugins:{legend:{display:false},tooltip:{backgroundColor:p.surface,titleColor:p.ink,bodyColor:p.ink,borderColor:p.line,borderWidth:1,callbacks:{label:function(c){return ' '+c.label+': '+fmt(c.parsed)+' ('+Math.round(c.parsed/T.expenses*100)+'%)'}}}}}});
  var n=daysIn(state.ym),labels=[],by={Fixed:[],Needed:[],Wanted:[]};
  for(var i=1;i<=n;i++){labels.push(i);by.Fixed.push(0);by.Needed.push(0);by.Wanted.push(0)}
  items.forEach(function(it){if(by[it.c]){var d=+it.d.slice(8,10);if(d>=1&&d<=n)by[it.c][d-1]+=val(it)}});
  var o=baseOpts(true);o.plugins.tooltip.callbacks.title=function(a){return 'Ngày '+a[0].label};
  o.plugins.tooltip.callbacks.footer=function(a){var s=a.reduce(function(t,x){return t+x.parsed.y},0);return 'Tổng: '+fmt(s)};
  o.scales.x.stacked=true;o.scales.y.stacked=true;
  mk('c-daily',{type:'bar',data:{labels:labels,datasets:[['Fixed','c-fixed'],['Needed','c-need'],['Wanted','c-want']].map(function(s){return {label:s[0],data:by[s[0]],backgroundColor:p[s[1]],borderColor:p.surface,borderWidth:1.5,borderRadius:3,maxBarThickness:22}})},options:o});
}
function chartsStats(){
  var p=P(),r=monthRange(),labels=r.map(monthShort),T=r.map(function(ym){return totals(state.months[ym])});
  function ds(label,key,col){return {label:label,data:T.map(function(t){return t[key]}),backgroundColor:col,borderRadius:4,borderSkipped:'bottom',maxBarThickness:30,categoryPercentage:.8,barPercentage:.9}}
  mk('c-sa',{type:'bar',data:{labels:labels,datasets:[ds('Income','income',p['s-income']),ds('Allowance','Allowance',p['c-allow']),ds('Earnings','Earnings',p['c-earn'])]},options:baseOpts(true)});
  mk('c-sb',{type:'bar',data:{labels:labels,datasets:[ds('Expenses','expenses',p['s-exp']),ds('Fixed','Fixed',p['c-fixed']),ds('Variable','variable',p['s-var']),ds('Needed','Needed',p['c-need']),ds('Wanted','Wanted',p['c-want'])]},options:baseOpts(true)});
}
function chartsSave(){
  var p=P(),r=monthRange(),labels=r.map(monthShort),cum=0;
  var s=r.map(function(ym){return totals(state.months[ym]).Saving}),c=s.map(function(v){cum+=v;return cum});
  mk('c-sv1',{type:'bar',data:{labels:labels,datasets:[{label:'Saving',data:s,backgroundColor:p['c-save'],borderRadius:4,borderSkipped:'bottom',maxBarThickness:36}]},options:baseOpts(false)});
  mk('c-sv2',{type:'line',data:{labels:labels,datasets:[{label:'Cộng dồn',data:c,borderColor:p['c-save'],backgroundColor:p['c-save']+'22',fill:true,borderWidth:2,pointRadius:4,pointBackgroundColor:p['c-save'],pointBorderColor:p.surface,pointBorderWidth:2,tension:0}]},options:baseOpts(false)});
}

/* ---------- add / edit sheet ---------- */
function frequent(){
  var m={};allItems().forEach(function(it){if(!CATS[it.c]||CATS[it.c].kind!=='out'||!(it.a>0))return;var k=(it.k||'VND'),key=it.t.trim().toLowerCase()+'|'+it.c+'|'+it.a+'|'+k;if(!m[key])m[key]={t:it.t.trim(),c:it.c,a:it.a,k:k,n:0};m[key].n++});
  return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return b.n-a.n}).slice(0,6);
}
function titleSuggestions(){var s={};allItems().forEach(function(it){var t=(it.t||'').trim();if(t&&it.c!=='none'&&it.c!=='fx')s[t.toLowerCase()]=t});return Object.keys(s).slice(0,80).map(function(k){return s[k]})}
function drawCats(){
  $('#catchips').innerHTML=CHIPCATS.map(function(c){var on=state.edit.c===c;return '<button type="button" data-act="setcat" data-cat="'+c+'" aria-pressed="'+on+'"><b><span class="dot" style="background:'+(c==='none'?'transparent;border:1.5px solid var(--muted)':'var('+CATS[c].v+')')+'"></span>'+(c==='none'?'Không chi':c)+'</b><small>'+(c==='none'?'Ngày không tiêu':CATS[c].vi)+'</small></button>'}).join('');
  $('#f-amt').disabled=state.edit.c==='none';
}
function drawEntryCur(){
  var k=state.edit.k;
  $('#f-cur').innerHTML=CURS.map(function(c){return '<button type="button" data-act="setk" data-k="'+c+'" aria-pressed="'+(k===c)+'">'+c+'</button>'}).join('');
  $('#f-u').textContent=CUR[k].sym;
  $('#f-zeros').hidden=k!=='VND';
  $('#f-amt').setAttribute('inputmode',k==='VND'?'numeric':'decimal');
}
function openSheet(item,preset){
  var today=todayStr(),d=today;
  if(!item&&state.ym<today.slice(0,7))d=state.ym+'-'+pad(daysIn(state.ym));
  state.edit=item?Object.assign({k:'VND'},item):Object.assign({id:null,d:d,t:'',a:0,k:state.cur,c:'Needed',n:''},preset||{});
  var e=state.edit;
  $('#sheet-title').textContent=item?'Sửa khoản':'Thêm khoản';
  $('#f-amt').value=e.a>0?fmtInput(String(e.a),e.k):'';$('#f-title').value=e.t||'';$('#f-date').value=e.d;$('#f-note').value=e.n||'';
  $('#f-err').hidden=true;$('#btn-del').hidden=!item;$('#btn-del').textContent='Xóa';delete $('#btn-del').dataset.arm;
  $('#titles').innerHTML=titleSuggestions().map(function(t){return '<option value="'+esc(t)+'">'}).join('');
  var q=item?[]:frequent();
  $('#quick').innerHTML=q.map(function(f,i){return '<button type="button" class="chip" data-act="quick" data-i="'+i+'"><span class="dot" style="background:var('+CATS[f.c].v+')"></span>'+esc(f.t)+' · '+money(f.a,f.k)+'</button>'}).join('');
  $('#quick')._q=q;
  drawCats();drawEntryCur();$('#overlay').hidden=false;
  setTimeout(function(){var el=$('#f-amt');if(!el.disabled&&!item)el.focus()},30);
}
function closeSheet(){$('#overlay').hidden=true;state.edit=null}
function saveSheet(){
  var e=state.edit;if(!e)return;
  var a=parseAmt($('#f-amt').value,e.k),t=$('#f-title').value.trim(),d=$('#f-date').value,n=$('#f-note').value.trim(),c=e.c;
  var err='';
  if(c!=='none'&&!(a>0))err='Nhập số tiền lớn hơn 0.';
  else if(!t&&c!=='none')err='Nhập tên khoản, ví dụ ăn trưa hoặc xăng.';
  else if(!d)err='Chọn ngày.';
  if(err){var el=$('#f-err');el.textContent=err;el.hidden=false;return}
  if(c==='none'){a=0;if(!t)t='Không tiêu gì'}
  upsert({id:e.id||newId(),d:d,t:t,a:a,k:e.k,c:c,n:n},e.id);
  closeSheet();toast(e.id?'Đã cập nhật':'Đã lưu');
}
function toast(m){var old=$('.toast');if(old)old.remove();var el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=m;document.body.appendChild(el);setTimeout(function(){el.remove()},2800)}

/* ---------- exchange sheet (user enters sent + received) ---------- */
function setAmt(sel,amount,cur){$(sel).value=amount>0?fmtInput(String(cur==='VND'?Math.round(amount):amount),cur):''}
function updFxRate(){
  var e=state.fx;if(!e)return;
  var a=parseAmt($('#fx-a1').value,e.k),a2=parseAmt($('#fx-a2').value,e.k2);
  $('#fx-rate').textContent=(a>0&&a2>0)?'Tỷ giá thực tế: '+rateText(a,e.k,a2,e.k2):'Nhập cả hai số để thấy tỷ giá thực tế.';
}
function drawFx(){
  var e=state.fx;
  function segs(cur,w){return CURS.map(function(c){return '<button type="button" data-act="fxcur" data-w="'+w+'" data-k="'+c+'" aria-pressed="'+(cur===c)+'">'+c+'</button>'}).join('')}
  $('#fx-c1').innerHTML=segs(e.k,'1');$('#fx-c2').innerHTML=segs(e.k2,'2');
  $('#fx-u1').textContent=CUR[e.k].sym;$('#fx-u2').textContent=CUR[e.k2].sym;
  $('#fx-a1').setAttribute('inputmode',e.k==='VND'?'numeric':'decimal');
  $('#fx-a2').setAttribute('inputmode',e.k2==='VND'?'numeric':'decimal');
  var keys=Object.keys(FXR);
  $('#fx-cur').innerHTML=keys.length?'<b>Tỷ giá đang dùng (lần đổi gần nhất)</b><br>'+keys.map(function(k){var p=FXR[k];return esc(rateText(p.a,p.k,p.a2,p.k2))+' · '+p.d.slice(8)+'/'+p.d.slice(5,7)}).join('<br>'):'Chưa có lần đổi nào. Khoản bằng tiền khác chỉ được quy đổi sau khi bạn ghi một lần đổi.';
  updFxRate();
}
function openFx(item){
  state.fx=item?{id:item.id,d:item.d,k:item.k,k2:item.k2,a:item.a,a2:item.a2,n:item.n||''}:{id:null,d:todayStr(),k:'VND',k2:'CAD',a:0,a2:0,n:''};
  var e=state.fx;
  setAmt('#fx-a1',e.a,e.k);setAmt('#fx-a2',e.a2,e.k2);
  $('#fx-date').value=e.d;$('#fx-note').value=e.n;
  $('#fx-err').hidden=true;$('#fx-del').hidden=!item;$('#fx-del').textContent='Xóa';delete $('#fx-del').dataset.arm;
  drawFx();$('#ov2').hidden=false;
  setTimeout(function(){var el=$('#fx-a1');if(el&&!item)el.focus()},30);
}
function closeFx(){$('#ov2').hidden=true;state.fx=null}
function saveFx(){
  var e=state.fx;if(!e)return;
  var a=parseAmt($('#fx-a1').value,e.k),a2=parseAmt($('#fx-a2').value,e.k2),d=$('#fx-date').value,n=$('#fx-note').value.trim(),err='';
  if(!(a>0))err='Nhập số tiền đã chuyển đi.';
  else if(!(a2>0))err='Nhập số tiền thực nhận.';
  else if(e.k===e.k2)err='Hai đơn vị tiền phải khác nhau.';
  else if(!d)err='Chọn ngày.';
  if(err){var el=$('#fx-err');el.textContent=err;el.hidden=false;return}
  upsert({id:e.id||newId(),d:d,t:'Đổi tiền',a:a,k:e.k,c:'fx',a2:a2,k2:e.k2,n:n},e.id);
  var was=e.id;closeFx();toast(was?'Đã cập nhật':'Đã ghi lần đổi tiền');
}

function exportCsv(){
  var rows=[['Date','Activity','Amount','Currency','Category','Note']];
  allItems().sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:0}).forEach(function(i){rows.push([i.d,i.t,i.a,i.k||'VND',i.c,i.c==='fx'?('Nhận '+i.a2+' '+i.k2+(i.n?' | '+i.n:'')):(i.n||'')])});
  var csv='﻿'+rows.map(function(r){return r.map(function(v){v=String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')}).join('\r\n');
  downloadText('nghia-beo-money-'+todayStr()+'.csv',csv,'text/csv');toast('Đã xuất CSV');
}

/* ---------- events ---------- */
document.addEventListener('click',function(ev){
  if(ev.target.id==='overlay'){closeSheet();return}
  if(ev.target.id==='ov2'){closeFx();return}
  if(ev.target.id==='ov3'){closeRemind();return}
  var b=ev.target.closest('[data-act]');if(!b)return;
  var a=b.dataset.act;
  if(ro&&/^(add|addsave|edit|nospend|save|del|fx|savefx|delfx)$/.test(a)){toast('Đang xem sổ của em, chỉ xem.');return}
  if(a==='tab'){setTab(b.dataset.tab)}
  else if(a==='cur'){state.cur=b.dataset.cur;persistSettings();render()}
  else if(a==='fx'){openFx(null)}
  else if(a==='closefx'){closeFx()}
  else if(a==='savefx'){saveFx()}
  else if(a==='delfx'){
    if(b.dataset.arm){clearTimeout(delTimer);var fid=state.fx.id;closeFx();removeItem(fid);toast('Đã xóa')}
    else{b.dataset.arm='1';b.textContent='Bấm lần nữa để xóa';delTimer=setTimeout(function(){delete b.dataset.arm;b.textContent='Xóa'},3000)}
  }
  else if(a==='fxcur'){
    var e=state.fx,a1=parseAmt($('#fx-a1').value,e.k),a2=parseAmt($('#fx-a2').value,e.k2),nk=b.dataset.k;
    if(b.dataset.w==='1'){if(nk===e.k2){e.k2=e.k;a2=0}e.k=nk}
    else{if(nk===e.k){e.k=e.k2;a1=0}e.k2=nk}
    setAmt('#fx-a1',a1,e.k);setAmt('#fx-a2',a2,e.k2);drawFx();
  }
  else if(a==='prev'){state.ym=shiftYm(state.ym,-1);render()}
  else if(a==='next'){state.ym=shiftYm(state.ym,1);render()}
  else if(a==='add'){openSheet(null)}
  else if(a==='addsave'){openSheet(null,{c:'Saving',t:'Saving'})}
  else if(a==='edit'){var f=findItem(b.dataset.id);if(f){if(f.item.c==='fx')openFx(f.item);else openSheet(f.item)}}
  else if(a==='close'){closeSheet()}
  else if(a==='setcat'){state.edit.c=b.dataset.cat;drawCats()}
  else if(a==='setk'){var old=state.edit.k,nk=b.dataset.k;if(nk!==old){var cur=parseAmt($('#f-amt').value,old);state.edit.k=nk;$('#f-amt').value=cur>0?fmtInput(String(nk==='VND'?Math.round(cur):cur),nk):'';drawEntryCur()}}
  else if(a==='zeros'){var el=$('#f-amt');var d=el.value.replace(/\D/g,'');if(d){el.value=nf.format(+(d+'000'))}el.focus()}
  else if(a==='quick'){var q=$('#quick')._q[+b.dataset.i];if(q){state.edit.c=q.c;state.edit.k=q.k;$('#f-title').value=q.t;$('#f-amt').value=fmtInput(String(q.a),q.k);drawCats();drawEntryCur()}}
  else if(a==='save'){saveSheet()}
  else if(a==='del'){
    if(b.dataset.arm){clearTimeout(delTimer);var id=state.edit.id;closeSheet();removeItem(id);toast('Đã xóa')}
    else{b.dataset.arm='1';b.textContent='Bấm lần nữa để xóa';delTimer=setTimeout(function(){delete b.dataset.arm;b.textContent='Xóa'},3000)}
  }
  else if(a==='fcat'){state.filter.cat=b.dataset.cat;render()}
  else if(a==='nospend'){upsert({id:newId(),d:todayStr(),t:'Hôm nay không chi',a:0,k:state.cur,c:'none',n:''});toast('Đã ghi: hôm nay không chi')}
  else if(a==='csv'){exportCsv()}
  else if(a==='remind'){openRemind()}
  else if(a==='closerm'){closeRemind()}
  else if(a==='rmon'){enableRemind()}
  else if(a==='rmoff'){disableRemind()}
  else if(a==='rmics'){icsFile()}
  else if(a==='switch'){closeRemind();viewOther=!viewOther;watch()}
  else if(a==='logout'){closeRemind();if(fbAuth)fbAuth.signOut()}
  else if(a==='login'){doLogin()}
});
document.addEventListener('input',function(ev){
  if(ev.target.id==='f-amt'){ev.target.value=fmtInput(ev.target.value,state.edit?state.edit.k:'VND')}
  else if(ev.target.id==='fx-a1'&&state.fx){ev.target.value=fmtInput(ev.target.value,state.fx.k);updFxRate()}
  else if(ev.target.id==='fx-a2'&&state.fx){ev.target.value=fmtInput(ev.target.value,state.fx.k2);updFxRate()}
  else if(ev.target.id==='q'){state.filter.q=ev.target.value;$('#txlist').innerHTML=txListHtml()}
});
document.addEventListener('keydown',function(ev){
  if(ev.key==='Escape'){if(!$('#overlay').hidden)closeSheet();if(!$('#ov2').hidden)closeFx();if(!$('#ov3').hidden)closeRemind()}
  if(ev.key==='Enter'&&ev.target.tagName==='INPUT'){
    if(!$('#overlay').hidden&&ev.target.id!=='q'){ev.preventDefault();saveSheet()}
    else if(!$('#ov2').hidden){ev.preventDefault();saveFx()}
    else if(ev.target.id==='lg-email'||ev.target.id==='lg-pass'){ev.preventDefault();doLogin()}
  }
});
function setTab(id,fromHash){
  state.tab=id;
  if(!fromHash){var t=TABS.filter(function(x){return x.id===id})[0];try{history.replaceState(null,'','#'+t.hash)}catch(e){location.hash=t.hash}}
  render();window.scrollTo(0,0);
}
window.addEventListener('hashchange',function(){var h=location.hash.slice(1),t=TABS.filter(function(x){return x.hash===h})[0];if(t&&t.id!==state.tab)setTab(t.id,true)});
try{var mq=window.matchMedia('(prefers-color-scheme: dark)');(mq.addEventListener?mq.addEventListener.bind(mq,'change'):function(){})(function(){if(state.loaded)render()});
  new MutationObserver(function(){if(state.loaded)render()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})}catch(e){}

/* ---------- reminder: web push (iPhone PWA) + .ics calendar file ---------- */
function urlB64(b){var p='='.repeat((4-b.length%4)%4),s=(b+p).replace(/-/g,'+').replace(/_/g,'/'),r=atob(s),o=new Uint8Array(r.length);for(var i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o}
function isStandalone(){return window.navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)}
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function pushSupported(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window}
function remindDoc(){return fbDb.collection('reminders').doc(me.uid)}
function openRemind(){
  $('#ov3').hidden=false;$('#rm-who').textContent=me?me.email:'';
  var sw=$('#rm-switch');sw.hidden=!isOwner();sw.textContent=viewOther?'Về sổ của anh':'Xem sổ của em (chỉ xem)';
  if(!$('#rm-time').value)$('#rm-time').value='20:00';
  drawRemind();
  if(me)remindDoc().get().then(function(d){var x=d.exists?d.data():null;state.rm=x;if(x&&x.time)$('#rm-time').value=x.time;drawRemind()}).catch(function(){});
}
function closeRemind(){$('#ov3').hidden=true}
function drawRemind(){
  var s=$('#rm-status'),on=state.rm&&state.rm.sub,msg='',canPush=pushSupported()&&(!isIOS()||isStandalone());
  if(!window.VAPID_PUBLIC_KEY||/PASTE/.test(window.VAPID_PUBLIC_KEY))msg='Chưa cấu hình khóa thông báo (VAPID) trong firebase-config.js.';
  else if(!canPush)msg=isIOS()?'Để nhận thông báo: mở app bằng icon ngoài màn hình chính (Safari → Chia sẻ → Thêm vào MH chính), rồi quay lại đây bấm Bật. Cần iOS 16.4 trở lên.':'Trình duyệt này chưa hỗ trợ thông báo.';
  else if(window.Notification&&Notification.permission==='denied')msg='Thông báo đang bị chặn. Vào Cài đặt iPhone → Thông báo → Nghĩa Béo Money để bật lại.';
  else if(on)msg='Đang bật: nhắc lúc '+state.rm.time+' mỗi ngày, bỏ qua nếu hôm đó đã ghi.';
  else msg='Chưa bật thông báo.';
  s.textContent=msg;
  $('#rm-on').textContent=on?'Cập nhật giờ nhắc':'Bật thông báo';
  $('#rm-on').disabled=!canPush||!window.VAPID_PUBLIC_KEY||/PASTE/.test(window.VAPID_PUBLIC_KEY);
  $('#rm-off').hidden=!on;
}
function enableRemind(){
  var time=$('#rm-time').value||'20:00';
  if(!pushSupported()){toast('Máy này chưa hỗ trợ thông báo');return}
  Notification.requestPermission().then(function(p){
    if(p!=='granted'){drawRemind();toast('Chưa được cấp quyền thông báo');return}
    return navigator.serviceWorker.ready.then(function(reg){
      return reg.pushManager.getSubscription().then(function(s){return s||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlB64(window.VAPID_PUBLIC_KEY)})});
    }).then(function(sub){
      var tz=(Intl.DateTimeFormat().resolvedOptions().timeZone)||'America/Toronto';
      var data={sub:JSON.parse(JSON.stringify(sub)),time:time,tz:tz,email:me.email,updated:Date.now()};
      return remindDoc().set(data).then(function(){state.rm=data;drawRemind();toast('Đã bật nhắc '+time+' mỗi ngày')});
    });
  }).catch(function(e){toast('Không bật được: '+((e&&e.message)||'lỗi'))});
}
function disableRemind(){
  var done=function(){state.rm=null;drawRemind();toast('Đã tắt nhắc')};
  var p=(navigator.serviceWorker&&navigator.serviceWorker.ready)?navigator.serviceWorker.ready.then(function(r){return r.pushManager.getSubscription()}).then(function(s){return s&&s.unsubscribe()}):Promise.resolve();
  p.catch(function(){}).then(function(){return remindDoc().delete()}).then(done).catch(function(){toast('Chưa tắt được, thử lại')});
}
function icsFile(){
  var t=($('#rm-time').value||'20:00').split(':'),hh=pad(+t[0]),mm=pad(+t[1]);
  var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nghia Beo Money//VI','BEGIN:VEVENT','UID:nghia-beo-money-daily-'+hh+mm+'@local','DTSTAMP:20260101T000000Z','DTSTART:20260101T'+hh+mm+'00','DURATION:PT10M','RRULE:FREQ=DAILY','SUMMARY:Ghi thu chi hôm nay','DESCRIPTION:Mở Nghĩa Béo Money và ghi các khoản hôm nay.','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Ghi thu chi hôm nay','TRIGGER:PT0S','END:VALARM','END:VEVENT','END:VCALENDAR'];
  downloadText('nhac-thu-chi.ics',L.join('\r\n'),'text/calendar');
}

/* ---------- boot: login (2 accounts) + shared Firestore ledger ---------- */
var fbAuth=null,fbDb=null,me=null;
function showLogin(msg){
  $('#login').hidden=false;var e=$('#lg-err');e.hidden=!msg;e.textContent=msg||'';
}
function authErr(e){
  var c=(e&&e.code)||'';
  if(/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c))return 'Sai email hoặc mật khẩu.';
  if(c==='auth/too-many-requests')return 'Thử quá nhiều lần. Đợi vài phút rồi thử lại.';
  if(c==='auth/network-request-failed')return 'Không có mạng.';
  return 'Không đăng nhập được ('+(c||'lỗi')+').';
}
function doLogin(){
  var em=$('#lg-email').value.trim(),pw=$('#lg-pass').value;
  if(!em||!pw){showLogin('Nhập email và mật khẩu.');return}
  $('#lg-btn').disabled=true;
  fbAuth.signInWithEmailAndPassword(em,pw).then(function(){$('#lg-pass').value=''}).catch(function(e){showLogin(authErr(e))}).then(function(){$('#lg-btn').disabled=false});
}
function isOwner(){return !!(me&&me.email&&window.OWNER_EMAIL&&me.email.toLowerCase()===String(window.OWNER_EMAIL).toLowerCase())}
function startDb(user){me=user;viewOther=false;$('#login').hidden=true;watch()}
/* Chủ sổ (OWNER_EMAIL) ghi vào 'ledger_owner'; tài khoản còn lại ghi vào 'ledger'. Chủ sổ có thể chuyển sang xem 'ledger' (chỉ xem). */
function watch(){
  try{unsub&&unsub()}catch(e){}
  ro=isOwner()&&viewOther;document.body.classList.toggle('ro',ro);
  coll=fbDb.collection(isOwner()&&!viewOther?'ledger_owner':'ledger');
  state.months={};state.loaded=false;state.slow=false;state.error=null;
  clearTimeout(loadTimer);
  loadTimer=setTimeout(function(){if(!state.loaded){state.slow=true;render()}},10000);
  render();
  unsub=coll.onSnapshot(function(snap){
    if(snap.empty&&snap.metadata.fromCache&&navigator.onLine)return; /* wait for server so the welcome card does not flash */
    var m={};
    snap.docs.forEach(function(d){var x=d.data()||{};if(d.id.indexOf('m-')===0)m[d.id.slice(2)]=Array.isArray(x.items)?x.items:[]});
    state.months=m;state.loaded=true;state.slow=false;state.error=null;clearTimeout(loadTimer);render();
  },function(e){
    state.loaded=false;
    state.error=(e&&e.code==='permission-denied')?'Tài khoản này không có quyền vào sổ. Bấm 🔔 → Đăng xuất, rồi dùng đúng tài khoản được cấp.':'Không tải được sổ ('+((e&&e.code)||'lỗi')+').';
    render();
  });
}
function boot(){
  var h=location.hash.slice(1),t=TABS.filter(function(x){return x.hash===h})[0];if(t)state.tab=t.id;
  loadSettings();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(function(){});
  render();
  if(!window.firebase||!window.FIREBASE_CONFIG||/PASTE/.test(window.FIREBASE_CONFIG.apiKey||'')){
    state.error='Chưa cấu hình Firebase. Mở firebase-config.js và dán thông tin dự án vào.';render();return;
  }
  firebase.initializeApp(window.FIREBASE_CONFIG);
  fbAuth=firebase.auth();fbDb=firebase.firestore();
  try{fbDb.enablePersistence({synchronizeTabs:true}).catch(function(){})}catch(e){}
  fbAuth.onAuthStateChanged(function(u){
    if(u){startDb(u);return}
    try{unsub&&unsub()}catch(e){}
    unsub=null;me=null;ro=false;viewOther=false;document.body.classList.remove('ro');state.months={};state.loaded=false;state.error=null;clearTimeout(loadTimer);render();showLogin();
  });
}
boot();
})();
