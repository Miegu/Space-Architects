/*
===============================================================================
SPACE ARCHITECTS - MISSION CONFIGURATION MODULE
NASA Space Apps Challenge Project

This module handles:
- Mission parameter configuration (crew size, duration, destination)
- Module selection with Select -> Add More behavior
- Real-time statistics calculation
- NASA standards validation
- Navigation to structure page
===============================================================================
*/

const MissionConfig = (function() {
    'use strict';

    // Configuration state
    let configState = {
        crewSize: 4,
        missionDuration: 180, // days
        destination: 'mars',
        selectedModules: {
            dome: { selected: false, quantity: 0 },
            torus: { selected: false, quantity: 0 },
            cube: { selected: false, quantity: 0 },
            cylinder: { selected: false, quantity: 0 }
        }
    };

    // Module specifications for calculations
    const moduleSpecs = {
        dome: { 
            floorArea: 78.5,    // π × 5² for 10m diameter
            volume: 261.8,      // (4/3) × π × 5³ / 2 for hemisphere
            crewCapacity: 6,
            efficiency: 85
        },
        torus: { 
            floorArea: 157.1,   // π × (8² - 4²) for ring
            volume: 394.8,      // π² × 2² × 6 for torus
            crewCapacity: 8,
            efficiency: 70
        },
        cube: { 
            floorArea: 100,     // 10m × 10m
            volume: 250,        // 10m × 10m × 2.5m
            crewCapacity: 10,
            efficiency: 95
        },
        cylinder: { 
            floorArea: 70.7,    // π × 3² × 2.5 for cylindrical area
            volume: 176.7,      // π × 3² × 6.25
            crewCapacity: 5,
            efficiency: 80
        }
    };

    /**
     * Initialize the configuration page
     */
    function initializeConfigPage() {
        console.log('⚙️ Initializing Mission Configuration Page');

        setupCrewSizeSlider();
        setupModuleSelection();
        updateVolumeDisplay();

        console.log('✅ Configuration page initialized');
    }

    /**
     * Set up crew size slider functionality
     */
    function setupCrewSizeSlider() {
        const crewSlider = document.getElementById('crew-size');
        const crewDisplay = document.getElementById('crew-size-display');

        if (crewSlider && crewDisplay) {
            crewSlider.addEventListener('input', function() {
                configState.crewSize = parseInt(this.value);
                crewDisplay.textContent = configState.crewSize;
                updateVolumeDisplay();
                updateConfigurationSummary();
            });

            crewSlider.addEventListener('change', function() {
                configState.crewSize = parseInt(this.value);
                updateVolumeDisplay();
                updateConfigurationSummary();
            });

            console.log('✅ Crew size slider configured');
        }
    }

    /**
     * Set up module selection with Select -> Add More behavior
     */
    function setupModuleSelection() {
        // Handle select button clicks
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('select-btn')) {
                const moduleType = e.target.dataset.module;
                selectModule(moduleType, e.target);
            }

            // Handle quantity controls
            if (e.target.classList.contains('quantity-btn')) {
                const moduleType = e.target.dataset.module;
                const isPlus = e.target.classList.contains('plus');

                if (isPlus) {
                    increaseModuleQuantity(moduleType);
                } else {
                    decreaseModuleQuantity(moduleType);
                }
            }
        });

        console.log('✅ Module selection configured');
    }

    /**
     * Handle initial module selection
     */
    function selectModule(moduleType, button) {
        console.log(`🔘 Selecting module: ${moduleType}`);

        // Mark module as selected and set quantity to 1
        configState.selectedModules[moduleType].selected = true;
        configState.selectedModules[moduleType].quantity = 1;

        // Update the module card appearance
        const moduleCard = document.querySelector(`[data-module-type="${moduleType}"]`);
        moduleCard.classList.add('selected');

        // Replace select button with quantity controls
        const selectorDiv = button.parentElement;
        selectorDiv.innerHTML = `
            <div class="quantity-controls">
                <button type="button" class="quantity-btn minus" data-module="${moduleType}">−</button>
                <span class="quantity-display" id="qty-${moduleType}">1</span>
                <button type="button" class="quantity-btn plus" data-module="${moduleType}">+</button>
                <div class="quantity-label">modules</div>
            </div>
        `;

        updateConfigurationSummary();
        showConfigurationSummary();
    }

    /**
     * Increase module quantity
     */
    function increaseModuleQuantity(moduleType) {
        if (configState.selectedModules[moduleType].quantity < 5) {
            configState.selectedModules[moduleType].quantity += 1;
            updateQuantityDisplay(moduleType);
            updateConfigurationSummary();

            console.log(`➕ ${moduleType}: ${configState.selectedModules[moduleType].quantity}`);
        }
    }

    /**
     * Decrease module quantity
     */
    function decreaseModuleQuantity(moduleType) {
        const currentQty = configState.selectedModules[moduleType].quantity;

        if (currentQty > 1) {
            configState.selectedModules[moduleType].quantity -= 1;
            updateQuantityDisplay(moduleType);
            updateConfigurationSummary();

            console.log(`➖ ${moduleType}: ${configState.selectedModules[moduleType].quantity}`);
        } else if (currentQty === 1) {
            // Remove module completely - return to select button
            deselectModule(moduleType);
        }
    }

    /**
     * Deselect a module and return to select button
     */
    function deselectModule(moduleType) {
        console.log(`❌ Deselecting module: ${moduleType}`);

        // Reset module state
        configState.selectedModules[moduleType].selected = false;
        configState.selectedModules[moduleType].quantity = 0;

        // Update module card appearance
        const moduleCard = document.querySelector(`[data-module-type="${moduleType}"]`);
        moduleCard.classList.remove('selected');

        // Restore select button
        const selectorDiv = moduleCard.querySelector('.module-selector');
        selectorDiv.innerHTML = `
            <button type="button" class="select-btn" data-module="${moduleType}">Select</button>
        `;

        updateConfigurationSummary();

        // Hide summary if no modules selected
        const hasSelectedModules = Object.values(configState.selectedModules)
            .some(module => module.selected);

        if (!hasSelectedModules) {
            hideConfigurationSummary();
        }
    }

    /**
     * Update quantity display
     */
    function updateQuantityDisplay(moduleType) {
        const display = document.getElementById(`qty-${moduleType}`);
        if (display) {
            display.textContent = configState.selectedModules[moduleType].quantity;
        }
    }

    /**
     * Update volume per person display
     */
    function updateVolumeDisplay() {
        const volumeDisplay = document.getElementById('volume-per-person');
        if (volumeDisplay) {
            // NASA standard: 27.9 m³ per person for long-duration missions
            const volumePerPerson = 27.9;
            volumeDisplay.textContent = `${volumePerPerson} m³`;
        }
    }

    /**
     * Show configuration summary section
     */
    function showConfigurationSummary() {
        const summarySection = document.getElementById('configuration-summary');
        if (summarySection) {
            summarySection.style.display = 'block';
            summarySection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Hide configuration summary section
     */
    function hideConfigurationSummary() {
        const summarySection = document.getElementById('configuration-summary');
        if (summarySection) {
            summarySection.style.display = 'none';
        }
    }

    /**
     * Update configuration summary with totals
     */
    function updateConfigurationSummary() {
        let totalFloorArea = 0;
        let totalVolume = 0;
        let totalCrewCapacity = 0;
        let weightedEfficiency = 0;
        let totalWeight = 0;

        // Calculate totals from selected modules
        Object.entries(configState.selectedModules).forEach(([moduleType, data]) => {
            if (data.selected && data.quantity > 0) {
                const specs = moduleSpecs[moduleType];
                const quantity = data.quantity;

                totalFloorArea += specs.floorArea * quantity;
                totalVolume += specs.volume * quantity;
                totalCrewCapacity += specs.crewCapacity * quantity;
                weightedEfficiency += specs.efficiency * specs.volume * quantity;
                totalWeight += specs.volume * quantity;
            }
        });

        // Calculate average efficiency
        const avgEfficiency = totalWeight > 0 ? Math.round(weightedEfficiency / totalWeight) : 0;

        // Update displays
        updateElementText('total-floor-area', `${totalFloorArea.toFixed(1)} m²`);
        updateElementText('total-volume', `${totalVolume.toFixed(1)} m³`);
        updateElementText('crew-capacity', `${totalCrewCapacity} astronauts`);
        updateElementText('efficiency-rating', `${avgEfficiency}%`);

        console.log('📊 Configuration summary updated:', {
            floorArea: totalFloorArea.toFixed(1),
            volume: totalVolume.toFixed(1),
            crewCapacity: totalCrewCapacity,
            efficiency: avgEfficiency + '%'
        });
    }

    /**
     * Update element text content safely
     */
    function updateElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Get current configuration state
     */
    function getConfiguration() {
        return {
            ...configState,
            timestamp: Date.now()
        };
    }

    /**
     * Save configuration to localStorage
     */
    function saveConfig() {
        try {
            localStorage.setItem('spaceArchitectsConfig', JSON.stringify(configState));
            console.log('💾 Configuration saved');
        } catch (error) {
            console.error('❌ Failed to save configuration:', error);
        }
    }

    /**
     * Load configuration from localStorage
     */
    function loadConfig() {
        try {
            const saved = localStorage.getItem('spaceArchitectsConfig');
            if (saved) {
                const parsedConfig = JSON.parse(saved);
                configState = { ...configState, ...parsedConfig };
                console.log('📂 Configuration loaded');
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to load configuration:', error);
        }
        return false;
    }

    // Public API
    return {
        // Initialization
        initializeConfigPage: initializeConfigPage,

        // State management
        getConfiguration: getConfiguration,
        saveConfig: saveConfig,
        loadConfig: loadConfig,

        // Update functions
        updateConfiguration: updateConfigurationSummary
    };
})();

// Export for global access
if (typeof window !== 'undefined') {
    window.MissionConfig = MissionConfig;
}

console.log('⚙️ Mission Configuration module loaded successfully');