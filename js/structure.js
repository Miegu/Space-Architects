/*
===============================================================================
SPACE ARCHITECTS - STRUCTURE PAGE JAVASCRIPT MODULE
NASA Space Apps Challenge Project

This module handles the habitat structure selection page:
- 3D module selection with animations
- Real-time statistics calculations  
- NASA compliance validation
- Navigation between config and editor pages
===============================================================================
*/

const StructurePage = (function() {
    'use strict';
    
    // Module state management
    let structureState = {
        selectedModules: new Set(),
        missionConfig: null,
        moduleSpecs: {},
        totalStats: {
            floorArea: 0,
            totalVolume: 0,
            crewCapacity: 0,
            efficiencyRating: 0
        }
    };
    
    // Module specifications with NASA-compliant data
    const MODULE_CATALOG = {
        dome: {
            id: 'dome',
            name: 'Dome Module',
            icon: '🏠',
            description: 'Spherical pressure vessel',
            efficiency: 85,
            sizes: {
                small: { diameter: 6, floorArea: 28.3, volume: 113.1 },
                medium: { diameter: 8, floorArea: 50.3, volume: 268.1 },
                large: { diameter: 10, floorArea: 78.5, volume: 523.6 }
            }
        },
        torus: {
            id: 'torus',
            name: 'Torus Module', 
            icon: '🍩',
            description: 'Ring-shaped habitat',
            efficiency: 70,
            sizes: {
                small: { diameter: 8, floorArea: 35.2, volume: 176.0 },
                medium: { diameter: 12, floorArea: 79.2, volume: 592.7 },
                large: { diameter: 16, floorArea: 140.8, volume: 1407.4 }
            }
        },
        cube: {
            id: 'cube',
            name: 'Cube Module',
            icon: '📦', 
            description: 'Rectangular habitat',
            efficiency: 95,
            sizes: {
                small: { width: 6, length: 6, height: 3, floorArea: 36, volume: 108 },
                medium: { width: 8, length: 8, height: 3, floorArea: 64, volume: 192 },
                large: { width: 10, length: 10, height: 3, floorArea: 100, volume: 300 }
            }
        },
        cylinder: {
            id: 'cylinder',
            name: 'Cylinder Module',
            icon: '🚀',
            description: 'Elongated comet design', 
            efficiency: 80,
            sizes: {
                small: { diameter: 4, length: 8, floorArea: 32, volume: 100.5 },
                medium: { diameter: 6, length: 10, floorArea: 60, volume: 282.7 },
                large: { diameter: 8, length: 12, floorArea: 96, volume: 603.2 }
            }
        }
    };
    
    /**
     * Initialize the structure page functionality
     */
    function initialize() {
        console.log('🏗️ Initializing Structure Page...');
        
        // Load mission configuration from previous page
        loadMissionConfig();
        
        // Set up event listeners
        setupModuleSelection();
        setupNavigation();
        
        // Initialize display
        updateMissionInfo();
        calculateTotalStats();
        
        console.log('✅ Structure Page initialized');
        return true;
    }
    
    /**
     * Load mission configuration from previous page
     */
    function loadMissionConfig() {
        if (typeof MissionConfig !== 'undefined') {
            structureState.missionConfig = MissionConfig.getCurrentConfig();
            console.log('📊 Mission config loaded:', structureState.missionConfig);
        } else {
            // Fallback default config
            structureState.missionConfig = {
                missionType: 'moon',
                crewSize: 4,
                duration: 60
            };
            console.warn('⚠️ Using default mission config');
        }
    }
    
    /**
     * Set up module selection event handlers 
     */
    let selectedStructureType = null;
    let selectedSize = 'medium'; // default size
    function setupModuleSelection() {
    const selectButtons = document.querySelectorAll('.structure-select-btn');
    
    selectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const moduleType = this.dataset.module;
            selectStructureType(moduleType);
        });
    });
    
    console.log('🏗️ Simplified structure selection initialized');
}

    
   function selectStructureType(moduleType) {
    console.log(`🏠 Selecting structure type: ${moduleType}`);
    
    // If same type is selected, do nothing
    if (selectedStructureType === moduleType) {
        return;
    }
    
    // Deselect previous selection
    if (selectedStructureType) {
        deselectStructureType(selectedStructureType);
    }
    
    // Select new type
    selectedStructureType = moduleType;
    
    // Update visual feedback
    updateStructureSelection(moduleType, true);
    
    // Show size configuration for selected structure
    showSizeConfiguration(moduleType);
    
    // Update navigation state
    updateNavigationState();
    
    // Calculate stats for single structure
    calculateSingleStructureStats();
}

