document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Version identifier - check in console: window.navVersion
    window.navVersion = '2024-12-19-3125b78';
    if (console && console.log) {
        console.log('%cNew Nav Script Loaded', 'color: #016A1B; font-weight: bold; font-size: 12px;', 'Version:', window.navVersion);
    }

    // PostHog session recording helper
    // Note: Configure PostHog to start recording when any of these nav events are captured
    const triggerPostHogRecording = (eventName) => {
        try {
            if (typeof posthog !== 'undefined' && posthog && posthog.capture) {
                // Capture the specific event - PostHog will start recording based on your settings
                posthog.capture(eventName, {
                    viewport: window.innerWidth > 990 ? 'desktop' : 'mobile'
                });
            }
        } catch (error) {
            // Silently fail if PostHog is not available
            console.debug('PostHog not available:', error);
        }
    };

    const routes = {
        communities: {
            regina: "https://staging-www2.villagemedia.ca/regina-today",
            saskatoon: "https://staging-www2.villagemedia.ca/saskatoon-today",
            estevan: "https://staging-www2.villagemedia.ca/southeast/estevanmercury",
            yorkton: "https://staging-www2.villagemedia.ca/central/yorktonthisweek",
            kamsack: "https://staging-www2.villagemedia.ca/central/kamsacktimes",
            all: "https://staging-www2.villagemedia.ca/" 
        },
        categories: {
            sports: "https://staging-www2.villagemedia.ca/sports",
            agriculture: "https://staging-www2.villagemedia.ca/agriculture",
            obituaries: "https://staging-www2.villagemedia.ca/obituaries",
            politics: "https://staging-www2.villagemedia.ca/politics",
            weather: "https://staging-www2.villagemedia.ca/weather",
            crime: "https://staging-www2.villagemedia.ca/crime-cops-court"
        },
        categoryLinks: {
            sports: [
                { text: "All Sports", url: "https://staging-www2.villagemedia.ca/sports" },
                { text: "North Sask Sports", url: "https://staging-www2.villagemedia.ca/north/local-sports" },
                { text: "Central Sask Sports", url: "https://staging-www2.villagemedia.ca/central/local-sports" },
                { text: "Southwest Sask Sports", url: "https://staging-www2.villagemedia.ca/southwest/local-sports" }
            ],
            agriculture: [
                { text: "All Agriculture", url: "https://staging-www2.villagemedia.ca/agriculture" },
                { text: "North Sask Agriculture", url: "https://staging-www2.villagemedia.ca/north/agriculture" },
                { text: "Central Sask Agriculture", url: "https://staging-www2.villagemedia.ca/central/agriculture" }
            ],
            obituaries: [
                { text: "All Obituaries", url: "https://staging-www2.villagemedia.ca/obituaries" },
                { text: "Regina Obituaries", url: "https://staging-www2.villagemedia.ca/obituaries/regina-obituaries" },
                { text: "Saskatoon Obituaries", url: "https://staging-www2.villagemedia.ca/obituaries/saskatoon-obituaries" },
                { text: "Yorkton Obituaries", url: "https://staging-www2.villagemedia.ca/obituaries/yorkton-obituaries" },
                { text: "Assiniboia Obituaries", url: "https://staging-www2.villagemedia.ca/obituaries/assiniboia-obituaries" },
                { text: "Estevan Obituaries", url: "https://staging-www2.villagemedia.ca/obituaries/estevan-obituaries" }
            ],
            politics: [{ text: "All Politics", url: "https://staging-www2.villagemedia.ca/politics" }],
            weather: [{ text: "All Weather", url: "https://staging-www2.villagemedia.ca/weather" }],
            crime: [{ text: "All Crime & Safety", url: "https://staging-www2.villagemedia.ca/crime-cops-court" }],
            more: [
                { text: "Business & Energy", url: "https://staging-www2.villagemedia.ca/business" },
                { text: "Opinion", url: "https://staging-www2.villagemedia.ca/opinion" },
                { text: "Gas Prices", url: "https://staging-www2.villagemedia.ca/gas-prices" },
                { text: "Politics", url: "https://staging-www2.villagemedia.ca/politics" },
                { text: "Local Arts", url: "https://staging-www2.villagemedia.ca/local-arts" },
                { text: "Everybody Has a Story", url: "https://staging-www2.villagemedia.ca/everybody-has-a-story" },
                { text: "Videos", url: "https://staging-www2.villagemedia.ca/video" }
            ]
        },
        communityLinks: {
            communities: [
                { text: "All Communities", url: "https://staging-www2.villagemedia.ca/" },
                { text: "Regina", url: "https://staging-www2.villagemedia.ca/regina-today" },
                { text: "Saskatoon", url: "https://staging-www2.villagemedia.ca/saskatoon-today" },
                { text: "Estevan", url: "https://staging-www2.villagemedia.ca/southeast/estevanmercury" },
                { text: "Yorkton", url: "https://staging-www2.villagemedia.ca/central/yorktonthisweek" },
                { text: "Kamsack", url: "https://staging-www2.villagemedia.ca/central/kamsacktimes" }
            ]
        }
    };

    const extIcon = `<svg class="external-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 13V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H11M21 3L11 13M21 3H15M21 3V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const downArrow = `<svg class="desktop-down-arrow" style="width:15px; height:15px; flex-shrink:0;" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
    
    // Material Symbols icons (24x24 viewBox) - inline SVGs for best performance
    const iconLocation = `<svg class="category-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gradient-location" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:#e85a5a;stop-opacity:1" /><stop offset="50%" style="stop-color:#ef4444;stop-opacity:1" /><stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" /></radialGradient></defs><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="url(#gradient-location)"/></svg>`;
    const iconSports = `<svg class="category-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gradient-sports" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:#7a5f3f;stop-opacity:1" /><stop offset="50%" style="stop-color:#815337;stop-opacity:1" /><stop offset="100%" style="stop-color:#5c3a26;stop-opacity:1" /></radialGradient></defs><path d="M363-121q-47 5-113.5-2.5T148-148q-14-32-23.5-100T120-364l243 243Zm95-16L136-459q17-75 49.5-136.5T261-701q43-43 104.5-74.5T498-823l324 324q-16 74-47 136t-74 105q-45 44-107.5 75.5T458-137Zm-82-183 264-264-56-56-264 264 56 56Zm462-274L595-839q48-6 118 2t99 25q18 40 25 103.5t1 114.5Z" fill="url(#gradient-sports)"/></svg>`;
    const iconAgriculture = `<svg class="category-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gradient-agriculture" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:#d4a574;stop-opacity:1" /><stop offset="50%" style="stop-color:#b8860b;stop-opacity:1" /><stop offset="100%" style="stop-color:#8b6914;stop-opacity:1" /></radialGradient></defs><path d="m137-79-56-56 96-97q-32-32-53-61t-21-79q0-32 12-61t35-52l46-45 45 45q29 28 41 68t1 79l63-63q-32-33-53-62t-21-79q0-32 11.5-61t34.5-52l46-45 45 45q29 29 41 69.5t1 79.5l52-52q-30-33-53-62.5T427-698q0-32 13-62.5t36-53.5l99-99 56 56-56 57q23 28 32.5 65.5T606-662l218-218 56 57-220 220q36-11 74-2.5t67 31.5l56-57 58 58-100 101q-23 23-52.5 35T701-425q-42 0-77-23t-65-53l-55 55q40-13 82-1t72 41l45 46-45 45q-23 23-52.5 35T544-268q-42 0-76.5-23.5T402-344l-69 69q41-14 83.5-2t72.5 41l46 46-45 45q-23 23-52.5 35T376-98q-43 0-77.5-23.5T233-175l-96 96Z" fill="url(#gradient-agriculture)"/></svg>`;
    const iconObituaries = `<svg class="category-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gradient-obituaries" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:#e99fc4;stop-opacity:1" /><stop offset="50%" style="stop-color:#f472b6;stop-opacity:1" /><stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" /></radialGradient></defs><path d="M440-80q-100 0-170-70t-70-170v-80q71-1 134 29t106 81v-153q-86-14-143-80.5T240-680v-136q0-26 23-36.5t43 6.5l74 64 69-84q12-14 31-14t31 14l69 84 74-64q20-17 43-6.5t23 36.5v136q0 90-57 156.5T520-443v153q43-51 106-81t134-29v80q0 100-70 170T520-80h-80Z" fill="url(#gradient-obituaries)"/></svg>`;
    const iconPolitics = `<svg class="category-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gradient-politics" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:#7a85d6;stop-opacity:1" /><stop offset="50%" style="stop-color:#818cf8;stop-opacity:1" /><stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" /></radialGradient></defs><path d="M200-80q-33 0-56.5-23.5T120-160v-182l110-125 57 57-80 90h546l-78-88 57-57 108 123v182q0 33-23.5 56.5T760-80H200Zm224-304L285-525q-23-23-23-57t23-57l196-196q23-23 57-23t57 23l141 139q23 23 23.5 56.5T737-583L537-383q-23 23-56.5 22.5T424-384Zm256-256L538-780 340-582l142 140 198-198Z" fill="url(#gradient-politics)"/></svg>`;
    const iconWeather = `<svg class="category-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gradient-weather" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:#f5d88a;stop-opacity:1" /><stop offset="50%" style="stop-color:#fbd38d;stop-opacity:1" /><stop offset="100%" style="stop-color:#fbbf24;stop-opacity:1" /></radialGradient></defs><path d="M440-760v-160h80v160h-80Zm266 110-55-55 112-115 56 57-113 113Zm54 210v-80h160v80H760ZM440-40v-160h80v160h-80ZM254-652 140-763l57-56 113 113-56 54Zm508 512L651-255l54-54 114 110-57 59ZM40-440v-80h160v80H40Zm157 300-56-57 112-112 29 27 29 28-114 114Zm113-170q-70-70-70-170t70-170q70-70 170-70t170 70q70 70 70 170t-70 170q-70 70-170 70t-170-70Z" fill="url(#gradient-weather)"/></svg>`;
    const iconCrime = `<svg class="category-icon" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gradient-crime" cx="50%" cy="50%" r="50%"><stop offset="0%" style="stop-color:#3a66d9;stop-opacity:1" /><stop offset="50%" style="stop-color:#2563eb;stop-opacity:1" /><stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" /></radialGradient></defs><path d="m368-336 112-84 110 84-42-136 112-88H524l-44-136-44 136H300l110 88-42 136ZM480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z" fill="url(#gradient-crime)"/></svg>`;
    const iconMore = `<svg class="category-icon more-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="#9ca3af"/></svg>`;

    const navHTML = `
    <div id="village-nav-container">
        <style>
            :root { --primary: #000; --nav-bg: #ffffff; --pill-bg: #f1f3f5; --text-inactive: #000000; --dropdown-glass: rgba(255, 255, 255, 0.95); --separator-color: #e9ecef; }
            #village-nav-container { background: var(--nav-bg); padding: 12px 0 0 0; width: 100%; position: relative; box-sizing: border-box; z-index: 8; overflow: visible; }
            @media (min-width: 991px) {
                #nav.show-below-new-nav { display: block !important; position: relative; top: 0; margin-top: 0; z-index: 999; width: 100%; }
            }
            .nav-content-wrapper { width: 990px; margin: 0 auto; position: relative; padding: 0 10px; display: flex; flex-direction: column; align-items: flex-start; z-index: 10; }
            @media (min-width: 768px) and (max-width: 991px) { .nav-content-wrapper { width: 750px; } }
            @media (max-width: 767px) { .nav-content-wrapper { width: 100%; } }

            .top-row { display: flex !important; gap: 8px; align-items: center; width: 100%; position: relative; z-index: 11; margin-bottom: 8px; }
            .hide-scrollbar { overflow-x: auto; white-space: nowrap; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            
            .category-pill, #comm-container { 
                background: var(--pill-bg); border-radius: 20px; border: 2px solid transparent; 
                font-weight: 600; font-size: 13px; padding: 6px 14px; cursor: pointer; transition: all 0.2s ease; 
                display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; color: var(--text-inactive); position: relative;
            }
            .category-icon-wrapper { display: inline-flex; align-items: center; flex-shrink: 0; }
            .category-icon { width: 15px; height: 15px; display: block; }

            @media (min-width: 991px) {
                .top-row { gap: 0px; padding-left: 0; overflow: visible; margin-bottom: 0; }
                .category-pill, #comm-container { background: transparent !important; border: none !important; border-radius: 0; padding: 8px 12px; font-size: 14px; font-weight: 550; gap: 6px; transition: all 0.3s ease; cursor: default; }
                .category-pill span, #comm-container span { cursor: pointer; }
                .category-pill:hover, #comm-container:hover, .category-pill.hover-active, #comm-container.hover-active, .category-pill.active, #comm-container.active { font-weight: 700; }
                #village-nav-container:not(:has(.bottom-row.active)) .category-pill.active, 
                #village-nav-container:not(:has(.bottom-row.active)) #comm-container.active { padding-bottom: 10px; }
                .top-row::after { content: ""; position: absolute; bottom: -2px; left: 0; width: 100%; height: 1px; background-color: var(--separator-color); z-index: 1; opacity: 0; }
                #village-nav-container.mega-menu-open .top-row::after, #village-nav-container:has(.bottom-row.active) .top-row::after, #village-nav-container:has(.desktop-mega-menu.visible) .top-row::after { opacity: 1; }
                .category-pill::after, #comm-container::after { content: ""; position: absolute; bottom: -2px; left: 12px; width: var(--underline-width, auto); height: 2px; background-color: var(--primary); transform: scaleX(0); transform-origin: left; z-index: 2; transition: transform 0.3s ease; border-radius: 2px 2px 0 0; will-change: transform; }
                .category-pill:hover::after, #comm-container:hover::after, .category-pill.hover-active::after, #comm-container.hover-active::after { transform: scaleX(1); }
                .category-pill.active::after, #comm-container.active::after { transform: scaleX(1); background-color: var(--primary); z-index: 3; }
                .top-row:hover .category-pill.active:not(:hover):not(.hover-active)::after, .top-row:hover #comm-container.active:not(:hover):not(.hover-active)::after { transform: scaleX(0); }
                #village-nav-container.suppress-active-underline .category-pill.active::after, #village-nav-container.suppress-active-underline #comm-container.active::after { transform: scaleX(0); }
                .category-pill.hover-active.active::after, #comm-container.hover-active.active::after { transform: scaleX(1); background-color: var(--primary); z-index: 3; }
                .bottom-row { height: auto !important; }
                .bottom-row-inner { padding: 7px 0 7px 12px !important; }
                .text-link { font-size: 12px; }
                .desktop-down-arrow { display: block !important; width: 15px; height: 15px; }
                .external-icon { width: 10px !important; height: 10px !important; }
                #category-sports .bottom-row-inner a[href*="sportscage.com"], #category-agriculture .bottom-row-inner a[href*="saskagtoday.com"] { display: none; }
                #search-trigger { display: inline-flex !important; }
                #search-trigger .search-icon { display: inline-flex; align-items: center; width: 15px; height: 15px; }
                #search-trigger .search-icon svg { width: 100%; height: 100%; }
                #search-trigger:hover .search-icon { color: var(--primary); }
                .desktop-mega-menu.search-menu .desktop-mega-menu-inner { gap: 40px; }
                .desktop-mega-menu-search { flex: 0 0 auto; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; min-width: 300px; }
                .desktop-mega-menu-search h3 { font-size: 14px; font-weight: 500; margin: 0 0 8px 0; color: var(--text-inactive); }
                .desktop-mega-menu-search input { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit; }
                .desktop-mega-menu-search input:focus { outline: none; border-color: var(--primary); }
                .desktop-mega-menu-trending { flex: 0 0 auto; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; min-width: 300px; }
                .desktop-mega-menu-trending h3 { font-size: 11px; font-weight: 500; margin: 0 0 12px 0; color: #999; width: 100%; text-transform: uppercase; }
                .desktop-mega-menu-trending-items { display: flex; flex-direction: column; gap: 12px; width: 100%; }
                .desktop-mega-menu-trending-items a { color: var(--text-inactive); text-decoration: none; font-size: 13px; font-weight: 500; line-height: 1.4; padding: 4px 0; transition: color 0.2s, opacity 0.3s ease-in-out; display: flex; align-items: center; gap: 10px; opacity: 0; }
                .desktop-mega-menu-trending-items a.visible { opacity: 1; }
                .desktop-mega-menu-trending-items a:hover { color: var(--primary); font-weight: bold; }
                .trending-story-icon { width: 24px; height: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
                .trending-story-icon svg { width: 100%; height: 100%; }
                .trending-story-title { flex: 1; }
                .trending-skeleton { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
                .trending-skeleton-icon { width: 24px; height: 24px; flex-shrink: 0; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s ease-in-out infinite; border-radius: 4px; }
                .trending-skeleton-title { flex: 1; height: 16px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s ease-in-out infinite; border-radius: 4px; }
                .trending-skeleton-title.short { width: 60%; }
                .trending-skeleton-title.medium { width: 80%; }
                .trending-skeleton-title.long { width: 100%; }
                @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            }

            @media (max-width: 991px) {
                .top-row { padding-left: 10px; position: relative; }
                .category-pill.active, #comm-container.active { background: var(--primary) !important; color: white !important; }
                .category-pill.active .category-icon-wrapper .category-icon path,
                .category-pill.active .category-icon-wrapper svg.category-icon path,
                #comm-container.active .category-icon-wrapper .category-icon path,
                #comm-container.active .category-icon-wrapper svg.category-icon path { fill: white !important; }
                .category-pill.active .category-icon-wrapper .category-icon defs,
                #comm-container.active .category-icon-wrapper .category-icon defs { display: none !important; }
                .desktop-down-arrow { display: none !important; }
                .bottom-row-inner { padding-top: 0; position: relative; }
                .bottom-row { margin-top: 0 !important; }
                
                /* Fade effects for scrollable containers - using overlay divs (mobile and tablet) */
                .scroll-fade-overlay {
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    width: 20px;
                    pointer-events: none;
                    z-index: 8;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .scroll-fade-overlay.fade-left {
                    left: 0;
                    background: linear-gradient(to right, var(--nav-bg), transparent);
                }
                .scroll-fade-overlay.fade-right {
                    right: 0;
                    background: linear-gradient(to left, var(--nav-bg), transparent);
                }
                .scroll-fade-overlay.visible { opacity: 1; }
            }

            .desktop-mega-menu { position: relative; left: 0; right: 0; width: 100%; background: var(--nav-bg); max-height: 0; overflow: hidden; z-index: 8; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 3px; }
            .desktop-mega-menu.visible { max-height: 400px; }
            .desktop-mega-menu.search-menu { z-index: 8; }
            #village-nav-container:has(.desktop-mega-menu.search-menu.visible) .bottom-row.active { display: none !important; }
            .desktop-mega-menu-inner { display: flex; width: 990px; margin: 0 auto; padding: 30px 10px 30px 30px; gap: 80px; }
            @media (min-width: 768px) and (max-width: 991px) { .desktop-mega-menu-inner { width: 750px; } }
            .desktop-mega-menu-inner.communities-menu { gap: 80px; }
            .desktop-mega-menu-links { flex: 0 0 auto; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
            .desktop-mega-menu-links.communities-split { flex: 0 0 auto; }
            .desktop-mega-menu-links h3 { font-size: 11px; font-weight: 500; margin: 0 0 12px 0; color: #999; width: 100%; text-transform: uppercase; }
            .desktop-mega-menu-links-items { display: flex; flex-direction: column; gap: 12px; width: 100%; }
            .desktop-mega-menu-links-items.multi-column { display: grid; grid-template-columns: repeat(2, 1fr); column-gap: 60px; }
            .desktop-mega-menu-links-items.multi-column.communities-columns { column-gap: 60px; }
            .desktop-mega-menu-links a { color: var(--text-inactive); text-decoration: none; font-size: 12px; font-weight: 500; padding: 4px 0; transition: color 0.2s; text-align: left; position: relative; display: inline-block; }
            .desktop-mega-menu-links a:hover { color: var(--primary); font-weight: bold; }
            .desktop-mega-menu-links.communities-split a { display: flex; align-items: center; gap: 8px; }
            .desktop-mega-menu-links a .community-icon { width: 40px; height: 40px; border-radius: 4px; flex-shrink: 0; object-fit: cover; opacity: 0; transition: opacity 0.3s ease-in-out; background-color: #f1f3f5; }
            .desktop-mega-menu-links a .community-icon.loaded { opacity: 1; }
            .desktop-mega-menu-newsletters { flex: 0 0 auto; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
            .desktop-mega-menu-newsletters.communities-split { flex: 0 0 auto; }
            .desktop-mega-menu-newsletters h3 { font-size: 11px; font-weight: 500; margin: 0 0 12px 0; color: #999; width: 100%; text-transform: uppercase; }
            .desktop-mega-menu-newsletters-items { display: flex; flex-direction: column; gap: 12px; width: 100%; }
            .desktop-mega-menu-newsletters-items.multi-column { display: grid; grid-template-columns: repeat(2, 1fr); column-gap: 60px; }
            .desktop-mega-menu-newsletters-items.multi-column.communities-columns { column-gap: 60px; }
            .desktop-mega-menu-newsletters a { color: var(--text-inactive); text-decoration: none; font-size: 12px; font-weight: 500; padding: 4px 0; transition: color 0.2s; text-align: left; position: relative; display: inline-block; }
            .desktop-mega-menu-newsletters a:hover { color: var(--primary); font-weight: bold; }
            .desktop-mega-menu-newsletters p { font-size: 13px; color: #666; margin: 0; }
            .desktop-mega-menu-brand { flex: 0 0 auto; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; max-width: 200px; }
            .desktop-mega-menu-brand h3 { font-size: 11px; font-weight: 500; margin: 0 0 12px 0; color: #999; width: 100%; text-transform: uppercase; }
            .desktop-mega-menu-brand a { text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 12px; width: 100%; cursor: pointer; transition: opacity 0.2s; }
            .desktop-mega-menu-brand a:hover { opacity: 0.7; }
            .desktop-mega-menu-brand-content { display: flex; flex-direction: column; gap: 12px; width: 100%; }
            .desktop-mega-menu-brand-content .brand-logo { width: 100px; height: auto; margin-bottom: 8px; opacity: 0; transition: opacity 0.3s ease-in-out; }
            .desktop-mega-menu-brand-content .brand-logo.loaded { opacity: 1; }
            .desktop-mega-menu-brand-content p { font-size: 12px; color: var(--text-inactive); margin: 0; line-height: 1.5; }
            @media (max-width: 990px) { .desktop-mega-menu { display: none !important; } }
            
            .bottom-row { display: none; height: 44px; width: 100%; opacity: 0; position: relative; margin-top: 10px; }
            .bottom-row.active { display: flex; opacity: 1; }
            .bottom-row-inner { display: flex; align-items: center; gap: 20px; padding: 10px 0; padding-left: 10px; width: 100%; }
            .text-link { color: var(--text-inactive); text-decoration: none; font-size: 12px; font-weight: 400; border-bottom: 2px solid transparent; padding-bottom: 2px; }
            .text-link.active { color: var(--primary); font-weight: 700; border-bottom: none; }
            
            .external-icon { width: 14px !important; height: 14px !important; margin-left: 6px; flex-shrink: 0; display: inline-block; vertical-align: middle; }
            .dropdown-arrow-icon { width: 15px; height: 15px; fill: currentColor; display: none; }
            @media (max-width: 990px) { .dropdown-arrow-icon { display: block; } }
            #village-nav-dropdown-mobile { position: absolute; background: white; border: 1px solid #ddd; border-radius: 8px; z-index: 8; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 200px; }
        </style>
        <div class="nav-content-wrapper">
            <div id="village-nav-dropdown-mobile" style="display: none;">
                <div class="dropdown-option" style="padding: 12px 16px; cursor: pointer; font-size: 13px; font-weight: 600; border-bottom: 1px solid #eee;" data-community="all">All Communities</div>
                <div class="dropdown-option" style="padding: 12px 16px; cursor: pointer; font-size: 13px; font-weight: 600; border-bottom: 1px solid #eee;" data-community="regina">Regina</div>
                <div class="dropdown-option" style="padding: 12px 16px; cursor: pointer; font-size: 13px; font-weight: 600; border-bottom: 1px solid #eee;" data-community="saskatoon">Saskatoon</div>
                <div class="dropdown-option" style="padding: 12px 16px; cursor: pointer; font-size: 13px; font-weight: 600; border-bottom: 1px solid #eee;" data-community="estevan">Estevan</div>
                <div class="dropdown-option" style="padding: 12px 16px; cursor: pointer; font-size: 13px; font-weight: 600; border-bottom: 1px solid #eee;" data-community="yorkton">Yorkton</div>
                <div class="dropdown-option" style="padding: 12px 16px; cursor: pointer; font-size: 13px; font-weight: 600;" data-community="kamsack">Kamsack</div>
            </div>

            <div class="top-row hide-scrollbar" id="main-top-row">
                <div id="comm-container" data-category="communities">
                    <span class="category-icon-wrapper">${iconLocation}</span><span id="community-label">Communities</span>
                    <svg class="dropdown-arrow-icon" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
                <button class="category-pill" data-category="sports"><span class="category-icon-wrapper">${iconSports}</span><span>Sports</span></button>
                <button class="category-pill" data-category="agriculture"><span class="category-icon-wrapper">${iconAgriculture}</span><span>Agriculture</span></button>
                <button class="category-pill" data-category="obituaries"><span class="category-icon-wrapper">${iconObituaries}</span><span>Obituaries</span></button>
                <button class="category-pill" data-category="politics"><span class="category-icon-wrapper">${iconPolitics}</span><span>Politics</span></button>
                <button class="category-pill" data-category="weather"><span class="category-icon-wrapper">${iconWeather}</span><span>Weather</span></button>
                <button class="category-pill" data-category="crime"><span class="category-icon-wrapper">${iconCrime}</span><span>Crime & Safety</span></button>
                <button class="category-pill" id="mega-menu-trigger" data-category="more"><span class="category-icon-wrapper more-icon">${iconMore}</span><span>More</span></button>
                <button class="category-pill search-trigger" id="search-trigger" type="button" style="display: none;"><span class="search-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg></span></button>
            </div>
            
            <div class="bottom-row" id="community-regina"><div class="bottom-row-inner hide-scrollbar"><a href="https://staging-www2.villagemedia.ca/regina-today" class="text-link">All Regina</a><a href="https://staging-www2.villagemedia.ca/regina-today/regina-news" class="text-link">Regina News</a><a href="https://staging-www2.villagemedia.ca/obituaries/regina-obituaries" class="text-link">Regina Obituaries</a><a href="https://staging-www2.villagemedia.ca/regina-today/regina-newsletters" class="text-link">Regina Newsletters</a><a href="https://staging-www2.villagemedia.ca/regina-today/regina-discussion" class="text-link">Regina Discussions</a><a href="https://staging-www2.villagemedia.ca/classifieds/regina-classifieds" class="text-link">Regina Classifieds</a></div></div>
            <div class="bottom-row" id="community-saskatoon"><div class="bottom-row-inner hide-scrollbar"><a href="https://staging-www2.villagemedia.ca/saskatoon-today" class="text-link">All Saskatoon</a><a href="https://staging-www2.villagemedia.ca/saskatoon-today/saskatoon-news" class="text-link">Saskatoon News</a><a href="https://staging-www2.villagemedia.ca/obituaries/saskatoon-obituaries" class="text-link">Saskatoon Obituaries</a><a href="https://staging-www2.villagemedia.ca/saskatoon-today/saskatoon-newsletters" class="text-link">Saskatoon Newsletters</a><a href="https://staging-www2.villagemedia.ca/saskatoon-today/saskatoon-discussion" class="text-link">Saskatoon Discussions</a><a href="https://staging-www2.villagemedia.ca/classifieds/saskatoon-classifieds" class="text-link">Saskatoon Classifieds</a></div></div>
            <div class="bottom-row" id="category-sports"><div class="bottom-row-inner hide-scrollbar"><a href="https://www.sportscage.com" target="_blank" class="text-link">Go to SportsCage ${extIcon}</a><a href="https://staging-www2.villagemedia.ca/sports" class="text-link">All Sports</a><a href="https://staging-www2.villagemedia.ca/north/local-sports" class="text-link">North Sask Sports</a><a href="https://staging-www2.villagemedia.ca/central/local-sports" class="text-link">Central Sask Sports</a><a href="https://staging-www2.villagemedia.ca/southwest/local-sports" class="text-link">Southwest Sask Sports</a></div></div>
            <div class="bottom-row" id="category-agriculture"><div class="bottom-row-inner hide-scrollbar"><a href="https://www.saskagtoday.com" target="_blank" class="text-link">Go to SaskAgToday ${extIcon}</a><a href="https://staging-www2.villagemedia.ca/agriculture" class="text-link">All Agriculture</a><a href="https://staging-www2.villagemedia.ca/north/agriculture" class="text-link">North Sask Agriculture</a><a href="https://staging-www2.villagemedia.ca/central/agriculture" class="text-link">Central Sask Agriculture</a></div></div>
            <div class="bottom-row" id="category-obituaries"><div class="bottom-row-inner hide-scrollbar"><a href="https://staging-www2.villagemedia.ca/obituaries" class="text-link">All Obituaries</a><a href="https://staging-www2.villagemedia.ca/obituaries/regina-obituaries" class="text-link">Regina Obituaries</a><a href="https://staging-www2.villagemedia.ca/obituaries/saskatoon-obituaries" class="text-link">Saskatoon Obituaries</a><a href="https://staging-www2.villagemedia.ca/obituaries/yorkton-obituaries" class="text-link">Yorkton Obituaries</a><a href="https://staging-www2.villagemedia.ca/obituaries/assiniboia-obituaries" class="text-link">Assiniboia Obituaries</a><a href="https://staging-www2.villagemedia.ca/obituaries/estevan-obituaries" class="text-link">Estevan Obituaries</a></div></div>
            <div class="bottom-row" id="category-politics"><div class="bottom-row-inner hide-scrollbar"><a href="https://staging-www2.villagemedia.ca/politics" class="text-link">All Politics</a></div></div>
            <div class="bottom-row" id="category-weather"><div class="bottom-row-inner hide-scrollbar"><a href="https://staging-www2.villagemedia.ca/weather" class="text-link">All Weather</a></div></div>
            <div class="bottom-row" id="category-crime"><div class="bottom-row-inner hide-scrollbar"><a href="https://staging-www2.villagemedia.ca/crime-cops-court" class="text-link">All Crime & Safety</a></div></div>
        </div>
    </div>`;

    const targetHeader = document.querySelector('header');
    if (targetHeader) {
        targetHeader.insertAdjacentHTML('beforeend', navHTML);
        initNavLogic();
        initHoverDropdowns();
        handleScrollLogic();
        
        // Align bottom-row with active pill on mobile and tablet (after initial render)
        if (window.innerWidth <= 991) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    alignBottomRowWithActivePill();
                    // Initialize fade effects for scrollable containers
                    const topRow = document.getElementById('main-top-row');
                    if (topRow) {
                        updateScrollFades(topRow);
                        // Add scroll listener for top row if not already added
                        topRow.addEventListener('scroll', () => updateScrollFades(topRow), { passive: true });
                    }
                    document.querySelectorAll('.bottom-row-inner').forEach(row => {
                        updateScrollFades(row);
                    });
                });
            });
        }
        
        // Watch for active class changes on mobile and update icon colors (optimized)
        let resizeTimeout = null;
        const observer = new MutationObserver((mutations) => {
            // Only update if 'active' class was added or removed
            const hasActiveChange = mutations.some(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    const hadActive = mutation.oldValue?.includes('active');
                    const hasActive = target.classList.contains('active');
                    return hadActive !== hasActive;
                }
                return false;
            });
            
            if (hasActiveChange && window.innerWidth <= 991) {
                updateActiveIconColors();
                // Re-align bottom row when active pill changes
                requestAnimationFrame(() => {
                    alignBottomRowWithActivePill();
                    // Update fade effects after alignment
                    const activeBottomRow = document.querySelector('.bottom-row.active .bottom-row-inner');
                    if (activeBottomRow) {
                        updateScrollFades(activeBottomRow);
                    }
                });
            }
        });
        
        // Observe all category pills and comm container for class changes
        document.querySelectorAll('.category-pill, #comm-container').forEach(el => {
            observer.observe(el, { 
                attributes: true, 
                attributeFilter: ['class'],
                attributeOldValue: true // Needed to detect if active was added/removed
            });
        });
        
        // Debounced resize handler
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth <= 991) {
                    updateActiveIconColors();
                    alignBottomRowWithActivePill();
                    // Update fade effects on resize (mobile and tablet)
                    const topRow = document.getElementById('main-top-row');
                    if (topRow) updateScrollFades(topRow);
                    document.querySelectorAll('.bottom-row-inner').forEach(row => {
                        updateScrollFades(row);
                    });
                } else {
                    // Reset padding on desktop
                    document.querySelectorAll('.bottom-row-inner').forEach(row => {
                        row.style.paddingLeft = '';
                    });
                    // Clean up fade overlays on desktop
                    fadeOverlays.forEach((overlays, element) => {
                        if (overlays.left) overlays.left.remove();
                        if (overlays.right) overlays.right.remove();
                    });
                    fadeOverlays.clear();
                }
            }, 150);
        });
        
        // Set underline width to match content width on desktop
        if (window.innerWidth > 990) {
            let resizeTimeout = null;
            const setUnderlineWidth = () => {
                document.querySelectorAll('.category-pill, #comm-container').forEach(pill => {
                    // Get all child elements (spans, SVGs) that are the content
                    const contentElements = Array.from(pill.children);
                    if (contentElements.length === 0) return;
                    
                    // Create a temporary container to measure content width
                    const tempContainer = document.createElement('div');
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.visibility = 'hidden';
                    tempContainer.style.whiteSpace = 'nowrap';
                    tempContainer.style.display = 'inline-flex';
                    tempContainer.style.alignItems = 'center';
                    tempContainer.style.gap = '6px';
                    tempContainer.style.fontSize = '14px';
                    tempContainer.style.fontWeight = '550';
                    
                    // Clone all content elements, ensuring SVGs are properly cloned
                    contentElements.forEach(el => {
                        const clone = el.cloneNode(true);
                        // Ensure SVG elements maintain their dimensions
                        if (clone.querySelector && clone.querySelector('svg')) {
                            const svg = clone.querySelector('svg');
                            if (svg) {
                                svg.style.width = '18px';
                                svg.style.height = '18px';
                            }
                        }
                        tempContainer.appendChild(clone);
                    });
                    
                    document.body.appendChild(tempContainer);
                    // Force layout calculation
                    void tempContainer.offsetWidth;
                    const contentWidth = tempContainer.offsetWidth;
                    document.body.removeChild(tempContainer);
                    
                    // Set the width on the ::after pseudo-element via CSS variable
                    pill.style.setProperty('--underline-width', `${contentWidth}px`);
                });
            };
            
            // Set on load with a small delay to ensure SVGs are rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setUnderlineWidth();
                });
            });
            
            // Debounce resize events
            window.addEventListener('resize', () => {
                if (window.innerWidth > 990) {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        setUnderlineWidth();
                    }, 100);
                }
            });
        }
    }

    function handleScrollLogic() {
        const topRow = document.getElementById('main-top-row');
        if (window.innerWidth <= 990) { 
            topRow.scrollLeft = 0; 
        } else { 
            scrollActiveIntoView(topRow, '.category-pill.active, #comm-container.active'); 
        }

        const activeBottomInner = document.querySelector('.bottom-row.active .bottom-row-inner');
        const savedScroll = sessionStorage.getItem('nav_bottom_scroll');
        const lastCat = sessionStorage.getItem('nav_last_category');
        const url = window.location.href.split('?')[0].replace(/\/$/, "");
        
        let currentCat = 'home';
        for (let cat in routes.categories) { if (url.includes(cat)) currentCat = cat; }
        for (let comm in routes.communities) { if (url.includes(comm)) currentCat = comm; }

        if (activeBottomInner) {
            if (currentCat === lastCat && savedScroll) { 
                activeBottomInner.scrollLeft = parseInt(savedScroll); 
            } else { 
                scrollActiveIntoView(activeBottomInner, '.text-link.active'); 
            }
        }
        sessionStorage.setItem('nav_last_category', currentCat);
        const saveScroll = () => {
            const row = document.querySelector('.bottom-row.active .bottom-row-inner');
            if (row) sessionStorage.setItem('nav_bottom_scroll', row.scrollLeft);
        };
        document.querySelectorAll('.bottom-row-inner').forEach(r => {
            r.addEventListener('scroll', saveScroll);
            // Update fade effects on scroll (mobile and tablet)
            if (window.innerWidth <= 991) {
                r.addEventListener('scroll', () => updateScrollFades(r), { passive: true });
            }
        });
    }

    function scrollActiveIntoView(container, selector) {
        if (!container) return;
        const activeEl = container.querySelector(selector);
        if (activeEl) container.scrollLeft = activeEl.offsetLeft - (container.offsetWidth / 2) + (activeEl.offsetWidth / 2);
    }

    // Function to update fade effects based on scroll position
    // Uses fixed overlay divs that stay at viewport edges
    const fadeOverlays = new Map(); // Store overlays for each element
    
    function updateScrollFades(element) {
        // Only apply fade effects on mobile and tablet (up to 991px), not desktop
        if (!element || window.innerWidth > 991) {
            // Clean up overlays on desktop (above 991px)
            if (fadeOverlays.has(element)) {
                const overlays = fadeOverlays.get(element);
                if (overlays.left) overlays.left.remove();
                if (overlays.right) overlays.right.remove();
                fadeOverlays.delete(element);
            }
            return;
        }
        // Apply fade effects on mobile (up to 767px) and tablet (768px-991px)
        
        const scrollLeft = element.scrollLeft;
        const scrollWidth = element.scrollWidth;
        const clientWidth = element.clientWidth;
        const canScrollLeft = scrollLeft > 0;
        const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1; // -1 for rounding
        
        // Get or create overlay divs
        let overlays = fadeOverlays.get(element);
        if (!overlays) {
            const leftOverlay = document.createElement('div');
            leftOverlay.className = 'scroll-fade-overlay fade-left';
            const rightOverlay = document.createElement('div');
            rightOverlay.className = 'scroll-fade-overlay fade-right';
            document.body.appendChild(leftOverlay);
            document.body.appendChild(rightOverlay);
            overlays = { left: leftOverlay, right: rightOverlay };
            fadeOverlays.set(element, overlays);
        }
        
        // Update vertical position to match element's position
        const rect = element.getBoundingClientRect();
        overlays.left.style.top = `${rect.top}px`;
        overlays.left.style.height = `${rect.height}px`;
        overlays.right.style.top = `${rect.top}px`;
        overlays.right.style.height = `${rect.height}px`;
        
        // Show/hide based on scroll position
        overlays.left.classList.toggle('visible', canScrollLeft);
        overlays.right.classList.toggle('visible', canScrollRight);
    }

    // Function to align bottom-row-inner with active parent pill on mobile
    function alignBottomRowWithActivePill() {
        if (window.innerWidth > 990) return; // Only run on mobile
        
        const activePill = document.querySelector('.category-pill.active, #comm-container.active');
        const activeBottomRow = document.querySelector('.bottom-row.active .bottom-row-inner');
        
        if (activePill && activeBottomRow) {
            // Get the left position of the active pill relative to the nav container
            const navContainer = document.getElementById('village-nav-container');
            const pillRect = activePill.getBoundingClientRect();
            const containerRect = navContainer.getBoundingClientRect();
            const pillLeft = pillRect.left - containerRect.left;
            
            // Set the bottom-row-inner padding-left to match the pill's left position
            activeBottomRow.style.paddingLeft = `${pillLeft}px`;
        }
    }

    // Function to update icon colors for active pills on mobile (optimized)
    function updateActiveIconColors() {
        if (window.innerWidth > 990) return; // Only run on mobile
        
        // Cache gradient IDs to avoid repeated DOM queries
        const gradientCache = new Map();
        
        // Update active pills to white
        document.querySelectorAll('.category-pill.active .category-icon path, #comm-container.active .category-icon path').forEach(path => {
            const currentFill = path.getAttribute('fill');
            if (currentFill !== 'white') {
                path.setAttribute('fill', 'white');
            }
        });
        
        // Only restore gradients for pills that were just deactivated (check if fill is white but pill is not active)
        document.querySelectorAll('.category-pill:not(.active) .category-icon path, #comm-container:not(.active) .category-icon path').forEach(path => {
            const currentFill = path.getAttribute('fill');
            if (currentFill === 'white') {
                // Only restore if it's currently white (was active before)
                const svg = path.closest('svg');
                if (svg) {
                    let gradientId = gradientCache.get(svg);
                    if (!gradientId) {
                        const gradient = svg.querySelector('defs radialGradient');
                        gradientId = gradient?.getAttribute('id');
                        if (gradientId) gradientCache.set(svg, gradientId);
                    }
                    if (gradientId) {
                        path.setAttribute('fill', `url(#${gradientId})`);
                    }
                }
            }
        });
    }

    function initNavLogic() {
        const url = window.location.href.split('?')[0].replace(/\/$/, "");
        const topRow = document.getElementById('main-top-row'), commContainer = document.getElementById('comm-container');
        const container = document.getElementById('village-nav-container');
        let matched = false;

        // Parent Selection and Prepend for Mobile
        for (let cat in routes.categories) {
            if (url.includes(cat)) {
                const pill = document.querySelector(`[data-category="${cat}"]`);
                pill?.classList.add('active');
                if (window.innerWidth <= 990 && pill) topRow.prepend(pill);
                const bottomRow = document.getElementById(`category-${cat}`);
                bottomRow?.classList.add('active');
                if (bottomRow) container.classList.add('mega-menu-open');
                matched = true; break;
            }
        }
        if (!matched) {
            for (let commKey in routes.communities) {
                if (commKey !== 'all' && url.includes(commKey)) {
                    commContainer.classList.add('active');
                    if (window.innerWidth <= 990) topRow.prepend(commContainer);
                    document.getElementById('community-label').textContent = commKey.charAt(0).toUpperCase() + commKey.slice(1) + ', SK';
                    const bottomRow = document.getElementById(`community-${commKey}`);
                    bottomRow?.classList.add('active');
                    if (bottomRow) container.classList.add('mega-menu-open');
                    break;
                }
            }
        }
        
        // Update icon colors for active pills on mobile
        updateActiveIconColors();
        
        // Align bottom-row-inner with active parent pill on mobile
        alignBottomRowWithActivePill();
        
        // Update fade effects when active bottom row changes (mobile and tablet)
        if (window.innerWidth <= 991) {
            const activeBottomRow = document.querySelector('.bottom-row.active .bottom-row-inner');
            if (activeBottomRow) {
                requestAnimationFrame(() => {
                    updateScrollFades(activeBottomRow);
                });
            }
        }

        // Parent Click Handlers
        document.querySelectorAll('.category-pill:not(#mega-menu-trigger):not(#search-trigger)').forEach(pill => {
            pill.addEventListener('click', () => {
                // Trigger PostHog recording on parent item click
                triggerPostHogRecording('nav_parent_item_click');
                window.location.href = routes.categories[pill.dataset.category];
            });
        });

        // Community Mobile Dropdown logic
        commContainer.addEventListener('click', (e) => {
            if (window.innerWidth > 990) return;
            e.stopPropagation();
            const drop = document.getElementById('village-nav-dropdown-mobile');
            const rect = commContainer.getBoundingClientRect();
            const wrapperRect = document.querySelector('.nav-content-wrapper').getBoundingClientRect();
            drop.style.left = (rect.left - wrapperRect.left) + 'px';
            drop.style.top = (rect.bottom - wrapperRect.top + 4) + 'px';
            drop.style.display = (drop.style.display === 'block') ? 'none' : 'block';
        });

        document.querySelectorAll('.dropdown-option').forEach(opt => {
            opt.addEventListener('click', () => {
                // Trigger PostHog recording on mobile community selection
                if (window.innerWidth <= 990) {
                    triggerPostHogRecording('nav_parent_item_click');
                }
                window.location.href = routes.communities[opt.dataset.community];
            });
        });

        // Child Active States
        document.querySelectorAll('.bottom-row.active .text-link').forEach(link => {
            if (url === link.href.replace(/\/$/, "")) link.classList.add('active');
        });

        // Mobile and tablet horizontal scroll tracking for PostHog
        if (window.innerWidth <= 991) {
            let scrollTimeout = null;
            const handleScroll = (element) => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    triggerPostHogRecording('nav_horizontal_scroll');
                }, 150); // Debounce to avoid too many triggers
            };

            // Track scroll on parent row (top-row)
            const topRow = document.getElementById('main-top-row');
            if (topRow && topRow.classList.contains('hide-scrollbar')) {
                topRow.addEventListener('scroll', () => {
                    handleScroll(topRow);
                    updateScrollFades(topRow);
                }, { passive: true });
            }

            // Track scroll on child rows (bottom-row-inner)
            document.querySelectorAll('.bottom-row-inner.hide-scrollbar').forEach(childRow => {
                childRow.addEventListener('scroll', () => {
                    handleScroll(childRow);
                    updateScrollFades(childRow);
                }, { passive: true });
            });
            
            // Update overlay positions when page scrolls (so they stay aligned with elements)
            let pageScrollTimeout = null;
            window.addEventListener('scroll', () => {
                clearTimeout(pageScrollTimeout);
                pageScrollTimeout = setTimeout(() => {
                    fadeOverlays.forEach((overlays, element) => {
                        updateScrollFades(element);
                    });
                }, 10);
            }, { passive: true });
        }

        const megaMenuTrigger = document.getElementById('mega-menu-trigger'), siteBurgButton = document.querySelector('.navbt-burg');
        if (megaMenuTrigger) {
            megaMenuTrigger.addEventListener('click', (e) => {
                // Only handle click on mobile - desktop uses hover mega menu
                if (window.innerWidth <= 990) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Trigger PostHog recording on hamburger menu click (mobile)
                    triggerPostHogRecording('nav_hamburger_menu_click');
                    // Mobile: use existing burger button behavior
                    if (siteBurgButton) {
                        siteBurgButton.click();
                    }
                }
            });
        }

        // Track clicks on the site's standard hamburger menu button
        if (siteBurgButton) {
            siteBurgButton.addEventListener('click', () => {
                // Trigger PostHog recording when site hamburger menu is clicked
                triggerPostHogRecording('nav_hamburger_menu_click');
            });
        }
        
        // Search functionality
        try {
            const searchTrigger = document.getElementById('search-trigger');
            const container = document.getElementById('village-nav-container');
            let searchMegaMenu = container ? container.querySelector('.desktop-mega-menu.search-menu') : null;
            let searchHoverTimeout = null;
            let searchShowTimeout = null;
            let trendingStoriesCache = null;
            let trendingStoriesCacheTime = null;
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
            
            // Function to show search menu
            const showSearchMenu = () => {
                // Remove any existing regular mega menu first
                const regularMegaMenu = container.querySelector('.desktop-mega-menu:not(.search-menu)');
                if (regularMegaMenu) {
                    regularMegaMenu.classList.remove('visible');
                }
                
                // Check if searchMegaMenu exists in the DOM, if not, reset the variable
                if (searchMegaMenu && !container.contains(searchMegaMenu)) {
                    searchMegaMenu = null;
                }
                
                // Query for existing search menu in DOM, or create new one
                searchMegaMenu = container.querySelector('.desktop-mega-menu.search-menu');
                
                if (!searchMegaMenu) {
                    searchMegaMenu = document.createElement('div');
                    searchMegaMenu.className = 'desktop-mega-menu search-menu';
                    if (container) container.appendChild(searchMegaMenu);
                    
                    // Attach event listeners to keep menu open on hover
                    searchMegaMenu.addEventListener('mouseenter', () => {
                        clearTimeout(searchHoverTimeout);
                        // Keep hover-active class when entering search menu
                        searchTrigger.classList.add('hover-active');
                    });
                    
                    searchMegaMenu.addEventListener('mouseleave', () => {
                        searchHoverTimeout = setTimeout(() => {
                            hideSearchMenu();
                        }, 300);
                    });
                }
                
                // Close any other active mega menus
                document.querySelectorAll('.category-pill, #comm-container').forEach(p => {
                    p.classList.remove('hover-active');
                });
                
                // Add hover-active class to search trigger to show underline
                searchTrigger.classList.add('hover-active');
                
                // Build search menu
                const inner = document.createElement('div');
                inner.className = 'desktop-mega-menu-inner';
                
                // Left section - Search
                const searchSection = document.createElement('div');
                searchSection.className = 'desktop-mega-menu-search';
                searchSection.innerHTML = `
                    <h3>What do you want to find?</h3>
                    <input type="text" id="search-input" placeholder="Search..." autofocus>
                `;
                inner.appendChild(searchSection);
                
                // Right section - Trending Stories
                const trendingSection = document.createElement('div');
                trendingSection.className = 'desktop-mega-menu-trending';
                const trendingHeading = document.createElement('h3');
                trendingHeading.textContent = 'Trending Stories';
                trendingSection.appendChild(trendingHeading);
                
                const trendingItems = document.createElement('div');
                trendingItems.className = 'desktop-mega-menu-trending-items';
                
                // Create 5 skeleton loader items to pre-allocate space and prevent height jump
                const skeletonWidths = ['short', 'medium', 'long', 'medium', 'short'];
                for (let i = 0; i < 5; i++) {
                    const skeleton = document.createElement('div');
                    skeleton.className = 'trending-skeleton';
                    
                    const iconDiv = document.createElement('div');
                    iconDiv.className = 'trending-skeleton-icon';
                    skeleton.appendChild(iconDiv);
                    
                    const titleDiv = document.createElement('div');
                    titleDiv.className = `trending-skeleton-title ${skeletonWidths[i]}`;
                    skeleton.appendChild(titleDiv);
                    
                    trendingItems.appendChild(skeleton);
                }
                
                trendingSection.appendChild(trendingItems);
                inner.appendChild(trendingSection);
                
                searchMegaMenu.innerHTML = '';
                searchMegaMenu.classList.add('search-menu');
                searchMegaMenu.appendChild(inner);
                searchMegaMenu.classList.add('visible');
                if (container) container.classList.add('mega-menu-open');
                
                // Trigger PostHog recording when search mega menu appears (desktop)
                if (window.innerWidth > 990) {
                    triggerPostHogRecording('nav_mega_menu_appear');
                }
                
                // Ensure hover-active class is maintained on search trigger when menu is visible
                searchTrigger.classList.add('hover-active');
                
                // Hide any active bottom-row when search menu is open
                const activeBottomRow = document.querySelector('.bottom-row.active');
                if (activeBottomRow) {
                    activeBottomRow.style.display = 'none';
                }
                
                // Function to render trending stories
                const renderTrendingStories = (stories) => {
                    trendingItems.innerHTML = '';
                    if (stories && stories.length > 0) {
                        stories.forEach((story, index) => {
                            const a = document.createElement('a');
                            a.href = story.link;
                            a.className = 'trending-story-item';
                            
                            // Add trending icon
                            const iconDiv = document.createElement('div');
                            iconDiv.className = 'trending-story-icon';
                            iconDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#22c55e"><path d="m136-240-56-56 296-298 160 160 208-206H640v-80h240v240h-80v-104L536-320 376-480 136-240Z"/></svg>';
                            a.appendChild(iconDiv);
                            
                            const titleSpan = document.createElement('span');
                            titleSpan.textContent = story.title;
                            titleSpan.className = 'trending-story-title';
                            a.appendChild(titleSpan);
                            
                            trendingItems.appendChild(a);
                            
                            // Cascading fade-in effect - each item fades in with a delay
                            setTimeout(() => {
                                a.classList.add('visible');
                            }, index * 30); // Reduced from 50ms to 30ms for faster appearance
                        });
                    } else {
                        trendingItems.innerHTML = '<div style="color: #999; font-size: 12px;">No trending stories available</div>';
                    }
                };

                // Check cache first
                const now = Date.now();
                if (trendingStoriesCache && trendingStoriesCacheTime && (now - trendingStoriesCacheTime) < CACHE_DURATION) {
                    // Use cached data
                    renderTrendingStories(trendingStoriesCache);
                } else {
                    // Fetch trending stories
                    fetch('https://staging-www2.villagemedia.ca/rss/agriculture', { mode: 'cors' })
                        .then(response => {
                            if (!response.ok) throw new Error('Network response was not ok');
                            return response.text();
                        })
                        .then(str => {
                            const parser = new DOMParser();
                            const xml = parser.parseFromString(str, 'text/xml');
                            
                            // Check for parsing errors
                            const parseError = xml.querySelector('parsererror');
                            if (parseError) {
                                throw new Error('XML parsing error');
                            }
                            
                            const items = xml.querySelectorAll('item');
                            const trendingStories = [];
                            
                            for (let i = 0; i < Math.min(5, items.length); i++) {
                                const item = items[i];
                                const titleEl = item.querySelector('title');
                                const linkEl = item.querySelector('link');
                                const title = titleEl ? titleEl.textContent.trim() : '';
                                const link = linkEl ? linkEl.textContent.trim() : '';
                                if (title && link) {
                                    trendingStories.push({ title, link });
                                }
                            }
                            
                            // Cache the results
                            trendingStoriesCache = trendingStories;
                            trendingStoriesCacheTime = now;
                            
                            // Render the stories
                            renderTrendingStories(trendingStories);
                        })
                        .catch(error => {
                            console.error('Error fetching trending stories:', error);
                            trendingItems.innerHTML = '<div style="color: #999; font-size: 12px;">Unable to load trending stories</div>';
                        });
                }
                
                // Handle search input
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            const query = searchInput.value.trim();
                            if (query) {
                                window.location.href = `https://www.sasktoday.ca/search?q=${encodeURIComponent(query)}`;
                            }
                        }
                    });
                }
            };
            
            // Function to hide search menu
            const hideSearchMenu = () => {
                if (searchMegaMenu) {
                    searchMegaMenu.classList.remove('visible');
                    // Only remove mega-menu-open if no other mega menu is visible
                    const otherMegaMenu = container.querySelector('.desktop-mega-menu:not(.search-menu).visible');
                    if (!otherMegaMenu) {
                        container.classList.remove('mega-menu-open');
                    }
                    
                    // Remove hover-active class from search trigger
                    searchTrigger.classList.remove('hover-active');
                    
                    // Restore bottom-row visibility when search menu is closed
                    const activeBottomRow = document.querySelector('.bottom-row.active');
                    if (activeBottomRow) {
                        activeBottomRow.style.display = 'flex';
                    }
                }
            };
            
            if (searchTrigger && window.innerWidth > 990) {
                // Click handler
                searchTrigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    clearTimeout(searchHoverTimeout);
                    clearTimeout(searchShowTimeout);
                    showSearchMenu();
                });
                
                // Prefetch trending stories on hover (before menu opens)
                const prefetchTrendingStories = () => {
                    const now = Date.now();
                    // Only prefetch if cache is empty or expired
                    if (!trendingStoriesCache || !trendingStoriesCacheTime || (now - trendingStoriesCacheTime) >= CACHE_DURATION) {
                        fetch('https://staging-www2.villagemedia.ca/rss/agriculture', { mode: 'cors' })
                            .then(response => {
                                if (!response.ok) return;
                                return response.text();
                            })
                            .then(str => {
                                if (!str) return;
                                const parser = new DOMParser();
                                const xml = parser.parseFromString(str, 'text/xml');
                                const parseError = xml.querySelector('parsererror');
                                if (parseError) return;
                                
                                const items = xml.querySelectorAll('item');
                                const trendingStories = [];
                                
                                for (let i = 0; i < Math.min(5, items.length); i++) {
                                    const item = items[i];
                                    const titleEl = item.querySelector('title');
                                    const linkEl = item.querySelector('link');
                                    const title = titleEl ? titleEl.textContent.trim() : '';
                                    const link = linkEl ? linkEl.textContent.trim() : '';
                                    if (title && link) {
                                        trendingStories.push({ title, link });
                                    }
                                }
                                
                                // Cache the results
                                trendingStoriesCache = trendingStories;
                                trendingStoriesCacheTime = Date.now();
                            })
                            .catch(() => {
                                // Silently fail on prefetch
                            });
                    }
                };

                // Hover handlers
                searchTrigger.addEventListener('mouseenter', () => {
                    clearTimeout(searchHoverTimeout);
                    clearTimeout(searchShowTimeout);
                    // Prefetch on hover to reduce delay when menu opens
                    prefetchTrendingStories();
                    searchShowTimeout = setTimeout(() => {
                        showSearchMenu();
                    }, 250);
                });
                
                searchTrigger.addEventListener('mouseleave', () => {
                    clearTimeout(searchShowTimeout);
                    searchHoverTimeout = setTimeout(() => {
                        hideSearchMenu();
                    }, 300);
                });
            }
        } catch (error) {
            console.error('Error initializing search:', error);
        }
        
        document.addEventListener('click', () => { document.getElementById('village-nav-dropdown-mobile').style.display = 'none'; });
    }

    function initHoverDropdowns() {
        if (window.innerWidth <= 990) return;
        const pills = document.querySelectorAll('.category-pill:not(#search-trigger), #comm-container');
        const wrapper = document.querySelector('.nav-content-wrapper');
        const container = document.getElementById('village-nav-container');
        let hoverTimeout = null;
        let showTimeout = null; // Timeout for showing the mega menu
        let currentPill = null; // Track which pill is currently showing the mega menu
        let userHasInteracted = false;

        // Prevent mega menu from showing immediately on load until user moves mouse
        const enableInteractions = () => {
            userHasInteracted = true;
            document.removeEventListener('mousemove', enableInteractions);
        };
        document.addEventListener('mousemove', enableInteractions);

        // Create a single mega menu container - append to container for full width
        // First, remove any search menu element if it exists
        const existingSearchMenu = container.querySelector('.desktop-mega-menu.search-menu');
        if (existingSearchMenu) {
            existingSearchMenu.remove();
        }
        
        let megaMenu = container.querySelector('.desktop-mega-menu:not(.search-menu)');
        if (!megaMenu) {
            megaMenu = document.createElement('div');
            megaMenu.className = 'desktop-mega-menu';
            container.appendChild(megaMenu);
        }

        // Set up mega menu event listeners only once
        megaMenu.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            // Keep hover-active class when entering mega menu - only for the current pill
            // But don't add it if the current pill is the active one (it should stay hidden)
            if (currentPill && !currentPill.classList.contains('active')) {
                currentPill.classList.add('hover-active');
            }
        }); 
        megaMenu.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => { 
                megaMenu.classList.remove('visible');
                container.classList.remove('mega-menu-open');
                if (currentPill) {
                    // Only remove hover-active if the pill is not active
                    if (!currentPill.classList.contains('active')) {
                        currentPill.classList.remove('hover-active');
                    }
                    currentPill = null;
                    container.classList.remove('suppress-active-underline');
                }
                // Restore bottom-row visibility when mega menu is hidden
                const activeBottomRow = document.querySelector('.bottom-row.active');
                if (activeBottomRow) {
                    activeBottomRow.style.display = 'flex';
                }
            }, 150);
        });

        pills.forEach(pill => {
            const cat = pill.dataset.category;
            const isCommunities = (cat === 'communities' || pill.id === 'comm-container');
            const links = isCommunities ? routes.communityLinks.communities : routes.categoryLinks[cat];
            if (!links) return;

            pill.insertAdjacentHTML('beforeend', downArrow);

            const show = () => {
                if (!userHasInteracted) return;
                clearTimeout(hoverTimeout);
                clearTimeout(showTimeout); // Clear any pending show timeout
                
                // Close search menu if open (it's a separate element)
                const searchMenuToClose = container.querySelector('.desktop-mega-menu.search-menu');
                if (searchMenuToClose) {
                    searchMenuToClose.classList.remove('visible');
                    searchMenuToClose.remove();
                    // Don't remove mega-menu-open class here - it will be added back when showing this menu
                    // Restore bottom-row visibility when search menu is closed
                    const activeBottomRow = document.querySelector('.bottom-row.active');
                    if (activeBottomRow) {
                        activeBottomRow.style.display = 'flex';
                    }
                }
                
                // Set current pill
                currentPill = pill;
                
                // If the current pill is NOT active, suppress the active underline on other items
                if (!pill.classList.contains('active')) {
                    container.classList.add('suppress-active-underline');
                } else {
                    container.classList.remove('suppress-active-underline');
                }
                
                // Clear hover-active from all other pills
                document.querySelectorAll('.category-pill, #comm-container').forEach(p => {
                    if (p !== pill) p.classList.remove('hover-active');
                });
                
                // Add hover-active class to show underline
                pill.classList.add('hover-active');
                
                // Hide the bottom-row when mega menu is visible
                document.querySelectorAll('.bottom-row').forEach(row => {
                    row.style.display = 'none';
                });
                
                // Remove JavaScript positioning - not needed with relative positioning
                
                    // Build the mega menu content
                    const inner = document.createElement('div');
                    inner.className = 'desktop-mega-menu-inner' + (isCommunities ? ' communities-menu' : '');
                
                if (isCommunities) {
                    // Special handling for Communities
                    const commContainer = document.getElementById('comm-container');
                    const isActive = commContainer && commContainer.classList.contains('active');
                    
                    // Find active community
                    let activeCommunityName = null;
                    let childLinks = [];
                    
                    if (isActive) {
                        const activeBottomRow = document.querySelector('.bottom-row.active[id^="community-"]');
                        
                        if (activeBottomRow) {
                            const commId = activeBottomRow.id.replace('community-', '');
                            // Find community name from routes by matching the ID (e.g., "regina" -> "Regina")
                            // Skip "All Communities" - we want the actual community
                            const commLink = routes.communityLinks.communities.find(c => 
                                c.text.toLowerCase() === commId.toLowerCase() && c.text !== 'All Communities'
                            );
                            
                            if (commLink) {
                                activeCommunityName = commLink.text;
                                // Get child links from the active bottom row
                                const childLinkElements = activeBottomRow.querySelectorAll('.text-link');
                                childLinks = Array.from(childLinkElements).map(link => {
                                    // Get text content, removing any SVG icons
                                    let text = link.textContent.trim();
                                    // Remove the external icon text if present
                                    text = text.replace(extIcon, '').trim();
                                    const hasIcon = link.querySelector('.external-icon') !== null;
                                    return {
                                        text: text,
                                        url: link.href,
                                        external: hasIcon || link.target === '_blank'
                                    };
                                });
                            }
                        }
                    }
                    
                    // Left section - Communities list
                    const communitiesSection = document.createElement('div');
                    communitiesSection.className = 'desktop-mega-menu-links communities-split';
                    const communitiesHeading = document.createElement('h3');
                    communitiesHeading.textContent = isActive ? 'Change Your Community' : 'Pick a Community';
                    communitiesSection.appendChild(communitiesHeading);
                    
                    const communitiesItems = document.createElement('div');
                    communitiesItems.className = 'desktop-mega-menu-links-items' + (links.length > 5 ? ' multi-column communities-columns' : '');
                    
                    links.forEach(link => {
                        const a = document.createElement('a');
                        a.href = link.url;
                        const icon = document.createElement('img');
                        icon.className = 'community-icon';
                        // Map community names to city image placeholders
                        const cityMap = {
                            'All Communities': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=60&fit=crop&q=75',
                            'Regina': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=60&h=60&fit=crop&q=75',
                            'Saskatoon': 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=60&h=60&fit=crop&q=75',
                            'Estevan': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=60&fit=crop&q=75',
                            'Yorkton': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=60&h=60&fit=crop&q=75',
                            'Kamsack': 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=60&h=60&fit=crop&q=75'
                        };
                        icon.src = cityMap[link.text] || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=60&fit=crop&q=75';
                        icon.alt = link.text;
                        // Fade in image when loaded
                        icon.addEventListener('load', () => {
                            icon.classList.add('loaded');
                        });
                        // Handle case where image is already cached
                        if (icon.complete) {
                            icon.classList.add('loaded');
                        }
                        a.appendChild(icon);
                        if (link.external) {
                            a.target = '_blank';
                            const textSpan = document.createElement('span');
                            textSpan.textContent = link.text;
                            a.appendChild(textSpan);
                            const iconSvg = document.createElement('span');
                            iconSvg.innerHTML = extIcon;
                            a.appendChild(iconSvg);
                        } else {
                            const textNode = document.createTextNode(link.text);
                            a.appendChild(textNode);
                        }
                        communitiesItems.appendChild(a);
                    });
                    
                    communitiesSection.appendChild(communitiesItems);
                    inner.appendChild(communitiesSection);
                    
                    // Right section - Community sections (only if active)
                    if (isActive && activeCommunityName && childLinks.length > 0) {
                        const sectionsSection = document.createElement('div');
                        sectionsSection.className = 'desktop-mega-menu-newsletters communities-split';
                        const sectionsHeading = document.createElement('h3');
                        sectionsHeading.textContent = `${activeCommunityName} Sections`;
                        sectionsSection.appendChild(sectionsHeading);
                        
                        const sectionsItems = document.createElement('div');
                        sectionsItems.className = 'desktop-mega-menu-newsletters-items' + (childLinks.length > 5 ? ' multi-column communities-columns' : '');
                        
                        childLinks.forEach(link => {
                            const a = document.createElement('a');
                            a.href = link.url;
                            a.setAttribute('data-text', link.text);
                            if (link.external) {
                                a.target = '_blank';
                                a.innerHTML = `${link.text} ${extIcon}`;
                            } else {
                                a.textContent = link.text;
                            }
                            sectionsItems.appendChild(a);
                        });
                        
                        sectionsSection.appendChild(sectionsItems);
                        inner.appendChild(sectionsSection);
                    }
                } else {
                    // Regular categories - sections, optional brand section, and newsletter
                    // Left section - links
                    const linksSection = document.createElement('div');
                    linksSection.className = 'desktop-mega-menu-links';
                    const sectionsHeading = document.createElement('h3');
                    sectionsHeading.textContent = 'Sections';
                    linksSection.appendChild(sectionsHeading);
                    
                    const linksItems = document.createElement('div');
                    linksItems.className = 'desktop-mega-menu-links-items' + (links.length > 5 ? ' multi-column' : '');
                    
                    links.forEach(link => {
                        const a = document.createElement('a');
                        a.href = link.url;
                        a.setAttribute('data-text', link.text);
                        if (link.external) {
                            a.target = '_blank';
                            a.innerHTML = `${link.text} ${extIcon}`;
                        } else {
                            a.textContent = link.text;
                        }
                        linksItems.appendChild(a);
                    });
                    
                    linksSection.appendChild(linksItems);
                    inner.appendChild(linksSection);
                    
                    // Middle section - brand promotion (Sports and Agriculture only)
                    if (cat === 'sports' || cat === 'agriculture') {
                        const brandSection = document.createElement('div');
                        brandSection.className = 'desktop-mega-menu-brand';
                        
                        if (cat === 'sports') {
                            brandSection.innerHTML = `
                                <h3>SportsCage</h3>
                                <a href="https://sportscage.com" target="_blank" class="desktop-mega-menu-brand-link">
                                    <div class="desktop-mega-menu-brand-content">
                                        <img src="https://www.vmcdn.ca/files/sportscage/images/logos/HMI-SPORTS-CAGE-RIDERS-green.svg" alt="SportsCage" class="brand-logo">
                                        <p>Our most comprehensive Sask sports coverage is available on SportsCage. Visit SportsCage ${extIcon}</p>
                                    </div>
                                </a>
                            `;
                            // Fade in logo when loaded
                            const sportsLogo = brandSection.querySelector('.brand-logo');
                            if (sportsLogo) {
                                sportsLogo.addEventListener('load', () => {
                                    sportsLogo.classList.add('loaded');
                                });
                                // Handle case where image is already cached
                                if (sportsLogo.complete) {
                                    sportsLogo.classList.add('loaded');
                                }
                            }
                        } else if (cat === 'agriculture') {
                            brandSection.innerHTML = `
                                <h3>SaskAgToday</h3>
                                <a href="https://saskagtoday.com" target="_blank" class="desktop-mega-menu-brand-link">
                                    <div class="desktop-mega-menu-brand-content">
                                        <img src="https://www.vmcdn.ca/files/ui/harvard/saskagtoday.svg" alt="SaskAgToday" class="brand-logo">
                                        <p>Our most comprehensive ag news, crop pricing, weather forecasts and more are available on SaskAgToday. Visit SaskAgToday ${extIcon}</p>
                                    </div>
                                </a>
                            `;
                            // Fade in logo when loaded
                            const logo = brandSection.querySelector('.brand-logo');
                            if (logo) {
                                logo.addEventListener('load', () => {
                                    logo.classList.add('loaded');
                                });
                                // Handle case where image is already cached
                                if (logo.complete) {
                                    logo.classList.add('loaded');
                                }
                            }
                        }
                        
                        inner.appendChild(brandSection);
                    }
                    
                    // Right section - newsletters placeholder
                    const newslettersSection = document.createElement('div');
                    newslettersSection.className = 'desktop-mega-menu-newsletters';
                    newslettersSection.innerHTML = '<h3>Newsletters</h3><p>Newsletter placeholder for this category</p>';
                    
                    inner.appendChild(newslettersSection);
                }
                
                // Ensure search menu is closed and removed
                const searchMenuToRemove = container.querySelector('.desktop-mega-menu.search-menu');
                if (searchMenuToRemove) {
                    searchMenuToRemove.classList.remove('visible');
                    searchMenuToRemove.remove();
                }
                
                // Clear and populate
                megaMenu.innerHTML = '';
                megaMenu.classList.remove('search-menu'); // Ensure regular mega menu doesn't have search-menu class
                megaMenu.appendChild(inner);
                
                // Reserve space for bold text to prevent layout shift BEFORE making visible
                // Calculate min-widths - wait for images to load if needed
                const allLinks = inner.querySelectorAll('.desktop-mega-menu-links a, .desktop-mega-menu-newsletters a');
                const measureLinks = () => {
                    allLinks.forEach(link => {
                        const text = link.getAttribute('data-text') || link.textContent.trim();
                        if (text) {
                            // Check if this is a Communities link (has icon)
                            const hasIcon = link.querySelector('.community-icon') !== null;
                            
                            if (hasIcon) {
                                // For Communities links, calculate width = icon (40px) + gap (8px) + bold text width
                                // Measure the bold text width separately
                                const linkText = text;
                                const tempText = document.createElement('span');
                                tempText.style.position = 'absolute';
                                tempText.style.visibility = 'hidden';
                                tempText.style.fontSize = '12px';
                                tempText.style.fontWeight = 'bold';
                                tempText.style.whiteSpace = 'nowrap';
                                tempText.textContent = linkText;
                                document.body.appendChild(tempText);
                                void tempText.offsetWidth;
                                const boldTextWidth = tempText.offsetWidth;
                                document.body.removeChild(tempText);
                                
                                // Total width = icon + gap + text
                                const totalWidth = 40 + 8 + boldTextWidth;
                                
                                // Set both min-width and max-width to lock the size and prevent layout shift
                                link.style.minWidth = `${totalWidth}px`;
                                link.style.maxWidth = `${totalWidth}px`;
                            } else {
                                // For regular links, just measure the bold text width
                                const temp = document.createElement('span');
                                temp.style.position = 'absolute';
                                temp.style.visibility = 'hidden';
                                temp.style.fontSize = '12px';
                                temp.style.fontWeight = 'bold';
                                temp.style.whiteSpace = 'nowrap';
                                temp.textContent = text;
                                document.body.appendChild(temp);
                                // Force layout calculation
                                void temp.offsetWidth;
                                const boldWidth = temp.offsetWidth;
                                document.body.removeChild(temp);
                                // Set min-width to prevent layout shift
                                link.style.minWidth = `${boldWidth}px`;
                            }
                        }
                    });
                    
                    // Now make the menu visible after min-widths are set
                    megaMenu.classList.add('visible');
                    container.classList.add('mega-menu-open');
                };
                
                // Check if any Communities links have images that need to load
                const communityImages = inner.querySelectorAll('.community-icon');
                const imagesToLoad = Array.from(communityImages).filter(img => !img.complete);
                
                if (imagesToLoad.length > 0) {
                    // Wait for all images to load before measuring
                    let loadedCount = 0;
                    const checkAllLoaded = () => {
                        loadedCount++;
                        if (loadedCount === imagesToLoad.length) {
                            // All images loaded, now measure
                            requestAnimationFrame(() => {
                                measureLinks();
                            });
                        }
                    };
                    imagesToLoad.forEach(img => {
                        if (img.complete) {
                            checkAllLoaded();
                        } else {
                            img.addEventListener('load', checkAllLoaded, { once: true });
                            img.addEventListener('error', checkAllLoaded, { once: true }); // Also handle errors
                        }
                    });
                } else {
                    // No images to wait for, measure immediately
                    measureLinks();
                }
                
                // Trigger PostHog recording when mega menu appears (desktop)
                if (window.innerWidth > 990) {
                    triggerPostHogRecording('nav_mega_menu_appear');
                }
            };
            
            const hide = () => { 
                clearTimeout(showTimeout); // Clear any pending show timeout
                hoverTimeout = setTimeout(() => { 
                    megaMenu.classList.remove('visible');
                    container.classList.remove('mega-menu-open');
                    // Only remove hover-active if the pill is not active
                    if (!pill.classList.contains('active')) {
                        pill.classList.remove('hover-active');
                    }
                    if (currentPill === pill) {
                        currentPill = null;
                        container.classList.remove('suppress-active-underline');
                    }
                    // Restore bottom-row visibility when mega menu is hidden
                    const activeBottomRow = document.querySelector('.bottom-row.active');
                    if (activeBottomRow) {
                        activeBottomRow.style.display = 'flex';
                    }
                }, 300); // 300ms delay - longer than show delay to prevent flicker when moving between parents
            };

            pill.addEventListener('mouseenter', () => {
                // Clear any existing show timeout and hide timeout
                clearTimeout(showTimeout);
                clearTimeout(hoverTimeout); // Clear hide timeout from previous parent
                
                // If we're moving between parent items (mega menu already visible), use short delay
                // Otherwise, use longer delay to prevent accidental activation
                const isMovingBetweenItems = currentPill !== null && megaMenu.classList.contains('visible');
                const delay = isMovingBetweenItems ? 50 : 250;
                
                showTimeout = setTimeout(() => {
                    show();
                }, delay);
            });
            pill.addEventListener('mouseleave', () => {
                // Clear the show timeout if user moves away before delay completes
                clearTimeout(showTimeout);
                hide();
            });
        });
    }
});

