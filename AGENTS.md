<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## NAZAR project rules

### Workflow

- Work only on the explicitly requested step; never continue to the next numbered step without user approval.
- Inspect the existing implementation before editing, avoid unrelated refactors, keep reports concise, and do not dump large code blocks unless requested.

### Architecture

- Use Next.js App Router, TypeScript, and Tailwind. Keep the Hero mounted underneath the loader.
- Use GSAP for cinematic timelines and controlled entrance or reveal sequences.
- Use refs plus `requestAnimationFrame` for continuous pointer interaction, not React state.
- Prefer `transform: translate3d()` and opacity for frequent animation. Avoid unnecessary dependencies and Canvas/WebGL without a clear technical need.

### Performance

- Never re-render React on every pointer movement; prefer one shared `requestAnimationFrame` loop for interactive eyes.
- Avoid repeated layout reads and continuous width, height, top, or left animation. Use `will-change` only when genuinely beneficial.
- Support `prefers-reduced-motion` and a mobile/touch fallback for pointer-only interactions.

### Visual direction

- Use near-black, aged cream/beige, dark ink, and deep red. Do not use blue unless explicitly requested.
- Preserve the engraved vintage aesthetic. Motion should be smooth, restrained, and cinematic; avoid flashy or bouncy animation.

### Interactive eyes

- Move the full iris/black-eyeball area; never fake the effect with a small pupil or dot over a static eye.
- Each eye may have its own movement strength, and its moving iris must stay clipped inside its eye opening.
- Subtle parallax is secondary to eyeball tracking.

### Verification

- For implementation steps, verify relevant lint, TypeScript, build, and browser behavior before reporting PASS.
