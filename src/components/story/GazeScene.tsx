"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Particles } from "@/components/effects/Particles";

import styles from "./GazeScene.module.css";

const depthEase = (progress: number) =>
  progress * progress * (3 - 2 * progress);
const subjectEase = (progress: number) => 1 - Math.pow(1 - progress, 3);
const gazeParticleColors = ["#ffffff"];

export function GazeScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const revealWindowRef = useRef<HTMLDivElement>(null);
  const midCloudRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const foregroundCloudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const revealWindow = revealWindowRef.current;
    const midClouds = midCloudRef.current;
    const subject = subjectRef.current;
    const foregroundClouds = foregroundCloudRef.current;

    if (
      !scene ||
      !revealWindow ||
      !midClouds ||
      !subject ||
      !foregroundClouds
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const revealDuration = 0.7;
        const pureFallDuration = 2;
        const totalDuration = 3.4;
        const sequenceDuration = revealDuration + totalDuration;
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
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: scene,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * sequenceDuration)}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            refreshPriority: -1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .set(revealWindow, { clipPath: dotStage }, 0)
          .to(
            revealWindow,
            {
              clipPath: shortDashStage,
              duration: 0.08,
              ease: depthEase,
            },
            0,
          )
          .to(
            revealWindow,
            { clipPath: lineStage, duration: 0.1, ease: depthEase },
            0.08,
          )
          .to(
            revealWindow,
            { clipPath: pillStage, duration: 0.12, ease: depthEase },
            0.18,
          )
          .to(
            revealWindow,
            { clipPath: rectangleStage, duration: 0.22, ease: depthEase },
            0.3,
          )
          .to(
            revealWindow,
            { clipPath: fullStage, duration: 0.18, ease: depthEase },
            0.52,
          )
          .fromTo(
            midClouds,
            { scale: 1.01, yPercent: 92 },
            { duration: 1.4, ease: depthEase, scale: 1.055, yPercent: -8 },
            revealDuration + pureFallDuration,
          )
          .fromTo(
            subject,
            { autoAlpha: 0, scale: 0.92, yPercent: 88 },
            {
              autoAlpha: 1,
              duration: 0.9,
              ease: subjectEase,
              scale: 1,
              yPercent: 0,
            },
            revealDuration + pureFallDuration + 0.42,
          )
          .fromTo(
            foregroundClouds,
            { scale: 1.025, yPercent: 102 },
            { duration: 0.85, ease: depthEase, scale: 1.09, yPercent: -14 },
            revealDuration + pureFallDuration + 0.55,
          );
      }, scene);

      return () => context.revert();
    });

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      media.revert();
    };
  }, []);

  return (
    <section aria-label="Gaze" className={styles.scene} ref={sceneRef}>
      <div className={styles.revealWindow} ref={revealWindowRef}>
        <div className={styles.backgroundLayer}>
          <Particles
            alphaParticles
            disableRotation
            moveParticlesOnHover
            particleBaseSize={80}
            particleColors={gazeParticleColors}
            particleCount={220}
            particleHoverFactor={1}
            particleSpread={12}
            pixelRatio={1}
            speed={0.035}
          />
        </div>

        <div className={styles.midCloudLayer} ref={midCloudRef}>
          <Image
            alt=""
            fill
            loading="eager"
            sizes="100vw"
            src="/images/gaze/gaze-clouds-mid.webp"
          />
        </div>

        <div className={styles.subjectLayer} ref={subjectRef}>
          <Image
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 700px) 82vw, 42vw"
            src="/images/gaze/gaze-subject.webp"
          />
        </div>

        <div className={styles.foregroundCloudLayer} ref={foregroundCloudRef}>
          <Image
            alt=""
            fill
            loading="eager"
            sizes="100vw"
            src="/images/gaze/gaze-clouds-front.webp"
          />
        </div>
      </div>
    </section>
  );
}
