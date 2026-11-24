/* OCR hasil match Free Fire: baca kill tiap pemain, jumlahkan per tim (4 pemain berdekatan),
   urutkan sebagai placement. Logika parsing murni (tanpa DOM) agar bisa diuji di Node.
   Mesin OCR disuntikkan lewat objek "engine":
     engine.yellow()         -> [{x0,y0,x1,y1}]      kotak tiap angka kuning (kill), dicari lewat warna
     engine.words()          -> [{t,x0,y0,x1,y1,c}]  cadangan bila tidak ada angka kuning: kata hasil baca seluruh gambar
     engine.digits(rect,v)   -> {text,conf}          angka pada kotak rect (varian praproses v)
     engine.text(rect,v)     -> {text,conf}          teks satu baris pada kotak rect
   Gambar ternormalisasi: lebar 1356 px (ZOCR.W). */
(function(root){
var W=1356;
function med(a){if(!a.length)return 0;var s=a.slice().sort(function(x,y){return x-y});var m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2}
function mean(a){return a.reduce(function(x,y){return x+y},0)/a.length}
/* token "Kill" yang sudah jelas / token yang mirip (salah baca) */
function strictKill(t){var s=String(t).replace(/[^A-Za-z0-9|!]/g,'');return /^[0-9OoIlSsTt]?[Kk][il1|!]{1,3}[ltiI1]?$/.test(s)&&s.length<=6}
function pureKill(t){return /^[Kk][il1|!]{2,3}[lt]?$/.test(String(t).replace(/[^A-Za-z0-9|!]/g,''))}
/* kelompokkan angka 1D: nilai berdekatan (<=tol) jadi satu klaster */
function cluster(vals,tol){var s=vals.slice().sort(function(a,b){return a-b}),g=[];s.forEach(function(v){var l=g[g.length-1];if(l&&v-l[l.length-1]<=tol)l.push(v);else g.push([v])});return g}

/* teks hasil baca "N Kill" -> angka N (huruf l/i/I/| sebelum "K" dianggap angka 1) */
function parseKill(t){var s=String(t||'').replace(/\s+/g,'');var m=s.match(/^([0-9liI|]{1,3}?)[Kk]/)||s.match(/^(\d{1,3})/);if(!m)return null;var d=m[1].replace(/[liI|]/g,'1');return d===''?null:parseInt(d,10)}
/* ---- deteksi angka kuning (kill) lewat warna: tidak bergantung pada tulisan "Kill" ---- */
function yellowPx(r,g,b,smin,vmin){var mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(!mx||mx<vmin)return false;var d=mx-mn;if(d*255<smin*mx)return false;
  var h;if(mx==r)h=60*(((g-b)/d)%6);else if(mx==g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);if(h<0)h+=360;return h>=34&&h<=70}
/* rgba: data piksel (Uint8ClampedArray/Uint8Array), w,h: ukuran. Hasil: kotak tiap angka kuning [{x0,y0,x1,y1}] */
function yellowBoxes(rgba,w,h){
  var n=w*h,m=new Uint8Array(n),i;for(i=0;i<n;i++)if(yellowPx(rgba[4*i],rgba[4*i+1],rgba[4*i+2],150,125))m[i]=1;
  var lab=new Int32Array(n),comps=[],st=[];
  for(i=0;i<n;i++){if(!m[i]||lab[i])continue;var id=comps.length+1,x0=w,y0=h,x1=-1,y1=-1,area=0;lab[i]=id;st.length=0;st.push(i);
    while(st.length){var p=st.pop(),px=p%w,py=(p-px)/w;area++;if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py;
      for(var dy=-1;dy<=1;dy++){var ny=py+dy;if(ny<0||ny>=h)continue;for(var dx=-1;dx<=1;dx++){var nx=px+dx;if(nx<0||nx>=w)continue;var q=ny*w+nx;if(m[q]&&!lab[q]){lab[q]=id;st.push(q)}}}}
    comps.push({x0:x0,y0:y0,x1:x1+1,y1:y1+1,a:area})}
  var c=comps.filter(function(k){var ch=k.y1-k.y0,cw=k.x1-k.x0;return k.a>=6&&ch>=7&&ch<=24&&cw<=ch*1.3+2}).sort(function(a,b){return a.x0-b.x0}),out=[];
  c.forEach(function(b){var hit=null;
    for(var k=0;k<out.length;k++){var g=out[k],mh=Math.max(g.y1-g.y0,b.y1-b.y0),yc=Math.abs((g.y0+g.y1)/2-(b.y0+b.y1)/2),gap=b.x0-g.x1;
      if(yc<=.5*mh&&gap<=.8*mh&&gap>=-mh){hit=g;break}}
    if(hit){hit.x0=Math.min(hit.x0,b.x0);hit.x1=Math.max(hit.x1,b.x1);hit.y0=Math.min(hit.y0,b.y0);hit.y1=Math.max(hit.y1,b.y1)}
    else out.push({x0:b.x0,y0:b.y0,x1:b.x1,y1:b.y1})});
  return out.filter(function(b){return(b.x1-b.x0)<=3.2*(b.y1-b.y0)})}
function setupY(yb){
  if(!yb||yb.length<4)return null;
  var kh=med(yb.map(function(b){return b.y1-b.y0}));if(kh<8)return null;
  var cl=cluster(yb.map(function(b){return b.x0}),kh*.8).map(function(g){return{x:med(g),n:g.length}});
  var mx=Math.max.apply(null,cl.map(function(c){return c.n}));
  var cols=cl.filter(function(c){return c.n>=Math.max(2,mx*.25)}).map(function(c){return c.x}).sort(function(a,b){return a-b});
  if(cols.length<2)return null;
  var anchors=[];
  yb.forEach(function(b){var ci=-1,best=1e9;cols.forEach(function(c,i){var d=Math.abs(b.x0-c);if(d<best){best=d;ci=i}});if(ci<0||best>kh*1.2)return;anchors.push({c:ci,y:(b.y0+b.y1)/2,box:b})});
  return{cols:cols,kh:kh,kw:kh*1.35,anchors:anchors}}
async function analyze(engine,opt){
  opt=opt||{};var notes=[],warn=[],Yd=null,cols,kw,kh,anchors;
  if(engine.yellow)Yd=setupY(await engine.yellow());
  if(Yd){cols=Yd.cols;kw=Yd.kw;kh=Yd.kh;anchors=Yd.anchors}
  else{
    /* cadangan: cari tulisan "Kill" */
    var words=await engine.words();
    var strict=words.filter(function(w){return strictKill(w.t)});
    if(strict.length<4)return{teams:[],notes:notes,error:'Angka kill tidak ditemukan. Pastikan screenshot adalah layar hasil akhir (daftar peringkat tim) dengan angka kill berwarna kuning.'};
    var kws=words.filter(function(w){return pureKill(w.t)}).map(function(w){return w.x1-w.x0});
    kw=kws.length>=3?med(kws):W*.0145;kw=Math.max(12,Math.min(30,kw));
    kh=Math.max(10,med(strict.map(function(w){return w.y1-w.y0})));
    var cl=cluster(strict.map(function(w){return w.x1}),kw*.45).map(function(g){return{x:mean(g),n:g.length}});
    var mx=Math.max.apply(null,cl.map(function(c){return c.n}));
    cols=cl.filter(function(c){return c.n>=Math.max(2,mx*.25)}).map(function(c){return c.x}).sort(function(a,b){return a-b});
    if(cols.length<2)return{teams:[],notes:notes,error:'Susunan kolom tidak terbaca. Coba screenshot yang lebih jelas.'};
    anchors=[];
    words.forEach(function(w){var ci=-1,best=1e9;cols.forEach(function(c,i){var d=Math.abs(w.x1-c);if(d<best){best=d;ci=i}});
      if(ci<0||best>kw*.4||!strictKill(w.t))return;anchors.push({c:ci,y:(w.y0+w.y1)/2})})}
  if(cols.length%2)warn.push('Jumlah kolom pemain ganjil ('+cols.length+'), hasil mungkin tidak lengkap.');
  /* pasangkan kolom: (0,1),(2,3),... lalu bentuk baris & blok (kotak tim: 2 baris x 2 kolom = 4 pemain) */
  var pairs=[];for(var p=0;p+1<cols.length;p+=2)pairs.push([p,p+1]);
  var blocks=[];
  pairs.forEach(function(pr,pi){
    var as=anchors.filter(function(a){return a.c==pr[0]||a.c==pr[1]});
    var rows=cluster(as.map(function(a){return a.y}),kh*.55).map(mean);
    if(!rows.length)return;
    var gaps=[];for(var i=1;i<rows.length;i++)gaps.push(rows[i]-rows[i-1]);
    var intra=gaps.length?Math.min.apply(null,gaps):0,cur=[rows[0]],groups=[];
    for(var i=1;i<rows.length;i++){if(gaps[i-1]>intra*1.25){groups.push(cur);cur=[]}cur.push(rows[i])}
    groups.push(cur);
    groups.forEach(function(g,gi){
      if(g.length==1&&intra>0){
        var prev=groups[gi-1],next=groups[gi+1],dPrev=prev?g[0]-prev[prev.length-1]:1e9,dNext=next?next[0]-g[0]:1e9;
        g=dNext>=dPrev?[g[0],g[0]+intra]:[g[0]-intra,g[0]];
        warn.push('Satu baris pemain tidak terdeteksi, posisinya diperkirakan otomatis. Cek angka kill tim ini.')}
      else if(g.length>2){
        var best=[g[0],g[1]],bd=1e9;
        for(var a=0;a<g.length;a++)for(var c2=a+1;c2<g.length;c2++){var dd=Math.abs((g[c2]-g[a])-intra);if(dd<bd){bd=dd;best=[g[a],g[c2]]}}
        g=best;warn.push('Ada baris tambahan yang diabaikan pada satu kotak tim.')}
      blocks.push({pair:pr,rows:g,pi:pi})})});
  if(!blocks.length)return{teams:[],notes:notes,error:'Blok tim tidak ditemukan.'};
  /* baca angka kill tiap sel */
  var total=0,done=0;blocks.forEach(function(b){total+=b.rows.length*2});
  var cells=[];
  blocks.forEach(function(b,bi){b.rows.forEach(function(y,ri){b.pair.forEach(function(ci,cj){cells.push({b:bi,ri:ri,cj:cj,ci:ci,y:y})})})});
  for(var q=0;q<cells.length;q++){
    var cell=cells[q],r=cols[cell.ci],votes=[];
    if(Yd){
      /* kotak angka kuning sudah diketahui: baca langsung (varian 2 = hanya piksel kuning) */
      var bx=anchors.filter(function(a){return a.c==cell.ci&&a.box&&Math.abs(a.y-cell.y)<kh*.6})[0];bx=bx&&bx.box;
      var rr=bx?{x:bx.x0-2,y:bx.y0-2,w:bx.x1-bx.x0+4,h:bx.y1-bx.y0+4}:{x:r-3,y:cell.y-kh/2-3,w:kh*1.5,h:kh+6};
      var vs=bx?[2,0,1]:[0,1],first=null;
      for(var vi=0;vi<vs.length;vi++){
        var rz=await engine.digits(rr,vs[vi],'d'),pz=parseKill(rz.text);
        if(pz!==null)votes.push({n:pz,w:vs[vi]==2?2:1});
        if(vi==1&&votes.length>=2&&votes[0].n===votes[1].n)break}
    }else{
      var rk={x:r-kw*2.3,y:cell.y-kh*.5-3,w:kw*2.3+3,h:kh+6},rd={x:r-kw*2.3,y:rk.y,w:kw*1.55,h:rk.h};
      for(var v=0;v<2;v++){
        var ra=await engine.digits(rk,v,'k'),rb=await engine.digits(rd,v,'d'),pa=parseKill(ra.text),pb=parseKill(rb.text);
        if(pa!==null)votes.push({n:pa,w:1});if(pb!==null)votes.push({n:pb,w:1});
        if(v==0&&pa!==null&&pa===pb)break}}
    var tally={},tw=0;votes.forEach(function(o){tally[o.n]=(tally[o.n]||0)+o.w;tw+=o.w});
    var pk=null,top=0;votes.forEach(function(o){if(tally[o.n]>top){top=tally[o.n];pk=o.n}});
    cell.conf=tw?Math.round(top/tw*100):0;if(top<2&&tw)cell.conf=Math.min(cell.conf,50);
    cell.k=pk;if(pk!==null&&pk>40)cell.sus=true;
    done++;if(opt.onProgress)opt.onProgress('Membaca kill',done/total*.7+.15)}
  /* nama perwakilan = pemain kiri-atas tiap blok */
  var teams=[];
  for(var bi=0;bi<blocks.length;bi++){
    var b=blocks[bi],mine=cells.filter(function(c){return c.b==bi}),players=[];
    var want=opt.allNames?mine:mine.filter(function(c){return c.ri==0&&c.cj==0});
    var names={};
    for(var j=0;j<want.length;j++){
      var c=want[j],r=cols[c.ci];
      var rc=Yd?{x:r-kw*6,y:c.y-kh*.5-3,w:kw*5.05,h:kh+6}:{x:r-kw*7.6,y:c.y-kh*.5-3,w:kw*4.9,h:kh+6};
      var t=await engine.text(rc,0);names[c.ri+'_'+c.cj]=(t.text||'').replace(/\s+/g,' ').trim()}
    if(opt.onProgress)opt.onProgress('Membaca nama',.85+(bi+1)/blocks.length*.15);
    mine.forEach(function(c){players.push({name:names[c.ri+'_'+c.cj]||'',k:c.k,conf:Math.round(c.conf),sus:!!c.sus,rep:c.ri==0&&c.cj==0})});
    var unread=players.filter(function(p){return p.k===null}).length;
    var kills=players.reduce(function(s,p){return s+(p.k||0)},0);
    var flags=[];
    if(unread)flags.push(unread+' angka kill tidak terbaca (dianggap 0)');
    if(players.some(function(p){return p.sus}))flags.push('ada angka kill yang mencurigakan');
    if(players.length!=4)flags.push('pemain terbaca '+players.length+' dari 4');
    var low=players.filter(function(p){return p.k!==null&&p.conf<70}).length;
    if(low)flags.push(low+' angka kill kurang yakin');
    var rep=players.filter(function(p){return p.rep})[0];
    teams.push({pi:b.pi,y:b.rows[0],rep:rep?rep.name:'',kills:kills,players:players,flags:flags,
      conf:players.length?Math.round(mean(players.map(function(p){return p.conf}))):0})}
  /* placement: pasangan kolom kiri->kanan, lalu atas->bawah */
  teams.sort(function(a,b){return a.pi-b.pi||a.y-b.y});
  var start=opt.startPlace||1;
  teams.forEach(function(t,i){t.place=start+i;delete t.pi;delete t.y});
  return{teams:teams,notes:notes,warn:warn,cols:cols.length,kw:Math.round(kw*10)/10}}

/* kemiripan nama (0..1) untuk mencocokkan nama perwakilan dengan nama tim */
function nn(s){return String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')}
function lev(a,b){var m=a.length,n=b.length;if(!m)return n;if(!n)return m;var p=[],i,j;for(j=0;j<=n;j++)p[j]=j;for(i=1;i<=m;i++){var c=[i];for(j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]==b[j-1]?0:1));p=c}return p[n]}
function sim(a,b){a=nn(a);b=nn(b);if(!a||!b)return 0;if(a==b)return 1;if(a.length>=3&&b.length>=3&&(a.indexOf(b)>=0||b.indexOf(a)>=0))return .9;return 1-lev(a,b)/Math.max(a.length,b.length)}

var API={analyze:analyze,sim:sim,W:W,strictKill:strictKill,yellowBoxes:yellowBoxes,yellowPx:yellowPx};

/* ===== bagian browser: mesin Tesseract.js + klien AI vision opsional ===== */
if(typeof document!=='undefined'){
var TESS='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
function loadScript(src){return new Promise(function(res,rej){if(root.Tesseract)return res();var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=function(){rej(new Error('script gagal dimuat'))};document.head.appendChild(s)})}
function loadImg(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){URL.revokeObjectURL(u);res(im)};im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('gambar tidak terbaca'))};im.src=u})}
/* abu-abu + regangkan kontras (persentil cut%) langsung pada canvas */
function gs(c,cut){var g=c.getContext('2d'),id=g.getImageData(0,0,c.width,c.height),d=id.data,n=d.length/4,hist=new Uint32Array(256),i,y;
  for(i=0;i<n;i++){y=(d[4*i]*299+d[4*i+1]*587+d[4*i+2]*114)/1000|0;d[4*i]=y;hist[y]++}
  var k=n*cut/100,a=0,lo=0,hi=255;for(i=0;i<256;i++){a+=hist[i];if(a>=k){lo=i;break}}a=0;for(i=255;i>=0;i--){a+=hist[i];if(a>=k){hi=i;break}}
  var sp=Math.max(1,hi-lo);for(i=0;i<n;i++){var q=(d[4*i]-lo)/sp*255;q=q<0?0:q>255?255:q;d[4*i]=d[4*i+1]=d[4*i+2]=q}
  g.putImageData(id,0,0)}
