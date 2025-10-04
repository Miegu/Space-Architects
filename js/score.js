/* ==========================================================================
   SPACE ARCHITECTS - SCORING SYSTEM
   NASA Space Apps Challenge Project
   
   Advanced scoring system that evaluates habitat designs based on:
   - NASA compliance requirements
   - Operational efficiency
   - Crew wellbeing factors
   - Resource optimization
   ========================================================================== */

const ScoringSystem = (function() {
    'use strict';
    
    // Scoring categories and weights
    const SCORING_CATEGORIES = {
        nasaCompliance: {
            name: 'NASA Standards Compliance',
            weight: 35,
            description: 'Adherence to official NASA habitat requirements'
        },
        operationalEfficiency: {
            name: 'Operational Efficiency', 
            weight: 25,
            description: 'Layout optimization for daily operations'
        },
        crewWellbeing: {
            name: 'Crew Wellbeing',
            weight: 25,
            description: 'Psychological and social factors'
        },
        resourceOptimization: {
            name: 'Resource Optimization',
            weight: 15,
            description: 'Efficient use of space and resources'
        }
    };
    
    /**
     * Calculate NASA compliance score
     * @param {Array} placedRooms - Placed rooms array
     * @param {Object} missionConfig - Mission configuration
     * @returns {Object} Compliance score details
     */
    function calculateNASACompliance(placedRooms, missionConfig) {
        const results = {
            score: 0,
            maxScore: 100,
            factors: {},
            details: []
        };
        
        // Volume per person (25 points)
        const totalVolume = placedRooms.reduce((sum, room) => {
            const roomDef = RoomsManager.getRoomById(room.type);
            return sum + (roomDef ? roomDef.volume : 0);
        }, 0);
        
        const volumePerPerson = missionConfig.crewSize > 0 ? totalVolume / missionConfig.crewSize : 0;
        const requiredVolume = NASA_STANDARDS.VOLUME_REQUIREMENTS.perPerson.mediumStay;
        
        if (volumePerPerson >= requiredVolume) {
            results.factors.volume = 25;
            results.details.push(`✅ Volume requirement met: ${volumePerPerson.toFixed(1)}m³ per person`);
        } else {
            const ratio = volumePerPerson / requiredVolume;
            results.factors.volume = Math.max(0, 25 * ratio);
            results.details.push(`❌ Volume deficit: ${volumePerPerson.toFixed(1)}/${requiredVolume}m³ per person`);
        }
        
        // Essential rooms present (25 points)
        const essentialRooms = ['crew_quarters', 'hygiene', 'galley', 'diningroom', 'exercise', 'workstation', 'medical'];
        const placedTypes = new Set(placedRooms.map(room => room.type));
        const presentEssential = essentialRooms.filter(type => placedTypes.has(type));
        
        results.factors.essentialRooms = (presentEssential.length / essentialRooms.length) * 25;
        results.details.push(`${presentEssential.length}/${essentialRooms.length} essential rooms present`);
        
        // Crew quarters adequacy (20 points)
        const quarters = placedRooms.filter(room => room.type === 'crew_quarters').length;
        const quartersScore = Math.min(20, (quarters / missionConfig.crewSize) * 20);
        results.factors.quarters = quartersScore;
        results.details.push(`${quarters}/${missionConfig.crewSize} crew quarters provided`);
        
        // Hygiene facilities adequacy (15 points)
        const hygieneStations = placedRooms.filter(room => room.type === 'hygiene').length;
        const requiredHygiene = Math.ceil(missionConfig.crewSize / 3);
        const hygieneScore = Math.min(15, (hygieneStations / requiredHygiene) * 15);
        results.factors.hygiene = hygieneScore;
        results.details.push(`${hygieneStations}/${requiredHygiene} hygiene stations provided`);
        
        // Safety considerations (15 points) 
        let safetyScore = 15;
        const medicalBays = placedRooms.filter(room => room.type === 'medical').length;
        if (medicalBays === 0) {
            safetyScore -= 10;
            results.details.push('❌ No medical bay present');
        } else {
            results.details.push('✅ Medical facility available');
        }
        
        results.factors.safety = safetyScore;
        
        // Calculate total score
        results.score = Object.values(results.factors).reduce((sum, score) => sum + score, 0);
        
        return results;
    }
    
    /**
     * Calculate operational efficiency score
     * @param {Array} placedRooms - Placed rooms array
     * @returns {Object} Efficiency score details
     */
    function calculateOperationalEfficiency(placedRooms) {
        const results = {
            score: 0,
            maxScore: 100,
            factors: {},
            details: []
        };
        
        // Kitchen-dining proximity (30 points)
        const galleys = placedRooms.filter(room => room.type === 'galley');
        const wardrooms = placedRooms.filter(room => room.type === 'diningroom');
        
        if (galleys.length > 0 && wardrooms.length > 0) {
            const distance = RoomsManager.calculateDistance(
                galleys.position, 
                wardrooms.position
            );
            
            if (distance <= 3.0) {
                results.factors.kitchenDining = 30;
                results.details.push('✅ Excellent kitchen-dining proximity');
            } else if (distance <= 6.0) {
                results.factors.kitchenDining = 20;
                results.details.push('👍 Good kitchen-dining proximity');
            } else {
                results.factors.kitchenDining = 10;
                results.details.push('⚠️ Kitchen and dining are distant');
            }
        } else {
            results.factors.kitchenDining = 0;
            results.details.push('❌ Missing kitchen or dining area');
        }
        
        // Exercise-hygiene proximity (25 points)
        const exerciseAreas = placedRooms.filter(room => room.type === 'exercise');
        const hygieneStations = placedRooms.filter(room => room.type === 'hygiene');
        
        if (exerciseAreas.length > 0 && hygieneStations.length > 0) {
            const minDistance = Math.min(
                ...exerciseAreas.map(exercise =>
                    Math.min(...hygieneStations.map(hygiene =>
                        RoomsManager.calculateDistance(exercise.position, hygiene.position)
                    ))
                )
            );
            
            if (minDistance <= 4.0) {
                results.factors.exerciseHygiene = 25;
                results.details.push('✅ Exercise area near hygiene facilities');
            } else {
                results.factors.exerciseHygiene = 15;
                results.details.push('⚠️ Exercise area distant from hygiene');
            }
        } else {
            results.factors.exerciseHygiene = 0;
        }
        
        // Work area accessibility (25 points)
        const workstations = placedRooms.filter(room => room.type === 'workstation');
        const crewQuarters = placedRooms.filter(room => room.type === 'crew_quarters');
        
        if (workstations.length > 0 && crewQuarters.length > 0) {
            const avgDistance = crewQuarters.reduce((sum, quarter) => {
                const minWorkDistance = Math.min(
                    ...workstations.map(work =>
                        RoomsManager.calculateDistance(quarter.position, work.position)
                    )
                );
                return sum + minWorkDistance;
            }, 0) / crewQuarters.length;
            
            if (avgDistance <= 8.0) {
                results.factors.workAccess = 25;
                results.details.push('✅ Work areas easily accessible from quarters');
            } else {
                results.factors.workAccess = 15;
                results.details.push('⚠️ Work areas distant from some quarters');
            }
        } else {
            results.factors.workAccess = 0;
        }
        
        // Traffic flow optimization (20 points)
        let flowScore = 20;
        
        // Check for central wardroom placement (social hub)
        if (wardrooms.length > 0) {
            const wardroom = wardrooms;
            const otherRooms = placedRooms.filter(room => room.type !== 'diningroom');
            
            if (otherRooms.length > 0) {
                const avgDistanceToWardroom = otherRooms.reduce((sum, room) => 
                    sum + RoomsManager.calculateDistance(wardroom.position, room.position), 0
                ) / otherRooms.length;
                
                if (avgDistanceToWardroom <= 6.0) {
                    results.details.push('✅ Dining room centrally located');
                } else {
                    flowScore -= 10;
                    results.details.push('⚠️ Dining room not centrally located');
                }
            }
        }
        
        results.factors.trafficFlow = flowScore;
        
        // Calculate total score
        results.score = Object.values(results.factors).reduce((sum, score) => sum + score, 0);
        
        return results;
    }
    
    /**
     * Calculate crew wellbeing score
     * @param {Array} placedRooms - Placed rooms array
     * @param {Object} missionConfig - Mission configuration
     * @returns {Object} Wellbeing score details
     */
    function calculateCrewWellbeing(placedRooms, missionConfig) {
        const results = {
            score: 0,
            maxScore: 100,
            factors: {},
            details: []
        };
        
        // Privacy considerations (30 points)
        const crewQuarters = placedRooms.filter(room => room.type === 'crew_quarters');
        if (crewQuarters.length >= missionConfig.crewSize) {
            results.factors.privacy = 30;
            results.details.push('✅ Adequate private sleeping quarters');
        } else {
            const ratio = crewQuarters.length / missionConfig.crewSize;
            results.factors.privacy = Math.max(5, 30 * ratio);
            results.details.push(`⚠️ Insufficient private quarters: ${crewQuarters.length}/${missionConfig.crewSize}`);
        }
        
        // Noise isolation (25 points)
        let noiseScore = 25;
        const exerciseAreas = placedRooms.filter(room => room.type === 'exercise');
        
        exerciseAreas.forEach(exercise => {
            crewQuarters.forEach(quarter => {
                const distance = RoomsManager.calculateDistance(exercise.position, quarter.position);
                if (distance < 3.0) {
                    noiseScore -= 8; // Penalty for noise proximity
                }
            });
        });
        
        results.factors.noiseIsolation = Math.max(0, noiseScore);
        if (noiseScore < 25) {
            results.details.push('⚠️ Exercise areas may disturb sleeping quarters');
        } else {
            results.details.push('✅ Good noise isolation for sleeping areas');
        }
        
        // Recreation and quality of life (25 points)
        const recreationRooms = placedRooms.filter(room => 
            ['recreation', 'greenhouse'].includes(room.type)
        );
        
        let qolScore = 10; // Base score for essentials
        if (recreationRooms.length > 0) {
            qolScore += 15;
            results.details.push('✅ Recreation facilities enhance quality of life');
        } else {
            results.details.push('💡 Consider adding recreation areas for crew morale');
        }
        
        results.factors.qualityOfLife = qolScore;
        
        // Social interaction facilitation (20 points)
        const socialAreas = placedRooms.filter(room => 
            ['diningdroom', 'recreation', 'galley'].includes(room.type)
        );
        
        if (socialAreas.length >= 2) {
            // Check if social areas are grouped together
            let socialGrouping = false;
            for (let i = 0; i < socialAreas.length - 1; i++) {
                for (let j = i + 1; j < socialAreas.length; j++) {
                    const distance = RoomsManager.calculateDistance(
                        socialAreas[i].position, 
                        socialAreas[j].position
                    );
                    if (distance <= 5.0) {
                        socialGrouping = true;
                        break;
                    }
                }
                if (socialGrouping) break;
            }
            
            results.factors.socialInteraction = socialGrouping ? 20 : 15;
            results.details.push(socialGrouping ? 
                '✅ Social areas well grouped' : 
                '👍 Multiple social areas available'
            );
        } else {
            results.factors.socialInteraction = 5;
            results.details.push('⚠️ Limited social interaction spaces');
        }
        
        // Calculate total score
        results.score = Object.values(results.factors).reduce((sum, score) => sum + score, 0);
        
        return results;
    }
    
    /**
     * Calculate resource optimization score
     * @param {Array} placedRooms - Placed rooms array
     * @param {Object} moduleDimensions - Module dimensions
     * @returns {Object} Resource optimization score details
     */
    function calculateResourceOptimization(placedRooms, moduleDimensions) {
        const results = {
            score: 0,
            maxScore: 100,
            factors: {},
            details: []
        };
        
        // Space utilization efficiency (40 points)
        const totalRoomArea = placedRooms.reduce((sum, room) => {
            const roomDef = RoomsManager.getRoomById(room.type);
            return sum + (roomDef ? roomDef.area : 0);
        }, 0);
        
        const moduleArea = moduleDimensions.width * moduleDimensions.length;
        const utilizationRatio = totalRoomArea / moduleArea;
        
        // Optimal utilization is around 70% (allows for corridors and systems)
        let utilizationScore;
        if (utilizationRatio >= 0.6 && utilizationRatio <= 0.75) {
            utilizationScore = 40; // Optimal range
        } else if (utilizationRatio >= 0.5 && utilizationRatio < 0.6) {
            utilizationScore = 30; // Good but underutilized
        } else if (utilizationRatio > 0.75 && utilizationRatio <= 0.85) {
            utilizationScore = 35; // Efficient but tight
        } else {
            utilizationScore = 20; // Suboptimal
        }
        
        results.factors.spaceUtilization = utilizationScore;
        results.details.push(`Space utilization: ${(utilizationRatio * 100).toFixed(1)}%`);
        
        // Storage accessibility (30 points)
        const storageRooms = placedRooms.filter(room => room.type === 'storage');
        if (storageRooms.length === 0) {
            results.factors.storageAccess = 0;
            results.details.push('❌ No storage areas provided');
        } else {
            // Check storage accessibility from key areas
            const keyAreas = placedRooms.filter(room => 
                ['galley', 'workstation', 'medical'].includes(room.type)
            );
            
            let accessibilityScore = 30;
            keyAreas.forEach(area => {
                const minStorageDistance = Math.min(
                    ...storageRooms.map(storage =>
                        RoomsManager.calculateDistance(area.position, storage.position)
                    )
                );
                
                if (minStorageDistance > 8.0) {
                    accessibilityScore -= 5; // Penalty for poor storage access
                }
            });
            
            results.factors.storageAccess = Math.max(10, accessibilityScore);
            results.details.push('Storage accessibility evaluated');
        }
        
        // Room size optimization (30 points)
        let sizingScore = 30;
        const oversizedRooms = placedRooms.filter(room => {
            const roomDef = RoomsManager.getRoomById(room.type);
            return roomDef && roomDef.volume > roomDef.volume * 1.5; // 50% oversized
        });
        
        if (oversizedRooms.length > 0) {
            sizingScore -= oversizedRooms.length * 5;
            results.details.push(`⚠️ ${oversizedRooms.length} rooms may be oversized`);
        } else {
            results.details.push('✅ Room sizes appear well-optimized');
        }
        
        results.factors.roomSizing = Math.max(15, sizingScore);
        
        // Calculate total score
        results.score = Object.values(results.factors).reduce((sum, score) => sum + score, 0);
        
        return results;
    }
    
    /**
     * Calculate comprehensive habitat score
     * @param {Array} placedRooms - Placed rooms array
     * @param {Object} missionConfig - Mission configuration
     * @param {Object} moduleDimensions - Module dimensions
     * @returns {Object} Complete scoring breakdown
     */
    function calculateTotalScore(placedRooms, missionConfig, moduleDimensions) {
        console.log('🏆 Calculating comprehensive habitat score...');
        
        const scores = {
            nasaCompliance: calculateNASACompliance(placedRooms, missionConfig),
            operationalEfficiency: calculateOperationalEfficiency(placedRooms),
            crewWellbeing: calculateCrewWellbeing(placedRooms, missionConfig),
            resourceOptimization: calculateResourceOptimization(placedRooms, moduleDimensions)
        };
        
        // Calculate weighted total score
        let totalScore = 0;
        let maxPossibleScore = 0;
        const categoryScores = {};
        
        Object.entries(SCORING_CATEGORIES).forEach(([category, config]) => {
            const categoryScore = scores[category];
            const weightedScore = (categoryScore.score / categoryScore.maxScore) * config.weight;
            
            categoryScores[category] = {
                raw: categoryScore.score,
                weighted: weightedScore,
                percentage: Math.round((categoryScore.score / categoryScore.maxScore) * 100),
                details: categoryScore.details,
                factors: categoryScore.factors
            };
            
            totalScore += weightedScore;
            maxPossibleScore += config.weight;
        });
        
        const finalPercentage = Math.round((totalScore / maxPossibleScore) * 100);
        
        const results = {
            totalScore: Math.round(totalScore),
            maxScore: maxPossibleScore,
            percentage: finalPercentage,
            grade: getGradeLetter(finalPercentage),
            categories: categoryScores,
            recommendations: generateRecommendations(categoryScores),
            timestamp: Date.now()
        };
        
        console.log('📊 Score calculation complete:', results.percentage + '%');
        return results;
    }
    
    /**
     * Convert percentage to letter grade
     * @param {number} percentage - Score percentage
     * @returns {string} Letter grade
     */
    function getGradeLetter(percentage) {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }
    
    /**
     * Generate improvement recommendations based on scores
     * @param {Object} categoryScores - Category score breakdown
     * @returns {Array} Array of recommendations
     */
    function generateRecommendations(categoryScores) {
        const recommendations = [];
        
        // NASA Compliance recommendations
        if (categoryScores.nasaCompliance.percentage < 80) {
            recommendations.push({
                category: 'NASA Compliance',
                priority: 'high',
                message: 'Focus on meeting essential NASA requirements first',
                actions: ['Add missing essential rooms', 'Increase habitable volume', 'Ensure adequate crew quarters']
            });
        }
        
        // Operational Efficiency recommendations
        if (categoryScores.operationalEfficiency.percentage < 70) {
            recommendations.push({
                category: 'Operations',
                priority: 'medium',
                message: 'Improve workflow efficiency between related areas',
                actions: ['Move kitchen closer to dining', 'Position exercise near hygiene', 'Centralize work areas']
            });
        }
        
        // Crew Wellbeing recommendations
        if (categoryScores.crewWellbeing.percentage < 75) {
            recommendations.push({
                category: 'Wellbeing',
                priority: 'medium',
                message: 'Enhance crew quality of life and privacy',
                actions: ['Ensure private quarters for all crew', 'Add recreation areas', 'Improve noise isolation']
            });
        }
        
        // Resource Optimization recommendations
        if (categoryScores.resourceOptimization.percentage < 70) {
            recommendations.push({
                category: 'Resources',
                priority: 'low',
                message: 'Optimize space usage and resource allocation',
                actions: ['Improve space utilization', 'Better storage placement', 'Optimize room sizes']
            });
        }
        
        return recommendations;
    }
    
    // Public API
    return {
        calculateTotalScore: calculateTotalScore,
        calculateNASACompliance: calculateNASACompliance,
        calculateOperationalEfficiency: calculateOperationalEfficiency,
        calculateCrewWellbeing: calculateCrewWellbeing,
        calculateResourceOptimization: calculateResourceOptimization,
        getGradeLetter: getGradeLetter,
        generateRecommendations: generateRecommendations,
        getScoringCategories: () => ({ ...SCORING_CATEGORIES })
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.ScoringSystem = ScoringSystem;
}

console.log('🏆 Scoring system loaded successfully');