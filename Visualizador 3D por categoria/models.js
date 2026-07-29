import * as THREE from 'three';

/* ---- shared palette (3–5 materials, reused across every model) ---- */
export const MATS = {
  graphite: new THREE.MeshStandardMaterial({ name: 'graphite', color: '#2E373D', roughness: 0.42, metalness: 0.18 }),
  ink:      new THREE.MeshStandardMaterial({ name: 'ink',      color: '#1B2226', roughness: 0.55, metalness: 0.1 }),
  teal:     new THREE.MeshStandardMaterial({ name: 'teal',     color: '#1E93A8', roughness: 0.35, metalness: 0.22 }),
  yellow:   new THREE.MeshStandardMaterial({ name: 'yellow',   color: '#F3C233', roughness: 0.38, metalness: 0.12 }),
  shell:    new THREE.MeshStandardMaterial({ name: 'shell',    color: '#E4E9EC', roughness: 0.5,  metalness: 0.06 })
};

/* ---- primitives ---- */
function rrect(w, h, r) {
  const s = new THREE.Shape();
  const x = w / 2, y = h / 2;
  r = Math.max(0.0005, Math.min(r, x, y));
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y); s.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x, y - r);  s.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
  s.lineTo(-x + r, y); s.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-x, -y + r); s.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function extrude(shape, depth, mat, name, bevel) {
  const b = bevel === undefined ? Math.min(0.008, depth / 3) : bevel;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, depth - 2 * b), bevelEnabled: b > 0.0004,
    bevelThickness: b, bevelSize: b, bevelSegments: 1, curveSegments: 5
  });
  geo.translate(0, 0, -(depth - 2 * b) / 2);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  return m;
}

/** rounded box centred at origin, depth along z */
function rbox(w, h, d, r, mat, name) { return extrude(rrect(w, h, r), d, mat, name); }

function cyl(r, h, mat, name, seg = 14) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
  m.name = name;
  return m;
}

function at(mesh, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  return mesh;
}

function group(name, ...kids) {
  const g = new THREE.Group();
  g.name = name;
  kids.forEach(k => k && g.add(k));
  return g;
}

function fanUnit(r, name, bladeCount = 11) {
  const u = group(name);
  const frameShape = rrect(r * 2.06, r * 2.06, r * 0.42);
  frameShape.holes.push(new THREE.Path().absarc(0, 0, r * 1.02, 0, Math.PI * 2, true));
  u.add(extrude(frameShape, 0.026, MATS.ink, name + '_frame'));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, 0.005, 6, 20), MATS.graphite);
  ring.name = name + '_ring';
  u.add(ring);
  for (let i = 0; i < bladeCount; i++) {
    const bg = group(name + '_blade_g' + i);
    bg.add(at(rbox(r * 0.76, r * 0.56, 0.005, 0.002, MATS.teal, name + '_blade_' + i), r * 0.56, 0, 0, 0.62));
    bg.rotation.z = (i / bladeCount) * Math.PI * 2;
    u.add(bg);
  }
  u.add(at(cyl(r * 0.32, 0.022, MATS.graphite, name + '_hub'), 0, 0, 0.004, Math.PI / 2));
  u.rotation.x = -Math.PI / 2;
  return u;
}

function starShape(outer, inner, arms = 4, phase = 0) {
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / arms;
  const p = i => [Math.cos(phase + i * step) * outer, Math.sin(phase + i * step) * outer];
  s.moveTo(...p(0));
  for (let i = 0; i < arms; i++) {
    const a = phase + (i + 0.5) * step;
    s.quadraticCurveTo(Math.cos(a) * inner, Math.sin(a) * inner, ...p(i + 1));
  }
  return s;
}

