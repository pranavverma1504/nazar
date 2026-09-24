"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

import styles from "./Hero.module.css";
import { HERO_ARTBOARD, heroEyeConfigs } from "./heroEyeConfig";

const LERP = 0.11;
const SETTLED_EPSILON = 0.001;
const INFLUENCE_DISTANCE = HERO_ARTBOARD.width * 0.5;

type EyeStyle = CSSProperties & {
  "--eye-left": string;
  "--eye-top": string;
  "--eye-width": string;
  "--eye-height": string;
  "--eye-mask": string;
};

type EyeElements = {
  innerIris: HTMLSpanElement | null;
  pupil: HTMLSpanElement | null;
};

type EyeMotion = {
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
};

const eyeMotion = () => ({
  currentX: 0,
  currentY: 0,
  targetX: 0,
  targetY: 0,
});

function percent(value: number, total: number) {
  return `${((value / total) * 100).toFixed(6)}%`;
}

export function InteractiveHeroEyes() {
  const artboardRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<Record<string, EyeElements>>({});

  useEffect(() => {
    const artboard = artboardRef.current;
    const hero = artboard?.closest<HTMLElement>("[data-nazar-layer='hero']");

    if (!artboard || !hero) {
      return;
    }

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const motions = Object.fromEntries(
      heroEyeConfigs.map((eye) => [eye.id, eyeMotion()]),
    ) as Record<string, EyeMotion>;

    let artboardLeft = 0;
    let artboardTop = 0;
    let viewportToArtboard = 1;
    let artboardToViewport = 1;
    let frameId = 0;
    let trackingEnabled = false;

    const setLayerTransforms = (
      eye: (typeof heroEyeConfigs)[number],
      x: number,
      y: number,
    ) => {
      const elements = elementsRef.current[eye.id];
      if (!elements?.innerIris || !elements.pupil) {
        return;
      }

      const pupilX = x * eye.movement.pupilMaxX * artboardToViewport;
      const pupilY = y * eye.movement.pupilMaxY * artboardToViewport;
      const innerX = pupilX * eye.movement.innerIrisRatio;
      const innerY = pupilY * eye.movement.innerIrisRatio;

      elements.innerIris.style.transform = `translate3d(${innerX.toFixed(3)}px, ${innerY.toFixed(3)}px, 0)`;
      elements.pupil.style.transform = `translate3d(${pupilX.toFixed(3)}px, ${pupilY.toFixed(3)}px, 0)`;
    };

    const setWillChange = (value: "auto" | "transform") => {
      heroEyeConfigs.forEach((eye) => {
        const elements = elementsRef.current[eye.id];
        if (elements?.innerIris && elements.pupil) {
          elements.innerIris.style.willChange = value;
          elements.pupil.style.willChange = value;
        }
      });
    };

    const measureArtboard = () => {
      const bounds = artboard.getBoundingClientRect();
      artboardLeft = bounds.left;
      artboardTop = bounds.top;
      viewportToArtboard = HERO_ARTBOARD.width / bounds.width;
      artboardToViewport = bounds.width / HERO_ARTBOARD.width;
    };

    const render = () => {
      let allSettled = true;

      heroEyeConfigs.forEach((eye) => {
        const motion = motions[eye.id];
        motion.currentX += (motion.targetX - motion.currentX) * LERP;
        motion.currentY += (motion.targetY - motion.currentY) * LERP;

        const settled =
          Math.abs(motion.targetX - motion.currentX) < SETTLED_EPSILON &&
          Math.abs(motion.targetY - motion.currentY) < SETTLED_EPSILON;

        if (settled) {
          motion.currentX = motion.targetX;
          motion.currentY = motion.targetY;
        } else {
          allSettled = false;
        }

        setLayerTransforms(eye, motion.currentX, motion.currentY);
      });

      if (allSettled) {
        setWillChange("auto");
        artboard.dataset.eyeRaf = "idle";
        frameId = 0;
        return;
      }

      frameId = window.requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (frameId !== 0) {
        return;
      }

      setWillChange("transform");
      artboard.dataset.eyeRaf = "active";
      frameId = window.requestAnimationFrame(render);
    };

    const setNeutralTargets = () => {
      heroEyeConfigs.forEach((eye) => {
        motions[eye.id].targetX = 0;
        motions[eye.id].targetY = 0;
      });
    };

    const returnToCenter = () => {
      setNeutralTargets();
      requestRender();
    };

    const resetImmediately = () => {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      setNeutralTargets();

      heroEyeConfigs.forEach((eye) => {
        const motion = motions[eye.id];
        motion.currentX = 0;
        motion.currentY = 0;
        setLayerTransforms(eye, 0, 0);
      });

      setWillChange("auto");
      artboard.dataset.eyeRaf = "idle";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      const pointerX = (event.clientX - artboardLeft) * viewportToArtboard;
      const pointerY = (event.clientY - artboardTop) * viewportToArtboard;

      heroEyeConfigs.forEach((eye) => {
        const eyeCenterX = eye.crop.x + eye.crop.width / 2;
        const eyeCenterY = eye.crop.y + eye.crop.height / 2;
        const deltaX = pointerX - eyeCenterX;
        const deltaY = pointerY - eyeCenterY;
        const distance = Math.hypot(deltaX, deltaY);
        const motion = motions[eye.id];

        if (distance === 0) {
          motion.targetX = 0;
          motion.targetY = 0;
          return;
        }

        const influence = Math.min(distance / INFLUENCE_DISTANCE, 1);
        motion.targetX = (deltaX / distance) * influence;
        motion.targetY = (deltaY / distance) * influence;
      });

      requestRender();
    };

    const resizeObserver = new ResizeObserver(measureArtboard);

    const enableTracking = () => {
      if (trackingEnabled) {
        return;
      }

      measureArtboard();
      resizeObserver.observe(artboard);
      hero.addEventListener("pointermove", handlePointerMove, { passive: true });
      hero.addEventListener("pointerleave", returnToCenter);
      trackingEnabled = true;
      artboard.dataset.eyeTracking = "enabled";
    };

    const disableTracking = () => {
      if (trackingEnabled) {
        resizeObserver.disconnect();
        hero.removeEventListener("pointermove", handlePointerMove);
        hero.removeEventListener("pointerleave", returnToCenter);
        trackingEnabled = false;
      }

      artboard.dataset.eyeTracking = "disabled";
      resetImmediately();
    };

    const syncCapability = () => {
      if (finePointer.matches && !reducedMotion.matches) {
        enableTracking();
      } else {
        disableTracking();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetImmediately();
      } else if (trackingEnabled) {
        measureArtboard();
      }
    };

    artboard.dataset.eyeRaf = "idle";
    finePointer.addEventListener("change", syncCapability);
    reducedMotion.addEventListener("change", syncCapability);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    syncCapability();

    return () => {
      disableTracking();
      finePointer.removeEventListener("change", syncCapability);
      reducedMotion.removeEventListener("change", syncCapability);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className={styles.eyeArtboard}
      data-eye-raf="idle"
      data-eye-system="shared"
      data-eye-tracking="pending"
      ref={artboardRef}
    >
      {heroEyeConfigs.map((eye) => {
        const style: EyeStyle = {
          "--eye-left": percent(eye.crop.x, HERO_ARTBOARD.width),
          "--eye-top": percent(eye.crop.y, HERO_ARTBOARD.height),
          "--eye-width": percent(eye.crop.width, HERO_ARTBOARD.width),
          "--eye-height": percent(eye.crop.height, HERO_ARTBOARD.height),
          "--eye-mask": `url("${eye.assets.apertureMask}")`,
        };

        return (
          <div
            className={styles.interactiveEye}
            data-eye={eye.id}
            data-inner-iris-ratio={eye.movement.innerIrisRatio}
            data-pupil-max-x={eye.movement.pupilMaxX}
            data-pupil-max-y={eye.movement.pupilMaxY}
            key={eye.id}
            style={style}
          >
            <div className={styles.interactiveEyeClip}>
              <Image
                alt=""
                className={styles.eyeAsset}
                height={eye.crop.height}
                sizes="(max-aspect-ratio: 3/4) 94vw, 36vw"
                src={eye.assets.cleanedBed}
                width={eye.crop.width}
              />
              <span
                className={styles.interactiveEyeMovingLayer}
                data-eye-inner-iris={eye.id}
                ref={(node) => {
                  elementsRef.current[eye.id] ??= {
                    innerIris: null,
                    pupil: null,
                  };
                  elementsRef.current[eye.id].innerIris = node;
                }}
              >
                <Image
                  alt=""
                  className={styles.eyeAsset}
                  height={eye.crop.height}
                  sizes="(max-aspect-ratio: 3/4) 94vw, 36vw"
                  src={eye.assets.innerIris}
                  width={eye.crop.width}
                />
              </span>
              <span
                className={styles.interactiveEyeMovingLayer}
                data-eye-pupil={eye.id}
                ref={(node) => {
                  elementsRef.current[eye.id] ??= {
                    innerIris: null,
                    pupil: null,
                  };
                  elementsRef.current[eye.id].pupil = node;
                }}
              >
                <Image
                  alt=""
                  className={styles.eyeAsset}
                  height={eye.crop.height}
                  sizes="(max-aspect-ratio: 3/4) 94vw, 36vw"
                  src={eye.assets.pupil}
                  width={eye.crop.width}
                />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

