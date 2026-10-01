"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Particles } from "@/components/effects/Particles";

import styles from "./GazeScene.module.css";

const depthEase = (progress: number) =>
  progress * progress * (3 - 2 * progress);
const gazeParticleColors = ["#ffffff"];
const partOneWords = "The gaze lingers where desire begins,".split(" ");
const partTwoWords = "and envy grows in the silence that follows.".split(" ");

export function GazeScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const fallingLinesRef = useRef<HTMLDivElement>(null);
  const partOneWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const partTwoWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const midCloudRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const foregroundCloudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const fallingLines = fallingLinesRef.current;
    const partOne = partOneWordRefs.current.filter(
      (word): word is HTMLSpanElement => word !== null,
    );
    const partTwo = partTwoWordRefs.current.filter(
      (word): word is HTMLSpanElement => word !== null,
    );
    const midClouds = midCloudRef.current;
    const subject = subjectRef.current;
    const foregroundClouds = foregroundCloudRef.current;

    if (
      !scene ||
      !fallingLines ||
      partOne.length !== partOneWords.length ||
      partTwo.length !== partTwoWords.length ||
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
            fallingLines,
            { autoAlpha: 0, scaleY: 0.18, yPercent: 18 },
            {
              autoAlpha: 0.42,
              duration: 1.45,
              ease: "power1.out",
              scaleY: 1,
              yPercent: -10,
            },
            0.25,
          )
          .to(
            fallingLines,
            {
              autoAlpha: 0,
              duration: 0.5,
              ease: "power1.in",
              yPercent: -24,
            },
            2.25,
          )
          .fromTo(
            partOne,
            { autoAlpha: 0, yPercent: 55 },
            {
              autoAlpha: 1,
              duration: 0.32,
              ease: "power2.out",
              stagger: 0.05,
              yPercent: 0,
            },
            0.3,
          )
          .fromTo(
            partTwo,
            { autoAlpha: 0, yPercent: 55 },
            {
              autoAlpha: 1,
              duration: 0.32,
              ease: "power2.out",
              stagger: 0.05,
              yPercent: 0,
            },
            0.72,
          )
          .to(
            [partOne, partTwo],
            {
              autoAlpha: 0,
              duration: 0.3,
              ease: "power1.in",
              stagger: 0.018,
              yPercent: -35,
            },
            1.56,
          )
          .fromTo(
            midClouds,
            { scale: 1.01, yPercent: 92 },
            { duration: 1.4, ease: depthEase, scale: 1.055, yPercent: -8 },
            pureFallDuration,
          )
          .fromTo(
            subject,
            { scale: 0.75, yPercent: -12 },
            {
              duration: 3.4,
              ease: depthEase,
              scale: 0.75,
              yPercent: 60,
            },
            0,
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

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      media.revert();
    };
  }, []);

  return (
    <div className={styles.sequence}>
      <section aria-label="Gaze" className={styles.scene} ref={sceneRef}>
        <div className={styles.viewport} data-gaze-viewport>
          <div className={styles.revealWindow} data-gaze-reveal-window>
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

          <div
            aria-hidden="true"
            className={styles.fallingLinesLayer}
            ref={fallingLinesRef}
          >
            <svg viewBox="0 0 640 300">
              <line x1="92" x2="88" y1="46" y2="190" />
              <line x1="166" x2="170" y1="82" y2="236" />
              <line x1="242" x2="239" y1="28" y2="172" />
              <line x1="320" x2="324" y1="62" y2="250" />
              <line x1="398" x2="394" y1="34" y2="188" />
              <line x1="474" x2="478" y1="76" y2="226" />
              <line x1="550" x2="547" y1="42" y2="178" />
            </svg>
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

          <div className={`${styles.gazeCopy} ${styles.gazeCopyLeft}`}>
            <p>
              {partOneWords.map((word, index) => (
                <span
                  className={styles.gazeCopyWord}
                  key={`${word}-${index}`}
                  ref={(element) => {
                    partOneWordRefs.current[index] = element;
                  }}
                >
                  {word}
                  {index < partOneWords.length - 1 ? "\u00a0" : ""}
                </span>
              ))}
            </p>
          </div>

          <div className={`${styles.gazeCopy} ${styles.gazeCopyRight}`}>
            <p>
              {partTwoWords.map((word, index) => (
                <span
                  className={styles.gazeCopyWord}
                  key={`${word}-${index}`}
                  ref={(element) => {
                    partTwoWordRefs.current[index] = element;
                  }}
                >
                  {word}
                  {index < partTwoWords.length - 1 ? "\u00a0" : ""}
                </span>
              ))}
            </p>
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
        </div>
      </section>
    </div>
  );
}
