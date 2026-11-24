var KEY='zhxin-ft-poin-v1',tab='klasemen',cur=0;
var PRIZE=['PP 14.000','PP 7.000','PP 5.000'];
var MAPS=['Bermuda','Purgatory','Kalahari','Alpine','Nextera','Solara'];
var SESI=['14.00','15.00','16.00','19.00','20.00','21.00','22.00','23.00','00.00','01.00'],HK='zhxin-ft-hero-v1';
function def(){return{teams:Array.from({length:12},function(_,i){return{id:i+1,n:'',k:''}}),maps:['Bermuda','Purgatory','Kalahari','Bermuda','Purgatory','Kalahari'],res:{},pts:[12,9,8,7,6,5,4,3,2,1,0,0],kp:1}}
var ALL=null;
try{ALL=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(ALL&&ALL.teams){var o0=ALL;delete o0.tm;ALL={cur:SESI[0],d:{}};ALL.d[SESI[0]]=o0}
if(!ALL||!ALL.d)ALL={cur:SESI[0],d:{}};
if(SESI.indexOf(ALL.cur)<0)ALL.cur=SESI[0];
function ses(){if(!ALL.d[ALL.cur])ALL.d[ALL.cur]=def();return ALL.d[ALL.cur]}
var S=ses();
function save(){try{localStorage.setItem(KEY,JSON.stringify(ALL))}catch(e){}if(typeof qpush=='function')qpush()}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(t){var el=document.getElementById('toast');el.textContent=t;el.className='toast on';setTimeout(function(){el.className='toast'},1800)}
function calc(){
  var rows=S.teams.filter(function(t){return t.n.trim()}).map(function(t){
    var r={t:t,pts:0,k:0,b:0,mp:0};
    S.maps.forEach(function(_,m){var x=(S.res[m]||{})[t.id];if(x&&x.p>0){r.pts+=(S.pts[x.p-1]||0)+(x.k||0)*S.kp;r.k+=x.k||0;if(x.p==1)r.b++;r.mp++}});
    return r});
  rows.sort(function(a,b){return b.pts-a.pts||b.b-a.b||b.k-a.k});
  return rows}
function mpts(m,id){var x=(S.res[m]||{})[id];return x&&x.p>0?(S.pts[x.p-1]||0)+(x.k||0)*S.kp:0}
function nav(){
  var T=[['klasemen','Klasemen'],['match','Input'],['tim','Tim'],['atur','Atur']];var nv=document.getElementById('nav');nv.style.display=ADM?'':'none';if(!ADM)T=[];
  document.getElementById('nav').innerHTML=T.map(function(x){return'<button role="tab" aria-selected="'+(tab==x[0])+'" data-t="'+x[0]+'">'+x[1]+'</button>'}).join('')}
function viewKlasemen(){
  var rows=calc(),done=Object.keys(S.res).filter(function(m){return Object.keys(S.res[m]).length}).length;
  var h='<div class="card lbc"><div class="lbh"><h2>Klasemen · '+ALL.cur+'</h2><span class="m">'+done+'/'+S.maps.length+' match<button class="sndb" id="sndt" type="button" aria-label="Efek suara" title="Efek suara">'+(SND?'\ud83d\udd0a':'\ud83d\udd07')+'</button></span></div>';
  if(!rows.length)h+='<div class="empty">Belum ada tim. Isi nama tim di tab Tim.</div>';
  else{h+='<ol class="lbl">';
    rows.forEach(function(r,i){h+='<li class="'+(i<3?'top':'')+'"><span class="no">'+(i+1)+'</span><span class="nm"><span class="nt">'+esc(r.t.n)+(r.t.k?'<small>'+esc(r.t.k)+'</small>':'')+'</span></span><span class="kl">'+r.k+' K'+(r.b?' · '+r.b+'B':'')+'</span><span class="pt">'+r.pts+'</span></li>'});
    h+='</ol>'}
  h+='<div class="acts"><button class="btn" id="cp">Salin untuk WhatsApp</button></div></div>';
  return h}
function viewMatch(){
  var res=S.res[cur]||{},used={};
  Object.keys(res).forEach(function(id){var p=res[id].p;if(p>0)used[p]=(used[p]||0)+1});
  var h='<div class="chips">'+S.maps.map(function(_,i){return'<button class="chip" aria-pressed="'+(i==cur)+'" data-m="'+i+'">Match '+(i+1)+'</button>'}).join('')+'</div>';
  h+='<div class="card"><h2>Match '+(cur+1)+'</h2><div class="row" style="grid-template-columns:auto 1fr"><span class="m">Map</span><select id="map">'+MAPS.map(function(m){return'<option'+(m==S.maps[cur]?' selected':'')+'>'+m+'</option>'}).join('')+'</select></div>';
  h+=scanCard();
  var ts=S.teams.filter(function(t){return t.n.trim()});
  if(!ts.length)h+='<div class="empty">Isi nama tim dulu di tab Tim.</div>';
  else{h+='<div class="row r3 m"><span>Tim</span><span>Posisi</span><span>Kill</span><span class="p">Poin</span></div>';
    ts.forEach(function(t){var x=res[t.id]||{p:0,k:0};
      h+='<div class="row r3"><div>'+esc(t.n)+'</div><select data-p="'+t.id+'" class="'+(x.p>0&&used[x.p]>1?'dup':'')+'"><option value="0">–</option>'+S.teams.map(function(_,i){return'<option value="'+(i+1)+'"'+(x.p==i+1?' selected':'')+'>#'+(i+1)+'</option>'}).join('')+'</select><input type="number" min="0" inputmode="numeric" data-k="'+t.id+'" value="'+(x.k||0)+'"><div class="p" id="pt'+t.id+'">'+mpts(cur,t.id)+'</div></div>'});
    h+='<div class="m">Posisi yang dipakai dua tim ditandai merah.</div>'}
  return h+'</div>'}
function viewTim(){
  var h=bulkCard()+'<div class="card"><h2>Daftar tim ('+S.teams.filter(function(t){return t.n.trim()}).length+'/'+S.teams.length+')</h2>';
  S.teams.forEach(function(t,i){h+='<div class="row r4"><span class="m">'+(i+1)+'</span><input data-n="'+i+'" placeholder="Nama tim" value="'+esc(t.n)+'"><input data-nk="'+i+'" placeholder="Nickname" value="'+esc(t.k)+'"></div>'});
  return h+'<div class="acts" style="align-items:center"><span class="m">Slot tim</span><button class="btn ghost" id="dect" aria-label="Kurangi slot">−</button><b>'+S.teams.length+'</b><button class="btn ghost" id="addt" aria-label="Tambah slot">+</button></div></div>'}
function viewAtur(){
  var h='<div class="card"><h2>Nama turnamen</h2><input id="tname" maxlength="30" placeholder="ZHXIN FT" value="'+esc(TT())+'"><p class="m">Tampil di judul halaman dan teks WhatsApp.</p></div><div class="card"><h2>Slogan &amp; deskripsi</h2><input id="sl" maxlength="40" placeholder="Good Game, Good Friend ✦" value="'+esc(ALL.slogan||'')+'"><input id="dsc" maxlength="120" placeholder="Deskripsi, misal: Mode squad, 12 slot, main event 14.00–01.00 WIB" value="'+esc(ALL.desc||'')+'" style="margin-top:8px"><p class="m">Slogan tampil di atas judul, deskripsi di bawahnya. Kosongkan untuk kembali ke teks bawaan.</p></div><div class="card"><h2>Tombol WhatsApp (kontak)</h2><input id="wal" placeholder="Link WhatsApp atau nomor, mis. https://wa.me/6281234567890" value="'+esc(ALL.wa||'')+'"><p class="m">Tombol hijau muncul di pojok kanan bawah dan membuka chat/grup WhatsApp ini. Bisa diisi link wa.me, link grup chat.whatsapp.com, atau nomor (08xx otomatis jadi 628xx). Kosongkan untuk menyembunyikan.</p></div><div class="card"><h2>Poin placement</h2><div class="sc">';
  S.pts.forEach(function(p,i){h+='<div><label>#'+(i+1)+'</label><input type="number" inputmode="numeric" data-sp="'+i+'" value="'+p+'"></div>'});
  h+='<div><label>Per kill</label><input type="number" inputmode="numeric" id="kp" value="'+S.kp+'"></div></div><p class="m">Bawaan: 12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0 dan 1 poin per kill. Urutan tie: poin, booyah, kill.</p></div>';
  h+='<div class="card"><h2>Jumlah match</h2><div class="acts" style="margin:0"><button class="btn ghost" id="mm">−</button><b style="align-self:center">'+S.maps.length+'</b><button class="btn ghost" id="mp">+</button></div></div>';
  h+='<div class="card"><h2>Akun admin</h2><p class="m">Masuk sebagai '+esc(adm().email||'')+'.</p><p class="m">'+(sb?'Sinkronisasi online aktif: perubahan langsung terlihat oleh semua orang.':'Mode lokal: Supabase belum diisi, data hanya di perangkat ini.')+'</p><div class="acts" style="margin-top:0"><button class="btn ghost" id="aout">Keluar</button></div></div>';
  h+='<div class="card"><h2>Gambar header</h2><p class="m">Pakai gambar Fern pilihanmu (JPG/PNG). Disimpan di perangkat ini saja.</p><div class="thumb" id="thm"></div><div class="acts"><input type="file" id="himg" accept="image/*" style="max-width:240px"><button class="btn ghost" id="hrs">Kembalikan bawaan</button></div></div>';
  if(rconf)h+='<div class="card dup"><h2>Reset turnamen?</h2><p class="m">Semua sesi, tim, match, dan hasil akan dihapus lalu dimulai dari awal. Tindakan ini tidak bisa dibatalkan. Gambar header tidak ikut terhapus.</p><div class="acts"><button class="btn danger" id="rsy">Ya, reset semua</button><button class="btn ghost" id="rsc">Batal</button></div></div>';
  else h+='<div class="card"><h2>Hapus data</h2><p class="m">Menghapus semua tim, match, dan hasil di semua sesi, lalu mengulang turnamen dari awal.</p><button class="btn danger" id="rst">Reset turnamen</button></div>';
  return h}
function sesNav(){document.getElementById('sch').innerHTML=SESI.map(function(j){var d=ALL.d[j],has=d&&Object.keys(d.res).some(function(m){return Object.keys(d.res[m]).length});return'<button class="chip" aria-pressed="'+(j==ALL.cur)+'" data-s="'+j+'">'+j+(has?' •':'')+'</button>'}).join('')}
function render(){if(!ADM&&tab!='klasemen')tab='klasemen';chk();wab();requestAnimationFrame(fx);sesNav();nav();hm();ttl();adb();var v={klasemen:viewKlasemen,match:viewMatch,tim:viewTim,atur:viewAtur}[tab];document.getElementById('main').innerHTML=v();if(tab=='atur'){try{var q=localStorage.getItem(HK);if(q)setHero(q)}catch(e){}}}
function hm(){var e=document.getElementById('hm'),t=document.getElementById('tg');if(e)e.textContent=(ALL.desc||'').trim()||'Mode squad, '+S.teams.length+' slot, main event setiap hari 14.00–01.00 WIB';if(t)t.textContent=(ALL.slogan||'').trim()||'Good Game, Good Friend ✦'}
function setHero(u){var h=document.getElementById('hero'),t=document.getElementById('thm');
  if(u){h.style.setProperty('--himg','url("'+u+'")');h.classList.add('cu');if(t)t.style.backgroundImage='url("'+u+'")'}
  else{h.classList.remove('cu');h.style.removeProperty('--himg');if(t)t.style.backgroundImage=''}}
try{var hv=localStorage.getItem(HK);if(hv)setHero(hv)}catch(e){}
function waText(){var r=calc(),t='*'+TT()+' — KLASEMEN '+ALL.cur+' WIB*\n';r.forEach(function(x,i){t+=(i+1)+'. '+x.t.n+' — '+x.pts+' poin ('+x.k+' kill)\n'});return t}
document.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  if(b.id=='sndt'){SND=!SND;try{localStorage.setItem('zhxin-ft-snd',SND?'1':'0')}catch(x){}if(SND)snd(true);render();return}
  if(admClick(b))return;
  if(b.dataset.s){ALL.cur=b.dataset.s;S=ses();cur=0;save();render();return}
  if(b.dataset.t){tab=b.dataset.t;rconf=false;render();window.scrollTo(0,0);return}
  if(b.dataset.m){cur=+b.dataset.m;render();return}
  if(b.id=='cp'){var t=waText();try{navigator.clipboard.writeText(t).then(function(){toast('Klasemen disalin')},function(){toast('Gagal menyalin')})}catch(x){toast('Gagal menyalin')}return}
  if(b.id=='addt'){if(S.teams.length<30){S.teams.push({id:Date.now(),n:'',k:''});while(S.pts.length<S.teams.length)S.pts.push(0);save();render()}else toast('Maksimal 30 slot');return}
  if(b.id=='dect'){if(S.teams.length<=1){toast('Minimal 1 slot');return}
    var lt=S.teams[S.teams.length-1];if(lt.n.trim()&&dconf!==lt.id){dconf=lt.id;toast('Slot terakhir berisi data. Tekan − lagi untuk menghapus');return}dconf=0;
    S.teams.pop();Object.keys(S.res).forEach(function(m){delete S.res[m][lt.id];Object.keys(S.res[m]).forEach(function(id){if(S.res[m][id].p>S.teams.length)S.res[m][id].p=0})});save();render();return}
  if(b.id=='hrs'){try{localStorage.removeItem(HK)}catch(x){}setHero(null);toast('Gambar bawaan dipulihkan');return}
  if(b.id=='mp'){if(S.maps.length<20){S.maps.push('Bermuda');save();render()}return}
  if(b.id=='mm'){if(S.maps.length>1){var l=S.maps.length-1;S.maps.pop();delete S.res[l];if(cur>=S.maps.length)cur=S.maps.length-1;save();render()}return}
  if(b.id=='rst'){rconf=true;render();return}
  if(b.id=='rsc'){rconf=false;render();return}
  if(b.id=='rsy'){rconf=false;ALL={cur:SESI[0],d:{},title:ALL.title,slogan:ALL.slogan,desc:ALL.desc,wa:ALL.wa};S=ses();cur=0;tab='klasemen';scmsg='';save();render();window.scrollTo(0,0);toast('Turnamen direset dari awal')}
});
document.addEventListener('input',function(e){
  var d=e.target.dataset;
  if(d.n!==undefined){S.teams[d.n].n=e.target.value}
  else if(d.nk!==undefined){S.teams[d.nk].k=e.target.value}
  else if(d.sp!==undefined){S.pts[d.sp]=+e.target.value||0}
  else if(e.target.id=='tname'){ALL.title=e.target.value.slice(0,30);ttl()}
  else if(e.target.id=='sl'){ALL.slogan=e.target.value.slice(0,40);hm()}
  else if(e.target.id=='dsc'){ALL.desc=e.target.value.slice(0,120);hm()}
  else if(e.target.id=='kp'){S.kp=+e.target.value||0}
  else if(d.k!==undefined){S.res[cur]=S.res[cur]||{};var x=S.res[cur][d.k]=S.res[cur][d.k]||{p:0,k:0};x.k=Math.max(0,+e.target.value||0);document.getElementById('pt'+d.k).textContent=mpts(cur,d.k);chk()}
  else return;
  save()});
