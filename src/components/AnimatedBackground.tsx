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
          value: ["#D4A574", "#F5F5F5", "#E4B584", "#FFD700"], // Gold, white, warm gold, and bright gold for twinkling stars
        },
        move: {
          direction: "top",
          enable: true,
          outModes: {
            default: "out",
          },
          random: true,
          speed: { min: 0.15, max: 0.4 }, // Slower, more gentle drift
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 50, // More particles for richer starfield
        },
        opacity: {
          value: { min: 0.1, max: 0.4 }, // More visible twinkling
          animation: {
            enable: true,
            speed: { min: 0.3, max: 0.8 }, // Varied twinkle speeds
            sync: false,
            destroy: "none",
            minimumValue: 0.05,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 }, // More varied sizes
          animation: {
            enable: true,
            speed: { min: 1.5, max: 3 }, // Varied pulse speeds
            sync: false,
            destroy: "none",
            minimumValue: 0.5,
          },
        },
        twinkle: {
          particles: {
            enable: true,
            frequency: 0.08,
            opacity: { min: 0.2, max: 1 },
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  return <Particles id="tsparticles" options={options} />;
}
