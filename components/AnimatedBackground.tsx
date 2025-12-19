"use client";

import { useEffect, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

export function AnimatedBackground() {
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: false,
          },
        },
      },
      particles: {
        color: {
          value: ["#D4A574", "#F5F5F5"], // Gold and white for subtle stars
        },
        move: {
          direction: "top",
          enable: true,
          outModes: {
            default: "out",
          },
          random: true,
          speed: 0.3, // Slower for subtlety
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 30, // Fewer particles for subtlety
        },
        opacity: {
          value: { min: 0.05, max: 0.2 }, // Very subtle
        },
        shape: {
          type: "circle", // Circle particles (star shape may not be available in slim version)
        },
        size: {
          value: { min: 1, max: 2 }, // Smaller stars
        },
      },
      detectRetina: true,
    }),
    []
  );

  return <Particles id="tsparticles" options={options} />;
}
