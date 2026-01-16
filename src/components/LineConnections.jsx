import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const techLabels = [
  'React', 'Node.js', 'TypeScript', 'Next.js', 'Express',
  'MongoDB', 'PostgreSQL', 'ESP32', 'Arduino', 'MQTT',
  'AWS', 'Docker', 'IoT', 'AutoCAD', 'Figma',
  'React Native', 'Python', 'GraphQL', 'Redis', 'Vercel',
  'STM32', 'C++', 'Embedded', 'PCB', 'SolidWorks'
];

export default function LineConnections({ 
  count = 50, 
  connectionDistance = 150,
  lineColor = 'rgba(59, 130, 246, 0.3)',
  dotColor = 'rgba(59, 130, 246, 0.5)',
  lineWidth = 1,
  speed = 0.5
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const labelsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    const initParticles = () => {
      particlesRef.current = [];
      labelsRef.current = [...techLabels].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          radius: Math.random() * 2 + 1,
          label: labelsRef.current[i % labelsRef.current.length],
          showLabel: i < 20 // Only first 20 particles show labels
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Move particles
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Keep in bounds
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();

        // Draw label for some particles
        if (p.showLabel) {
          ctx.font = '11px Inter, system-ui, sans-serif';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
          ctx.textAlign = 'center';
          ctx.fillText(p.label, p.x, p.y - 10);
        }

        // Connect to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = 1 - (dist / connectionDistance);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${opacity * 0.5})`);
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        }

        // Connect to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance * 1.5) {
            const opacity = 1 - (dist / (connectionDistance * 1.5));
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.6})`;
            ctx.lineWidth = lineWidth * 1.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count, connectionDistance, lineColor, dotColor, lineWidth, speed]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
}