document.addEventListener('change',function(e){
  if(e.target.id=='map'){S.maps[cur]=e.target.value;save();return}
  if(e.target.id=='wal'){ALL.wa=e.target.value.trim().slice(0,200);save();wab();toast(waUrl(ALL.wa)?'Tombol WhatsApp disimpan':(ALL.wa?'Link atau nomor WhatsApp tidak dikenali':'Tombol WhatsApp disembunyikan'));return}
  if(e.target.id=='himg'){heroFile(e.target.files[0]);return}
  if(e.target.dataset.p!==undefined){S.res[cur]=S.res[cur]||{};var x=S.res[cur][e.target.dataset.p]=S.res[cur][e.target.dataset.p]||{p:0,k:0};x.p=+e.target.value;save();render()}
});
function heroFile(f){if(!f)return;var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){
  var w=Math.min(1000,im.width),c=document.createElement('canvas');c.width=w;c.height=Math.round(im.height*w/im.width);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  var u=c.toDataURL('image/jpeg',.82);try{localStorage.setItem(HK,u)}catch(x){toast('Gambar terlalu besar untuk disimpan');}setHero(u);toast('Gambar header diganti')};
  im.onerror=function(){toast('Gambar tidak terbaca')};im.src=r.result};r.readAsDataURL(f)}
