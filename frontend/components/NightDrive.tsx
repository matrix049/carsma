'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Long-exposure night highway, drawn on a canvas: tail lights streaming
 * away on the right, warm headlights coming at you on the left, sodium street
 * lamps along the edges and a cool glow on the horizon. Simple pinhole projection — a light at world
 * (x, y, z) lands on screen at (cx + x·f/z, horizon + y·f/z).
 *
 * Pauses when off-screen or the tab is hidden; with reduced motion it renders
 * one still frame with extra-long trails, like a real long-exposure photo.
 */

interface Car {
  lane: number; // lane centre, metres (negative = oncoming side)
  z: number; // distance, metres
  speed: number; // m/s along z (positive = driving away)
}

const CAM_H = 1.25; // camera height above the road
const NEAR = 1.2;
const FAR = 140;
const TAIL = '255, 45, 26';
const HEAD = '255, 240, 214';

export default function NightDrive({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bg = document.createElement('canvas');
    const bgCtx = bg.getContext('2d');
    if (!bgCtx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let focal = 1;
    let horizon = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    let cars: Car[] = [];

    const project = (x: number, y: number, z: number) => ({
      x: w / 2 + (x * focal) / z,
      y: horizon + (y * focal) / z,
    });

    const spawn = (outgoing: boolean, z: number): Car => {
      const lanes = outgoing ? [1.9, 5.4] : [-1.9, -5.4];
      return {
        lane: lanes[Math.floor(Math.random() * lanes.length)] + (Math.random() - 0.5) * 0.4,
        z,
        speed: (outgoing ? 1 : -1) * (14 + Math.random() * 18),
      };
    };

    const populate = () => {
      const perSide = w < 640 ? 7 : 11;
      cars = [];
      for (let i = 0; i < perSide; i++) {
        cars.push(spawn(true, NEAR + Math.random() * (FAR - NEAR)));
        cars.push(spawn(false, NEAR + Math.random() * (FAR - NEAR)));
      }
    };

    /** Static scenery: sky glow, road surface, edge lines, lamps. */
    const paintBackground = () => {
      bg.width = canvas.width;
      bg.height = canvas.height;
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      bgCtx.fillStyle = '#0A0A0B';
      bgCtx.fillRect(0, 0, w, h);

      const glow = bgCtx.createRadialGradient(w / 2, horizon, 0, w / 2, horizon, Math.max(w, h) * 0.7);
      glow.addColorStop(0, 'rgba(143, 203, 255, 0.16)');
      glow.addColorStop(0.35, 'rgba(143, 203, 255, 0.04)');
      glow.addColorStop(1, 'rgba(10, 10, 11, 0)');
      bgCtx.fillStyle = glow;
      bgCtx.fillRect(0, 0, w, h);

      // Road surface
      const l = project(-8, CAM_H, NEAR);
      const r = project(8, CAM_H, NEAR);
      const road = bgCtx.createLinearGradient(0, horizon, 0, h);
      road.addColorStop(0, 'rgba(255,255,255,0.015)');
      road.addColorStop(1, 'rgba(255,255,255,0.045)');
      bgCtx.fillStyle = road;
      bgCtx.beginPath();
      bgCtx.moveTo(w / 2, horizon);
      bgCtx.lineTo(r.x, r.y);
      bgCtx.lineTo(l.x, l.y);
      bgCtx.closePath();
      bgCtx.fill();

      // Edge + lane lines
      bgCtx.lineCap = 'round';
      for (const x of [-8, 8]) {
        const p = project(x, CAM_H, NEAR);
        bgCtx.strokeStyle = 'rgba(255,255,255,0.09)';
        bgCtx.lineWidth = 1.2;
        bgCtx.beginPath();
        bgCtx.moveTo(w / 2, horizon);
        bgCtx.lineTo(p.x, p.y);
        bgCtx.stroke();
      }
      for (const x of [-3.6, 0, 3.6]) {
        for (let z = 3; z < FAR; z += 7) {
          const a = project(x, CAM_H, z);
          const b = project(x, CAM_H, z + 3);
          bgCtx.strokeStyle = `rgba(255,255,255,${x === 0 ? 0.11 : 0.06})`;
          // Capped: right under the camera the dashes would turn into fat pills.
          bgCtx.lineWidth = Math.min(3, Math.max(0.4, 0.12 * (focal / z)));
          bgCtx.beginPath();
          bgCtx.moveTo(a.x, a.y);
          bgCtx.lineTo(b.x, b.y);
          bgCtx.stroke();
        }
      }

      // Sodium street lamps
      for (const x of [-10.5, 10.5]) {
        for (let z = 9; z < FAR; z += 16) {
          const head = project(x * 0.82, CAM_H - 9, z);
          const radius = Math.max(1, 0.9 * (focal / z) * 0.06);
          const g = bgCtx.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius * 7);
          g.addColorStop(0, 'rgba(255, 196, 120, 0.9)');
          g.addColorStop(0.25, 'rgba(255, 170, 90, 0.25)');
          g.addColorStop(1, 'rgba(255, 170, 90, 0)');
          bgCtx.fillStyle = g;
          bgCtx.beginPath();
          bgCtx.arc(head.x, head.y, radius * 7, 0, Math.PI * 2);
          bgCtx.fill();

          const pool = project(x * 0.7, CAM_H, z);
          const pr = Math.max(2, 3.5 * (focal / z) * 0.5);
          const pg = bgCtx.createRadialGradient(pool.x, pool.y, 0, pool.x, pool.y, pr * 3);
          pg.addColorStop(0, 'rgba(255, 170, 90, 0.07)');
          pg.addColorStop(1, 'rgba(255, 170, 90, 0)');
          bgCtx.fillStyle = pg;
          bgCtx.fillRect(pool.x - pr * 3, pool.y - pr * 3, pr * 6, pr * 6);
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      focal = Math.max(h, w * 0.6) * 0.95;
      horizon = h * 0.5;
      paintBackground();
      if (!cars.length) populate();
    };

    const drawStreak = (x: number, y: number, z1: number, z2: number, rgb: string, intensity: number) => {
      const zNear = Math.max(NEAR, Math.min(z1, z2));
      const zFar = Math.min(FAR, Math.max(z1, z2));
      if (zFar <= zNear) return;
      const a = project(x, y, zNear);
      const b = project(x, y, zFar);
      const width = Math.min(7, Math.max(0.6, 0.11 * (focal / zNear)));
      const fade = Math.min(1, (FAR - zNear) / 40) * intensity;

      ctx.strokeStyle = `rgba(${rgb}, ${0.16 * fade})`;
      ctx.lineWidth = width * 4.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(${rgb}, ${0.95 * fade})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    const render = (exposure: number) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(bg, 0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (const car of cars) {
        const outgoing = car.speed > 0;
        const trail = Math.abs(car.speed) * exposure;
        // The trail lies where the car has just been.
        const z2 = car.z - Math.sign(car.speed) * trail;
        const y = outgoing ? CAM_H - 0.75 : CAM_H - 0.65;
        const rgb = outgoing ? TAIL : HEAD;
        drawStreak(car.lane - 0.78, y, car.z, z2, rgb, 1);
        drawStreak(car.lane + 0.78, y, car.z, z2, rgb, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      for (let i = 0; i < cars.length; i++) {
        const car = cars[i];
        car.z += car.speed * dt;
        if (car.speed > 0 && car.z > FAR) cars[i] = spawn(true, NEAR);
        if (car.speed < 0 && car.z < NEAR - 6) cars[i] = spawn(false, FAR);
      }
      render(0.45);
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (raf || reduced || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    if (reduced) render(3.2);
    else start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) render(3.2);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