/**
 * Deselect a structure type
 */
function deselectStructureType(moduleType) {
    updateStructureSelection(moduleType, false);
    hideSizeConfiguration();
}

/**
 * Update visual feedback for structure selection
 */
function updateStructureSelection(moduleType, isSelected) {
    const card = document.querySelector(`[data-module-type="${moduleType}"]`);
    const button = card?.querySelector('.structure-select-btn');
    
    if (!card || !button) return;
    
    if (isSelected) {
        // Add green glow effect
        card.classList.add('selected');
        card.style.borderColor = '#00ff88';
        card.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.6)';
        button.textContent = 'Selected';
        button.style.backgroundColor = '#00ff88';
        button.style.color = '#000';
    } else {
        // Remove selection effects
        card.classList.remove('selected');
        card.style.borderColor = '';
        card.style.boxShadow = '';
        button.textContent = 'Select';
        button.style.backgroundColor = '';
        button.style.color = '';
    }
}

/**
 * Show size configuration for selected structure
 */
function showSizeConfiguration(moduleType) {
    const configSection = document.getElementById('selected-modules-section');
    if (!configSection) return;
    
    const module = MODULE_CATALOG[moduleType];
    
    configSection.innerHTML = `
        <h3 class="section-title">Configure Selected Structure</h3>
        <div class="structure-config-item" data-module-id="${moduleType}">
            <div class="structure-config-header">
                <span class="structure-name">${module.icon} ${module.name}</span>
                <span class="structure-badge">Selected</span>
            </div>
            <div class="size-selection">
                <span class="size-label">Size:</span>
                <div class="size-buttons">
                    <button type="button" class="size-btn ${selectedSize === 'small' ? 'active' : ''}" 
                            data-module="${moduleType}" data-size="small">Small</button>
                    <button type="button" class="size-btn ${selectedSize === 'medium' ? 'active' : ''}" 
                            data-module="${moduleType}" data-size="medium">Medium</button>
                    <button type="button" class="size-btn ${selectedSize === 'large' ? 'active' : ''}" 
                            data-module="${moduleType}" data-size="large">Large</button>
                </div>
            </div>
        </div>
    `;
    
    configSection.style.display = 'block';
    setupSizeSelection();
}

/**
 * Hide size configuration
 */
function hideSizeConfiguration() {
    const configSection = document.getElementById('selected-modules-section');
    if (configSection) {
        configSection.style.display = 'none';
        configSection.innerHTML = '';
    }
}

/**
 * Set up size selection handlers - UPDATED VERSION
 */
function setupSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size-btn');
    
    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const size = this.dataset.size;
            const moduleType = this.dataset.module;
            
            // Update selected size
            selectedSize = size;
            
            // Update button states
            const allSizeButtons = document.querySelectorAll('.size-btn');
            allSizeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            console.log(`📏 Structure size changed to ${size}`);
            
            // Recalculate stats
            calculateSingleStructureStats();
        });
    });
}

/**
 * Calculate statistics for single structure
 */
