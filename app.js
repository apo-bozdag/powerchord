const NOTES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const SL=["e","B","G","D","A","E"];
const CHORD_DB={
  C:{root:"C",type:"major"},D:{root:"D",type:"major"},E:{root:"E",type:"major"},
  F:{root:"F",type:"major"},G:{root:"G",type:"major"},A:{root:"A",type:"major"},
  B:{root:"B",type:"major"},
  Cm:{root:"C",type:"minor"},Dm:{root:"D",type:"minor"},Em:{root:"E",type:"minor"},
  Fm:{root:"F",type:"minor"},Gm:{root:"G",type:"minor"},Am:{root:"A",type:"minor"},
  Bm:{root:"B",type:"minor"},
  "C#":{root:"C#",type:"major"},"D#":{root:"D#",type:"major"},
  "F#":{root:"F#",type:"major"},"G#":{root:"G#",type:"major"},
  "A#":{root:"A#",type:"major"},
  Db:{root:"C#",type:"major"},Eb:{root:"D#",type:"major"},
  Gb:{root:"F#",type:"major"},Ab:{root:"G#",type:"major"},
  Bb:{root:"A#",type:"major"},
  "C#m":{root:"C#",type:"minor"},"D#m":{root:"D#",type:"minor"},
  "F#m":{root:"F#",type:"minor"},"G#m":{root:"G#",type:"minor"},
  "A#m":{root:"A#",type:"minor"},Bbm:{root:"A#",type:"minor"},
  Ebm:{root:"D#",type:"minor"},Abm:{root:"G#",type:"minor"},
  Dbm:{root:"C#",type:"minor"},
  C7:{root:"C",type:"7"},D7:{root:"D",type:"7"},E7:{root:"E",type:"7"},
  F7:{root:"F",type:"7"},G7:{root:"G",type:"7"},A7:{root:"A",type:"7"},
  B7:{root:"B",type:"7"},
};
const SN=[{n:"E",o:2},{n:"A",o:2},{n:"D",o:3},{n:"G",o:3},{n:"B",o:3},{n:"E",o:4}];
const ni=n=>NOTES.indexOf(n);
const midi=(n,o)=>ni(n)+(o+1)*12;
const noteOn=(si,f)=>NOTES[(midi(SN[si].n,SN[si].o)+f)%12];
function findF(si,t){for(let f=0;f<=15;f++)if(noteOn(si,f)===t)return f;return -1}
function getPC(root){
  let r=findF(0,root);if(r>=0&&r<=12)return{rs:0,rf:r,ff:r+2,tab:["x","x","x","x",String(r+2),String(r)]};
  r=findF(1,root);if(r>=0&&r<=12)return{rs:1,rf:r,ff:r+2,tab:["x","x","x",String(r+2),String(r),"x"]};
  return null;
}
function getBass(root){
  let f=findF(0,root);if(f>=0&&f<=12)return{s:0,f,tab:["x","x","x","x","x",String(f)]};
  f=findF(1,root);if(f>=0&&f<=12)return{s:1,f,tab:["x","x","x","x",String(f),"x"]};
  return null;
}
function getCombined(root){
  const pc=getPC(root),bass=getBass(root);if(!pc||!bass)return null;
  const t=["x","x","x","x","x","x"];t[bass.s]=String(bass.f);
  if(pc.rs===0){t[0]=String(pc.rf);t[1]=String(pc.ff)}else{t[1]=String(pc.rf);t[2]=String(pc.ff)}
  return{combined:t,pc,bass};
}
const SCALES={
  MAJOR:[0,2,4,5,7,9,11],MINOR:[0,2,3,5,7,8,10],
  PENT_MIN:[0,3,5,7,10],PENT_MAJ:[0,2,4,7,9],BLUES:[0,3,5,6,7,10]
};
const scaleNotes=(root,iv)=>{const r=ni(root);return iv.map(i=>NOTES[(r+i)%12])};
function majKeyChords(root){
  const r=ni(root),d=[0,2,4,5,7,9,11],ty=["major","minor","minor","major","major","minor","dim"];
  return d.map((x,i)=>({root:NOTES[(r+x)%12],type:ty[i]}));
}
function detectKey(chords){
  let bk=null,bs=-1,bm="major";
  for(let k=0;k<12;k++){
    const kn=NOTES[k],mc=majKeyChords(kn);
    let s=0;chords.forEach(c=>{if(mc.find(m=>m.root===c.root&&(m.type===c.type||c.type==="7")))s++});
    if(s>bs){bs=s;bk=kn;bm="major"}
    const rm=NOTES[(k+3)%12],mnc=majKeyChords(rm);
    let ms=0;chords.forEach(c=>{if(mnc.find(m=>m.root===c.root&&(m.type===c.type||c.type==="7")))ms++});
    const mb=chords[0]?.type==="minor"?.5:0;
    if(ms+mb>bs){bs=ms+mb;bk=kn;bm="minor"}
  }
  return{key:bk,mode:bm};
}
function getSoloTips(key,mode){
  const t=[];
  if(mode==="minor"){
    t.push({title:`${key} minor pentatonik`,notes:scaleNotes(key,SCALES.PENT_MIN),desc:"En guvenli secim. Her yerde calisir.",iv:SCALES.PENT_MIN});
    t.push({title:`${key} blues`,notes:scaleNotes(key,SCALES.BLUES),desc:"Pentatonige b5 eklenmis. Daha karanlik.",iv:SCALES.BLUES});
    t.push({title:`${key} dogal minor`,notes:scaleNotes(key,SCALES.MINOR),desc:"Tam 7 nota. Melodik sololar icin.",iv:SCALES.MINOR});
  }else{
    t.push({title:`${key} major pentatonik`,notes:scaleNotes(key,SCALES.PENT_MAJ),desc:"Parlak, pozitif ses.",iv:SCALES.PENT_MAJ});
    const rel=NOTES[(ni(key)+9)%12];
    t.push({title:`${rel} minor pentatonik`,notes:scaleNotes(rel,SCALES.PENT_MIN),desc:"Relatif minor. Daha sert ton.",iv:SCALES.PENT_MIN,root:rel});
    t.push({title:`${key} major scale`,notes:scaleNotes(key,SCALES.MAJOR),desc:"Tam 7 nota. Melodi cikarma icin.",iv:SCALES.MAJOR});
  }
  return t;
}
function getEarTips(key,mode){
  return[
    {n:"1",t:`Kok nota ${key}'yi her telde bul. Solo oradan baslar, oraya doner.`},
    {n:"2",t:`Akor degisiminde o akorun kokune atla. Am'de A'ya, Dm'de D'ye.`},
    {n:"3",t:`Nakarati cikarirken vokal melodisini once tek telde cal.`},
    {n:"4",t:`Bend: ${mode==="minor"?"b3->3 cok etkili":"2->3 parlak duyulur"}. Kok ve 5th uzerinde kullan.`},
    {n:"5",t:`Her akor gecisinde kok notaya slide yap. Kulak baglanti kurar.`},
    {n:"6",t:`Pentatonik box 1'i ezberle, sonra box'lar arasi kay.`},
  ];
}

