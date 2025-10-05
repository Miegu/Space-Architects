/*
=============================================================================
SPACE ARCHITECTS - CONFIGURATION MODULE
NASA Space Apps Challenge Project

This module handles:
- Mission parameter selection (type, crew, duration)
- Dynamic module dimension calculations
- Configuration page interactions
- Data persistence between pages
- Real-time preview updates
=============================================================================
*/

/**
 * Configuration module for managing mission parameters
 * This is a singleton pattern to ensure consistent state across the app
 */
const MissionConfig = (function() {
    'use strict';
    
    // Private variables - encapsulated within the module
    let currentConfig = {
        missionType: 'moon', // 'moon' or 'mars'
        crewSize: 4, // Number of astronauts (2-6)
        duration: 60, // Mission duration in days
        moduleType: 'rectangular' // Module shape (only rectangular for MVP)
    };
    
    // NASA standards and calculations
    const NASA_STANDARDS = {
        // Volume requirements per person based on mission duration
        volumePerPerson: {
            short: 20, // < 30 days
            medium: 25, // 30-90 days 
            long: 30, // 90+ days
            permanent: 40 // 180+ days
        },
        
        // Module efficiency factor (usable space vs total space)
        moduleEfficiency: 0.70, // 70% of space is habitable, 30% for systems
        
        // Standard module height for all habitats
        standardHeight: 2.5, // meters
        
        // Optimal length-to-width ratio for rectangular modules
        optimalRatio: 1.5, // length / width
        
        // Environmental factors by destination
        environmental: {
            moon: {
                gravity: 0.167, // 1/6 Earth gravity
                radiationShielding: 1.2, // 20% additional shielding needed
                thermalRequirement: 1.1 // 10% additional insulation
            },
            mars: {
                gravity: 0.378, // 3/8 Earth gravity 
                radiationShielding: 1.1, // 10% additional shielding
                thermalRequirement: 1.05 // 5% additional insulation
            }
        }
    };
    
    // Available mission options
    const MISSION_OPTIONS = {
        types: [
            { 
                value: 'moon', 
                label: 'Moon', 
                description: '1/6 Earth gravity, extreme temperature swings',
                icon: '🌙'
            },
            { 
                value: 'mars', 
                label: 'Mars', 
                description: '3/8 Earth gravity, dust storms, thin atmosphere',
                icon: '🔴'
            }
        ],
        
        crewSizes: [
            { value: 2, label: '2 astronauts', description: 'Minimal crew for basic operations' },
            { value: 3, label: '3 astronauts', description: 'Small science team' },
            { value: 4, label: '4 astronauts', description: 'Standard mission crew' },
            { value: 5, label: '5 astronauts', description: 'Extended operations team' },
            { value: 6, label: '6 astronauts', description: 'Large research expedition' }
        ],
        
        durations: [
            { value: 7, label: '7 days', category: 'short', description: 'Short stay mission' },
            { value: 30, label: '30 days', category: 'medium', description: 'Extended stay' },
            { value: 60, label: '60 days', category: 'medium', description: 'Long duration mission' },
            { value: 90, label: '90 days', category: 'long', description: 'Extended mission' },
            { value: 180, label: '180 days', category: 'permanent', description: 'Semi-permanent base' }
        ]
    };
    
    /**
     * Calculate optimal module dimensions based on crew size and mission parameters
     * Uses NASA standards and efficiency factors
     * 
     * @param {Object} config - Mission configuration object
     * @returns {Object} Module dimensions and specifications
     */
    function calculateModuleDimensions(config) {
        console.log('🔧 Calculating module dimensions for:', config);
        
        // Determine volume requirement per person based on duration
        let volumePerPerson;
        if (config.duration <= 30) {
            volumePerPerson = NASA_STANDARDS.volumePerPerson.short;
        } else if (config.duration <= 90) {
            volumePerPerson = NASA_STANDARDS.volumePerPerson.medium;
        } else if (config.duration <= 180) {
            volumePerPerson = NASA_STANDARDS.volumePerPerson.long;
        } else {
            volumePerPerson = NASA_STANDARDS.volumePerPerson.permanent;
        }
        
        // Apply environmental factors
        const envFactor = NASA_STANDARDS.environmental[config.missionType];
        const adjustedVolumePerPerson = volumePerPerson * envFactor.thermalRequirement;
        
        // Calculate total habitable volume needed
        const totalHabitableVolume = config.crewSize * adjustedVolumePerPerson;
        
        // Calculate total module volume accounting for efficiency
        const totalModuleVolume = totalHabitableVolume / NASA_STANDARDS.moduleEfficiency;
        
        // Calculate base area (using standard height)
        const baseArea = totalModuleVolume / NASA_STANDARDS.standardHeight;
        
        // Calculate optimal rectangular dimensions
        const width = Math.sqrt(baseArea / NASA_STANDARDS.optimalRatio);
        const length = width * NASA_STANDARDS.optimalRatio;
        
        // Round to practical construction dimensions (0.1m increments)
        const dimensions = {
            width: Math.ceil(width * 10) / 10,
            length: Math.ceil(length * 10) / 10, 
            height: NASA_STANDARDS.standardHeight,
            
            // Calculated volumes
            totalVolume: 0, // Will be recalculated with rounded dimensions
            habitableVolume: 0,
            volumePerPerson: 0,
            
            // Additional specifications
            baseArea: 0,
            efficiency: NASA_STANDARDS.moduleEfficiency,
            
            // Environmental considerations
            shieldingFactor: envFactor.radiationShielding,
            thermalFactor: envFactor.thermalRequirement
        };
        
        // Recalculate with rounded dimensions
        dimensions.totalVolume = dimensions.width * dimensions.length * dimensions.height;
        dimensions.habitableVolume = dimensions.totalVolume * dimensions.efficiency;
        dimensions.volumePerPerson = dimensions.habitableVolume / config.crewSize;
        dimensions.baseArea = dimensions.width * dimensions.length;
        
        console.log('📐 Calculated dimensions:', dimensions);
        
        return dimensions;
    }
    
    /**
     * Update the configuration and recalculate module dimensions
     * 
     * @param {Object} newConfig - New configuration values to merge
     */
    function updateConfiguration(newConfig) {
        console.log('⚙️ Updating mission configuration:', newConfig);
        
        // Merge new config with current config
        currentConfig = {
            ...currentConfig,
            ...newConfig
        };
        
        // Validate configuration values
        validateConfig();
        
        // Save to localStorage for persistence
        saveConfig();
        
        // Update displays
        updateModulePreview();
        
        // Trigger configuration update event
        document.dispatchEvent(new CustomEvent('configurationUpdated', {
            detail: {
                config: currentConfig,
                dimensions: calculateModuleDimensions(currentConfig)
            }
        }));
        
        console.log('✅ Configuration updated:', currentConfig);
    }
    
    /**
     * Validate configuration values against allowed options
     */
    function validateConfig() {
        // Validate mission type
        const validTypes = MISSION_OPTIONS.types.map(t => t.value);
        if (!validTypes.includes(currentConfig.missionType)) {
            console.warn('⚠️ Invalid mission type, resetting to moon');
            currentConfig.missionType = 'moon';
        }
        
        // Validate crew size
        const validSizes = MISSION_OPTIONS.crewSizes.map(s => s.value);
        if (!validSizes.includes(currentConfig.crewSize)) {
            console.warn('⚠️ Invalid crew size, resetting to 4');
            currentConfig.crewSize = 4;
        }
        
        // Validate duration
        const validDurations = MISSION_OPTIONS.durations.map(d => d.value);
        if (!validDurations.includes(currentConfig.duration)) {
            console.warn('⚠️ Invalid duration, resetting to 60');
            currentConfig.duration = 60;
        }
    }
    
    /**
     * Save current configuration to localStorage
     */
    function saveConfig() {
        try {
            localStorage.setItem('spaceArchitects_config', JSON.stringify(currentConfig));
            console.log('💾 Configuration saved to localStorage');
        } catch (error) {
            console.error('❌ Failed to save configuration:', error);
        }
    }
    
    /**
     * Load configuration from localStorage
     */
    function loadConfig() {
        try {
            const saved = localStorage.getItem('spaceArchitects_config');
            if (saved) {
                currentConfig = {
                    ...currentConfig,
                    ...JSON.parse(saved)
                };
                validateConfig();
                console.log('📂 Configuration loaded from localStorage:', currentConfig);
            }
        } catch (error) {
            console.error('❌ Failed to load configuration:', error);
            // Use default configuration on error
        }
    }
    
    /**
     * Initialize the configuration page interactions - FIXED VERSION
     */
    function initializeConfigPage() {
        console.log('🚀 Initializing configuration page...');
        
        // Use a more robust element finding approach with retries
        const maxRetries = 5;
        let retryCount = 0;
        
        function tryInitialize() {
            const elementsFound = findAndSetupElements();
            
            if (elementsFound) {
                console.log('✅ Configuration page initialized successfully');
                return;
            }
            
            retryCount++;
            if (retryCount < maxRetries) {
                console.log(`🔄 Retry ${retryCount}/${maxRetries} - Elements not found, retrying...`);
                setTimeout(tryInitialize, 200);
            } else {
                console.error('❌ Configuration page elements not found after multiple retries');
            }
        }
        
        tryInitialize();
    }
    
    /**
     * Find and setup configuration page elements - IMPROVED VERSION
     */
    function findAndSetupElements() {
        // Get DOM elements with better fallback handling
        const missionTypeSelect = document.getElementById('mission-type') || 
                                 document.querySelector('select[name="mission-type"]');
        const crewSizeSlider = document.getElementById('crew-size') ||
                              document.querySelector('input[type="range"]');
        const crewSizeDisplay = document.getElementById('crew-size-display') ||
                               document.querySelector('.crew-size-display');
        const durationRadios = document.querySelectorAll('input[name="duration"]');
        
        // Check if essential elements exist
        if (!missionTypeSelect || !crewSizeSlider) {
            return false; // Elements not found, will retry
        }
        
        console.log('🎯 Configuration elements found, setting up...');
        
        // Set initial values from current config
        if (missionTypeSelect) {
            missionTypeSelect.value = currentConfig.missionType;
        }
        
        if (crewSizeSlider) {
            crewSizeSlider.value = currentConfig.crewSize;
        }
        
        if (crewSizeDisplay) {
            crewSizeDisplay.textContent = currentConfig.crewSize;
        }
        
        // Set duration radio button
        const durationRadio = document.querySelector(`input[name="duration"][value="${currentConfig.duration}"]`);
        if (durationRadio) {
            durationRadio.checked = true;
        }
        
        // Update preview with initial values
        updateModulePreview();
        
        // Set up event listeners
        setupEventListeners(missionTypeSelect, crewSizeSlider, crewSizeDisplay, durationRadios);
        
        return true; // Success
    }
    
    /**
     * Setup event listeners for configuration elements
     */
    function setupEventListeners(missionTypeSelect, crewSizeSlider, crewSizeDisplay, durationRadios) {
        // Mission type change handler
        if (missionTypeSelect) {
            missionTypeSelect.addEventListener('change', function() {
                updateConfiguration({ missionType: this.value });
            });
        }
        
        // Crew size slider handler
        if (crewSizeSlider) {
            crewSizeSlider.addEventListener('input', function() {
                const size = parseInt(this.value);
                if (crewSizeDisplay) {
                    crewSizeDisplay.textContent = size;
                }
                updateConfiguration({ crewSize: size });
            });
        }
        
        // Duration radio button handlers
        durationRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    updateConfiguration({ duration: parseInt(this.value) });
                }
            });
        });
        
        // Setup navigation buttons
        setupNavigationButtons();
        
        console.log('🎛️ Event listeners configured');
    }
    
    /**
     * Setup navigation button handlers
     */
    function setupNavigationButtons() {
        // Generate habitat button
        const generateBtn = document.getElementById('generate-habitat-btn') ||
                           document.querySelector('.generate-btn');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', function() {
                console.log('🏗️ Going to structure selection...');
                
                // Save current config before navigation
                saveConfig();
                
                // Show loading state
                const originalText = this.textContent;
                this.disabled = true;
                this.textContent = 'Loading...';
                
                setTimeout(() => {
                    // Navigate to structure page
                    if (typeof SpaceArchitects !== 'undefined') {
                        SpaceArchitects.showPage('structure');
                    } else {
                        console.warn('SpaceArchitects not available, using fallback navigation');
                        // Fallback navigation
                        document.getElementById('config-page')?.classList.remove('active');
                        document.getElementById('structure-page')?.classList.add('active');
                    }
                    
                    // Reset button
                    this.disabled = false;
                    this.textContent = originalText;
                }, 500);
            });
        }
        
        // Back to welcome button
        const backBtn = document.getElementById('back-to-welcome') ||
                       document.querySelector('.back-btn');
        
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                if (typeof SpaceArchitects !== 'undefined') {
                    SpaceArchitects.showPage('welcome');
                } else {
                    // Fallback navigation
                    document.getElementById('config-page')?.classList.remove('active');
                    document.getElementById('welcome-page')?.classList.add('active');
                }
            });
        }
    }
    
    /**
     * Update the module preview section with current calculations
     */
    function updateModulePreview() {
        const dimensions = calculateModuleDimensions(currentConfig);
        
        // Update display elements with better error handling
        updateElementSafely('module-dimensions', `${dimensions.length}m × ${dimensions.width}m × ${dimensions.height}m`);
        updateElementSafely('module-volume', `${dimensions.totalVolume.toFixed(1)} m³`);
        updateElementSafely('habitable-volume', `${dimensions.habitableVolume.toFixed(1)} m³`);
        updateElementSafely('volume-per-person', `${dimensions.volumePerPerson.toFixed(1)} m³`);
        
        console.log('📊 Module preview updated');
    }
    
    /**
     * Safely update element text content
     */
    function updateElementSafely(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        } else {
            console.debug(`Element ${id} not found for update`);
        }
    }
    
    /**
     * Get mission type information
     * 
     * @param {string} type - Mission type ('moon' or 'mars')
     * @returns {Object} Mission type details
     */
    function getMissionTypeInfo(type) {
        return MISSION_OPTIONS.types.find(t => t.value === type) || MISSION_OPTIONS.types;
    }
    
    /**
     * Get crew size information
     * 
     * @param {number} size - Crew size
     * @returns {Object} Crew size details
     */
    function getCrewSizeInfo(size) {
        return MISSION_OPTIONS.crewSizes.find(s => s.value === size) || MISSION_OPTIONS.crewSizes; // Default to 4
    }
    
    /**
     * Get duration information
     * 
     * @param {number} duration - Duration in days
     * @returns {Object} Duration details
     */
    function getDurationInfo(duration) {
        return MISSION_OPTIONS.durations.find(d => d.value === duration) || MISSION_OPTIONS.durations; // Default to 60
    }
    
    // Public API - methods available to other modules
    return {
        // Configuration management
        updateConfig: updateConfiguration,
        getCurrentConfig: () => ({ ...currentConfig }), // Return copy to prevent mutation
        loadConfig: loadConfig,
        saveConfig: saveConfig,
        
        // Calculations
        calculateModuleDimensions: () => calculateModuleDimensions(currentConfig),
        
        // Page initialization
        initializeConfigPage: initializeConfigPage,
        
        // Data access
        getMissionOptions: () => ({ ...MISSION_OPTIONS }), // Return copy
        getNASAStandards: () => ({ ...NASA_STANDARDS }), // Return copy
        getMissionTypeInfo: getMissionTypeInfo,
        getCrewSizeInfo: getCrewSizeInfo, 
        getDurationInfo: getDurationInfo,
        
        // Utility methods
        validateConfig: validateConfig,
        updateModulePreview: updateModulePreview
    };
})();

// Export for use in other modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MissionConfig;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.MissionConfig = MissionConfig;
}

/*
=============================================================================
MODULE INITIALIZATION
Auto-initialize when DOM is ready
=============================================================================
*/

// Auto-initialize configuration when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Load saved configuration
    MissionConfig.loadConfig();
    
    // Initialize config page if we're on it
    if (document.getElementById('config-page')?.classList.contains('active')) {
        // Delay initialization to ensure all elements are rendered
        setTimeout(() => {
            MissionConfig.initializeConfigPage();
        }, 100);
    }
});

// Listen for page navigation to initialize config page
document.addEventListener('navigateToPage', function(event) {
    if (event.detail.page === 'config') {
        // Small delay to ensure page is shown
        setTimeout(() => {
            MissionConfig.initializeConfigPage();
        }, 200);
    }
});

// Listen for SpaceArchitects page changes
document.addEventListener('pageChanged', function(event) {
    if (event.detail.to === 'config') {
        setTimeout(() => {
            MissionConfig.initializeConfigPage();
        }, 200);
    }
});

console.log('📋 Configuration module loaded successfully');