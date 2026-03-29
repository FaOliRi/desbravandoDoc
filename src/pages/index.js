import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import { useEffect, useRef, useState } from 'react';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const bgCanvasRef = useRef(null);
  const mainCanvasRef = useRef(null);

  // Imagens que vão rodar dentro da tela do smartphone
  // Coloque os arquivos em: static/img/...
  const phoneScreens = [
    './img/docusaurus-social-card.jpg',
    './img/undraw_docusaurus_mountain.svg',
    './img/docusaurus-social-card.jpg',
  ];

  const [activeScreen, setActiveScreen] = useState(0);

  // Troca automática das imagens do smartphone
  useEffect(() => {
    if (phoneScreens.length === 0) return;
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % phoneScreens.length);
    }, 4000); // 4 segundos por tela
    return () => clearInterval(interval);
  }, [phoneScreens.length]);

  useEffect(() => {
    // ===== CONFIGURAÇÕES CUSTOMIZÁVEIS DOS HEXÁGONOS DE FUNDO =====
    const CONFIG = {
      numHexagons: 45,
      sizeMin: 5,
      sizeMax: 15,
      opacityMin: 0.08,
      opacityMax: 0.28,
      pulseSpeedMin: 0.001,
      pulseSpeedMax: 0.005,
      driftSpeedMin: 0.03,
      driftSpeedMax: 0.08,
      rotationSpeed: 0.0006,
      colors: ['#FF6200', '#FF7D00', '#FF9C00', '#FFCC00'],
      glowIntensity: 14,
      distribution: 'random', // 'random' | 'grid' | 'circle'
    };

    // ===== CANVAS DE FUNDO (hexágonos brilhantes contidos no hero) =====
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    const heroSection = bgCanvas.parentElement;

    function resizeBgCanvas() {
      bgCanvas.width = heroSection.clientWidth;
      bgCanvas.height = heroSection.clientHeight;
    }

    resizeBgCanvas();

    const glowHexagons = [];

    function initHexagons() {
      glowHexagons.length = 0;

      for (let i = 0; i < CONFIG.numHexagons; i++) {
        let x, y;

        if (CONFIG.distribution === 'grid') {
          const cols = Math.ceil(Math.sqrt(CONFIG.numHexagons));
          const row = Math.floor(i / cols);
          const col = i % cols;
          x = (col / cols) * bgCanvas.width;
          y = (row / cols) * bgCanvas.height;
        } else if (CONFIG.distribution === 'circle') {
          const angle = (i / CONFIG.numHexagons) * Math.PI * 2;
          const radius = Math.min(bgCanvas.width, bgCanvas.height) * 0.35;
          x = bgCanvas.width / 2 + Math.cos(angle) * radius;
          y = bgCanvas.height / 2 + Math.sin(angle) * radius;
        } else {
          x = Math.random() * bgCanvas.width;
          y = Math.random() * bgCanvas.height;
        }

        glowHexagons.push({
          x,
          y,
          size: CONFIG.sizeMin + Math.random() * (CONFIG.sizeMax - CONFIG.sizeMin),
          opacity: CONFIG.opacityMin + Math.random() * (CONFIG.opacityMax - CONFIG.opacityMin),
          pulseSpeed:
            CONFIG.pulseSpeedMin +
            Math.random() * (CONFIG.pulseSpeedMax - CONFIG.pulseSpeedMin),
          pulsePhase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI / 3,
          rotationSpeed: (Math.random() - 0.5) * CONFIG.rotationSpeed,
          driftX:
            (Math.random() - 0.5) *
            (CONFIG.driftSpeedMin +
              Math.random() * (CONFIG.driftSpeedMax - CONFIG.driftSpeedMin)),
          driftY:
            (Math.random() - 0.5) *
            (CONFIG.driftSpeedMin +
              Math.random() * (CONFIG.driftSpeedMax - CONFIG.driftSpeedMin)),
          color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
        });
      }
    }

    initHexagons();

    function drawHexagon(ctx, x, y, size, rotation) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (Math.PI / 3) * i;
        const hx = x + Math.cos(angle) * size;
        const hy = y + Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    }

    let bgAnimationId;
    function animateBackground() {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

      glowHexagons.forEach((hex) => {
        const pulse = Math.sin(Date.now() * hex.pulseSpeed + hex.pulsePhase);
        const currentOpacity = hex.opacity + pulse * 0.06;
        const currentSize = hex.size + pulse * 1.5;

        bgCtx.save();
        bgCtx.shadowBlur = CONFIG.glowIntensity;
        bgCtx.shadowColor = hex.color;
        drawHexagon(bgCtx, hex.x, hex.y, currentSize, hex.rotation);
        bgCtx.strokeStyle = hex.color;
        bgCtx.lineWidth = 1.4;
        bgCtx.globalAlpha = currentOpacity;
        bgCtx.stroke();

        bgCtx.fillStyle = hex.color;
        bgCtx.globalAlpha = currentOpacity * 0.18;
        bgCtx.fill();
        bgCtx.restore();

        hex.x += hex.driftX;
        hex.y += hex.driftY;
        hex.rotation += hex.rotationSpeed;

        if (hex.x < -50) hex.x = bgCanvas.width + 50;
        if (hex.x > bgCanvas.width + 50) hex.x = -50;
        if (hex.y < -50) hex.y = bgCanvas.height + 50;
        if (hex.y > bgCanvas.height + 50) hex.y = -50;
      });

      bgAnimationId = requestAnimationFrame(animateBackground);
    }

    animateBackground();

    // ===== CANVAS PRINCIPAL (hexágono fluido em volta do smartphone) =====
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;

    const ctx = mainCanvas.getContext('2d');

    function resizeMainCanvas() {
      const size = Math.min(520, window.innerWidth * 0.4, window.innerHeight * 0.56);
      mainCanvas.width = size;
      mainCanvas.height = size;
    }

    resizeMainCanvas();

    let time = 0;
    let mouseX = mainCanvas.width / 2;
    let mouseY = mainCanvas.height / 2;

    const numWaves = 9;
    const numPoints = 240;

    const colors = [
      { r: 255, g: 98, b: 0 },
      { r: 255, g: 125, b: 0 },
      { r: 255, g: 156, b: 0 },
      { r: 255, g: 204, b: 0 },
    ];

    function handleMouseMove(e) {
      const rect = mainCanvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    mainCanvas.addEventListener('mousemove', handleMouseMove);

    function interpolateColor(c1, c2, t) {
      return {
        r: c1.r + (c2.r - c1.r) * t,
        g: c1.g + (c2.g - c1.g) * t,
        b: c1.b + (c2.b - c1.b) * t,
      };
    }

    function getWaveColor(waveIndex, alpha = 0.7) {
      const colorIndex = (waveIndex / (numWaves - 1)) * (colors.length - 1);
      const baseIndex = Math.floor(colorIndex);
      const nextIndex = Math.min(baseIndex + 1, colors.length - 1);
      const factor = colorIndex - baseIndex;
      const c = interpolateColor(colors[baseIndex], colors[nextIndex], factor);
      return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(
        c.g,
      )}, ${alpha})`.replace(`${Math.round(c.g)}`, `${Math.round(c.g)}`); // small fix
    }

    // corrigir erro de digitação do getWaveColor
    function getWaveColorFixed(waveIndex, alpha = 0.7) {
      const colorIndex = (waveIndex / (numWaves - 1)) * (colors.length - 1);
      const baseIndex = Math.floor(colorIndex);
      const nextIndex = Math.min(baseIndex + 1, colors.length - 1);
      const factor = colorIndex - baseIndex;
      const c = interpolateColor(colors[baseIndex], colors[nextIndex], factor);
      return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(
        c.b,
      )}, ${alpha})`;
    }

    function hexRadius(angle, base, roundness = 0.15, strength = 0.35) {
      const k = 6;
      const a = angle % (Math.PI * 2);
      const sector = (Math.PI * 2) / k;
      const distToEdge = Math.cos((a % sector) - sector / 2);
      const edgeFactor = Math.pow(Math.max(distToEdge, 0), 1.5);
      const hexShape = 1 + strength * (edgeFactor - 1);
      return base * (1 - roundness + roundness * hexShape);
    }

    let mainAnimationId;
    function drawMain() {
      const size = Math.min(mainCanvas.width, mainCanvas.height);
      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = size * 0.32;

      ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 1.4);
      glow.addColorStop(0, 'rgba(255, 98, 0, 0.22)');
      glow.addColorStop(0.5, 'rgba(255, 125, 0, 0.08)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        const waveOffset = (w / numWaves) * Math.PI * 2;
        const phase = time * 0.9 + waveOffset;

        for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints;
          const angle = t * Math.PI * 2;
          const hexBase = hexRadius(angle, baseRadius, 0.25, 0.55);
          const wave1 = Math.sin(angle * 3 + phase * 0.7) * 18;
          const wave2 = Math.sin(angle * 6 - phase * 0.5) * 10;
          const wave3 = Math.cos(angle * 4 + phase * 0.3) * 6;

          const dx = mouseX - centerX;
          const dy = mouseY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) / size;
          const mouseInfluence = Math.sin(angle + Math.atan2(dy, dx)) * dist * 26;

          const radius = hexBase + wave1 + wave2 + wave3 + mouseInfluence;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.strokeStyle = getWaveColorFixed(w, 0.9);
        ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(255, 98, 0, 0.4)';
        ctx.shadowBlur = 14;
        ctx.stroke();

        if (w % 2 === 0) {
          ctx.fillStyle = getWaveColorFixed(w, 0.08);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      time += 0.015;
      mainAnimationId = requestAnimationFrame(drawMain);
    }

    drawMain();

    function handleResize() {
      resizeBgCanvas();
      resizeMainCanvas();
      initHexagons();
    }

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(bgAnimationId);
      cancelAnimationFrame(mainAnimationId);
      window.removeEventListener('resize', handleResize);
      mainCanvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <canvas ref={bgCanvasRef} className={styles.bgCanvas} />

      <div className={styles.heroContainer}>
        <div className={styles.heroCopy}>
          <div className={styles.heroKicker}>
            <div className={styles.heroKickerPill}>Core App</div>
            <div className={styles.heroKickerText}>
              Arquitetura compartilhada para o ecossistema ONe Itaú
            </div>
          </div>

          <Heading as="h1" className={styles.heroTitle}>
            Documentação técnica centralizada para{' '}
            <span className={styles.heroTitleGradient}>jornadas reutilizáveis</span> no ONe Itaú.
          </Heading>

          <p className={styles.heroSubtitle}>
            Um portal único para arquitetos, desenvolvedores e squads colaborarem em padrões,
            componentes e jornadas de ponta a ponta.
          </p>

          <p className={styles.heroObjective}>
            Nosso objetivo é prover uma arquitetura que permita o compartilhamento de jornadas
            para o ONe Itaú, com governança leve, alta reutilização e visibilidade ponta a ponta.
          </p>

          <div className={styles.heroCtas}>
            <Link className={clsx('button button--lg', styles.btnPrimary)} to="/docs/intro">
              <span className={styles.btnIcon}>▶</span>
              Explorar documentação
            </Link>
            <Link
              className={clsx('button button--lg', styles.btnSecondary)}
              to="/docs/jornadas"
            >
              Ver jornadas de desenvolvimento
            </Link>
          </div>

          <div className={styles.heroMeta}>
            <span>
              <strong>+40</strong> jornadas catalogadas
            </span>
            <span>
              <strong>+120</strong> componentes reutilizáveis
            </span>
            <span>
              <strong>Times ONe</strong> integrados ao Core App
            </span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <canvas ref={mainCanvasRef} className={styles.mainCanvas} />

          {/* Smartphone inclinado por cima do hexágono fluido */}
          <div className={styles.deviceWrapper}>
            <div className={styles.deviceShadow} />
            <div className={styles.device}>
              <div className={styles.deviceBezel}>
                <div className={styles.deviceNotch} />
                <div className={styles.deviceScreen}>
                  {phoneScreens.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Core App screen ${index + 1}`}
                      className={clsx(
                        styles.deviceScreenImage,
                        index === activeScreen && styles.deviceScreenImageActive,
                      )}
                    />
                  ))}

                  <div className={styles.deviceScreenOverlay} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Portal de Arquitetura e Jornadas ONe Itaú"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
