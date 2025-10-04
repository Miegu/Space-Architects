/*
===============================================================================
SPACE ARCHITECTS - HABITAT STRUCTURE MODULE
NASA Space Apps Challenge Project

This module handles:
- Structure page initialization and display
- Selected modules visualization
- 3D habitat preview (simple icon-based approach)
- Module details display
- Navigation to interior editor
===============================================================================
*/

const StructurePage = (function() {
    'use strict';

    // Structure state
    let structureState = {
        selectedModules: {},
        totalStats: {
            floorArea: 0,
            volume: 0,
            crewCapacity: 0,
            efficiency: 0
        }
    };

    // Module visual representations
    const moduleVisuals = {
        dome: {
            name: 'Dome Module',
            icon: '🏠',
            color: '#4CAF50',
            shape: 'dome'
        },
        torus: {
            name: 'Torus Module', 
            icon: '🍩',
            color: '#FF9800',
            shape: 'torus'
        },
        cube: {
            name: 'Cube Module',
            icon: '📦', 
            color: '#2196F3',
            shape: 'cube'
        },
        cylinder: {
            name: 'Cylinder Module',
            icon: '🚀',
            color: '#9C27B0',
            shape: 'cylinder'
        }
    };

    /**
     * Initialize the structure page
     */
    function initialize() {
        console.log('🏗️ Initializing Habitat Structure Page');

        loadStructureState();
        displayHabitatPreview();
        displayModuleDetails();

        console.log('✅ Structure page initialized');
    }

    /**
     * Load configuration from MissionConfig
     */
    function loadStructureState() {
        if (typeof MissionConfig !== 'undefined') {
            const config = MissionConfig.getConfiguration();
            structureState.selectedModules = config.selectedModules;

            // Calculate total stats
            calculateTotalStats();

            console.log('📂 Structure state loaded:', structureState);
        } else {
            console.warn('⚠️ MissionConfig not available, using default state');
        }
    }

    /**
     * Calculate total statistics from selected modules
     */
    function calculateTotalStats() {
        const moduleSpecs = {
            dome: { floorArea: 78.5, volume: 261.8, crewCapacity: 6, efficiency: 85 },
            torus: { floorArea: 157.1, volume: 394.8, crewCapacity: 8, efficiency: 70 },
            cube: { floorArea: 100, volume: 250, crewCapacity: 10, efficiency: 95 },
            cylinder: { floorArea: 70.7, volume: 176.7, crewCapacity: 5, efficiency: 80 }
        };

        let totalFloorArea = 0;
        let totalVolume = 0;
        let totalCrewCapacity = 0;
        let weightedEfficiency = 0;
        let totalWeight = 0;

        Object.entries(structureState.selectedModules).forEach(([moduleType, data]) => {
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

        structureState.totalStats = {
            floorArea: totalFloorArea,
            volume: totalVolume,
            crewCapacity: totalCrewCapacity,
            efficiency: totalWeight > 0 ? Math.round(weightedEfficiency / totalWeight) : 0
        };
    }

    /**
     * Display habitat 3D preview (simple icon-based approach)
     */
    function displayHabitatPreview() {
        const previewContainer = document.getElementById('habitat-3d-preview');
        if (!previewContainer) return;

        // Clear existing content
        previewContainer.innerHTML = '';

        // Create simple 3D-style preview
        const previewDiv = document.createElement('div');
        previewDiv.className = 'habitat-preview-container';

        // Count selected modules
        const selectedModuleTypes = Object.entries(structureState.selectedModules)
            .filter(([_, data]) => data.selected && data.quantity > 0);

        if (selectedModuleTypes.length === 0) {
            previewDiv.innerHTML = `
                <div class="no-modules">
                    <div class="preview-icon">🏗️</div>
                    <p>No modules selected</p>
                </div>
            `;
        } else {
            // Create visual representation
            previewDiv.innerHTML = `
                <div class="modules-assembly">
                    <div class="assembly-title">Habitat Assembly</div>
                    <div class="modules-layout">
                        ${selectedModuleTypes.map(([moduleType, data]) => {
                            const visual = moduleVisuals[moduleType];
                            return createModuleVisualization(moduleType, data.quantity, visual);
                        }).join('')}
                    </div>
                    <div class="assembly-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Volume:</span>
                            <span class="stat-value">${structureState.totalStats.volume.toFixed(1)} m³</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Crew Capacity:</span>
                            <span class="stat-value">${structureState.totalStats.crewCapacity} astronauts</span>
                        </div>
                    </div>
                </div>
            `;
        }

        previewContainer.appendChild(previewDiv);
        console.log('🎨 Habitat preview displayed');
    }

    /**
     * Create visual representation of a module type
     */
    function createModuleVisualization(moduleType, quantity, visual) {
        return `
            <div class="module-group" data-module="${moduleType}">
                <div class="module-visual-item" style="border-color: ${visual.color};">
                    <div class="module-icon-large" style="color: ${visual.color};">${visual.icon}</div>
                    <div class="module-shape ${visual.shape}"></div>
                </div>
                <div class="module-label">${visual.name}</div>
                <div class="module-quantity">×${quantity}</div>
            </div>
        `;
    }

    /**
     * Display detailed module information
     */
    function displayModuleDetails() {
        const detailsContainer = document.getElementById('structure-details');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = '';

        const selectedModules = Object.entries(structureState.selectedModules)
            .filter(([_, data]) => data.selected && data.quantity > 0);

        if (selectedModules.length === 0) {
            detailsContainer.innerHTML = `
                <div class="no-selection">
                    <h3>No Modules Selected</h3>
                    <p>Please go back to configuration and select habitat modules.</p>
                </div>
            `;
            return;
        }

        // Create module details
        const detailsHTML = `
            <div class="structure-summary">
                <h3>Selected Modules</h3>
                <div class="modules-list">
                    ${selectedModules.map(([moduleType, data]) => {
                        const visual = moduleVisuals[moduleType];
                        return createModuleDetailCard(moduleType, data, visual);
                    }).join('')}
                </div>

                <div class="total-statistics">
                    <h4>Total Habitat Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Floor Area</div>
                            <div class="stat-value">${structureState.totalStats.floorArea.toFixed(1)} m²</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Volume</div>
                            <div class="stat-value">${structureState.totalStats.volume.toFixed(1)} m³</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Crew Capacity</div>
                            <div class="stat-value">${structureState.totalStats.crewCapacity}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Efficiency</div>
                            <div class="stat-value">${structureState.totalStats.efficiency}%</div>
                        </div>
                    </div>
                </div>

                <div class="next-steps">
                    <h4>Next: Interior Design</h4>
                    <p>In the next phase, you'll place rooms and design the interior layout of your habitat modules following NASA standards for space efficiency and crew safety.</p>
                    <ul>
                        <li>Drag and drop rooms into available spaces</li>
                        <li>Follow NASA spacing and safety requirements</li>
                        <li>Optimize for crew efficiency and psychological well-being</li>
                    </ul>
                </div>
            </div>
        `;

        detailsContainer.innerHTML = detailsHTML;
        console.log('📋 Module details displayed');
    }

    /**
     * Create detailed card for a module
     */
    function createModuleDetailCard(moduleType, data, visual) {
        // Module specifications for details
        const specs = {
            dome: { floorArea: 78.5, volume: 261.8, efficiency: 85, description: 'Optimal pressure distribution, spherical design' },
            torus: { floorArea: 157.1, volume: 394.8, efficiency: 70, description: 'Artificial gravity via rotation, ring-shaped' },
            cube: { floorArea: 100, volume: 250, efficiency: 95, description: 'Maximum volume efficiency, rectangular design' },
            cylinder: { floorArea: 70.7, volume: 176.7, efficiency: 80, description: 'Traditional cylindrical space habitat' }
        };

        const spec = specs[moduleType];
        const totalArea = spec.floorArea * data.quantity;
        const totalVolume = spec.volume * data.quantity;

        return `
            <div class="module-detail-card" style="border-left: 4px solid ${visual.color};">
                <div class="module-header">
                    <div class="module-icon" style="color: ${visual.color};">${visual.icon}</div>
                    <div class="module-info">
                        <h4>${visual.name}</h4>
                        <p class="module-description">${spec.description}</p>
                    </div>
                    <div class="module-count">×${data.quantity}</div>
                </div>
                <div class="module-stats">
                    <div class="stat-row">
                        <span>Floor Area:</span>
                        <span>${totalArea.toFixed(1)} m² (${spec.floorArea.toFixed(1)} m² each)</span>
                    </div>
                    <div class="stat-row">
                        <span>Volume:</span>
                        <span>${totalVolume.toFixed(1)} m³ (${spec.volume.toFixed(1)} m³ each)</span>
                    </div>
                    <div class="stat-row">
                        <span>Efficiency:</span>
                        <span>${spec.efficiency}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Save structure state
     */
    function saveStructureState() {
        try {
            localStorage.setItem('spaceArchitectsStructure', JSON.stringify(structureState));
            console.log('💾 Structure state saved');
        } catch (error) {
            console.error('❌ Failed to save structure state:', error);
        }
    }

    /**
     * Get current structure state
     */
    function getStructureState() {
        return {
            ...structureState,
            timestamp: Date.now()
        };
    }

    // Public API
    return {
        // Initialization
        initialize: initialize,

        // State management
        loadStructureState: loadStructureState,
        saveStructureState: saveStructureState,
        getStructureState: getStructureState
    };
})();

// Export for global access
if (typeof window !== 'undefined') {
    window.StructurePage = StructurePage;
}

console.log('🏗️ Structure Page module loaded successfully');