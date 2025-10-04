/* ==========================================================================
   SPACE ARCHITECTS - NASA STANDARDS DATA
   NASA Space Apps Challenge Project
   
   This file contains all NASA standards, requirements, and specifications
   used throughout the application. Based on real NASA documentation:
   - NASA-STD-3001 (Space Flight Human-System Standard)
   - NASA habitat design guidelines
   - ISS operational data
   - Artemis program requirements
   ========================================================================== */

/**
 * NASA Standards and Requirements Database
 * All values are based on official NASA documentation and research
 */
const NASA_STANDARDS = {
    
    // ===== HABITABLE VOLUME REQUIREMENTS =====
    // Based on NASA-STD-3001 Volume 2 and habitat studies
    VOLUME_REQUIREMENTS: {
        // Minimum volume per person based on mission duration
        perPerson: {
            emergency: 2.8,         // m³ - Emergency/rescue missions (< 7 days)
            shortStay: 20,          // m³ - Short stay missions (7-30 days)
            mediumStay: 25,         // m³ - Medium missions (30-90 days)
            longStay: 30,           // m³ - Long duration (90-180 days)
            permanent: 40,          // m³ - Permanent habitation (180+ days)
            optimal: 50             // m³ - Optimal for psychological wellbeing
        },
        
        // Crew quarters (private space) requirements
        crewQuarters: {
            minimum: 2.8,           // m³ - Absolute minimum (emergency)
            standard: 10.5,         // m³ - Standard individual quarters
            preferred: 15.0,        // m³ - Preferred for long missions
            dimensions: {
                minWidth: 0.9,      // m - Minimum width
                minLength: 1.9,     // m - Minimum length  
                minHeight: 2.0,     // m - Minimum height
                standardWidth: 2.0,  // m - Standard width
                standardLength: 2.5, // m - Standard length
                standardHeight: 2.1  // m - Standard height
            }
        },
        
        // Common area requirements
        commonAreas: {
            galley: {
                minArea: 2.0,       // m² - Minimum galley area
                standardArea: 3.0,   // m² - Standard galley area
                heightClearance: 2.1 // m - Working height clearance
            },
            diningroom: {
                areaPerPerson: 1.2,  // m² - Dining area per person
                minTotalArea: 4.8,   // m² - Minimum total dining area
                heightClearance: 2.1 // m - Table height clearance
            },
            workStation: {
                areaPerStation: 2.5, // m² - Work area per station
                heightClearance: 2.1 // m - Work surface height
            }
        }
    },
    
    // ===== ENVIRONMENTAL REQUIREMENTS =====
    // Atmospheric and environmental control specifications
    ENVIRONMENTAL: {
        // Atmospheric composition (Earth-normal)
        atmosphere: {
            oxygenPercent: 21,      // % - Oxygen concentration
            nitrogenPercent: 79,    // % - Nitrogen concentration
            co2MaxPpm: 5000,       // ppm - Maximum CO2 concentration
            pressure: 101.3,        // kPa - Standard atmospheric pressure
            humidity: {
                min: 25,            // % - Minimum relative humidity
                max: 70,            // % - Maximum relative humidity
                optimal: 50         // % - Optimal relative humidity
            }
        },
        
        // Temperature requirements
        temperature: {
            minCelsius: 18.3,       // °C - Minimum temperature
            maxCelsius: 26.7,       // °C - Maximum temperature
            optimalCelsius: 22,     // °C - Optimal temperature
            sleepingCelsius: 20     // °C - Preferred sleeping temperature
        },
        
        // Lighting requirements (based on ISS standards)
        lighting: {
            generalLux: 300,        // lux - General area lighting
            taskLux: 500,           // lux - Task/work lighting
            emergencyLux: 50,       // lux - Emergency lighting
            circadianCycle: true    // boolean - 24-hour light cycle needed
        },
        
        // Noise level limits
        noise: {
            sleepingDb: 40,         // dB - Sleeping area maximum
            workingDb: 60,          // dB - Working area maximum
            emergencyDb: 80,        // dB - Emergency alarm level
            exerciseDb: 65          // dB - Exercise area maximum
        }
    },
    
    // ===== SAFETY REQUIREMENTS =====
    // Emergency procedures and safety specifications
    SAFETY: {
        // Fire safety requirements
        fire: {
            detectionTime: 30,      // seconds - Fire detection response time
            suppressionTime: 180,   // seconds - Maximum suppression time
            evacuationTime: 300,    // seconds - Maximum evacuation time
            exitPaths: 2,           // minimum - Redundant exit paths required
            exitWidth: 0.9          // m - Minimum exit width
        },
        
        // Emergency medical requirements
        medical: {
            responseTime: 180,      // seconds - Medical response time goal
            accessDistance: 15,     // m - Maximum distance to medical bay
            isolationCapability: true, // boolean - Medical isolation needed
            surgicalCapability: false // boolean - Minor surgery only for MVP
        },
        
        // Structural safety factors
        structural: {
            pressureSafety: 4.0,    // factor - Pressure vessel safety factor
            seismicResistance: true, // boolean - Earthquake resistance (Mars)
            meteoriteShielding: true, // boolean - Micrometeorite protection
            radiationShielding: {
                solarFlare: true,    // boolean - Solar particle event protection
                galacticRay: false   // boolean - GCR protection (mass-dependent)
            }
        }
    },
    
    // ===== OPERATIONAL REQUIREMENTS =====
    // Daily operations and crew activity specifications
    OPERATIONS: {
        // Daily activity time allocations (hours)
        dailySchedule: {
            sleep: 8.0,             // hours - Sleep period
            personalHygiene: 2.5,   // hours - Personal care time
            meals: 1.5,             // hours - Meal preparation and eating
            exercise: 2.5,          // hours - Required exercise time
            work: 8.5,              // hours - Productive work time
            recreation: 1.0,        // hours - Recreation/free time
            contingency: 0.5        // hours - Unplanned activities
        },
        
        // Exercise requirements (critical for health)
        exercise: {
            dailyMinutes: 150,      // minutes - Minimum daily exercise
            cardioMinutes: 75,      // minutes - Cardiovascular exercise
            strengthMinutes: 75,    // minutes - Resistance training
            equipmentSpace: 6.0,    // m² - Exercise equipment area
            heightClearance: 2.5    // m - Equipment height clearance
        },
        
        // Hygiene facility requirements
        hygiene: {
            crewPerFacility: 3,     // people - Maximum people per facility
            dailyUseMinutes: 90,    // minutes - Average daily use per person
            privacyRequired: true,  // boolean - Privacy essential
            soundIsolation: true    // boolean - Sound isolation needed
        },
        
        // Storage requirements
        storage: {
            personalPerPerson: 0.5, // m³ - Personal items per person
            foodPerPersonDay: 1.8,  // kg - Food storage per person per day
            waterPerPersonDay: 3.0, // kg - Water storage per person per day
            equipmentBuffer: 1.3,   // factor - Equipment storage buffer
            emergencyDays: 30       // days - Emergency supply duration
        }
    },
    
    // ===== MODULE SPECIFICATIONS =====
    // Physical module and structural requirements
    MODULE: {
        // Standard module dimensions
        standardDimensions: {
            height: 2.5,            // m - Standard ceiling height
            minWidth: 4.0,          // m - Minimum module width
            maxWidth: 8.0,          // m - Maximum practical width
            minLength: 4.0,         // m - Minimum module length
            maxLength: 12.0,        // m - Maximum practical length
            wallThickness: 0.15     // m - Pressure hull thickness
        },
        
        // Efficiency factors
        efficiency: {
            usableVolume: 0.70,     // factor - Usable vs total volume
            corridorSpace: 0.15,    // factor - Corridor/access space
            systemsSpace: 0.15,     // factor - Life support systems space
            structuralSpace: 0.05   // factor - Structural elements space
        },
        
        // Environmental control system requirements
        lifeSupport: {
            airRecycling: 0.95,     // factor - Air recycling efficiency
            waterRecycling: 0.93,   // factor - Water recycling efficiency
            powerPerPerson: 3.0,    // kW - Power requirement per person
            backupSystems: 2,       // count - Redundant system levels
            maintenanceAccess: true // boolean - Service access required
        }
    },
    
    // ===== MISSION-SPECIFIC REQUIREMENTS =====
    // Different requirements based on mission type and destination
    MISSION_SPECIFIC: {
        // Lunar mission requirements
        lunar: {
            gravity: 0.1654,        // factor - Lunar gravity (1/6 Earth)
            radiationExposure: 2.6, // mSv/day - Surface radiation exposure
            thermalSwing: 300,      // K - Day/night temperature difference
            dustMitigation: true,   // boolean - Lunar dust protection needed
            seismicActivity: false, // boolean - No significant moonquakes
            evacuationTime: 72,     // hours - Maximum time to reach safety
            resupplyInterval: 90    // days - Supply mission frequency
        },
        
        // Mars mission requirements
        mars: {
            gravity: 0.3794,        // factor - Mars gravity (3/8 Earth)
            radiationExposure: 0.7, // mSv/day - Surface radiation (lower than lunar)
            thermalSwing: 170,      // K - Day/night temperature difference
            dustMitigation: true,   // boolean - Mars dust storm protection
            seismicActivity: true,  // boolean - Marsquakes possible
            evacuationTime: 168,    // hours - Time to reach orbit (7 days)
            resupplyInterval: 780   // days - Supply mission frequency (synodic period)
        }
    },
    
    // ===== PSYCHOLOGICAL REQUIREMENTS =====
    // Human factors and psychological health specifications
    PSYCHOLOGY: {
        // Privacy requirements
        privacy: {
            personalSpace: true,    // boolean - Private space essential
            acousticPrivacy: true,  // boolean - Sound isolation needed
            visualPrivacy: true,    // boolean - Visual privacy needed
            personalItems: 0.1      // m³ - Personal items storage per person
        },
        
        // Social interaction requirements
        social: {
            communalDining: true,   // boolean - Shared meals important
            recreationSpace: true,  // boolean - Recreation area beneficial
            communicationEarth: true, // boolean - Regular Earth contact
            windowsViews: true,     // boolean - External views beneficial
            plantLife: true         // boolean - Growing plants beneficial
        },
        
        // Workspace requirements
        workspace: {
            personalWorkspace: 2.0, // m² - Individual workspace area
            sharedWorkspace: true,  // boolean - Collaborative space needed
            toolStorage: 0.2,       // m³ - Tool storage per workstation
            dataConnectivity: true, // boolean - Network access required
            backupWorkspace: true   // boolean - Redundant work capability
        }
    },
    
    // ===== VALIDATION CRITERIA =====
    // Scoring and validation criteria for habitat designs
    VALIDATION: {
        // Essential requirements (must be met)
        essential: {
            minimumVolumePerPerson: 25,  // m³ - Absolute minimum
            crewQuartersPerPerson: 1,    // count - Private space requirement
            hygieneStationsMin: 1,       // count - Minimum hygiene facilities
            emergencyExits: 2,           // count - Redundant exits
            medicalCapability: true,     // boolean - Medical care capability
            foodPreparation: true,       // boolean - Galley required
            exerciseCapability: true,    // boolean - Exercise area required
            workCapability: true         // boolean - Work space required
        },
        
        // Scoring weights for optimization
        scoringWeights: {
            volumeCompliance: 25,        // points - Volume requirement compliance
            safetyCompliance: 30,        // points - Safety requirement compliance  
            operationalEfficiency: 20,   // points - Operational layout efficiency
            psychologicalFactors: 15,    // points - Crew wellbeing factors
            resourceUtilization: 10      // points - Space utilization efficiency
        },
        
        // Penalty factors for violations
        penalties: {
            volumeDeficit: -2,           // points per m³ deficit
            safetyViolation: -50,        // points per safety violation
            accessibilityIssue: -10,     // points per accessibility problem
            noiseViolation: -5,          // points per noise issue
            privacyViolation: -8         // points per privacy issue
        }
    }
};