// ===== SVG FRETBOARD RENDERING =====
const FB={
  wood:"#3D2B1F",woodL:"#5C4033",fret:"#C0C0C0",fretS:"#E8E8E8",
  nut:"#F5F0E0",nutB:"#D4C9A8",inlay:"#D4C9A8",
  strH:"#D4D0C8",strL:"#B0A898",strW:"#9A8E7E",
  dR:"#DC3545",d5:"#2D7DD2",dB:"#28A745",dSc:"#6C63FF",dSa:"#20B2AA",mut:"#888"
};
const MARKERS=[3,5,7,9,12,15,17,19,21];

function svgFretboard(opts){
  const{startFret,fretCount,ss,fs,tp,lp,w,compact}=opts;
  const bPad=compact?16:24;
  const h=5*ss;
  let s=`<svg viewBox="0 0 ${w+lp+16} ${h+tp+bPad}" style="width:100%;${compact?'':`min-width:620px;`}display:block">`;

  // Wood body
  s+=`<rect x="${lp}" y="${tp-2}" width="${w}" height="${5*ss+4}" rx="${compact?2:3}" fill="${FB.wood}"/>`;

  // Wood grain
  if(!compact)for(let i=0;i<8;i++){
    const y=tp+i*(5*ss/7);
    s+=`<line x1="${lp}" y1="${y}" x2="${lp+w}" y2="${y+3}" stroke="${FB.woodL}" stroke-width=".3" opacity=".4"/>`;
  }

  // Nut
  if(startFret===0){
    s+=`<rect x="${lp-1}" y="${tp-3}" width="${compact?4:6}" height="${5*ss+6}" rx="1" fill="${FB.nut}" stroke="${FB.nutB}" stroke-width=".5"/>`;
  }

  // Inlay dots
  for(let i=0;i<fretCount;i++){
    const fn=startFret+i+1, cx=lp+(i+.5)*fs, cy=tp+2.5*ss, r=compact?3:5;
    if(fn===12){
      s+=`<circle cx="${cx}" cy="${tp+1.2*ss}" r="${r}" fill="${FB.inlay}" opacity=".5"/>`;
      s+=`<circle cx="${cx}" cy="${tp+3.8*ss}" r="${r}" fill="${FB.inlay}" opacity=".5"/>`;
    }else if(MARKERS.includes(fn)){
      s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FB.inlay}" opacity=".5"/>`;
    }
  }

  // Fret bars
  for(let i=0;i<=fretCount;i++){
    const x=lp+i*fs;
    if(startFret===0&&i===0)continue;
    s+=`<line x1="${x}" y1="${tp-2}" x2="${x}" y2="${tp+5*ss+2}" stroke="${FB.fret}" stroke-width="${compact?1.5:2}"/>`;
    s+=`<line x1="${x+.5}" y1="${tp-2}" x2="${x+.5}" y2="${tp+5*ss+2}" stroke="${FB.fretS}" stroke-width=".5" opacity=".4"/>`;
  }

  // Strings
  for(let i=0;i<6;i++){
    const y=tp+i*ss;
    const th=compact?(i<3?.6:.8+(i-3)*.3):(i<3?.8:1+(i-3)*.4);
    const col=i<3?FB.strH:(i<4?FB.strL:FB.strW);
    s+=`<line x1="${lp}" y1="${y}" x2="${lp+w}" y2="${y}" stroke="${col}" stroke-width="${th}"/>`;
    if(!compact)s+=`<line x1="${lp}" y1="${y-.3}" x2="${lp+w}" y2="${y-.3}" stroke="#fff" stroke-width=".2" opacity=".15"/>`;
  }

  // String labels
  for(let i=0;i<6;i++){
    s+=`<text x="${lp-(compact?10:14)}" y="${tp+i*ss+(compact?3:4)}" text-anchor="middle" style="font-size:${compact?9:11}px;fill:var(--tx2);font-family:var(--mono);font-weight:500">${SL[i]}</text>`;
  }

  // Fret numbers
  for(let i=0;i<fretCount;i++){
    const fn=startFret+i+1, cx=lp+(i+.5)*fs, ny=tp+5*ss+(compact?12:18);
    const isMk=MARKERS.includes(fn);
    if(compact){
      s+=`<text x="${cx}" y="${ny}" text-anchor="middle" style="font-size:8px;fill:var(--tx3);font-family:var(--mono);font-weight:${isMk?500:400};opacity:${isMk?1:.6}">${fn}</text>`;
    }else{
      s+=`<text x="${cx}" y="${ny}" text-anchor="middle" style="font-size:${isMk?10:9}px;fill:var(--tx3);font-family:var(--mono);font-weight:${isMk?500:400};opacity:${isMk?1:.4}">${fn}</text>`;
    }
  }

  return s;
}

