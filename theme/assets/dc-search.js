// DropChina predictive search — custom render via suggest.json
// Substitui a injection de section HTML (que vinha cheia de CSS do Tinker
// e gerava layout bagunçado) por render próprio simples e controlado.

(function() {
  if (window.__dcSearchInit) return;
  window.__dcSearchInit = true;

  var dcSearchTimer = null;
  var dcSearchAbort = null;

  function formatMoney(val) {
    // suggest.json retorna preço como string em reais (ex: "1989.00")
    var n = parseFloat(val);
    if (isNaN(n)) return '';
    return 'R$ ' + n.toFixed(2).replace('.', ',');
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render(data, q) {
    var products = (data.resources && data.resources.results && data.resources.results.products) || [];
    var collections = (data.resources && data.resources.results && data.resources.results.collections) || [];

    if (products.length === 0 && collections.length === 0) {
      return '<div class="dc-srch__empty">Nada encontrado pra <b>' + escapeHtml(q) + '</b>.<br><span>Tente outro termo ou veja todas as categorias.</span></div>';
    }

    var html = '<div class="dc-srch">';

    if (collections.length > 0) {
      html += '<div class="dc-srch__group"><div class="dc-srch__group-title">Coleções</div><ul class="dc-srch__collections">';
      collections.slice(0, 4).forEach(function(c) {
        html += '<li><a href="' + escapeHtml(c.url) + '" class="dc-srch__collection-chip">' + escapeHtml(c.title) + '</a></li>';
      });
      html += '</ul></div>';
    }

    if (products.length > 0) {
      html += '<div class="dc-srch__group"><div class="dc-srch__group-title">Produtos</div><ul class="dc-srch__products">';
      products.slice(0, 6).forEach(function(p) {
        var img = (p.featured_image && p.featured_image.url) || p.image || '';
        var price = p.price ? formatMoney(p.price) : '';
        var compareAt = (p.compare_at_price_max && parseInt(p.compare_at_price_max, 10) > parseInt(p.price, 10))
          ? formatMoney(p.compare_at_price_max) : null;
        html += '<li><a href="' + escapeHtml(p.url) + '" class="dc-srch__product">' +
          '<span class="dc-srch__product-img-wrap">' +
            (img ? '<img src="' + escapeHtml(img) + '&width=120" alt="' + escapeHtml(p.title) + '" loading="lazy" width="60" height="60">' : '') +
          '</span>' +
          '<span class="dc-srch__product-info">' +
            '<span class="dc-srch__product-vendor">' + escapeHtml(p.vendor || '') + '</span>' +
            '<span class="dc-srch__product-title">' + escapeHtml(p.title) + '</span>' +
            '<span class="dc-srch__product-price">' +
              (compareAt ? '<s>' + compareAt + '</s> ' : '') +
              '<b>' + price + '</b>' +
            '</span>' +
          '</span>' +
          '<svg class="dc-srch__product-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>' +
          '</a></li>';
      });
      html += '</ul></div>';
    }

    html += '<a href="/search?q=' + encodeURIComponent(q) + '" class="dc-srch__all">Ver todos os resultados →</a>';
    html += '</div>';
    return html;
  }

  function init() {
    var input = document.querySelector('.dc-search-input__field');
    var results = document.querySelector('.dc-search-input__results');
    var wrapper = document.querySelector('.dc-search-input__results-wrapper');
    if (!input || !results || !wrapper) return;

    wrapper.hidden = true;

    function positionDropdown() {
      var r = input.getBoundingClientRect();
      wrapper.style.position = 'fixed';
      wrapper.style.top = (r.bottom + 8) + 'px';
      wrapper.style.left = r.left + 'px';
      wrapper.style.width = r.width + 'px';
      wrapper.style.zIndex = '99999';
    }

    input.addEventListener('input', function() {
      var q = input.value.trim();
      if (dcSearchTimer) clearTimeout(dcSearchTimer);
      if (dcSearchAbort) dcSearchAbort.abort();

      if (!q) {
        wrapper.hidden = true;
        results.innerHTML = '';
        return;
      }

      dcSearchTimer = setTimeout(function() {
        dcSearchAbort = new AbortController();
        var url = '/search/suggest.json?q=' + encodeURIComponent(q) +
          '&resources[type]=product,collection&resources[limit]=8&resources[options][unavailable_products]=last';

        fetch(url, { signal: dcSearchAbort.signal, headers: { 'Accept': 'application/json' } })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            results.innerHTML = render(data, q);
            wrapper.hidden = false;
            wrapper.style.display = 'block';
            positionDropdown();
          })
          .catch(function(err) {
            if (err.name !== 'AbortError') console.error('[DC Search]', err);
          });
      }, 180);
    });

    input.addEventListener('blur', function() {
      setTimeout(function() {
        wrapper.hidden = true;
        wrapper.style.display = 'none';
      }, 180);
    });

    input.addEventListener('focus', function() {
      // Fecha megamenu pra não sobrepor o dropdown de busca
      var mega = document.querySelector('[data-dc-mega]');
      if (mega) mega.hidden = true;
      if (results.innerHTML.trim()) {
        wrapper.hidden = false;
        wrapper.style.display = 'block';
        positionDropdown();
      }
    });

    window.addEventListener('scroll', function() {
      if (!wrapper.hidden) positionDropdown();
    }, { passive: true });
    window.addEventListener('resize', function() {
      if (!wrapper.hidden) positionDropdown();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
