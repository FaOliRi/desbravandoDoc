import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

// Importar ícones SVG
import ReactIcon from '@site/static/assets/react.svg';
import TypeScriptIcon from '@site/static/assets/typescript.svg';
import NextIcon from '@site/static/assets/nextjs.svg';
import NodeIcon from '@site/static/assets/nodejs.svg';
import HTMLIcon from '@site/static/assets/html5.svg';
import CSSIcon from '@site/static/assets/css.svg';
import JavaScriptIcon from '@site/static/assets/javascript.svg';
import NpmIcon from '@site/static/assets/npm.svg';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  
  const floatingIcons = [
    // ---------- LADO ESQUERDO ----------
    { Icon: ReactIcon,      top: '8%',  left: '10%', delay: '0s' },
    { Icon: TypeScriptIcon, top: '20%', left: '18%', delay: '.2s' },
    { Icon: NextIcon,       top: '32%', left: '10%', delay: '.4s' },
    { Icon: NodeIcon,       top: '44%', left: '18%', delay: '.6s' },

    // ---------- LADO DIREITO ----------
    { Icon: HTMLIcon,       top: '8%',  left: '82%', delay: '.1s' },
    { Icon: CSSIcon,        top: '20%', left: '90%', delay: '.3s' },
    { Icon: JavaScriptIcon, top: '32%', left: '82%', delay: '.5s' },
    { Icon: NpmIcon,        top: '44%', left: '90%', delay: '.7s' },
  ];

  return (
    <header className={styles.heroSection}>
      {/* Ícones flutuantes de fundo */}
      <div className={styles.backgroundIcons}>
        {floatingIcons.map((item, index) => (
          <div
            key={index}
            className={styles.floatingIcon}
            style={{ 
              top: item.top, 
              left: item.left,
              animationDelay: item.delay 
            }}
          >
            <item.Icon />
          </div>
        ))}
      </div>

      {/* Conteúdo central */}
      <div className={styles.heroContent}>
        <div className={styles.logoContainer}>
          <img 
            src="./img/logo.png" 
            alt={siteConfig.title}
            className={styles.logo}
          />
        </div>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>

      {/* Onda divisória SVG */}
      <div className={styles.waveContainer}>
        <svg
          className={styles.waveSvg}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
            <path fill="#111227" fill-opacity="10" d="M0,256L48,240C96,224,192,192,288,186.7C384,181,480,203,576,224C672,245,768,267,864,256C960,245,1056,203,1152,186.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>

        </svg>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