var scmsg='',busy=false,rconf=false,dconf=0;
var ADM=false,AK='zhxin-ft-admin-v1',amode='';
try{ADM=sessionStorage.getItem('zhxin-adm')=='1'}catch(e){}
function adm(){return{email:'bladezxin01@gmail.com',salt:'b593727342e9a819d70d3b61a3d977ac',hash:'93a18edd43c7ab81212a5c7fe930f507c34a90c76ab36fc62bfdf364ffa8ea91'}}
if(ADM&&!adm().hash)ADM=false;
function TT(){return(ALL.title||'').trim()||'ZHXIN FT'}
function ttl(){var h=document.getElementById('ttl');if(h)h.textContent=TT();document.title=TT()+' — Penghitung Poin'}
function adb(){var b=document.getElementById('adb');if(b)b.textContent=ADM?'Keluar admin':'Admin'}
function vv(id){var e=document.getElementById(id);return e?e.value:''}
function hx(b){return Array.from(new Uint8Array(b)).map(function(x){return('0'+x.toString(16)).slice(-2)}).join('')}
function rs(){var a=new Uint8Array(16);crypto.getRandomValues(a);return hx(a)}
async function hsh(pw,salt){var k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);return hx(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},k,256))}
function cls(){var m=document.getElementById('amod');if(m)m.remove()}
function amod(mode){cls();amode=mode;var a=adm(),h='<div class="amod" id="amod" data-lenis-prevent><div class="card amc"><h2>'+(mode=='login'?'Masuk admin':mode=='setup'?'Buat akun admin':'Ubah akun admin')+'</h2>';
  if(mode=='setup')h+='<div class="m">Belum ada akun admin. Buat email dan password, lalu simpan baik-baik.</div>';
  if(mode=='change')h+='<input id="a_old" type="password" placeholder="Password lama" autocomplete="current-password">';
  h+='<input id="a_em" type="email" placeholder="Email admin" autocomplete="username" value="'+esc(mode=='change'?(a.email||''):'')+'"><input id="a_pw" type="password" placeholder="'+(mode=='login'?'Password':'Password baru (min. 6 karakter)')+'" autocomplete="'+(mode=='login'?'current-password':'new-password')+'">';
  if(mode!='login')h+='<input id="a_pw2" type="password" placeholder="Ulangi password" autocomplete="new-password">';
  h+='<div class="aer" id="a_er"></div><div class="acts" style="margin:0"><button class="btn" id="amok">'+(mode=='login'?'Masuk':'Simpan')+'</button><button class="btn ghost" id="amcl">Batal</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend',h);setTimeout(function(){var f=document.getElementById(mode=='change'?'a_old':'a_em');if(f)f.focus()},30)}
