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
          <path
            className={styles.storyPath}
            d="M 80 690 C 220 680 210 330 430 280 C 650 230 650 720 900 660 C 1050 625 1030 360 1210 330 C 1425 295 1450 760 1680 650 C 1810 590 1825 330 1950 220"
            data-horizontal-intro-path
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <section aria-label="Page 1" className={styles.panel}>
          <span>PAGE 1</span>
        </section>
        <section aria-label="Page 2" className={styles.panel}>
          <span>PAGE 2</span>
        </section>
      </div>
    </section>
  );
}
