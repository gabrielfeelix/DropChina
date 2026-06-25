/* DropChina — distingue imagem CONTEXTUAL (foto ambientada, com fundo) de CUTOUT
   (produto em fundo branco/transparente) lendo os 4 cantos via canvas.
   • Foto contextual  -> classe .dc-fill no <img> + .dc-has-fill no host  -> preenche o card (cover)
   • Cutout           -> nada muda -> segue contain no card cinza (look da marca)
   Requer CORS (Shopify CDN responde Access-Control-Allow-Origin: *). Se o canvas
   ficar "tainted", cai no catch e mantém o contain — sem regressão.
   Marque imgs com data-dc-fit e o card pai com data-dc-fit-host. */
(function () {
  if (window.__dcImageFit) return;
  window.__dcImageFit = true;

  function isPhoto(probe) {
    var c = document.createElement('canvas');
    var w = (c.width = 26), h = (c.height = 26);
    var ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(probe, 0, 0, w, h);
    var pts = [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]];
    var plain = 0;
    for (var i = 0; i < pts.length; i++) {
      var d = ctx.getImageData(pts[i][0], pts[i][1], 1, 1).data;
      var mx = Math.max(d[0], d[1], d[2]), mn = Math.min(d[0], d[1], d[2]);
      if (d[3] < 24 || (mx > 233 && mx - mn < 18)) plain++; // transparente OU branco/cinza-claro
    }
    return plain < 3; // menos de 3 cantos "lisos" => foto contextual
  }

  function classify(img) {
    var src = img.currentSrc || img.getAttribute('src') || img.src;
    if (!src) return;
    var small = /[?&]width=\d+/.test(src)
      ? src.replace(/([?&])width=\d+/, '$1width=72')
      : src + (src.indexOf('?') > -1 ? '&' : '?') + 'width=72';
    var probe = new Image();
    probe.crossOrigin = 'anonymous';
    probe.onload = function () {
      try {
        if (isPhoto(probe)) {
          img.classList.add('dc-fill');
          var host = img.closest('[data-dc-fit-host]');
          if (host) host.classList.add('dc-has-fill');
        }
      } catch (e) { /* canvas tainted: mantém contain */ }
    };
    probe.onerror = function () {};
    probe.src = small;
  }

  function run() {
    var imgs = document.querySelectorAll('img[data-dc-fit]');
    for (var i = 0; i < imgs.length; i++) classify(imgs[i]);
  }

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
