import { useEffect, useRef, useCallback, useMemo } from 'react';

const cssVariableRegex =
  /var\s*\(\s*(--[\w-]+)(?:\s*,\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*))?\s*\)/;

function extractDefaultValue(cssVar) {
  if (!cssVar || !cssVar.startsWith('var(')) {
    return cssVar;
  }

  const match = cssVariableRegex.exec(cssVar);
  if (!match) {
    return cssVar;
  }

  const fallback = (match[2] || '').trim();
  if (fallback.startsWith('var(')) {
    return extractDefaultValue(fallback);
  }

  return fallback || cssVar;
}

function resolveTokenColor(input) {
  if (typeof input !== 'string') {
    return input;
  }

  if (!input.startsWith('var(')) {
    return input;
  }

  return extractDefaultValue(input);
}

function parseColorToRgba(input) {
  if (!input) {
    return { r: 1, g: 1, b: 1, a: 1 };
  }

  const str = input.trim();

  const rgbaMatch = str.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i
  );

  if (rgbaMatch) {
    const r = Math.max(0, Math.min(255, parseFloat(rgbaMatch[1]))) / 255;
    const g = Math.max(0, Math.min(255, parseFloat(rgbaMatch[2]))) / 255;
    const b = Math.max(0, Math.min(255, parseFloat(rgbaMatch[3]))) / 255;
    const a =
      rgbaMatch[4] !== undefined
        ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4])))
        : 1;
    return { r, g, b, a };
  }

  const hex = str.replace(/^#/, '');

  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const a = parseInt(hex.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }

  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return { r, g, b, a: 1 };
  }

  if (hex.length === 4) {
    const r = parseInt(hex[0] + hex[0], 16) / 255;
    const g = parseInt(hex[1] + hex[1], 16) / 255;
    const b = parseInt(hex[2] + hex[2], 16) / 255;
    const a = parseInt(hex[3] + hex[3], 16) / 255;
    return { r, g, b, a };
  }

  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16) / 255;
    const g = parseInt(hex[1] + hex[1], 16) / 255;
    const b = parseInt(hex[2] + hex[2], 16) / 255;
    return { r, g, b, a: 1 };
  }

  return { r: 1, g: 1, b: 1, a: 1 };
}

function prepareColorPalette(colors, legacyColor) {
  const palette = [];

  if (colors) {
    const paletteCount = Math.max(1, Math.min(5, colors.paletteCount || 1));
    const colorInputs = [
      colors.color1,
      colors.color2,
      colors.color3,
      colors.color4,
      colors.color5
    ];

    for (let i = 0; i < paletteCount; i += 1) {
      const colorInput = colorInputs[i];
      if (!colorInput) {
        continue;
      }

      const resolved = resolveTokenColor(colorInput);
      const rgba = parseColorToRgba(resolved);
      const r = Math.round(rgba.r * 255);
      const g = Math.round(rgba.g * 255);
      const b = Math.round(rgba.b * 255);
      palette.push({ color: `rgb(${r}, ${g}, ${b})`, alpha: rgba.a });
    }
  }

  if (palette.length === 0) {
    const fallbackColor = legacyColor || '#FFFFFF';
    const resolved = resolveTokenColor(fallbackColor);
    const rgba = parseColorToRgba(resolved);
    const r = Math.round(rgba.r * 255);
    const g = Math.round(rgba.g * 255);
    const b = Math.round(rgba.b * 255);
    palette.push({ color: `rgb(${r}, ${g}, ${b})`, alpha: rgba.a });
  }

  return palette;
}

