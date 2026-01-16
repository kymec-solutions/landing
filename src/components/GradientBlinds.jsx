import { useEffect, useMemo, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);

  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec2 uv0 = fragCoord.xy / iResolution.xy;

  float aspect = iResolution.x / iResolution.y;
  vec2 p = uv0 * 2.0 - 1.0;
  p.x *= aspect;
  vec2 pr = rotate2D(p, uAngle);
  pr.x /= aspect;
  vec2 uv = pr * 0.5 + 0.5;

  vec2 uvMod = uv;
  if (uDistort > 0.0) {
    float a = uvMod.y * 6.0;
    float b = uvMod.x * 6.0;
    float w = 0.01 * uDistort;
    uvMod.x += sin(a) * w;
    uvMod.y += cos(b) * w;
  }
  float t = uvMod.x;
  if (uMirror > 0.5) {
    t = 1.0 - abs(1.0 - 2.0 * fract(t));
  }
  vec3 base = getGradientColor(t);

  vec2 offset = vec2(iMouse.x / iResolution.x, iMouse.y / iResolution.y);
  float d = length(uv0 - offset);
  float r = max(uSpotlightRadius, 1e-4);
  float dn = d / r;

  float spotShape = 1.0 - 2.0 * pow(dn, uSpotlightSoftness);
  spotShape = clamp(spotShape, 0.0, 1.0);
  float spot = spotShape * uSpotlightOpacity;

  float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
  if (uShineFlip > 0.5) stripe = 1.0 - stripe;
  vec3 ran = vec3(stripe);

  vec3 col;
  if (uSpotlightOpacity > 0.0) {
    col = base * spot - ran;
  } else {
    col = vec3(0.0);
  }
  col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

  float alpha = max(max(col.r, col.g), col.b);
  alpha = clamp(alpha, 0.0, 1.0);

  fragColor = vec4(col, alpha);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseRgbString = (value) => {
  const match = value
    .trim()
    .match(/rgba?\\(\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*(?:,\\s*([\\d.]+)\\s*)?\\)/i);
  if (!match) {
    return null;
  }
  return [
    clamp(parseFloat(match[1]) / 255, 0, 1),
    clamp(parseFloat(match[2]) / 255, 0, 1),
    clamp(parseFloat(match[3]) / 255, 0, 1),
  ];
};

const parseHexColor = (value) => {
  let hex = value.replace('#', '').trim();
  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  if (hex.length < 6) {
    hex = hex.padEnd(6, '0');
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }
  return [r / 255, g / 255, b / 255];
};

const parseColor = (value) => {
  if (!value || typeof value !== 'string') {
    return [1, 1, 1];
  }
  if (value.startsWith('rgb')) {
    return parseRgbString(value) ?? [1, 1, 1];
  }
  if (value.startsWith('#')) {
    return parseHexColor(value) ?? [1, 1, 1];
  }
  return parseHexColor(value) ?? [1, 1, 1];
};

const buildPalette = (colors, paletteCount) => {
  const fallback = ['#FF9FFC', '#5227FF'];
  const raw = Array.isArray(colors) ? colors : fallback;
  const filtered = raw.filter((entry) => typeof entry === 'string' && entry.trim().length > 0);
  const base = filtered.length > 0 ? filtered : fallback;
  const expanded = [...base];
  while (expanded.length < 8) {
    expanded.push(expanded[expanded.length - 1]);
  }
  const count = clamp(paletteCount ?? base.length ?? 2, 2, 8);
  return {
    colors: expanded.slice(0, 8).map(parseColor),
    count,
  };
};

const computeBlindCount = (amount, size) => {
  const clamped = clamp(amount ?? 50, 1, 100);
  const spacing = 500 - (clamped - 1) * (490 / 99);
  if (!spacing || spacing <= 0) {
    return 16;
  }
  return Math.max(1, Math.floor(size / spacing));
};

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (gl, vertexSource, fragmentSource) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) {
    return null;
  }
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

const resolveMirror = (value) => {
  if (!value) {
    return 0;
  }
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'mirror' ? 1 : 0;
};

