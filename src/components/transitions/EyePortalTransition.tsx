"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { HERO_ARTBOARD, heroEyeConfigs } from "@/components/hero/heroEyeConfig";

import styles from "./EyePortalTransition.module.css";

const originEye = heroEyeConfigs.find((eye) => eye.id === "eye-bottom-center");

if (!originEye) {
  throw new Error("The bottom-center Hero eye is required for the portal origin.");
}

// Neutral pupil center in the original eye crop (see prepare_hero_eyes.py).
const transitionOriginX = originEye.crop.x + 127;
const transitionOriginY = originEye.crop.y + 99;
const portalDiameter = 64;
const coreDiameterRatio = 0.72 * 0.25;
const innerFinalScale = 1.45;

export function EyePortalTransition({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const finalRedRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const overlay = overlayRef.current;
    const finalRed = finalRedRef.current;
    const disc = discRef.current;
    const inner = innerRef.current;
    const core = coreRef.current;
    const artboard = stage?.querySelector<HTMLElement>("[data-eye-system='shared']");
    const horizontalSection = stage?.querySelector<HTMLElement>(
      "[data-nazar-section='horizontal-intro']",
    );
    const horizontalTrack = stage?.querySelector<HTMLElement>(
      "[data-horizontal-intro-track]",
    );
    const horizontalPath = stage?.querySelector<SVGPathElement>(
      "[data-horizontal-intro-path]",
    );
    const pathClipRect = stage?.querySelector<SVGRectElement>(
      "[data-horizontal-intro-path-clip]",
    );

    if (
      !stage ||
      !overlay ||
      !finalRed ||
      !disc ||
      !inner ||
      !core ||
      !artboard ||
      !horizontalSection ||
      !horizontalTrack ||
      !horizontalPath ||
      !pathClipRect
    ) {
      return;
    }

    let maximumScale = 1;
    let maximumCoreScale = 1;

    const measureOrigin = () => {
      const stageRect = stage.getBoundingClientRect();
      const artboardRect = artboard.getBoundingClientRect();
      const x =
        artboardRect.left - stageRect.left +
        (transitionOriginX / HERO_ARTBOARD.width) * artboardRect.width;
      const y =
        artboardRect.top - stageRect.top +
        (transitionOriginY / HERO_ARTBOARD.height) * artboardRect.height;

      overlay.style.setProperty("--portal-origin-x", `${x}px`);
      overlay.style.setProperty("--portal-origin-y", `${y}px`);

      const radius = Math.max(
        Math.hypot(x, y),
        Math.hypot(stageRect.width - x, y),
        Math.hypot(x, stageRect.height - y),
        Math.hypot(stageRect.width - x, stageRect.height - y),
      );
      maximumScale = ((radius + 20) * 2) / portalDiameter;
      maximumCoreScale =
        (radius + 20) /
        ((portalDiameter / 2) * maximumScale * innerFinalScale * coreDiameterRatio);
    };

    measureOrigin();
    const resizeObserver = new ResizeObserver(measureOrigin);
    resizeObserver.observe(stage);
    resizeObserver.observe(artboard);

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const portalScrollDistance = () => Math.round(window.innerHeight * 1.8);
        const horizontalScrollDistance = () =>
          horizontalTrack.offsetWidth - window.innerWidth;
        const horizontalDuration = () =>
          horizontalScrollDistance() / portalScrollDistance();
        let horizontalTween: gsap.core.Tween | null = null;
        let pathClipTween: gsap.core.Tween | null = null;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () =>
              `+=${portalScrollDistance() + horizontalScrollDistance()}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              measureOrigin();
              horizontalTween?.duration(horizontalDuration());
              pathClipTween?.duration(horizontalDuration());
            },
            onRefresh: measureOrigin,
          },
        });

        timeline
          .set(disc, { scale: 0 }, 0)
          .set(finalRed, { opacity: 0 }, 0)
          .set([inner, core], { opacity: 1, scale: 1 }, 0)
          .to({ hold: 0 }, { hold: 1, duration: 0.1 }, 0)
          .to(disc, { scale: 0.25, duration: 0.06, ease: "power2.out" }, 0.1)
          .to(disc, { scale: 3.2, duration: 0.06, ease: "power2.inOut" }, 0.16)
          .to(
            disc,
            { scale: () => maximumScale, duration: 0.36, ease: "power2.inOut" },
            0.22,
          )
          .to(inner, { scale: innerFinalScale, duration: 0.4, ease: "power3.inOut" }, 0.34)
          .to(
            core,
            { scale: () => maximumCoreScale, duration: 0.44, ease: "power2.in" },
            0.52,
          )
          .to(finalRed, { opacity: 1, duration: 0.01, ease: "none" }, 0.985)
          .to({ hold: 0 }, { hold: 1, duration: 0.04 }, 0.96)
          .set(horizontalSection, { autoAlpha: 1 }, 1)
          .set(pathClipRect, { attr: { width: 0 } }, 1);

        timeline.to(
          horizontalTrack,
          {
            x: () => -horizontalScrollDistance(),
            duration: horizontalDuration(),
            ease: "none",
          },
          1,
        );
        horizontalTween = timeline.recent() as gsap.core.Tween;

        timeline.to(
          pathClipRect,
          {
            attr: { width: 2100 },
            duration: horizontalDuration(),
            ease: "none",
          },
          1,
        );
        pathClipTween = timeline.recent() as gsap.core.Tween;
      }, stage);

      return () => context.revert();
    });

    return () => {
      media.revert();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={styles.stage} data-nazar-layer="eye-portal-stage" ref={stageRef}>
      {children}
      <div aria-hidden="true" className={styles.finalRed} ref={finalRedRef} />
      <div
        aria-hidden="true"
        className={styles.overlay}
        data-nazar-layer="eye-portal-overlay"
        ref={overlayRef}
      >
        <div className={styles.origin}>
          <div className={styles.disc} data-eye-portal-disc ref={discRef}>
            <div className={styles.inner} ref={innerRef}>
              <div className={styles.core} ref={coreRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
