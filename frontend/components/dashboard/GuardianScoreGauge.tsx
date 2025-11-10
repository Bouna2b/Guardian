'use client';
import { useEffect, useRef } from 'react';

interface GuardianScoreGaugeProps {
  score: number;
  size?: number;
}

export function GuardianScoreGauge({ score, size = 200 }: GuardianScoreGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Score arc
    const scoreAngle = 0.75 * Math.PI + (score / 100) * 1.5 * Math.PI;
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#06b6d4');
    gradient.addColorStop(1, '#0ea5e9');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, scoreAngle);
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Score text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score.toString(), centerX, centerY - 10);

    ctx.font = '14px system-ui';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('/ 100', centerX, centerY + 20);
  }, [score, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
}