function calculateSingleStructureStats() {
    if (!selectedStructureType) {
        // Reset stats if nothing selected
        updateStatsDisplay({
            floorArea: 0,
            totalVolume: 0,
            crewCapacity: 0,
            efficiencyRating: 0
        });
        return;
    }
    
    const module = MODULE_CATALOG[selectedStructureType];
    const specs = module.sizes[selectedSize];
    const efficiency = module.efficiency;
    
    // Calculate crew capacity based on NASA standards
    const requiredVolumePerPerson = getRequiredVolumePerPerson();
    const habitableVolume = specs.volume * 0.7; // 70% efficiency factor
    const crewCapacity = Math.floor(habitableVolume / requiredVolumePerPerson);
    
    const stats = {
        floorArea: Math.round(specs.floorArea),
        totalVolume: Math.round(specs.volume),
        crewCapacity: Math.max(0, crewCapacity),
        efficiencyRating: efficiency
    };
    
    updateStatsDisplay(stats);
    updateNASAValidation(stats);
}

/**
 * Update statistics display - SIMPLIFIED VERSION
 */
function updateStatsDisplay(stats) {
    updateElement('total-floor-area', `${stats.floorArea} m²`);
    updateElement('total-volume', `${stats.totalVolume} m³`);
    updateElement('crew-capacity', `${stats.crewCapacity} astronauts`);
    updateElement('efficiency-rating', `${stats.efficiencyRating}%`);
}

/**
 * Update NASA standards validation display - SIMPLIFIED VERSION
 */
function updateNASAValidation(stats) {
    const config = structureState.missionConfig;
    if (!config) return;
    
    // Volume per person validation
    const requiredVolume = getRequiredVolumePerPerson() * config.crewSize;
    const actualVolume = stats.totalVolume * 0.7; // Habitable volume
    const volumeCompliant = actualVolume >= requiredVolume;
    
    updateValidationItem('volume-per-person', 
        `${Math.round(actualVolume / config.crewSize)} / ${getRequiredVolumePerPerson()} m³`,
        volumeCompliant);
    
    // Crew capacity validation
    const capacityCompliant = stats.crewCapacity >= config.crewSize;
    updateValidationItem('crew-capacity-check',
        `${stats.crewCapacity} / ${config.crewSize} capacity`,
        capacityCompliant);
    
    // Structure selection validation
    const structureSelected = selectedStructureType !== null;
    updateValidationItem('modules-selected',
        `${structureSelected ? '1' : '0'} structure selected`,
        structureSelected);
    
    // Calculate overall compliance
    const totalChecks = 3;
    const passedChecks = [volumeCompliant, capacityCompliant, structureSelected].filter(Boolean).length;
    const compliancePercentage = Math.round((passedChecks / totalChecks) * 100);
    
    updateElement('overall-compliance', `${compliancePercentage}%`);
}

/**
 * Update navigation button states - SIMPLIFIED VERSION
 */
function updateNavigationState() {
    const continueBtn = document.getElementById('continue-to-editor-btn');
    const hasSelection = selectedStructureType !== null;
    
    if (continueBtn) {
        continueBtn.disabled = !hasSelection;
        continueBtn.classList.toggle('disabled', !hasSelection);
    }
}

/**
 * Save structure selections - SIMPLIFIED VERSION
 */
function saveStructureState() {
    try {
        const saveData = {
            selectedStructureType: selectedStructureType,
            selectedSize: selectedSize,
            timestamp: Date.now()
        };
        
        localStorage.setItem('spaceArchitects_structure', JSON.stringify(saveData));
        console.log('💾 Structure state saved');
    } catch (error) {
        console.error('❌ Failed to save structure state:', error);
    }
}

/**
 * Load structure selections - SIMPLIFIED VERSION
 */
function loadStructureState() {
    try {
        const saved = localStorage.getItem('spaceArchitects_structure');
        if (saved) {
            const saveData = JSON.parse(saved);
            
            if (saveData.selectedStructureType) {
                selectedStructureType = saveData.selectedStructureType;
                selectedSize = saveData.selectedSize || 'medium';
                
                // Restore UI state
                updateStructureSelection(selectedStructureType, true);
                showSizeConfiguration(selectedStructureType);
                calculateSingleStructureStats();
                updateNavigationState();
            }
            
            console.log('📂 Structure state loaded');
        }
    } catch (error) {
        console.error('❌ Failed to load structure state:', error);
    }
}

