(function(){
"use strict";
var SITE = location.origin + location.pathname.replace(/index\.html$/,'');
var OR='#fa5000', BG='#0e0e0e', BLUE='#74aad8', YEL='#ffbe5b', GRN='#2ecc71', RED='#ff4d4d';
function $(id){return document.getElementById(id);}
function mk(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function img(src){return new Promise(function(res){var i=new Image();i.onload=function(){res(i)};i.onerror=function(){res(null)};i.src=src;});}
function rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
var MARK=null, WORD=null;

/* ---------- backgrounds & drawing helpers ---------- */
function grid(ctx,W,H,step,a){ctx.save();ctx.strokeStyle='rgba(255,255,255,'+(a||.05)+')';ctx.lineWidth=2;ctx.beginPath();for(var x=0;x<=W;x+=step){ctx.moveTo(x,0);ctx.lineTo(x,H);}for(var y=0;y<=H;y+=step){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();ctx.restore();}
function glow(ctx,x,y,r,col){var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function dark(ctx,W,H){ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);glow(ctx,W*.85,0,W*.6,'rgba(250,80,0,.28)');glow(ctx,0,H*.7,W*.5,'rgba(116,170,216,.12)');grid(ctx,W,H,W/15);}
function orange(ctx,W,H){var g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ff6a1f');g.addColorStop(1,'#e04400');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);grid(ctx,W,H,W/15,.08);}
function label(ctx,txt,x,y,size,col,align,weight){ctx.save();ctx.font=(weight||700)+' '+size+'px BDO, sans-serif';ctx.fillStyle=col;ctx.textAlign=align||'center';ctx.textBaseline='middle';ctx.fillText(txt,x,y);ctx.restore();}
function pill(ctx,txt,x,y,size,bg,fg){ctx.save();ctx.font='800 '+size+'px BDO, sans-serif';var w=ctx.measureText(txt).width+size*1.4,h=size*1.8;rr(ctx,x-w/2,y-h/2,w,h,h/2);ctx.fillStyle=bg;ctx.fill();ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,x,y+size*.05);ctx.restore();}
function line(ctx,pts,col,w){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();pts.forEach(function(p,i){i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.stroke();ctx.restore();}
function drawMark(ctx,x,y,s,a){if(!MARK)return;ctx.save();ctx.globalAlpha=a==null?1:a;ctx.drawImage(MARK,x,y,s,s);ctx.restore();}
function heart(ctx,x,y,s,fill,stroke,sw){ctx.save();ctx.translate(x,y);ctx.scale(s/100,s/100);ctx.beginPath();ctx.moveTo(0,30);ctx.bezierCurveTo(-50,-5,-35,-55,0,-25);ctx.bezierCurveTo(35,-55,50,-5,0,30);ctx.closePath();if(stroke){ctx.lineWidth=sw*100/s;ctx.strokeStyle=stroke;ctx.lineJoin='round';ctx.stroke();}ctx.fillStyle=fill;ctx.fill();ctx.restore();}
function arrowUp(ctx,cx,top,w,h,col,stroke,sw){ctx.save();ctx.beginPath();ctx.moveTo(cx,top);ctx.lineTo(cx+w/2,top+w*.55);ctx.lineTo(cx+w*.2,top+w*.55);ctx.lineTo(cx+w*.2,top+h);ctx.lineTo(cx-w*.2,top+h);ctx.lineTo(cx-w*.2,top+w*.55);ctx.lineTo(cx-w/2,top+w*.55);ctx.closePath();if(stroke){ctx.lineWidth=sw;ctx.strokeStyle=stroke;ctx.lineJoin='round';ctx.stroke();}ctx.fillStyle=col;ctx.fill();ctx.restore();}
function chartUp(ctx,x,y,w,h,col){var pts=[],n=9;for(var i=0;i<=n;i++){var t=i/n;pts.push([x+t*w,y+h-(t*t*.8+.1)*h+(i%2?h*.05:-h*.03)]);}var g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'rgba(46,204,113,.35)');g.addColorStop(1,'rgba(46,204,113,0)');ctx.save();ctx.beginPath();pts.forEach(function(p,i){i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.restore();line(ctx,pts,col||GRN,w*.012);return pts;}
function face(ctx,x,y,r,col){ctx.save();ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.fillStyle='#0e0e0e';rr(ctx,x-r*.72,y-r*.28,r*.62,r*.34,r*.12);ctx.fill();rr(ctx,x+r*.1,y-r*.28,r*.62,r*.34,r*.12);ctx.fill();ctx.fillRect(x-r*.12,y-r*.2,r*.24,r*.08);ctx.lineWidth=r*.09;ctx.strokeStyle='#0e0e0e';ctx.lineCap='round';ctx.beginPath();ctx.arc(x,y+r*.25,r*.32,.25,Math.PI-.25);ctx.stroke();ctx.restore();}

/* ---------- meme templates (all original, drawn in code) ---------- */
var C='classic', B='brand';
var TEMPLATES=[
 {id:'beforeafter',name:'Me before / after Catalyst',draw:function(ctx,W,H){
   ctx.fillStyle='#262626';ctx.fillRect(0,0,W,H/2);grid(ctx,W,H/2,W/15,.04);
   var p=[];for(var i=0;i<=14;i++)p.push([W*.08+i*W*.06,H*.33+Math.sin(i*1.9)*H*.06+(i%3?H*.03:-H*.05)]);line(ctx,p,RED,9);
   ['?','?!','??','?'].forEach(function(q,i){label(ctx,q,W*(.15+i*.23),H*(.22+(i%2)*.18),70,'rgba(255,255,255,.22)')});
   ctx.save();ctx.beginPath();ctx.rect(0,H/2,W,H/2);ctx.clip();dark(ctx,W,H);ctx.restore();
   chartUp(ctx,W*.08,H*.66,W*.7,H*.27);drawMark(ctx,W*.78,H*.7,W*.16);
   ctx.fillStyle=OR;ctx.fillRect(0,H/2-4,W,8);
   pill(ctx,'BEFORE',W*.12,H*.46,26,'rgba(255,255,255,.12)','#bbb');pill(ctx,'AFTER',W*.11,H*.955,26,OR,'#fff');
 },boxes:[{t:'Me before Catalyst',x:.5,y:.1,s:84},{t:'Me after Catalyst',x:.5,y:.6,s:84}]},
 {id:'invite',name:'Waiting for my invite code',draw:function(ctx,W,H){
   dark(ctx,W,H);var bx=W*.12,bw=W*.76,by=H*.47,bh=H*.09;
   rr(ctx,bx,by,bw,bh,bh/2);ctx.fillStyle='#1f1f1f';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='rgba(255,255,255,.15)';ctx.stroke();
   rr(ctx,bx+10,by+10,(bw-20)*.99,bh-20,(bh-20)/2);ctx.fillStyle=OR;ctx.fill();
   label(ctx,'99%',W/2,by+bh+70,64,'#fff',null,800);label(ctx,'research preview · waitlist',W/2,by+bh+130,34,'#9a958e',null,500);
   for(var i=0;i<8;i++){var a=i/8*Math.PI*2;ctx.fillStyle='rgba(250,80,0,'+(.15+i*.1)+')';ctx.beginPath();ctx.arc(W/2+Math.cos(a)*44,H*.33+Math.sin(a)*44,11,0,7);ctx.fill();}
 },boxes:[{t:'Waiting for my Catalyst invite code',x:.5,y:.12,s:80},{t:'any day now...',x:.5,y:.9,s:80}]},
 {id:'believe',name:'What do you believe?',draw:function(ctx,W,H){
   orange(ctx,W,H);ctx.save();ctx.fillStyle='#fff';ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=30;ctx.shadowOffsetY=12;rr(ctx,W*.1,H*.12,W*.8,H*.5,70);ctx.fill();
   ctx.beginPath();ctx.moveTo(W*.3,H*.6);ctx.lineTo(W*.22,H*.76);ctx.lineTo(W*.44,H*.6);ctx.fill();ctx.restore();
   face(ctx,W*.2,H*.84,W*.09,'#ffd8c4');
 },boxes:[{t:'What do you believe?',x:.5,y:.37,s:110,st:'ink',w:.7},{t:'How would you trade on it?',x:.62,y:.84,s:62,w:.5}]},
 {id:'whale',name:'Copy-trading the whale',draw:function(ctx,W,H){
   dark(ctx,W,H);var pts=chartUp(ctx,W*.06,H*.3,W*.88,H*.55);
   var wx=W*.68,wy=H*.36;ctx.save();ctx.fillStyle=BLUE;ctx.beginPath();ctx.ellipse(wx,wy,W*.17,H*.09,-.25,0,7);ctx.fill();
   ctx.beginPath();ctx.moveTo(wx-W*.15,wy+H*.04);ctx.lineTo(wx-W*.27,wy-H*.03);ctx.lineTo(wx-W*.25,wy+H*.12);ctx.closePath();ctx.fill();
   ctx.fillStyle='#e6f0fa';ctx.beginPath();ctx.ellipse(wx+W*.02,wy+H*.05,W*.12,H*.035,-.25,0,Math.PI);ctx.fill();
   ctx.fillStyle='#0e0e0e';ctx.beginPath();ctx.arc(wx+W*.1,wy-H*.02,10,0,7);ctx.fill();
   ctx.strokeStyle=BLUE;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(wx+W*.02,wy-H*.1);ctx.quadraticCurveTo(wx,wy-H*.17,wx-W*.04,wy-H*.17);ctx.moveTo(wx+W*.02,wy-H*.1);ctx.quadraticCurveTo(wx+W*.04,wy-H*.17,wx+W*.08,wy-H*.17);ctx.stroke();
   var fx=W*.3,fy=H*.62;ctx.fillStyle=OR;ctx.beginPath();ctx.ellipse(fx,fy,W*.05,H*.028,-.4,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(fx-W*.04,fy+H*.012);ctx.lineTo(fx-W*.085,fy-H*.0);ctx.lineTo(fx-W*.075,fy+H*.05);ctx.closePath();ctx.fill();
   ctx.fillStyle='#0e0e0e';ctx.beginPath();ctx.arc(fx+W*.028,fy-H*.008,5,0,7);ctx.fill();ctx.restore();
   ctx.setLineDash([14,14]);line(ctx,[[fx+W*.07,fy-H*.04],[wx-W*.2,wy+H*.12]],'rgba(255,255,255,.35)',5);ctx.setLineDash([]);
 },boxes:[{t:'Copy-trading the whale',x:.5,y:.1,s:84},{t:'The whale',x:.72,y:.52,s:54},{t:'Me',x:.3,y:.72,s:54},{t:'on Catalyst',x:.5,y:.92,s:70}]},
 {id:'xsignals',name:'X signals: tell Catalyst who to follow',draw:function(ctx,W,H){
   dark(ctx,W,H);var px=W*.27,py=H*.2,pw=W*.46,ph=H*.66;
   ctx.save();ctx.shadowColor='rgba(250,80,0,.35)';ctx.shadowBlur=60;rr(ctx,px,py,pw,ph,56);ctx.fillStyle='#050505';ctx.fill();ctx.restore();
   rr(ctx,px,py,pw,ph,56);ctx.lineWidth=10;ctx.strokeStyle='#3a3a3a';ctx.stroke();rr(ctx,px+pw*.36,py+18,pw*.28,22,11);ctx.fillStyle='#1d1d1d';ctx.fill();
   drawMark(ctx,px+28,py+60,48);label(ctx,'Catalyst',px+86,py+84,30,'#fff','left',700);
   function bub(t1,t2,x,y,w,me){rr(ctx,x,y,w,110,26);ctx.fillStyle=me?OR:'#222';ctx.fill();label(ctx,t1,x+24,y+38,27,'#fff','left',600);label(ctx,t2,x+24,y+76,27,me?'#fff':'#c9c4bd','left',500);}
   bub('Follow @yourfavcaller','and copy their calls',px+pw*.2,py+150,pw*.75,true);
   bub('On it. Turning their','calls into trades.',px+pw*.05,py+290,pw*.75,false);
   bub('wait it actually','listens??',px+pw*.2,py+430,pw*.75,true);
 },boxes:[{t:'X signals be like',x:.5,y:.1,s:80},{t:'Just tell Catalyst who to follow',x:.47,y:.93,s:56,w:.8}]},
 {id:'earn',name:'Idle cash earning up to 8%',draw:function(ctx,W,H){
   dark(ctx,W,H);for(var s=0;s<4;s++){var cx=W*(.2+s*.15),n=3+s*2;for(var i=0;i<n;i++){var y=H*.8-i*26;ctx.fillStyle=i%2?'#e8a33a':YEL;ctx.beginPath();ctx.ellipse(cx,y,62,20,0,0,7);ctx.fill();ctx.strokeStyle='#b5761c';ctx.lineWidth=3;ctx.stroke();}}
   ctx.save();ctx.translate(W*.8,H*.5);ctx.rotate(-.12);ctx.fillStyle=OR;ctx.beginPath();ctx.arc(0,0,135,0,7);ctx.fill();ctx.lineWidth=8;ctx.strokeStyle='#fff';ctx.stroke();
   label(ctx,'UP TO',0,-62,30,'#fff',null,800);label(ctx,'8%',0,4,96,'#fff',null,800);label(ctx,'APY',0,70,34,'#fff',null,800);ctx.restore();
   label(ctx,'Catalyst Earn says “up to”. Rates vary. Not advice.',W*.05,H*.965,24,'rgba(255,255,255,.55)','left',500);
 },boxes:[{t:'My idle cash on Catalyst Earn',x:.5,y:.1,s:80},{t:'quietly earning up to 8% APY',x:.37,y:.36,s:54,w:.64}]},
 {id:'gang',name:'Research preview gang',draw:function(ctx,W,H){
   dark(ctx,W,H);var cols=[OR,BLUE,YEL,'#f4f1ec',OR];for(var i=0;i<5;i++){var x=W*(.14+i*.18),y=H*(.6+(i%2)*.06);ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.ellipse(x,y+H*.2,W*.07,H*.13,0,0,7);ctx.fill();face(ctx,x,y,W*.075,cols[i]);}
   pill(ctx,'RESEARCH PREVIEW',W/2,H*.3,34,'rgba(250,80,0,.16)',OR);
 },boxes:[{t:'Research preview gang',x:.5,y:.15,s:92},{t:'we were here early',x:.5,y:.93,s:70}]},
 {id:'choice',name:'Nah / Yeah (two-row choice)',draw:function(ctx,W,H){
   ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f3efe9';ctx.fillRect(W/2,0,W/2,H);
   ctx.fillStyle='#2a1a1a';ctx.fillRect(0,0,W/2,H/2);ctx.fillStyle='#14261c';ctx.fillRect(0,H/2,W/2,H/2);
   function ic(y,ok){ctx.save();ctx.fillStyle=ok?GRN:RED;ctx.beginPath();ctx.arc(W/4,y,W*.13,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=26;ctx.lineCap='round';ctx.beginPath();if(ok){ctx.moveTo(W/4-60,y+5);ctx.lineTo(W/4-15,y+50);ctx.lineTo(W/4+65,y-45);}else{ctx.moveTo(W/4-50,y-50);ctx.lineTo(W/4+50,y+50);ctx.moveTo(W/4+50,y-50);ctx.lineTo(W/4-50,y+50);}ctx.stroke();ctx.restore();}
   ic(H/4,false);ic(H*.75,true);label(ctx,'NAH',W/4,H*.44,40,'rgba(255,255,255,.6)',null,800);label(ctx,'YEAH',W/4,H*.94,40,'rgba(255,255,255,.6)',null,800);
   ctx.fillStyle='#0e0e0e';ctx.fillRect(0,H/2-3,W,6);ctx.fillRect(W/2-3,0,6,H);
 },boxes:[{t:'Trading on vibes with 14 tabs open',x:.75,y:.25,s:64,st:'ink',w:.42},{t:'Telling Catalyst what I believe',x:.75,y:.75,s:64,st:'ink',w:.42}],noMark:false},
 {id:'orange',name:'Plain: Catalyst orange',draw:function(ctx,W,H){orange(ctx,W,H);if(WORD){ctx.globalAlpha=.9;var w=W*.34;ctx.drawImage(WORD,W/2-w/2,H*.47,w,w*88.5/340);ctx.globalAlpha=1;}},boxes:[{t:'Top text',x:.5,y:.12,s:96},{t:'Bottom text',x:.5,y:.88,s:96}]},
 {id:'grid',name:'Plain: dark grid',draw:function(ctx,W,H){dark(ctx,W,H);drawMark(ctx,W/2-W*.12,H/2-W*.12,W*.24,.9);},boxes:[{t:'Top text',x:.5,y:.12,s:96},{t:'Bottom text',x:.5,y:.88,s:96}]}
];

/* ---------- text rendering ---------- */
function fontFor(style,size){return style===C?(size+'px Anton, Impact, "Arial Black", sans-serif'):('800 '+size+'px BDO, sans-serif');}
function wrap(ctx,text,maxW){var words=text.split(/\s+/).filter(Boolean),lines=[],cur='';words.forEach(function(w){var t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=w;}else cur=t;});if(cur)lines.push(cur);return lines;}
function drawBox(ctx,b,W,H,style,sel){
  if(!b.t.trim()){b.bb=null;if(!sel)return;}
  var ink=b.st==='ink', st=ink?B:style, size=b.s*W/1080, maxW=(b.w||.9)*W, txt=st===C?b.t.toUpperCase():b.t, lines, lh;
  for(var k=0;k<20;k++){ctx.font=fontFor(st,size);lines=wrap(ctx,txt||' ',maxW);var widest=Math.max.apply(null,lines.map(function(l){return ctx.measureText(l).width;}));if(lines.length<=4&&widest<=maxW*1.02)break;size*=.92;}
  lh=size*(st===C?1.08:1.12);var cx=b.x*W,cy=b.y*H,top=cy-lh*lines.length/2;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.miterLimit=2;
  var bw=0;lines.forEach(function(l,i){var y=top+lh*(i+.5);bw=Math.max(bw,ctx.measureText(l).width);
    if(ink){ctx.fillStyle='#0e0e0e';ctx.fillText(l,cx,y);}
    else{ctx.lineWidth=size*(st===C?.17:.14);ctx.strokeStyle='#000';ctx.strokeText(l,cx,y);ctx.fillStyle='#fff';ctx.fillText(l,cx,y);}
  });
  b.bb={x:cx-bw/2-16,y:top-10,w:bw+32,h:lh*lines.length+20};
  if(sel){ctx.setLineDash([12,10]);ctx.lineWidth=4;ctx.strokeStyle=OR;ctx.strokeRect(b.bb.x,b.bb.y,b.bb.w,b.bb.h);}
  ctx.restore();
}

/* ---------- meme editor state ---------- */
var mc=$('memeCanvas'), mctx=mc.getContext('2d');
var state={tpl:TEMPLATES[0],upload:null,boxes:[],style:C,wm:true,sel:0};
function cloneBoxes(t){return t.boxes.map(function(b){return {t:b.t,x:b.x,y:b.y,s:b.s,st:b.st,w:b.w};});}
function renderMeme(forExport){
  var W=mc.width,H=mc.height;mctx.clearRect(0,0,W,H);
  if(state.upload){var im=state.upload,sc=Math.max(W/im.width,H/im.height),iw=im.width*sc,ih=im.height*sc;mctx.fillStyle='#000';mctx.fillRect(0,0,W,H);mctx.drawImage(im,(W-iw)/2,(H-ih)/2,iw,ih);}
  else state.tpl.draw(mctx,W,H);
  if(state.wm){var s=W*.075;mctx.save();mctx.shadowColor='rgba(0,0,0,.5)';mctx.shadowBlur=12;drawMark(mctx,W-s-W*.03,H-s-W*.03,s,.92);mctx.restore();}
  state.boxes.forEach(function(b,i){drawBox(mctx,b,W,H,state.style,!forExport&&i===state.sel);});
}
function renderBoxInputs(){
  var wrap=$('boxes');wrap.innerHTML='';
  state.boxes.forEach(function(b,i){
    var row=document.createElement('div');row.className='bx'+(i===state.sel?' sel':'');
    var inp=document.createElement('input');inp.type='text';inp.value=b.t;inp.maxLength=120;inp.setAttribute('aria-label','Text box '+(i+1));inp.autocomplete='off';
    inp.addEventListener('input',function(){b.t=inp.value;renderMeme();});
    inp.addEventListener('focus',function(){state.sel=i;$('boxSize').value=b.s;[].forEach.call(wrap.children,function(c,j){c.classList.toggle('sel',j===i);});renderMeme();});
    var del=document.createElement('button');del.type='button';del.textContent='×';del.setAttribute('aria-label','Remove text box '+(i+1));
    del.addEventListener('click',function(){state.boxes.splice(i,1);state.sel=Math.max(0,Math.min(state.sel,state.boxes.length-1));renderBoxInputs();renderMeme();});
    row.appendChild(inp);row.appendChild(del);wrap.appendChild(row);
  });
  var b=state.boxes[state.sel];if(b)$('boxSize').value=b.s;
}
function setTemplate(t){state.tpl=t;state.upload=null;mc.width=1080;mc.height=1080;state.boxes=cloneBoxes(t);state.sel=0;
  [].forEach.call(document.querySelectorAll('.tpl'),function(el){el.classList.toggle('on',el.dataset.id===t.id);});renderBoxInputs();renderMeme();}
function buildTemplateGrid(){
  var g=$('tpls');TEMPLATES.forEach(function(t){
    var b=document.createElement('button');b.type='button';b.className='tpl';b.dataset.id=t.id;b.setAttribute('aria-label','Template: '+t.name);
    var c=mk(1080,1080),x=c.getContext('2d');t.draw(x,1080,1080);cloneBoxes(t).forEach(function(bx){drawBox(x,bx,1080,1080,C,false);});
    var th=mk(216,216);th.getContext('2d').drawImage(c,0,0,216,216);
    var sp=document.createElement('span');sp.textContent=t.name;b.appendChild(th);b.appendChild(sp);
    b.addEventListener('click',function(){setTemplate(t);});g.appendChild(b);
  });
}
// dragging
var drag=null;
function pt(e){var r=mc.getBoundingClientRect();return {x:(e.clientX-r.left)*mc.width/r.width,y:(e.clientY-r.top)*mc.height/r.height};}
mc.addEventListener('pointerdown',function(e){var p=pt(e);for(var i=state.boxes.length-1;i>=0;i--){var bb=state.boxes[i].bb;if(bb&&p.x>=bb.x&&p.x<=bb.x+bb.w&&p.y>=bb.y&&p.y<=bb.y+bb.h){drag={i:i,dx:p.x-state.boxes[i].x*mc.width,dy:p.y-state.boxes[i].y*mc.height};state.sel=i;mc.setPointerCapture(e.pointerId);renderBoxInputs();renderMeme();e.preventDefault();return;}}});
mc.addEventListener('pointermove',function(e){if(!drag)return;var p=pt(e),b=state.boxes[drag.i];b.x=Math.min(1,Math.max(0,(p.x-drag.dx)/mc.width));b.y=Math.min(1,Math.max(0,(p.y-drag.dy)/mc.height));renderMeme();});
function endDrag(){drag=null;}
mc.addEventListener('pointerup',endDrag);mc.addEventListener('pointercancel',endDrag);
$('boxSize').addEventListener('input',function(){var b=state.boxes[state.sel];if(b){b.s=+this.value;renderMeme();}});
$('addBox').addEventListener('click',function(){state.boxes.push({t:'New text',x:.5,y:.5,s:80});state.sel=state.boxes.length-1;renderBoxInputs();renderMeme();var ins=$('boxes').querySelectorAll('input');ins[ins.length-1].select();});
[].forEach.call(document.querySelectorAll('.segb'),function(b){b.addEventListener('click',function(){state.style=b.dataset.style;[].forEach.call(document.querySelectorAll('.segb'),function(o){o.classList.toggle('on',o===b);});renderMeme();});});
$('wm').addEventListener('change',function(){state.wm=this.checked;renderMeme();});
function readImage(file){return new Promise(function(res){if(!file)return res(null);var u=URL.createObjectURL(file);var i=new Image();i.onload=function(){res(i)};i.onerror=function(){res(null)};i.src=u;});}
$('memeUpload').addEventListener('change',function(){readImage(this.files[0]).then(function(im){if(!im)return;var ar=Math.min(2,Math.max(.5,im.height/im.width));state.upload=im;mc.width=1080;mc.height=Math.round(1080*ar);
  state.boxes=[{t:'Top text',x:.5,y:.1,s:96},{t:'Bottom text',x:.5,y:.9,s:96}];state.sel=0;[].forEach.call(document.querySelectorAll('.tpl'),function(el){el.classList.remove('on');});renderBoxInputs();renderMeme();});this.value='';});
function blobOf(c,type,q){return new Promise(function(res){c.toBlob(function(b){res(b)},type,q);});}
function save(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);}
function memeBlob(){renderMeme(true);return blobOf(mc,'image/png').then(function(b){renderMeme();return b;});}
$('dlMeme').addEventListener('click',function(){memeBlob().then(function(b){save(b,'catalyst-meme.png');});});
var shareText='Made this with the Catalyst Meme & Sticker Maker 🧡 @catalystapp';
$('postX').href='https://x.com/intent/post?text='+encodeURIComponent(shareText+'\n')+'&url='+encodeURIComponent(SITE);
if(navigator.canShare){try{if(navigator.canShare({files:[new File([new Blob(['x'],{type:'image/png'})],'t.png',{type:'image/png'})]})){$('shareMeme').hidden=false;}}catch(e){}}
$('shareMeme').addEventListener('click',function(){memeBlob().then(function(b){var f=new File([b],'catalyst-meme.png',{type:'image/png'});navigator.share({files:[f],text:shareText}).catch(function(){});});});

/* ---------- stickers ---------- */
var S=512;
function txt(ctx,t,x,y,size,fill,opts){opts=opts||{};ctx.save();ctx.font=(opts.w||900)+' '+size+'px '+(opts.f||'BDO')+', sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';if(opts.max){var m=ctx.measureText(t).width;if(m>opts.max){size*=opts.max/m;ctx.font=(opts.w||900)+' '+size+'px '+(opts.f||'BDO')+', sans-serif';}}
  if(opts.stroke!==false){ctx.lineWidth=opts.sw||size*.2;ctx.strokeStyle=opts.stroke||'#0e0e0e';ctx.strokeText(t,x,y);}ctx.fillStyle=fill;ctx.fillText(t,x,y);ctx.restore();}
function stickerize(content,border){
  var out=mk(S,S),o=out.getContext('2d'),sil=mk(S,S),s=sil.getContext('2d');border=border||14;
  for(var r=border/3;r<=border+.1;r+=border/3)for(var a=0;a<Math.PI*2;a+=Math.PI/12)s.drawImage(content,Math.cos(a)*r,Math.sin(a)*r);
  s.globalCompositeOperation='source-in';s.fillStyle='#fff';s.fillRect(0,0,S,S);
  o.save();o.shadowColor='rgba(0,0,0,.35)';o.shadowBlur=10;o.shadowOffsetY=4;o.drawImage(sil,0,0);o.restore();o.drawImage(content,0,0);return out;
}
var STICKERS=[
 {id:'wagmi',name:'WAGMI on Catalyst',draw:function(c){txt(c,'WAGMI',256,205,150,'#fff',{max:430,sw:26});c.save();c.font='800 46px BDO, sans-serif';var w=c.measureText('ON CATALYST').width+120;rr(c,256-w/2,290,w,84,42);c.fillStyle=OR;c.fill();c.lineWidth=8;c.strokeStyle='#0e0e0e';c.stroke();c.restore();drawMark(c,256-w/2+16,302,60);txt(c,'ON CATALYST',256+28,334,46,'#fff',{w:800,stroke:false});}},
 {id:'believe',name:'What do you believe?',draw:function(c){c.save();rr(c,50,70,412,290,60);c.fillStyle='#fff';c.fill();c.lineWidth=12;c.strokeStyle='#0e0e0e';c.stroke();c.beginPath();c.moveTo(150,352);c.lineTo(110,445);c.lineTo(230,356);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(140,340,100,18);c.restore();
   txt(c,'WHAT DO',256,140,64,'#0e0e0e',{stroke:false});txt(c,'YOU',256,215,64,'#0e0e0e',{stroke:false});txt(c,'BELIEVE?',256,290,72,OR,{stroke:false,max:360});}},
 {id:'lfg',name:'LFG 🧡',draw:function(c){txt(c,'LFG',236,290,215,OR,{f:'Anton',w:400,sw:30});heart(c,410,135,150,OR,'#0e0e0e',12);}},
 {id:'invite',name:'Invite pls',draw:function(c){c.save();c.translate(256,256);c.rotate(-.09);c.beginPath();var w=400,h=230;c.moveTo(-w/2,-h/2);c.lineTo(w/2,-h/2);c.lineTo(w/2,-28);c.arc(w/2,0,28,-Math.PI/2,Math.PI/2,true);c.lineTo(w/2,h/2);c.lineTo(-w/2,h/2);c.lineTo(-w/2,28);c.arc(-w/2,0,28,Math.PI/2,-Math.PI/2,true);c.closePath();c.fillStyle=OR;c.fill();c.lineWidth=10;c.strokeStyle='#0e0e0e';c.stroke();
   c.setLineDash([10,10]);c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=4;c.beginPath();c.moveTo(110,-h/2+16);c.lineTo(110,h/2-16);c.stroke();c.setLineDash([]);
   txt(c,'INVITE',-40,-28,86,'#fff',{stroke:false,max:260});txt(c,'pls',-40,52,70,'#0e0e0e',{stroke:false,w:800});drawMark(c,124,-34,68);c.restore();}},
 {id:'copy',name:'Copy that trade',draw:function(c){c.save();rr(c,330,60,120,140,22);c.fillStyle='#1d1d1d';c.fill();c.lineWidth=9;c.strokeStyle='#0e0e0e';c.stroke();rr(c,300,90,120,140,22);c.fillStyle=OR;c.fill();c.stroke();c.restore();line(c,[[322,200],[350,170],[372,182],[400,130]],'#fff',10);
   txt(c,'COPY THAT',236,300,92,'#fff',{max:420,sw:20});txt(c,'TRADE',256,400,110,OR,{max:400,sw:22});}},
 {id:'uponly',name:'Up only?',draw:function(c){arrowUp(c,256,40,250,260,GRN,'#0e0e0e',12);txt(c,'UP ONLY?',256,380,108,'#fff',{max:440,sw:22,f:'Anton',w:400});}},
 {id:'mark',name:'Catalyst logo mark',draw:function(c){drawMark(c,76,76,360);}},
 {id:'gm',name:'gm Catalyst',draw:function(c){c.save();c.fillStyle=YEL;for(var i=0;i<12;i++){c.save();c.translate(256,215);c.rotate(i*Math.PI/6);rr(c,-12,-190,24,56,12);c.fill();c.restore();}c.beginPath();c.arc(256,215,120,0,7);c.fillStyle=OR;c.fill();c.lineWidth=10;c.strokeStyle='#0e0e0e';c.stroke();c.restore();
   txt(c,'gm',256,210,150,'#fff',{sw:24,w:900});c.save();c.font='800 44px BDO, sans-serif';var w=c.measureText('catalyst fam').width+60;rr(c,256-w/2,362,w,78,39);c.fillStyle='#0e0e0e';c.fill();c.restore();txt(c,'catalyst fam',256,402,44,'#fff',{w:800,stroke:false});}}
];
function renderSticker(def){var c=mk(S,S),x=c.getContext('2d');def.draw(x);return stickerize(c,def.id==='mark'?18:14);}
function to320(c){var o=mk(320,320),x=o.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(c,0,0,320,320);return o;}
function webpBlob(c){var q=.92;function go(){return blobOf(c,'image/webp',q).then(function(b){if(!b||b.type!=='image/webp')return null;if(b.size<100000||q<.35)return b;q-=.08;return go();});}return go();}
function buildStickerGrid(){var g=$('stks');STICKERS.forEach(function(d){var card=document.createElement('div');card.className='stk';var c=renderSticker(d);c.setAttribute('role','img');c.setAttribute('aria-label','Sticker: '+d.name);
  var b=document.createElement('b');b.textContent=d.name;var dl=document.createElement('div');dl.className='dl';
  dl.innerHTML='<a href="stickers/'+d.id+'.webp" download="catalyst-'+d.id+'.webp">WebP 512</a><a href="stickers/'+d.id+'-320.png" download="catalyst-'+d.id+'-320.png">PNG 320</a>';
  card.appendChild(c);card.appendChild(b);card.appendChild(dl);g.appendChild(card);});}
// custom sticker
var sc=$('stkCanvas'),sctx=sc.getContext('2d'),cs={text:'Catalyst fam',color:OR,img:null,mark:false};
function customCanvas(){var c=mk(S,S),x=c.getContext('2d'),t=cs.text.trim();
  if(cs.img){var im=cs.img,box=t?380:430,k=Math.min(box/im.width,box/im.height),w=im.width*k,h=im.height*k,ix=256-w/2,iy=(t?215:256)-h/2;x.save();rr(x,ix,iy,w,h,36);x.clip();x.drawImage(im,ix,iy,w,h);x.restore();
    if(t)fitText(x,t,256,440,96,440);}
  else if(t)fitText(x,t,256,256,170,440,true);
  if(cs.mark)drawMark(x,cs.img?24:196,cs.img?24:(t?40:180),cs.img?96:120);
  return stickerize(c,14);}
function fitText(x,t,cx,cy,size,maxW,multi){x.save();x.font='900 '+size+'px BDO, sans-serif';var lines=multi?wrap(x,t.toUpperCase(),maxW):[t.toUpperCase()];
  while(size>30&&(lines.length>3||Math.max.apply(null,lines.map(function(l){return x.measureText(l).width;}))>maxW)){size*=.9;x.font='900 '+size+'px BDO, sans-serif';if(multi)lines=wrap(x,t.toUpperCase(),maxW);}
  x.restore();var lh=size*1.05,top=cy-lh*lines.length/2+(cs.mark&&!cs.img?40:0);lines.forEach(function(l,i){txt(x,l,cx,top+lh*(i+.5),size,cs.color,{sw:size*.2});});}
function renderCustom(){sctx.clearRect(0,0,S,S);sctx.drawImage(customCanvas(),0,0);}
$('stkText').addEventListener('input',function(){cs.text=this.value;renderCustom();});
[].forEach.call(document.querySelectorAll('.sw'),function(b){b.addEventListener('click',function(){cs.color=b.dataset.c;[].forEach.call(document.querySelectorAll('.sw'),function(o){o.classList.toggle('on',o===b);});renderCustom();});});
$('stkMark').addEventListener('change',function(){cs.mark=this.checked;renderCustom();});
$('stkUpload').addEventListener('change',function(){readImage(this.files[0]).then(function(im){if(im){cs.img=im;$('stkClear').hidden=false;renderCustom();}});this.value='';});
$('stkClear').addEventListener('click',function(){cs.img=null;this.hidden=true;renderCustom();});
function kb(n){return (n/1024).toFixed(1)+' KB';}
$('dlWebp').addEventListener('click',function(){var c=customCanvas();webpBlob(c).then(function(b){if(b){save(b,'catalyst-sticker.webp');$('stkInfo').textContent='Saved a 512×512 WebP, '+kb(b.size)+'.';}
  else blobOf(c,'image/png').then(function(p){save(p,'catalyst-sticker-512.png');$('stkInfo').textContent='This browser can’t make WebP files (Safari can’t yet), so you got a 512×512 PNG. Sticker apps convert it, or open this page in Chrome for WebP.';});});});
$('dlPng').addEventListener('click',function(){blobOf(to320(customCanvas()),'image/png').then(function(b){save(b,'catalyst-sticker-320.png');$('stkInfo').textContent='Saved a 320×320 PNG, '+kb(b.size)+'.';});});

/* ---------- mode tabs ---------- */
function mode(m){var meme=m==='meme';$('memePanel').hidden=!meme;$('stickerPanel').hidden=meme;$('tabMeme').classList.toggle('on',meme);$('tabSticker').classList.toggle('on',!meme);$('tabMeme').setAttribute('aria-selected',meme);$('tabSticker').setAttribute('aria-selected',!meme);}
$('tabMeme').addEventListener('click',function(){mode('meme');});$('tabSticker').addEventListener('click',function(){mode('sticker');});
if(location.hash==='#stickers')mode('sticker');

/* ---------- boot ---------- */
var fonts=document.fonts?Promise.all([document.fonts.load('80px Anton'),document.fonts.load('800 80px BDO'),document.fonts.load('900 80px BDO'),document.fonts.load('600 30px BDO')]).catch(function(){}):Promise.resolve();
Promise.all([img('assets/catalyst-mark.svg'),img('assets/catalyst-word.svg'),fonts]).then(function(r){MARK=r[0];WORD=r[1];
  buildTemplateGrid();setTemplate(TEMPLATES[0]);buildStickerGrid();renderCustom();
  window.CMM={ready:true,templates:TEMPLATES.map(function(t){return t.name;}),stickers:STICKERS.map(function(s){return s.name;}),
    exportStickers:function(){return Promise.all(STICKERS.map(function(d){var c=renderSticker(d);return Promise.all([webpBlob(c),blobOf(to320(c),'image/png')]).then(function(bs){return Promise.all(bs.map(function(b){return new Promise(function(res){var fr=new FileReader();fr.onload=function(){res(fr.result)};fr.readAsDataURL(b);});})).then(function(u){return {id:d.id,name:d.name,webp:u[0],png:u[1],webpSize:bs[0].size};});});}));},
    setTemplate:function(id){setTemplate(TEMPLATES.filter(function(t){return t.id===id;})[0]);},state:state,render:renderMeme};
});
})();
