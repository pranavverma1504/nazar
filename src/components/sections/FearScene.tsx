"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./FearScene.module.css";

export function FearScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const bridge = bridgeRef.current;
    const heart = heartRef.current;

    if (!scene || !bridge || !heart) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.fromTo(
          heart,
          {
            y: () =>
              bridge.offsetTop +
              bridge.offsetWidth * (941 / 1678) * 0.65 -
              heart.offsetTop -
              heart.offsetHeight / 2,
          },
          {
            y: () =>
              scene.offsetHeight -
              heart.offsetTop -
              heart.offsetHeight -
              window.innerHeight * 0.04,
            ease: "none",
            scrollTrigger: {
              trigger: scene,
              start: "top top",
              end: () =>
                `+=${Math.max(1, scene.offsetHeight - window.innerHeight)}`,
              scrub: 0.8,
              refreshPriority: -2,
              invalidateOnRefresh: true,
            },
          },
        );

        const copy = copyRef.current;

        if (copy) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: scene,
                start: () =>
                  `top+=${Math.max(1, scene.offsetHeight - window.innerHeight) * 0.38} top`,
                end: () =>
                  `top+=${Math.max(1, scene.offsetHeight - window.innerHeight) * 0.66} top`,
                scrub: 0.8,
                refreshPriority: -2,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              copy,
              { y: 12, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.28,
                ease: (progress: number) => progress * progress * (3 - 2 * progress),
              },
              0,
            )
            .to(
              copy,
              {
                y: -8,
                opacity: 0,
                duration: 0.28,
                ease: (progress: number) => progress * progress * (3 - 2 * progress),
              },
              0.72,
            );
        }
      }, scene);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <section aria-label="Fear" className={styles.scene} ref={sceneRef}>
      <div aria-hidden="true" className={styles.atmosphere}>
        <div className={styles.upperAtmosphere} />
        <div className={styles.middleAtmosphere} />
        <div className={styles.deepAtmosphere} />
      </div>
      <div className={styles.bridgeLayer} ref={bridgeRef}>
        <Image
          alt=""
          className={styles.bridge}
          height={941}
          sizes="180vw"
          src="/images/fear/fear-cloud-bridge.webp"
          width={1678}
        />
      </div>
      <div className={styles.heartLayer} ref={heartRef}>
        <Image
          alt=""
          className={styles.heart}
          height={1024}
          sizes="(max-width: 700px) 34vw, 18vw"
          src="/images/fear/fear-heart.webp"
          width={1024}
        />
      </div>
      <div aria-hidden="true" className={styles.foregroundMist}>
        {[styles.middleMist, styles.lowerMist].map((placement) => (
          <div className={`${styles.mistWisp} ${placement}`} key={placement}>
            <Image
              alt=""
              className={styles.mistImage}
              fill
              sizes="110vw"
              src="/images/fear/fear-fog-front.png"
            />
          </div>
        ))}
      </div>
      <div className={styles.copyEncounter}>
        <p className={styles.copy} ref={copyRef}>
          <span className={styles.copyLine}>Fear grows where</span>{" "}
          <span className={styles.copyLine}>certainty disappears.</span>
        </p>
      </div>
    </section>
  );
}
