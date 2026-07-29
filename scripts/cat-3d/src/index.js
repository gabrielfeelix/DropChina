/**
 * dc-cat-3d — ícones 3D das categorias da home.
 *
 * Um único contexto WebGL para a grid inteira: um canvas sobreposto aos
 * cards, cada modelo renderizado na região (scissor) do seu próprio card.
 * Render sob demanda — nada é redesenhado enquanto ninguém interage, e o
 * loop para quando a grid sai da viewport.
 */
import * as THREE from 'three';
import { buildCategory } from './models.js';

const REST_Y = -0.38;              // rotação de repouso (3/4 view)
const SPIN = 1.15;                 // rad/s no hover
const DIR = new THREE.Vector3(1, 0.55, 1.25).normalize();
const PAD = 10;                    // folga da região limpa (card sobe 3px no hover)
const MAX_DPR = 1.5;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function contactShadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 62);
  grad.addColorStop(0, 'rgba(13,17,21,0.50)');
  grad.addColorStop(0.5, 'rgba(13,17,21,0.16)');
  grad.addColorStop(1, 'rgba(13,17,21,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let SHADOW_TEX = null;

class CatGrid {
  constructor(root) {
    this.root = root;
    this.cards = Array.from(root.querySelectorAll('[data-cat3d-key]'))
      .map((card) => ({ card, art: card.querySelector('[data-cat3d-art]'), key: card.dataset.cat3dKey }))
      .filter((c) => c.art && c.key);
    if (!this.cards.length) return;

    this.animating = new Set();
    this.running = false;
    this.visible = false;
    this.clock = new THREE.Clock();

    if (!this._initGL()) return;
    this._buildModels();
    this._observe();
    this._bindPointer();
    root.classList.add('dc-cat3d-on');
    this.layout();
    this.renderAll();
    if (!reduceMotion) this._intro();
  }

  _initGL() {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        // regiões inativas mantêm os pixels do frame anterior — é o que
        // permite redesenhar só o card que está girando
        preserveDrawingBuffer: true,
        powerPreference: 'low-power',
      });
    } catch (e) {
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.autoClear = false;
    renderer.setClearAlpha(0);
    this.renderer = renderer;

    const canvas = renderer.domElement;
    canvas.className = 'dc-cat3d__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    this.root.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 7, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.5);
    fill.position.set(-5, 3, -4);
    scene.add(fill);
    this.scene = scene;

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
    return true;
  }

  _buildModels() {
    if (!SHADOW_TEX) SHADOW_TEX = contactShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: SHADOW_TEX,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });

    for (const c of this.cards) {
      let model;
      try {
        model = buildCategory(c.key);
      } catch (e) {
        c.dead = true;
        continue;
      }
      // sem shadow map — a sombra de contato é uma decalque no chão
      model.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = false;
          o.receiveShadow = false;
        }
      });

      const pivot = new THREE.Group();
      pivot.add(model);
      pivot.rotation.y = REST_Y;
      pivot.visible = false;
      this.scene.add(pivot);

      const box = new THREE.Box3().setFromObject(model);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      // gira em torno do próprio eixo vertical, não do canto do bounding box
      model.position.x -= sphere.center.x;
      model.position.z -= sphere.center.z;

      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.scale.setScalar(sphere.radius * 2.6);
      shadow.position.y = box.min.y + 0.002;
      pivot.add(shadow);

      c.pivot = pivot;
      c.center = new THREE.Vector3(0, sphere.center.y, 0);
      c.dist = (sphere.radius / Math.tan((this.camera.fov * Math.PI) / 360)) * 1.1;
      c.baseY = REST_Y;
      c.hover = 0;   // 0..1, dirige zoom/lift
      c.spin = 0;    // velocidade angular atual
      c.target = 0;  // 1 enquanto hover/foco
    }
    this.cards = this.cards.filter((c) => !c.dead);
  }

  /* ---- geometria dos cards em px CSS relativos ao canvas ---- */
  layout() {
    const r = this.root.getBoundingClientRect();
    this.w = Math.max(1, Math.round(r.width));
    this.h = Math.max(1, Math.round(r.height));
    this.renderer.setSize(this.w, this.h, false);
    this.measureAll(r);
    this.overlap = this._anyOverlap();
  }

  measureAll(rootRect) {
    const r = rootRect || this.root.getBoundingClientRect();
    for (const c of this.cards) this.measure(c, r);
  }

  /** Em telas estreitas a caixa de arte (130 px fixos) transborda o card e as
   *  regiões se encostam — aí limpar a região de um card apagaria o vizinho.
   *  Nesse caso o frame redesenha a grid inteira em vez de só o card ativo. */
  _anyOverlap() {
    const cs = this.cards;
    for (let i = 0; i < cs.length; i++) {
      for (let j = i + 1; j < cs.length; j++) {
        const a = cs[i], b = cs[j];
        if (
          a.x - PAD < b.x + b.w + PAD && b.x - PAD < a.x + a.w + PAD &&
          a.y - PAD < b.y + b.h + PAD && b.y - PAD < a.y + a.h + PAD
        ) return true;
      }
    }
    return false;
  }

  measure(c, rootRect) {
    const r = rootRect || this.root.getBoundingClientRect();
    const a = c.art.getBoundingClientRect();
    c.x = a.left - r.left;
    c.y = a.top - r.top;
    c.w = Math.max(1, a.width);
    c.h = Math.max(1, a.height);
  }

  _place(c) {
    const cam = this.camera;
    cam.aspect = c.w / c.h;
    const dist = c.dist * (1 - 0.05 * c.hover);
    cam.position.copy(c.center).addScaledVector(DIR, dist);
    cam.near = Math.max(dist / 100, 0.01);
    cam.far = dist * 100;
    cam.updateProjectionMatrix();
    cam.lookAt(c.center);
  }

  drawCard(c, clearPad) {
    const pad = clearPad ? PAD : 0;
    const x = Math.max(0, Math.floor(c.x - pad));
    const y = Math.max(0, Math.floor(c.y - pad));
    const w = Math.min(this.w - x, Math.ceil(c.w + pad * 2));
    const h = Math.min(this.h - y, Math.ceil(c.h + pad * 2));
    if (w <= 0 || h <= 0) return;

    const r = this.renderer;
    // limpa só a região do card (y invertido: WebGL conta de baixo)
    r.setScissorTest(true);
    r.setScissor(x, this.h - y - h, w, h);
    r.setViewport(x, this.h - y - h, w, h);
    r.clear(true, true, false);

    // o modelo em si desenha na caixa da arte, não no retângulo com folga
    r.setViewport(c.x, this.h - c.y - c.h, c.w, c.h);
    this._place(c);
    c.pivot.visible = true;
    r.render(this.scene, this.camera);
    c.pivot.visible = false;
    r.setScissorTest(false);
  }

  renderAll() {
    const r = this.renderer;
    r.setScissorTest(false);
    r.setViewport(0, 0, this.w, this.h);
    r.clear(true, true, false);
    for (const c of this.cards) this.drawCard(c, false);
  }

  /* ---- loop sob demanda ---- */
  wake(c) {
    this.animating.add(c);
    if (this.running || !this.visible) return;
    this.running = true;
    this.clock.getDelta();
    this.renderer.setAnimationLoop(this._tick);
  }

  sleep() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  _tick = () => {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const rootRect = this.root.getBoundingClientRect();
    const full = this.overlap;
    if (full) this.measureAll(rootRect);
    for (const c of Array.from(this.animating)) {
      // o card sobe 3px no hover — remede antes de desenhar
      if (!full) this.measure(c, rootRect);
      const targetSpin = c.target ? SPIN : 0;
      c.spin += (targetSpin - c.spin) * Math.min(1, dt * 6);
      c.hover += (c.target - c.hover) * Math.min(1, dt * 8);
      c.pivot.rotation.y += c.spin * dt;

      if (!c.target && Math.abs(c.spin) < 0.02) {
        // volta ao ângulo de repouso pelo caminho mais curto
        let d = ((c.baseY - c.pivot.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI;
        c.pivot.rotation.y += d * Math.min(1, dt * 7);
        if (Math.abs(d) < 0.004 && c.hover < 0.01) {
          c.pivot.rotation.y = c.baseY;
          c.hover = 0;
          c.spin = 0;
          if (!full) this.drawCard(c, true);
          this.animating.delete(c);
          continue;
        }
      }
      if (!full) this.drawCard(c, true);
    }
    if (full) this.renderAll();
    if (!this.animating.size) this.sleep();
  };

  _intro() {
    // revelação única: cada card dá meia volta escalonada ao entrar em cena
    this.introDone = false;
  }

  runIntro() {
    if (this.introDone) return;
    this.introDone = true;
    this.cards.forEach((c, i) => {
      setTimeout(() => {
        if (!this.visible) return;
        c.pivot.rotation.y = REST_Y - Math.PI * 0.85;
        c.spin = SPIN * 1.6;
        this.wake(c);
      }, 90 * i);
    });
  }

  /* ---- entrada/saída de viewport ---- */
  _observe() {
    this.io = new IntersectionObserver((entries) => {
      const on = entries[0].isIntersecting;
      this.visible = on;
      if (on) {
        this.layout();
        this.renderAll();
        if (!reduceMotion) this.runIntro();
        if (this.animating.size) this.wake(this.cards[0]);
      } else {
        this.sleep();
      }
    }, { rootMargin: '120px' });
    this.io.observe(this.root);

    let raf = 0;
    this.ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        this.layout();
        this.renderAll();
      });
    });
    this.ro.observe(this.root);
  }

  _bindPointer() {
    if (reduceMotion) return;
    for (const c of this.cards) {
      const on = () => { c.target = 1; this.wake(c); };
      const off = () => { c.target = 0; this.wake(c); };
      c.card.addEventListener('pointerenter', on);
      c.card.addEventListener('pointerleave', off);
      c.card.addEventListener('focusin', on);
      c.card.addEventListener('focusout', off);
    }
  }

  destroy() {
    this.sleep();
    this.io && this.io.disconnect();
    this.ro && this.ro.disconnect();
    this.renderer && this.renderer.dispose();
    this.renderer && this.renderer.domElement.remove();
    this.root.classList.remove('dc-cat3d-on');
  }
}

const mounted = new WeakMap();

function init(scope) {
  const roots = (scope || document).querySelectorAll('[data-dc-cat3d]');
  roots.forEach((root) => {
    if (mounted.has(root)) return;
    mounted.set(root, new CatGrid(root));
  });
}

init();
document.addEventListener('shopify:section:load', (e) => init(e.target));
document.addEventListener('shopify:section:unload', (e) => {
  e.target.querySelectorAll('[data-dc-cat3d]').forEach((root) => {
    const g = mounted.get(root);
    if (g) { g.destroy && g.destroy(); mounted.delete(root); }
  });
});
