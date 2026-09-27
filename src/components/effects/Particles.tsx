"use client";

import { useEffect, useRef } from "react";
import { Camera, Geometry, Mesh, Program, Renderer } from "ogl";

import styles from "./Particles.module.css";

type ParticlesProps = {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  pixelRatio?: number;
  className?: string;
};

const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;
  const value = Number.parseInt(expanded.slice(0, 6), 16);

  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    float time = uTime;

    modelPosition.x += sin(time * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    modelPosition.y += sin(time * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    modelPosition.z += sin(time * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_PointSize = uSizeRandomness == 0.0
      ? uBaseSize
      : (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float distanceFromCenter = length(uv - vec2(0.5));
    vec3 shimmer = vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28);

    if (uAlphaParticles < 0.5) {
      if (distanceFromCenter > 0.5) discard;
      gl_FragColor = vec4(shimmer, 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, distanceFromCenter) * 0.8;
      gl_FragColor = vec4(shimmer, circle);
    }
  }
`;

export function Particles({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio = 1,
  className = "",
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ dpr: pixelRatio, depth: false, alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      };
    };

    window.addEventListener("resize", resize, false);
    if (moveParticlesOnHover) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    resize();

    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount * 4);
    const colors = new Float32Array(particleCount * 3);
    const palette = particleColors?.length ? particleColors : defaultColors;

    for (let index = 0; index < particleCount; index += 1) {
      let x = 0;
      let y = 0;
      let z = 0;
      let lengthSquared = 0;

      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        lengthSquared = x * x + y * y + z * z;
      } while (lengthSquared > 1 || lengthSquared === 0);

      const radius = Math.cbrt(Math.random());
      positions.set([x * radius, y * radius, z * radius], index * 3);
      randoms.set(
        [Math.random(), Math.random(), Math.random(), Math.random()],
        index * 4,
      );
      colors.set(
        hexToRgb(palette[Math.floor(Math.random() * palette.length)]),
        index * 3,
      );
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * pixelRatio },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });
    const particles = new Mesh(gl, {
      mode: gl.POINTS,
      geometry,
      program,
    });
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let animationFrameId: number | undefined;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      elapsed += delta * speed;
      program.uniforms.uTime.value = elapsed * 0.001;

      if (moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * particleHoverFactor;
        particles.position.y = -mouseRef.current.y * particleHoverFactor;
      }

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * speed;
      }

      renderer.render({ scene: particles, camera });
      animationFrameId = requestAnimationFrame(update);
    };

    const stopAnimation = () => {
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;
      }
    };

    const startAnimation = () => {
      if (animationFrameId === undefined) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(update);
      }
    };

    let visibilityObserver: IntersectionObserver | undefined;

    if (reduceMotion) {
      renderer.render({ scene: particles, camera });
    } else {
      visibilityObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      });
      visibilityObserver.observe(container);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (moveParticlesOnHover) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      visibilityObserver?.disconnect();
      stopAnimation();
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    alphaParticles,
    cameraDistance,
    disableRotation,
    moveParticlesOnHover,
    particleBaseSize,
    particleCount,
    particleHoverFactor,
    particleSpread,
    pixelRatio,
    sizeRandomness,
    speed,
    particleColors,
  ]);

  return (
    <div
      aria-hidden="true"
      className={`${styles.container} ${className}`.trim()}
      ref={containerRef}
    />
  );
}
