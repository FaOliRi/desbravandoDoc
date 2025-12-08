// Cada jornada tem um basePath (prefixo dentro de /docs)
// e várias etapas, cada uma com seus documentos.

export const journeys = [
  {
    id: 'basico',
    name: 'Tutorial Básico',
    // Usamos um prefixo comum que vale para /docs/tutorial-basics e /docs/tutorial-extras
    basePath: '/docs/tutorial-',
    stages: [
      {
        id: 'fundamentos',
        name: 'Fundamentos',
        icon: '1',
        completed: true,
        documents: [
          {
            id: 'intro',
            title: 'Introdução',
            path: '/docs/tutorial-basics/congratulations',
          },
          {
            id: 'setup',
            title: 'Setup do Projeto',
            path: '/docs/tutorial-basics/create-a-blog-post',
          },
        ],
      },
      {
        id: 'extras',
        name: 'Tutorial Extra',
        icon: '2',
        completed: false,
        documents: [
          {
            id: 'componentes',
            title: 'Componentes',
            path: '/docs/tutorial-extras/manage-docs-versions',
          },
          {
            id: 'estado',
            title: 'Estado e Props',
            path: '/docs/tutorial-extras/translate-your-site',
          },
        ],
      },
    ],
  },
];

// Utilidades

export const getJourneyForPath = (pathname) => {
  return journeys.find((journey) => pathname.startsWith(journey.basePath)) || null;
};

export const getStageById = (journey, stageId) => {
  if (!journey) return null;
  return journey.stages.find((stage) => stage.id === stageId) || null;
};

export const getStageDocuments = (journey, stageId) => {
  const stage = getStageById(journey, stageId);
  return stage ? stage.documents : [];
};

// Identificar automaticamente a etapa pela URL atual
export const getStageIdFromPath = (journey, pathname) => {
  if (!journey) return null;

  // Normaliza removendo eventual barra no final
  const normalizedPath = pathname.replace(/\/$/, '');

  for (const stage of journey.stages) {
    for (const doc of stage.documents) {
      const docPath = doc.path.replace(/\/$/, '');
      if (docPath === normalizedPath) {
        return stage.id;
      }
    }
  }

  // Fallback: se não encontrar, retorna a primeira etapa
  return journey.stages[0]?.id || null;
};
