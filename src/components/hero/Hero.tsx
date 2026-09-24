import Image from "next/image";

import beliefArtwork from "../../../public/images/hero/belief-reference.png";

import styles from "./Hero.module.css";
import { InteractiveHeroEyes } from "./InteractiveHeroEyes";

export function Hero() {
  return (
    <section
      aria-labelledby="belief-title"
      className="relative z-0 min-h-svh overflow-hidden bg-[#e5ddc8] text-[#12110f]"
      data-nazar-layer="hero"
    >
      <div
        aria-hidden="true"
        className={styles.artworkLayer}
        data-hero-layer="artwork"
      >
        <div className={styles.artworkCanvas}>
          <Image
            alt=""
            className={styles.artworkImage}
            fill
            placeholder="blur"
            preload
            sizes="(orientation: portrait) 178svh, 100vw"
            src={beliefArtwork}
          />
          <span className={styles.beliefTint} />
        </div>
      </div>

      <div
        aria-hidden="true"
        className={styles.eyeLayer}
        data-hero-layer="eyes"
      >
        <InteractiveHeroEyes />
      </div>

      <div className={styles.titleLayer} data-hero-layer="title">
        <h2 className="sr-only" id="belief-title">
          BELIEF
        </h2>
      </div>
    </section>
  );
}