/* ---- the 13 category objects ---- */
const BUILD = {
  'impressao-3d': () => {
    const g = group('printer3d');
    g.add(at(rbox(0.46, 0.05, 0.36, 0.016, MATS.shell, 'base'), 0, 0.025, 0));
    g.add(at(rbox(0.30, 0.014, 0.30, 0.008, MATS.ink, 'heatbed'), 0.05, 0.058, 0.02));
    g.add(at(rbox(0.10, 0.075, 0.10, 0.014, MATS.yellow, 'printed_part'), 0.05, 0.103, 0.02));
    g.add(at(rbox(0.10, 0.042, 0.012, 0.006, MATS.teal, 'display'), 0.15, 0.048, 0.185));
    // cantilever gantry: one column at the back-left, X-arm reaching right
    g.add(at(rbox(0.075, 0.44, 0.075, 0.014, MATS.shell, 'z_column'), -0.175, 0.27, -0.125));
    g.add(at(rbox(0.030, 0.40, 0.020, 0.006, MATS.ink, 'z_rail'), -0.175, 0.27, -0.083));
    g.add(at(rbox(0.40, 0.055, 0.075, 0.012, MATS.shell, 'x_arm'), 0.03, 0.315, -0.125));
    g.add(at(rbox(0.38, 0.020, 0.016, 0.005, MATS.ink, 'x_rail'), 0.04, 0.315, -0.080));
    const head = group('toolhead');
    head.add(rbox(0.085, 0.11, 0.075, 0.014, MATS.graphite, 'head_body'));
    head.add(at(cyl(0.028, 0.016, MATS.teal, 'head_fan'), 0, 0.012, 0.042, Math.PI / 2));
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.020, 0.040, 12), MATS.ink);
    nozzle.name = 'nozzle';
    head.add(at(nozzle, 0, -0.073, 0));
    g.add(at(head, 0.06, 0.245, -0.077));
    // filament spool on top of the column
    g.add(at(cyl(0.095, 0.055, MATS.teal, 'filament_spool'), -0.175, 0.545, -0.125, 0, 0, Math.PI / 2));
    g.add(at(cyl(0.032, 0.062, MATS.graphite, 'spool_hub'), -0.175, 0.545, -0.125, 0, 0, Math.PI / 2));
    const feed = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.145, 0.545, -0.125), new THREE.Vector3(-0.02, 0.44, -0.11),
      new THREE.Vector3(0.06, 0.34, -0.09)
    ]), 48, 0.008, 10, false), MATS.teal);
    feed.name = 'filament';
    g.add(feed);
    return g;
  },

  'cartuchos-tintas': () => {
    const g = group('ink_cartridge');
    g.add(at(rbox(0.22, 0.20, 0.17, 0.016, MATS.graphite, 'body'), 0, 0.185, 0));
    g.add(at(rbox(0.15, 0.055, 0.13, 0.014, MATS.ink, 'shoulder'), -0.02, 0.312, 0));
    g.add(at(rbox(0.115, 0.036, 0.10, 0.010, MATS.graphite, 'cap'), -0.02, 0.352, 0));
    g.add(at(rbox(0.19, 0.045, 0.145, 0.012, MATS.ink, 'head_base'), 0, 0.062, 0));
    g.add(at(rbox(0.115, 0.014, 0.085, 0.006, MATS.shell, 'nozzle_plate'), 0.01, 0.043, 0));
    g.add(at(rbox(0.09, 0.065, 0.008, 0.006, MATS.yellow, 'contacts'), -0.05, 0.132, 0.087));
    g.add(at(rbox(0.125, 0.065, 0.007, 0.006, MATS.shell, 'label'), 0.01, 0.235, 0.087));
    g.add(at(rbox(0.09, 0.016, 0.006, 0.005, MATS.teal, 'label_bar'), 0.0, 0.252, 0.091));
    g.add(at(rbox(0.05, 0.012, 0.006, 0.004, MATS.ink, 'label_code'), -0.02, 0.222, 0.091));
    return g;
  },

  toners: () => {
    const g = group('toner_laser');
    // hopper body (toner reservoir) with an angled top
    g.add(at(rbox(0.46, 0.13, 0.15, 0.018, MATS.graphite, 'hopper'), 0, 0.155, -0.03));
    g.add(at(rbox(0.42, 0.05, 0.13, 0.014, MATS.ink, 'hopper_top'), -0.01, 0.232, -0.045, -0.10));
    g.add(at(rbox(0.34, 0.026, 0.05, 0.010, MATS.ink, 'grip'), -0.02, 0.262, 0.012));
    // waste/drum section in front, with the photoconductor drum exposed
    g.add(at(rbox(0.44, 0.085, 0.10, 0.014, MATS.graphite, 'drum_shell'), 0, 0.108, 0.075));
    const drum = cyl(0.048, 0.40, MATS.shell, 'drum', 48);
    g.add(at(drum, 0, 0.050, 0.082, 0, 0, Math.PI / 2));
    [-0.215, 0.215].forEach((x, i) => {
      g.add(at(cyl(0.055, 0.030, MATS.ink, 'gear_' + i), x, 0.050, 0.082, 0, 0, Math.PI / 2));
      g.add(at(cyl(0.026, 0.040, MATS.teal, 'gear_hub_' + i), x, 0.050, 0.082, 0, 0, Math.PI / 2));
    });
    g.add(at(rbox(0.40, 0.022, 0.016, 0.006, MATS.ink, 'shutter_lever'), 0, 0.095, 0.128));
    g.add(at(rbox(0.15, 0.055, 0.006, 0.005, MATS.shell, 'label'), 0.14, 0.165, 0.048));
    g.add(at(rbox(0.10, 0.014, 0.006, 0.004, MATS.teal, 'label_bar'), 0.14, 0.178, 0.052));
    g.add(at(rbox(0.44, 0.018, 0.13, 0.008, MATS.ink, 'foot'), 0, 0.010, -0.03));
    return g;
  },

  impressoras: () => {
    const g = group('printer');
    g.add(at(rbox(0.42, 0.17, 0.32, 0.026, MATS.graphite, 'body'), 0, 0.115, 0));
    g.add(at(rbox(0.40, 0.05, 0.30, 0.02, MATS.ink, 'lid'), 0, 0.215, -0.01));
    g.add(at(rbox(0.30, 0.024, 0.20, 0.006, MATS.shell, 'paper_out'), 0, 0.055, 0.20));
    const feed = at(rbox(0.28, 0.22, 0.008, 0.006, MATS.shell, 'paper_feed'), 0, 0.315, -0.12, -0.34);
    g.add(feed);
    g.add(at(rbox(0.11, 0.035, 0.008, 0.008, MATS.teal, 'display'), -0.12, 0.135, 0.162));
    g.add(at(cyl(0.011, 0.01, MATS.teal, 'power_led'), 0.15, 0.135, 0.162, Math.PI / 2));
    return g;
  },

  'placas-de-video': () => {
    const g = group('gpu');
    g.add(at(rbox(0.54, 0.010, 0.21, 0.006, MATS.graphite, 'pcb'), 0, 0.026, 0));
    g.add(at(rbox(0.52, 0.008, 0.20, 0.006, MATS.shell, 'backplate'), 0, 0.014, 0));
    // shroud with three fan openings punched right through it
    const shroudShape = rrect(0.52, 0.20, 0.014);
    [-0.165, 0, 0.165].forEach(x =>
      shroudShape.holes.push(new THREE.Path().absarc(x, 0, 0.058, 0, Math.PI * 2, true)));
    const shroud = extrude(shroudShape, 0.058, MATS.graphite, 'shroud');
    shroud.rotation.x = -Math.PI / 2;
    shroud.position.y = 0.062;
    g.add(shroud);
    [-0.165, 0, 0.165].forEach((x, i) => {
      const f = fanUnit(0.053, 'fan' + i);
      f.position.set(x, 0.072, 0);
      g.add(f);
    });
    g.add(at(rbox(0.17, 0.008, 0.022, 0.003, MATS.yellow, 'pcie_fingers'), -0.115, 0.020, 0.112));
    g.add(at(rbox(0.014, 0.085, 0.21, 0.006, MATS.shell, 'io_bracket'), -0.276, 0.055, 0));
    [-0.055, 0.02].forEach((z, i) =>
      g.add(at(rbox(0.008, 0.028, 0.055, 0.004, MATS.ink, 'port_' + i), -0.283, 0.058, z)));
    g.add(at(rbox(0.075, 0.014, 0.030, 0.005, MATS.ink, 'power_connector'), 0.19, 0.096, -0.075));
    return g;
  },

  'audio-headsets': () => {
    const g = group('headset');
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.188, 0.026, 10, 28, Math.PI), MATS.graphite);
    band.name = 'headband';
    g.add(at(band, 0, 0.210, 0));
    const bandPad = new THREE.Mesh(new THREE.TorusGeometry(0.158, 0.024, 8, 22, Math.PI * 0.66), MATS.ink);
    bandPad.name = 'headband_pad';
    g.add(at(bandPad, 0, 0.210, 0, 0, 0, Math.PI * 0.17));
    [-1, 1].forEach(sd => {
      const id = sd > 0 ? 'r' : 'l';
      g.add(at(rbox(0.030, 0.105, 0.062, 0.012, MATS.graphite, 'yoke_' + id), sd * 0.188, 0.168, 0));
      g.add(at(rbox(0.013, 0.070, 0.032, 0.004, MATS.shell, 'slider_' + id), sd * 0.172, 0.196, 0));
      const cup = cyl(0.088, 0.056, MATS.graphite, 'cup_' + id, 48);
      cup.scale.z = 1.22;
      g.add(at(cup, sd * 0.196, 0.112, 0, 0, 0, Math.PI / 2));
      const plate = cyl(0.064, 0.016, MATS.ink, 'cup_plate_' + id, 44);
      plate.scale.z = 1.18;
      g.add(at(plate, sd * 0.229, 0.112, 0, 0, 0, Math.PI / 2));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.008, 7, 18), MATS.teal);
      ring.name = 'accent_ring_' + id;
      g.add(at(ring, sd * 0.236, 0.112, 0, 0, Math.PI / 2, 0));
      const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.026, 8, 20), MATS.ink);
      cushion.name = 'ear_cushion_' + id;
      cushion.scale.y = 1.18;
      g.add(at(cushion, sd * 0.166, 0.112, 0, 0, Math.PI / 2, 0));
    });
    // boom microphone with foam windscreen
    g.add(at(rbox(0.034, 0.038, 0.034, 0.008, MATS.ink, 'mic_joint'), -0.196, 0.072, 0.052));
    const boom = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.196, 0.070, 0.062), new THREE.Vector3(-0.190, 0.038, 0.135),
      new THREE.Vector3(-0.150, 0.020, 0.190), new THREE.Vector3(-0.098, 0.016, 0.212)
    ]), 64, 0.0085, 14, false), MATS.ink);
    boom.name = 'mic_boom';
    g.add(boom);
    const foam = new THREE.Mesh(new THREE.SphereGeometry(0.030, 14, 10), MATS.graphite);
    foam.name = 'mic_foam';
    foam.scale.set(1, 0.92, 1.15);
    g.add(at(foam, -0.086, 0.016, 0.218));
    // cable out of the right cup
    const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.196, 0.052, 0.02), new THREE.Vector3(0.205, 0.016, 0.08),
      new THREE.Vector3(0.240, 0.010, 0.16), new THREE.Vector3(0.300, 0.010, 0.13)
    ]), 64, 0.0095, 12, false), MATS.ink);
    cable.name = 'cable';
    g.add(cable);
    return g;
  },

  perifericos: () => {
    const g = group('kit_teclado_mouse');

    // ---- mouse: extruded teardrop outline, heavily bevelled into a dome
    const outline = new THREE.Shape();
    outline.moveTo(0, -0.150);
    outline.bezierCurveTo(0.070, -0.145, 0.098, -0.055, 0.096, 0.025);
    outline.bezierCurveTo(0.094, 0.108, 0.058, 0.150, 0, 0.150);
    outline.bezierCurveTo(-0.058, 0.150, -0.094, 0.108, -0.096, 0.025);
    outline.bezierCurveTo(-0.098, -0.055, -0.070, -0.145, 0, -0.150);
    const geo = new THREE.ExtrudeGeometry(outline, {
      depth: 0.026, bevelEnabled: true, bevelThickness: 0.056,
      bevelSize: 0.020, bevelSegments: 4, curveSegments: 12
    });
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    const mouse = group('mouse');
    const shell = new THREE.Mesh(geo, MATS.graphite);
    shell.name = 'mouse_shell';
    mouse.add(at(shell, 0, 0.050, 0));
    mouse.add(at(rbox(0.176, 0.010, 0.286, 0.068, MATS.ink, 'mouse_base'), 0, 0.005, 0));
    mouse.add(at(rbox(0.006, 0.012, 0.115, 0.002, MATS.ink, 'mouse_split'), 0, 0.114, -0.090));
    mouse.add(at(cyl(0.020, 0.013, MATS.teal, 'scroll_wheel'), 0, 0.118, -0.052, 0, 0, Math.PI / 2));
    mouse.position.set(0.40, 0, 0.02);
    g.add(mouse);

    // ---- keyboard
    const kb = group('keyboard');
    kb.add(at(rbox(0.64, 0.028, 0.24, 0.012, MATS.graphite, 'kb_body'), 0, 0.014, 0));
    kb.add(at(rbox(0.60, 0.008, 0.205, 0.008, MATS.ink, 'kb_plate'), 0, 0.030, 0.004));
    const KX = 0.0385, KZ = 0.0385, k = (w, x, z, mat, n) =>
      kb.add(at(rbox(w, 0.013, 0.030, 0.005, mat, n), x, 0.040, z));
    for (let row = 0; row < 4; row++) {
      const z = -0.070 + row * KZ;
      for (let col = 0; col < 15; col++) {
        const x = -0.269 + col * KX;
        const accent = row === 0 && col === 0 ? MATS.teal : col === 14 ? MATS.teal : MATS.shell;
        k(0.030, x, z, accent, 'key_' + row + '_' + col);
      }
    }
    // front row: modifiers + spacebar
    const front = 0.078;
    [-0.269, -0.231, -0.193].forEach((x, i) => k(0.030, x, front, MATS.shell, 'mod_l' + i));
    k(0.215, -0.038, front, MATS.shell, 'spacebar');
    [0.115, 0.153, 0.191].forEach((x, i) => k(0.030, x, front, MATS.shell, 'mod_r' + i));
    k(0.030, 0.229, front, MATS.teal, 'key_arrow');
    kb.rotation.x = -0.05;
    kb.position.set(-0.20, 0, 0);
    g.add(kb);
    return g;
  },

  'redes-internet': () => {
    const g = group('router');
    g.add(at(rbox(0.40, 0.075, 0.28, 0.024, MATS.graphite, 'body'), 0, 0.055, 0));
    g.add(at(rbox(0.36, 0.02, 0.24, 0.012, MATS.ink, 'foot'), 0, 0.010, 0));
    [[-0.10, MATS.teal], [0, MATS.yellow], [0.10, MATS.teal]].forEach(([x, m], i) =>
      g.add(at(cyl(0.012, 0.01, m, 'led_' + i), x, 0.060, 0.142, Math.PI / 2)));
    [[0.10, 0.024, 24], [0.17, 0.020, 24]].forEach(([r, t], i) => {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(r, t / 2, 8, 20, Math.PI * 0.62), MATS.teal);
      arc.name = 'signal_arc_' + i;
      g.add(at(arc, 0, 0.10, 0, 0, 0, Math.PI * 0.19));
    });
    return g;
  },

  armazenamento: () => {
    const g = group('armazenamento');
    // 2.5" SATA SSD
    const ssd = group('ssd_sata');
    ssd.add(at(rbox(0.34, 0.045, 0.44, 0.010, MATS.graphite, 'ssd_case'), 0, 0.0225, 0));
    ssd.add(at(rbox(0.27, 0.006, 0.35, 0.008, MATS.ink, 'ssd_label'), 0, 0.048, -0.01));
    ssd.add(at(rbox(0.19, 0.005, 0.026, 0.004, MATS.shell, 'ssd_brand'), 0, 0.052, -0.11));
    ssd.add(at(rbox(0.13, 0.005, 0.018, 0.004, MATS.teal, 'ssd_line'), -0.03, 0.052, -0.06));
    ssd.add(at(rbox(0.075, 0.005, 0.014, 0.003, MATS.shell, 'ssd_cap'), -0.055, 0.052, 0.10));
    [[-0.145, -0.17], [0.145, -0.17], [-0.145, 0.17], [0.145, 0.17]].forEach(([x, z], i) =>
      ssd.add(at(cyl(0.012, 0.008, MATS.ink, 'ssd_screw_' + i), x, 0.046, z)));
    // SATA edge connector
    ssd.add(at(rbox(0.155, 0.024, 0.020, 0.004, MATS.shell, 'sata_connector'), 0.055, 0.020, -0.228));
    [0.005, 0.105].forEach((x, i) =>
      ssd.add(at(rbox(0.045, 0.014, 0.012, 0.003, MATS.ink, 'sata_slot_' + i), x, 0.020, -0.234)));
    ssd.position.set(-0.14, 0, 0);
    ssd.rotation.y = 0.12;
    g.add(ssd);
    // M.2 NVMe stick lying in front
    const m2 = group('ssd_m2');
    m2.add(at(rbox(0.46, 0.010, 0.10, 0.004, MATS.teal, 'm2_pcb'), 0, 0.005, 0));
    [-0.10, 0.06].forEach((x, i) =>
      m2.add(at(rbox(0.13, 0.011, 0.072, 0.004, MATS.ink, 'nand_' + i), x, 0.015, 0.004)));
    m2.add(at(rbox(0.055, 0.010, 0.062, 0.004, MATS.graphite, 'controller'), 0.175, 0.015, 0.004));
    m2.add(at(rbox(0.055, 0.012, 0.088, 0.003, MATS.yellow, 'm2_fingers'), -0.202, 0.006, 0.006));
    m2.add(at(rbox(0.014, 0.014, 0.020, 0.002, MATS.shell, 'm2_notch'), -0.202, 0.006, -0.035));
    m2.position.set(0.36, 0, 0.24);
    m2.rotation.y = -0.62;
    g.add(m2);
    return g;
  },

  'cabos-adaptadores': () => {
    const g = group('cable');
    const plug = group('plug');
    plug.add(at(rbox(0.10, 0.13, 0.055, 0.014, MATS.graphite, 'plug_body'), 0, 0, 0));
    plug.add(at(rbox(0.062, 0.05, 0.028, 0.006, MATS.teal, 'plug_tip'), 0, 0.086, 0));
    plug.add(at(rbox(0.075, 0.03, 0.045, 0.01, MATS.ink, 'plug_collar'), 0, -0.078, 0));
    g.add(at(plug, -0.05, 0.30, 0));
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 0.215, 0), new THREE.Vector3(-0.05, 0.13, 0.02),
      new THREE.Vector3(0.03, 0.055, 0.05), new THREE.Vector3(0.14, 0.022, 0.0),
      new THREE.Vector3(0.09, 0.022, -0.12), new THREE.Vector3(-0.05, 0.022, -0.09)
    ]);
    const cord = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.014, 16, false), MATS.ink);
    cord.name = 'cord';
    g.add(cord);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 7), MATS.ink);
    cap.name = 'cord_end';
    g.add(at(cap, -0.05, 0.022, -0.09));
    return g;
  },

  'papelaria-midia': () => {
    const g = group('paper_stack');
    const tilt = -0.10;
    [[-0.035, -0.03, 0.09], [0, 0, 0.045]].forEach(([x, z, r], i) =>
      g.add(at(rbox(0.26, 0.34, 0.008, 0.010, MATS.shell, 'sheet_' + i), x, 0.175, z, tilt, r, 0)));
    const front = group('sheet_front');
    front.add(rbox(0.26, 0.34, 0.008, 0.010, MATS.shell, 'sheet_2'));
    [[0.15, 0.085], [0.10, 0.03], [0.13, -0.025]].forEach(([w, y], i) =>
      front.add(at(rbox(w, 0.014, 0.005, 0.004, i === 1 ? MATS.teal : MATS.ink, 'text_line_' + i), -0.075 + w / 2, y, 0.0065)));
    front.position.set(0.035, 0.175, 0.06);
    front.rotation.set(tilt, 0, 0);
    g.add(front);
    return g;
  },

  'ofertas-da-semana': () => {
    const g = group('price_tag');
    const w = 0.34, h = 0.30, s = new THREE.Shape();
    s.moveTo(-w * 0.62, 0);
    s.lineTo(-w * 0.30, h / 2); s.lineTo(w / 2 - 0.03, h / 2);
    s.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - 0.03);
    s.lineTo(w / 2, -h / 2 + 0.03);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2 - 0.03, -h / 2);
    s.lineTo(-w * 0.30, -h / 2); s.lineTo(-w * 0.62, 0);
    const tag = extrude(s, 0.06, MATS.yellow, 'tag_body');
    const face = group('tag_face');
    [[-0.062, 0.058], [0.062, -0.058]].forEach(([x, y], i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.011, 8, 18), MATS.graphite);
      ring.name = 'percent_ring_' + i;
      face.add(at(ring, x, y, 0.024));
    });
    const bar = at(rbox(0.026, 0.19, 0.014, 0.008, MATS.graphite, 'percent_bar'), 0, 0, 0.024, 0, 0, -0.62);
    face.add(bar);
    const grommet = cyl(0.022, 0.075, MATS.graphite, 'grommet', 28);
    const inner = group('tag_all', tag, face, at(grommet, -w * 0.40, 0, 0, Math.PI / 2));
    inner.rotation.z = 0.68;
    inner.position.y = 0.24;
    g.add(inner);
    return g;
  },

  novidades: () => {
    const g = group('sparkle');
    const big = extrude(starShape(0.26, 0.055, 4, Math.PI / 2), 0.055, MATS.yellow, 'star_big');
    g.add(at(big, 0.02, 0.28, 0, 0, 0, 0.12));
    const mid = extrude(starShape(0.095, 0.022, 4, Math.PI / 2), 0.035, MATS.graphite, 'star_mid');
    g.add(at(mid, 0.19, 0.47, 0.02, 0, 0, -0.2));
    const small = extrude(starShape(0.065, 0.016, 4, Math.PI / 2), 0.03, MATS.teal, 'star_small');
    g.add(at(small, -0.17, 0.11, 0.02, 0, 0, 0.3));
    return g;
  }
};

export const CATEGORIES = [
  { key: 'impressao-3d',      label: 'Impressão 3D' },
  { key: 'cartuchos-tintas',  label: 'Cartuchos & Tintas' },
  { key: 'toners',            label: 'Toners' },
  { key: 'impressoras',       label: 'Impressoras' },
  { key: 'placas-de-video',   label: 'Placas de Vídeo' },
  { key: 'audio-headsets',    label: 'Áudio & Headsets' },
  { key: 'perifericos',       label: 'Periféricos' },
  { key: 'redes-internet',    label: 'Redes & Internet' },
  { key: 'armazenamento',     label: 'Armazenamento' },
  { key: 'cabos-adaptadores', label: 'Cabos & Adaptadores' },
  { key: 'papelaria-midia',   label: 'Papelaria & Mídia' },
  { key: 'ofertas-da-semana', label: 'Ofertas da Semana' },
  { key: 'novidades',         label: 'Novidades' }
];

export function buildCategory(key) {
  const g = BUILD[key]();
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
