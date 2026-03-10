(function () {
  var match = document.cookie.match(/(?:^|;\s*)lili_user=([^;]*)/);
  var adminLink = document.querySelector('#main-menu a[href*="auth.liliwiki.com/admin"]');

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
})();
