import React, {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

// Ícone de livro SVG inline
const BookIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.bookIcon}
  >
    <path
      d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const journeySteps = [
  {
    id: 'etapa-1',
    title: 'Fundamentos do SuperApp',
    summary:
      'Entenda a visão, arquitetura e princípios básicos para desenvolvimento dentro do SuperApp do Itaú.',
    docs: [
      {label: 'Visão geral do SuperApp', to: 'https://tess.im/pt-BR/dashboard/user/ai/chat/ai-chat/professional-dev-ai?_chat_id=14314785&tools=deep_analysis'},
      {label: 'Arquitetura de referência', to: '/docs/superapp/etapa-1/arquitetura'},
      {label: 'Guia de onboarding técnico', to: '/docs/superapp/etapa-1/onboarding'},
    ],
  },
  {
    id: 'etapa-2',
    title: 'Design & Experiência',
    summary:
      'Padrões de design, guidelines de UX/UI e como aplicar a identidade visual do SuperApp.',
    docs: [
      {label: 'Design system do SuperApp', to: '/docs/superapp/etapa-2/design-system'},
      {label: 'Componentes padrão', to: '/docs/superapp/etapa-2/componentes'},
      {label: 'Tokens e variáveis', to: '/docs/superapp/etapa-2/tokens'},
    ],
  },
  {
    id: 'etapa-3',
    title: 'Desenvolvimento de Funcionalidades',
    summary:
      'Boas práticas, padrões de código e integrações para construir novas features no SuperApp.',
    docs: [
      {label: 'Estrutura de módulos', to: '/docs/superapp/etapa-3/modulos'},
      {label: 'Integração com APIs internas', to: '/docs/superapp/etapa-3/apis'},
      {label: 'Exemplos de fluxos completos', to: '/docs/superapp/etapa-3/exemplos'},
      {label: 'Estado global e cache', to: '/docs/superapp/etapa-3/estado'},
    ],
  },
  {
    id: 'etapa-4',
    title: 'Qualidade, Segurança & Compliance',
    summary:
      'Requisitos de testes, observabilidade, segurança e conformidade para o ecossistema Itaú.',
    docs: [
      {label: 'Testes e qualidade', to: '/docs/superapp/etapa-4/testes'},
      {label: 'Segurança e LGPD', to: '/docs/superapp/etapa-4/seguranca'},
      {label: 'Monitoramento e logs', to: '/docs/superapp/etapa-4/monitoramento'},
    ],
  },
  {
    id: 'etapa-5',
    title: 'Deploy & Operação em Produção',
    summary:
      'Pipeline de CI/CD, estratégias de rollout e operação contínua das features no SuperApp.',
    docs: [
      {label: 'Pipeline de entrega', to: '/docs/superapp/etapa-5/cicd'},
      {label: 'Release e feature flags', to: '/docs/superapp/etapa-5/releases'},
      {label: 'Playbook de incidentes', to: '/docs/superapp/etapa-5/incidentes'},
    ],
  },
];

function HexagonStep({step, index, isActive, isCompleted, onClick}) {
  return (
    <button
      type="button"
      className={clsx(
        styles.hexStep,
        isActive && styles.hexStepActive,
        isCompleted && styles.hexStepCompleted,
      )}
      onClick={onClick}
      aria-label={`Etapa ${index + 1}: ${step.title}`}
    >
      <div className={styles.hexShape}>
        <svg viewBox="0 0 100 115" className={styles.hexSvg}>
          {/* FUNDO NO FORMATO DO HEXÁGONO */}
          <polygon
            points="50,0 100,28.75 100,86.25 50,115 0,86.25 0,28.75"
            className={styles.hexPolygonBackground}
          />
          {/* HEXÁGONO VISUAL (COM TRANSPARÊNCIA, ESTADOS ETC.) */}
          <polygon
            points="50,0 100,28.75 100,86.25 50,115 0,86.25 0,28.75"
            className={styles.hexPolygon}
          />
        </svg>
        <div className={styles.hexContent}>
          <span className={styles.hexNumber}>{index + 1}</span>
        </div>
      </div>
      <span className={styles.hexLabel}>{step.title}</span>
    </button>
  );
}



function StepRail({steps, activeIndex, onStepChange}) {
  return (
    <div className={styles.stepRail}>
      {steps.map((step, index) => (
        <HexagonStep
          key={step.id}
          step={step}
          index={index}
          isActive={index === activeIndex}
          isCompleted={index < activeIndex}
          onClick={() => onStepChange(index)}
        />
      ))}
    </div>
  );
}

export default function HomepageFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = journeySteps[activeIndex];

  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < journeySteps.length - 1;

  const handlePrevious = () => {
    setActiveIndex((current) => Math.max(current - 1, 0));
  };

  const handleNext = () => {
    setActiveIndex((current) => Math.min(current + 1, journeySteps.length - 1));
  };

  return (
    <section className={styles.journeySection} id="superapp-journey">
      <div className="container">
        <div className={styles.journeyHeader}>
          <Heading as="h2" className={styles.journeyTitle}>
            Jornada de Desenvolvimento no SuperApp Itaú
          </Heading>
          <p className={styles.journeySubtitle}>
            Navegue pelas etapas essenciais para construir, evoluir e operar
            funcionalidades dentro do SuperApp, com acesso direto às
            documentações de cada fase.
          </p>
        </div>

        <div className={styles.journeyBody}>
          <div className={styles.journeyCard}>
            {/* SEÇÃO DOS HEXÁGONOS COM COR DIFERENTE */}
            <div className={styles.journeyCardHexSection}>
              <StepRail
                steps={journeySteps}
                activeIndex={activeIndex}
                onStepChange={setActiveIndex}
              />
            </div>

            {/* SEÇÃO DAS DOCS */}
            <div className={styles.journeyCardDocsSection}>
              <div className={styles.stepPanelHeader}>
                <Heading as="h3" className={styles.stepPanelTitle}>
                  {activeStep.title}
                </Heading>
                <p className={styles.stepPanelSummary}>{activeStep.summary}</p>
              </div>

              <div className={styles.docsBlock}>
                <Heading as="h4" className={styles.docsBlockTitle}>
                  Documentações desta etapa
                </Heading>
                <ul className={styles.docsList}>
                  {activeStep.docs.map((doc) => (
                    <li key={doc.to} className={styles.docsListItem}>
                      <Link className={styles.docLink} to={doc.to}>
                        <BookIcon />
                        <span className={styles.docLinkText}>{doc.label}</span>
                        <span className={styles.docLinkArrow}>→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={clsx(
                  styles.stepActions,
                  !(hasPrevious && hasNext) && styles.stepActionsSingle,
                )}
              >
                {hasPrevious && (
                  <button
                    type="button"
                    className={clsx(
                      styles.navButton,
                      styles.navButtonSecondary,
                    )}
                    onClick={handlePrevious}
                  >
                    <span className={styles.navButtonIcon}>←</span>
                    Etapa anterior
                  </button>
                )}

                {hasNext && (
                  <button
                    type="button"
                    className={clsx(
                      styles.navButton,
                      styles.navButtonPrimary,
                    )}
                    onClick={handleNext}
                  >
                    Próxima etapa
                    <span className={styles.navButtonIcon}>→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
