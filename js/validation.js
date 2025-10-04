/* ==========================================================================
   SPACE ARCHITECTS - VALIDATION MODULE
   NASA Space Apps Challenge Project
   
   This module provides real-time validation of habitat designs against
   NASA standards and requirements. Updates indicators as rooms are placed.
   ========================================================================== */

const ValidationSystem = (function() {
    'use strict';
    
    // Validation state
    let currentValidation = {
        score: 0,
        maxScore: 100,
        requirements: {},
        violations: [],
        recommendations: [],
        lastUpdate: null
    };
    
    // Validation rules based on NASA standards
    const VALIDATION_RULES = {
        volumePerPerson: {
            id: 'req-volume',
            name: 'Minimum Volume per Person',
            description: 'Each astronaut needs 25+ m³ of habitable space',
            weight: 25,
            calculate: function(placedRooms, config) {
                const totalVolume = placedRooms.reduce((sum, room) => {
                    const roomDef = RoomsManager.getRoomById(room.type);
                    return sum + (roomDef ? roomDef.volume : 0);
                }, 0);
                
                const volumePerPerson = config.crewSize > 0 ? totalVolume / config.crewSize : 0;
                const required = NASA_STANDARDS.VOLUME_REQUIREMENTS.perPerson.mediumStay;
                
                return {
                    current: volumePerPerson,
                    required: required,
                    passed: volumePerPerson >= required,
                    score: volumePerPerson >= required ? this.weight : 0,
                    message: `${volumePerPerson.toFixed(1)} / ${required} m³`
                };
            }
        },
        
        crewQuarters: {
            id: 'req-quarters',
            name: 'Individual Sleeping Quarters',
            description: 'Private sleeping space for each crew member',
            weight: 20,
            calculate: function(placedRooms, config) {
                const quarters = placedRooms.filter(room => room.type === 'crew_quarters').length;
                const required = config.crewSize;
                
                return {
                    current: quarters,
                    required: required,
                    passed: quarters >= required,
                    score: quarters >= required ? this.weight : (quarters / required) * this.weight,
                    message: `${quarters} / ${required} quarters`
                };
            }
        },
        
        essentialRooms: {
            id: 'req-essential',
            name: 'Essential Areas Complete',
            description: 'All critical habitat functions present',
            weight: 20,
            calculate: function(placedRooms, config) {
                const essential = ['hygiene', 'galley', 'diningdroom', 'exercise', 'workstation', 'medical', 'storage'];
                const placedTypes = new Set(placedRooms.map(room => room.type));
                const present = essential.filter(type => placedTypes.has(type));
                
                return {
                    current: present.length,
                    required: essential.length,
                    passed: present.length === essential.length,
                    score: (present.length / essential.length) * this.weight,
                    message: `${present.length} / ${essential.length} areas`
                };
            }
        },
        
        hygieneStations: {
            id: 'req-hygiene',
            name: 'Hygiene Facilities',
            description: 'Adequate bathroom facilities (max 3 people/station)',
            weight: 15,
            calculate: function(placedRooms, config) {
                const stations = placedRooms.filter(room => room.type === 'hygiene').length;
                const required = Math.ceil(config.crewSize / 3);
                
                return {
                    current: stations,
                    required: required,
                    passed: stations >= required,
                    score: stations >= required ? this.weight : (stations / required) * this.weight,
                    message: `${stations} / ${required} stations`
                };
            }
        },
        
        emergencyAccess: {
            id: 'req-access',
            name: 'Emergency Access',
            description: 'Quick access to medical bay from all areas',
            weight: 10,
            calculate: function(placedRooms, config) {
                const medicalBays = placedRooms.filter(room => room.type === 'medical');
                if (medicalBays.length === 0) {
                    return {
                        current: 0,
                        required: 1,
                        passed: false,
                        score: 0,
                        message: 'No medical bay'
                    };
                }
                
                // Check if all rooms are within reasonable distance of medical
                const medical = medicalBays;
                const maxDistance = 15; // meters
                let accessibleRooms = 0;
                
                placedRooms.forEach(room => {
                    const distance = RoomsManager.calculateDistance(room.position, medical.position);
                    if (distance <= maxDistance) {
                        accessibleRooms++;
                    }
                });
                
                const accessRatio = placedRooms.length > 0 ? accessibleRooms / placedRooms.length : 0;
                
                return {
                    current: accessRatio,
                    required: 1.0,
                    passed: accessRatio >= 0.9, // 90% of rooms accessible
                    score: accessRatio * this.weight,
                    message: accessRatio >= 0.9 ? 'Good access' : 'Limited access'
                };
            }
        }
    };
    
    /**
     * Validate current habitat design
     * @param {Array} placedRooms - Currently placed rooms
     * @param {Object} config - Mission configuration
     * @returns {Object} Validation results
     */
    function validateDesign(placedRooms, config) {
        const results = {
            score: 0,
            maxScore: Object.values(VALIDATION_RULES).reduce((sum, rule) => sum + rule.weight, 0),
            requirements: {},
            overallCompliance: 0,
            passed: 0,
            total: Object.keys(VALIDATION_RULES).length
        };
        
        // Evaluate each validation rule
        Object.values(VALIDATION_RULES).forEach(rule => {
            const result = rule.calculate(placedRooms, config);
            results.requirements[rule.id] = {
                ...result,
                name: rule.name,
                description: rule.description,
                weight: rule.weight
            };
            
            results.score += result.score;
            if (result.passed) {
                results.passed++;
            }
        });
        
        results.overallCompliance = Math.round((results.score / results.maxScore) * 100);
        results.lastUpdate = Date.now();
        
        return results;
    }
    
    /**
     * Update visual indicators in the requirements panel
     * @param {Object} validationResults - Results from validateDesign
     */
    function updateValidationUI(validationResults) {
        // Update overall compliance score
        const scoreElement = document.getElementById('compliance-percentage');
        const progressElement = document.getElementById('score-progress');
        
        if (scoreElement) {
            scoreElement.textContent = validationResults.overallCompliance;
        }
        
        if (progressElement) {
            progressElement.style.width = `${validationResults.overallCompliance}%`;
        }
        
        // Update individual requirement indicators
        Object.entries(validationResults.requirements).forEach(([reqId, result]) => {
            const element = document.getElementById(reqId);
            if (element) {
                // Update status indicator
                const statusEl = element.querySelector('.req-status');
                if (statusEl) {
                    statusEl.className = 'req-status ' + (result.passed ? 'green' : 'red');
                }
                
                // Update value display
                const valueEl = element.querySelector('.req-value');
                if (valueEl) {
                    valueEl.textContent = result.message;
                }
            }
        });
        
        console.log('✅ Validation UI updated:', validationResults.overallCompliance + '%');
    }
    
    /**
     * Check for educational tips based on room placement
     * @param {Array} placedRooms - Currently placed rooms
     * @returns {Array} Available tips
     */
    function checkEducationalTips(placedRooms) {
        return RoomsManager.checkEducationalTips(placedRooms);
    }
    
    /**
     * Show educational tip modal
     * @param {Object} tip - Educational tip object
     */
    function showEducationalTip(tip) {
        const modal = document.getElementById('tip-modal');
        const messageEl = document.getElementById('tip-message');
        
        if (modal && messageEl) {
            messageEl.textContent = tip.message;
            modal.classList.add('active');
            
            // Auto-close after 5 seconds
            setTimeout(() => {
                modal.classList.remove('active');
            }, 5000);
        }
    }
    
    /**
     * Initialize validation system
     */
    function initialize() {
        console.log('🔍 Initializing validation system...');
        
        // Set up modal close handlers
        const tipModal = document.getElementById('tip-modal');
        const closeTipBtn = document.getElementById('close-tip');
        const gotItBtn = document.getElementById('got-it-btn');
        
        if (closeTipBtn) {
            closeTipBtn.addEventListener('click', () => {
                tipModal.classList.remove('active');
            });
        }
        
        if (gotItBtn) {
            gotItBtn.addEventListener('click', () => {
                tipModal.classList.remove('active');
            });
        }
        
        // Close modal on backdrop click
        if (tipModal) {
            tipModal.addEventListener('click', (e) => {
                if (e.target === tipModal) {
                    tipModal.classList.remove('active');
                }
            });
        }
        
        console.log('✅ Validation system initialized');
    }
    
    /**
     * Get current validation state
     * @returns {Object} Current validation results
     */
    function getCurrentValidation() {
        return { ...currentValidation };
    }
    
    /**
     * Real-time validation function - call whenever rooms change
     * @param {Array} placedRooms - Currently placed rooms
     * @param {Object} config - Mission configuration
     */
    function performRealTimeValidation(placedRooms, config) {
        const results = validateDesign(placedRooms, config);
        currentValidation = results;
        
        updateValidationUI(results);
        
        // Check for educational tips
        const tips = checkEducationalTips(placedRooms);
        if (tips.length > 0) {
            // Show the first applicable tip
            showEducationalTip(tips);
        }
        
        // Dispatch validation update event
        document.dispatchEvent(new CustomEvent('validationUpdated', {
            detail: results
        }));
        
        return results;
    }
    
    // Public API
    return {
        initialize: initialize,
        validateDesign: validateDesign,
        updateValidationUI: updateValidationUI,
        performRealTimeValidation: performRealTimeValidation,
        getCurrentValidation: getCurrentValidation,
        checkEducationalTips: checkEducationalTips,
        showEducationalTip: showEducationalTip
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.ValidationSystem = ValidationSystem;
}

console.log('✅ Validation module loaded successfully');