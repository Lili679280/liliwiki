(function(){
  var app = window.LiliCommentsApp || {};
  var reportType = '';
  var reportTargetId = '';

  window.openReport = function(type, targetId){
    if(!app.getCurUser || !app.getCurUser()) return;
    reportType = type;
    reportTargetId = targetId;
    var modal = document.getElementById('reportModal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'reportModal';
      modal.className = 'report-modal';
      modal.innerHTML = '<div class="report-modal-content"><h3 style="font-size:1.5rem;margin-bottom:.8rem">\u4e3e\u62a5</h3><button class="report-opt" onclick="submitReport(\'\u8bc4\u8bba\u5185\u5bb9\u8fdd\u89c4\')">\u8bc4\u8bba\u5185\u5bb9\u8fdd\u89c4</button><button class="report-opt" onclick="submitReport(\'\u5934\u50cf\u8fdd\u89c4\')">\u5934\u50cf\u8fdd\u89c4</button><button style="width:100%;margin-top:.6rem;padding:.6rem;background:none;border:1px solid var(--card-separator-color,#ddd);border-radius:8px;font-size:1.2rem;cursor:pointer;color:var(--card-text-color-tertiary)" onclick="closeReport()">\u53d6\u6d88</button></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function(e){ if(e.target === modal) closeReport(); });
    }
    modal.classList.add('show');
  };

  window.closeReport = function(){
    var modal = document.getElementById('reportModal');
    if(modal) modal.classList.remove('show');
  };

  window.submitReport = function(reason){
    closeReport();
    var tid = reportTargetId;
    if(!app.postAPI) return;
    app.postAPI('/api/report', { type: reportType, targetId: tid, reason: reason, pageUrl: window.location.href }).then(function(d){
      var toast = document.createElement('div');
      toast.className = 'report-toast';
      if(d.ok){
        toast.textContent = d.message || '\u4e3e\u62a5\u5df2\u63d0\u4ea4';
        document.body.appendChild(toast);
        setTimeout(function(){ toast.remove(); }, 2500);
        var el = document.getElementById('c-' + tid);
        if(el){
          var btns = el.querySelectorAll('.c-btn.report');
          btns.forEach(function(b){
            b.textContent = '\u2705 \u5df2\u4e3e\u62a5';
            b.disabled = true;
            b.style.color = '#16a34a';
            b.onclick = null;
          });
        }
      } else {
        toast.style.background = '#ef4444';
        toast.textContent = d.error || '\u4e3e\u62a5\u5931\u8d25';
        document.body.appendChild(toast);
        setTimeout(function(){ toast.remove(); }, 2500);
      }
    }).catch(function(){
      var toast = document.createElement('div');
      toast.className = 'report-toast';
      toast.style.background = '#ef4444';
      toast.textContent = '\u7f51\u7edc\u9519\u8bef';
      document.body.appendChild(toast);
      setTimeout(function(){ toast.remove(); }, 2500);
    });
  };
})();