/* potong kotak, perbesar 4x, regangkan kontras, (v=1: Otsu), balik jadi teks gelap di latar putih */
function prep(base,r,v){
  var sx=Math.max(0,Math.round(r.x)),sy=Math.max(0,Math.round(r.y)),sw=Math.max(2,Math.min(base.width-sx,Math.round(r.w))),sh=Math.max(2,Math.min(base.height-sy,Math.round(r.h)));
  var F=4,B=20,c=document.createElement('canvas');c.width=sw*F+2*B;c.height=sh*F+2*B;
  var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(base,sx,sy,sw,sh,B,B,sw*F,sh*F);
  var id=g.getImageData(B,B,sw*F,sh*F),d=id.data,n=d.length/4,hist=new Uint32Array(256),i,y,gray=new Uint8Array(n);
  if(v==2){for(i=0;i<n;i++){var yv=yellowPx(d[4*i],d[4*i+1],d[4*i+2],110,110)?0:255;d[4*i]=d[4*i+1]=d[4*i+2]=yv;d[4*i+3]=255}g.putImageData(id,B,B);return c}  /* varian 2: hanya piksel kuning jadi teks hitam */
  for(i=0;i<n;i++){y=(d[4*i]*299+d[4*i+1]*587+d[4*i+2]*114)/1000|0;gray[i]=y;hist[y]++}
  var k=n*.02,a=0,lo=0,hi=255;for(i=0;i<256;i++){a+=hist[i];if(a>=k){lo=i;break}}a=0;for(i=255;i>=0;i--){a+=hist[i];if(a>=k){hi=i;break}}
  var sp=Math.max(1,hi-lo),st=new Uint8Array(n);for(i=0;i<n;i++){var q=(gray[i]-lo)/sp*255;st[i]=q<0?0:q>255?255:q}
  var thr=127;
  if(v==1){var h2=new Uint32Array(256),sum=0,sB=0,wB=0,mx=0;for(i=0;i<n;i++)h2[st[i]]++;for(i=0;i<256;i++)sum+=i*h2[i];
    for(i=0;i<256;i++){wB+=h2[i];if(!wB)continue;var wF=n-wB;if(!wF)break;sB+=i*h2[i];var mB=sB/wB,mF=(sum-sB)/wF,bt=wB*wF*(mB-mF)*(mB-mF);if(bt>mx){mx=bt;thr=i}}}
  for(i=0;i<n;i++){var val=v==1?(st[i]>thr?255:0):st[i];val=255-val;d[4*i]=d[4*i+1]=d[4*i+2]=val;d[4*i+3]=255}
  g.putImageData(id,B,B);return c}
