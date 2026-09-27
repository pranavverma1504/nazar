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
  const midCloudRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const foregroundCloudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const midClouds = midCloudRef.current;
    const subject = subjectRef.current;
    const foregroundClouds = foregroundCloudRef.current;

    if (!scene || !midClouds || !subject || !foregroundClouds) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const pureFallDuration = 2;
        const totalDuration = 3.4;
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: scene,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * totalDuration)}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            refreshPriority: -1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .fromTo(
            midClouds,
            { scale: 1.01, yPercent: 92 },
            { duration: 1.4, ease: depthEase, scale: 1.055, yPercent: -8 },
            pureFallDuration,
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
            pureFallDuration + 0.42,
          )
          .fromTo(
            foregroundClouds,
            { scale: 1.025, yPercent: 102 },
            { duration: 0.85, ease: depthEase, scale: 1.09, yPercent: -14 },
            pureFallDuration + 0.55,
          );
      }, scene);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <section aria-label="Gaze" className={styles.scene} ref={sceneRef}>
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
    </section>
  );
}
