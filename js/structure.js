/*
===============================================================================
SPACE ARCHITECTS - STRUCTURE PAGE JAVASCRIPT MODULE
NASA Space Apps Challenge Project

This module handles the habitat structure selection page:
- Single structure selection (fixed version)
- Real-time statistics calculations  
- NASA compliance validation
- Navigation between config and editor pages
===============================================================================
*/

const StructurePage = (function() {
    'use strict';
    
    // Module state management
    let structureState = {
        missionConfig: null,
        totalStats: {
            floorArea: 0,
            totalVolume: 0,
            crewCapacity: 0,
            efficiencyRating: 0
        }
    };
    
    // Structure selection state
    let selectedStructureType = null;
    let selectedSize = 'medium'; // default size
    
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
        
        // Load any previously saved structure state
        loadStructureState();
        
        // Set up event listeners
        setupModuleSelection();
        setupNavigation();
        
        // Initialize display
        updateMissionInfo();
        calculateSingleStructureStats();
        updateNavigationState();
        
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
    function setupModuleSelection() {
        console.log('🎯 Setting up module selection...');
        
        // Find all structure selection buttons
        const selectButtons = document.querySelectorAll('.structure-select-btn');
        console.log(`Found ${selectButtons.length} structure select buttons`);
        
        // Add click handlers to each button
        selectButtons.forEach((button, index) => {
            const moduleType = button.dataset.module;
            console.log(`Button ${index}: ${moduleType}`);
            
            button.addEventListener('click', function() {
                console.log(`🖱️ Button clicked for: ${moduleType}`);
                selectStructureType(moduleType);
            });
        });
        
        console.log('✅ Module selection setup complete');
    }
    
    /**
     * Handle structure type selection
     */
    function selectStructureType(moduleType) {
        console.log(`🏠 Selecting structure type: ${moduleType}`);
        
        // If same type is selected, do nothing
        if (selectedStructureType === moduleType) {
            console.log('Same structure already selected, ignoring');
            return;
        }
        
        // Deselect previous selection
        if (selectedStructureType) {
            console.log(`Deselecting previous: ${selectedStructureType}`);
            updateStructureSelection(selectedStructureType, false);
        }
        
        // Select new type
        selectedStructureType = moduleType;
        console.log(`New selection: ${selectedStructureType}`);
        
        // Update visual feedback
        updateStructureSelection(moduleType, true);
        
        // Show size configuration for selected structure
        showSizeConfiguration(moduleType);
        
        // Update navigation state
        updateNavigationState();
        
        // Calculate stats for single structure
        calculateSingleStructureStats();
        
        console.log('✅ Structure selection complete');
    }
    
    /**
     * Update visual feedback for structure selection
     */
    function updateStructureSelection(moduleType, isSelected) {
        console.log(`🎨 Updating visual for ${moduleType}, selected: ${isSelected}`);
        
        const card = document.querySelector(`[data-module-type="${moduleType}"]`);
        const button = card?.querySelector('.structure-select-btn');
        
        if (!card) {
            console.error(`❌ Card not found for module type: ${moduleType}`);
            return;
        }
        
        if (!button) {
            console.error(`❌ Button not found in card for: ${moduleType}`);
            return;
        }
        
        if (isSelected) {
            // Add green glow effect
            card.classList.add('selected');
            card.style.borderColor = '#00ff88';
            card.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.6)';
            button.textContent = 'Selected';
            button.style.backgroundColor = '#00ff88';
            button.style.color = '#000';
            console.log(`✅ Applied selection styles to ${moduleType}`);
        } else {
            // Remove selection effects
            card.classList.remove('selected');
            card.style.borderColor = '';
            card.style.boxShadow = '';
            button.textContent = 'Select';
            button.style.backgroundColor = '';
            button.style.color = '';
            console.log(`❌ Removed selection styles from ${moduleType}`);
        }
    }
    
    /**
     * Show size configuration for selected structure
     */
    function showSizeConfiguration(moduleType) {
        console.log(`🔧 Showing size configuration for: ${moduleType}`);
        
        const configSection = document.getElementById('selected-modules-section');
        if (!configSection) {
            console.error('❌ Config section not found');
            return;
        }
        
        const module = MODULE_CATALOG[moduleType];
        if (!module) {
            console.error(`❌ Module not found: ${moduleType}`);
            return;
        }
        
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
        
        console.log('✅ Size configuration displayed');
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
     * Set up size selection handlers
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
        console.log('🧮 Calculating structure stats...');
        
        if (!selectedStructureType) {
            console.log('No structure selected, resetting stats');
            // Reset stats if nothing selected
            const emptyStats = {
                floorArea: 0,
                totalVolume: 0,
                crewCapacity: 0,
                efficiencyRating: 0
            };
            updateStatsDisplay(emptyStats);
            updateNASAValidation(emptyStats);
            return;
        }
        
        const module = MODULE_CATALOG[selectedStructureType];
        const specs = module.sizes[selectedSize];
        const efficiency = module.efficiency;
        
        console.log(`Module: ${module.name}, Size: ${selectedSize}`, specs);
        
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
        
        console.log('Calculated stats:', stats);
        
        updateStatsDisplay(stats);
        updateNASAValidation(stats);
    }
    
    /**
     * Update statistics display
     */
    function updateStatsDisplay(stats) {
        updateElement('total-floor-area', `${stats.floorArea} m²`);
        updateElement('total-volume', `${stats.totalVolume} m³`);
        updateElement('crew-capacity', `${stats.crewCapacity} astronauts`);
        updateElement('efficiency-rating', `${stats.efficiencyRating}%`);
        
        console.log('📊 Stats display updated');
    }
    
    /**
     * Update NASA standards validation display
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
        
        console.log('✅ NASA validation updated');
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
     * Update navigation button states
     */
    function updateNavigationState() {
        console.log('🧭 Updating navigation state...');
        
        const continueBtn = document.getElementById('continue-to-editor-btn');
        const hasSelection = selectedStructureType !== null;
        
        console.log(`Has selection: ${hasSelection}, Button exists: ${!!continueBtn}`);
        
        if (continueBtn) {
            continueBtn.disabled = !hasSelection;
            continueBtn.classList.toggle('disabled', !hasSelection);
            console.log(`Continue button enabled: ${hasSelection}`);
        }
    }
    
    /**
     * Set up navigation button handlers
     */
    function setupNavigation() {
        console.log('🚀 Setting up navigation...');
        
        const backBtn = document.getElementById('back-to-config-btn');
        const continueBtn = document.getElementById('continue-to-editor-btn');
        
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                console.log('🔙 Back button clicked');
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
                console.log('▶️ Continue button clicked');
                
                if (!selectedStructureType) {
                    showNotification('Please select a structure type to continue.', 'warning');
                    return;
                }
                
                // Save selections and navigate to editor
                saveStructureState();
                
                if (typeof SpaceArchitects !== 'undefined') {
                    SpaceArchitects.showPage('editor');
                }
                
                console.log('🎨 Navigating to editor with selection:', selectedStructureType);
            });
        }
        
        console.log('✅ Navigation setup complete');
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
     * Update mission info display
     */
    function updateMissionInfo() {
        const config = structureState.missionConfig;
        if (!config) return;
        
        updateElement('mission-destination', 
            config.missionType === 'moon' ? '🌙 Luna' : '🔴 Mars');
        updateElement('mission-crew-size', `${config.crewSize} astronauts`);
        updateElement('mission-duration', `${config.duration} days`);
        
        console.log('📋 Mission info updated');
    }
    
    /**
     * Save structure selections to localStorage
     */
    function saveStructureState() {
        try {
            const saveData = {
                selectedStructureType: selectedStructureType,
                selectedSize: selectedSize,
                timestamp: Date.now()
            };
            
            localStorage.setItem('spaceArchitects_structure', JSON.stringify(saveData));
            console.log('💾 Structure state saved:', saveData);
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
                
                if (saveData.selectedStructureType) {
                    selectedStructureType = saveData.selectedStructureType;
                    selectedSize = saveData.selectedSize || 'medium';
                    
                    console.log('📂 Restoring structure state:', saveData);
                    
                    // Delay UI restoration to ensure DOM is ready
                    setTimeout(() => {
                        updateStructureSelection(selectedStructureType, true);
                        showSizeConfiguration(selectedStructureType);
                        calculateSingleStructureStats();
                        updateNavigationState();
                    }, 100);
                }
                
                console.log('✅ Structure state loaded');
            }
        } catch (error) {
            console.error('❌ Failed to load structure state:', error);
        }
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
        } else {
            console.warn(`Element not found: ${id}`);
        }
    }
    
    /**
     * Get current structure state (for external access)
     */
    function getStructureState() {
        return {
            selectedStructureType: selectedStructureType,
            selectedSize: selectedSize,
            missionConfig: { ...structureState.missionConfig }
        };
    }
    
    // Public API
    return {
        initialize: initialize,
        getStructureState: getStructureState,
        saveStructureState: saveStructureState,
        loadStructureState: loadStructureState
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