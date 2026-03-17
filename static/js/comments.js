(function(){
  var app = window.LiliCommentsApp = window.LiliCommentsApp || {};
  var API='https://auth.liliwiki.com', pageUrl=window.location.pathname;
  var curUser=null, isAdmin=false, replyTo=null, allComments=[], folded=true, mainSortMode='hot';
  app.replyTo = app.replyTo || null;
  app.replyTargetName = app.replyTargetName || null;
  app.currentDetailId = app.currentDetailId || null;
  app.detailSortMode = app.detailSortMode || 'hot';
  var COLORS=['#667eea','#764ba2','#e74c3c','#2ecc71','#f39c12','#1abc9c','#e91e63','#9b59b6','#3498db','#e67e22'];
  function hc(s){var h=0;for(var i=0;i<s.length;i++){h=s.charCodeAt(i)+((h<<5)-h);}return COLORS[Math.abs(h)%COLORS.length];}

  function doLogin(){
    document.getElementById('cmtWriteBtn').style.display='none';
    document.getElementById('cmtLoginLink').style.display='';
    document.getElementById('cmtLoginLink').href=API+'/login?redirect='+encodeURIComponent(window.location.href);
  }

  function initComments(){
    if(initComments.done) return;
    initComments.done=true;
    fetch(API+'/api/me',{credentials:'include'}).then(function(r){return r.json();}).then(function(d){
      var u=d.user||d;
      if(u&&u.email){
        curUser=u; isAdmin=u.role==='admin'||u.role==='sub_admin';
        document.getElementById('cmtWriteBtn').style.display='';
        document.getElementById('cmtLoginLink').style.display='none';
      } else { doLogin(); }
    }).catch(function(){ doLogin(); });
    loadCmts();
  }

  function scheduleCommentInit(){
    var root=document.getElementById('comments');
    if(!root||typeof IntersectionObserver==='undefined'){initComments();return;}
    var observer=new IntersectionObserver(function(entries){
      if(entries[0]&&entries[0].isIntersecting){
        observer.disconnect();
        initComments();
      }
    },{rootMargin:'260px 0px'});
    observer.observe(root);
  }

  // === Toggle form ===
  window.toggleForm=function(){
    var f=document.getElementById('cmtForm');
    f.classList.toggle('show');
    if(f.classList.contains('show')) document.getElementById('cmtInput').focus();
  };

  // === Load & render comments ===
  scheduleCommentInit();
  var cmtInput=document.getElementById('cmtInput'),cmtCharEl=document.getElementById('cmtChar'),cmtCharWrap=cmtCharEl.parentElement;
  function autoResize(){cmtInput.style.height='auto';cmtInput.style.height=Math.min(cmtInput.scrollHeight,200)+'px';}
  function updateFloatLabel(){if(cmtInput.value.length>0){cmtInput.classList.add('has-content');}else{cmtInput.classList.remove('has-content');}}
  function updateCharColor(){var l=cmtInput.value.length;cmtCharWrap.className='cmt-char'+(l>900?' danger':l>700?' warn':'');}
  cmtInput.addEventListener('input',function(){cmtCharEl.textContent=this.value.length;autoResize();updateFloatLabel();updateCharColor();});
  cmtInput.addEventListener('focus',function(){autoResize();});
  cmtInput.addEventListener('blur',function(){if(!this.value){this.style.height='';}});
  document.getElementById('cmtSend').addEventListener('click',submitCmt);

  // === Emoji picker (categorized, Unicode escapes to avoid encoding corruption) ===
  var EMOJI_CATS=[
    {icon:'\ud83d\ude00',name:'\u7b11\u8138',list:['\ud83d\ude00','\ud83d\ude04','\ud83d\ude01','\ud83d\ude06','\ud83d\ude05','\ud83d\ude02','\ud83d\ude0a','\ud83d\ude42','\ud83d\ude43','\ud83d\ude09','\ud83d\ude0d','\ud83d\ude18','\ud83d\ude1a','\ud83d\ude19','\ud83d\ude0b','\ud83d\ude1b','\ud83d\ude1c','\ud83d\ude1d','\ud83d\ude0f','\ud83d\ude12','\ud83d\ude1e','\ud83d\ude14','\ud83d\ude22','\ud83d\ude2d','\ud83d\ude29','\ud83d\ude24','\ud83d\ude21','\ud83d\ude31','\ud83d\ude28','\ud83d\ude30','\ud83d\ude33','\ud83d\ude32','\ud83d\ude35','\ud83d\ude37','\ud83d\ude0e','\ud83d\ude11','\ud83d\ude36','\ud83d\ude10','\ud83d\ude2c','\ud83d\ude34','\ud83d\ude0c','\ud83d\ude2e','\ud83d\ude2f','\ud83d\ude26','\ud83d\ude27','\ud83d\ude13','\ud83d\ude15','\ud83d\ude23','\ud83d\ude16','\ud83d\ude2b','\ud83d\udc7b','\ud83d\udc7d','\ud83d\udc7f','\ud83d\udca9']},
    {icon:'\ud83d\udc4d',name:'\u624b\u52bf',list:['\ud83d\udc4d','\ud83d\udc4e','\ud83d\udc4a','\u270a','\ud83d\udc4f','\ud83d\ude4c','\ud83d\udc50','\ud83d\ude4f','\ud83d\udcaa','\ud83d\udc46','\ud83d\udc47','\ud83d\udc48','\ud83d\udc49','\u270b','\ud83d\udc4b','\ud83d\udc4c','\u270c','\ud83d\udc40']},
    {icon:'\u2764',name:'\u7b26\u53f7',list:['\u2764','\ud83d\udc9b','\ud83d\udc9a','\ud83d\udc99','\ud83d\udc9c','\ud83d\udc94','\ud83d\udc93','\ud83d\udc97','\ud83d\udc96','\ud83d\udc98','\ud83d\udc9d','\u2728','\ud83d\udcab','\ud83d\udd25','\ud83d\udcaf','\ud83d\udca2','\ud83d\udca5','\ud83d\udca6','\ud83d\udca8','\u2705','\u274c','\u2757','\u2753','\ud83d\udca1','\ud83d\udd14','\ud83d\udce3','\ud83d\ude80','\u2b50','\u2600','\ud83c\udf19','\ud83c\udf08']},
    {icon:'\ud83d\udc36',name:'\u52a8\u7269',list:['\ud83d\udc36','\ud83d\udc31','\ud83d\udc2d','\ud83d\udc39','\ud83d\udc30','\ud83d\udc3b','\ud83d\udc3c','\ud83d\udc28','\ud83d\udc2f','\ud83d\udc2e','\ud83d\udc37','\ud83d\udc38','\ud83d\udc35','\ud83d\ude48','\ud83d\ude49','\ud83d\ude4a','\ud83d\udc12','\ud83d\udc14','\ud83d\udc27','\ud83d\udc26','\ud83d\udc24','\ud83d\udc3a','\ud83d\udc17','\ud83d\udc34','\ud83d\udc1d','\ud83d\udc1b','\ud83d\udc0c','\ud83d\udc1e','\ud83d\udc1c','\ud83d\udc3e']},
    {icon:'\ud83c\udf54',name:'\u98df\u7269',list:['\ud83c\udf4e','\ud83c\udf4a','\ud83c\udf4b','\ud83c\udf4c','\ud83c\udf49','\ud83c\udf47','\ud83c\udf53','\ud83c\udf51','\ud83c\udf52','\ud83c\udf45','\ud83c\udf55','\ud83c\udf54','\ud83c\udf5f','\ud83c\udf5c','\ud83c\udf63','\ud83c\udf71','\ud83c\udf5b','\ud83c\udf5d','\ud83c\udf70','\ud83c\udf82','\ud83c\udf69','\ud83c\udf6a','\ud83c\udf6b','\ud83c\udf6c','\ud83c\udf6d','\u2615','\ud83c\udf75','\ud83c\udf7a','\ud83c\udf7b','\ud83c\udf77']},
    {icon:'\ud83c\udf89',name:'\u6d3b\u52a8',list:['\u26bd','\ud83c\udfc0','\ud83c\udfbe','\ud83c\udfb1','\ud83c\udfaf','\ud83c\udfae','\ud83c\udfb2','\ud83c\udfac','\ud83c\udfa4','\ud83c\udfa7','\ud83c\udfb5','\ud83c\udfb6','\ud83c\udfb9','\ud83c\udfb8','\ud83c\udfc6','\ud83c\udf89','\ud83c\udf8a','\ud83c\udf88','\ud83c\udf81','\ud83d\udcf7','\ud83d\udcbb','\ud83d\udcda','\ud83d\udcdd','\ud83d\udd28','\ud83d\udd27','\ud83d\udce6']}
  ];
  var emojiPanel=document.getElementById('emojiPanel');
  var emojiCurCat=0, emojiSwitching=false;
  function renderEmojiPanel(){
    var tabs='<div class="emoji-tabs">';
    EMOJI_CATS.forEach(function(cat,i){tabs+='<button class="emoji-tab'+(i===emojiCurCat?' active':'')+'" onclick="switchEmojiCat('+i+')">'+cat.icon+'</button>';});
    tabs+='</div>';
    var grid='<div class="emoji-grid">';
    EMOJI_CATS[emojiCurCat].list.forEach(function(e){grid+='<button type="button" onclick="insertEmoji(\''+e+'\')">'+e+'</button>';});
    grid+='</div>';
    emojiPanel.innerHTML=tabs+grid;
  }
  window.switchEmojiCat=function(i){emojiSwitching=true;emojiCurCat=i;renderEmojiPanel();setTimeout(function(){emojiSwitching=false;},0);};
  renderEmojiPanel();
  document.getElementById('emojiBtn').addEventListener('click',function(ev){ev.stopPropagation();emojiPanel.classList.toggle('show');});
  document.addEventListener('click',function(e){if(emojiSwitching)return;if(!e.target.closest('#emojiPanel')&&!e.target.closest('#emojiBtn')){emojiPanel.classList.remove('show');}});
  window.insertEmoji=function(emoji){
    var ta=document.getElementById('cmtInput');
    var start=ta.selectionStart, end=ta.selectionEnd;
    ta.value=ta.value.substring(0,start)+emoji+ta.value.substring(end);
    ta.selectionStart=ta.selectionEnd=start+emoji.length;
    ta.focus();
    cmtCharEl.textContent=ta.value.length;
    autoResize();updateFloatLabel();updateCharColor();
  };

  function loadCmts(){
    fetch(API+'/api/comments?url='+encodeURIComponent(pageUrl),{credentials:'include'}).then(function(r){return r.json();}).then(function(d){
      allComments=d.comments||[];
      var badge=document.getElementById('cmtCount');
      badge.textContent=allComments.length>0?allComments.length+' \u6761':'';
      if(app.currentDetailId){
        var detail=document.getElementById('cmtDetail');
        detail.style.display='';
        document.getElementById('cmtList').style.display='none';
        document.getElementById('cmtActions').style.display='none';
        document.querySelector('.cmt-sort-bar').style.display='none';
        if(window.renderCommentDetail) window.renderCommentDetail();
      } else {
        renderList();
      }
    }).catch(function(){document.getElementById('cmtList').innerHTML='<div class="cmt-empty"><p>\u8bc4\u8bba\u52a0\u8f7d\u5931\u8d25</p></div>';});
  }

  function getKids(){
    var kids={};
    allComments.forEach(function(c){if(c.parent_id){if(!kids[c.parent_id])kids[c.parent_id]=[];kids[c.parent_id].push(c);}});
    return kids;
  }

  function renderList(){
    var el=document.getElementById('cmtList');
    document.getElementById('cmtDetail').style.display='none';
    el.style.display='';
    if(!allComments.length){el.innerHTML='<div class="cmt-empty"><div class="cmt-empty-icon">\uD83D\uDCAC</div><p>\u6682\u65e0\u8bc4\u8bba\uff0c\u6765\u8bf4\u4e24\u53e5\u5427</p></div>';return;}
    var roots=[], kids=getKids();
    allComments.forEach(function(c){if(!c.parent_id) roots.push(c);});
    var sorted;
    if(mainSortMode==='time') sorted=roots.slice().sort(function(a,b){return Number(b.created_at)-Number(a.created_at);});
    else sorted=roots.slice().sort(function(a,b){return(b.likes||0)-(a.likes||0);});
    var show=folded&&sorted.length>3?sorted.slice(0,3):sorted;
    var h='';
    show.forEach(function(c){h+=renderC(c,kids);});
    if(folded&&sorted.length>3) h+='<button class="cmt-more" onclick="expandCmts()">\u5c55\u5f00\u5168\u90e8 '+sorted.length+' \u6761\u8bc4\u8bba</button>';
    else if(!folded&&sorted.length>3) h+='<button class="cmt-more" onclick="foldCmts()">\u6536\u8d77\u8bc4\u8bba</button>';
    el.innerHTML=h;
    document.getElementById('cmtMainSort').textContent='\u2630 '+(mainSortMode==='hot'?'\u6309\u70ed\u5ea6':'\u6309\u65f6\u95f4');
  }
  window.expandCmts=function(){folded=false;renderList();};
  window.foldCmts=function(){folded=true;renderList();};
  window.toggleMainSort=function(){mainSortMode=mainSortMode==='hot'?'time':'hot';renderList();};

  function fmtTime(ts){
    var d=new Date(Number(ts));
    if(isNaN(d.getTime())) return '\u672a\u77e5\u65f6\u95f4';
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());
  }

  function renderC(c,kids){
    var ts=fmtTime(c.created_at);
    var avatarH=c.avatar?'<span class="c-avatar"><img src="'+esc(c.avatar)+'" alt=""></span>':'<span class="c-avatar" style="background:'+hc(c.user_name||'?')+'">'+esc((c.user_name||'?')[0].toUpperCase())+'</span>';
    var lk=c.likes||0, lb=[];try{lb=JSON.parse(c.liked_by||'[]');}catch(e){}
    var liked=curUser&&lb.indexOf(curUser.email)!==-1;
    var replyH=curUser?'<button class="c-btn" onclick="replyTo(\''+c.id+'\',\''+esc(c.user_name)+'\')">\u56de\u590d</button>':'';
    var delH=isAdmin?'<button class="c-btn del" onclick="delCmt(\''+c.id+'\')">\u5220\u9664</button>':'';
    var reportH=curUser?'<button class="c-btn report" onclick="openReport(\'comment\',\''+c.id+'\')">\u26a0</button>':'';
    var likeH='<button class="c-btn'+(liked?' liked':'')+'" onclick="likeCmt(\''+c.id+'\')">'+'\uD83D\uDC4D'+(lk?' '+lk:'')+'</button>';
    var html='<div class="c-item" id="c-'+c.id+'">'+avatarH+'<div class="c-body"><div class="c-meta"><span class="c-name">'+esc(c.user_name)+'</span></div><div class="c-text">'+esc(c.content)+'</div><div class="c-actions"><span class="c-time">'+ts+'</span>'+replyH+'<div class="c-actions-right">'+likeH+reportH+delH+'</div></div>';
    var replies=kids[c.id];
    if(replies&&replies.length){
      var hotSorted=replies.slice().sort(function(a,b){return(b.likes||0)-(a.likes||0);});
      var top=hotSorted[0];
      var topLk=top.likes||0;
      html+='<div class="c-replies">';
      html+='<div class="c-reply-preview"><span class="c-rp-name">'+esc(top.user_name)+':</span>'+fmtReplyContent(top.content)+(topLk?'<span class="c-rp-like">\uD83D\uDC4D '+topLk+'</span>':'')+'</div>';
      html+='<button class="c-reply-expand" onclick="openDetail(\''+c.id+'\')">\u76f8\u5173\u56de\u590d\u5171'+replies.length+'\u6761 ></button>';
      html+='</div>';
    }
    html+='</div></div>';
    return html;
  }

  function fmtReplyContent(content){
    var m=content.match(/^\u56de\u590d @([^：:]+)[：:]\s*/);
    if(m) return '<span class="c-reply-to">\u56de\u590d @'+esc(m[1])+'</span>'+esc(content.substring(m[0].length));
    return esc(content);
  }

  function pad(n){return n<10?'0'+n:''+n;}
  function esc(s){return s?String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'):'';}
  function postAPI(p,d){return fetch(API+p,{method:'POST',credentials:'include',headers:{'Content-Type':'text/plain'},body:JSON.stringify(d)}).then(function(r){return r.json();});}
  app.getCurUser = function(){ return curUser; };
  app.isAdmin = function(){ return isAdmin; };
  app.getAllComments = function(){ return allComments; };
  app.getKids = getKids;
  app.renderComment = renderC;
  app.renderList = renderList;
  app.formatTime = fmtTime;
  app.formatReplyContent = fmtReplyContent;
  app.escapeHtml = esc;
  app.hashColor = hc;
  app.postAPI = postAPI;
  app.showAlert = showAlert;

  function submitCmt(){
    var input=document.getElementById('cmtInput'), content=input.value.trim();
    if(!content) return;
    if(app.replyTargetName) content='\u56de\u590d @'+app.replyTargetName+'\uff1a'+content;
    var btn=document.getElementById('cmtSend');
    btn.disabled=true; btn.textContent='\u53d1\u9001\u4e2d...';
    postAPI('/api/comments',{url:pageUrl,content:content,parent_id:app.replyTo||''}).then(function(d){
      btn.disabled=false; btn.textContent='\u53d1\u9001';
      if(d.error){showAlert(d.error);}
      else{input.value='';cmtCharEl.textContent='0';input.style.height='';input.classList.remove('has-content');cmtCharWrap.className='cmt-char';window.cancelReply();folded=false;loadCmts();}
    }).catch(function(){btn.disabled=false;btn.textContent='\u53d1\u9001';showAlert('\u53d1\u9001\u5931\u8d25');});
  }

  window.delCmt=function(id){if(!confirm('\u786e\u5b9a\u5220\u9664\uff1f'))return;postAPI('/api/comments/delete',{id:id}).then(function(d){if(d.ok)loadCmts();else showAlert(d.error||'\u5220\u9664\u5931\u8d25');});};
  window.likeCmt=function(id){postAPI('/api/comments/like',{id:id}).then(function(d){if(d.ok)loadCmts();else if(d.error)showAlert(d.error);});};

  function showAlert(msg){var el=document.getElementById('cmtAlert');el.textContent=msg;el.className='cmt-alert cmt-alert-error';el.style.display='block';setTimeout(function(){el.style.display='none';},3000);}

})();
