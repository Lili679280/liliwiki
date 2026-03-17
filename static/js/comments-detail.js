(function(){
  var app = window.LiliCommentsApp || {};

  function renderReply(c){
    var ts = app.formatTime(c.created_at);
    var esc = app.escapeHtml;
    var avatarH = c.avatar
      ? '<span class="c-avatar"><img src="' + esc(c.avatar) + '" alt=""></span>'
      : '<span class="c-avatar" style="background:' + app.hashColor(c.user_name || '?') + '">' + esc((c.user_name || '?')[0].toUpperCase()) + '</span>';
    var lk = c.likes || 0;
    var lb = [];
    try { lb = JSON.parse(c.liked_by || '[]'); } catch(e) {}
    var liked = app.getCurUser && app.getCurUser() && lb.indexOf(app.getCurUser().email) !== -1;
    var replyH = app.getCurUser && app.getCurUser() ? '<button class="c-btn" onclick="replyTo(\'' + c.id + '\',\'' + esc(c.user_name) + '\')">\u56de\u590d</button>' : '';
    var delH = app.isAdmin && app.isAdmin() ? '<button class="c-btn del" onclick="delCmt(\'' + c.id + '\')">\u5220\u9664</button>' : '';
    var reportH = app.getCurUser && app.getCurUser() ? '<button class="c-btn report" onclick="openReport(\'comment\',\'' + c.id + '\')">\u26a0</button>' : '';
    var likeH = '<button class="c-btn' + (liked ? ' liked' : '') + '" onclick="likeCmt(\'' + c.id + '\')">' + '\ud83d\udc4d' + (lk ? ' ' + lk : '') + '</button>';
    var textH = app.formatReplyContent(c.content);
    return '<div class="c-item">' + avatarH + '<div class="c-body"><div class="c-meta"><span class="c-name">' + esc(c.user_name) + '</span></div><div class="c-text">' + textH + '</div><div class="c-actions"><span class="c-time">' + ts + '</span>' + replyH + '<div class="c-actions-right">' + likeH + reportH + delH + '</div></div></div></div>';
  }

  window.openDetail = function(parentId){
    app.detailSortMode = 'hot';
    app.currentDetailId = parentId;
    var el = document.getElementById('cmtDetail');
    document.getElementById('cmtList').style.display = 'none';
    document.getElementById('cmtActions').style.display = 'none';
    document.querySelector('.cmt-sort-bar').style.display = 'none';
    var cmtForm = document.getElementById('cmtForm');
    if(cmtForm.classList.contains('show')) cmtForm.classList.remove('show');
    el.style.display = '';
    window.renderCommentDetail();
  };

  window.closeDetail = function(){
    document.getElementById('cmtActions').style.display = '';
    document.querySelector('.cmt-sort-bar').style.display = '';
    app.currentDetailId = null;
    app.renderList();
  };

  window.renderCommentDetail = function(){
    var parentId = app.currentDetailId;
    var el = document.getElementById('cmtDetail');
    var parent = null;
    var allComments = app.getAllComments();
    allComments.forEach(function(c){ if(String(c.id) === String(parentId)) parent = c; });
    if(!parent){ el.innerHTML = ''; return; }
    var kids = app.getKids();
    var h = '<div class="cmt-detail-header"><span class="cmt-detail-title">\u8bc4\u8bba\u8be6\u60c5</span><button class="cmt-detail-close" onclick="closeDetail()">\u2715</button></div>';
    h += app.renderComment(parent, {});
    var replies = kids[parentId] || [];
    if(!replies.length){
      allComments.forEach(function(c){ if(String(c.parent_id) === String(parentId)) replies.push(c); });
    }
    var sorted;
    if(app.detailSortMode === 'time') sorted = replies.slice().sort(function(a,b){ return Number(b.created_at) - Number(a.created_at); });
    else sorted = replies.slice().sort(function(a,b){ return (b.likes || 0) - (a.likes || 0); });
    var sortLabel = app.detailSortMode === 'hot' ? '\u6309\u70ed\u5ea6' : '\u6309\u65f6\u95f4';
    h += '<div class="cmt-detail-replies-header"><span>\u76f8\u5173\u56de\u590d\u5171' + replies.length + '\u6761</span><button class="cmt-sort-toggle" onclick="toggleDetailSort()">\u2630 ' + sortLabel + '</button></div>';
    h += '<div class="c-reply-list">';
    sorted.forEach(function(r){ h += renderReply(r); });
    h += '</div>';
    el.innerHTML = h;
  };

  window.toggleDetailSort = function(){
    app.detailSortMode = app.detailSortMode === 'hot' ? 'time' : 'hot';
    window.renderCommentDetail();
  };

  function findRootParent(id){
    var c = null;
    app.getAllComments().forEach(function(x){ if(x.id === id) c = x; });
    if(c && c.parent_id) return findRootParent(c.parent_id);
    return id;
  }

  window.replyTo = function(id, name){
    var rootId = findRootParent(id);
    var isReplyToReply = rootId !== id;
    app.replyTo = rootId;
    app.replyTargetName = isReplyToReply ? name : null;
    var f = document.getElementById('cmtForm');
    if(!f.classList.contains('show')) f.classList.add('show');
    var input = document.getElementById('cmtInput');
    var fl = document.querySelector('.cmt-float-label');
    if(fl) fl.textContent = '\u56de\u590d ' + name + '...';
    input.focus();
    var ex = document.getElementById('replyTag');
    if(ex) ex.remove();
    var tag = document.createElement('div');
    tag.id = 'replyTag';
    tag.className = 'reply-tag';
    tag.innerHTML = '\u56de\u590d <b>' + app.escapeHtml(name) + '</b> <button onclick="cancelReply()">\u2715</button>';
    var top = document.querySelector('.cmt-form-top');
    var closeBtn = top.querySelector('.cmt-form-close');
    top.insertBefore(tag, closeBtn);
  };

  window.cancelReply = function(){
    app.replyTo = null;
    app.replyTargetName = null;
    var fl = document.querySelector('.cmt-float-label');
    if(fl) fl.textContent = '\u8bf4\u70b9\u4ec0\u4e48...';
    var ex = document.getElementById('replyTag');
    if(ex) ex.remove();
  };
})();
