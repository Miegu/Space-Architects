/* ==========================================================================
   SPACE ARCHITECTS - ROOMS MODULE
   NASA Space Apps Challenge Project
   
   This module handles:
   - Room catalog definitions with NASA specifications
   - Room placement logic and validation
   - Room interaction behaviors
   - Category filtering and management
   - Educational tips and recommendations
   ========================================================================== */

/**
 * Room management system for the habitat designer
 * Contains all room types, their properties, and interaction logic
 */
const RoomsManager = (function() {
    'use strict';
    
    /**
     * Complete room catalog based on NASA standards
     * Each room includes dimensions, requirements, and behavioral properties
     */
    const ROOM_CATALOG = {
        // ===== ESSENTIAL ROOMS (Required for all missions) =====
        
        crew_quarters: {
            id: 'crew_quarters',
            name: 'Crew Quarters',
            category: 'essential',
            
            // Physical specifications (based on NASA-STD-3001)
            dimensions: { width: 2.0, length: 2.5, height: 2.5 },
            volume: 12.5,                    // m³ - calculated from dimensions
            area: 5.0,                       // m² - floor area
            
            // Functional properties
            capacity: 1,                     // Maximum occupancy
            privacy: 'high',                 // Privacy requirement level
            noiseLevel: 'quiet',            // Acceptable noise level
            lightingNeeds: 'adjustable',     // Lighting requirements
            
            // Visual properties
            color: '#4CAF50',               // Green - represents rest/sleep
            icon: '🛏️',
            iconAlt: 'bed',                 // Accessibility text
            
            // NASA requirements and constraints
            requirements: {
                essential: true,
                minDistance: {              // Minimum distance from other room types
                    exercise: 3.0,          // Away from noisy areas
                    galley: 2.0,           // Away from kitchen smells
                    hygiene: 1.0           // Close to bathroom access
                },
                maxDistance: {
                    hygiene: 8.0,          // Max distance to bathroom
                    medical: 12.0          // Emergency access requirement
                },
                adjacencyBonus: {          // Points for good placement
                    hygiene: 10,           // Bonus for being near bathroom
                    workstation: 5         // Small bonus for work proximity
                }
            },
            
            // Educational content
            description: 'Individual sleeping quarters providing privacy and rest space for crew members.',
            nasaFacts: [
                'ISS crew quarters are only 2.1m³ - much smaller than this design',
                'Private space reduces stress and improves crew psychological health',
                'Sound insulation is critical for quality sleep in space habitats'
            ],
            designTips: [
                'Place away from high-activity areas like exercise and galley',
                'Ensure quick access to hygiene facilities',
                'Consider orientation for privacy and noise reduction'
            ]
        },
        
        hygiene: {
            id: 'hygiene',
            name: 'Hygiene Station',
            category: 'essential',
            
            dimensions: { width: 1.2, length: 1.2, height: 2.5 },
            volume: 3.6,
            area: 1.44,
            
            capacity: 1,
            privacy: 'maximum',             // Highest privacy needs
            noiseLevel: 'moderate',
            lightingNeeds: 'bright',
            
            color: '#2196F3',               // Blue - water/cleanliness
            icon: '🚿',
            iconAlt: 'shower',
            
            requirements: {
                essential: true,
                multipleAllowed: true,       // Can have multiple hygiene stations
                ratioRequirement: {         // 1 station per 3 crew members max
                    crewPer: 3,
                    minRequired: 1
                },
                minDistance: {
                    galley: 2.0,            // Hygiene away from food prep
                    workstation: 1.0
                },
                maxDistance: {
                    crew_quarters: 8.0      // Accessible from all sleeping areas
                },
                adjacencyBonus: {
                    crew_quarters: 15,      // High bonus for bedroom proximity
                    medical: 8              // Medical station nearby is good
                }
            },
            
            description: 'Personal hygiene facilities including waste management and cleaning systems.',
            nasaFacts: [
                'Space toilets use airflow instead of gravity to function',
                'Water recycling systems can reclaim 93% of all water used',
                'Hygiene is critical for crew health and morale on long missions'
            ],
            designTips: [
                'Provide adequate privacy with sound insulation',
                'Place centrally for access from all sleeping quarters',
                'Consider ventilation and waste management system connections'
            ]
        },
        
        galley: {
            id: 'galley',
            name: 'Galley',
            category: 'essential',
            
            dimensions: { width: 2.0, length: 1.5, height: 2.5 },
            volume: 7.5,
            area: 3.0,
            
            capacity: 2,                    // 2 people can work simultaneously
            privacy: 'low',
            noiseLevel: 'moderate',         // Food prep creates noise
            lightingNeeds: 'bright',        // Task lighting needed
            
            color: '#FF9800',               // Orange - warmth/cooking
            icon: '🍳',
            iconAlt: 'cooking',
            
            requirements: {
                essential: true,
                minDistance: {
                    hygiene: 2.0,           // Food safety requirement
                    exercise: 2.0           // Avoid contamination from sweat
                },
                maxDistance: {
                    wardroom: 3.0,          // Should be very close to dining
                    storage: 5.0            // Close to food storage
                },
                adjacencyBonus: {
                    wardroom: 20,           // Major bonus for dining proximity
                    storage: 15,            // Storage access important
                    workstation: 5          // Can double as workspace
                }
            },
            
            description: 'Food preparation area with heating, storage, and cleaning facilities.',
            nasaFacts: [
                'ISS galley uses magnetized surfaces and velcro to secure items',
                'No open flames allowed - all heating is electric',
                'Food safety is critical in closed-loop life support systems'
            ],
            designTips: [
                'Place adjacent to wardroom for efficient meal service',
                'Ensure good ventilation to manage cooking odors',
                'Include adequate storage and prep surface area'
            ]
        },
        
        diningroom: {
            id: 'diningroom',
            name: 'diningroom',
            category: 'essential',
            
            dimensions: { width: 3.0, length: 2.0, height: 2.5 },
            volume: 12.6,
            area: 6.0,
            
            capacity: 4,                    // Whole crew can dine together
            privacy: 'low',                 // Social space
            noiseLevel: 'moderate',         // Conversation area
            lightingNeeds: 'comfortable',   // Social lighting
            
            color: '#FFC107',               // Yellow - social/gathering
            icon: '🍽️',
            iconAlt: 'dining',
            
            requirements: {
                essential: true,
                minSize: {                  // Must accommodate full crew
                    areaPerPerson: 1.5      // m² per person minimum
                },
                maxDistance: {
                    galley: 3.0,            // Close to kitchen
                    crew_quarters: 10.0     // Accessible from all quarters
                },
                adjacencyBonus: {
                    galley: 25,             // Highest bonus for kitchen proximity
                    workstation: 10,        // Can serve as meeting room
                    recreation: 15          // Social activities coordination
                }
            },
            
            description: 'Dining and social area where crew gathers for meals and meetings.',
            nasaFacts: [
                'Shared meals are crucial for crew morale and team cohesion',
                'The wardroom often serves as the social hub of the habitat',
                'Tables must secure items in low/zero gravity environments'
            ],
            designTips: [
                'Central location accessible to all crew quarters',
                'Adjacent to galley for easy meal service',
                'Design for flexibility - dining, meetings, recreation'
            ]
        },
        
        exercise: {
            id: 'exercise',
            name: 'Exercise Area',
            category: 'essential',
            
            dimensions: { width: 3.0, length: 2.0, height: 2.5 }, // Taller for equipment
            volume: 15.0,
            area: 6.0,
            
            capacity: 1,                    // Individual exercise
            privacy: 'medium',
            noiseLevel: 'high',             // Exercise creates noise/vibration
            lightingNeeds: 'bright',        // Task lighting for safety
            
            color: '#E91E63',               // Pink/Red - energy/fitness
            icon: '🏃',
            iconAlt: 'running',
            
            requirements: {
                essential: true,
                minDistance: {
                    crew_quarters: 3.0,     // Noise isolation
                    medical: 2.0,           // Safety - easy medical access
                    workstation: 2.0        // Noise/vibration isolation
                },
                maxDistance: {
                    medical: 8.0,           // Emergency medical access
                    hygiene: 6.0            // Post-exercise hygiene
                },
                adjacencyBonus: {
                    hygiene: 12,            // Shower after exercise
                    medical: 10,            // Safety consideration
                    storage: 8              // Equipment storage
                }
            },
            
            description: 'Physical fitness area with exercise equipment for crew health maintenance.',
            nasaFacts: [
                'Astronauts must exercise 2.5 hours daily to prevent muscle atrophy',
                'Exercise equipment must be designed for low/zero gravity',
                'Vibration isolation prevents equipment from shaking the habitat'
            ],
            designTips: [
                'Isolate from quiet areas to prevent noise disruption',
                'Ensure excellent ventilation for heat and humidity management',
                'Consider structural reinforcement for equipment mounting'
            ]
        },
        
        workstation: {
            id: 'workstation',
            name: 'Work Station',
            category: 'essential',
            
            dimensions: { width: 2.0, length: 1.5, height: 2.5 },
            volume: 7.5,
            area: 3.0,
            
            capacity: 2,                    // Can accommodate team work
            privacy: 'medium',
            noiseLevel: 'quiet',            // Concentration needed
            lightingNeeds: 'bright',        // Task lighting essential
            
            color: '#9C27B0',               // Purple - technology/science
            icon: '💻',
            iconAlt: 'computer',
            
            requirements: {
                essential: true,
                multipleAllowed: true,       // Can have multiple workstations
                minDistance: {
                    exercise: 2.0,          // Noise/vibration isolation
                    galley: 1.0             // Some separation from kitchen
                },
                maxDistance: {
                    storage: 5.0,           // Access to equipment/supplies
                    crew_quarters: 8.0      // Reasonable commute
                },
                adjacencyBonus: {
                    medical: 8,             // Science/medical work overlap
                    storage: 12,            // Equipment access
                    wardroom: 10            // Can serve as meeting room
                }
            },
            
            description: 'Research and operations workspace with computers and scientific equipment.',
            nasaFacts: [
                'Workstations must be designed for both individual and team activities',
                'All equipment must be secured to prevent floating in microgravity',
                'Ergonomics are crucial for long-duration missions'
            ],
            designTips: [
                'Provide excellent lighting for detailed work',
                'Ensure quiet environment for concentration',
                'Design for flexibility - different types of work activities'
            ]
        },
        
        medical: {
            id: 'medical',
            name: 'Medical Bay',
            category: 'essential',
            
            dimensions: { width: 2.0, length: 1.5, height: 2.5 },
            volume: 7.5,
            area: 3.0,
            
            capacity: 2,                    // Patient + caregiver
            privacy: 'high',                // Medical privacy important
            noiseLevel: 'quiet',
            lightingNeeds: 'bright',        // Medical procedures need good light
            
            color: '#F44336',               // Red - medical/emergency
            icon: '🏥',
            iconAlt: 'medical',
            
            requirements: {
                essential: true,
                centralAccess: true,        // Should be accessible from anywhere
                maxDistance: {
                    crew_quarters: 12.0,    // Emergency access from bedrooms
                    exercise: 8.0,          // Exercise injury response
                    workstation: 10.0       // Work-related injury access
                },
                adjacencyBonus: {
                    hygiene: 10,            // Medical hygiene needs
                    storage: 15,            // Medical supply storage
                    workstation: 8          // Research/medical data overlap
                }
            },
            
            description: 'Medical care facility with equipment for health monitoring and emergency treatment.',
            nasaFacts: [
                'Medical bay must handle everything from minor injuries to major surgery',
                'Telemedicine connections to Earth are critical for complex cases',
                'Medical privacy requirements apply even in small habitats'
            ],
            designTips: [
                'Central location for emergency access from all areas',
                'Ensure privacy and sound isolation for patient care',
                'Include storage for medical supplies and equipment'
            ]
        },
        
        storage: {
            id: 'storage',
            name: 'Storage',
            category: 'essential',
            
            dimensions: { width: 4.0, length: 2.0, height: 2.5 },
            volume: 20.0,
            area: 8.0,
            
            capacity: 0,                    // No occupancy - storage only
            privacy: 'low',
            noiseLevel: 'quiet',
            lightingNeeds: 'moderate',
            
            color: '#795548',               // Brown - storage/utility
            icon: '📦',
            iconAlt: 'storage box',
            
            requirements: {
                essential: true,
                distributedOK: true,        // Can be split into multiple areas
                maxDistance: {
                    galley: 5.0,            // Food storage access
                    workstation: 5.0,       // Equipment storage access
                    medical: 6.0            // Medical supply access
                },
                adjacencyBonus: {
                    galley: 15,             // Food storage
                    workstation: 12,        // Equipment storage
                    medical: 10,            // Medical supplies
                    exercise: 8             // Exercise equipment
                }
            },
            
            description: 'Storage areas for supplies, equipment, and personal items.',
            nasaFacts: [
                'Storage systems must secure items in microgravity environments',
                'Inventory management is critical for long-duration missions',
                'Different storage needs: food, equipment, personal, waste, emergency'
            ],
            designTips: [
                'Distribute storage throughout habitat for convenience',
                'Design different storage types for different needs',
                'Ensure easy access but secure containment'
            ]
        },
        
        // ===== OPTIONAL ROOMS (Enhance quality of life) =====
        
        recreation: {
            id: 'recreation',
            name: 'Recreation Area',
            category: 'optional',
            
            dimensions: { width: 2.5, length: 2.5, height: 2.5 },
            volume: 15.625,
            area: 6.25,
            
            capacity: 3,                    // Small group activities
            privacy: 'low',                 // Social space
            noiseLevel: 'moderate',
            lightingNeeds: 'adjustable',    // Different activities need different light
            
            color: '#00BCD4',               // Cyan - relaxation/fun
            icon: '🎮',
            iconAlt: 'gaming',
            
            requirements: {
                essential: false,
                luxuryScore: 15,            // Increases habitat quality score
                minDistance: {
                    medical: 2.0,           // Keep fun separate from medical
                    workstation: 1.0        // Some separation from work
                },
                adjacencyBonus: {
                    wardroom: 15,           // Social areas work well together
                    crew_quarters: 10,      // Easy access from bedrooms
                    storage: 8              // Recreation equipment storage
                }
            },
            
            description: 'Recreation area for crew relaxation, games, and social activities.',
            nasaFacts: [
                'Recreation is essential for psychological health on long missions',
                'Virtual reality systems can provide "Earth experiences"',
                'Social activities help maintain crew cohesion and morale'
            ],
            designTips: [
                'Design for multiple types of activities',
                'Consider noise impact on nearby quiet areas',
                'Include storage for recreational equipment and games'
            ]
        },
        
        greenhouse: {
            id: 'greenhouse',
            name: 'Greenhouse',
            category: 'optional',
            
            dimensions: { width: 3.0, length: 2.5, height: 2.5 }, // Taller for plants
            volume: 18.75,
            area: 7.5,
            
            capacity: 2,                    // Gardening team work
            privacy: 'low',
            noiseLevel: 'quiet',            // Peaceful environment
            lightingNeeds: 'specialized',   // Plant grow lights
            
            color: '#8BC34A',               // Light green - plants/growth
            icon: '🌱',
            iconAlt: 'plant',
            
            requirements: {
                essential: false,
                luxuryScore: 25,            // High psychological benefit
                specialRequirements: {
                    lighting: 'grow-lights', // Special lighting needs
                    ventilation: 'high',     // CO2/O2 management
                    water: 'irrigation'      // Water system connections
                },
                minDistance: {
                    exercise: 2.0,          // Protect plants from vibration
                    hygiene: 2.0            // Avoid contamination
                },
                adjacencyBonus: {
                    workstation: 12,        // Research/monitoring
                    galley: 10,             // Fresh food for cooking
                    storage: 8              // Gardening supplies
                }
            },
            
            description: 'Growing area for fresh food production and psychological benefits.',
            nasaFacts: [
                'Fresh food provides essential nutrients and improves crew morale',
                'Plants help with air purification and psychological health',
                'Growing food reduces dependence on Earth supply missions'
            ],
            designTips: [
                'Requires specialized lighting and ventilation systems',
                'Consider water management and drainage systems',
                'Position for easy maintenance and monitoring'
            ]
        },
        
        airlock: {
            id: 'airlock',
            name: 'Airlock/EVA Prep',
            category: 'essential',
            
            dimensions: { width: 2.5, length: 2.5, height: 2.5 },
            volume: 15.625,
            area: 6.25,
            
            capacity: 2,                    // EVA team preparation
            privacy: 'medium',
            noiseLevel: 'moderate',         // Equipment operation sounds
            lightingNeeds: 'bright',        // Safety lighting essential
            
            color: '#607D8B',               // Gray - technical/utilitarian
            icon: '🚪',
            iconAlt: 'airlock',
            
            requirements: {
                essential: true,            // Required for surface operations
                externalAccess: true,       // Must connect to habitat exterior
                minDistance: {
                    crew_quarters: 3.0,     // Noise from EVA prep
                    galley: 2.0,           // Avoid dust contamination
                    medical: 2.0            // Medical separation
                },
                maxDistance: {
                    storage: 4.0,          // EVA suit storage
                    medical: 8.0           // Emergency access
                },
                adjacencyBonus: {
                    storage: 20,           // EVA equipment storage
                    workstation: 12,       // EVA planning and communication
                    medical: 10            // Post-EVA medical checks
                }
            },
            
            description: 'Airlock and EVA preparation area for surface operations and emergencies.',
            nasaFacts: [
                'Airlocks prevent habitat atmosphere loss during EVAs',
                'EVA suit donning and doffing requires significant time and space',
                'Dust mitigation is critical on lunar and Mars missions'
            ],
            designTips: [
                'Design for suit storage, donning, and maintenance',
                'Include dust mitigation systems for planetary surfaces',
                'Ensure clear emergency access procedures'
            ]
        }
    };
    
    /**
     * Room categories for filtering and organization
     */
    const ROOM_CATEGORIES = {
        all: {
            name: 'All Rooms',
            description: 'Complete catalog of available rooms',
            filter: () => true
        },
        essential: {
            name: 'Essential',
            description: 'Required rooms for mission success',
            filter: (room) => room.category === 'essential'
        },
        optional: {
            name: 'Optional',
            description: 'Quality-of-life improvements',
            filter: (room) => room.category === 'optional'
        },
        habitation: {
            name: 'Living',
            description: 'Personal living spaces',
            filter: (room) => ['crew_quarters', 'hygiene', 'recreation'].includes(room.id)
        },
        operations: {
            name: 'Operations',
            description: 'Work and operational spaces',
            filter: (room) => ['workstation', 'medical', 'airlock', 'storage'].includes(room.id)
        },
        social: {
            name: 'Social',
            description: 'Shared social spaces',
            filter: (room) => ['galley', 'diningroom', 'recreation', 'exercise'].includes(room.id)
        }
    };
    
    /**
     * Educational tips that appear when rooms are placed near each other
     */
    const EDUCATIONAL_TIPS = [
        {
            trigger: ['galley', 'diningroom'],
            proximity: 3.0,                 // Trigger when within 3 meters
            title: 'Excellent Kitchen-Dining Layout! 🍳➡️🍽️',
            message: 'Placing the galley adjacent to the wardroom optimizes meal service efficiency and reduces food transport time. This follows NASA galley design principles used on the ISS.',
            points: 20,
            category: 'efficiency'
        },
        {
            trigger: ['exercise', 'hygiene'],
            proximity: 4.0,
            title: 'Smart Exercise-Hygiene Placement! 🏃➡️🚿',
            message: 'Positioning hygiene facilities near the exercise area allows crew to shower immediately after workouts, improving hygiene and preventing odor issues in the habitat.',
            points: 15,
            category: 'hygiene'
        },
        {
            trigger: ['crew_quarters', 'exercise'],
            proximity: 2.0,
            title: 'Consider Noise Impact 🛏️❌🏃',
            message: 'Exercise areas generate significant noise and vibration. Placing them too close to sleeping quarters may disrupt crew rest. Consider adding distance or sound insulation.',
            points: -10,
            category: 'noise'
        },
        {
            trigger: ['medical', 'storage'],
            proximity: 3.0,
            title: 'Medical Supply Access 🏥➡️📦',
            message: 'Excellent placement! Medical bays need quick access to medical supplies and emergency equipment. This layout enables efficient emergency response.',
            points: 12,
            category: 'safety'
        },
        {
            trigger: ['workstation', 'crew_quarters'],
            proximity: 5.0,
            title: 'Work-Life Balance 💻🏠',
            message: 'Good balance between work and personal spaces. Workstations should be accessible from crew quarters but not so close as to blur work-life boundaries.',
            points: 8,
            category: 'psychology'
        },
        {
            trigger: ['greenhouse', 'workstation'],
            proximity: 3.0,
            title: 'Research Integration 🌱➡️💻',
            message: 'Placing the greenhouse near work stations enables better monitoring of plant growth and research data collection. Great for agricultural research missions!',
            points: 15,
            category: 'research'
        },
        {
            trigger: ['airlock', 'medical'],
            proximity: 6.0,
            title: 'EVA Safety Protocol 🚪➡️🏥',
            message: 'Smart safety design! Medical bay access from the airlock enables immediate treatment of EVA-related injuries or health issues. Follows NASA safety protocols.',
            points: 18,
            category: 'safety'
        }
    ];
    
    /**
     * Get room definition by ID
     * 
     * @param {string} roomId - Room identifier
     * @returns {Object|null} Room definition or null if not found
     */
    function getRoomById(roomId) {
        return ROOM_CATALOG[roomId] || null;
    }
    
    /**
     * Get all rooms in a specific category
     * 
     * @param {string} category - Category name ('essential', 'optional', etc.)
     * @returns {Array} Array of room objects
     */
    function getRoomsByCategory(category) {
        const categoryFilter = ROOM_CATEGORIES[category];
        if (!categoryFilter) {
            console.error(`Unknown room category: ${category}`);
            return [];
        }
        
        return Object.values(ROOM_CATALOG).filter(categoryFilter.filter);
    }
    
    /**
     * Calculate space requirements for a given crew size
     * 
     * @param {number} crewSize - Number of crew members
     * @returns {Object} Required room quantities
     */
    function calculateRequiredRooms(crewSize) {
        const requirements = {
            crew_quarters: crewSize,            // 1 per person
            hygiene: Math.ceil(crewSize / 3),   // 1 per 3 people
            galley: 1,                          // 1 total
            diningroom: 1,                        // 1 total
            exercise: 1,                        // 1 total
            workstation: Math.ceil(crewSize / 2), // 1 per 2 people
            medical: 1,                         // 1 total
            storage: Math.max(1, Math.ceil(crewSize / 4)), // Scale with crew
            airlock: 1                          // 1 total
        };
        
        console.log(`📊 Room requirements for ${crewSize} crew:`, requirements);
        return requirements;
    }
    
    /**
     * Validate room placement based on NASA requirements
     * 
     * @param {string} roomId - Room being placed
     * @param {Object} position - Room position {x, y}
     * @param {Array} existingRooms - Currently placed rooms
     * @returns {Object} Validation result
     */
    function validateRoomPlacement(roomId, position, existingRooms) {
        const room = getRoomById(roomId);
        if (!room) {
            return { valid: false, reason: 'Unknown room type' };
        }
        
        const validation = {
            valid: true,
            warnings: [],
            errors: [],
            suggestions: [],
            score: 0
        };
        
        // Check minimum distance requirements
        if (room.requirements.minDistance) {
            Object.entries(room.requirements.minDistance).forEach(([otherRoomType, minDist]) => {
                const nearbyRooms = existingRooms.filter(r => r.type === otherRoomType);
                nearbyRooms.forEach(otherRoom => {
                    const distance = calculateDistance(position, otherRoom.position);
                    if (distance < minDist) {
                        validation.warnings.push(
                            `Too close to ${getRoomById(otherRoomType).name} (${distance.toFixed(1)}m < ${minDist}m required)`
                        );
                        validation.score -= 5;
                    }
                });
            });
        }
        
        // Check maximum distance requirements
        if (room.requirements.maxDistance) {
            Object.entries(room.requirements.maxDistance).forEach(([otherRoomType, maxDist]) => {
                const nearbyRooms = existingRooms.filter(r => r.type === otherRoomType);
                if (nearbyRooms.length > 0) {
                    const closestDistance = Math.min(
                        ...nearbyRooms.map(r => calculateDistance(position, r.position))
                    );
                    if (closestDistance > maxDist) {
                        validation.warnings.push(
                            `Too far from ${getRoomById(otherRoomType).name} (${closestDistance.toFixed(1)}m > ${maxDist}m maximum)`
                        );
                        validation.score -= 8;
                    }
                }
            });
        }
        
        // Calculate adjacency bonuses
        if (room.requirements.adjacencyBonus) {
            Object.entries(room.requirements.adjacencyBonus).forEach(([otherRoomType, bonus]) => {
                const nearbyRooms = existingRooms.filter(r => r.type === otherRoomType);
                nearbyRooms.forEach(otherRoom => {
                    const distance = calculateDistance(position, otherRoom.position);
                    if (distance <= 3.0) { // Adjacent bonus range
                        validation.score += bonus;
                        validation.suggestions.push(
                            `Great placement near ${getRoomById(otherRoomType).name}! (+${bonus} points)`
                        );
                    }
                });
            });
        }
        
        return validation;
    }
    
    /**
     * Calculate distance between two positions
     * 
     * @param {Object} pos1 - First position {x, y}
     * @param {Object} pos2 - Second position {x, y}
     * @returns {number} Distance in meters
     */
    function calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Check for educational tip triggers
     * 
     * @param {Array} placedRooms - Currently placed rooms
     * @returns {Array} Array of triggered tips
     */
    function checkEducationalTips(placedRooms) {
        const triggeredTips = [];
        
        EDUCATIONAL_TIPS.forEach(tip => {
            // Check if all required room types are present
            const hasAllRoomTypes = tip.trigger.every(roomType =>
                placedRooms.some(room => room.type === roomType)
            );
            
            if (hasAllRoomTypes) {
                // Check if rooms are within proximity range
                const relevantRooms = placedRooms.filter(room => 
                    tip.trigger.includes(room.type)
                );
                
                // For simplicity, check distance between first two matching rooms
                if (relevantRooms.length >= 2) {
                    const distance = calculateDistance(
                        relevantRooms.position,
                        relevantRooms.position
                    );
                    
                    if (distance <= tip.proximity) {
                        triggeredTips.push({
                            ...tip,
                            distance: distance,
                            rooms: relevantRooms
                        });
                    }
                }
            }
        });
        
        return triggeredTips;
    }
    
    /**
     * Generate room placement recommendations
     * 
     * @param {string} roomId - Room to place
     * @param {Array} existingRooms - Currently placed rooms
     * @param {Object} moduleDimensions - Available space dimensions
     * @returns {Array} Array of recommended positions
     */
    function getPlacementRecommendations(roomId, existingRooms, moduleDimensions) {
        const room = getRoomById(roomId);
        if (!room) return [];
        
        const recommendations = [];
        const gridSize = 0.5; // 0.5m grid
        
        // Generate potential positions on grid
        for (let x = 0; x <= moduleDimensions.width - room.dimensions.width; x += gridSize) {
            for (let y = 0; y <= moduleDimensions.length - room.dimensions.length; y += gridSize) {
                const position = { x, y };
                
                // Check if position overlaps with existing rooms
                const overlaps = existingRooms.some(existingRoom => {
                    const existing = getRoomById(existingRoom.type);
                    return checkRoomOverlap(
                        { ...position, ...room.dimensions },
                        { ...existingRoom.position, ...existing.dimensions }
                    );
                });
                
                if (!overlaps) {
                    const validation = validateRoomPlacement(roomId, position, existingRooms);
                    
                    if (validation.score > 0) { // Only recommend positive-score positions
                        recommendations.push({
                            position,
                            score: validation.score,
                            reasons: validation.suggestions
                        });
                    }
                }
            }
        }
        
        // Sort by score (highest first) and return top recommendations
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Top 5 recommendations
    }
    
    /**
     * Check if two rooms overlap
     * 
     * @param {Object} room1 - First room {x, y, width, length}
     * @param {Object} room2 - Second room {x, y, width, length}
     * @returns {boolean} True if rooms overlap
     */
    function checkRoomOverlap(room1, room2) {
        return !(
            room1.x + room1.width <= room2.x ||    // room1 is to the left of room2
            room2.x + room2.width <= room1.x ||    // room2 is to the left of room1
            room1.y + room1.length <= room2.y ||   // room1 is above room2
            room2.y + room2.length <= room1.y      // room2 is above room1
        );
    }
    
    // Public API
    return {
        // Data access
        getRoomCatalog: () => ({ ...ROOM_CATALOG }),
        getRoomById: getRoomById,
        getRoomsByCategory: getRoomsByCategory,
        getCategories: () => ({ ...ROOM_CATEGORIES }),
        
        // Calculations
        calculateRequiredRooms: calculateRequiredRooms,
        validateRoomPlacement: validateRoomPlacement,
        calculateDistance: calculateDistance,
        
        // Educational features
        checkEducationalTips: checkEducationalTips,
        getPlacementRecommendations: getPlacementRecommendations,
        
        // Utility functions
        checkRoomOverlap: checkRoomOverlap
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoomsManager;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.RoomsManager = RoomsManager;
}

console.log('🏠 Rooms module loaded successfully');