async function makeEngine(file,opt){
  var pg=(opt&&opt.onProgress)||function(){};
  var im=await loadImg(file),base=document.createElement('canvas');
  base.width=W;base.height=Math.max(1,Math.round(im.naturalHeight*W/im.naturalWidth));
  var g=base.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(im,0,0,base.width,base.height);
  pg('Memuat mesin OCR',.01);await loadScript(TESS);
  var worker=await root.Tesseract.createWorker('eng',1,{logger:function(m){if(m&&/load|initiali/i.test(m.status||''))pg('Menyiapkan OCR',.01+(m.progress||0)*.05)}});
  var cur='';
  async function mode(m,psm){var key=m+psm;if(cur===key)return;cur=key;await worker.setParameters({tessedit_pageseg_mode:psm,tessedit_char_whitelist:m=='d'?'0123456789':m=='k'?'0123456789Kil':''})}
  async function rec(c){var r=await worker.recognize(c);return r.data||{}}
  return{
    info:{w:im.naturalWidth,h:im.naturalHeight},
    yellow:async function(){var d=base.getContext('2d').getImageData(0,0,base.width,base.height);return yellowBoxes(d.data,base.width,base.height)},
    words:async function(){
      var out=[],passes=[[1,'11',false],[1,'6',false],[2,'11',true]];
      for(var i=0;i<passes.length;i++){var P=passes[i],c=document.createElement('canvas');c.width=W*P[0];c.height=base.height*P[0];
        var cg=c.getContext('2d');cg.imageSmoothingQuality='high';cg.drawImage(base,0,0,c.width,c.height);if(P[2])gs(c,1);
        await mode('t',P[1]);var d=await rec(c);
        (d.words||[]).forEach(function(w){var t=(w.text||'').trim();if(!t||w.confidence<20||!w.bbox)return;out.push({t:t,x0:w.bbox.x0/P[0],y0:w.bbox.y0/P[0],x1:w.bbox.x1/P[0],y1:w.bbox.y1/P[0],c:w.confidence})});
        pg('Membaca tata letak',.06+(i+1)/passes.length*.09)}
      return out},
    digits:async function(r,v,m){await mode(m||'d','7');var d=await rec(prep(base,r,v||0));return{text:(d.text||'').trim(),conf:d.confidence||0}},
    text:async function(r,v){await mode('t','7');var d=await rec(prep(base,r,v||0));return{text:(d.text||'').trim(),conf:d.confidence||0}},
    close:function(){try{worker.terminate()}catch(e){}}}}
