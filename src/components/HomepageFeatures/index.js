import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// --- Opção A: Importar SVGs como componentes React ---
import ReactIcon from '@site/static/assets/react.svg';
import TypeScriptIcon from '@site/static/assets/typescript.svg';
import NextIcon from '@site/static/assets/nextjs.svg';
import NodeIcon from '@site/static/assets/nodejs.svg';
import HTMLIcon from '@site/static/assets/html5.svg';
import CSSIcon from '@site/static/assets/css.svg';
import JavaScriptIcon from '@site/static/assets/javascript.svg';
import NpmIcon from '@site/static/assets/npm.svg';

/* ---- Dados das trilhas (cards) ---- */
const tracks = [
  {
    id: 'fundamentos',
    title: 'Fundamentos Web',
    subtitle:
      'Comece sua jornada com os conceitos essenciais de HTML, CSS e JavaScript.',
    techIcons: [
      { Icon: HTMLIcon, alt: 'HTML' },
      { Icon: CSSIcon,  alt: 'CSS' },
      { Icon: JavaScriptIcon, alt: 'JavaScript' },
    ],
    ctaLink: '/docs/fundamentos',

    /*  ⇣ agora é um array */
    creators: [
      {
        name: 'João Silva',
        role: 'Fundador & Desenvolvedor',
        avatar: require('@site/static/img/man.png').default,
      },
      {
        name: 'Maria Lima',
        role: 'Instrutora',
        avatar: require('@site/static/img/man.png').default,
      },
    ],
  },

  {
    id: 'desenvolvimento',
    title: 'Desenvolvimento Web',
    subtitle:
      'Explore frameworks modernos como React, Next.js, Node e TypeScript.',
    techIcons: [
      { Icon: ReactIcon,       alt: 'React' },
      { Icon: NextIcon,        alt: 'Next.js' },
      { Icon: TypeScriptIcon,  alt: 'TypeScript' },
      { Icon: NodeIcon,        alt: 'Node.js' },
      { Icon: NpmIcon,         alt: 'Npm' },
    ],
    ctaLink: '/docs/desenvolvimento',

    creators: [
      {
        name: 'Jeko Silva',
        role: 'Fundador & Desenvolvedor',
        avatar: require('@site/static/img/man.png').default,
      },
      {
        name: 'Paula Santos',
        role: 'Co-Instrutora',
        avatar: require('@site/static/img/man.png').default,
      },
    ],
  },
];


/* ---- Componente de um único card ---- */
function TrackCard({ track }) {
  return (
    <div className="col col--6">          {/* coluna mantém o espaçamento */}
      <article className={styles.card}    /* card só cuida do visual */
               aria-label={`Trilha ${track.title}`}>

        <header className={styles.cardHeader}>
          <h3 className={styles.title}>{track.title}</h3>
          <p  className={styles.subtitle}>{track.subtitle}</p>
        </header>

        <ul className={styles.techList} aria-label="Tecnologias da trilha">
          {track.techIcons.map(({ Icon, alt }) => (
            <li key={alt}>
              <Icon aria-label={alt} className={styles.techSvg} />
            </li>
          ))}
        </ul>

        <Link to={track.ctaLink} className={styles.btnCta}>
          Começar
        </Link>

        <div className={styles.creators}>
          {track.creators.map(({ avatar, name, role }) => (
            <div key={name} className={styles.creatorItem}>
              <img src={avatar}
                   alt={`Foto de ${name}`}
                   className={styles.creatorImg}/>
              <p className={styles.creatorName}>
                {name}<br/><span>{role}</span>
              </p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}



/* ---- Seção completa (export default) ---- */
export default function TracksSection() {
  return (
    <section className={styles.tracksSection} id="devshift-tracks">
      <div className="container">
        <div className="row">
          {tracks.map(track => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      </div>
    </section>
  );
}
