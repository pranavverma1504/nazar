import { Hero } from "@/components/hero/Hero";
import { NazarLoader } from "@/components/loader/NazarLoader";
import { FearScene } from "@/components/sections/FearScene";
import { GazeScene } from "@/components/story/GazeScene";
import { HorizontalIntro } from "@/components/story/HorizontalIntro";
import { EyePortalTransition } from "@/components/transitions/EyePortalTransition";

export default function Home() {
  return (
    <main className="relative min-h-svh">
      <h1 className="sr-only">NAZAR</h1>
      <EyePortalTransition>
        <Hero />
        <HorizontalIntro />
      </EyePortalTransition>
      <GazeScene />
      <FearScene />
      <NazarLoader />
    </main>
  );
}
