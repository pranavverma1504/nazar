"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import eye1 from "../../../public/images/eye-sequence/eye-1.png";
import eye2 from "../../../public/images/eye-sequence/eye-2.png";
import eye3 from "../../../public/images/eye-sequence/eye-3.png";
import eye4 from "../../../public/images/eye-sequence/eye-4.png";

import styles from "./EyeSequence.module.css";

const EYES = [eye1, eye2, eye3, eye4];
const ENTRANCE_STARTS = [0.16, 1.05, 1.94, 2.83];
const ENTRANCE_DURATION = 0.72;
const SCROLL_SCREENS = 3.4;

export function EyeSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const panels = panelRefs.current;

    if (!section || panels.length !== EYES.length || panels.some((panel) => !panel)) {
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
            end: () => `+=${Math.round(window.innerHeight * SCROLL_SCREENS)}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.75,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        panels.forEach((panel, index) => {
          timeline.fromTo(
            panel,
            {
              x: () => -window.innerWidth * 1.3,
              opacity: 0,
              scale: 0.98,
            },
            {
              x: 0,
              opacity: 1,
              scale: 1,
              duration: ENTRANCE_DURATION,
              ease: "none",
              immediateRender: false,
            },
            ENTRANCE_STARTS[index],
          );
        });

        // A short final scroll interval lets the completed artwork be seen.
        timeline.to({ hold: 0 }, { hold: 1, duration: 0.48, ease: "none" }, 3.55);
      }, section);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <>
      <section
        aria-labelledby="eye-sequence-title"
        className={styles.section}
        data-nazar-layer="eye-sequence"
        ref={sectionRef}
      >
        <h2 className="sr-only" id="eye-sequence-title">
          Four watchful eyes
        </h2>
        <div className={styles.composition} data-eye-sequence-composition>
          {EYES.map((source, index) => (
            <div
              className={styles.panel}
              data-eye-sequence-panel={index + 1}
              key={source.src}
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
            >
              <Image
                alt=""
                className={styles.image}
                loading="eager"
                sizes="(max-width: 700px) 46vw, 23vw"
                src={source}
              />
            </div>
          ))}
        </div>
      </section>
      <div aria-hidden="true" className={styles.releaseSpace} />
    </>
  );
}
