import { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform float xScale;
  uniform float yScale;
  uniform float yOffset;
  uniform float distortion;
  uniform float beamThickness;
  uniform float glow;

  void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

    float d = length(p) * distortion;
    float rx = p.x * (1.0 + d);
    float gx = p.x;
    float bx = p.x * (1.0 - d);

    float r = beamThickness / abs((p.y + yOffset) + sin((rx + time) * xScale) * yScale);
    float g = beamThickness / abs((p.y + yOffset) + sin((gx + time) * xScale) * yScale);
    float b = beamThickness / abs((p.y + yOffset) + sin((bx + time) * xScale) * yScale);

    vec3 wave = vec3(r, g, b);
    float haloCap = 2.0;
    vec3 halo = min(wave, vec3(haloCap));
    vec3 core = wave - halo;
    vec3 col = clamp(core + halo * glow, 0.0, 1.0);
    float outAlpha = clamp(max(max(col.r, col.g), col.b) / 2.5, 0.0, 1.0);
    gl_FragColor = vec4(col, outAlpha);
  }
`;

const mapLinear = (value, inMin, inMax, outMin, outMax) => {
  if (inMax === inMin) {
    return outMin;
  }
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
};

const mapSpeedUiToInternal = (ui) => mapLinear(ui, 0.1, 1, 0.1, 5);
const mapThicknessUiToInternal = (ui) => mapLinear(ui, 0.1, 1, 0.01, 0.2);
const mapDistortionUiToInternal = (ui) => mapLinear(ui, 0, 1, 0, 0.2);
const mapFrequencyUiToInternal = (ui) => mapLinear(ui, 0.1, 1, 0.1, 3);
const mapAmplitudeUiToInternal = (ui) => mapLinear(ui, 0.1, 1, 0.1, 2);

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

export default function WavePrism({
  speed = 0.2,
  beamThickness = 0.5,
  distortion = 0.25,
  xScale = 0.5,
  yScale = 0.3,
  glow = 1,
  backgroundColor = 'transparent',
  className = '',
  style,
}) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const uniformsRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const paramsRef = useRef({
    speed: mapSpeedUiToInternal(speed),
    beamThickness: mapThicknessUiToInternal(beamThickness),
    distortion: mapDistortionUiToInternal(distortion),
    xScale: mapFrequencyUiToInternal(xScale),
    yScale: mapAmplitudeUiToInternal(yScale),
    glow,
  });

  useEffect(() => {
    paramsRef.current = {
      speed: mapSpeedUiToInternal(speed),
      beamThickness: mapThicknessUiToInternal(beamThickness),
      distortion: mapDistortionUiToInternal(distortion),
      xScale: mapFrequencyUiToInternal(xScale),
      yScale: mapAmplitudeUiToInternal(yScale),
      glow,
    };
  }, [speed, beamThickness, distortion, xScale, yScale, glow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) {
      return undefined;
    }

    glRef.current = gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) {
      return undefined;
    }
    programRef.current = program;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    uniformsRef.current = {
      resolution: gl.getUniformLocation(program, 'resolution'),
      time: gl.getUniformLocation(program, 'time'),
      xScale: gl.getUniformLocation(program, 'xScale'),
      yScale: gl.getUniformLocation(program, 'yScale'),
      yOffset: gl.getUniformLocation(program, 'yOffset'),
      distortion: gl.getUniformLocation(program, 'distortion'),
      beamThickness: gl.getUniformLocation(program, 'beamThickness'),
      glow: gl.getUniformLocation(program, 'glow'),
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(parent.clientWidth * dpr));
      const height = Math.max(1, Math.floor(parent.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;
      }
      gl.viewport(0, 0, width, height);
      if (uniformsRef.current?.resolution) {
        gl.uniform2f(uniformsRef.current.resolution, width, height);
      }
    };

    const render = (timestamp) => {
      const last = lastTimeRef.current || timestamp;
      const delta = (timestamp - last) / 1000;
      lastTimeRef.current = timestamp;

      const params = paramsRef.current;
      timeRef.current += delta * params.speed;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (uniformsRef.current) {
        gl.uniform1f(uniformsRef.current.time, timeRef.current);
        gl.uniform1f(uniformsRef.current.xScale, params.xScale);
        gl.uniform1f(uniformsRef.current.yScale, params.yScale);
        gl.uniform1f(uniformsRef.current.yOffset, -0.6);
        gl.uniform1f(uniformsRef.current.distortion, params.distortion);
        gl.uniform1f(uniformsRef.current.beamThickness, params.beamThickness);
        gl.uniform1f(uniformsRef.current.glow, params.glow);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    animationRef.current = requestAnimationFrame(render);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
      }
    };
  }, []);

  const containerClassName = ['relative', className].filter(Boolean).join(' ');

  return (
    <div
      className={containerClassName}
      style={{ width: '100%', height: '100%', background: backgroundColor, ...style }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