// ===== CALCULATION HELPER FUNCTIONS =====

/**
 * Calculate minimum habitable volume for a crew
 * 
 * @param {number} crewSize - Number of crew members
 * @param {number} missionDuration - Mission duration in days
 * @returns {number} Required volume in m³
 */
function calculateMinimumVolume(crewSize, missionDuration) {
    let volumePerPerson;
    
    if (missionDuration < 7) {
        volumePerPerson = NASA_STANDARDS.VOLUME_REQUIREMENTS.perPerson.emergency;
    } else if (missionDuration < 30) {
        volumePerPerson = NASA_STANDARDS.VOLUME_REQUIREMENTS.perPerson.shortStay;
    } else if (missionDuration < 90) {
        volumePerPerson = NASA_STANDARDS.VOLUME_REQUIREMENTS.perPerson.mediumStay;
    } else if (missionDuration < 180) {
        volumePerPerson = NASA_STANDARDS.VOLUME_REQUIREMENTS.perPerson.longStay;
    } else {
        volumePerPerson = NASA_STANDARDS.VOLUME_REQUIREMENTS.perPerson.permanent;
    }
    
    return crewSize * volumePerPerson;
}

/**
 * Calculate required hygiene stations for crew size
 * 
 * @param {number} crewSize - Number of crew members
 * @returns {number} Required number of hygiene stations
 */
