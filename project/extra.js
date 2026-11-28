/* ===== Klasemen mingguan + status turnamen per sesi + hotbar saat scroll =====
   Dimuat SEBELUM app.js. Semua fungsi memakai variabel global app.js (ALL, S, ADM, tab, save, render, calc, esc, toast, SESI)
   hanya saat dipanggil, jadi urutan muat aman. Data mingguan disimpan di ALL.wk sehingga ikut tersinkron lewat Supabase. */

var WK_NOTE='Note: Top 10 team yang berada di klasemen akan mendapatkan free FT one day yang dimulai setiap hari Sabtu/Minggu malam dan free FT 3k 2x.';
var wkAll=false,wkRc=false;

function WK(){
  var w=ALL.wk;if(!w||typeof w!='object')w=ALL.wk={};
  if(w.on===undefined)w.on=true;
  if(!w.pt)w.pt={k:1,r:2,j1:10,j2:6,j3:3};
  if(w.note===undefined)w.note=WK_NOTE;
  if(!w.sv)w.sv={};
  return w}

/* ---- sesi dianggap "sudah dibuat" jika admin sudah mengisi nama tim atau ada hasil match ---- */
function sesCreated(j){
  var d=ALL.d&&ALL.d[j];if(!d)return false;
  return (d.teams||[]).some(function(t){return(t.n||'').trim()})||Object.keys(d.res||{}).some(function(m){return Object.keys(d.res[m]).length})}
function noTour(){
  return'<div class="card nott"><h2>TURNAMENT BELUM DI BUAT</h2><p class="m">Sesi '+esc(ALL.cur)+' WIB belum dibuka oleh admin. Pilih jam sesi lain atau cek lagi nanti.</p></div>'}

/* dipanggil dari render() di app.js */
function wkMain(v){
  var ok=ADM||sesCreated(ALL.cur),h=ok?v():noTour();
  if(tab=='atur'&&ADM)h+=wkAdmin();
  else if(tab=='klasemen')h+=wkCard();
  return h}

