// DropChina custom predictive search
// Carregado via <script src="{{ 'dc-search.js' | asset_url }}"> no snippet

(function() {
  if (window.__dcSearchInit) {
    console.log('[DC Search] Already initialized, skipping');
    return;
  }
  window.__dcSearchInit = true;
  console.log('[DC Search] Script loaded');

  var dcSearchTimer = null;
  var dcSearchAbort = null;

  function initDcSearch() {
    var input = document.querySelector('.dc-search-input__field');
    var results = document.querySelector('.dc-search-input__results');
    var wrapper = document.querySelector('.dc-search-input__results-wrapper');

    console.log('[DC Search] Init', {
      input: !!input,
      results: !!results,
      wrapper: !!wrapper
    });

    if (!input || !results || !wrapper) {
      console.warn('[DC Search] Missing elements, aborting init');
      return;
    }

    wrapper.hidden = true;

    input.addEventListener('input', function(e) {
      var q = input.value.trim();
      console.log('[DC Search] Input event:', q);

      if (dcSearchTimer) clearTimeout(dcSearchTimer);
      if (dcSearchAbort) dcSearchAbort.abort();

      if (!q) {
        wrapper.hidden = true;
        results.innerHTML = '';
        return;
      }

      dcSearchTimer = setTimeout(function() {
        dcSearchAbort = new AbortController();
        var url = '/search/suggest?section_id=predictive-search&q=' + encodeURIComponent(q) +
                  '&resources%5Blimit%5D=8&resources%5Btype%5D=product%2Ccollection';
        console.log('[DC Search] Fetching:', url);

        fetch(url, { signal: dcSearchAbort.signal })
          .then(function(r) {
            console.log('[DC Search] Response status:', r.status);
            return r.text();
          })
          .then(function(html) {
            console.log('[DC Search] HTML length:', html.length);
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var section = doc.querySelector('#shopify-section-predictive-search');
            console.log('[DC Search] Section found:', !!section);
            if (section) {
              results.innerHTML = section.innerHTML;
              wrapper.hidden = false;
              wrapper.style.display = 'block';
              console.log('[DC Search] Injected. Results children:', results.children.length);
            } else {
              console.warn('[DC Search] Section not found. HTML preview:', html.slice(0, 300));
            }
          })
          .catch(function(err) {
            if (err.name !== 'AbortError') console.error('[DC Search] Fetch error:', err);
          });
      }, 200);
    });

    input.addEventListener('blur', function() {
      setTimeout(function() { wrapper.hidden = true; }, 200);
    });

    input.addEventListener('focus', function() {
      if (results.innerHTML.trim()) wrapper.hidden = false;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDcSearch);
  } else {
    initDcSearch();
  }
})();
