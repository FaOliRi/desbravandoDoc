import React, { useRef, useCallback, useState, useEffect } from "react";
import clsx from "clsx";
import { useHistory } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { usePluginData } from '@docusaurus/useGlobalData';
import useIsBrowser from "@docusaurus/useIsBrowser";
import { HighlightSearchResults } from "./HighlightSearchResults";

const Search = props => {
  const initialized = useRef(false);
  const searchBarRef = useRef(null);
  const [indexReady, setIndexReady] = useState(false);
  const history = useHistory();
  const { siteConfig = {} } = useDocusaurusContext();
  const pluginConfig = (siteConfig.plugins || []).find(plugin => Array.isArray(plugin) && typeof plugin[0] === "string" && plugin[0].includes("docusaurus-lunr-search"))
  const isBrowser = useIsBrowser();
  const { baseUrl } = siteConfig;
  const assetUrl = pluginConfig && pluginConfig[1]?.assetUrl || baseUrl;
  
  const initAlgolia = (searchDocs, searchIndex, DocSearch, options) => {
    new DocSearch({
      searchDocs,
      searchIndex,
      baseUrl,
      inputSelector: "#search_input_react",
      // Override algolia's default selection event, allowing us to do client-side
      // navigation and avoiding a full page refresh.
      handleSelected: (_input, _event, suggestion) => {
        const url = suggestion.url || "/";
        // Use an anchor tag to parse the absolute url into a relative url
        // Alternatively, we can use new URL(suggestion.url) but its not supported in IE
        const a = document.createElement("a");
        a.href = url;
        _input.setVal(''); // clear value
        _event.target.blur(); // remove focus

        // Get the highlight word from the suggestion.
        let wordToHighlight = '';
        if (options.highlightResult) {
          try {
            const matchedLine = suggestion.text || suggestion.subcategory || suggestion.title;
            const matchedWordResult = matchedLine.match(new RegExp('<span.+span>\\w*', 'g'));
            if (matchedWordResult && matchedWordResult.length > 0) {
              const tempDoc = document.createElement('div');
              tempDoc.innerHTML = matchedWordResult[0];
              wordToHighlight = tempDoc.textContent;
            }
          } catch (e) {
            console.log(e);
          }
        }

        history.push(url, {
          highlightState: { wordToHighlight },
        });
      },
      maxHits: options.maxHits
    });
  };

  const pluginData = usePluginData('docusaurus-lunr-search');
  const getSearchDoc = () =>
    process.env.NODE_ENV === "production"
      ? fetch(`${assetUrl}${pluginData.fileNames.searchDoc}`).then((content) => content.json())
      : Promise.resolve({});

  const getLunrIndex = () =>
    process.env.NODE_ENV === "production"
      ? fetch(`${assetUrl}${pluginData.fileNames.lunrIndex}`).then((content) => content.json())
      : Promise.resolve([]);

  const loadAlgolia = () => {
    if (!initialized.current) {
      Promise.all([
        getSearchDoc(),
        getLunrIndex(),
        import("./DocSearch"),
        import("./algolia.css")
      ]).then(([searchDocFile, searchIndex, { default: DocSearch }]) => {
        const { searchDocs, options } = searchDocFile;
        if (!searchDocs || searchDocs.length === 0) {
          return;
        }
        initAlgolia(searchDocs, searchIndex, DocSearch, options);
        setIndexReady(true);
      });
      initialized.current = true;
    }
  };

  const toggleSearchIconClick = useCallback(
    e => {
      if (!searchBarRef.current.contains(e.target)) {
        searchBarRef.current.focus();
      }

      props.handleSearchBarToggle && props.handleSearchBarToggle(!props.isSearchBarExpanded);
    },
    [props.isSearchBarExpanded]
  );

  // >>> PLACEHOLDER CUSTOMIZADO
  let placeholder = 'Carregando busca...';
  
  if (isBrowser) {
    loadAlgolia();
    if (indexReady) {
      placeholder = 'Buscar na documentação...';
    }
  }
  // <<< FIM PLACEHOLDER

  // auto focus search bar on page load
  useEffect(() => {
    if (props.autoFocus && indexReady) {
      searchBarRef.current.focus();
    }
  }, [indexReady]);

  // >>> ESTILO INLINE COM BORDA DEGRADÊ ITAÚ
  const searchInputStyle = {
    background: 'white',
    border: '2px solid transparent',
    backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #ff6200, #ff7d00, #ff9c00, #ffcc00)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    borderRadius: '12px',
    padding: '0.5rem 1rem',
    minHeight: '40px',
    boxShadow: '0 2px 8px rgba(255, 98, 0, 0.1)',
    color: '#333',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    width: '30rem',
  };
  // <<< FIM ESTILO

  return (
    <div className="navbar__search" key="search-box">
      <span
        aria-label="expand searchbar"
        role="button"
        className={clsx("search-icon", {
          "search-icon-hidden": props.isSearchBarExpanded
        })}
        onClick={toggleSearchIconClick}
        onKeyDown={toggleSearchIconClick}
        tabIndex={0}
      />
      <input
        id="search_input_react"
        type="search"
        placeholder={placeholder}
        aria-label="Buscar"
        className={clsx(
          "navbar__search-input",
          "itau-search-input",
          { "search-bar-expanded": props.isSearchBarExpanded },
          { "search-bar": !props.isSearchBarExpanded }
        )}
        style={searchInputStyle}
        onClick={loadAlgolia}
        onMouseOver={loadAlgolia}
        onFocus={toggleSearchIconClick}
        onBlur={toggleSearchIconClick}
        ref={searchBarRef}
        disabled={!indexReady}
      />
      <HighlightSearchResults />
    </div>
  );
};

export default Search;