function login(){ADM=true;try{sessionStorage.setItem('zhxin-adm','1')}catch(e){}cls();render();toast('Mode admin aktif')}
function logout(){if(sb){try{sb.auth.signOut()}catch(e){}}ADM=false;try{sessionStorage.removeItem('zhxin-adm')}catch(e){}tab='klasemen';render();toast('Keluar dari mode admin')}
var M=window.Motion,RM=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches,fxd=false,mld='';
function fx(){if(!M||!ANIM)return;try{var a=Array.from(document.querySelectorAll('#main .card'+(fxd?'':', #dash .card')));fxd=true;
  if(a.length)M.animate(a,{opacity:[0,1],y:[16,0]},{duration:.45,delay:M.stagger(.07),ease:'easeOut'});
  var r=Array.from(document.querySelectorAll('#main .lbl li'));
  if(r.length)M.animate(r,{opacity:[0,1],x:[-8,0]},{duration:.35,delay:M.stagger(.03,{startDelay:.15})})}catch(e){}}
function hov(sel,ov,ou){
  document.addEventListener('pointerover',function(e){if(!M||!ANIM||e.pointerType!='mouse')return;var t=e.target.closest&&e.target.closest(sel);if(t&&!t.contains(e.relatedTarget)){try{M.animate(t,ov,{duration:.2})}catch(x){}}});
  document.addEventListener('pointerout',function(e){if(!M||!ANIM||e.pointerType!='mouse')return;var t=e.target.closest&&e.target.closest(sel);if(t&&!t.contains(e.relatedTarget)){try{M.animate(t,ou,{duration:.25})}catch(x){}}})}
hov('#main .card, #dash .card',{y:-3},{y:0});
hov('.btn, .chip, nav button',{scale:1.04},{scale:1});
hov('.lbl li',{x:3},{x:0});
document.addEventListener('pointerdown',function(e){if(!M||!ANIM)return;var t=e.target.closest&&e.target.closest('.btn, .chip, .mbtn');if(t){try{M.animate(t,{scale:.95},{duration:.1})}catch(x){}}});
var SND=true,ac=null,lT=null,lK='';
try{SND=localStorage.getItem('zhxin-ft-snd')!='0'}catch(e){}
function snd(up){if(!SND)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state=='suspended')ac.resume();var n=ac.currentTime,f=up?[660,880]:[440,330];f.forEach(function(q,i){var o=ac.createOscillator(),g=ac.createGain(),t=n+i*.09;o.type='sine';o.frequency.value=q;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.18)})}catch(e){}}
function chk(){var t=0;try{calc().forEach(function(r){t+=r.pts})}catch(e){return}if(lK===ALL.cur&&lT!==null&&t!==lT)snd(t>lT);lK=ALL.cur;lT=t;dash()}
function st(v,l){return'<div class="stt"><b>'+v+'</b><span>'+l+'</span></div>'}
function dash(){var e=document.getElementById('dash');if(!e)return;
  var rows=calc(),kill=0,mx=1,tot=S.maps.length;
  rows.forEach(function(r){kill+=r.k;mx=Math.max(mx,r.pts)});
  var dn=S.maps.map(function(_,m){return S.res[m]&&Object.keys(S.res[m]).length?1:0}),dc=dn.reduce(function(a,b){return a+b},0);
  var nm=rows.filter(function(r){return r.t.n.trim()}),nt=nm.length;
  var h='<div class="card dsh"><div class="lbh"><h2>Dashboard</h2><span class="m">Sesi '+ALL.cur+' WIB</span></div><div class="stg">'+st(dc+'/'+tot,'Match selesai')+st(nt+'/'+S.teams.length,'Tim terisi')+st(kill,'Total kill')+st(nm.length?nm[0].pts:0,'Poin tertinggi')+'</div>';
  h+='<div class="dh">Posisi teratas</div>';
  if(!nm.length)h+='<div class="m">Belum ada tim.</div>';
  nm.slice(0,3).forEach(function(r,i){h+='<div class="pr"><span class="no">'+(i+1)+'</span><span class="nt">'+esc(r.t.n)+'</span><span class="pt">'+r.pts+'</span><div class="bar"><i style="width:'+Math.round(r.pts/mx*100)+'%"></i></div></div>'});
  h+='<div class="dh">Progres match</div><div class="mps">'+dn.map(function(d,m){return'<span class="mp'+(d?' ok':'')+'" title="'+esc(S.maps[m])+'">'+(m+1)+'</span>'}).join('')+'</div></div>';
  e.innerHTML=h}
var abusy=false;
async function asub(){if(abusy)return;var er=document.getElementById('a_er');function bad(t){if(er)er.textContent=t}
  if(!window.crypto||!crypto.subtle){bad('Browser ini tidak mendukung penyimpanan password yang aman.');return}
  var em=vv('a_em').trim().toLowerCase(),pw=vv('a_pw'),a=adm();
  if(!/^\S+@\S+\.\S+$/.test(em)){bad('Email tidak valid.');return}
  abusy=true;
  try{
    if(amode=='login'){if(sb){var rr=await sb.auth.signInWithPassword({email:em,password:pw});if(rr.error){bad('Email atau password salah.');abusy=false;return}login();pull(true);abusy=false;return}if(em!=a.email||(await hsh(pw,a.salt))!=a.hash){bad('Email atau password salah.');abusy=false;return}login()}
    else{
      if(amode=='change'&&(await hsh(vv('a_old'),a.salt))!=a.hash){bad('Password lama salah.');abusy=false;return}
      if(pw.length<6){bad('Password minimal 6 karakter.');abusy=false;return}
      if(pw!=vv('a_pw2')){bad('Konfirmasi password tidak sama.');abusy=false;return}
      var sl=rs();localStorage.setItem(AK,JSON.stringify({email:em,salt:sl,hash:await hsh(pw,sl)}));login()}
  }catch(e){bad('Gagal menyimpan. Coba lagi.')}
  abusy=false}
