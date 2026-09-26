# Emil Kowalski Animation Skill & Design Engineering Rules

## Core Directive
Inject high-craft micro-interactions, fluid spring physics, and hardware-accelerated motion into every UI asset. Eliminate repetitive "AI slop" animations (e.g., rigid ease-in-out, layout property manipulation).

## Mandatory Execution Principles

### 1. Performance & GPU Acceleration
- **Rule:** Never animate layout-triggering properties (`top`, `left`, `width`, `height`, `margin`, `padding`). 
- **Enforcement:** Animate strictly via hardware-accelerated vectors: `transform: translate3d()`, `scale()`, `rotate()`, and `opacity`.

### 2. Spring Physics Over Fixed Easing
- **Rule:** Ban linear transitions and generic curves for interactive items.
- **Enforcement:** Use physics-based spring mechanics or custom, expressive cubic-beziers (e.g., subtle overshoot configs like `cubic-bezier(0.34, 1.56, 0.64, 1)`).

### 3. Micro-interactions & Choreography
- **Rule:** Elements must not pop onto the page simultaneously or animate from absolute zero (`scale(0)`).
- **Enforcement:** Use stagger delays (e.g., `0.02s` to `0.05s` increments) for element groups. Active hover transitions must be fully interruptible so they blend seamlessly if the user rapidly moves their mouse.

### 4. Accessibility Guardrails
- **Rule:** Respect device-level user preferences.
- **Enforcement:** Wrap complex scroll parallax and heavy transform transitions inside `prefers-reduced-motion: reduce` media query safe zones, gracefully falling back to simple, elegant text cross-fades.