export default function TravelInSpace({
  paused = false,
  star = {
    count: 150,
    speed: 0.5,
    thickness: 2,
    opacity: 0.8,
    length: 8,
    color: '#FFFFFF',
    centerThinning: 0.5,
    centerShortening: 0.5
  },
  innerRadius = 50,
  outerRadius = 300,
  backgroundColor = 'rgba(0, 0, 0, 0)',
  colors = { paletteCount: 1, color1: '#FFFFFF' },
  className = '',
  style
}) {
  const {
    count: starCount = 150,
    speed: starSpeed = 0.5,
    thickness: starThickness = 2,
    opacity: starOpacity = 0.8,
    length: starLength = 8,
    color: starColor = '#FFFFFF',
    centerThinning = 0.5,
    centerShortening = 0.5
  } = star;

  const colorPalette = useMemo(
    () => prepareColorPalette(colors, starColor),
    [colors, starColor]
  );

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef();
  const starsRef = useRef([]);
  const lastTimeRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const isVisibleRef = useRef(true);

  const getSpawnInterval = useCallback(() => {
    const baseSpawnRate = 30;
    const countMultiplier = Math.max(1, starCount / 200);
    const adjustedSpawnRate = baseSpawnRate * countMultiplier;
    const spawnInterval = 1000 / adjustedSpawnRate;
    return Math.max(10, Math.min(50, spawnInterval));
  }, [starCount]);

  const createStar = useCallback(
    (centerX, centerY) => {
      const theta = Math.random() * Math.PI * 2;
      const minSpawnRadius = outerRadius * 0.9;
      const maxSpawnRadius = outerRadius * 1.2;
      const spawnRadius =
        minSpawnRadius + Math.random() * (maxSpawnRadius - minSpawnRadius);
      const offsetX = spawnRadius * Math.cos(theta);
      const offsetY = spawnRadius * Math.sin(theta);
      const offsetZ = Math.random() * 300 - 150;
      const baseZ = 200 + Math.random() * 800;
      const x = centerX + offsetX;
      const y = centerY + offsetY;
      const z = baseZ + offsetZ;

      const speedJitter = 0.7 + Math.random() * 0.6;
      const baseSpeed = starSpeed * 0.1 * speedJitter;

      const dx = centerX - x;
      const dy = centerY - y;
      const dz = 0 - z;
      const distance3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const randomOpacity = starOpacity * (0.6 + Math.random() * 0.4);

      const colorIndex = Math.floor(Math.random() * colorPalette.length);
      const colorData = colorPalette[colorIndex];

      const spawnDistanceFactor = Math.max(
        0.3,
        Math.min(
          1.2,
          1 - (spawnRadius - minSpawnRadius) / (maxSpawnRadius - minSpawnRadius)
        )
      );
      const baseSize = starThickness * (0.5 + Math.random() * 1.5);
      const spawnSize = baseSize * spawnDistanceFactor;

      const fadeInDistance = Math.max(50, baseSpeed * 100);

      return {
        x,
        y,
        z,
        vx: (dx / distance3D) * baseSpeed,
        vy: (dy / distance3D) * baseSpeed,
        vz: (dz / distance3D) * baseSpeed,
        opacity: 0,
        baseOpacity: randomOpacity,
        size: spawnSize,
        age: 0,
        maxAge: Math.random() * 10 + 15,
        fadeInProgress: 0,
        color: colorData.color,
        colorAlpha: colorData.alpha,
        spawnX: x,
        spawnY: y,
        fadeInDistance
      };
    },
    [starSpeed, starThickness, starOpacity, outerRadius, colorPalette]
  );

  const initStars = useCallback(
    (width, height) => {
      starsRef.current = [];
      lastSpawnTimeRef.current = 0;

      const centerX = width / 2;
      const centerY = height / 2;

      if (paused) {
        for (let i = 0; i < starCount; i += 1) {
          const newStar = createStar(centerX, centerY);
          const travelProgress = Math.random();
          const maxTravelDistance = Math.sqrt(
            (centerX - newStar.x) ** 2 + (centerY - newStar.y) ** 2
          );
          const travelDistance = maxTravelDistance * travelProgress;
          const directionLength = Math.sqrt(
            newStar.vx ** 2 + newStar.vy ** 2
          );
          const directionX = newStar.vx / directionLength;
          const directionY = newStar.vy / directionLength;
          newStar.x = newStar.spawnX + directionX * travelDistance;
          newStar.y = newStar.spawnY + directionY * travelDistance;
          const distanceTraveled = Math.sqrt(
            (newStar.x - newStar.spawnX) ** 2 +
              (newStar.y - newStar.spawnY) ** 2
          );
          newStar.fadeInProgress = Math.min(
            1,
            distanceTraveled / newStar.fadeInDistance
          );
          newStar.age = travelProgress * newStar.maxAge;
          starsRef.current.push(newStar);
        }
      } else {
        const initialStars = Math.min(
          starCount * 0.4,
          Math.max(30, starCount * 0.3)
        );
        for (let i = 0; i < initialStars; i += 1) {
          starsRef.current.push(createStar(centerX, centerY));
        }
      }
    },
    [starCount, createStar, paused]
  );

  const updateAndRender = useCallback(
    (ctx, width, height, deltaTime, currentTime) => {
      const centerX = width / 2;
      const centerY = height / 2;
      ctx.clearRect(0, 0, width, height);

      const bgRgba = parseColorToRgba(backgroundColor);
      const bgR = Math.round(bgRgba.r * 255);
      const bgG = Math.round(bgRgba.g * 255);
      const bgB = Math.round(bgRgba.b * 255);
      ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, ${bgRgba.a})`;
      ctx.fillRect(0, 0, width, height);

      const perspective = 600;
      const fadeOutStartDistance = innerRadius * 2.5;
      const fadeOutEndDistance = innerRadius;
      const fadeOutRange = fadeOutStartDistance - fadeOutEndDistance;
      const maxAngularDistance = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
      const deltaTimeSeconds = deltaTime * 0.001;
      const stars = starsRef.current;

      for (let i = stars.length - 1; i >= 0; i -= 1) {
        const starItem = stars[i];
        starItem.age += deltaTimeSeconds;

        const perspectiveScalePre = perspective / (perspective + starItem.z);
        const compensation = 1 / perspectiveScalePre;
        starItem.x += starItem.vx * deltaTime * compensation;
        starItem.y += starItem.vy * deltaTime * compensation;
        starItem.z += starItem.vz * deltaTime;

        const perspectiveScale = perspective / (perspective + starItem.z);
        const screenX = centerX + (starItem.x - centerX) * perspectiveScale;
        const screenY = centerY + (starItem.y - centerY) * perspectiveScale;

        const dx = starItem.x - centerX;
        const dy = starItem.y - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        const worldDistanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        const shouldRemove =
          starItem.z < 50 ||
          starItem.age > starItem.maxAge ||
          worldDistanceFromCenter < innerRadius * 0.8;

        if (shouldRemove) {
          stars.splice(i, 1);
          continue;
        }

        if (starItem.fadeInProgress < 1) {
          const distanceTraveled = Math.sqrt(
            (starItem.x - starItem.spawnX) ** 2 +
              (starItem.y - starItem.spawnY) ** 2
          );
          starItem.fadeInProgress = Math.min(
            1,
            distanceTraveled / starItem.fadeInDistance
          );
        }

        let positionOpacity = 1;
        if (distanceFromCenter < fadeOutStartDistance) {
          const fadeOutProgress = Math.max(
            0,
            (distanceFromCenter - fadeOutEndDistance) / fadeOutRange
          );
          positionOpacity = Math.sqrt(fadeOutProgress);
        }

        starItem.opacity =
          starItem.baseOpacity *
          starItem.fadeInProgress *
          positionOpacity *
          starItem.colorAlpha;

        if (starItem.opacity > 0.01) {
          const currentSize = starItem.size * perspectiveScale;
          const currentOpacity = starItem.opacity;
          if (currentOpacity > 0.05 && currentSize > 0.3) {
            const angularDistanceFromCenter = Math.sqrt(
              (screenX - centerX) ** 2 + (screenY - centerY) ** 2
            );
            const normalizedAngularDistance = Math.min(
              1,
              angularDistanceFromCenter / maxAngularDistance
            );
            const perspectiveFactor = 0.3 + normalizedAngularDistance * 0.7;
            const centerShorteningFactor = Math.max(
              0.2,
              Math.min(1, distanceFromCenter / outerRadius)
            );
            const shorteningFactor =
              1 - centerShortening +
              centerShorteningFactor * centerShortening;
            const streakLength = Math.max(
              2,
              starLength * perspectiveFactor * shorteningFactor
            );

            const directionLength = Math.sqrt(
              starItem.vx * starItem.vx + starItem.vy * starItem.vy
            );

            if (directionLength > 0 && streakLength > 1) {
              const invDirLength = 1 / directionLength;
              const normalizedX = starItem.vx * invDirLength;
              const normalizedY = starItem.vy * invDirLength;
              const streakOffset = streakLength * 0.3;
              const startX = screenX - normalizedX * streakOffset;
              const startY = screenY - normalizedY * streakOffset;
              const endX = screenX + normalizedX * streakLength;
              const endY = screenY + normalizedY * streakLength;
              const thicknessFactor = Math.max(
                0.2,
                Math.min(1, distanceFromCenter / outerRadius)
              );
              const lineWidth = Math.max(
                0.2,
                starThickness *
                  (1 - centerThinning + thicknessFactor * centerThinning)
              );
              const thicknessOpacityFactor = Math.max(0.3, thicknessFactor);
              starItem.opacity *= thicknessOpacityFactor;

              ctx.lineWidth = lineWidth;
              ctx.lineCap = 'round';
              const baseColor = starItem.color.replace('rgb(', '').replace(')', '');
              ctx.strokeStyle = `rgba(${baseColor}, ${currentOpacity})`;
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.stroke();
            }
          }
        }
      }

      const spawnInterval = getSpawnInterval();
      const starsNeeded = starCount - stars.length;
      if (starsNeeded > 0) {
        const timeSinceLastSpawn = currentTime - lastSpawnTimeRef.current;
        if (timeSinceLastSpawn > spawnInterval) {
          const baseSpawnCount = Math.min(
            8,
            Math.max(2, Math.floor(starCount / 100))
          );
          const starsToSpawn = Math.min(baseSpawnCount, starsNeeded);
          for (let i = 0; i < starsToSpawn; i += 1) {
            stars.push(createStar(centerX, centerY));
          }
          lastSpawnTimeRef.current = currentTime;
        }
      }

      starsRef.current = stars;
    },
    [
      backgroundColor,
      innerRadius,
      starCount,
      createStar,
      getSpawnInterval,
      starLength,
      starThickness,
      outerRadius,
      centerShortening,
      centerThinning
    ]
  );

  const animate = useCallback(
    (currentTime) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (paused) {
        if (starsRef.current.length === 0) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          for (let i = 0; i < starCount; i += 1) {
            const newStar = createStar(centerX, centerY);
            const travelProgress = Math.random();
            const maxTravelDistance = Math.sqrt(
              (centerX - newStar.x) ** 2 + (centerY - newStar.y) ** 2
            );
            const travelDistance = maxTravelDistance * travelProgress;
            const directionLength = Math.sqrt(
              newStar.vx ** 2 + newStar.vy ** 2
            );
            const directionX = newStar.vx / directionLength;
            const directionY = newStar.vy / directionLength;
            newStar.x = newStar.spawnX + directionX * travelDistance;
            newStar.y = newStar.spawnY + directionY * travelDistance;
            const distanceTraveled = Math.sqrt(
              (newStar.x - newStar.spawnX) ** 2 +
                (newStar.y - newStar.spawnY) ** 2
            );
            newStar.fadeInProgress = Math.min(
              1,
              distanceTraveled / newStar.fadeInDistance
            );
            newStar.age = travelProgress * newStar.maxAge;
            starsRef.current.push(newStar);
          }
        }
        updateAndRender(ctx, canvas.width, canvas.height, 0, currentTime);
      } else {
        const deltaTime = currentTime - lastTimeRef.current;
        lastTimeRef.current = currentTime;
        updateAndRender(ctx, canvas.width, canvas.height, deltaTime, currentTime);
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [paused, updateAndRender, starCount, createStar]
  );

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const width = Math.max(container.clientWidth, 2);
    const height = Math.max(container.clientHeight, 2);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    initStars(width, height);
  }, [initStars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';

    handleResize();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisibleRef.current = entry.isIntersecting;
      },
      { rootMargin: '100px', threshold: 0 }
    );
    intersectionObserver.observe(container);

    animationRef.current = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [handleResize, animate]);

  const containerClassName = ['relative', className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'transparent'
        }}
      />
    </div>
  );
}
