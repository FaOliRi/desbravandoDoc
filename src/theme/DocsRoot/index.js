import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames, HtmlClassNameProvider} from '@docusaurus/theme-common';
import renderRoutes from '@docusaurus/renderRoutes';
import Layout from '@theme/Layout';

// IMPORTA APENAS O COMPONENTE DE JORNADA
import DevelopmentJourney from '@site/src/components/DevelopmentJourney';

export default function DocsRoot(props) {
  return (
    <HtmlClassNameProvider className={clsx(ThemeClassNames.wrapper.docsPages)}>
      <Layout>
        {/* Jornada aparece aqui, entre a navbar (do Layout) e o conteúdo de docs */}
        <DevelopmentJourney />

        {/* Conteúdo padrão de docs (sidebar + página) continua igual */}
        {renderRoutes(props.route.routes)}
      </Layout>
    </HtmlClassNameProvider>
  );
}
