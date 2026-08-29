/* The Whitelabel Desk — analytics loader.
   Google Tag Manager container. GA4 is configured INSIDE GTM.
   Swap GTM_ID here and it changes across every page. */
(function () {
  if (window.__WLD_ANALYTICS) return;
  window.__WLD_ANALYTICS = true;

  var GTM_ID = 'GTM-W7FQHJD6';
  var SITE = 'whitelabeldigitalmarketing.us';

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ site_name: SITE, site_brand: 'The Whitelabel Desk' });

  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', GTM_ID);

  /* remember where the visitor entered the site and what campaign sent them,
     so the desk request email carries it even though the form lives on its own page */
  try {
    var ss = window.sessionStorage;
    if (ss && !ss.getItem('wld_landing')) {
      ss.setItem('wld_landing', location.pathname + location.search);
      ss.setItem('wld_referrer', document.referrer || 'direct');
      var q = new URLSearchParams(location.search), utm = [];
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) {
        if (q.get(k)) utm.push(k + '=' + q.get(k));
      });
      ss.setItem('wld_utm', utm.join(' | '));
    }
  } catch (err) {}

  function stamp() {
    var map = { referrer: 'wld_referrer', landing: 'wld_landing', utm: 'wld_utm' };
    document.querySelectorAll('input[data-fill]').forEach(function (el) {
      var key = map[el.getAttribute('data-fill')];
      if (!key) return;
      var v = '';
      try { v = window.sessionStorage.getItem(key) || ''; } catch (err) {}
      if (el.getAttribute('data-fill') === 'referrer' && !v) v = document.referrer || 'direct';
      if (el.getAttribute('data-fill') === 'landing' && !v) v = location.pathname;
      el.value = v || 'none';
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stamp);
  } else {
    stamp();
  }

  function formName(form) {
    if (form.getAttribute('data-form-name')) return form.getAttribute('data-form-name');
    var subj = ((form.querySelector('input[name="subject"]') || {}).value || '').toLowerCase();
    if (subj.indexOf('desk request') > -1) return 'open_a_desk';
    if (subj.indexOf('newsletter') > -1 || subj.indexOf('subscribe') > -1) return 'newsletter';
    if (form.querySelector('textarea')) return 'open_a_desk';
    return 'unknown';
  }

  function eventName(name) {
    return name === 'newsletter' ? 'newsletter_subscribe' : 'desk_request_submit';
  }

  document.addEventListener(
    'submit',
    function (e) {
      var f = e.target;
      if (!f || f.tagName !== 'FORM') return;
      var name = formName(f);
      var need = (f.querySelector('[name="need"]') || {}).value || '';
      var accounts = (f.querySelector('[name="account_count"]') || {}).value || '';
      var cap = (f.querySelector('[name="capacity"]') || {}).value || '';
      window.dataLayer.push({
        event: eventName(name),
        form_name: name,
        service_requested: need,
        account_band: accounts,
        capacity_model: cap,
        form_destination: f.getAttribute('action') || '',
        site_name: SITE,
        page_path: location.pathname,
        page_title: document.title
      });
    },
    true
  );

  /* thank-you page = the reliable conversion signal */
  if (/thank-you/i.test(location.pathname)) {
    window.dataLayer.push({
      event: 'form_conversion',
      form_name: 'open_a_desk',
      site_name: SITE,
      page_path: location.pathname
    });
  }

  /* outbound clicks to the sister properties */
  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="http"]') : null;
      if (!a) return;
      var host = '';
      try { host = new URL(a.href).hostname; } catch (err) { return; }
      if (host && host.indexOf(SITE) === -1) {
        window.dataLayer.push({
          event: 'outbound_click',
          outbound_host: host,
          link_text: (a.textContent || '').trim().slice(0, 80),
          site_name: SITE,
          page_path: location.pathname
        });
      }
    },
    true
  );
})();