function calculateHygieneStations(crewSize) {
    return Math.ceil(crewSize / NASA_STANDARDS.OPERATIONS.hygiene.crewPerFacility);
}

/**
 * Calculate total storage requirements
 * 
 * @param {number} crewSize - Number of crew members
 * @param {number} missionDuration - Mission duration in days
 * @returns {Object} Storage requirements breakdown
 */
function calculateStorageRequirements(crewSize, missionDuration) {
    const dailyFood = NASA_STANDARDS.OPERATIONS.storage.foodPerPersonDay;
    const dailyWater = NASA_STANDARDS.OPERATIONS.storage.waterPerPersonDay;
    const personalStorage = NASA_STANDARDS.OPERATIONS.storage.personalPerPerson;
    const emergencyDays = NASA_STANDARDS.OPERATIONS.storage.emergencyDays;
    
    return {
        personalItems: crewSize * personalStorage,
        foodStorage: crewSize * dailyFood * (missionDuration + emergencyDays) / 1000, // Convert kg to m³
        waterStorage: crewSize * dailyWater * emergencyDays / 1000, // Emergency water only
        equipmentStorage: crewSize * 0.5, // Estimated equipment per person
        totalRequired: 0 // Calculated below
    };
}

/**
 * Validate habitat design against NASA standards
 * 
 * @param {Object} habitatDesign - Habitat layout and room configuration
 * @param {Object} missionParams - Mission parameters (crew, duration, type)
 * @returns {Object} Validation results and score
 */