/* opsional: Supabase Edge Function yang memanggil AI vision (lihat supabase/functions/ocr-scan) */
async function aiScan(file,cfg){
  var im=await loadImg(file),sc=Math.min(1,1600/im.naturalWidth),c=document.createElement('canvas');
  c.width=Math.round(im.naturalWidth*sc);c.height=Math.round(im.naturalHeight*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  var r=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.token,'apikey':cfg.anon||''},body:JSON.stringify({image:c.toDataURL('image/jpeg',.88)})});
  var j=null;try{j=await r.json()}catch(e){}
  if(!r.ok||!j||!Array.isArray(j.teams))throw new Error((j&&j.error)||('HTTP '+r.status));
  var teams=j.teams.map(function(t,i){
    var pl=(t.players||[]).slice(0,4).map(function(p,x){var k=Math.round(+p.kills);return{name:String(p.name||'').trim(),k:isFinite(k)&&k>=0?k:null,conf:100,sus:false,rep:x==0}});
    var fl=[];if(pl.length!=4)fl.push('pemain terbaca '+pl.length+' dari 4');if(pl.some(function(p){return p.k===null}))fl.push('ada angka kill tidak terbaca');
    return{place:Math.round(+t.place)||i+1,rep:pl.length?pl[0].name:'',kills:pl.reduce(function(s,p){return s+(p.k||0)},0),players:pl,flags:fl,conf:100}});
  teams.sort(function(a,b){return a.place-b.place});
  return{teams:teams,dim:im.naturalWidth+'×'+im.naturalHeight}}
API.makeEngine=makeEngine;API.aiScan=aiScan;
}
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.ZOCR=API;
})(typeof window!=='undefined'?window:globalThis);
