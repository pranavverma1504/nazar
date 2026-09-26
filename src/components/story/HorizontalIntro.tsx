import styles from "./HorizontalIntro.module.css";

export function HorizontalIntro() {
  return (
    <section
      aria-label="Horizontal introduction"
      className={styles.section}
      data-nazar-section="horizontal-intro"
    >
      <div className={styles.track} data-horizontal-intro-track>
        <svg
          aria-hidden="true"
          className={styles.pathLayer}
          preserveAspectRatio="none"
          viewBox="0 0 2000 1000"
        >
          <defs>
            <clipPath id="horizontal-path-clip">
              <rect
                data-horizontal-intro-path-clip
                height="1000"
                width="0"
                x="0"
                y="0"
              />
            </clipPath>
          </defs>
          <path
            className={styles.storyPath}
            clipPath="url(#horizontal-path-clip)"
            d="M 0 560 C 180 520 260 300 520 300 C 760 300 800 520 1030 560 C 1250 600 1400 480 1580 380 C 1760 280 1880 300 2000 330"
            data-horizontal-intro-path
            vectorEffect="non-scaling-stroke"
          />
          <path
            className={styles.storyPath}
            clipPath="url(#horizontal-path-clip)"
            d="M 0 360 C 230 390 330 520 520 540 C 730 560 820 360 1030 340 C 1240 320 1330 500 1510 530 C 1710 560 1840 450 2000 420"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className={styles.narrativeLayer}>
          <p className={`${styles.pageParagraph} ${styles.pocketOne}`}>
            <span>Not every gaze is meant to be seen,</span>
            <span>some are only meant to be felt.</span>
          </p>
          <p className={`${styles.pageParagraph} ${styles.pocketTwo}`}>
            <span>The eye moves on before we notice,</span>
            <span>but something of the gaze remains.</span>
          </p>
          <p className={`${styles.pageParagraph} ${styles.pocketThree}`}>
            <span>What we cannot explain, we begin to fear,</span>
            <span>and what we fear, we learn to protect against.</span>
          </p>
        </div>
        <section aria-label="Page 1" className={styles.panel} />
        <section aria-label="Page 2" className={styles.panel} />
      </div>
    </section>
  );
}