/* ---- hitung klasemen mingguan dari semua sesi yang sudah disimpan admin ---- */
function nk(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ')}
function wkRows(){
  var w=WK(),T={},p=w.pt,ks=Object.keys(w.sv).sort(function(a,b){return(w.sv[a].t||0)-(w.sv[b].t||0)});
  ks.forEach(function(k){(w.sv[k].r||[]).forEach(function(x){
    var key=nk(x[0]);if(!key)return;
    var t=T[key]||(T[key]={n:x[0],k:'',kill:0,reg:0,j:[0,0,0]});
    t.n=x[0];if(x[1])t.k=x[1];t.kill+=x[2]||0;t.reg++;
    if(x[3]>=1&&x[3]<=3)t.j[x[3]-1]++})});
  var rows=Object.keys(T).map(function(k){var t=T[k];t.pts=t.kill*(p.k||0)+t.reg*(p.r||0)+t.j[0]*(p.j1||0)+t.j[1]*(p.j2||0)+t.j[2]*(p.j3||0);return t});
  rows.sort(function(a,b){return b.pts-a.pts||b.j[0]-a.j[0]||b.kill-a.kill||b.reg-a.reg||(a.n<b.n?-1:1)});
  return rows.slice(0,50)}
function wkDate(d){var q=String(d||'').split('-');try{return new Date(+q[0],+q[1]-1,+q[2]).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}catch(e){return d}}
function wkPeriod(){
  var w=WK(),ds=Object.keys(w.sv).map(function(k){return w.sv[k].d}).sort();
  if(!ds.length)return'';
  return ds[0]==ds[ds.length-1]?wkDate(ds[0]):wkDate(ds[0])+' – '+wkDate(ds[ds.length-1])}

/* ---- tampilan publik ---- */
function wkCard(){
  var w=WK();if(!w.on&&!ADM)return'';
  var rows=wkRows(),show=wkAll?rows:rows.slice(0,10);
  var h='<div class="card wkc"><div class="lbh"><h2>Klasemen Mingguan<small class="m" style="display:block;font-weight:500;font-size:12px">Top '+(wkAll?'50':'10')+' team · poin dari klasemen harian</small></h2><span class="m">'+esc(wkPeriod())+'</span></div>';
  if(ADM&&!w.on)h+='<div class="wkoff">NONAKTIF · tidak tampil di publik</div>';
  if(!rows.length)h+='<div class="empty">Belum ada data klasemen mingguan.</div>';
  else{
    h+='<div class="wkt" data-lenis-prevent><table><thead><tr><th>NO</th><th>TEAM // NICK</th><th>KILL</th><th>DAFTAR</th><th>J1</th><th>J2</th><th>J3</th><th>POIN</th></tr></thead><tbody>';
    show.forEach(function(r,i){
      h+='<tr class="'+(i<3?'top':'')+(i>=10?' out':'')+'"><td class="no">'+(i+1)+'</td><td class="tm" title="'+esc(r.n+(r.k?' // '+r.k:''))+'"><span class="tn">'+esc(r.n)+'</span>'+(r.k?'<span class="tk"> // '+esc(r.k)+'</span>':'')+'</td><td>'+r.kill+'</td><td>'+r.reg+'</td><td>'+r.j[0]+'</td><td>'+r.j[1]+'</td><td>'+r.j[2]+'</td><td class="pp">'+r.pts+'</td></tr>'});
    h+='</tbody></table></div>'}
  if(rows.length>10)h+='<div class="acts" style="justify-content:center"><button class="btn ghost" id="wkmore" type="button">'+(wkAll?'Tampilkan 10 teratas':'Lihat semua top team ('+rows.length+')')+'</button></div>';
  var nt=(w.note||'').trim();
  if(nt)h+='<p class="wknote">'+esc(nt).replace(/\n/g,'<br>')+'</p>';
  return h+'</div>'}

/* ---- panel admin (tab Atur) ---- */
function wkAdmin(){
  var w=WK(),p=w.pt;
  var h='<div class="card"><h2>Klasemen mingguan</h2>';
  h+='<div class="acts" style="margin:0 0 10px"><button class="btn'+(w.on?'':' ghost')+'" id="wktog" type="button">Fitur: '+(w.on?'ON':'OFF')+'</button></div>';
  h+='<p class="m">ON = klasemen mingguan tampil di publik. OFF = disembunyikan, data tetap tersimpan.</p>';
  h+='<div class="dh">Sistem poin</div><div class="wkp">'+
    '<div><label>Per kill</label><input type="number" inputmode="numeric" id="wk_pk" value="'+(p.k||0)+'"></div>'+
    '<div><label>Per daftar</label><input type="number" inputmode="numeric" id="wk_pr" value="'+(p.r||0)+'"></div>'+
    '<div><label>Juara 1 (J1)</label><input type="number" inputmode="numeric" id="wk_p1" value="'+(p.j1||0)+'"></div>'+
    '<div><label>Juara 2 (J2)</label><input type="number" inputmode="numeric" id="wk_p2" value="'+(p.j2||0)+'"></div>'+
    '<div><label>Juara 3 (J3)</label><input type="number" inputmode="numeric" id="wk_p3" value="'+(p.j3||0)+'"></div></div>';
  h+='<p class="m">Poin = kill × poin kill + daftar × poin daftar + J1/J2/J3 × poinnya. Perubahan langsung menghitung ulang semua data minggu ini.</p>';
  h+='<div class="dh">Note di bawah klasemen</div><textarea class="wkta" id="wk_note" rows="4" maxlength="400" placeholder="Tulis note untuk publik">'+esc(w.note||'')+'</textarea>';
  var ks=Object.keys(w.sv).sort(function(a,b){return(w.sv[b].t||0)-(w.sv[a].t||0)});
  h+='<div class="dh">Sesi yang sudah disimpan ('+ks.length+')</div>';
  if(!ks.length)h+='<p class="m">Belum ada. Pilih sesi di tab Klasemen lalu tekan "Save to klasemen minggu".</p>';
  ks.slice(0,60).forEach(function(k){var s=w.sv[k];
    h+='<div class="wksv"><span>'+esc(wkDate(s.d))+' · '+esc(s.s)+' WIB · '+(s.r||[]).length+' tim</span><button class="btn danger sm" data-wkdel="'+esc(k)+'" type="button">Hapus</button></div>'});
  h+='<div class="acts" style="margin-top:14px"><button class="btn danger" id="wkrst" type="button">Reset klasemen minggu</button></div>';
  h+='<p class="m">Pakai reset saat minggu baru dimulai. Reset turnamen harian tidak menghapus klasemen mingguan.</p></div>';
  return h}

/* ---- simpan klasemen harian (sesi yang sedang dibuka) ke klasemen minggu ---- */
function wkToday(){
  var d=new Date();
  if((ALL.cur=='00.00'||ALL.cur=='01.00')&&d.getHours()<6)d.setDate(d.getDate()-1);
  function z(n){return(n<10?'0':'')+n}
  return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())}
