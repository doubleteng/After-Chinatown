/** Screen-space notes are pinned to an immutable captured street frame. */
function installStreetAnnotations104(bridge,host,options){
 const $=id=>document.getElementById(id),tr=options.tr,viewport=$('unified-viewport'),ns='http://www.w3.org/2000/svg';
 const toolbar=document.createElement('div');toolbar.id='street-note-tools104';toolbar.dataset.noTranslate='';toolbar.innerHTML='<button type="button" id="street-note-start104"></button><button type="button" id="street-note-stop104" hidden></button><button type="button" id="street-note-clear104" hidden></button>';
 const pane=document.createElement('div');pane.id='street-note-pane104';pane.hidden=true;pane.innerHTML='<img id="street-note-frame104" alt=""><svg id="street-note-canvas104" role="img" tabindex="0"></svg><p id="street-note-hint104" role="status"></p>';
 const editor=document.createElement('aside');editor.id='street-note-editor104';editor.dataset.noTranslate='';editor.hidden=true;editor.innerHTML='<div class="street-note-title104"><strong id="street-note-title104"></strong><button type="button" id="street-note-close104"></button></div><label id="street-note-text-label104" for="street-note-text104"></label><textarea id="street-note-text104" rows="3" maxlength="500"></textarea><label id="street-note-sign-label104" for="street-note-sign104"></label><input id="street-note-sign104" type="text" maxlength="80"><p id="street-note-provenance104"></p><button type="button" id="street-note-delete104"></button>';
 const summary=document.createElement('div');summary.id='street-note-summary104';host.querySelector('#street-form102').append(summary);
 viewport.append(pane,toolbar,editor);const svg=$('street-note-canvas104');
 let rows=[],next=1,frozen=null,context=null,year=null,drawing=false,drag=null,active=null,busy=false,starting=false,width=1200,height=600;
 const colors=['#c6472c','#147b88','#6650a3','#aa7111','#397b4c','#a83e72','#1b5cab','#824b29'];
 function el(tag,attrs){const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;}
 function paint(){svg.replaceChildren();for(const row of rows.concat(drag?[drag.row]:[])){
  const b=row.bounds,c=colors[(row.id-1)%colors.length],g=el('g',{'data-note':row.id,tabindex:'0',role:'button','aria-label':tr('Edit circle ','编辑圈选 ')+row.id});
  const ring=el('ellipse',{cx:(b.x+b.width/2)*width,cy:(b.y+b.height/2)*height,rx:b.width*width/2,ry:b.height*height/2,fill:c+'1c',stroke:c,'stroke-width':3,'vector-effect':'non-scaling-stroke'});
  const dot=el('circle',{cx:(b.x+b.width/2)*width,cy:Math.max(15,b.y*height),r:13,fill:c,stroke:'white','stroke-width':2,'vector-effect':'non-scaling-stroke'}),label=el('text',{x:(b.x+b.width/2)*width,y:Math.max(15,b.y*height)+4,'text-anchor':'middle',fill:'white','font-size':12,'font-family':'system-ui','font-weight':700});label.textContent=row.id;
  g.append(ring,dot,label);g.onclick=e=>{e.stopPropagation();if(!drawing&&!busy)edit(row.id);};g.onkeydown=e=>{if(e.key==='Enter'&&!busy){e.preventDefault();edit(row.id);}};svg.append(g);
 }summary.replaceChildren();if(rows.length){const p=document.createElement('p');p.textContent=tr('Circled details · tied to this viewpoint and year','圈选细节 · 绑定当前视角与年份');summary.append(p);for(const row of rows){const b=document.createElement('button');b.type='button';b.disabled=busy;b.textContent=row.id+' · '+(row.text||row.signText||tr('Add a description','填写说明')).slice(0,75);b.style.borderLeftColor=colors[(row.id-1)%colors.length];b.onclick=()=>edit(row.id);summary.append(b);}}
 options.changed();
 }
 function labels(){
  $('street-note-start104').textContent=frozen?tr('Draw another circle','再画一个圈'):tr('Circle & add details','圈选补充细节');
  $('street-note-stop104').textContent=tr('Finish drawing','完成圈选');$('street-note-clear104').textContent=tr('Clear circles & move view','清除圈选并移动视角');
  $('street-note-hint104').textContent=drawing?tr('Drag to circle a place. Then describe it. Esc cancels drawing.','拖动鼠标或手指圈出位置，然后填写说明。Esc 取消画圈。'):tr('This view and year are held for your circles. Select a number to edit.','已固定圈选对应的视角与年份。点击编号可编辑说明。');
  svg.setAttribute('aria-label',tr('Circled street details. Drag to draw a region; select a numbered circle to edit.','街景圈选细节。拖动画圈，点击编号编辑。'));
  $('street-note-close104').textContent=tr('Done','完成');$('street-note-text-label104').textContent=tr('What was here? What details should appear?','这里当时是什么？有哪些细节？');
  $('street-note-text104').placeholder=tr('For example: A grocery shop here, with wooden crates outside.','例如：这里是一家杂货店，门口堆着木箱。');
  $('street-note-sign-label104').textContent=tr('Exact sign text to include (optional)','要显示的店招原文（选填）');
  $('street-note-provenance104').textContent=tr('Your recollection or supplied detail; not independently verified.','你提供的记忆或细节，尚未经独立核实。');$('street-note-delete104').textContent=tr('Delete this circle','删除这个圈');
  if(active)$('street-note-title104').textContent=tr('Circle ','圈选 ')+active;
  sync();
 }
 function sync(){const street=bridge.mode()==='street';toolbar.hidden=!street;pane.hidden=!street||!frozen;editor.hidden=!street||!active||busy;pane.dataset.drawing=String(drawing&&!busy);$('street-note-start104').disabled=busy||starting||rows.length>=8||!bridge.context();$('street-note-start104').hidden=drawing;$('street-note-stop104').hidden=!drawing;$('street-note-stop104').disabled=busy;$('street-note-clear104').hidden=!frozen;$('street-note-clear104').disabled=busy;$('street-note-text104').disabled=busy;$('street-note-sign104').disabled=busy;}
 async function start(){if(busy||starting||rows.length>=8)return;starting=true;sync();try{if(!frozen){bridge.lock(true);const shot=await bridge.capture();const im=new Image;await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject;im.src=shot.image;});width=im.naturalWidth;height=im.naturalHeight;frozen=shot;context=bridge.context();year=bridge.year();svg.setAttribute('viewBox','0 0 '+width+' '+height);svg.setAttribute('preserveAspectRatio','xMidYMid meet');$('street-note-frame104').src=shot.image;}
  drawing=true;active=null;labels();paint();viewport.scrollIntoView({behavior:'smooth',block:'center'});
 }catch(e){options.notify(e.message);if(!frozen)bridge.lock(false);}finally{starting=false;sync();}}
 function point(e){const rect=svg.getBoundingClientRect(),scale=Math.min(rect.width/width,rect.height/height),left=(rect.width-width*scale)/2,top=(rect.height-height*scale)/2;return {x:(e.clientX-rect.left-left)/(width*scale),y:(e.clientY-rect.top-top)/(height*scale)};}
 const clamp=n=>Math.max(0,Math.min(1,n));
 svg.addEventListener('pointerdown',e=>{if(!drawing||busy||drag||e.button>0)return;const p=point(e);if(p.x<0||p.x>1||p.y<0||p.y>1)return;e.preventDefault();e.stopPropagation();drag={pointer:e.pointerId,start:p,row:{id:next,bounds:{x:p.x,y:p.y,width:0,height:0},text:'',signText:''}};svg.setPointerCapture(e.pointerId);paint();});
 svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;e.preventDefault();const p=point(e),x=clamp(p.x),y=clamp(p.y),a=drag.start;drag.row.bounds={x:Math.min(a.x,x),y:Math.min(a.y,y),width:Math.abs(a.x-x),height:Math.abs(a.y-y)};paint();});
 function end(e,cancel){if(!drag||e.pointerId!==drag.pointer)return;e.preventDefault();const row=drag.row;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(!cancel&&row.bounds.width>=.015&&row.bounds.height>=.015){rows.push(row);next++;drawing=false;edit(row.id);}paint();labels();}
 svg.addEventListener('pointerup',e=>end(e,false));svg.addEventListener('pointercancel',e=>end(e,true));
 svg.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
 function edit(id){if(busy)return;active=id;drawing=false;const row=rows.find(r=>r.id===id);if(!row)return;labels();$('street-note-text104').value=row.text;$('street-note-sign104').value=row.signText;editor.hidden=false;viewport.scrollIntoView({behavior:'smooth',block:'center'});$('street-note-text104').focus({preventScroll:true});}
 function store(){const row=rows.find(r=>r.id===active);if(!row)return;row.text=$('street-note-text104').value;row.signText=$('street-note-sign104').value;paint();}
 $('street-note-text104').addEventListener('input',store);$('street-note-sign104').addEventListener('input',store);
 $('street-note-close104').onclick=()=>{store();active=null;sync();};$('street-note-delete104').onclick=()=>{rows=rows.filter(r=>r.id!==active);active=null;paint();labels();};
 $('street-note-start104').onclick=start;$('street-note-stop104').onclick=()=>{drawing=false;drag=null;paint();labels();};
 function clear(){if(busy)return;rows=[];frozen=null;context=null;year=null;active=null;drawing=false;drag=null;next=1;$('street-note-frame104').removeAttribute('src');bridge.lock(false);paint();labels();}
 $('street-note-clear104').onclick=clear;
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&frozen&&!busy){drawing=false;drag=null;active=null;paint();labels();}});
 function data(){store();const result=rows.map(r=>({id:r.id,bounds:{...r.bounds},text:r.text.trim(),signText:r.signText.trim(),provenance:'user_supplied_unverified'}));if(result.some(r=>!r.text&&!r.signText)){edit(result.find(r=>!r.text&&!r.signText).id);throw new Error(tr('Add details to each circle, or delete empty circles.','请填写每个圈的说明，或删除空白圈选。'));}return result;}
 labels();return {data,capture:()=>frozen,context:()=>context,year:()=>year,held:()=>!!frozen,setBusy:value=>{busy=value;sync();},sync,labels,clear,count:()=>rows.length};
}