function svgDot(x,y,label,color,isRoot,compact){
  const r=compact?(isRoot?7:5.5):(isRoot?10:8);
  const fs=compact?(isRoot?7:6):(isRoot?9:8);
  let s='';
  if(isRoot)s+=`<circle cx="${x}" cy="${y}" r="${r+2}" fill="none" stroke="${color}" stroke-width="1.5" opacity=".3"/>`;
  s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
  s+=`<text x="${x}" y="${y+(compact?2.5:3.5)}" text-anchor="middle" style="font-size:${fs}px;fill:#fff;font-weight:500;font-family:var(--mono)">${label}</text>`;
  return s;
}

function renderMiniFretboard(pc,bass){
  const allF=[pc.rf,pc.ff];if(bass)allF.push(bass.f);
  const mn=Math.min(...allF),mx=Math.max(...allF);
  const startFret=mn===0?0:Math.max(1,mn-1);
  const fretCount=Math.max(4,mx-startFret+2);
  const ss=15,fs=28,tp=16,lp=20,w=fretCount*fs;

  const dots=[];
  if(pc.rs===0){dots.push({s:0,f:pc.rf,t:"R",c:FB.dR});dots.push({s:1,f:pc.ff,t:"5",c:FB.d5})}
  else{dots.push({s:1,f:pc.rf,t:"R",c:FB.dR});dots.push({s:2,f:pc.ff,t:"5",c:FB.d5})}
  if(bass){
    const ex=dots.find(d=>d.s===bass.s&&d.f===bass.f);
    if(!ex)dots.push({s:bass.s,f:bass.f,t:"B",c:FB.dB});
    else ex.t="R";
  }
  const active=new Set(dots.map(d=>d.s));

  function dotX(fret){
    if(startFret===0){return fret===0?lp+2:lp+(fret-.5)*fs}
    return lp+(fret-startFret-.5)*fs;
  }

  let svg=svgFretboard({startFret,fretCount,ss,fs,tp,lp,w,compact:true});

  // Muted X
  for(let si=0;si<6;si++){
    if(active.has(si))continue;
    const y=tp+(5-si)*ss;
    svg+=`<text x="${lp-10}" y="${y+3}" text-anchor="middle" style="font-size:8px;fill:${FB.mut};font-family:var(--mono);font-weight:500">x</text>`;
  }

  // Dots
  dots.forEach(d=>{
    svg+=svgDot(dotX(d.f),tp+(5-d.s)*ss,d.t,d.c,d.t==="R",true);
  });

  svg+='</svg>';
  return svg;
}

function renderScaleFretboard(root,intervals){
  const notes=scaleNotes(root,intervals);
  const maxFret=15,ss=24,fs=40,tp=26,lp=32,w=maxFret*fs;

  let svg=svgFretboard({startFret:0,fretCount:maxFret,ss,fs,tp,lp,w,compact:false});

  for(let si=0;si<6;si++){
    for(let fret=0;fret<=maxFret;fret++){
      const note=noteOn(si,fret);
      const idx=notes.indexOf(note);
      if(idx===-1)continue;
      const isRoot=note===root;
      const x=fret===0?lp:lp+(fret-.5)*fs;
      const y=tp+(5-si)*ss;
      const color=isRoot?FB.dR:idx<3?FB.dSc:FB.dSa;
      svg+=svgDot(x,y,note,color,isRoot,false);
    }
  }

  svg+='</svg>';
  return svg;
}

function miniTab(tab){
  const ml=Math.max(...tab.map(f=>f.length));
  return SL.map((s,i)=>`${s}|${tab[5-i].padStart(ml+1)}|`).join('\n');
}

// ===== STATE =====
let state={results:[],keyInfo:null,soloTips:[],earTips:[],view:"all",activeScale:0,showSolo:false,lickCat:null};

// ===== PRESETS =====
const presets=["Am G F E","Em G D A","C G Am F","Bm G D A","Dm Bb C A","Am Dm Em C"];
const presetsEl=document.getElementById('presets');
presets.forEach(p=>{
  const b=document.createElement('button');b.textContent=p;
  b.onclick=()=>{document.getElementById('inp').value=p};
  presetsEl.appendChild(b);
});

// ===== CONVERT =====
function convert(){
  const inp=document.getElementById('inp').value.trim();
  if(!inp)return;
  const names=inp.split(/[\s,|\-]+/).filter(Boolean);
  const res=[],infos=[];
  const errEl=document.getElementById('error');
  for(const name of names){
    const chord=CHORD_DB[name];
    if(!chord){errEl.textContent=`"${name}" bulunamadi`;errEl.style.display='block';return}
    const data=getCombined(chord.root);
    if(!data){errEl.textContent=`"${name}" icin pozisyon yok`;errEl.style.display='block';return}
    res.push({name,root:chord.root,type:chord.type,...data});
    infos.push({root:chord.root,type:chord.type});
  }
  errEl.style.display='none';
  const detected=detectKey(infos);
  state={results:res,keyInfo:detected,soloTips:getSoloTips(detected.key,detected.mode),earTips:getEarTips(detected.key,detected.mode),view:"all",activeScale:0,showSolo:true};
  render();
}

document.getElementById('convertBtn').onclick=convert;
document.getElementById('inp').onkeydown=e=>{if(e.key==='Enter')convert()};