/**
 * Get current structure state - SIMPLIFIED VERSION
 */
function getStructureState() {
    return {
        selectedStructureType: selectedStructureType,
        selectedSize: selectedSize,
        missionConfig: { ...structureState.missionConfig }
    };
}
    
    /**
     * Set up navigation button handlers
     */
    function setupNavigation() {
        const backBtn = document.getElementById('back-to-config-btn');
        const continueBtn = document.getElementById('continue-to-editor-btn');
        
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                // Save current selections
                saveStructureState();
                
                // Navigate back to config
                if (typeof SpaceArchitects !== 'undefined') {
                    SpaceArchitects.showPage('config');
                }
            });
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', function() {
                if (structureState.selectedModules.size === 0) {
                    showNotification('Please select at least one module type to continue.', 'warning');
                    return;
                }
                
                // Save selections and navigate to editor
                saveStructureState();
                
                if (typeof SpaceArchitects !== 'undefined') {
                    SpaceArchitects.showPage('editor');
                }
                
                console.log('🎨 Navigating to editor with selections:', structureState.selectedModules);
            });
        }
    }
    

    

    /**
     * Show module configuration options
     */
    function showModuleConfiguration(moduleId) {
        const configSection = document.getElementById('selected-modules-section');
        if (!configSection) return;
        
        // Check if already exists
        if (document.querySelector(`[data-module-id="${moduleId}"]`)) return;
        
        const module = MODULE_CATALOG[moduleId];
        const configItem = document.createElement('div');
        configItem.className = 'module-config-item';
        configItem.dataset.moduleId = moduleId;
        
        configItem.innerHTML = `
            <div class="module-header">
                <span>${module.icon} ${module.name}</span>
                <span class="module-quantity">Qty: ${structureState.moduleSpecs[moduleId]?.quantity || 1}</span>
            </div>
            <div class="size-selection">
                <label>Size:</label>
                <button type="button" class="size-btn active" data-size="small">Small</button>
                <button type="button" class="size-btn" data-size="medium">Medium</button>
                <button type="button" class="size-btn" data-size="large">Large</button>
            </div>
        `;
        
        configSection.appendChild(configItem);
        configSection.style.display = 'block';
    }
    
    /**
     * Hide module configuration options
     */
    function hideModuleConfiguration(moduleId) {
        const configItem = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (configItem) {
            configItem.remove();
        }
        
        // Hide section if no modules selected
        const configSection = document.getElementById('selected-modules-section');
        if (configSection && structureState.selectedModules.size === 0) {
            configSection.style.display = 'none';
        }
    }
    
    /**
     * Calculate and update total habitat statistics
     */
    function calculateTotalStats() {
        let totalFloorArea = 0;
        let totalVolume = 0;
        let weightedEfficiency = 0;
        let totalModules = 0;
        
        // Sum up all selected modules
        for (const [moduleId, moduleSpec] of Object.entries(structureState.moduleSpecs)) {
            const specs = moduleSpec.specs;
            const efficiency = MODULE_CATALOG[moduleId].efficiency;
            const quantity = moduleSpec.quantity || 1;
            
            totalFloorArea += (specs.floorArea || 0) * quantity;
            totalVolume += (specs.volume || 0) * quantity;
            weightedEfficiency += efficiency * (specs.volume || 0) * quantity;
            totalModules += quantity;
        }
        
        // Calculate crew capacity based on NASA standards
        const requiredVolumePerPerson = getRequiredVolumePerPerson();
        const habitableVolume = totalVolume * 0.7; // 70% efficiency factor
        const crewCapacity = Math.floor(habitableVolume / requiredVolumePerPerson);
        
        // Calculate overall efficiency
        const efficiencyRating = totalVolume > 0 ? Math.round(weightedEfficiency / totalVolume) : 0;
        
        // Update state
        structureState.totalStats = {
            floorArea: Math.round(totalFloorArea),
            totalVolume: Math.round(totalVolume),
            crewCapacity: Math.max(0, crewCapacity),
            efficiencyRating: efficiencyRating
        };
        
        // Update display
        updateStatsDisplay();
        updateNASAValidation();
    }
    
    /**
     * Get required volume per person based on mission duration
     */
    function getRequiredVolumePerPerson() {
        const duration = structureState.missionConfig?.duration || 60;
        
        if (duration <= 30) return 20; // Short missions
        if (duration <= 90) return 25; // Medium missions 
        if (duration <= 180) return 30; // Long missions
        return 40; // Permanent habitation
    }
    
    /**
     * Update statistics display
     */
    function updateStatsDisplay() {
        const stats = structureState.totalStats;
        
        updateElement('total-floor-area', `${stats.floorArea} m²`);
        updateElement('total-volume', `${stats.totalVolume} m³`);
        updateElement('crew-capacity', `${stats.crewCapacity} astronauts`);
        updateElement('efficiency-rating', `${stats.efficiencyRating}%`);
    }
    
    /**
     * Update NASA standards validation display
     */
    function updateNASAValidation() {
        const config = structureState.missionConfig;
        const stats = structureState.totalStats;
        
        if (!config) return;
        
        // Volume per person validation
        const requiredVolume = getRequiredVolumePerPerson() * config.crewSize;
        const actualVolume = stats.totalVolume * 0.7; // Habitable volume
        const volumeCompliant = actualVolume >= requiredVolume;
        
        updateValidationItem('volume-per-person', 
            `${Math.round(actualVolume / config.crewSize)} / ${getRequiredVolumePerPerson()} m³`,
            volumeCompliant);
        
        // Crew capacity validation
        const capacityCompliant = stats.crewCapacity >= config.crewSize;
        updateValidationItem('crew-capacity-check',
            `${stats.crewCapacity} / ${config.crewSize} capacity`,
            capacityCompliant);
        
        // Module selection validation
        const modulesSelected = structureState.selectedModules.size > 0;
        updateValidationItem('modules-selected',
            `${structureState.selectedModules.size} modules selected`,
            modulesSelected);
        
        // Calculate overall compliance
        const totalChecks = 3;
        const passedChecks = [volumeCompliant, capacityCompliant, modulesSelected].filter(Boolean).length;
        const compliancePercentage = Math.round((passedChecks / totalChecks) * 100);
        
        updateElement('overall-compliance', `${compliancePercentage}%`);
    }
    
    /**
     * Update validation item display
     */
    function updateValidationItem(itemId, text, isValid) {
        const element = document.getElementById(itemId);
        if (element) {
            element.textContent = text;
            element.className = isValid ? 'valid' : 'invalid';
        }
    }
    
    /**
     * Update selected modules display
     */
    function updateSelectedModulesDisplay() {
        const selectedCount = structureState.selectedModules.size;
        const countElement = document.getElementById('selected-modules-count');
        
        if (countElement) {
            countElement.textContent = selectedCount;
        }
        
        // Show/hide configuration section
        const configSection = document.getElementById('selected-modules-section');
        if (configSection) {
            configSection.style.display = selectedCount > 0 ? 'block' : 'none';
        }
    }
    
    /**
     * Update navigation button states
     */
    function updateNavigationState() {
        const continueBtn = document.getElementById('continue-to-editor-btn');
        const hasSelections = structureState.selectedModules.size > 0;
        
        if (continueBtn) {
            continueBtn.disabled = !hasSelections;
            continueBtn.classList.toggle('disabled', !hasSelections);
        }
    }
    
    /**
     * Update mission info display
     */
    function updateMissionInfo() {
        const config = structureState.missionConfig;
        if (!config) return;
        
        updateElement('mission-destination', 
            config.missionType === 'moon' ? '🌙 Luna' : '🔴 Mars');
        updateElement('mission-crew-size', `${config.crewSize} astronauts`);
        updateElement('mission-duration', `${config.duration} days`);
    }
    
    /**
     * Save structure selections to localStorage
     */
    function saveStructureState() {
        try {
            const saveData = {
                selectedModules: Array.from(structureState.selectedModules),
                moduleSpecs: structureState.moduleSpecs,
                totalStats: structureState.totalStats,
                timestamp: Date.now()
            };
            
            localStorage.setItem('spaceArchitects_structure', JSON.stringify(saveData));
            console.log('💾 Structure state saved');
        } catch (error) {
            console.error('❌ Failed to save structure state:', error);
        }
    }
    
    /**
     * Load structure selections from localStorage
     */
    function loadStructureState() {
        try {
            const saved = localStorage.getItem('spaceArchitects_structure');
            if (saved) {
                const saveData = JSON.parse(saved);
                
                // Restore selections
                structureState.selectedModules = new Set(saveData.selectedModules);
                structureState.moduleSpecs = saveData.moduleSpecs || {};
                structureState.totalStats = saveData.totalStats || structureState.totalStats;
                
                // Update UI to reflect loaded state
                restoreUIState();
                
                console.log('📂 Structure state loaded');
            }
        } catch (error) {
            console.error('❌ Failed to load structure state:', error);
        }
    }
    
    /**
     * Restore UI state from loaded data
     */
    function restoreUIState() {
        // Restore module selections
        structureState.selectedModules.forEach(moduleId => {
            const checkbox = document.querySelector(`[data-module="${moduleId}"]`);
            const card = document.querySelector(`[data-module-type="${moduleId}"]`);
            
            if (card) {
                card.classList.add('selected');
                showModuleConfiguration(moduleId);
            }
            
            if (checkbox) {
                checkbox.checked = true;
            }
            
            // Update quantity display if exists
            const moduleSpec = structureState.moduleSpecs[moduleId];
            if (moduleSpec && moduleSpec.quantity) {
                updateQuantityDisplay(moduleId, moduleSpec.quantity);
            }
        });
        
        // Restore size selections
        Object.entries(structureState.moduleSpecs).forEach(([moduleId, spec]) => {
            const configItem = document.querySelector(`[data-module-id="${moduleId}"]`);
            if (configItem) {
                const sizeButtons = configItem.querySelectorAll('.size-btn');
                sizeButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.size === spec.size);
                });
            }
        });
        
        // Update displays
        updateSelectedModulesDisplay();
        updateNavigationState();
        calculateTotalStats();
    }
    
    /**
     * Show notification to user
     */
    function showNotification(message, type = 'info') {
        // Simple alert for now - could be enhanced with custom modal
        alert(message);
    }
    
    /**
     * Utility function to update element text content
     */
    function updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
    
    /**
     * Get current structure state (for external access)
     */
    function getStructureState() {
        return {
            selectedModules: Array.from(structureState.selectedModules),
            moduleSpecs: { ...structureState.moduleSpecs },
            totalStats: { ...structureState.totalStats },
            missionConfig: { ...structureState.missionConfig }
        };
    }
    
    // Public API
    return {
        initialize: initialize,
        getStructureState: getStructureState,
        saveStructureState: saveStructureState,
        loadStructureState: loadStructureState,
        calculateTotalStats: calculateTotalStats
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.StructurePage = StructurePage;
}

// Auto-initialize when DOM loads and structure page is active
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('structure-page')?.classList.contains('active')) {
        StructurePage.initialize();
    }
});

// Listen for page navigation to initialize structure page
document.addEventListener('navigateToPage', function(event) {
    if (event.detail.page === 'structure') {
        setTimeout(() => {
            StructurePage.initialize();
        }, 100);
    }
});

console.log('🏗️ Structure Page module loaded successfully');