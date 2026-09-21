import React, { useEffect, useRef } from 'react';
import { translations } from './scripts/translations';

//carga de scripts
import './scripts/variables';
import './scripts/audio';
import './scripts/obstacles';
import './scripts/player';
import './scripts/ads';
import './scripts/responsive';

//motor principal
import { startClassicEngine } from './scripts/script';

const INITIAL_LEVEL_KEY = 'initial';

// idiomas disponibles: para sumar uno nuevo solo hace falta agregarlo aquí
// (y su objeto de textos en translations.js)
const LANGUAGES = [
    { code: 'es' },
    { code: 'ca' },
    { code: 'en' },
];

export default function App() {
    // se usa un ref para el idioma
    const langRef = useRef('es');
    const lang = langRef.current;

    // el motor clásico de JS cuando la UI de react ya se montó
    useEffect(() => {
        // Pasa el control al script.js
        startClassicEngine();

        // sincronizamos el idioma inicial del script tradicional con react
        window.currentLanguage = lang;
        if (typeof window.updateTextsUI === 'function') window.updateTextsUI();
    }, []);

    // Cada vez que cambie el idioma se lo notifica al script sin pasar por setState, para no re-renderizar
    const handleLanguageChange = (event) => {
        const newLang = event.target.value;
        langRef.current = newLang;
        window.currentLanguage = newLang;
        if (typeof window.updateTextsUI === 'function') window.updateTextsUI();
        // el navegador deja el <select> con el estilo de "foco activo" hasta
        // que se hace click en otro lado, con blur() se suelta al instante
        event.target.blur();
    };

    const menuTitle = translations[lang][`${INITIAL_LEVEL_KEY}_title`];
    const menuText = translations[lang][`${INITIAL_LEVEL_KEY}_text`];
    const menuBtnText = translations[lang][`${INITIAL_LEVEL_KEY}_btn`];

    return (
        <>
            {/* ANUNCIOS - siempre montado en el DOM (oculto vía clase "hidden")*/}
            <div id="ad-menu" className="ad-overlay hidden">
                <div id="ad-countdown-badge">10s</div>
                <div id="ad-placeholder">
                    <p id="ad-placeholder-text">{translations[lang].ad_placeholder}</p>
                </div>
            </div>

            {/* MENÚ DE JUEGO */}
            <div id="game-menu" className="menu-overlay">
                <div className="menu-content">
                    <div className="menu-environment"></div>
                    <h1 id="menu-title">{menuTitle}</h1>
                    <p id="menu-text">{menuText}</p>
                    <button id="menu-button">{menuBtnText}</button>
                </div>
            </div>

            {/* MENÚ DE VICTORIA */}
            <div id="victory-menu" className="victory-overlay hidden">
                <div className="victory-content">
                    <div className="confetti-container"></div>
                    <h1>{translations[lang].victory_title}</h1>
                    <p>{translations[lang].victory_text}</p>
                    <button id="restart-button">{translations[lang].victory_btn}</button>
                </div>
            </div>

            {/* ESCENARIO DEL JUEGO */}
            <div className="container">
                <div className="sky"></div>
                <div className="cloud1"></div>
                <div className="cloud2"></div>
                <div className="cloud3"></div>

                {/* canvas animador que hace de paloma */}
                <canvas id="birdCanvas" className="pigeon" width="64" height="64"></canvas>

                <div id="storm-container" className="storm-layer"></div>
            </div>

            {/* MARCADOR DE PUNTOS */}
            <div id="score">{translations[lang].score}0</div>

            {/* CONTENEDOR DE VIDAS */}
            <div id="lives-container"></div>

            {/* PANEL DE VOLUMEN E IDIOMAS */}
            <div id="volume-container">
                <span id="volume-icon">
                    <i className="bi bi-volume-up-fill"></i>
                </span>
                <input type="range" id="volume-slider" min="0" max="100" defaultValue="50" />

                {/* selector de idioma */}
                <div className="language-selector">
                    <i className="bi bi-globe2"></i>
                    <select
                        className="lang-select"
                        defaultValue={lang}
                        onChange={handleLanguageChange}
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                                {translations[l.code].langLabel}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* FILTRO SVG PARA RAYOS */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="lightning-effect">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>
        </>
    );
}