"use client";

import { useEffect, useRef } from "react";

export function CityLightsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const lights: { x: number; y: number; width: number; height: number; opacity: number; speed: number }[] = [];
    const lightCount = 50;

    for (let i = 0; i < lightCount; i++) {
      lights.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: Math.random() * 3 + 2,
        height: Math.random() * 20 + 10,
        opacity: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.02 + 0.01,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lights.forEach((light) => {
        ctx.fillStyle = `rgba(212, 165, 116, ${light.opacity})`;
        ctx.fillRect(light.x, light.y, light.width, light.height);

        light.opacity += (Math.random() - 0.5) * light.speed;
        light.opacity = Math.max(0.2, Math.min(0.8, light.opacity));
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: "linear-gradient(to bottom, #0A1628, #1a2942)" }}
    />
  );
}