function admClick(b){var i=b.id;
  if(i=='adb'){if(ADM)logout();else amod('login');return true}
  if(i=='aout'){logout();return true}
  if(i=='achg'){amod('change');return true}
  if(i=='amok'){asub();return true}
  if(i=='amcl'){cls();return true}
  return false}
/* ---- Supabase: login admin + sinkronisasi real-time ---- */
var sb=null,CID=Math.random().toString(36).slice(2),pTm=null,rtc=null,lastJ='';
(function(){var c=window.ZHXIN_CONFIG||{};if(c.supabaseUrl&&c.supabaseAnonKey&&window.supabase){try{sb=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true}})}catch(e){sb=null}}})();
if(sb)ADM=false;
function qpush(){if(!sb||!ADM)return;clearTimeout(pTm);pTm=setTimeout(push,700)}
async function push(){if(!sb||!ADM)return;var o=JSON.parse(JSON.stringify(ALL));o._by=CID;try{var r=await sb.from('ft_state').upsert({id:'main',data:o,updated_at:new Date().toISOString()});if(r.error)toast('Gagal sinkron: '+r.error.message)}catch(e){toast('Gagal sinkron ke server')}}
function applyRemote(d,first){var j=JSON.stringify(d);if(j===lastJ)return;lastJ=j;var c=ALL.cur;ALL=JSON.parse(j);delete ALL._by;if(!ALL.d)ALL.d={};nologo();ALL.cur=SESI.indexOf(c)>=0?c:SESI[0];S=ses();if(first)lT=null;try{localStorage.setItem(KEY,JSON.stringify(ALL))}catch(e){}if(cur>=S.maps.length)cur=0;render()}
async function pull(first){if(!sb)return;try{var r=await sb.from('ft_state').select('data').eq('id','main').maybeSingle();if(r.error)throw r.error;if(r.data&&r.data.data&&r.data.data.d)applyRemote(r.data.data,first);else if(ADM)push()}catch(e){}}
function sub(){if(!sb||rtc)return;try{rtc=sb.channel('ft-main').on('postgres_changes',{event:'*',schema:'public',table:'ft_state'},function(p){var d=p&&p.new&&p.new.data;if(d&&d._by!==CID)applyRemote(d,false)}).subscribe()}catch(e){}}
if(sb){sb.auth.getSession().then(function(r){if(r&&r.data&&r.data.session){ADM=true;pull(true);render()}});pull(true);sub();setInterval(function(){if(!ADM)pull(false)},15000)}
document.addEventListener('keydown',function(e){if(e.key=='Escape')cls();if(e.key=='Enter'&&e.target.closest&&e.target.closest('#amod'))asub()});
/* ================= v6: animasi on/off, WhatsApp, isi tim massal, scan OCR ================= */
/* ---- animasi ---- */
var ANIM=!RM,ls=null;
try{var a0=localStorage.getItem('zhxin-ft-anim');if(a0!==null)ANIM=a0=='1'}catch(e){}
function lenisOn(){if(ls||!window.Lenis||!ANIM)return;try{var l=new Lenis({lerp:.1});ls=l;var raf=function(t){if(ls!==l)return;l.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf)}catch(e){ls=null}}
function lenisOff(){if(!ls)return;try{ls.destroy()}catch(e){}ls=null}
function applyAnim(){
  document.body.classList.toggle('noanim',!ANIM);
  document.querySelectorAll('svg').forEach(function(v){try{ANIM?v.unpauseAnimations():v.pauseAnimations()}catch(e){}});
  if(ANIM)lenisOn();else lenisOff();
  var b=document.getElementById('animb');if(b){b.textContent='Animasi: '+(ANIM?'Nyala':'Mati');b.setAttribute('aria-pressed',ANIM?'true':'false')}}
