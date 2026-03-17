(function(){
// === Dynamic Injection ===
// 1. Inject thanks text at the end of article content
var ac = document.querySelector('.article-content') || document.querySelector('article');
if(ac) {
  var thanks = document.createElement('div');
  thanks.className = 'share-thanks';
  thanks.innerHTML = '如果你喜欢这篇文章，请分享给更多人 ❤️';
  ac.appendChild(thanks);
}

// 2. Inject share button right next to tags in article footer
var shareWrap = document.createElement('div');
shareWrap.className = 'share-wrap';
shareWrap.innerHTML = 
  '<button class="share-trigger" onclick="toggleShare()">↗ 分享</button>'+
  '<div class="share-dd" id="shareDD">'+
    '<a id="sTwitter" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter</a>'+
    '<a id="sWeibo" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="#E6162D"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.583.631.283.822.997.442 1.574zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.095-.307-.371-.168-.603.141-.229.437-.348.673-.246.239.09.315.369.184.596zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.642 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zM17.343 6.065c-.609-1.394-2.066-2.08-3.269-1.544-1.178.525-1.706 1.963-1.182 3.221.033.086.073.163.109.244l-.042.019c-.943.4-2.576 1.426-3.544 3.062-1.123 1.907-.946 3.886.488 5.291 1.467 1.44 4.005 1.907 6.322.935C18.649 16.267 20 13.971 20 11.439c-.003-.939-.161-2.207-.479-3.125-.169-.487-.361-.903-.668-1.28-.048-.056-.081-.138-.13-.194l.08-.037c1.326-.557 1.574-2.071.54-2.738z"/></svg> 微博</a>'+
    '<button id="sCopy">🔗 复制链接</button>'+
  '</div>';

var tagsSec = document.querySelector('.article-footer .article-tags');
if(tagsSec) {
  tagsSec.style.width = '100%';
  tagsSec.appendChild(shareWrap);
} else {
  var footer = document.querySelector('.article-footer');
  if(footer) {
    var sec = document.createElement('section');
    sec.className = 'article-tags';
    sec.style.width = '100%';
    sec.appendChild(shareWrap);
    footer.insertBefore(sec, footer.firstChild);
  }
}

// Setup share links
var et=encodeURIComponent(document.title), eu=encodeURIComponent(window.location.href);
var sT=document.getElementById('sTwitter'), sW=document.getElementById('sWeibo');
if(sT) sT.href='https://twitter.com/intent/tweet?text='+et+'&url='+eu;
if(sW) sW.href='https://service.weibo.com/share/share.php?title='+et+'&url='+eu;
window.toggleShare=function(){var d=document.getElementById('shareDD');if(!d)return;var isMobile=window.innerWidth<=768;if(isMobile){var btn=d.parentElement.querySelector('.share-trigger');if(btn){var r=btn.getBoundingClientRect();if(!d.classList.contains('show')){d.style.cssText='display:flex;position:fixed;top:'+(r.bottom+8)+'px;left:50%;transform:translateX(-50%);right:auto;animation:none;flex-direction:row';d.classList.add('show');}else{d.classList.remove('show');d.style.cssText='';}}else{d.classList.toggle('show');}}else{d.classList.toggle('show');}};
document.addEventListener('click',function(e){if(!e.target.closest('.share-wrap')){var d=document.getElementById('shareDD');if(d)d.classList.remove('show');}});
var cb=document.getElementById('sCopy');
if(cb) cb.onclick=function(e){e.stopPropagation();var b=this;navigator.clipboard.writeText(window.location.href).then(function(){b.textContent='\u2713 \u5df2\u590d\u5236';setTimeout(function(){b.textContent='\uD83D\uDD17 \u590d\u5236\u94fe\u63a5';},2000);});};

})();

