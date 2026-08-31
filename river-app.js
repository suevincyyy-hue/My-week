(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const KIND = {life:'生活',study:'学习',reading:'阅读',research:'科研',sport:'运动',work:'兼职',social:'社交',rest:'休息'};
  const CAT = {
    life:{color:'#DCEEC6',ramp:['#F1F8E8','#DCEEC6','#C5E1A5','#AFD582','#9CCC65','#8BC349','#7DB343','#679F38','#568C2E','#34691E']},
    study:{color:'#F9EECC',ramp:['#FCF7E6','#F9EECC','#F6E6B3','#F3DD99','#F0D580','#ECCC66','#E9C44D','#E6BB33','#E3B319','#E0AA00']},
    reading:{color:'#CEE9FB',ramp:['#E6F5FB','#CEE9FB','#A5D2F1','#77B7E3','#4EA2D8','#3991CC','#2E81C2','#1F78BC','#1B6CB3','#1B60A1']},
    research:{color:'#E3DAEA',ramp:['#F0EFF2','#E3DAEA','#C8BCDE','#A295C5','#7B71B2','#635CA5','#5B53A1','#584F9F','#534A9B','#504596']},
    sport:{color:'#CBE9E4',ramp:['#F0FAF8','#DDF3EF','#CBE9E4','#B5DFD8','#9FD9D1','#7CCBC1','#5BBBAF','#3AA99C','#268F84','#19756D']},
    work:{color:'#F7D8CF',ramp:['#FFF4F0','#FBE8E2','#F7D8CF','#F2C6B9','#ECB2A2','#E59B88','#D98270','#CB6C59','#B95645','#9D4033']},
    social:{color:'#F4DCE8',ramp:['#FFF3F8','#FAE8F1','#F4DCE8','#EDC8DA','#E7B5CE','#DC9BBA','#CE7FA5','#BC638F','#A84A79','#8E365F']},
    rest:{color:'#E9E1DA',ramp:['#FBF8F5','#F4EFEA','#E9E1DA','#DDD2C7','#CFBFAF','#BEAA98','#A9927D','#907965','#77614F','#5F4C3D']}
  };
  const WEEK_TEMPLATES = {
    1:[['计算机三级｜网络技术','study','周一上午 · 主学习块'],['第二外国语（一）','study','周一课程'],['CATTI｜轻量练习','study','可做 30–45 分钟']],
    2:[['口译证书培训','study','课程本身也算 CATTI 训练'],['科研｜深度工作块①','research','周二下午 · 约 3 小时']],
    3:[['汉英翻译','study','上午课程'],['视译','study','上午课程'],['第二外国语（一）','study','下午课程'],['今天减速一点','rest','周三不额外塞重任务']],
    4:[['语言学导论','study','上午课程'],['英语文学导论（一）','reading','上午课程'],['下午保护休息','rest','小周末 🌿']],
    5:[['科研｜深度工作块②','research','周五集中推进'],['如果想去，就游泳','sport','运动 · 今天不是 KPI']],
    6:[['少量学习','study','周末轻量推进'],['出去玩','social','开放时间']],
    0:[['Sunday Integration','work','回顾本周 Demo 与联动'],['给下周留一点空白','rest','周日收束']]
  };
  const WEEK_LABELS = ['周日','周一','周二','周三','周四','周五','周六'];
  const QUOTES = {
    today:[['“一日难再晨。”','陶渊明'],['“Forever—is composed of Nows—”','Emily Dickinson'],['“且将新火试新茶。”','苏轼'],['“行到水穷处，坐看云起时。”','王维'],['“Ripeness is all.”','Shakespeare']],
    wish:[['“我欲乘风归去。”','苏轼'],['“且放白鹿青崖间。”','李白'],['“I tramp a perpetual journey.”','Walt Whitman'],['“乘兴而行，兴尽而返。”','《世说新语》'],['“欲穷千里目，更上一层楼。”','王之涣']],
    future:[['“山重水复疑无路，柳暗花明又一村。”','陆游'],['“长风破浪会有时。”','李白'],['“来日绮窗前，寒梅著花未？”','王维'],['“The readiness is all.”','Shakespeare'],['“潮平两岸阔，风正一帆悬。”','王湾']]
  };

  const pad = n => String(n).padStart(2,'0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parseYmd = value => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return null;
    const result = new Date(Number(match[1]),Number(match[2])-1,Number(match[3]),12);
    return Number.isNaN(result.getTime()) ? null : result;
  };
  const mondayOf = date => {
    const copy = new Date(date); const weekday = copy.getDay() || 7;
    copy.setDate(copy.getDate()-weekday+1); copy.setHours(12,0,0,0); return copy;
  };
  const cnDate = date => `${date.getMonth()+1}月${date.getDate()}日 · 星期${'日一二三四五六'[date.getDay()]}`;
  const friendlyDate = key => {
    const date = parseYmd(key); if (!date) return key;
    if (key === todayKey) return `今天 · ${date.getMonth()+1}月${date.getDate()}日`;
    if (key === tomorrowKey) return `明天 · ${date.getMonth()+1}月${date.getDate()}日`;
    return `${date.getMonth()+1}月${date.getDate()}日 · 周${'日一二三四五六'[date.getDay()]}`;
  };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const uid = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const today = new Date(); today.setHours(12,0,0,0);
  const todayKey = ymd(today);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const tomorrowKey = ymd(tomorrow);
  const weekMonday = mondayOf(today);
  const weekKey = ymd(weekMonday);
  const weekSunday = new Date(weekMonday); weekSunday.setDate(weekSunday.getDate()+6);

  function safeParse(value){try{return JSON.parse(value || 'null')}catch(_){return null}}
  function validKind(kind){return Object.hasOwn(KIND,kind) ? kind : 'life'}
  function normalizeTask(task,index=0){
    if (!task || !String(task.title || '').trim()) return null;
    const date = parseYmd(task.date) ? task.date : todayKey;
    return {id:String(task.id || uid()),title:String(task.title).trim(),kind:validKind(task.kind),date,meta:String(task.meta || KIND[validKind(task.kind)]),order:Number.isFinite(Number(task.order)) ? Number(task.order) : index+1,auto:Boolean(task.auto)};
  }
  function normalizeCompleted(item,index=0){
    const task = normalizeTask(item,index); if (!task) return null;
    const completedAt = Number.isNaN(new Date(item.completedAt).getTime()) ? new Date().toISOString() : item.completedAt;
    const completedDate = new Date(completedAt);
    return {...task,completedAt,weekKey:item.weekKey || ymd(mondayOf(completedDate)),sourceDate:item.sourceDate || task.date};
  }
  function normalizeWish(item,index=0){
    if (!item || !String(item.title || '').trim()) return null;
    return {id:String(item.id || uid()),title:String(item.title).trim(),kind:validKind(item.kind || 'social'),meta:String(item.meta || `${KIND[validKind(item.kind || 'social')]} · 没有截止日期`),order:Number.isFinite(Number(item.order)) ? Number(item.order) : index+1};
  }

  const STORAGE = 'myweek_v02_state';
  const primaryRaw = safeParse(localStorage.getItem(STORAGE));
  let state = {
    tasks:Array.isArray(primaryRaw?.tasks) ? primaryRaw.tasks.map(normalizeTask).filter(Boolean) : [],
    completed:Array.isArray(primaryRaw?.completed) ? primaryRaw.completed.map(normalizeCompleted).filter(Boolean) : [],
    wishes:Array.isArray(primaryRaw?.wishes) ? primaryRaw.wishes.map(normalizeWish).filter(Boolean) : [],
    generated:primaryRaw?.generated && typeof primaryRaw.generated === 'object' ? {...primaryRaw.generated} : {},
    migrations:primaryRaw?.migrations && typeof primaryRaw.migrations === 'object' ? {...primaryRaw.migrations} : {},
    schemaVersion:23
  };

  function mergeUnique(target,items,normalizer){
    const ids = new Set(target.map(item=>item.id));
    const signatures = new Set(target.map(item=>`${item.title}|${item.date || ''}|${item.completedAt || ''}`));
    items.map(normalizer).filter(Boolean).forEach(item=>{
      const signature = `${item.title}|${item.date || ''}|${item.completedAt || ''}`;
      if (!ids.has(item.id) && !signatures.has(signature)){target.push(item);ids.add(item.id);signatures.add(signature)}
    });
  }

  if (!state.migrations.demo023){
    ['river_task_actions_bugfix','river_weekly_build_0_23','river_weekly_023_state','river_weekly_v023_state'].forEach(key=>{
      const legacy = safeParse(localStorage.getItem(key));
      if (!legacy) return;
      if (Array.isArray(legacy.tasks)) mergeUnique(state.tasks,legacy.tasks,normalizeTask);
      if (Array.isArray(legacy.completed)) mergeUnique(state.completed,legacy.completed,normalizeCompleted);
      if (Array.isArray(legacy.wishes)) mergeUnique(state.wishes,legacy.wishes,normalizeWish);
      if (legacy.generated && typeof legacy.generated === 'object') Object.assign(state.generated,legacy.generated);
    });
    state.migrations.demo023 = true;
  }

  if (!state.migrations.originalWant){
    mergeUnique(state.wishes,[
      {id:'default-wish-exhibition',title:'找一个周末去看展',kind:'social',meta:'出去玩 · 没有截止日期',order:1},
      {id:'default-wish-novel',title:'挑一本新小说',kind:'reading',meta:'阅读 · 想起来再做',order:2}
    ],normalizeWish);
    state.migrations.originalWant = true;
  }
  if (!state.migrations.originalFuture){
    mergeUnique(state.tasks,[
      {id:'default-future-hr',title:'去找 HR 签字',kind:'life',date:tomorrowKey,meta:'17:00准备 · 最迟17:20出门',order:1},
      {id:'default-future-network',title:'计算机三级网络技术',kind:'study',date:'2027-03-03',meta:'2027 · 主要备考目标',order:1},
      {id:'default-future-catti',title:'CATTI 二级口译',kind:'study',date:'2027-06-06',meta:'2027 · 长期推进',order:1}
    ],normalizeTask);
    state.migrations.originalFuture = true;
  }

  function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
  function ensureDefaultsForDate(dateKey){
    if (dateKey < todayKey || state.generated[dateKey]) return;
    const date = parseYmd(dateKey); if (!date) return;
    const templates = WEEK_TEMPLATES[date.getDay()] || [];
    let order = Math.max(0,...state.tasks.filter(task=>task.date===dateKey).map(task=>Number(task.order)||0));
    templates.forEach(([title,kind,meta])=>{
      if (state.tasks.some(task=>task.date===dateKey && task.title===title)) return;
      state.tasks.push({id:uid(),title,kind,date:dateKey,meta,order:++order,auto:true});
    });
    state.generated[dateKey] = true;
  }
  ensureDefaultsForDate(todayKey);
  save();

  function hashDate(value){let hash=0;for(const char of value){hash=((hash<<5)-hash)+char.charCodeAt(0);hash|=0}return Math.abs(hash)}
  function setDailyQuote(id,poolName){
    const pool = QUOTES[poolName]; const [quote,author] = pool[hashDate(`${todayKey}-${poolName}`)%pool.length];
    $(id).innerHTML = `${quote} <span class="quote-author">— ${author}</span>`;
  }
  setDailyQuote('todayQuote','today'); setDailyQuote('wishQuote','wish'); setDailyQuote('futureQuote','future');

  $('weekTitle').textContent = `本周 · ${weekMonday.getMonth()+1}/${weekMonday.getDate()}—${weekSunday.getMonth()+1}/${weekSunday.getDate()}`;
  let selectedDayKey = todayKey;
  let pageIndex = 1;
  let toastTimer = null;

  function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),1550)}
  function showModal(modal){modal.classList.add('show')}
  function hideModal(modal){modal.classList.remove('show')}
  function hideAllModals(){document.querySelectorAll('.modal-back.show').forEach(hideModal)}

  function setPage(next){
    pageIndex = Math.max(0,Math.min(2,next));
    $('pager').style.transform = `translateX(-${pageIndex*33.333333}%)`;
    document.querySelectorAll('.dot-nav').forEach((dot,index)=>dot.classList.toggle('active',index===pageIndex));
    if (pageIndex===2) renderFuture();
    if (pageIndex===0) renderWishes();
  }
  document.querySelectorAll('.dot-nav').forEach(dot=>dot.addEventListener('click',()=>setPage(Number(dot.dataset.pageIndex))));

  let pagerStartX=null,pagerStartY=null;
  $('pager').addEventListener('touchstart',event=>{
    if (event.target.closest('.task-card,.modal-back,input,select,button,.calendar')) return;
    const touch=event.touches[0];pagerStartX=touch.clientX;pagerStartY=touch.clientY;
  },{passive:true});
  $('pager').addEventListener('touchend',event=>{
    if (pagerStartX===null) return;
    const touch=event.changedTouches[0],dx=touch.clientX-pagerStartX,dy=touch.clientY-pagerStartY;
    pagerStartX=pagerStartY=null;
    if (Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.25) setPage(pageIndex+(dx<0?1:-1));
  },{passive:true});
  let pagerPointerX=null,pagerPointerY=null;
  $('pager').addEventListener('pointerdown',event=>{
    if(event.pointerType!=='mouse'||event.target.closest('.task-card,.modal-back,input,select,button,.calendar'))return;
    pagerPointerX=event.clientX;pagerPointerY=event.clientY;
  });
  $('pager').addEventListener('pointerup',event=>{
    if(pagerPointerX===null)return;const dx=event.clientX-pagerPointerX,dy=event.clientY-pagerPointerY;pagerPointerX=pagerPointerY=null;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25)setPage(pageIndex+(dx<0?1:-1));
  });

  function renderWeekGrid(){
    $('weekGrid').innerHTML='';
    for(let i=0;i<7;i++){
      const date=new Date(weekMonday);date.setDate(weekMonday.getDate()+i);
      const items=(WEEK_TEMPLATES[date.getDay()]||[]).map(item=>escapeHTML(item[0].replace('｜',' · ')));
      const card=document.createElement('div');card.className='week-card';
      card.innerHTML=`<b>${WEEK_LABELS[date.getDay()]}${date.getDay()===4?' 🌿':''}</b><span>${items.join('<br>')}</span>`;
      $('weekGrid').appendChild(card);
    }
  }
  function renderWeekDays(){
    const days=$('days');days.innerHTML='';
    const slider=document.createElement('div');slider.className='day-slider';days.appendChild(slider);
    let selectedIndex=0;
    for(let i=0;i<7;i++){
      const date=new Date(weekMonday);date.setDate(weekMonday.getDate()+i);const key=ymd(date);
      const button=document.createElement('button');button.type='button';
      button.className=`day${key===todayKey?' today':''}${key===selectedDayKey?' selected':''}`;
      button.dataset.date=key;button.setAttribute('aria-label',friendlyDate(key));button.setAttribute('aria-pressed',String(key===selectedDayKey));
      button.innerHTML=`<div class="wd">${'一二三四五六日'[i]}</div><div class="num">${date.getDate()}</div>`;
      button.addEventListener('click',()=>selectDay(key));days.appendChild(button);
      if (key===selectedDayKey) selectedIndex=i;
    }
    slider.style.transform=`translateX(calc(${selectedIndex*100}% + ${selectedIndex*6}px))`;
  }
  function updateSelectedDayHeader(){
    const date=parseYmd(selectedDayKey);const weekday=`星期${'日一二三四五六'[date.getDay()]}`;
    if (selectedDayKey===todayKey){
      $('todayHeading').textContent='今天';$('todayDate').textContent=cnDate(date);$('dayPill').textContent=date.getDay()===4?'小周末 🌿':WEEK_LABELS[date.getDay()];
      $('selectedDayTitle').textContent='今天要做';$('selectedDayHelper').textContent='顺序就是优先级。左滑操作，长按拖动排序。';
    } else if (selectedDayKey<todayKey){
      $('todayHeading').textContent=`${date.getMonth()+1}月${date.getDate()}日`;$('todayDate').textContent=`${weekday} · 回看`;$('dayPill').textContent='走过的';
      $('selectedDayTitle').textContent='这一天留下的';$('selectedDayHelper').textContent='这里只是回看。点击日期不会移动任何任务。';
    } else {
      $('todayHeading').textContent=`${date.getMonth()+1}月${date.getDate()}日`;$('todayDate').textContent=`${weekday} · 提前看看`;$('dayPill').textContent='还没到';
      $('selectedDayTitle').textContent='这一天会遇见';$('selectedDayHelper').textContent='固定安排与已放进这一天的事项，会一起出现在这里。';
    }
  }
  function selectDay(key){selectedDayKey=key;ensureDefaultsForDate(key);save();setPage(1);renderWeekDays();updateSelectedDayHeader();renderSelectedTasks()}

  function toggleWeek(force){
    const shouldOpen=typeof force==='boolean'?force:!$('weekShell').classList.contains('open');
    $('weekShell').classList.toggle('open',shouldOpen);$('weekToggle').setAttribute('aria-expanded',String(shouldOpen));
  }
  $('weekToggle').addEventListener('click',()=>toggleWeek());
  let pullStartX=null,pullStartY=null;
  $('todayPage').addEventListener('touchstart',event=>{
    if (event.target.closest('.task-card,button,input,select')) return;
    const touch=event.touches[0];pullStartX=touch.clientX;pullStartY=touch.clientY;
  },{passive:true});
  $('todayPage').addEventListener('touchend',event=>{
    if (pullStartY===null) return;
    const touch=event.changedTouches[0],dx=touch.clientX-pullStartX,dy=touch.clientY-pullStartY;
    pullStartX=pullStartY=null;
    if (Math.abs(dy)>Math.abs(dx)*1.15){
      if (dy>62 && $('todayPage').scrollTop<8) toggleWeek(true);
      if (dy<-55 && $('todayPage').scrollTop<80) toggleWeek(false);
    }
  },{passive:true});

  function tasksForDate(key){return state.tasks.filter(task=>task.date===key).sort((a,b)=>(a.order||0)-(b.order||0))}
  function futureTasks(){return state.tasks.filter(task=>task.date>todayKey).sort((a,b)=>a.date.localeCompare(b.date)||(a.order||0)-(b.order||0))}

  function completeTask(task,wrap){
    const completedAt=new Date().toISOString();
    state.completed.push({...task,sourceDate:task.date,completedAt,weekKey:ymd(mondayOf(new Date(completedAt)))});
    state.tasks=state.tasks.filter(item=>item.id!==task.id);save();wrap.classList.add('completing');
    setTimeout(()=>{renderAll();toast('已经放进本周收获')},320);
  }
  function deleteTask(task){state.tasks=state.tasks.filter(item=>item.id!==task.id);save();renderAll();toast('已删除')}

  function buildTaskWrap(task,{future=false,draggable=true}={}){
    const wrap=document.createElement('div');wrap.className='task-wrap';wrap.dataset.id=task.id;wrap.dataset.kind=task.kind;
    const date=parseYmd(task.date);const dateBlock=future?`<div class="datebox"><span>${date.getMonth()+1}月</span><strong>${date.getDate()}</strong><span>周${'日一二三四五六'[date.getDay()]}</span></div>`:'';
    wrap.innerHTML=`<div class="task-actions"><button class="task-action delete" type="button" aria-label="删除 ${escapeHTML(task.title)}">删除</button><button class="task-action reschedule" type="button" aria-label="改期 ${escapeHTML(task.title)}">改期</button><button class="task-action modify" type="button" aria-label="修改 ${escapeHTML(task.title)}">修改</button></div><div class="task-card${future?' future-task-card':''}" tabindex="0" aria-label="${escapeHTML(task.title)}。左滑显示操作${draggable?'，长按拖动排序':''}">${dateBlock}<button class="check" type="button" aria-label="完成 ${escapeHTML(task.title)}"></button><div class="task-text"><div class="task-title"><span class="category-dot"></span>${escapeHTML(task.title)}</div><div class="task-meta">${escapeHTML(task.meta || KIND[task.kind])}</div></div></div>`;
    wrap.querySelector('.delete').addEventListener('click',()=>deleteTask(task));
    wrap.querySelector('.reschedule').addEventListener('click',()=>openTaskCalendar(task));
    wrap.querySelector('.modify').addEventListener('click',()=>openEditTask(task));
    wrap.querySelector('.check').addEventListener('click',event=>{event.stopPropagation();completeTask(task,wrap)});
    bindTaskGestures(wrap,task,draggable);
    return wrap;
  }

  function bindTaskGestures(wrap,task,draggable){
    const card=wrap.querySelector('.task-card');
    let mode='idle',pointerId=null,startX=0,startY=0,lastY=0,startScroll=0,longPressTimer=null,ghost=null,grabOffsetY=0;
    let dragMove=null,dragUp=null,dragCancel=null;
    let scrollHost=null;
    const clearLongPress=()=>{if(longPressTimer){clearTimeout(longPressTimer);longPressTimer=null}};
    const closeOtherCards=()=>document.querySelectorAll('.task-card').forEach(other=>{if(other!==card)other.style.transform='translateX(0)'});

    function makeGhost(clientY){
      const rect=card.getBoundingClientRect();ghost=card.cloneNode(true);ghost.classList.add('drag-ghost');ghost.style.width=`${rect.width}px`;ghost.style.height=`${rect.height}px`;ghost.style.left=`${rect.left}px`;ghost.style.top=`${rect.top}px`;ghost.querySelectorAll('button').forEach(button=>button.tabIndex=-1);document.body.appendChild(ghost);grabOffsetY=clientY-rect.top;card.classList.add('dragging');wrap.classList.add('drag-active');
    }
    function reorderAt(clientY){
      if(!ghost)return;const list=wrap.parentElement;const ghostHeight=ghost.getBoundingClientRect().height;const center=clientY-grabOffsetY+ghostHeight/2;const others=[...list.querySelectorAll('.task-wrap')].filter(item=>item!==wrap);let before=null;
      for(const item of others){const rect=item.getBoundingClientRect();if(center<rect.top+rect.height/2){before=item;break}}
      if(before)list.insertBefore(wrap,before);else list.appendChild(wrap);
    }
    function moveGhost(clientY){
      if(!ghost)return;lastY=clientY;ghost.style.top=`${clientY-grabOffsetY}px`;reorderAt(clientY);const host=scrollHost||wrap.closest('.page');if(!host)return;const rect=host.getBoundingClientRect(),edge=70;if(clientY<rect.top+edge)host.scrollBy(0,-12);else if(clientY>rect.bottom-edge)host.scrollBy(0,12);
    }
    function removeDragListeners(){if(dragMove)document.removeEventListener('pointermove',dragMove,true);if(dragUp)document.removeEventListener('pointerup',dragUp,true);if(dragCancel)document.removeEventListener('pointercancel',dragCancel,true);dragMove=dragUp=dragCancel=null}
    function finishDrag(clientY,commit=true){
      if(commit&&Number.isFinite(clientY))reorderAt(clientY);if(ghost){ghost.remove();ghost=null}card.classList.remove('dragging');wrap.classList.remove('drag-active');removeDragListeners();
      if(commit){[...wrap.parentElement.querySelectorAll('.task-wrap')].forEach((element,index)=>{const record=state.tasks.find(item=>item.id===element.dataset.id);if(record&&record.date===selectedDayKey)record.order=index+1});save();renderFuture();toast('优先级顺序已更新')}
      mode='idle';pointerId=null;
    }
    function beginDrag(){
      mode='drag';makeGhost(lastY);dragMove=event=>{if(mode!=='drag'||event.pointerId!==pointerId)return;event.preventDefault();moveGhost(event.clientY)};dragUp=event=>{if(mode!=='drag'||event.pointerId!==pointerId)return;event.preventDefault();finishDrag(event.clientY,true)};dragCancel=event=>{if(mode!=='drag'||event.pointerId!==pointerId)return;finishDrag(lastY,false)};document.addEventListener('pointermove',dragMove,{capture:true,passive:false});document.addEventListener('pointerup',dragUp,{capture:true,passive:false});document.addEventListener('pointercancel',dragCancel,true);navigator.vibrate?.(10);
    }
    card.addEventListener('pointerdown',event=>{
      if(event.target.closest('button'))return;closeOtherCards();scrollHost=wrap.closest('.page');if(!scrollHost)return;pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;lastY=event.clientY;startScroll=scrollHost.scrollTop;mode='waiting';try{card.setPointerCapture(pointerId)}catch(_){}
      clearLongPress();if(draggable)longPressTimer=setTimeout(()=>{if(mode==='waiting')beginDrag()},380);
    });
    card.addEventListener('pointermove',event=>{
      if(event.pointerId!==pointerId||mode==='drag')return;lastY=event.clientY;const dx=event.clientX-startX,dy=event.clientY-startY;
      if(mode==='waiting'){if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)*1.15){clearLongPress();mode='swipe';card.style.transition='none'}else if(Math.abs(dy)>10){clearLongPress();mode='scroll'}}
      if(mode==='swipe'){event.preventDefault();card.style.transform=`translateX(${Math.max(-210,Math.min(0,dx))}px)`}else if(mode==='scroll'){event.preventDefault();scrollHost.scrollTop=startScroll-dy}
    },{passive:false});
    card.addEventListener('pointerup',event=>{
      if(event.pointerId!==pointerId||mode==='drag')return;clearLongPress();if(mode==='swipe'){const dx=event.clientX-startX;card.style.transition='';card.style.transform=dx<-48?'translateX(-210px)':'translateX(0)'}mode='idle';pointerId=null;
    });
    card.addEventListener('pointercancel',()=>{if(mode==='drag')return;clearLongPress();if(mode==='swipe'){card.style.transition='';card.style.transform='translateX(0)'}mode='idle';pointerId=null});
    card.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'){card.style.transform='translateX(-210px)';event.preventDefault();return}
      if(event.key==='ArrowRight'||event.key==='Escape'){card.style.transform='translateX(0)';event.preventDefault();return}
      if(draggable&&event.altKey&&(event.key==='ArrowUp'||event.key==='ArrowDown')){
        const sibling=event.key==='ArrowUp'?wrap.previousElementSibling:wrap.nextElementSibling;
        if(!sibling||!sibling.classList.contains('task-wrap'))return;
        if(event.key==='ArrowUp')wrap.parentElement.insertBefore(wrap,sibling);else wrap.parentElement.insertBefore(sibling,wrap);
        [...wrap.parentElement.querySelectorAll('.task-wrap')].forEach((element,index)=>{const record=state.tasks.find(item=>item.id===element.dataset.id);if(record&&record.date===selectedDayKey)record.order=index+1});
        save();renderFuture();toast('优先级顺序已更新');card.focus();event.preventDefault();
      }
    });
    card.addEventListener('contextmenu',event=>event.preventDefault());
  }

  function renderSelectedTasks(){
    const list=$('selectedTasks');list.innerHTML='';const tasks=tasksForDate(selectedDayKey);
    if(!tasks.length){list.innerHTML=`<div class="empty-state">${selectedDayKey<todayKey?'这一天没有遗留下来的事项。':'这一天暂时很空。'}</div>`;return}
    tasks.forEach(task=>list.appendChild(buildTaskWrap(task,{draggable:true})));
  }
  function renderFuture(){
    const list=$('futureList');list.innerHTML='';const tasks=futureTasks();
    if(!tasks.length){list.innerHTML='<div class="empty-state">未来还很空。想到什么，就先放进河里。</div>';return}
    tasks.forEach(task=>list.appendChild(buildTaskWrap(task,{future:true,draggable:false})));
  }

  function renderWishes(){
    const list=$('wishList');list.innerHTML='';const wishes=state.wishes.slice().sort((a,b)=>(a.order||0)-(b.order||0));
    if(!wishes.length){list.innerHTML='<div class="empty-state">机会池还很空。想到什么，再轻轻放进来。</div>';return}
    wishes.forEach(wish=>{
      const item=document.createElement('div');item.className='wish-item';
      const icon=wish.kind==='reading'?'📚':wish.kind==='sport'?'🏊':wish.kind==='study'?'📝':wish.kind==='research'?'🔬':wish.kind==='rest'?'🌿':'✨';
      item.innerHTML=`<div class="wish-icon">${icon}</div><div class="wish-copy"><div class="wish-title">${escapeHTML(wish.title)}</div><div class="task-meta">${escapeHTML(wish.meta)}</div></div><div class="wish-actions"><button class="icon-btn edit-wish" type="button" aria-label="修改 ${escapeHTML(wish.title)}">✎</button><button class="icon-btn delete-wish" type="button" aria-label="删除 ${escapeHTML(wish.title)}">×</button></div>`;
      item.querySelector('.edit-wish').addEventListener('click',()=>openEditWish(wish));item.querySelector('.delete-wish').addEventListener('click',()=>{state.wishes=state.wishes.filter(item=>item.id!==wish.id);save();renderWishes();toast('已从想做移除')});list.appendChild(item);
    });
  }

  let editRecord=null;
  function openEditTask(task){editRecord={type:'task',item:task};$('editHeading').textContent='修改事项';$('editTitle').value=task.title;$('editKind').value=task.kind;showModal($('editModal'))}
  function openEditWish(wish){editRecord={type:'wish',item:wish};$('editHeading').textContent='修改想做';$('editTitle').value=wish.title;$('editKind').value=wish.kind;showModal($('editModal'))}
  $('editCancel').addEventListener('click',()=>hideModal($('editModal')));
  $('editSave').addEventListener('click',()=>{
    if(!editRecord)return;const title=$('editTitle').value.trim();if(!title){toast('先写下这件事');return}
    editRecord.item.title=title;editRecord.item.kind=$('editKind').value;editRecord.item.meta=editRecord.type==='wish'?`${KIND[editRecord.item.kind]} · 想起来再做`:`${KIND[editRecord.item.kind]} · 已编辑`;save();hideModal($('editModal'));renderAll();toast('已保存');
  });

  let calendarMode='add',calendarTask=null,calendarSelected=todayKey,calendarView=new Date(today.getFullYear(),today.getMonth(),1,12),calendarMin=todayKey;
  function openCalendar({mode,task=null,selected=todayKey,min=null}){
    calendarMode=mode;calendarTask=task;calendarSelected=selected;calendarMin=min;const date=parseYmd(selected)||today;calendarView=new Date(date.getFullYear(),date.getMonth(),1,12);$('dateHeading').textContent=mode==='task'?'改期':'选择日期';$('dateSave').textContent=mode==='task'?'确认改期':'用这个日期';drawCalendar();showModal($('dateModal'));
  }
  function drawCalendar(){
    $('calTitle').textContent=`${calendarView.getFullYear()}年 ${calendarView.getMonth()+1}月`;$('calGrid').innerHTML='';
    const first=new Date(calendarView.getFullYear(),calendarView.getMonth(),1,12),offset=(first.getDay()+6)%7,start=new Date(calendarView.getFullYear(),calendarView.getMonth(),1-offset,12);
    for(let i=0;i<42;i++){
      const date=new Date(start);date.setDate(start.getDate()+i);const key=ymd(date);const button=document.createElement('button');button.type='button';button.className='cal-day';button.textContent=date.getDate();button.setAttribute('aria-label',friendlyDate(key));
      if(date.getMonth()!==calendarView.getMonth())button.classList.add('out');if(key===todayKey)button.classList.add('current');if(key===calendarSelected)button.classList.add('selected');if(calendarMin&&key<calendarMin)button.disabled=true;
      button.addEventListener('click',()=>{calendarSelected=key;calendarView=new Date(date.getFullYear(),date.getMonth(),1,12);drawCalendar()});$('calGrid').appendChild(button);
    }
    $('selectedDateText').textContent=`选中：${friendlyDate(calendarSelected)}`;
  }
  $('prevMonth').addEventListener('click',()=>{calendarView=new Date(calendarView.getFullYear(),calendarView.getMonth()-1,1,12);drawCalendar()});$('nextMonth').addEventListener('click',()=>{calendarView=new Date(calendarView.getFullYear(),calendarView.getMonth()+1,1,12);drawCalendar()});$('dateCancel').addEventListener('click',()=>hideModal($('dateModal')));
  $('dateSave').addEventListener('click',()=>{
    if(calendarMode==='task'&&calendarTask){calendarTask.date=calendarSelected;calendarTask.meta=`${KIND[calendarTask.kind]} · 已改期`;save();hideModal($('dateModal'));renderAll();toast('已改期');return}
    addSelectedDate=calendarSelected;setAddDestination(calendarSelected===todayKey?'today':'future',false);hideModal($('dateModal'));
  });
  function openTaskCalendar(task){openCalendar({mode:'task',task,selected:task.date,min:null})}

  let addDestination='today',addSelectedDate=todayKey,pendingAdd=null,refinedSuggestion='';
  function setAddDestination(destination,resetDate=true){
    addDestination=destination;document.querySelectorAll('[data-destination]').forEach(button=>button.classList.toggle('active',button.dataset.destination===destination));$('addDateRow').classList.toggle('hidden',destination==='wish');
    if(resetDate){if(destination==='today')addSelectedDate=todayKey;if(destination==='future'&&addSelectedDate<=todayKey)addSelectedDate=tomorrowKey}
    $('addDateText').textContent=friendlyDate(addSelectedDate);
  }
  function openAdd(){
    $('addTitle').value='';$('addKind').value='life';addSelectedDate=todayKey;setAddDestination(pageIndex===0?'wish':pageIndex===2?'future':'today');showModal($('addModal'));setTimeout(()=>$('addTitle').focus(),160);
  }
  $('fab').addEventListener('click',openAdd);$('addCancel').addEventListener('click',()=>hideModal($('addModal')));document.querySelectorAll('[data-destination]').forEach(button=>button.addEventListener('click',()=>setAddDestination(button.dataset.destination)));$('openAddCalendar').addEventListener('click',()=>openCalendar({mode:'add',selected:addSelectedDate,min:todayKey}));

  function seemsVague(title,kind){
    const clean=title.trim().replace(/[，。！？,.!?\s]/g,'');const broad=['科研','学习','工作','论文','写论文','复习','看书','阅读','备考','项目','实习','运动'];const actions=['整理','完成','修改','写','读','看完','复习到','汇总','查找','搜索','筛选','练习','跑','分析','翻译','准备','提交','联系','列出','核对','背','听','做'];
    return ['study','research','work','reading'].includes(kind)&&(broad.includes(clean)||(clean.length<=5&&!actions.some(word=>clean.includes(word))));
  }
  function commitAdd(payload,titleOverride=null){
    const title=(titleOverride||payload.title).trim();
    if(payload.destination==='wish'){
      state.wishes.push({id:uid(),title,kind:payload.kind,meta:`${KIND[payload.kind]} · 想起来再做`,order:state.wishes.length+1});save();hideModal($('addModal'));hideModal($('refineModal'));renderAll();setPage(0);toast('已经放进想做');return;
    }
    const date=payload.destination==='today'?todayKey:payload.date;const sameDay=state.tasks.filter(task=>task.date===date);state.tasks.push({id:uid(),title,kind:payload.kind,date,meta:`${KIND[payload.kind]} · 新添加`,order:Math.max(0,...sameDay.map(task=>Number(task.order)||0))+1,auto:false});save();hideModal($('addModal'));hideModal($('refineModal'));renderAll();
    if(date===todayKey){selectedDayKey=todayKey;renderWeekDays();updateSelectedDayHeader();renderSelectedTasks();setPage(1);toast('已经放进今天')}else{setPage(2);toast('已经放进未来')}
  }
  function openRefine(payload){
    pendingAdd=payload;refinedSuggestion='';$('refineOriginal').textContent=`“${payload.title}”`;$('refineContext').value='';$('refineStage').value='';$('refineFirst').value='';$('refineOutput').value='';$('refinePreview').classList.add('hidden');$('refineSuggestion').textContent='';$('useSuggestion').disabled=true;
    $('q1Label').textContent=payload.kind==='study'?'这是哪门课 / 哪项考试？':payload.kind==='research'?'这是哪个研究 / 项目？':payload.kind==='work'?'这是哪项工作 / 哪个项目？':'这具体是哪件事？';hideModal($('addModal'));showModal($('refineModal'));
  }
  $('addContinue').addEventListener('click',()=>{
    const title=$('addTitle').value.trim();if(!title){toast('先写下这件事');return}const payload={title,kind:$('addKind').value,destination:addDestination,date:addSelectedDate};if(addDestination!=='wish'&&seemsVague(title,payload.kind))openRefine(payload);else commitAdd(payload);
  });
  $('buildSuggestion').addEventListener('click',()=>{
    if(!pendingAdd)return;const context=$('refineContext').value.trim(),stage=$('refineStage').value.trim(),first=$('refineFirst').value.trim(),output=$('refineOutput').value.trim();if(!first){toast('先写下你准备做的第一步');$('refineFirst').focus();return}let suggestion=first;if(context&&!suggestion.includes(context))suggestion+=`｜${context}`;if(output)suggestion+=`，做到：${output}`;else if(stage)suggestion+=`（从“${stage}”继续）`;refinedSuggestion=suggestion;$('refineSuggestion').textContent=suggestion;$('refinePreview').classList.remove('hidden');$('useSuggestion').disabled=false;
  });
  $('keepOriginal').addEventListener('click',()=>pendingAdd&&commitAdd(pendingAdd));$('useSuggestion').addEventListener('click',()=>pendingAdd&&refinedSuggestion&&commitAdd(pendingAdd,refinedSuggestion));

  function thisWeekCompleted(){return state.completed.filter(item=>item.weekKey===weekKey)}
  function renderHarvestCount(){$('harvestCount').textContent=`${thisWeekCompleted().length} 件`}
  function renderHarvest(){
    const items=thisWeekCompleted();const counts={};items.forEach(item=>counts[item.kind]=(counts[item.kind]||0)+1);$('harvestColors').innerHTML='';
    Object.keys(counts).forEach(kind=>{const count=counts[kind],palette=CAT[kind]||CAT.life,step=Math.min(Math.max(count-1,0),palette.ramp.length-1),shade=palette.ramp[step],card=document.createElement('div');card.className='harvest-color';card.style.background=shade;card.style.borderColor=shade;card.innerHTML=`<div class="hc-top"><span>${KIND[kind]||kind}</span><span class="hc-count">${count}次 · ${step+1}/${palette.ramp.length}</span></div><div class="hc-note">${count===1?'刚留下第一点颜色':count<4?'颜色正在慢慢长出来':count<8?'这一块已经很有存在感了':'已经走到这条色阶很深的地方了'}</div>`;if(step>=6){card.style.color='#fff';card.querySelectorAll('.hc-count,.hc-note').forEach(node=>node.style.color='rgba(255,255,255,.82)')}$('harvestColors').appendChild(card)});
    if(!$('harvestColors').children.length)$('harvestColors').innerHTML='<div class="simple-card" style="grid-column:1/-1;margin:0"><h3>还没有颜色。</h3><p>完成第一件事以后，这里就会开始留下痕迹。</p></div>';
    const log=$('harvestLog');log.innerHTML='';const grouped={};items.slice().sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt)).forEach(item=>{const key=ymd(new Date(item.completedAt));(grouped[key]||=[]).push(item)});
    Object.entries(grouped).forEach(([key,entries])=>{const date=parseYmd(key),section=document.createElement('div');section.className='harvest-day';section.innerHTML=`<div class="harvest-day-label">${cnDate(date)}</div>`;entries.forEach(item=>{const row=document.createElement('div');row.className='harvest-entry';row.innerHTML=`<i style="background:${CAT[item.kind]?.color||'#ccc'}"></i><span>${escapeHTML(item.title)}</span>`;section.appendChild(row)});log.appendChild(section)});
    if(!items.length)log.innerHTML='<div class="task-meta" style="white-space:normal">这周还没有完成记录。</div>';
  }
  $('harvestBtn').addEventListener('click',()=>{renderHarvest();showModal($('harvestModal'))});$('closeHarvest').addEventListener('click',()=>hideModal($('harvestModal')));

  document.querySelectorAll('.modal-back').forEach(modal=>modal.addEventListener('click',event=>{if(event.target===modal)hideModal(modal)}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')hideAllModals()});

  function renderAll(){renderWeekDays();updateSelectedDayHeader();renderSelectedTasks();renderFuture();renderWishes();renderHarvestCount()}
  renderWeekGrid();renderAll();setPage(1);
})();
