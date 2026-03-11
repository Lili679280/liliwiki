(function () {
  var match = document.cookie.match(/(?:^|;\s*)lili_user=([^;]*)/);
  var adminLink = document.querySelector('#main-menu a[href*="auth.liliwiki.com/admin"]');
  var darkModeToggle = document.getElementById('dark-mode-toggle');

  function updateThemeLabel() {
    if (!darkModeToggle) return;
    var label = darkModeToggle.querySelector('span');
    if (!label) return;
    var scheme = document.documentElement.dataset.scheme === 'dark' ? 'dark' : 'light';
    darkModeToggle.classList.remove('scheme-light', 'scheme-dark');
    darkModeToggle.classList.add(scheme === 'dark' ? 'scheme-dark' : 'scheme-light');
    label.textContent = scheme === 'dark' ? '暗色模式' : '浅色模式';
  }

  if (adminLink) {
    adminLink.closest('li').style.display = 'none';
  }

  if (match) {
    var decoded = decodeURIComponent(match[1]);
    var parts = decoded.split(':');
    var username = parts[0];
    var role = parts[1] || 'user';

    var loginLinks = document.querySelectorAll('#main-menu a[href*="auth.liliwiki.com/login"]');
    loginLinks.forEach(function (link) {
      var label = link.querySelector('span');
      if (label) label.textContent = username;
      link.href = 'https://auth.liliwiki.com/dashboard';
    });

    if ((role === 'admin' || role === 'sub_admin') && adminLink) {
      adminLink.closest('li').style.display = '';
    }
  } else {
    var guestLinks = document.querySelectorAll('#main-menu a[href*="auth.liliwiki.com/login"]');
    guestLinks.forEach(function (link) {
      link.href = 'https://auth.liliwiki.com/login?redirect=' + encodeURIComponent(window.location.href);
    });
  }

  updateThemeLabel();
  window.addEventListener('onColorSchemeChange', updateThemeLabel);
})();
