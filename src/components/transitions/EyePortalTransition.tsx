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
const revealEase = (progress: number) =>
  progress * progress * (3 - 2 * progress);

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
    const gazeViewport = document.querySelector<HTMLElement>(
      "[data-gaze-viewport]",
    );
    const gazeRevealWindow = document.querySelector<HTMLElement>(
      "[data-gaze-reveal-window]",
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
      !pathClipRect ||
      !gazeViewport ||
      !gazeRevealWindow
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
        const revealScrollDistance = () => Math.round(window.innerHeight * 0.7);
        const horizontalDuration = () =>
          horizontalScrollDistance() / portalScrollDistance();
        const revealDuration = () =>
          revealScrollDistance() / portalScrollDistance();
        const revealStage = (
          width: number,
          height: number,
          radius: string,
        ) =>
          `inset(${Math.max(0, (window.innerHeight - height) / 2)}px ${Math.max(
            0,
            (window.innerWidth - width) / 2,
          )}px round ${radius})`;
        const dotStage = () => revealStage(6, 6, "999px");
        const shortDashStage = () =>
          revealStage(
            Math.min(Math.max(window.innerWidth * 0.08, 32), 96),
            4,
            "999px",
          );
        const lineStage = () =>
          revealStage(window.innerWidth * 0.2, 4, "999px");
        const pillStage = () =>
          revealStage(
            window.innerWidth * 0.22,
            Math.min(Math.max(window.innerHeight * 0.06, 42), 58),
            "999px",
          );
        const rectangleStage = () =>
          revealStage(
            window.innerWidth * 0.72,
            window.innerHeight * 0.62,
            "42px",
          );
        const fullStage = () => "inset(0px 0px round 0px)";
        let horizontalTween: gsap.core.Tween | null = null;
        let pathClipTween: gsap.core.Tween | null = null;
        let revealSequence: gsap.core.Timeline | null = null;

        // Gaze is normal flow until its own pin starts at this trigger's end.
        // Cancel that remaining document offset so the reveal stays on Page 2.
        const alignGazeReveal = (trigger: ScrollTrigger) => {
          gsap.set(gazeViewport, {
            y: -Math.max(0, trigger.end - trigger.scroll()),
          });
        };

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () =>
              `+=${
                portalScrollDistance() +
                horizontalScrollDistance() +
                revealScrollDistance()
              }`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              measureOrigin();
              horizontalTween?.duration(horizontalDuration());
              pathClipTween?.duration(horizontalDuration());
              revealSequence
                ?.duration(revealDuration())
                .startTime(1 + horizontalDuration());
            },
            onUpdate: alignGazeReveal,
            onRefresh: (trigger) => {
              measureOrigin();
              alignGazeReveal(trigger);
            },
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

        revealSequence = gsap
          .timeline()
          .set(gazeViewport, { autoAlpha: 1 }, 0)
          .set(gazeRevealWindow, { clipPath: dotStage }, 0)
          .to(
            gazeRevealWindow,
            { clipPath: shortDashStage, duration: 0.08, ease: revealEase },
            0,
          )
          .to(
            gazeRevealWindow,
            { clipPath: lineStage, duration: 0.1, ease: revealEase },
            0.08,
          )
          .to(
            gazeRevealWindow,
            { clipPath: pillStage, duration: 0.12, ease: revealEase },
            0.18,
          )
          .to(
            gazeRevealWindow,
            { clipPath: rectangleStage, duration: 0.22, ease: revealEase },
            0.3,
          )
          .to(
            gazeRevealWindow,
            { clipPath: fullStage, duration: 0.18, ease: revealEase },
            0.52,
          );
        revealSequence.duration(revealDuration());
        timeline.add(revealSequence, 1 + horizontalDuration());
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
