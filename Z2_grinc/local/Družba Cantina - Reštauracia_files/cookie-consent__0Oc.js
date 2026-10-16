(function () {
	'use strict';

	var COOKIE_NAME = 'druzba_cookie_consent';
	var COOKIE_DAYS = 365;

	function getCookieDomain() {
		var host = location.hostname;
		if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
			return '';
		}
		var parts = host.split('.');
		if (parts.length >= 2) {
			return '.' + parts.slice(-2).join('.');
		}
		return '';
	}

	function getCookie(name) {
		var escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
		var match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
		return match ? decodeURIComponent(match[1]) : null;
	}

	function setCookie(name, value, days) {
		var expires = '';
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + days * 86400000);
			expires = '; expires=' + date.toUTCString();
		}
		var secure = location.protocol === 'https:' ? '; Secure' : '';
		var domain = getCookieDomain();
		document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax' + secure;
	}

	function clearLegacyStorage() {
		try {
			localStorage.removeItem(COOKIE_NAME);
			sessionStorage.removeItem(COOKIE_NAME);
		} catch (e) {}
	}

	function hasStoredChoice() {
		var value = getCookie(COOKIE_NAME);
		return value === 'accepted' || value === 'rejected';
	}

	function hideBanner(banner) {
		banner.classList.remove('cookie-consent--visible');
		banner.setAttribute('aria-hidden', 'true');
		setTimeout(function () {
			banner.remove();
		}, 350);
	}

	function showBanner(banner) {
		banner.removeAttribute('hidden');
		banner.setAttribute('aria-hidden', 'false');
		requestAnimationFrame(function () {
			banner.classList.add('cookie-consent--visible');
		});
	}

	clearLegacyStorage();

	var banner = document.getElementById('cookie-consent');
	if (!banner) return;

	if (hasStoredChoice()) {
		banner.remove();
		return;
	}

	showBanner(banner);

	var acceptBtn = banner.querySelector('[data-cookie-accept]');
	var rejectBtn = banner.querySelector('[data-cookie-reject]');

	if (acceptBtn) {
		acceptBtn.addEventListener('click', function () {
			setCookie(COOKIE_NAME, 'accepted', COOKIE_DAYS);
			hideBanner(banner);
		});
	}

	if (rejectBtn) {
		rejectBtn.addEventListener('click', function () {
			setCookie(COOKIE_NAME, 'rejected', COOKIE_DAYS);
			hideBanner(banner);
		});
	}
})();