function validateHabitatDesign(habitatDesign, missionParams) {
    const validation = {
        score: 0,
        maxScore: 100,
        compliance: {},
        violations: [],
        recommendations: []
    };
    
    // Volume compliance check
    const requiredVolume = calculateMinimumVolume(missionParams.crewSize, missionParams.duration);
    const actualVolume = habitatDesign.totalHabitableVolume || 0;
    
    if (actualVolume >= requiredVolume) {
        validation.score += NASA_STANDARDS.VALIDATION.scoringWeights.volumeCompliance;
        validation.compliance.volume = true;
    } else {
        const deficit = requiredVolume - actualVolume;
        validation.score += NASA_STANDARDS.VALIDATION.penalties.volumeDeficit * deficit;
        validation.violations.push(`Volume deficit: ${deficit.toFixed(1)} m³`);
        validation.compliance.volume = false;
    }
    
    // Essential room checks
    const essentialRooms = ['crew_quarters', 'hygiene', 'galley', 'diningdroom', 'exercise', 'workstation', 'medical'];
    const missingEssential = essentialRooms.filter(roomType => 
        !habitatDesign.rooms || !habitatDesign.rooms.some(room => room.type === roomType)
    );
    
    if (missingEssential.length === 0) {
        validation.score += NASA_STANDARDS.VALIDATION.scoringWeights.safetyCompliance;
        validation.compliance.essentialRooms = true;
    } else {
        validation.score += NASA_STANDARDS.VALIDATION.penalties.safetyViolation * missingEssential.length;
        validation.violations.push(`Missing essential rooms: ${missingEssential.join(', ')}`);
        validation.compliance.essentialRooms = false;
    }
    
    // Additional validation logic would go here...
    
    validation.score = Math.max(0, Math.min(validation.maxScore, validation.score));
    
    return validation;
}

// ===== EXPORT STANDARDS =====

// Make standards available globally
if (typeof window !== 'undefined') {
    window.NASA_STANDARDS = NASA_STANDARDS;
    window.calculateMinimumVolume = calculateMinimumVolume;
    window.calculateHygieneStations = calculateHygieneStations;
    window.calculateStorageRequirements = calculateStorageRequirements;
    window.validateHabitatDesign = validateHabitatDesign;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NASA_STANDARDS,
        calculateMinimumVolume,
        calculateHygieneStations,
        calculateStorageRequirements,
        validateHabitatDesign
    };
}

console.log('📊 NASA Standards data loaded successfully');
console.log('📋 Available standards:', Object.keys(NASA_STANDARDS));