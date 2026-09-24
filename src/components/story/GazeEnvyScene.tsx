"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./GazeEnvyScene.module.css";

const eyeAsset = "/images/story/gaze-envy-eye.png";

type GazeEnvySceneProps = {
  portalPreview?: boolean;
};

export function GazeEnvyScene({ portalPreview = false }: GazeEnvySceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null);
  const eyeRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (portalPreview) {
      return;
    }

    const section = sectionRef.current;

    if (!section) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 2)}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .set([eyeRef.current, reflectionRef.current], { rotation: 0 }, 0)
          .to({ hold: 0 }, { hold: 1, duration: 0.1 }, 0)
          .to(
            eyeRef.current,
            { rotation: 180, yPercent: -2, duration: 0.76, ease: "power1.inOut" },
            0.1,
          )
          .to(
            reflectionRef.current,
            {
              rotation: 177,
              yPercent: 2,
              scaleX: 1.025,
              skewX: 0.8,
              duration: 0.76,
              ease: "power1.inOut",
            },
            0.13,
          )
          .to(backgroundRef.current, { yPercent: -2, duration: 0.82, ease: "none" }, 0.1)
          .to(
            hazeRef.current,
            { xPercent: -1.25, yPercent: 3, duration: 0.76, ease: "none" },
            0.12,
          )
          .to(
            highlightsRef.current,
            { xPercent: -3, yPercent: -1, duration: 0.72, ease: "none" },
            0.14,
          )
          .to(
            foregroundRef.current,
            { xPercent: 4, yPercent: -2, duration: 0.68, ease: "none" },
            0.16,
          )
          .to({ hold: 0 }, { hold: 1, duration: 0.12 }, 0.88);
      }, section);

      return () => context.revert();
    });

    return () => media.revert();
  }, [portalPreview]);

  const artwork = (
    <div aria-hidden="true" className={styles.scene}>
      <div className={styles.background} ref={backgroundRef} />
      <div className={styles.haze} ref={hazeRef} />

      <div className={styles.eyePosition}>
        <div className={styles.eyeRotator} ref={eyeRef}>
          <Image
            alt=""
            className={styles.eyeArtwork}
            fill
            preload={!portalPreview}
            sizes="(max-width: 700px) 90vw, (max-width: 1225px) 62vw, 760px"
            src={eyeAsset}
          />
        </div>
      </div>

      <div className={styles.waterBase} />

      <div className={styles.reflectionSurface}>
        <div className={styles.reflectionPosition}>
          <div className={styles.reflectionRotator} ref={reflectionRef}>
            <Image
              alt=""
              className={styles.reflectionArtwork}
              fill
              sizes="(max-width: 700px) 90vw, (max-width: 1225px) 62vw, 760px"
              src={eyeAsset}
            />
          </div>
        </div>
      </div>

      <div className={styles.waterHighlights} ref={highlightsRef}>
        <div className={styles.highlightTexture} />
      </div>
      <div className={styles.foregroundWater} ref={foregroundRef}>
        <div className={styles.rippleTexture} />
      </div>
      <div className={styles.grain} />
    </div>
  );

  if (portalPreview) {
    return <div className={styles.section}>{artwork}</div>;
  }

  return (
    <section
      aria-labelledby="gaze-envy-title"
      className={styles.section}
      data-nazar-section="gaze-envy"
      ref={sectionRef}
    >
      <h2 className="sr-only" id="gaze-envy-title">
        Gaze becomes envy
      </h2>

      {artwork}
    </section>
  );
}
