"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const LETTERS = ["N", "A", "Z", "A", "R"];
const REVEAL_MASK =
  "radial-gradient(circle at 50% 50%, transparent var(--reveal-radius), #000 calc(var(--reveal-radius) + 1px))";

export function NazarLoader() {
  const loaderRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const letters = letterRefs.current.filter(
      (letter): letter is HTMLSpanElement => letter !== null,
    );

    if (
      !loaderRef.current ||
      !maskRef.current ||
      letters.length !== LETTERS.length
    ) {
      return;
    }

    const loader = loaderRef.current;
    const mask = maskRef.current;

    let context: ReturnType<typeof gsap.context> | undefined;

    const setupTimer = window.setTimeout(() => {
      context = gsap.context(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.set(loader, {
            autoAlpha: 0,
            pointerEvents: "none",
          });
          return;
        }

        gsap
          .timeline()
          .set(loader, { autoAlpha: 1, pointerEvents: "auto" })
          .set(letters, { opacity: 0, y: 22 })
          .to(
            letters,
            {
              duration: 0.4,
              ease: "power3.out",
              opacity: 1,
              stagger: 0.25,
              y: 0,
            },
            0.45,
          )
          .addLabel("reveal", ">+=0.4")
          .to(
            letters,
            {
              duration: 0.45,
              ease: "power2.out",
              opacity: 0,
            },
            "reveal",
          )
          .set(
            mask,
            {
              "--reveal-radius": "0px",
              maskImage: REVEAL_MASK,
              WebkitMaskImage: REVEAL_MASK,
              willChange: "mask-image",
            },
            "reveal+=0.08",
          )
          .to(
            mask,
            {
              "--reveal-radius": "60px",
              duration: 0.12,
              ease: "power2.out",
            },
            "reveal+=0.08",
          )
          .to(
            mask,
            {
              "--reveal-radius": () =>
                `${Math.ceil(Math.hypot(window.innerWidth, window.innerHeight) / 2) + 2}px`,
              duration: 1.1,
              ease: "power3.inOut",
            },
            "reveal+=0.2",
          )
          .set(
            loader,
            {
              autoAlpha: 0,
              pointerEvents: "none",
            },
            "reveal+=1.3",
          )
          .set(
            mask,
            {
              willChange: "auto",
            },
            "reveal+=1.3",
          );
      }, loaderRef);
    }, 0);

    return () => {
      window.clearTimeout(setupTimer);
      context?.revert();
    };
  }, []);

  return (
    <section
      aria-label="NAZAR introduction"
      className="fixed inset-0 z-10 min-h-svh"
      data-nazar-layer="loader"
      ref={loaderRef}
    >
      <div
        className="absolute inset-0 z-0 grid place-items-center bg-[#070707] px-6 text-[#e5ddc8]"
        data-nazar-mask=""
        ref={maskRef}
      >
        <p
          aria-live="polite"
          className="text-center text-[clamp(3.25rem,12vw,16rem)] leading-none font-bold"
          role="status"
        >
          <span className="sr-only">NAZAR</span>
          <span
            aria-hidden="true"
            className="inline-flex w-[54vw] max-w-[68rem] items-center justify-between"
          >
            {LETTERS.map((letter, index) => (
              <span
                className="inline-block translate-y-[22px] opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
                key={`${letter}-${index}`}
                ref={(node) => {
                  letterRefs.current[index] = node;
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </p>
      </div>
    </section>
  );
}
