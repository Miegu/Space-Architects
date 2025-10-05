/*
===============================================================================
SPACE ARCHITECTS - MAIN APPLICATION CONTROLLER
NASA Space Apps Challenge Project

This module provides the core application functionality:
- Page navigation system
- Global state management
- Module coordination
- Application initialization
===============================================================================
*/

/**
 * Main Space Architects application controller
 * Manages page navigation and global application state
 */
const SpaceArchitects = (function() {
    'use strict';
    
    // Application state
    let appState = {
        currentPage: 'welcome',
        initialized: false,
        modules: {
            missionConfig: null,
            structurePage: null,
            habitatEditor: null
        }
    };
    
    /**
     * Initialize the Space Architects application
     */
    function initialize() {
        console.log('🚀 Initializing Space Architects Application...');
        
        if (appState.initialized) {
            console.log('⚠️ Application already initialized');
            return;
        }
        
        // Set up global navigation
        setupGlobalNavigation();
        
        // Initialize page detection
        detectCurrentPage();
        
        // Set up module references
        setupModuleReferences();
        
        // Initialize background effects (stars, animations)
        initializeBackgroundEffects();
        
        // Mark as initialized
        appState.initialized = true;
        
        console.log('✅ Space Architects Application initialized');
        console.log('📍 Current page:', appState.currentPage);
    }
    
    /**
     * Navigate to a specific page
     * @param {string} pageId - The page identifier (welcome, config, structure, editor)
     */
    function showPage(pageId) {
        console.log(`🔄 Navigating from ${appState.currentPage} to ${pageId}`);
        
        // Validate page exists
        const targetPage = document.getElementById(pageId + '-page');
        if (!targetPage) {
            console.error(`❌ Page ${pageId} not found`);
            return false;
        }
        
        // Hide all pages
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
        
        // Show target page
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
        
        // Update current page state
        const previousPage = appState.currentPage;
        appState.currentPage = pageId;
        
        // Handle page-specific initialization
        handlePageTransition(previousPage, pageId);
        
        // Dispatch custom event for other modules
        document.dispatchEvent(new CustomEvent('pageChanged', {
            detail: {
                from: previousPage,
                to: pageId,
                timestamp: Date.now()
            }
        }));
        
        console.log(`✅ Successfully navigated to ${pageId}`);
        return true;
    }
    
    /**
     * Set up global navigation event handlers
     */
    function setupGlobalNavigation() {
        // Handle navigation events from any module
        document.addEventListener('navigateToPage', function(event) {
            const pageId = event.detail?.page;
            if (pageId) {
                showPage(pageId);
            }
        });
        
        // Handle configuration updates
        document.addEventListener('configurationUpdated', function(event) {
            console.log('📊 Configuration updated:', event.detail);
            // Store for use in other pages
            if (event.detail?.config) {
                appState.missionConfig = event.detail.config;
            }
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', function(event) {
            if (event.state && event.state.page) {
                showPage(event.state.page);
            }
        });
        
        console.log('🧭 Global navigation setup complete');
    }
    
    /**
     * Detect which page is currently active
     */
    function detectCurrentPage() {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const pageId = activePage.id.replace('-page', '');
            appState.currentPage = pageId;
            console.log(`📍 Detected current page: ${pageId}`);
        } else {
            // Default to welcome page
            showPage('welcome');
        }
    }
    
    /**
     * Handle page-specific initialization and cleanup
     */
    function handlePageTransition(fromPage, toPage) {
        // Page exit cleanup
        switch (fromPage) {
            case 'config':
                // Save configuration state
                if (typeof MissionConfig !== 'undefined') {
                    MissionConfig.saveConfig();
                }
                break;
            case 'structure':
                // Save structure selections
                if (typeof StructurePage !== 'undefined') {
                    StructurePage.saveStructureState();
                }
                break;
        }
        
        // Page entry initialization
        switch (toPage) {
            case 'welcome':
                initializeWelcomePage();
                break;
            case 'config':
                initializeConfigPage();
                break;
            case 'structure':
                initializeStructurePage();
                break;
            case 'editor':
                initializeEditorPage();
                break;
        }
        
        // Update browser history
        if (history.pushState) {
            history.pushState({ page: toPage }, '', `#${toPage}`);
        }
    }
    
    /**
     * Initialize welcome page
     */
    function initializeWelcomePage() {
        console.log('🏠 Initializing Welcome Page');
        
        // Start animations if not already running
        const starsLayer = document.querySelector('.stars-layer');
        if (starsLayer) {
            starsLayer.style.animationPlayState = 'running';
        }
        
        // Set up start button if not already done
        const startBtn = document.querySelector('.btn-primary-modern');
        if (startBtn && !startBtn.hasAttribute('data-initialized')) {
            startBtn.addEventListener('click', function() {
                showPage('config');
            });
            startBtn.setAttribute('data-initialized', 'true');
        }
    }
    
    /**
     * Initialize configuration page
     */
    function initializeConfigPage() {
        console.log('⚙️ Initializing Configuration Page');
        
        // Initialize configuration module if available
        if (typeof MissionConfig !== 'undefined') {
            // Small delay to ensure page is visible
            setTimeout(() => {
                MissionConfig.loadConfig();
                MissionConfig.initializeConfigPage();
            }, 100);
        }
    }
    
    /**
     * Initialize structure page
     */
    function initializeStructurePage() {
        console.log('🏗️ Initializing Structure Page');
        
        // Initialize structure page module if available
        if (typeof StructurePage !== 'undefined') {
            setTimeout(() => {
                StructurePage.loadStructureState();
                StructurePage.initialize();
            }, 100);
        }
    }
    
    /**
     * Initialize editor page
     */
    function initializeEditorPage() {
        console.log('🎨 Initializing Editor Page');
        
        // Initialize habitat editor if available
        if (typeof HabitatEditor !== 'undefined') {
            setTimeout(() => {
                HabitatEditor.initialize();
            }, 100);
        }
    }
    
    /**
     * Set up references to other modules
     */
    function setupModuleReferences() {
        // Store references to modules when they become available
        if (typeof MissionConfig !== 'undefined') {
            appState.modules.missionConfig = MissionConfig;
        }
        
        if (typeof StructurePage !== 'undefined') {
            appState.modules.structurePage = StructurePage;
        }
        
        if (typeof HabitatEditor !== 'undefined') {
            appState.modules.habitatEditor = HabitatEditor;
        }
        
        console.log('🔗 Module references established');
    }
    
    /**
     * Initialize background effects and animations
     */
    function initializeBackgroundEffects() {
        // Ensure background animations are running
        const backgroundElements = document.querySelectorAll('.stars-layer, .nebula-overlay, .grid-overlay');
        backgroundElements.forEach(element => {
            if (element.style.animationPlayState !== 'running') {
                element.style.animationPlayState = 'running';
            }
        });
        
        console.log('✨ Background effects initialized');
    }
    
    /**
     * Get current application state
     */
    function getAppState() {
        return {
            currentPage: appState.currentPage,
            initialized: appState.initialized,
            missionConfig: appState.missionConfig,
            timestamp: Date.now()
        };
    }
    
    /**
     * Handle application errors gracefully
     */
    function handleError(error, context = 'Unknown') {
        console.error(`❌ Space Architects Error [${context}]:`, error);
        
        // Show user-friendly error message
        const errorMessage = `An error occurred in ${context}. Please refresh the page or try again.`;
        
        // Simple alert for now - could be enhanced with custom modal
        if (confirm(errorMessage + '\n\nWould you like to return to the welcome page?')) {
            showPage('welcome');
        }
    }
    
    /**
     * Cleanup function for page unload
     */
    function cleanup() {
        console.log('🧹 Cleaning up Space Architects application');
        
        // Save all current states
        if (appState.modules.missionConfig?.saveConfig) {
            appState.modules.missionConfig.saveConfig();
        }
        
        if (appState.modules.structurePage?.saveStructureState) {
            appState.modules.structurePage.saveStructureState();
        }
    }
    
    // Set up cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    
    // Handle uncaught errors
    window.addEventListener('error', function(event) {
        handleError(event.error, 'Global');
    });
    
    // Public API
    return {
        // Core functions
        initialize: initialize,
        showPage: showPage,
        
        // State access
        getAppState: getAppState,
        getCurrentPage: () => appState.currentPage,
        
        // Utility functions
        handleError: handleError,
        cleanup: cleanup
    };
})();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    SpaceArchitects.initialize();
});

// Make available globally
if (typeof window !== 'undefined') {
    window.SpaceArchitects = SpaceArchitects;
}

console.log('🚀 Space Architects main module loaded successfully');