/* ---- WhatsApp ---- */
function waUrl(u){u=(u||'').trim();if(!u)return'';
  u=u.replace(/^http:\/\//i,'https://');
  if(/^(?:wa\.me|chat\.whatsapp\.com|api\.whatsapp\.com|(?:www\.)?whatsapp\.com)\//i.test(u))u='https://'+u;
  if(/^https:\/\/(?:wa\.me|chat\.whatsapp\.com|api\.whatsapp\.com|(?:www\.)?whatsapp\.com)\/[^\s"'<>]+$/i.test(u))return u;
  var d=u.replace(/[\s().\-]/g,'');if(d.charAt(0)=='+')d=d.slice(1);
  if(/^\d{8,15}$/.test(d)){if(d.charAt(0)=='0')d='62'+d.slice(1);else if(d.charAt(0)=='8'&&d.length<=12)d='62'+d;return'https://wa.me/'+d}
  return''}
function wab(){var b=document.getElementById('mbtn');if(!b)return;var u=waUrl(ALL.wa);b.style.display=(u||ADM)?'grid':'none';b.setAttribute('href',u||'#')}
/* ---- isi nama tim sekaligus ---- */
var bulkTxt='',bulkRep=false,cconf=false;
function splitTeams(t){
  t=String(t||'').replace(/\r/g,'');
  var L=t.split('\n').map(function(x){return x.trim()}).filter(Boolean);
  if(L.length==1){
    if((L[0].match(/(?:^|\s)\d{1,2}[\.\)]\s/g)||[]).length>=2)L=L[0].split(/\s*(?:^|\s)\d{1,2}[\.\)]\s+/).filter(Boolean);
    else if(/[,;\t|]/.test(L[0]))L=L[0].split(/\s*[,;\t|]\s*/)}
  var num=L.length>1&&L.every(function(x){return/^\(?\d{1,2}\s+\S/.test(x)});
  var seen={},out=[];
  L.forEach(function(x){
    x=x.replace(/^\(?\d{1,2}\s*[\.\)\]:]\s*/,'').replace(/^[-•*·]\s+/,'');
    if(num)x=x.replace(/^\(?\d{1,2}\s+/,'');
    x=x.replace(/\s+/g,' ').trim().slice(0,40);if(!x)return;
    var k=x.toLowerCase();if(seen[k])return;seen[k]=1;out.push(x)});
  return out}
function bulkPv(){var n=splitTeams(bulkTxt);
  if(!n.length)return'<span class="m" style="border:0;background:none">Tempel daftar tim di atas, hasil pemisahan tampil di sini.</span>';
  return n.slice(0,30).map(function(x,i){return'<span><b>'+(i+1)+'</b>'+esc(x)+'</span>'}).join('')+(n.length>30?'<span class="m">+'+(n.length-30)+' lagi (maks. 30 tim)</span>':'')}
function bulkCard(){return'<div class="card"><h2>Isi nama tim sekaligus</h2><div class="bulk"><textarea id="bulk" placeholder="Tempel daftar tim di sini, satu tim per baris.&#10;Nomor urut (1. / 2) / 3 -), tanda koma, titik koma, atau tab dipisah otomatis.">'+esc(bulkTxt)+'</textarea><div class="pv" id="bulkpv">'+bulkPv()+'</div><label class="m"><input type="checkbox" id="bulkrep" style="width:auto"'+(bulkRep?' checked':'')+'> Ganti semua nama yang sudah ada (bukan hanya mengisi slot kosong)</label><div class="acts"><button class="btn" id="bulkgo" type="button">Isi ke daftar tim</button><button class="btn ghost" id="bulkclr" type="button">Kosongkan semua nama</button></div></div></div>'}
function growTeams(len){while(S.teams.length<len&&S.teams.length<30)S.teams.push({id:Date.now()+S.teams.length,n:'',k:''});while(S.pts.length<S.teams.length)S.pts.push(0)}
function bulkApply(){
  var n=splitTeams(bulkTxt);if(!n.length){toast('Belum ada nama untuk diisi');return}
  var cut=0;if(n.length>30){cut=n.length-30;n=n.slice(0,30)}
  var slots=[];
  if(bulkRep){S.teams.forEach(function(t){t.n=''});growTeams(n.length);S.teams.forEach(function(_,i){slots.push(i)})}
  else{S.teams.forEach(function(t,i){if(!t.n.trim())slots.push(i)});var need=n.length-slots.length;if(need>0){var s0=S.teams.length;growTeams(s0+need);for(var i=s0;i<S.teams.length;i++)slots.push(i)}}
  var used=0;n.forEach(function(nm,i){if(slots[i]===undefined)return;S.teams[slots[i]].n=nm;used++});
  bulkTxt='';save();render();toast(used+' tim terisi'+(cut?', '+cut+' dilewati (maks. 30)':'')+(used<n.length?', '+(n.length-used)+' tidak muat':''))}
/* logo tim sudah dihapus: bersihkan sisa data lama */
function nologo(){try{Object.keys(ALL.d||{}).forEach(function(k){(ALL.d[k].teams||[]).forEach(function(t){delete t.l})})}catch(e){}}
nologo();
/* ---- scan OCR ---- */
var OCR=null,ocrAll=false;
function ocrPts(t){return(S.pts[t.place-1]||0)+(t.kills||0)*S.kp}
function scanCard(){
  var h='<div class="scan"><b>Scan screenshot hasil (AI OCR)</b><div class="m">Pilih screenshot layar hasil akhir match. Kill 4 pemain tiap tim dijumlahkan otomatis, peringkat dibaca dari urutan tim (kolom kiri atas ke bawah, lalu kolom kanan). Periksa hasilnya sebelum diterapkan.</div><input type="file" id="shots" accept="image/*" multiple>';
  h+='<label class="m"><input type="checkbox" id="ocrall" style="width:auto"'+(ocrAll?' checked':'')+'> Baca juga nama keempat pemain (lebih lambat)</label>';
  h+='<button class="btn" id="scan" type="button"'+(busy?' disabled':'')+'>'+(busy?'Memproses...':'Scan dan analisis')+'</button><div class="ocrbar"><i id="ocrbar"></i></div><div class="m" id="scst">'+esc(scmsg)+'</div></div>';
  if(OCR&&OCR.m===cur)h+=ocrPanel();
  return h}
function ocrMatch(R){
  var cand=S.teams.filter(function(t){return t.n.trim()}),pairs=[];
  R.teams.forEach(function(t,i){t.tid=0;cand.forEach(function(c){var sc=Math.max(ZOCR.sim(t.rep,c.n),c.k?ZOCR.sim(t.rep,c.k):0);if(sc>=.62)pairs.push({i:i,id:c.id,s:sc})})});
  pairs.sort(function(a,b){return b.s-a.s});var ui={},ut={};
  pairs.forEach(function(p){if(ui[p.i]||ut[p.id])return;ui[p.i]=1;ut[p.id]=1;R.teams[p.i].tid=p.id});
  /* baris yang tidak cocok: jika masih ada tim bernama yang belum terpakai, minta admin memilih (-2); jika tidak ada, buat tim baru (0) */
  var free=cand.filter(function(c){return!ut[c.id]}).length;
  R.teams.forEach(function(t){if(!t.tid)t.tid=free?-2:0})}
function ocrSum(){
  var R=OCR,ts=R.teams.filter(function(t){return t.tid!==-1});
  if(!ts.length)return{html:'Belum ada tim yang dipakai.',text:''};
  var rows=ts.map(function(t){return{n:(t.rep||'').trim()||('Tim peringkat '+t.place),p:t.place,k:t.kills||0,pt:ocrPts(t),pl:t.players}}).sort(function(a,b){return a.p-b.p});
  var L=[],tk=0;rows.forEach(function(r){tk+=r.k});
  rows.slice(0,3).forEach(function(r){L.push('Juara '+r.p+': '+r.n+' — '+r.pt+' poin ('+r.k+' kill)')});
  var mk=Math.max.apply(null,rows.map(function(r){return r.k})),hk=rows.filter(function(r){return r.k==mk});
  L.push('Kill tim terbanyak: '+hk.map(function(r){return r.n}).join(', ')+' ('+mk+' kill)');
  var mp=Math.max.apply(null,rows.map(function(r){return r.pt})),hp=rows.filter(function(r){return r.pt==mp});
  if(hp.indexOf(rows[0])<0)L.push('Poin tertinggi: '+hp.map(function(r){return r.n}).join(', ')+' ('+mp+' poin)');
  var bp=null;rows.forEach(function(r){(r.pl||[]).forEach(function(p,j){if(p.k!==null&&p.k!==undefined&&(!bp||p.k>bp.k))bp={k:p.k,n:(p.name||'').trim()||('pemain '+(j+1)+' tim '+r.n)}})});
  if(bp&&bp.k>0)L.push('Kill pemain tertinggi: '+bp.n+' ('+bp.k+' kill)');
  L.push('Total kill match: '+tk+' dari '+rows.length+' tim (rata-rata '+(tk/rows.length).toFixed(1)+' per tim)');
  var z=rows.filter(function(r){return r.k==0}).length;if(z)L.push(z+' tim tanpa kill');
  return{html:'<ul>'+L.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul>',text:'*RINGKASAN MATCH '+(cur+1)+' — '+TT()+' '+ALL.cur+' WIB*\n'+L.join('\n')}}
function ocrPanel(){
  var R=OCR,h='<div class="ocr" id="ocrp">',tot=R.teams.length,pl=0,ok=0,cf=[],chk2=0;
  R.teams.forEach(function(t){pl+=t.players.length;t.players.forEach(function(p){if(p.k!==null&&p.k!==undefined)ok++});if(R.engine=='ocr')cf.push(t.conf);if(t.flags&&t.flags.length)chk2++});
  var avg=cf.length?Math.round(cf.reduce(function(a,b){return a+b},0)/cf.length):null;
  h+='<div><h3>Informasi yang terdeteksi</h3><div class="ocrinfo">Mesin: <b>'+(R.engine=='ai'?'AI vision':'OCR di browser')+'</b> · Gambar: <b>'+R.files+'</b> file'+(R.dim?' ('+R.dim+')':'')+'<br>Tim terdeteksi: <b>'+tot+'</b> · Pemain terbaca: <b>'+ok+'/'+pl+'</b>'+(R.cols?' · Kolom pemain: <b>'+R.cols+'</b>':'')+(avg!==null?' · Keyakinan angka: <b>'+avg+'%</b>':'')+'<br>'+(chk2?'<b style="color:var(--warn)">'+chk2+' tim perlu dicek</b> (ada angka kosong atau kurang yakin).':'Semua angka terbaca jelas.')+(R.warn&&R.warn.length?'<br>'+esc(R.warn.filter(function(x,i,a){return a.indexOf(x)==i}).join(' ')):'')+'<br>Peringkat dibaca dari urutan tim. Nama di baris adalah pemain kiri-atas tiap tim (perwakilan); ubah bila perlu.</div></div>';
  h+='<div><h3>Hasil per tim</h3><div class="ocrh"><span>#</span><span>Perwakilan / tim</span><span>Kill</span><span style="text-align:right">Poin</span></div><div class="ocrt">';
  var used={};R.teams.forEach(function(t){if(t.tid>0)used[t.tid]=(used[t.tid]||0)+1});
  R.teams.forEach(function(t,i){
    var dup=t.tid>0&&used[t.tid]>1,pick=t.tid==-2,bad=dup||pick||(t.flags&&t.flags.length);
    h+='<div class="ocrr'+(bad?' bad':'')+'" data-orow="'+i+'"><input type="number" min="1" max="30" inputmode="numeric" data-op="'+i+'" value="'+t.place+'" aria-label="Peringkat"><input data-on="'+i+'" value="'+esc(t.rep||'')+'" placeholder="Nama perwakilan" aria-label="Nama perwakilan"><div class="tk" id="otk'+i+'">'+t.kills+'</div><div class="pt" id="opt'+i+'">'+ocrPts(t)+'</div>';
    h+='<select data-os="'+i+'" style="grid-column:2/-1" class="'+(dup||pick?'dup':'')+'">'+(pick?'<option value="-2" selected>— Pilih tim —</option>':'')+'<option value="0"'+(t.tid==0?' selected':'')+'>Buat tim baru dari nama ini</option>'+S.teams.filter(function(x){return x.n.trim()}).map(function(x){return'<option value="'+x.id+'"'+(t.tid==x.id?' selected':'')+'>'+esc(x.n)+'</option>'}).join('')+'<option value="-1"'+(t.tid==-1?' selected':'')+'>Lewati baris ini</option></select>';
    h+='<div class="pl">'+t.players.map(function(p,j){return'<input type="number" min="0" inputmode="numeric" data-ok="'+i+'_'+j+'" value="'+(p.k===null||p.k===undefined?'':p.k)+'" placeholder="?" title="'+esc(p.name||('Pemain '+(j+1)))+'" aria-label="Kill pemain '+(j+1)+'">'}).join('')+'</div>';
    if(dup)h+='<div class="fl">Tim ini dipilih lebih dari sekali.</div>';
    if(pick)h+='<div class="fl">Pilih tim untuk baris ini, atau pilih "Buat tim baru" / "Lewati".</div>';
    if(t.flags&&t.flags.length)h+='<div class="fl">'+esc(t.flags.join('; '))+'</div>';
    h+='</div>'});
  h+='</div><div class="m">Empat kotak kecil = kill tiap pemain; total tim dan poin ikut berubah saat diedit. Poin = poin placement + kill × poin per kill.</div></div>';
  h+='<div><h3>Ringkasan hasil pertandingan</h3><div class="ocrsum" id="ocrsum">'+ocrSum().html+'</div></div>';
  h+='<div class="acts" style="margin:0"><button class="btn" id="ocrap" type="button">Terapkan ke Match '+(cur+1)+'</button><button class="btn ghost" id="ocrcp" type="button">Salin ringkasan</button><button class="btn ghost" id="ocrx" type="button">Tutup</button></div></div>';
  return h}
function ocrApply(){
  var R=OCR;if(!R)return;var seen={},pl={},bad='';
  R.teams.forEach(function(t){if(t.tid===-1)return;if(t.tid===-2){bad='Pilih tim untuk setiap baris dulu';return}if(t.tid>0){if(seen[t.tid])bad='Satu tim dipilih lebih dari sekali';seen[t.tid]=1}
    if(!(t.place>=1&&t.place<=30))bad='Peringkat harus 1 sampai 30';if(pl[t.place])bad='Ada peringkat yang sama dua kali';pl[t.place]=1});
  if(bad){toast(bad);return}
  var res={},n=0,made=0,skip=0;
  R.teams.forEach(function(t){if(t.tid===-1)return;var id=t.tid;
    if(!id){var slot=S.teams.filter(function(x){return!x.n.trim()&&!seen[x.id]})[0];
      if(!slot){if(S.teams.length>=30){skip++;return}growTeams(S.teams.length+1);slot=S.teams[S.teams.length-1]}
      slot.n=(t.rep||'').trim()||('Tim '+t.place);seen[slot.id]=1;id=slot.id;made++}
    else{var tm=S.teams.filter(function(x){return x.id==id})[0];if(tm&&!String(tm.k||'').trim()&&(t.rep||'').trim())tm.k=t.rep.trim()}  /* simpan nama perwakilan sebagai nickname agar scan berikutnya otomatis cocok */
    res[id]={p:t.place,k:t.kills||0};n++});
  S.res[cur]=res;OCR=null;scmsg='Hasil scan diterapkan ke Match '+(cur+1)+': '+n+' tim'+(made?', '+made+' tim baru dibuat':'')+(skip?', '+skip+' dilewati (slot penuh)':'')+'.';
  save();render();toast('Hasil diterapkan ke Match '+(cur+1))}
function setProg(l,f){f=Math.max(0,Math.min(1,f));var st=document.getElementById('scst'),b=document.getElementById('ocrbar');if(st)st.textContent=l+'… '+Math.round(f*100)+'%';if(b)b.style.width=Math.round(f*100)+'%'}
async function scan(){
  if(busy)return;var inp=document.getElementById('shots'),f=inp?Array.from(inp.files).slice(0,4):[];
  if(!f.length){toast('Pilih screenshot dulu');return}
  busy=true;OCR=null;scmsg='Menyiapkan…';render();
  var cfg=window.ZHXIN_CONFIG||{},all=[],warn=[],eng='ocr',cols=0,dim='',errs=[];
  try{
    for(var i=0;i<f.length;i++){
      var base=i/f.length,span=1/f.length,done=false;
      if(cfg.aiOcrUrl&&sb&&ADM){
        try{setProg('Membaca dengan AI',base+span*.3);
          var ses0=await sb.auth.getSession(),tok=ses0&&ses0.data&&ses0.data.session&&ses0.data.session.access_token;
          if(!tok)throw new Error('belum login');
          var r0=await ZOCR.aiScan(f[i],{url:cfg.aiOcrUrl,token:tok,anon:cfg.supabaseAnonKey});
          r0.teams.forEach(function(t){t.place=all.length+t.place});all=all.concat(r0.teams);eng='ai';dim=r0.dim;done=true}
        catch(e){errs.push('AI tidak bisa dipakai ('+(e&&e.message||'error')+'), beralih ke OCR biasa.')}}
      if(!done){
        var en=await ZOCR.makeEngine(f[i],{onProgress:function(l,x){setProg(l,base+span*x)}});
        try{var r=await ZOCR.analyze(en,{allNames:ocrAll,startPlace:all.length+1,onProgress:function(l,x){setProg(l,base+span*x)}});
          if(r.error){errs.push(f[i].name+': '+r.error)}else{all=all.concat(r.teams);warn=warn.concat(r.warn||[]);cols=Math.max(cols,r.cols||0);dim=en.info.w+'×'+en.info.h}}
        finally{en.close()}}}
    if(!all.length){busy=false;scmsg=errs.join(' ')||'Tidak ada tim yang terbaca. Coba screenshot yang lebih jelas.';render();return}
    OCR={m:cur,engine:eng,files:f.length,dim:dim,cols:cols,warn:warn.concat(errs),teams:all};ocrMatch(OCR);
    busy=false;scmsg=all.length+' tim terbaca. Periksa hasilnya, lalu tekan Terapkan.';render()
  }catch(e){busy=false;var m=e&&e.message||'';scmsg='Scan gagal'+(/script|Failed to fetch|NetworkError|load/i.test(m)?' (mesin OCR tidak bisa diunduh, cek koneksi internet)':'')+'. Coba lagi atau isi manual.';try{console.error(e)}catch(x){}render()}}
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('#mbtn');
  if(a&&!waUrl(ALL.wa)){e.preventDefault();toast(ADM?'Isi link WhatsApp di tab Atur':'Kontak WhatsApp belum diatur');return}
  var b=e.target.closest&&e.target.closest('button');if(!b)return;var i=b.id;
  if(i=='animb'){ANIM=!ANIM;try{localStorage.setItem('zhxin-ft-anim',ANIM?'1':'0')}catch(x){}applyAnim();toast(ANIM?'Animasi dinyalakan':'Animasi dimatikan');return}
  if(i=='bulkgo'){bulkApply();return}
  if(i=='bulkclr'){if(!cconf){cconf=true;toast('Tekan sekali lagi untuk mengosongkan semua nama');setTimeout(function(){cconf=false},4000);return}
    cconf=false;S.teams.forEach(function(t){t.n=''});save();render();toast('Semua nama tim dikosongkan');return}
  if(i=='scan'){scan();return}
  if(i=='ocrap'){ocrApply();return}
  if(i=='ocrx'){OCR=null;scmsg='';render();return}
  if(i=='ocrcp'&&OCR){var t=ocrSum().text;try{navigator.clipboard.writeText(t).then(function(){toast('Ringkasan disalin')},function(){toast('Gagal menyalin')})}catch(x){toast('Gagal menyalin')}return}
});
document.addEventListener('input',function(e){
  var el=e.target,d=el.dataset;
  if(el.id=='bulk'){bulkTxt=el.value;var pv=document.getElementById('bulkpv');if(pv)pv.innerHTML=bulkPv();return}
  if(!OCR)return;
  function upd(i){var t=OCR.teams[i];t.kills=t.players.reduce(function(s,p){return s+(p.k||0)},0);var a=document.getElementById('otk'+i),b=document.getElementById('opt'+i);if(a)a.textContent=t.kills;if(b)b.textContent=ocrPts(t);var sm=document.getElementById('ocrsum');if(sm)sm.innerHTML=ocrSum().html}
  if(d.on!==undefined){OCR.teams[+d.on].rep=el.value;var sm=document.getElementById('ocrsum');if(sm)sm.innerHTML=ocrSum().html}
  else if(d.op!==undefined){OCR.teams[+d.op].place=Math.round(+el.value)||0;upd(+d.op)}
  else if(d.ok!==undefined){var q=d.ok.split('_'),t=OCR.teams[+q[0]],p=t.players[+q[1]];p.k=el.value===''?null:Math.max(0,Math.round(+el.value)||0);upd(+q[0])}
});
document.addEventListener('change',function(e){
  var el=e.target;
  if(el.id=='ocrall'){ocrAll=el.checked;return}
  if(el.id=='bulkrep'){bulkRep=el.checked;return}
  if(OCR&&el.dataset.os!==undefined){OCR.teams[+el.dataset.os].tid=+el.value;render()}
});
applyAnim();
render();