// ===== RENDER =====
function render(){
  const{results:res,keyInfo:ki,soloTips:st,earTips:et,view,activeScale:as,showSolo}=state;
  if(!res.length){document.getElementById('results').innerHTML='';return}

  const n=res.length;
  const cols=`repeat(${n},minmax(0,1fr))`;
  const tip=st[as];
  const fifth=NOTES[(ni(ki.key)+7)%12];

  let h='';

  // Key banner
  h+=`<div class="key-banner">
    <div><span class="key-label">Key</span><div class="key-val">${ki.key} ${ki.mode==="minor"?"minor":"major"}</div></div>
    <div class="sep"><span class="key-label">Scale</span><div class="scale-notes">${tip?tip.notes.join(" - "):""}</div></div>
    <div class="solo-toggle"><button class="btn ${showSolo?'active':''}" onclick="toggleSolo()">Solo ${showSolo?'gizle':'goster'}</button></div>
  </div>`;

  // Progression tab
  let header="   ";
  res.forEach((r,i)=>{header+=` ${(r.name+"5").padEnd(5)}`;if(i<n-1)header+="  "});
  let lines=SL.map((s,i)=>{let l=`${s} |`;res.forEach(r=>{l+=`-${r.combined[5-i].padStart(2)}-|`});return l});
  h+=`<div class="prog-tab"><pre>${header}\n${lines.join('\n')}</pre></div>`;

  // View toggle
  h+=`<div class="view-toggle">`;
  ["all:Hepsi","combined:Birlesik","power:Power","bass:Bass","fretboard:Fretboard"].forEach(v=>{
    const[k,l]=v.split(':');
    h+=`<button class="btn ${view===k?'active':''}" onclick="setView('${k}')">${l}</button>`;
  });
  h+=`</div>`;

  // Section rows
  function sectionRow(label,color,tabFn,hl){
    h+=`<div class="section-row"><div class="section-label" style="color:${color}">${label}</div><div class="grid" style="grid-template-columns:${cols}">`;
    res.forEach(r=>{h+=`<div class="cell${hl?' hl':''}"><pre>${tabFn(r)}</pre></div>`});
    h+=`</div></div>`;
  }

  if(view==="all"||view==="combined")sectionRow("Birlesik (power + bass)","#D85A30",r=>miniTab(r.combined),true);
  if(view==="all"||view==="power")sectionRow("Power chord","#2D7DD2",r=>miniTab(r.pc.tab),false);
  if(view==="all"||view==="bass")sectionRow("Bass nota","#28A745",r=>miniTab(r.bass.tab),false);

  if(view==="all"||view==="fretboard"){
    h+=`<div class="section-row"><div class="section-label" style="color:var(--tx3)">Fretboard</div><div class="grid" style="grid-template-columns:${cols}">`;
    res.forEach(r=>{h+=`<div class="cell">${renderMiniFretboard(r.pc,r.bass)}</div>`});
    h+=`</div></div>`;
  }

  // Legend
  h+=`<div class="legend">
    <span><span class="dot" style="background:${FB.dR}"></span>Root</span>
    <span><span class="dot" style="background:${FB.d5}"></span>5th</span>
    <span><span class="dot" style="background:${FB.dB}"></span>Bass</span>
  </div>`;

  // ===== SOLO SECTION =====
  h+=`<div class="solo-section${showSolo?' show':''}">
    <h2>Solo rehberi</h2>
    <p class="sub2">${ki.key} ${ki.mode} key icin scale ve tuyo</p>
    <div class="scale-btns">`;
  st.forEach((t,i)=>{
    h+=`<button class="btn ${as===i?'active':''}" onclick="setScale(${i})">${t.title}</button>`;
  });
  h+=`</div>`;

  if(tip){
    const tRoot=tip.root||ki.key;
    h+=`<div class="scale-info"><div class="desc">${tip.desc}</div><div class="scale-notes-pills">`;
    tip.notes.forEach((n,i)=>{
      const col=n===tRoot?FB.dR:i<3?FB.dSc:FB.dSa;
      h+=`<span style="background:${col}">${n}</span>`;
    });
    h+=`</div></div>`;

    h+=`<div class="fb-wrap"><div class="fb-label">Scale fretboard (15 fret)</div>${renderScaleFretboard(tRoot,tip.iv)}</div>`;
  }

  // Ear tips
  h+=`<div class="ear-tips"><h3>Kulaktan cikarma ve solo tuyo</h3><div class="ear-grid">`;
  et.forEach(t=>{
    h+=`<div class="ear-card"><div class="ear-num">${t.n}</div><div class="ear-text">${t.t}</div></div>`;
  });
  h+=`</div></div>`;

  // Quick ref
  h+=`<div class="ref-box"><h3>Hizli referans</h3><div class="ref-grid">
    <div><strong>Akor degisiminde</strong>Her akorun kok notasina slide/hammer-on yap. ${res.map(r=>r.root).join(" -> ")}</div>
    <div><strong>Nakarat cikarma</strong>Vokal melodisini once tek telde (G, B veya e) cal. Araliklari bul, sonra pozisyon degistir.</div>
    <div><strong>Bend/vibrato</strong>Kok nota (${ki.key}) ve 5th (${fifth}) uzerinde en etkili.</div>
  </div></div>`;

  // ===== TEK TEL MELODI REHBERI =====
  if(tip){
    const tRoot=tip.root||ki.key;
    const sNotes=tip.notes;

    h+=`<div style="margin-top:1.5rem;border-top:1px solid var(--bd);padding-top:1.5rem">
      <h2 style="font-size:18px;font-weight:500;margin-bottom:4px">Melodi rehberi</h2>
      <p class="sub2">G + B + e teli uzerinde scale haritasi. Her akor icin kok nota vurgulu.</p>`;

    // Triple string fretboard (G=index3, B=index4, e=index5) for each chord
    h+=`<div style="background:var(--bg2);border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:500;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">G + B + e teli uzerinde scale notalari</div>`;

    res.forEach((r,ri)=>{
      h+=`<div style="margin-bottom:${ri<res.length-1?16:0}px">`;
      h+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="font-family:var(--mono);font-size:14px;font-weight:500">${r.name}</span>
        <span style="font-size:11px;color:var(--tx3)">kok: ${r.root}</span>
      </div>`;

      const maxF=15, fs=24, lp=20, tp=16, sw=maxF*fs;
      const strSp=16; // spacing between strings
      const fbH=strSp*2+12; // fretboard height for 3 strings
      const eY=tp+6; // e string (highest pitch, top)
      const bY=eY+strSp; // B string (middle)
      const gY=bY+strSp; // G string (lowest pitch, bottom)
      const totalH=tp+fbH+14;

      let sv=`<svg viewBox="0 0 ${sw+lp+12} ${totalH}" style="width:100%;max-width:700px;display:block">`;

      // Wood body
      sv+=`<rect x="${lp}" y="${tp}" width="${sw}" height="${fbH}" rx="3" fill="${FB.wood}"/>`;
      for(let gi=0;gi<5;gi++){
        const gy=tp+3+gi*(fbH/5);
        sv+=`<line x1="${lp}" y1="${gy}" x2="${lp+sw}" y2="${gy+2}" stroke="${FB.woodL}" stroke-width=".3" opacity=".3"/>`;
      }

      // Inlay dots between strings
      const inlayY=tp+fbH/2;
      for(let f=1;f<=maxF;f++){
        const cx=lp+(f-.5)*fs;
        if(f===12){
          sv+=`<circle cx="${cx}" cy="${inlayY-6}" r="2.5" fill="${FB.inlay}" opacity=".4"/>`;
          sv+=`<circle cx="${cx}" cy="${inlayY+6}" r="2.5" fill="${FB.inlay}" opacity=".4"/>`;
        }else if(MARKERS.includes(f)){
          sv+=`<circle cx="${cx}" cy="${inlayY}" r="2.5" fill="${FB.inlay}" opacity=".4"/>`;
        }
      }

      // Nut
      sv+=`<rect x="${lp-1}" y="${tp-1}" width="5" height="${fbH+2}" rx="1" fill="${FB.nut}" stroke="${FB.nutB}" stroke-width=".5"/>`;

      // Fret bars
      for(let f=1;f<=maxF;f++){
        const x=lp+f*fs;
        sv+=`<line x1="${x}" y1="${tp}" x2="${x}" y2="${tp+fbH}" stroke="${FB.fret}" stroke-width="1.8"/>`;
        sv+=`<line x1="${x+.5}" y1="${tp}" x2="${x+.5}" y2="${tp+fbH}" stroke="${FB.fretS}" stroke-width=".4" opacity=".35"/>`;
      }

      // Strings: e (thin, bright), B (medium), G (slightly thicker)
      sv+=`<line x1="${lp}" y1="${eY}" x2="${lp+sw}" y2="${eY}" stroke="${FB.strH}" stroke-width=".8"/>`;
      sv+=`<line x1="${lp}" y1="${eY-.3}" x2="${lp+sw}" y2="${eY-.3}" stroke="#fff" stroke-width=".15" opacity=".12"/>`;
      sv+=`<line x1="${lp}" y1="${bY}" x2="${lp+sw}" y2="${bY}" stroke="${FB.strH}" stroke-width=".9"/>`;
      sv+=`<line x1="${lp}" y1="${bY-.3}" x2="${lp+sw}" y2="${bY-.3}" stroke="#fff" stroke-width=".15" opacity=".11"/>`;
      sv+=`<line x1="${lp}" y1="${gY}" x2="${lp+sw}" y2="${gY}" stroke="${FB.strL}" stroke-width="1.1"/>`;
      sv+=`<line x1="${lp}" y1="${gY-.3}" x2="${lp+sw}" y2="${gY-.3}" stroke="#fff" stroke-width=".15" opacity=".1"/>`;

      // String labels
      sv+=`<text x="${lp-10}" y="${eY+3}" text-anchor="middle" style="font-size:8px;fill:var(--tx2);font-family:var(--mono);font-weight:500">e</text>`;
      sv+=`<text x="${lp-10}" y="${bY+3}" text-anchor="middle" style="font-size:8px;fill:var(--tx2);font-family:var(--mono);font-weight:500">B</text>`;
      sv+=`<text x="${lp-10}" y="${gY+3}" text-anchor="middle" style="font-size:8px;fill:var(--tx2);font-family:var(--mono);font-weight:500">G</text>`;

      // Fret numbers
      for(let f=1;f<=maxF;f++){
        const isMk=MARKERS.includes(f);
        sv+=`<text x="${lp+(f-.5)*fs}" y="${tp+fbH+11}" text-anchor="middle" style="font-size:7px;fill:var(--tx3);font-family:var(--mono);font-weight:${isMk?500:400};opacity:${isMk?1:.4}">${f}</text>`;
      }

      // Notes on all three strings: e(5), B(4), G(3)
      [[5,eY],[4,bY],[3,gY]].forEach(([si,sy])=>{
        for(let f=0;f<=maxF;f++){
          const note=noteOn(si,f);
          const scIdx=sNotes.indexOf(note);
          if(scIdx===-1)continue;
          const isChordRoot=note===r.root;
          const isScaleRoot=note===tRoot;
          const x=f===0?lp+2:lp+(f-.5)*fs;
          const dotR=isChordRoot?7:(isScaleRoot?5.5:4.5);
          let col;
          if(isChordRoot)col="#E8590C";
          else if(isScaleRoot)col=FB.dR;
          else col=scIdx<3?FB.dSc:FB.dSa;
          if(isChordRoot)sv+=`<circle cx="${x}" cy="${sy}" r="${dotR+2.5}" fill="none" stroke="${col}" stroke-width="1.5" opacity=".3"/>`;
          sv+=`<circle cx="${x}" cy="${sy}" r="${dotR}" fill="${col}"/>`;
          sv+=`<text x="${x}" y="${sy+2.5}" text-anchor="middle" style="font-size:${isChordRoot?6.5:5.5}px;fill:#fff;font-weight:500;font-family:var(--mono)">${note}</text>`;
        }
      });

      sv+=`</svg>`;
      h+=`<div style="overflow-x:auto">${sv}</div>`;
      h+=`</div>`;
    });

    h+=`<div style="display:flex;gap:12px;margin-top:8px;font-size:10px;color:var(--tx3)">
      <span><span class="dot" style="background:#E8590C;width:8px;height:8px"></span>Akor kok notasi (hedef)</span>
      <span><span class="dot" style="background:${FB.dR};width:8px;height:8px"></span>Scale kok</span>
      <span><span class="dot" style="background:${FB.dSc};width:8px;height:8px"></span>Scale notalari</span>
    </div>`;
    h+=`</div>`;

    // ===== NOTA FONKSIYON ANALIZI =====
    h+=`<div style="background:var(--bg);border:1px solid var(--bd);border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:500;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Scale notalari ne ise yarar</div>`;

    // Analyze each note in the scale
    const degreeNames=ki.mode==="minor"
      ?["1 (kok)","2 (gecis)","b3 (minor karakter)","4 (sus)","5 (guvenli)","b6 (karanlik)","b7 (dominant)"]
      :["1 (kok)","2 (gecis)","3 (major karakter)","4 (sus)","5 (guvenli)","6 (parlak)","7 (leading)"];

    const pentaDegrees=ki.mode==="minor"?[0,2,3,4,6]:[0,1,2,4,5]; // pentatonic degree indices

    h+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px">`;
    sNotes.forEach((note,i)=>{
      // Which chords in the progression contain this note?
      const inChords=[];
      res.forEach(r=>{
        const chordTones=[];
        const ri=ni(r.root);
        if(r.type==="major")chordTones.push(NOTES[ri],NOTES[(ri+4)%12],NOTES[(ri+7)%12]);
        else if(r.type==="minor")chordTones.push(NOTES[ri],NOTES[(ri+3)%12],NOTES[(ri+7)%12]);
        else if(r.type==="7")chordTones.push(NOTES[ri],NOTES[(ri+4)%12],NOTES[(ri+7)%12],NOTES[(ri+10)%12]);
        if(chordTones.includes(note))inChords.push(r.name);
      });

      const isPenta=tip.iv.length<=6&&i<tip.notes.length; // if current scale is pentatonic
      const isRoot=note===tRoot;
      const col=isRoot?"#E8590C":i<3?FB.dSc:FB.dSa;

      // Degree label from full scale
      let degLabel="";
      const fullScale=ki.mode==="minor"?SCALES.MINOR:SCALES.MAJOR;
      const fullNotes=scaleNotes(tRoot,fullScale);
      const fullIdx=fullNotes.indexOf(note);
      if(fullIdx>=0&&fullIdx<degreeNames.length)degLabel=degreeNames[fullIdx];

      h+=`<div style="background:var(--bg2);border-radius:var(--radius);padding:8px 10px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:22px;border-radius:4px;font-size:12px;font-family:var(--mono);font-weight:500;color:#fff;background:${col}">${note}</span>
          <span style="font-size:10px;color:var(--tx3)">${degLabel}</span>
        </div>`;

      if(inChords.length>0){
        h+=`<div style="font-size:11px;color:var(--tx2);margin-bottom:2px">${inChords.join(", ")} akorunda var</div>`;
      }

      // Practical tip
      let usage="";
      if(isRoot)usage="Her zaman guvenli. Solo buradan baslar/biter.";
      else if(fullIdx===4)usage="5th: guvenli durak. Kok'ten sonra en cok kullanilan.";
      else if(fullIdx===2&&ki.mode==="minor")usage="b3: minor'un karakteri. Bend ile 3'e cek etkili.";
      else if(fullIdx===2&&ki.mode==="major")usage="3rd: major'un parlak sesi. Uzun notada iyi duyulur.";
      else if(fullIdx===6&&ki.mode==="minor")usage="b7: dominant his. Kok'e donmeden once kullan.";
      else if(fullIdx===6&&ki.mode==="major")usage="Leading tone: kok'e 1 fret mesafe. Gerilim yaratir.";
      else if(fullIdx===1)usage="Gecis notasi. Uzun durma, kok veya 3'e yuru.";
      else if(fullIdx===3)usage="4th: sus hissi. Cozum icin 3'e veya 5'e git.";
      else if(fullIdx===5&&ki.mode==="minor")usage="b6: karanlik renk. Dikkatli kullan, gerilim verir.";
      else if(fullIdx===5&&ki.mode==="major")usage="6th: parlak, neseli. Pentatonigin parcasi.";

      if(usage)h+=`<div style="font-size:10px;color:var(--tx3);line-height:1.4">${usage}</div>`;

      h+=`</div>`;
    });
    h+=`</div></div>`;

    // ===== LICK KUTUPHANESI =====
    h+=`<div style="background:var(--bg);border:1px solid var(--bd);border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:500;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Lick kutuphanesi</div>
      <div style="font-size:12px;color:var(--tx2);margin-bottom:12px">Key ve akorlarina gore hazir lick'ler. Tab'daki fret numaralari bu progression'a transpose edilmis.</div>`;

    // Lick database - intervals relative to root (fret offsets)
    const lickDB_minor=[
      {
        name:"Klasik pentatonik acilis",
        desc:"Her minor progression'da calisir. Box 1 acilis.",
        cat:"temel",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r}`,`${r+3}`,'','',`${r}`,``],
            B:[``,``,`${r+3}`,`${r+1}h${r+3}`,``,`${r}`],
            G:[``,``,``,``,``,``]
          };
        },
        tip:"h = hammer-on. Ilk 2 nota hizli, 3. notada dur."
      },
      {
        name:"Blues bend",
        desc:"b3 -> 3 bend. Aglamalik ses.",
        cat:"bend",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r+3}b(${r+4})`,`${r+3}`,`${r}`,``],
            B:[``,``,``,`${r+3}`],
            G:[``,``,``,``]
          };
        },
        tip:"b = bend (yarim ton yukari). Yavas birak."
      },
      {
        name:"Slide giris",
        desc:"Kok notaya alttan slide. Dikkat cekici acilis.",
        cat:"slide",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r-2}/${r}`,``,`${r+3}`,`${r}`],
            B:[``,`${r+3}`,``,``],
            G:[``,``,``,``]
          };
        },
        tip:"/ = slide yukari. Hizli yap, kok notada dur."
      },
      {
        name:"Pentatonik inis",
        desc:"Yukari cikip asagi inen klasik lick.",
        cat:"temel",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r+3}`,`${r}`,``,``,``],
            B:[``,``,`${r+3}`,`${r+1}`,`${r}`],
            G:[``,``,``,``,``]
          };
        },
        tip:"Notalar arasi legato (bagli) cal. Tek pick."
      },
      {
        name:"Call & response",
        desc:"Soru-cevap lick. 2 parca, araya bosluk koy.",
        cat:"melodik",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r}`,`${r+3}`,`${r}`,`...`,`${r+3}`,`${r+1}h${r+3}`,`${r}`],
            B:[``,``,``,`...`,``,``,``],
            G:[``,``,``,`...`,``,``,``]
          };
        },
        tip:"... = kisa bekleme. Birinci parca soru, ikinci cevap."
      },
      {
        name:"Vibrato kapanisi",
        desc:"Kok notada vibrato ile bitir. Profesyonel duyulur.",
        cat:"bitis",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r+3}`,`${r}`,``],
            B:[``,``,`${r}~`],
            G:[``,``,``]
          };
        },
        tip:"~ = vibrato. Parmagini salla, notu titret."
      },
      {
        name:"G teli kaydirma",
        desc:"G telinden baslayip yukari cik. Genis aralik, kalin ton.",
        cat:"melodik",
        tab:function(rootF){
          const r=rootF;
          const gRoot=findF(3,NOTES[(ni(noteOn(5,r))+0)%12]); // root on G string
          return {
            e:[``,``,``,`${r}`],
            B:[``,``,`${r+1}h${r+3}`,``],
            G:[`${gRoot}`,`${gRoot+2}`,``,``]
          };
        },
        tip:"G telinden baslayip B ve e teline cik. Box pozisyonlari arasi gecis."
      },
    ];

    const lickDB_major=[
      {
        name:"Major pentatonik acilis",
        desc:"Parlak, pozitif ses. Country/pop rock.",
        cat:"temel",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r}`,`${r+2}`,`${r+4}`,`${r+2}`,`${r}`],
            B:[``,``,``,``,``],
            G:[``,``,``,``,``]
          };
        },
        tip:"Tum notalar ayni telde. Temiz, basit."
      },
      {
        name:"Bend & release",
        desc:"2 -> 3 bend. Major'un parlak sesi.",
        cat:"bend",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r+2}b(${r+4})`,`${r+2}`,`${r}`,``],
            B:[``,``,``,`${r+2}`],
            G:[``,``,``,``]
          };
        },
        tip:"Bend'i yavas birak (release). Aglamalik degil, parlak."
      },
      {
        name:"Country slide",
        desc:"Slide ile yukari cik. Enerjik his.",
        cat:"slide",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r-2}/${r}`,`${r+2}`,`${r+4}`,`${r+2}`,`${r}`],
            B:[``,``,``,``,``],
            G:[``,``,``,``,``]
          };
        },
        tip:"Ilk slide hizli, sonra ritimli in."
      },
      {
        name:"Double stop",
        desc:"Iki teli ayni anda cal. Kalin ses.",
        cat:"melodik",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r}`,`${r+2}`,`${r+4}`,`${r+2}`,`${r}`],
            B:[`${r+2}`,`${r+4}`,`${r+5}`,`${r+4}`,`${r+2}`],
            G:[``,``,``,``,``]
          };
        },
        tip:"Iki teli beraber cal. Pena ile sweep."
      },
      {
        name:"Hammer-on chain",
        desc:"Legato zinciri. Akici ses.",
        cat:"temel",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r}h${r+2}h${r+4}`,`${r+2}`,`${r}`],
            B:[``,``,``],
            G:[``,``,``]
          };
        },
        tip:"Tek pick, 2 hammer-on. Sol el gucu onemli."
      },
      {
        name:"Cozum kapanisi",
        desc:"5th'ten kok'e inis. Temiz bitis.",
        cat:"bitis",
        tab:function(rootF){
          const r=rootF;
          return {
            e:[`${r+7}`,`${r+4}`,`${r+2}`,`${r}~`],
            B:[``,``,``,``],
            G:[``,``,``,``]
          };
        },
        tip:"Yukari pozisyondan asagi in. Son notada vibrato."
      },
      {
        name:"Uc tel arpej",
        desc:"G-B-e uzerinde akor tonlari. Melodik, temiz.",
        cat:"melodik",
        tab:function(rootF){
          const r=rootF;
          const gRoot=findF(3,NOTES[(ni(noteOn(5,r))+0)%12]);
          return {
            e:[``,``,`${r}`,`${r+2}`,`${r}`],
            B:[``,`${r+2}`,``,``,``],
            G:[`${gRoot}`,``,``,``,``]
          };
        },
        tip:"Asagidan yukariya sweep. Her tel tek nota."
      },
    ];

    const licks=ki.mode==="minor"?lickDB_minor:lickDB_major;
    const categories=[...new Set(licks.map(l=>l.cat))];
    const catLabels={temel:"Temel",bend:"Bend",slide:"Slide",melodik:"Melodik",bitis:"Bitis"};
    const catColors={temel:FB.dSc,bend:"#E8590C",slide:FB.dSa,melodik:FB.d5,bitis:"#888"};

    // Category filter
    h+=`<div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap">
      <button class="btn ${!state.lickCat?'active':''}" onclick="setLickCat(null)">Hepsi</button>`;
    categories.forEach(c=>{
      h+=`<button class="btn ${state.lickCat===c?'active':''}" onclick="setLickCat('${c}')" style="border-left:3px solid ${catColors[c]||'var(--bd)'}">${catLabels[c]||c}</button>`;
    });
    h+=`</div>`;

    const filteredLicks=state.lickCat?licks.filter(l=>l.cat===state.lickCat):licks;

    filteredLicks.forEach((lick,li)=>{
      h+=`<div style="background:var(--bg2);border-radius:var(--radius);padding:12px 14px;margin-bottom:8px;border-left:3px solid ${catColors[lick.cat]||'var(--bd)'}">`;
      h+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
        <span style="font-size:13px;font-weight:500;color:var(--tx)">${lick.name}</span>
        <span style="font-size:10px;color:${catColors[lick.cat]||'var(--tx3)'};background:var(--bg);padding:1px 6px;border-radius:4px">${catLabels[lick.cat]||lick.cat}</span>
      </div>`;
      h+=`<div style="font-size:11px;color:var(--tx2);margin-bottom:8px">${lick.desc}</div>`;

      // Render for each chord in progression
      h+=`<div style="display:grid;grid-template-columns:repeat(${Math.min(res.length,4)},minmax(0,1fr));gap:6px;margin-bottom:6px">`;
      res.forEach(r=>{
        const rootF=findF(5,r.root); // root on e string
        const tab=lick.tab(rootF);
        const maxLen=Math.max(tab.e.length,tab.B.length,tab.G.length);
        let eLine='e|', bLine='B|', gLine='G|';
        for(let i=0;i<maxLen;i++){
          const eN=tab.e[i]||'';
          const bN=tab.B[i]||'';
          const gN=tab.G[i]||'';
          const w=Math.max(eN.length,bN.length,gN.length,1);
          eLine+='-'+eN.padEnd(w,'-')+'-';
          bLine+='-'+bN.padEnd(w,'-')+'-';
          gLine+='-'+gN.padEnd(w,'-')+'-';
        }
        eLine+='|'; bLine+='|'; gLine+='|';

        h+=`<div style="background:var(--bg);border-radius:var(--radius);padding:8px">
          <div style="font-family:var(--mono);font-size:12px;font-weight:500;margin-bottom:4px">${r.name}</div>
          <pre style="font-family:var(--mono);font-size:11px;line-height:1.5;color:var(--tx);margin:0;white-space:pre">${eLine}\n${bLine}\n${gLine}</pre>
        </div>`;
      });
      h+=`</div>`;

      h+=`<div style="font-size:10px;color:var(--tx3);font-style:italic">${lick.tip}</div>`;
      h+=`</div>`;
    });

    // Technique legend
    h+=`<div style="margin-top:8px;padding:10px 12px;background:var(--bg2);border-radius:var(--radius);font-size:11px;color:var(--tx2);display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:4px">
      <span><strong>h</strong> = hammer-on</span>
      <span><strong>/</strong> = slide yukari</span>
      <span><strong>\\</strong> = slide asagi</span>
      <span><strong>b</strong> = bend</span>
      <span><strong>~</strong> = vibrato</span>
      <span><strong>...</strong> = bekleme</span>
    </div>`;

    h+=`</div>`;

    // Fret mesafe rehberi (all three strings)
    h+=`<div style="background:var(--bg2);border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:500;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Fret mesafe rehberi</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">`;

    for(let i=0;i<res.length;i++){
      const from=res[i], to=res[(i+1)%res.length];
      const gFrom=findF(3,from.root), gTo=findF(3,to.root);
      const bFrom=findF(4,from.root), bTo=findF(4,to.root);
      const eFrom=findF(5,from.root), eTo=findF(5,to.root);
      const gDiff=gTo-gFrom, bDiff=bTo-bFrom, eDiff=eTo-eFrom;
      h+=`<div style="background:var(--bg);border:1px solid var(--bd);border-radius:var(--radius);padding:8px 10px">
        <span style="font-family:var(--mono);font-weight:500">${from.name} -> ${to.name}</span><br>
        <span style="color:var(--tx2)">G: ${gFrom}f -> ${gTo}f (${gDiff>0?"+":""}${gDiff})</span><br>
        <span style="color:var(--tx2)">B: ${bFrom}f -> ${bTo}f (${bDiff>0?"+":""}${bDiff})</span><br>
        <span style="color:var(--tx2)">e: ${eFrom}f -> ${eTo}f (${eDiff>0?"+":""}${eDiff})</span>
      </div>`;
    }

    h+=`</div></div>`;

    h+=`</div>`; // tek tel section end
  }

  h+=`</div>`; // solo-section end

  document.getElementById('results').innerHTML=h;
}

function setView(v){state.view=v;render()}
function setScale(i){state.activeScale=i;render()}
function toggleSolo(){state.showSolo=!state.showSolo;render()}
function setLickCat(c){state.lickCat=c;render()}