const resolveShineFlip = (value) => {
  if (!value) {
    return 0;
  }
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'right' ? 1 : 0;
};

export default function GradientBlinds({
  className = '',
  style,
  amount = 80,
  angle = 30,
  noise = 0.3,
  distortAmount = 1.5,
  mirrorGradient = 'Mirror',
  shineDirection = 'Left',
  spotlight = {
    radius: 0.2,
    softness: 1,
    opacity: 1,
    mouseDampening: 0.3,
  },
  colors = {
    paletteCount: 4,
    bgColor: 'rgb(0, 0, 0)',
    color1: 'rgb(171, 193, 255)',
    color2: 'rgb(110, 148, 255)',
    color3: 'rgb(110, 148, 255)',
    color4: 'rgb(171, 193, 255)',
    color5: 'rgb(255, 159, 252)',
    color6: 'rgb(82, 39, 255)',
    color7: 'rgb(255, 159, 252)',
    color8: 'rgb(255, 159, 252)',
  },
  dpr = 1,
  maxFps = 0,
  pauseWhenOffscreen = true,
  paused = false,
  bgColor = 'rgb(0, 0, 0)',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const uniformRef = useRef(null);
  const animationRef = useRef(null);
  const targetMouseRef = useRef([0, 0]);
  const currentMouseRef = useRef([0, 0]);
  const lastTimeRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const lastFrameRef = useRef(0);
  const isStaticMouseRef = useRef(false);
  const isVisibleRef = useRef(true);
  const isPageVisibleRef = useRef(true);

  const palette = useMemo(() => {
    const paletteColors = [
      colors?.color1,
      colors?.color2,
      colors?.color3,
      colors?.color4,
      colors?.color5,
      colors?.color6,
      colors?.color7,
      colors?.color8,
    ].filter(Boolean);
    return buildPalette(paletteColors, colors?.paletteCount);
  }, [colors]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'transparent';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      container.removeChild(canvas);
      return undefined;
    }
    glRef.current = gl;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) {
      container.removeChild(canvas);
      return undefined;
    }
    programRef.current = program;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 2, 0, 0, 2]), gl.STATIC_DRAW);
    const uvLocation = gl.getAttribLocation(program, 'uv');
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    uniformRef.current = {
      iResolution: gl.getUniformLocation(program, 'iResolution'),
      iMouse: gl.getUniformLocation(program, 'iMouse'),
      iTime: gl.getUniformLocation(program, 'iTime'),
      uAngle: gl.getUniformLocation(program, 'uAngle'),
      uNoise: gl.getUniformLocation(program, 'uNoise'),
      uBlindCount: gl.getUniformLocation(program, 'uBlindCount'),
      uSpotlightRadius: gl.getUniformLocation(program, 'uSpotlightRadius'),
      uSpotlightSoftness: gl.getUniformLocation(program, 'uSpotlightSoftness'),
      uSpotlightOpacity: gl.getUniformLocation(program, 'uSpotlightOpacity'),
      uMirror: gl.getUniformLocation(program, 'uMirror'),
      uDistort: gl.getUniformLocation(program, 'uDistort'),
      uShineFlip: gl.getUniformLocation(program, 'uShineFlip'),
      uColor0: gl.getUniformLocation(program, 'uColor0'),
      uColor1: gl.getUniformLocation(program, 'uColor1'),
      uColor2: gl.getUniformLocation(program, 'uColor2'),
      uColor3: gl.getUniformLocation(program, 'uColor3'),
      uColor4: gl.getUniformLocation(program, 'uColor4'),
      uColor5: gl.getUniformLocation(program, 'uColor5'),
      uColor6: gl.getUniformLocation(program, 'uColor6'),
      uColor7: gl.getUniformLocation(program, 'uColor7'),
      uColorCount: gl.getUniformLocation(program, 'uColorCount'),
    };

    const updateStaticMouse = () => {
      const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const small = window.matchMedia?.('(max-width: 768px)').matches ?? false;
      isStaticMouseRef.current = coarse || small;
    };

    const applyUniforms = () => {
      if (!uniformRef.current || !programRef.current) {
        return;
      }
      gl.useProgram(programRef.current);
      gl.uniform1f(uniformRef.current.uAngle, (angle * Math.PI) / 180);
      gl.uniform1f(uniformRef.current.uNoise, noise ?? 0);
      gl.uniform1f(uniformRef.current.uDistort, (distortAmount ?? 0) * 10);
      gl.uniform1f(uniformRef.current.uMirror, resolveMirror(mirrorGradient));
      gl.uniform1f(uniformRef.current.uShineFlip, resolveShineFlip(shineDirection));
      gl.uniform1f(uniformRef.current.uSpotlightRadius, (spotlight?.radius ?? 0.5) * 2);
      gl.uniform1f(uniformRef.current.uSpotlightSoftness, (spotlight?.softness ?? 1) * 3);
      gl.uniform1f(uniformRef.current.uSpotlightOpacity, spotlight?.opacity ?? 1);

      const count = palette.count;
      const [c0, c1, c2, c3, c4, c5, c6, c7] = palette.colors;
      gl.uniform3fv(uniformRef.current.uColor0, new Float32Array(c0));
      gl.uniform3fv(uniformRef.current.uColor1, new Float32Array(c1));
      gl.uniform3fv(uniformRef.current.uColor2, new Float32Array(c2));
      gl.uniform3fv(uniformRef.current.uColor3, new Float32Array(c3));
      gl.uniform3fv(uniformRef.current.uColor4, new Float32Array(c4));
      gl.uniform3fv(uniformRef.current.uColor5, new Float32Array(c5));
      gl.uniform3fv(uniformRef.current.uColor6, new Float32Array(c6));
      gl.uniform3fv(uniformRef.current.uColor7, new Float32Array(c7));
      gl.uniform1i(uniformRef.current.uColorCount, count);
    };

    const resize = () => {
      updateStaticMouse();
      const rect = container.getBoundingClientRect();
      const width = Math.max(rect.width, 2);
      const height = Math.max(rect.height, 2);
      const size = Math.max(width, height);
      const effectiveDpr = Math.max(1, (dpr || 1) * 3);
      canvas.width = Math.floor(size * effectiveDpr);
      canvas.height = Math.floor(size * effectiveDpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uniformRef.current?.iResolution) {
        gl.uniform3f(uniformRef.current.iResolution, canvas.width, canvas.height, 1);
      }
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      targetMouseRef.current = [centerX, centerY];
      currentMouseRef.current = [centerX, centerY];
      if (uniformRef.current?.iMouse) {
        gl.uniform2f(uniformRef.current.iMouse, centerX, centerY);
      }
      if (uniformRef.current?.uBlindCount) {
        const blindCount = computeBlindCount(amount, size);
        gl.uniform1f(uniformRef.current.uBlindCount, blindCount);
      }
    };

    const handleMove = (event) => {
      if (isStaticMouseRef.current) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (rect.height - (event.clientY - rect.top)) * (canvas.height / rect.height);
      if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
        return;
      }
      targetMouseRef.current = [x, y];
      if (spotlight?.mouseDampening <= 0 && uniformRef.current?.iMouse) {
        gl.uniform2f(uniformRef.current.iMouse, x, y);
        currentMouseRef.current = [x, y];
      }
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('resize', resize);
    resize();
    applyUniforms();

    const render = (timestamp) => {
      if (pauseWhenOffscreen && (!isVisibleRef.current || !isPageVisibleRef.current)) {
        animationRef.current = null;
        return;
      }
      if (paused) {
        animationRef.current = null;
        return;
      }
      if (!glRef.current || !programRef.current || !uniformRef.current) {
        return;
      }
      if (maxFps > 0) {
        const frameDelta = timestamp - lastFrameRef.current;
        const minFrame = 1000 / maxFps;
        if (frameDelta < minFrame) {
          animationRef.current = requestAnimationFrame(render);
          return;
        }
        lastFrameRef.current = timestamp;
      }
      gl.useProgram(programRef.current);
      lastTimeRef.current = timestamp;
      gl.uniform1f(uniformRef.current.iTime, timestamp * 0.001);

      const dampening = spotlight?.mouseDampening ?? 0.3;
      if (!isStaticMouseRef.current && dampening > 0) {
        const last = lastUpdateRef.current || timestamp;
        const dt = (timestamp - last) / 1000;
        lastUpdateRef.current = timestamp;
        const t = Math.max(1e-4, dampening);
        const factor = 1 - Math.exp(-dt / t);
        const [tx, ty] = targetMouseRef.current;
        const [cx, cy] = currentMouseRef.current;
        const nx = cx + (tx - cx) * factor;
        const ny = cy + (ty - cy) * factor;
        currentMouseRef.current = [nx, ny];
        gl.uniform2f(uniformRef.current.iMouse, nx, ny);
      } else if (isStaticMouseRef.current) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const drift = Math.min(canvas.width, canvas.height) * 0.12;
        const t = timestamp * 0.00035;
        const nx = centerX + Math.cos(t) * drift;
        const ny = centerY + Math.sin(t * 0.9) * drift;
        gl.uniform2f(uniformRef.current.iMouse, nx, ny);
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animationRef.current = requestAnimationFrame(render);
    };

    const startRender = () => {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    const stopRender = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const handleVisibility = () => {
      isPageVisibleRef.current = document.visibilityState === 'visible';
      if (!isPageVisibleRef.current) {
        stopRender();
        return;
      }
      if (!pauseWhenOffscreen || isVisibleRef.current) {
        startRender();
      }
    };

    let observer = null;
    if (pauseWhenOffscreen && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting && isPageVisibleRef.current) {
            startRender();
          } else {
            stopRender();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(container);
      isVisibleRef.current = true;
    }

    document.addEventListener('visibilitychange', handleVisibility);
    isPageVisibleRef.current = document.visibilityState === 'visible';
    if (!pauseWhenOffscreen || isVisibleRef.current) {
      startRender();
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
      }
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    const uniforms = uniformRef.current;
    if (!gl || !uniforms || !programRef.current) {
      return;
    }
    gl.useProgram(programRef.current);
    gl.uniform1f(uniforms.uAngle, (angle * Math.PI) / 180);
    gl.uniform1f(uniforms.uNoise, noise ?? 0);
    gl.uniform1f(uniforms.uDistort, (distortAmount ?? 0) * 10);
    gl.uniform1f(uniforms.uMirror, resolveMirror(mirrorGradient));
    gl.uniform1f(uniforms.uShineFlip, resolveShineFlip(shineDirection));
    gl.uniform1f(uniforms.uSpotlightRadius, (spotlight?.radius ?? 0.5) * 2);
    gl.uniform1f(uniforms.uSpotlightSoftness, (spotlight?.softness ?? 1) * 3);
    gl.uniform1f(uniforms.uSpotlightOpacity, spotlight?.opacity ?? 1);

    const count = palette.count;
    const [c0, c1, c2, c3, c4, c5, c6, c7] = palette.colors;
    gl.uniform3fv(uniforms.uColor0, new Float32Array(c0));
    gl.uniform3fv(uniforms.uColor1, new Float32Array(c1));
    gl.uniform3fv(uniforms.uColor2, new Float32Array(c2));
    gl.uniform3fv(uniforms.uColor3, new Float32Array(c3));
    gl.uniform3fv(uniforms.uColor4, new Float32Array(c4));
    gl.uniform3fv(uniforms.uColor5, new Float32Array(c5));
    gl.uniform3fv(uniforms.uColor6, new Float32Array(c6));
    gl.uniform3fv(uniforms.uColor7, new Float32Array(c7));
    gl.uniform1i(uniforms.uColorCount, count);
  }, [angle, noise, distortAmount, mirrorGradient, shineDirection, spotlight, palette]);

  const backgroundColor = colors?.bgColor ?? bgColor;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: backgroundColor,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
