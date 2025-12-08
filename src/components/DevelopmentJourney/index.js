import React, {useState, useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import {
  getJourneyForPath,
  getStageDocuments,
  getStageIdFromPath,
} from '@site/src/data/journeysConfig';
import styles from './styles.module.css';

const DevelopmentJourney = () => {
  const location = useLocation();
  const [activeJourney, setActiveJourney] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [currentDocuments, setCurrentDocuments] = useState([]);

  useEffect(() => {
    const {pathname} = location;

    const journey = getJourneyForPath(pathname);
    setActiveJourney(journey || null);

    if (!journey) {
      setSelectedStageId(null);
      setCurrentDocuments([]);
      return;
    }

    const stageId = getStageIdFromPath(journey, pathname);
    setSelectedStageId(stageId || null);

    if (stageId) {
      setCurrentDocuments(getStageDocuments(journey, stageId));
    } else {
      setCurrentDocuments([]);
    }
  }, [location.pathname]);

  const handleStageClick = (stageId) => {
    if (!activeJourney) return;
    setSelectedStageId(stageId);
    setCurrentDocuments(getStageDocuments(activeJourney, stageId));
  };

  // Se não houver jornada ativa para a rota atual, não renderiza nada
  if (!activeJourney) {
    return null;
  }

  return (
    <div className={styles.journeyContainer}>
      <div className={styles.journeyWrapper}>
        <div className={styles.journeyHeader}>
          <div className={styles.journeyTitleGroup}>
            <span className={styles.journeyLabel}>Jornada</span>
            <h2 className={styles.journeyTitle}>{activeJourney.name}</h2>
          </div>
        </div>

        <div className={styles.connectionLine} />

        <div className={styles.stagesContainer}>
          {activeJourney.stages.map((stage) => (
            <div key={stage.id} className={styles.stageWrapper}>
              <button
                type="button"
                className={[
                  styles.stageButton,
                  stage.completed ? styles.completed : '',
                  selectedStageId === stage.id ? styles.selected : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleStageClick(stage.id)}
                aria-label={`Etapa ${stage.name}`}
              >
                <div className={styles.stageIcon}>{stage.icon}</div>
              </button>
              <span className={styles.stageName}>{stage.name}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedStageId && currentDocuments.length > 0 && (
        <div className={styles.documentsSection}>
          <h3 className={styles.documentsTitle}>
            Documentos de{' '}
            {activeJourney.stages.find((stage) => stage.id === selectedStageId)?.name}
          </h3>
          <div className={styles.documentsGrid}>
            {currentDocuments.map((doc) => (
              <a key={doc.id} href={doc.path} className={styles.documentCard}>
                <svg
                  className={styles.docIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className={styles.docTitle}>{doc.title}</span>
                <svg
                  className={styles.arrowIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevelopmentJourney;
