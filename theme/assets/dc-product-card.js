// DropChina Product Card: AJAX add-to-cart + wishlist toggle
// Wireado em qualquer .dc-card no DOM (via delegação no document).

(function () {
  'use strict';

  // Helper: cart add via AJAX e abre o sidedrawer
  function addToCart(variantId, button) {
    if (!variantId) return;
    button.classList.add('is-loading');
    var originalHtml = button.innerHTML;
    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.55"/></svg><span>Adicionando…</span>';

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: [{ id: parseInt(variantId, 10), quantity: 1 }] })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('cart_add_failed');
        return r.json();
      })
      .then(function () {
        return fetch('/cart.js').then(function (r) { return r.json(); });
      })
      .then(function (cart) {
        button.classList.remove('is-loading');
        button.classList.add('is-success');
        button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Adicionado</span>';

        // Atualiza badge do header
        document.querySelectorAll('[data-dc-cart-count]').forEach(function (b) {
          b.textContent = cart.item_count;
          b.hidden = cart.item_count === 0;
        });

        // Dispatcha eventos pro sidedrawer ouvir
        document.dispatchEvent(new CustomEvent('cart:add', { detail: { resource: cart } }));
        document.dispatchEvent(new CustomEvent('dc:cart:open'));

        // Reset button após 1.5s
        setTimeout(function () {
          button.classList.remove('is-success');
          button.innerHTML = originalHtml;
        }, 1500);
      })
      .catch(function (err) {
        console.error('[DC Card] cart add falhou', err);
        button.classList.remove('is-loading');
        button.innerHTML = originalHtml;
        // Fallback: redireciona /cart
      });
  }

  // Helper: wishlist toggle (localStorage + customer metafield se logado)
  var STORAGE_KEY = 'dc:wishlist';

  function readWishlist() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function writeWishlist(ids) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (e) {}
  }
  function toggleWishlist(productId, button) {
    var ids = readWishlist();
    var idx = ids.indexOf(productId);
    var active;
    if (idx >= 0) {
      ids.splice(idx, 1);
      active = false;
    } else {
      ids.push(productId);
      active = true;
    }
    writeWishlist(ids);
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active);
    button.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');

    // Sincroniza outros cards do mesmo produto na página
    document.querySelectorAll('[data-dc-wish][data-product-id="' + productId + '"]').forEach(function (b) {
      if (b === button) return;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active);
    });

    // Sync com customer metafield se logado (best-effort)
    if (window.DC_CUSTOMER_ID) {
      // Customer metafields só podem ser atualizados via Customer Account API ou app
      // No theme não tem endpoint pra isso. Mantemos só local por enquanto.
    }
  }

  function applyStoredWishlist() {
    var ids = readWishlist();
    if (!ids.length) return;
    document.querySelectorAll('[data-dc-wish]').forEach(function (btn) {
      var pid = btn.dataset.productId;
      if (ids.indexOf(parseInt(pid, 10)) >= 0 || ids.indexOf(pid) >= 0) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      }
    });
  }

  // Event delegation
  document.addEventListener('click', function (e) {
    var addBtn = e.target.closest('[data-dc-add]');
    if (addBtn) {
      e.preventDefault();
      e.stopPropagation();
      var variantId = addBtn.dataset.variantId;
      addToCart(variantId, addBtn);
      return;
    }
    var wishBtn = e.target.closest('[data-dc-wish]');
    if (wishBtn) {
      e.preventDefault();
      e.stopPropagation();
      var pid = parseInt(wishBtn.dataset.productId, 10);
      toggleWishlist(pid, wishBtn);
      return;
    }
  });

  // Sync wishlist state ao carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyStoredWishlist);
  } else {
    applyStoredWishlist();
  }
})();
