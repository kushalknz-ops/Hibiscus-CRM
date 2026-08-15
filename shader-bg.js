// ==========================================================================
//  HIBISCUS COAST CRM — PREMIUM SHADER BACKGROUND (Three.js / WebGL)
//  Deep indigo/violet/blue atmosphere with white/silver headlight streaks
// ==========================================================================

(function () {
  'use strict';

  // ── Vertex Shader ──────────────────────────────────────────────────────
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  // ── Fragment Shader ────────────────────────────────────────────────────
  const fragmentShader = `
    precision highp float;

    uniform float uTime;
    uniform vec2  uResolution;

    varying vec2 vUv;

    /* ── Noise helpers ─────────────────────────────────────────────── */

    // Simple 2D hash
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // Value noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Fractal Brownian Motion (3 octaves)
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 3; i++) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    /* ── Color palette ─────────────────────────────────────────────── */

    const vec3 COL_BLACK       = vec3(0.012, 0.016, 0.047);   // #03040C
    const vec3 COL_NAVY        = vec3(0.024, 0.067, 0.227);   // #06113A
    const vec3 COL_INDIGO      = vec3(0.067, 0.106, 0.447);   // #111B72
    const vec3 COL_BLUE        = vec3(0.086, 0.278, 0.780);   // #1647C7
    const vec3 COL_VIOLET      = vec3(0.145, 0.039, 0.439);   // #250A70
    const vec3 COL_DEEP_PURPLE = vec3(0.086, 0.020, 0.180);   // #16052E
    const vec3 COL_SILVER      = vec3(0.867, 0.890, 0.949);   // #DDE3F2
    const vec3 COL_WHITE       = vec3(1.0);

    /* ── Main ──────────────────────────────────────────────────────── */

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;
      vec2 st = uv;
      st.x *= aspect;

      float t = uTime * 0.04;   // very slow crawl

      // ── 1. Dark base gradient (diagonal, black → navy) ──────────
      float baseMix = smoothstep(0.0, 1.0, uv.x * 0.6 + uv.y * 0.4);
      vec3 col = mix(COL_BLACK, COL_NAVY, baseMix * 0.55);

      // ── 2. Purple / Violet atmospheric glow (left side) ─────────
      float purpleDist = length((uv - vec2(0.12, 0.55)) * vec2(1.0, 1.3));
      float purpleGlow = exp(-purpleDist * 3.2) * 0.65;
      purpleGlow += exp(-length((uv - vec2(0.08, 0.35)) * vec2(1.2, 1.0)) * 4.0) * 0.3;
      col = mix(col, COL_VIOLET, purpleGlow);

      // Deep purple corona further left
      float deepPurple = exp(-length((uv - vec2(0.02, 0.5)) * vec2(0.8, 1.5)) * 2.5) * 0.4;
      col = mix(col, COL_DEEP_PURPLE, deepPurple);

      // ── 3. Indigo transition (center-left) ──────────────────────
      float indigoDist = length((uv - vec2(0.35, 0.45)) * vec2(1.2, 0.9));
      float indigoGlow = exp(-indigoDist * 2.8) * 0.5;
      col = mix(col, COL_INDIGO, indigoGlow);

      // ── 4. Electric blue glow (lower center) ───────────────────
      float blueDist = length((uv - vec2(0.45, 0.25)) * vec2(1.0, 1.4));
      float blueGlow = exp(-blueDist * 3.0) * 0.55;
      // Secondary blue accent
      blueGlow += exp(-length((uv - vec2(0.5, 0.35)) * vec2(1.3, 1.1)) * 3.5) * 0.3;
      col = mix(col, COL_BLUE, blueGlow);

      // ── 5. Large white / silver glow (right side) ──────────────
      float whiteDist = length((uv - vec2(0.82, 0.52)) * vec2(0.8, 1.1));
      float whiteGlow = exp(-whiteDist * 2.0) * 0.7;
      // Inner bright core
      whiteGlow += exp(-length((uv - vec2(0.85, 0.48)) * vec2(1.0, 1.2)) * 4.0) * 0.5;
      vec3 silverWhite = mix(COL_SILVER, COL_WHITE, smoothstep(0.15, 0.0, whiteDist));
      col = mix(col, silverWhite, whiteGlow);

      // ── 6. Diagonal white light streaks (upper-right sweep) ─────
      // Streak 1: main sweep
      float streakAngle = (uv.x - 0.3) * 0.7 + (1.0 - uv.y) * 1.0;
      float streak1 = exp(-pow(abs(streakAngle - 0.55) * 6.0, 2.0)) * 0.35;
      streak1 *= smoothstep(0.3, 0.7, uv.x);  // fade in from center

      // Streak 2: secondary thinner
      float streak2 = exp(-pow(abs(streakAngle - 0.45) * 9.0, 2.0)) * 0.2;
      streak2 *= smoothstep(0.4, 0.8, uv.x);

      // Streak 3: very subtle wide wash
      float streak3 = exp(-pow(abs(streakAngle - 0.65) * 4.0, 2.0)) * 0.15;
      streak3 *= smoothstep(0.25, 0.65, uv.x);

      float streaks = streak1 + streak2 + streak3;
      col = mix(col, COL_WHITE, streaks * 0.6);

      // ── 7. Subtle animated noise (atmospheric shimmer) ──────────
      float n1 = fbm(st * 3.0 + t * 0.5);
      float n2 = fbm(st * 5.0 - t * 0.3 + 50.0);
      float noiseMix = (n1 * 0.5 + n2 * 0.5) * 0.08;
      col += noiseMix * mix(COL_INDIGO, COL_SILVER, uv.x);

      // ── 8. Dark edge vignette ──────────────────────────────────
      vec2 vigUv = uv * (1.0 - uv);
      float vig = vigUv.x * vigUv.y * 18.0;
      vig = pow(clamp(vig, 0.0, 1.0), 0.35);
      col *= vig;

      // ── 9. Very subtle film grain ──────────────────────────────
      float grain = hash(uv * uResolution + fract(uTime)) * 0.03;
      col += grain - 0.015;

      // ── 10. Slow breathing pulse ───────────────────────────────
      float breath = 1.0 + sin(uTime * 0.15) * 0.012;
      col *= breath;

      // Final gamma
      col = pow(clamp(col, 0.0, 1.0), vec3(0.95));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // ── Wait for Three.js to load, then init ──────────────────────────────
  function init() {
    const container = document.getElementById('shader-bg-container');
    if (!container) return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x03040C);
    container.appendChild(renderer.domElement);

    // Style the canvas
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width   = '100%';
    renderer.domElement.style.height  = '100%';

    const uniforms = {
      uTime:       { value: 0.0 },
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ── Responsive resize ─────────────────────────────────────────
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    }
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    }
    animate();
  }

  // ── Boot ────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