function wkSave(){
  if(!ADM)return;
  var rows=calc();
  if(!rows.some(function(r){return r.mp>0})){toast('Belum ada hasil match di sesi ini');return}
  var R=rows.map(function(r,i){return[r.t.n.trim(),(r.t.k||'').trim(),r.k,(r.mp>0&&i<3)?i+1:0]});
  var w=WK(),sig=JSON.stringify(R),dup=false;
  Object.keys(w.sv).forEach(function(k){var s=w.sv[k];if(s.s==ALL.cur&&JSON.stringify(s.r)==sig)dup=true});
  if(dup){toast('Sesi ini sudah tersimpan, data tidak berubah');return}
  var key=wkToday()+'|'+ALL.cur,upd=!!w.sv[key];
  w.sv[key]={d:wkToday(),s:ALL.cur,t:Date.now(),r:R};
  var ks=Object.keys(w.sv);
  if(ks.length>120){ks.sort(function(a,b){return w.sv[a].t-w.sv[b].t});ks.slice(0,ks.length-120).forEach(function(k){delete w.sv[k]})}
  save();render();
  toast(upd?'Klasemen minggu diperbarui':'Tersimpan ke klasemen minggu')}

document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('button');if(!b)return;var i=b.id;
  if(i=='wkmore'){wkAll=!wkAll;render();return}
  if(!ADM)return;
  if(i=='wksave'){wkSave();return}
  if(i=='wktog'){var w=WK();w.on=!w.on;save();render();toast(w.on?'Klasemen mingguan dinyalakan':'Klasemen mingguan dimatikan');return}
  if(i=='wkrst'){
    if(!wkRc){wkRc=true;toast('Tekan sekali lagi untuk menghapus semua data klasemen minggu');setTimeout(function(){wkRc=false},4000);return}
    wkRc=false;WK().sv={};save();render();toast('Klasemen minggu direset');return}
  if(b.dataset.wkdel){delete WK().sv[b.dataset.wkdel];save();render();toast('Sesi dihapus dari klasemen minggu')}
});
document.addEventListener('input',function(e){
  if(!ADM)return;var id=e.target.id;if(!id||id.indexOf('wk_')!==0)return;var w=WK();
  if(id=='wk_note')w.note=e.target.value.slice(0,400);
  else{var m={wk_pk:'k',wk_pr:'r',wk_p1:'j1',wk_p2:'j2',wk_p3:'j3'}[id];if(!m)return;w.pt[m]=+e.target.value||0}
  save()});

/* ---- hotbar copyright: baru muncul setelah halaman di-scroll ---- */
(function(){
  var on=false;
  function f(){var y=window.pageYOffset||document.documentElement.scrollTop||0,n=y>30;if(n!==on){on=n;document.body.classList.toggle('hb',n)}}
  window.addEventListener('scroll',f,{passive:true});window.addEventListener('resize',f);f()})();
