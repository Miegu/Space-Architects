/*
================================================================================
SPACE ARCHITECTS - ROOM EDITOR JAVASCRIPT MODULE
NASA Space Apps Challenge Project

This module handles the room layout editor (Page 4):
- Integration with previous page data (config + structure)
- Drag and drop room placement functionality  
- Real-time NASA standards validation
- Grid-based layout system
- Navigation to completion

Integrates with your existing modules:
- SpaceArchitects (main app)
- MissionConfig (configuration data)
- StructurePage (structure selections)
================================================================================
*/

/**
 * Room Editor Module - Integrates with existing Space Architects flow
 * This is the 4th and final page in the design process
 */
const HabitatEditor = (function() {
    'use strict';

    // Editor state management
    let editorState = {
        // Data from previous pages
        missionConfig: null,
        structureConfig: null,
        
        // Room placement data
        placedRooms: new Map(),
        
        // Canvas and interaction state
        canvas: null,
        isDragging: false,
        dragElement: null,
        
        // Validation state
        validationResults: {},
        complianceScore: 0
    };

    // Room specifications database (matching your NASA standards)
    const ROOM_CATALOG = {
        airlock: {
            id: 'airlock',
            name: 'Airlock',
            icon: '🚪',
            description: 'Entry/exit with spacesuit storage',
            area: 10, // m²
            dimensions: { width: 2.5, length: 4, height: 2.5 },
            type: 'essential',
            category: 'utility',
            noiseLevel: 'low',
            color: '#4A9EFF'
        },
        'life-support': {
            id: 'life-support',
            name: 'Life Support',
            icon: '🔄',
            description: 'ECLSS core, waste management',
            area: 10,
            dimensions: { width: 2.5, length: 4, height: 2.5 },
            type: 'essential',
            category: 'utility',
            noiseLevel: 'medium',
            color: '#FF9800'
        },
        sleeping: {
            id: 'sleeping',
            name: 'Sleeping Quarters',
            icon: '🛏️',
            description: 'Individual soundproof quarters',
            area: 6,
            dimensions: { width: 2, length: 3, height: 2.5 },
            type: 'essential',
            category: 'personal',
            noiseLevel: 'low',
            color: '#4CAF50'
        },
        kitchen: {
            id: 'kitchen',
            name: 'Kitchen/Dining',
            icon: '🍽️',
            description: 'Food prep and eating area',
            area: 10,
            dimensions: { width: 2.5, length: 4, height: 2.5 },
            type: 'essential',
            category: 'social',
            noiseLevel: 'low',
            color: '#FFC107'
        },
        hygiene: {
            id: 'hygiene',
            name: 'Hygiene',
            icon: '🚿',
            description: 'Toilet, shower, sink facilities',
            area: 6,
            dimensions: { width: 2, length: 3, height: 2.5 },
            type: 'essential',
            category: 'personal',
            noiseLevel: 'low',
            color: '#2196F3'
        },
        medical: {
            id: 'medical',
            name: 'Medical',
            icon: '🏥',
            description: 'Basic medical care station',
            area: 10,
            dimensions: { width: 2.5, length: 4, height: 2.5 },
            type: 'essential',
            category: 'utility',
            noiseLevel: 'low',
            color: '#F44336'
        },
        gym: {
            id: 'gym',
            name: 'Gym',
            icon: '💪',
            description: 'Exercise equipment area',
            area: 10,
            dimensions: { width: 2.5, length: 4, height: 2.5 },
            type: 'required',
            category: 'health',
            noiseLevel: 'high',
            color: '#E91E63'
        },
        maintenance: {
            id: 'maintenance',
            name: 'Maintenance',
            icon: '🔧',
            description: 'Tools and mission planning',
            area: 10,
            dimensions: { width: 2.5, length: 4, height: 2.5 },
            type: 'required',
            category: 'work',
            noiseLevel: 'medium',
            color: '#9C27B0'
        },
        storage: {
            id: 'storage',
            name: 'Storage',
            icon: '📦',
            description: 'Additional storage space',
            area: 6,
            dimensions: { width: 2, length: 3, height: 2.5 },
            type: 'optional',
            category: 'utility',
            noiseLevel: 'low',
            color: '#795548'
        },
        laboratory: {
            id: 'laboratory',
            name: 'Laboratory',
            icon: '🔬',
            description: 'Experiments and research',
            area: 10,
            dimensions: { width: 2.5, length: 4, height: 2.5 },
            type: 'optional',
            category: 'work',
            noiseLevel: 'low',
            color: '#607D8B'
        },
        greenhouse: {
            id: 'greenhouse',
            name: 'Greenhouse',
            icon: '🌱',
            description: 'Plant growth, oxygen generation',
            area: 10,
            dimensions: { width: 2.5, length: 4, height: 2.5 },
            type: 'optional',
            category: 'health',
            noiseLevel: 'low',
            color: '#4CAF50'
        }
    };

    // Grid scale (pixels per meter)
    const GRID_SCALE = 20; // 20px = 1m

    /**
     * Initialize the habitat editor
     */
    function initialize() {
        console.log('🎨 Initializing Habitat Editor...');

        // Load data from previous pages
        if (!loadPreviousPageData()) {
            handleMissingData();
            return false;
        }

        // Initialize UI components
        setupCanvas();
        setupDragAndDrop();
        setupValidation();
        setupNavigation();
        setupControls();

        // Update displays with loaded data
        updateMissionInfoDisplay();
        updateCanvasForStructure();
        
        // Initial validation
        validateCurrentLayout();

        console.log('✅ Habitat Editor initialized successfully');
        return true;
    }

    /**
     * Load configuration and structure data from previous pages
     */
    function loadPreviousPageData() {
        console.log('📂 Loading data from previous pages...');

        // Load mission configuration
        if (typeof MissionConfig !== 'undefined') {
            editorState.missionConfig = MissionConfig.getCurrentConfig();
            console.log('✅ Mission config loaded:', editorState.missionConfig);
        } else {
            console.warn('⚠️ MissionConfig not available');
            return false;
        }

        // Load structure configuration  
        if (typeof StructurePage !== 'undefined') {
            editorState.structureConfig = StructurePage.getStructureState();
            console.log('✅ Structure config loaded:', editorState.structureConfig);
        } else {
            console.warn('⚠️ StructurePage not available');
            return false;
        }

        // Load any saved room layout
        loadSavedRoomLayout();

        return true;
    }

    /**
     * Handle case where required data is missing
     */
    function handleMissingData() {
        console.error('❌ Required configuration data missing');
        
        const message = 'Configuration data missing. Please start from the beginning.';
        if (confirm(message + '\n\nReturn to welcome page?')) {
            if (typeof SpaceArchitects !== 'undefined') {
                SpaceArchitects.showPage('welcome');
            } else {
                window.location.reload();
            }
        }
    }

    /**
     * Setup canvas and grid system
     */
    function setupCanvas() {
        editorState.canvas = document.getElementById('habitat-canvas');
        
        if (!editorState.canvas) {
            console.error('❌ Canvas element not found');
            return;
        }

        // Setup grid toggle
        const gridToggle = document.getElementById('grid-toggle');
        if (gridToggle) {
            gridToggle.addEventListener('change', function() {
                editorState.canvas.classList.toggle('show-grid', this.checked);
            });
        }

        console.log('🖼️ Canvas initialized');
    }

    /**
     * Setup drag and drop functionality
     */
    function setupDragAndDrop() {
        // Make room items draggable
        const roomItems = document.querySelectorAll('.room-item');
        roomItems.forEach(item => {
            setupRoomItemDrag(item);
        });

        // Setup canvas drop zone
        if (editorState.canvas) {
            setupCanvasDropZone(editorState.canvas);
        }

        console.log('🎯 Drag and drop initialized');
    }

    /**
     * Setup drag functionality for a room item
     */
    function setupRoomItemDrag(roomItem) {
        roomItem.addEventListener('dragstart', function(e) {
            const roomId = this.dataset.roomId;
            const roomData = ROOM_CATALOG[roomId];
            
            if (!roomData) return;

            // Store drag data
            e.dataTransfer.setData('text/plain', roomId);
            e.dataTransfer.effectAllowed = 'copy';

            // Visual feedback
            this.classList.add('dragging');
            editorState.isDragging = true;
            editorState.dragElement = roomData;

            console.log('🎯 Started dragging:', roomData.name);
        });

        roomItem.addEventListener('dragend', function(e) {
            // Clean up visual feedback
            this.classList.remove('dragging');
            editorState.isDragging = false;
            editorState.dragElement = null;
        });
    }

    /**
     * Setup canvas as drop zone
     */
    function setupCanvasDropZone(canvas) {
        canvas.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            // Show drop feedback
            canvas.classList.add('dragging-over');
        });

        canvas.addEventListener('dragleave', function(e) {
            // Remove drop feedback
            canvas.classList.remove('dragging-over');
        });

        canvas.addEventListener('drop', function(e) {
            e.preventDefault();
            canvas.classList.remove('dragging-over');

            const roomId = e.dataTransfer.getData('text/plain');
            const roomData = ROOM_CATALOG[roomId];
            
            if (!roomData) return;

            // Calculate drop position relative to canvas
            const canvasRect = canvas.getBoundingClientRect();
            const x = e.clientX - canvasRect.left;
            const y = e.clientY - canvasRect.top;

            // Place room at drop position
            placeRoom(roomId, x, y);
        });
    }

    /**
     * Place a room on the canvas at specified coordinates
     */
    function placeRoom(roomId, x, y) {
        const roomData = ROOM_CATALOG[roomId];
        if (!roomData) return;

        // Snap to grid
        const gridX = Math.round(x / GRID_SCALE) * GRID_SCALE;
        const gridY = Math.round(y / GRID_SCALE) * GRID_SCALE;

        // Calculate room size in pixels
        const roomWidth = roomData.dimensions.width * GRID_SCALE;
        const roomHeight = roomData.dimensions.length * GRID_SCALE;

        // Check if position is valid
        if (!isValidPlacement(gridX, gridY, roomWidth, roomHeight)) {
            console.warn('❌ Invalid room placement');
            return;
        }

        // Create unique room instance ID
        const roomInstanceId = `${roomId}_${Date.now()}`;

        // Create room element
        const roomElement = createRoomElement(roomInstanceId, roomData, gridX, gridY, roomWidth, roomHeight);
        
        // Add to canvas
        const placedRoomsContainer = document.getElementById('placed-rooms');
        if (placedRoomsContainer) {
            placedRoomsContainer.appendChild(roomElement);
        }

        // Store in state
        editorState.placedRooms.set(roomInstanceId, {
            id: roomInstanceId,
            roomType: roomId,
            roomData: roomData,
            position: { x: gridX, y: gridY },
            dimensions: { width: roomWidth, height: roomHeight },
            element: roomElement
        });

        // Update displays and validation
        updateCanvasInfo();
        validateCurrentLayout();
        saveRoomLayout();

        console.log('✅ Room placed:', roomData.name, 'at', gridX, gridY);
    }

    /**
     * Check if room placement is valid
     */
    function isValidPlacement(x, y, width, height) {
        // Get canvas bounds
        const canvas = editorState.canvas;
        if (!canvas) return false;

        const canvasRect = canvas.getBoundingClientRect();
        
        // Check bounds
        if (x < 0 || y < 0) return false;
        if (x + width > canvasRect.width || y + height > canvasRect.height) return false;

        // Check for overlaps with existing rooms
        for (const [instanceId, roomInstance] of editorState.placedRooms) {
            if (isOverlapping(
                x, y, width, height,
                roomInstance.position.x, roomInstance.position.y,
                roomInstance.dimensions.width, roomInstance.dimensions.height
            )) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if two rectangles overlap
     */
    function isOverlapping(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }

    /**
     * Create room element for canvas
     */
    function createRoomElement(instanceId, roomData, x, y, width, height) {
        const roomElement = document.createElement('div');
        roomElement.className = 'placed-room';
        roomElement.dataset.roomId = instanceId;
        roomElement.dataset.roomType = roomData.id;
        
        roomElement.style.left = x + 'px';
        roomElement.style.top = y + 'px';
        roomElement.style.width = width + 'px';
        roomElement.style.height = height + 'px';
        roomElement.style.backgroundColor = roomData.color;

        roomElement.innerHTML = `
            <div class="room-icon">${roomData.icon}</div>
            <div class="room-name">${roomData.name}</div>
        `;

        // Add double-click to remove
        roomElement.addEventListener('dblclick', function() {
            removeRoom(instanceId);
        });

        // Add context menu for options
        roomElement.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showRoomContextMenu(e, instanceId);
        });

        return roomElement;
    }

    /**
     * Remove a room from the canvas
     */
    function removeRoom(instanceId) {
        const roomInstance = editorState.placedRooms.get(instanceId);
        if (!roomInstance) return;

        // Remove element from DOM
        if (roomInstance.element && roomInstance.element.parentNode) {
            roomInstance.element.parentNode.removeChild(roomInstance.element);
        }

        // Remove from state
        editorState.placedRooms.delete(instanceId);

        // Update displays
        updateCanvasInfo();
        validateCurrentLayout();
        saveRoomLayout();

        console.log('🗑️ Room removed:', roomInstance.roomData.name);
    }

    /**
     * Setup validation system
     */
    function setupValidation() {
        // Initial validation
        validateCurrentLayout();
        console.log('✅ Validation system initialized');
    }

    /**
     * Validate current room layout against NASA standards
     */
    function validateCurrentLayout() {
        const validation = {
            volumeCompliance: checkVolumeCompliance(),
            essentialRooms: checkEssentialRooms(),
            noiseSeparation: checkNoiseSeparation(),
            adjacencyRules: checkAdjacencyRules()
        };

        // Calculate overall compliance score
        const checks = Object.values(validation);
        const passedChecks = checks.filter(check => check.status === 'pass').length;
        const score = Math.round((passedChecks / checks.length) * 100);

        editorState.validationResults = validation;
        editorState.complianceScore = score;

        // Update UI
        updateValidationDisplay();
        updateNavigationState();

        return validation;
    }

    /**
     * Check volume compliance
     */
    function checkVolumeCompliance() {
        const config = editorState.missionConfig;
        if (!config) return { status: 'error', message: 'No config data' };

        // Calculate total volume from placed rooms
        let totalVolume = 0;
        for (const [instanceId, roomInstance] of editorState.placedRooms) {
            totalVolume += roomInstance.roomData.area * roomInstance.roomData.dimensions.height;
        }

        // Get required volume (using NASA standards)
        const requiredVolumePerPerson = getRequiredVolumePerPerson(config.duration);
        const totalRequiredVolume = config.crewSize * requiredVolumePerPerson;
        
        // Apply habitable volume efficiency (70%)
        const habitableVolume = totalVolume * 0.7;
        const volumePerPerson = habitableVolume / config.crewSize;

        const isCompliant = volumePerPerson >= requiredVolumePerPerson;

        return {
            status: isCompliant ? 'pass' : 'fail',
            currentVolume: volumePerPerson,
            requiredVolume: requiredVolumePerPerson,
            message: `${Math.round(volumePerPerson)} / ${requiredVolumePerPerson} m³ per person`
        };
    }

    /**
     * Check essential rooms are present
     */
    function checkEssentialRooms() {
        const essentialRooms = ['airlock', 'life-support', 'sleeping', 'kitchen', 'hygiene', 'medical'];
        const placedRoomTypes = new Set();

        // Count placed essential rooms
        for (const [instanceId, roomInstance] of editorState.placedRooms) {
            if (essentialRooms.includes(roomInstance.roomType)) {
                placedRoomTypes.add(roomInstance.roomType);
            }
        }

        const isCompliant = essentialRooms.every(roomType => placedRoomTypes.has(roomType));
        
        return {
            status: isCompliant ? 'pass' : 'fail',
            current: placedRoomTypes.size,
            required: essentialRooms.length,
            message: `${placedRoomTypes.size} / ${essentialRooms.length} essential rooms`
        };
    }

    /**
     * Check noise separation rules
     */
    function checkNoiseSeparation() {
        const noisyRooms = ['gym', 'maintenance'];
        const quietRooms = ['sleeping'];

        const noisyRoomInstances = [];
        const quietRoomInstances = [];

        // Categorize placed rooms
        for (const [instanceId, roomInstance] of editorState.placedRooms) {
            if (noisyRooms.includes(roomInstance.roomType)) {
                noisyRoomInstances.push(roomInstance);
            } else if (quietRooms.includes(roomInstance.roomType)) {
                quietRoomInstances.push(roomInstance);
            }
        }

        // Check separation (minimum distance)
        let hasViolation = false;
        const minimumSeparation = 2 * GRID_SCALE; // 2 meters

        for (const noisyRoom of noisyRoomInstances) {
            for (const quietRoom of quietRoomInstances) {
                const distance = calculateDistance(
                    noisyRoom.position.x + noisyRoom.dimensions.width / 2,
                    noisyRoom.position.y + noisyRoom.dimensions.height / 2,
                    quietRoom.position.x + quietRoom.dimensions.width / 2,
                    quietRoom.position.y + quietRoom.dimensions.height / 2
                );

                if (distance < minimumSeparation) {
                    hasViolation = true;
                    break;
                }
            }
            if (hasViolation) break;
        }

        return {
            status: hasViolation ? 'fail' : 'pass',
            message: hasViolation ? 'Noisy rooms too close to sleeping areas' : 'Noise separation compliant'
        };
    }

    /**
     * Check room adjacency rules (kitchen and bathroom not adjacent)
     */
    function checkAdjacencyRules() {
        const kitchenInstances = [];
        const bathroomInstances = [];

        // Find kitchen and hygiene rooms
        for (const [instanceId, roomInstance] of editorState.placedRooms) {
            if (roomInstance.roomType === 'kitchen') {
                kitchenInstances.push(roomInstance);
            } else if (roomInstance.roomType === 'hygiene') {
                bathroomInstances.push(roomInstance);
            }
        }

        // Check adjacency
        let hasViolation = false;
        
        for (const kitchen of kitchenInstances) {
            for (const bathroom of bathroomInstances) {
                if (areAdjacent(kitchen, bathroom)) {
                    hasViolation = true;
                    break;
                }
            }
            if (hasViolation) break;
        }

        return {
            status: hasViolation ? 'fail' : 'pass',
            message: hasViolation ? 'Kitchen and hygiene are adjacent' : 'Room adjacency compliant'
        };
    }

    /**
     * Calculate distance between two points
     */
    function calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    /**
     * Check if two rooms are adjacent
     */
    function areAdjacent(room1, room2) {
        const buffer = 5; // Small buffer for floating point precision

        // Check if rooms share an edge
        const room1Right = room1.position.x + room1.dimensions.width;
        const room1Bottom = room1.position.y + room1.dimensions.height;
        const room2Right = room2.position.x + room2.dimensions.width;
        const room2Bottom = room2.position.y + room2.dimensions.height;

        // Check horizontal adjacency
        const horizontalAdjacent = (
            Math.abs(room1Right - room2.position.x) <= buffer ||
            Math.abs(room2Right - room1.position.x) <= buffer
        ) && !(
            room1Bottom <= room2.position.y || 
            room2Bottom <= room1.position.y
        );

        // Check vertical adjacency  
        const verticalAdjacent = (
            Math.abs(room1Bottom - room2.position.y) <= buffer ||
            Math.abs(room2Bottom - room1.position.y) <= buffer
        ) && !(
            room1Right <= room2.position.x || 
            room2Right <= room1.position.x
        );

        return horizontalAdjacent || verticalAdjacent;
    }

    /**
     * Get required volume per person based on mission duration
     */
    function getRequiredVolumePerPerson(duration) {
        if (duration <= 30) return 20;    // Short missions
        if (duration <= 90) return 25;    // Medium missions  
        if (duration <= 180) return 30;   // Long missions
        return 40; // Permanent habitation
    }

    /**
     * Update validation display in UI
     */
    function updateValidationDisplay() {
        const results = editorState.validationResults;

        // Volume compliance
        if (results.volumeCompliance) {
            updateValidationItem('volume-status', 'volume-per-person-value', results.volumeCompliance);
        }

        // Essential rooms
        if (results.essentialRooms) {
            updateValidationItem('essential-rooms-status', 'essential-rooms-value', results.essentialRooms);
        }

        // Noise separation
        if (results.noiseSeparation) {
            updateValidationItem('noise-separation-status', 'noise-separation-value', results.noiseSeparation);
        }

        // Adjacency rules
        if (results.adjacencyRules) {
            updateValidationItem('adjacency-status', 'adjacency-value', results.adjacencyRules);
        }

        // Overall score
        updateElement('compliance-score-number', editorState.complianceScore);
        
        const progressBar = document.getElementById('compliance-progress');
        if (progressBar) {
            progressBar.style.width = editorState.complianceScore + '%';
        }
    }

    /**
     * Update individual validation item
     */
    function updateValidationItem(statusId, valueId, result) {
        const statusElement = document.getElementById(statusId);
        const valueElement = document.getElementById(valueId);

        if (statusElement) {
            statusElement.className = `req-status ${result.status === 'pass' ? 'green' : 'red'}`;
        }

        if (valueElement) {
            valueElement.textContent = result.message || 'Checking...';
        }
    }

    /**
     * Setup navigation buttons
     */
    function setupNavigation() {
        // Back to structure button
        const backBtn = document.getElementById('back-to-structure-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                // Save current layout before leaving
                saveRoomLayout();

                // Navigate back
                if (typeof SpaceArchitects !== 'undefined') {
                    SpaceArchitects.showPage('structure');
                }
            });
        }

        // Complete design button
        const completeBtn = document.getElementById('complete-design-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', function() {
                handleCompleteDesign();
            });
        }

        console.log('🧭 Navigation initialized');
    }

    /**
     * Setup control buttons
     */
    function setupControls() {
        // Clear all button
        const clearBtn = document.getElementById('clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                if (confirm('Remove all rooms from the layout?')) {
                    clearAllRooms();
                }
            });
        }

        // Auto layout button
        const autoBtn = document.getElementById('auto-layout-btn');
        if (autoBtn) {
            autoBtn.addEventListener('click', function() {
                generateAutoLayout();
            });
        }

        // Room category filters
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                filterRoomsByCategory(category);
                
                // Update active state
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        console.log('🎛️ Controls initialized');
    }

    /**
     * Clear all placed rooms
     */
    function clearAllRooms() {
        // Remove all room elements
        for (const [instanceId, roomInstance] of editorState.placedRooms) {
            if (roomInstance.element && roomInstance.element.parentNode) {
                roomInstance.element.parentNode.removeChild(roomInstance.element);
            }
        }

        // Clear state
        editorState.placedRooms.clear();

        // Update displays
        updateCanvasInfo();
        validateCurrentLayout();
        saveRoomLayout();

        console.log('🧹 All rooms cleared');
    }

    /**
     * Generate automatic room layout
     */
    function generateAutoLayout() {
        console.log('🤖 Generating auto layout...');

        // Clear existing rooms
        clearAllRooms();

        // Get essential rooms for the mission
        const essentialRooms = ['airlock', 'life-support', 'sleeping', 'kitchen', 'hygiene', 'medical'];
        const config = editorState.missionConfig;

        // Simple grid placement algorithm
        let x = 40; // Starting position with margin
        let y = 40;
        const maxWidth = 400; // Max width before wrapping
        const spacing = 20; // Space between rooms

        for (const roomType of essentialRooms) {
            const roomData = ROOM_CATALOG[roomType];
            if (!roomData) continue;

            const roomWidth = roomData.dimensions.width * GRID_SCALE;
            const roomHeight = roomData.dimensions.length * GRID_SCALE;

            // Add multiple sleeping quarters based on crew size
            if (roomType === 'sleeping' && config) {
                for (let i = 0; i < config.crewSize; i++) {
                    // Check if we need to wrap to next row
                    if (x + roomWidth > maxWidth) {
                        x = 40;
                        y += 100 + spacing; // Move to next row
                    }

                    placeRoom(roomType, x, y);
                    x += roomWidth + spacing;
                }
            } else {
                // Check if we need to wrap to next row
                if (x + roomWidth > maxWidth) {
                    x = 40;
                    y += 100 + spacing; // Move to next row
                }

                placeRoom(roomType, x, y);
                x += roomWidth + spacing;
            }
        }

        console.log('✅ Auto layout generated');
    }

    /**
     * Filter rooms by category
     */
    function filterRoomsByCategory(category) {
        const roomItems = document.querySelectorAll('.room-item');
        
        roomItems.forEach(item => {
            const roomId = item.dataset.roomId;
            const roomData = ROOM_CATALOG[roomId];
            
            if (!roomData) {
                item.style.display = 'none';
                return;
            }

            let shouldShow = false;
            
            if (category === 'all') {
                shouldShow = true;
            } else if (category === 'essential') {
                shouldShow = roomData.type === 'essential';
            } else if (category === 'optional') {
                shouldShow = roomData.type === 'optional' || roomData.type === 'required';
            }

            item.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    /**
     * Update mission info display
     */
    function updateMissionInfoDisplay() {
        const config = editorState.missionConfig;
        const structure = editorState.structureConfig;

        if (config) {
            updateElement('mission-destination-display', 
                config.missionType === 'moon' ? 'Luna 🌙' : 'Mars 🔴');
            updateElement('mission-crew-display', `${config.crewSize} astronauts`);
            updateElement('mission-duration-display', `${config.duration} days`);
        }

        if (structure && structure.selectedStructureType) {
            const structureName = structure.selectedStructureType.charAt(0).toUpperCase() + 
                                structure.selectedStructureType.slice(1) + ' Module';
            updateElement('selected-structure-display', structureName);
        }
    }

    /**
     * Update canvas for selected structure
     */
    function updateCanvasForStructure() {
        const structure = editorState.structureConfig;
        if (!structure || !structure.selectedStructureType) return;

        // Update module outline
        const outline = document.getElementById('module-outline');
        const outlineLabel = document.getElementById('module-outline-label');

        if (outline && outlineLabel) {
            // Set outline dimensions based on structure type
            let width = 480; // Default width
            let height = 360; // Default height

            switch (structure.selectedStructureType) {
                case 'dome':
                    width = 480;
                    height = 480;
                    outline.style.borderRadius = '50%';
                    break;
                case 'cube':
                    width = 480;
                    height = 480;
                    outline.style.borderRadius = '8px';
                    break;
                case 'cylinder':
                    width = 600;
                    height = 300;
                    outline.style.borderRadius = '150px';
                    break;
                default:
                    outline.style.borderRadius = '8px';
            }

            outline.style.width = width + 'px';
            outline.style.height = height + 'px';

            const structureName = structure.selectedStructureType.charAt(0).toUpperCase() + 
                                structure.selectedStructureType.slice(1) + ' Module';
            const area = Math.round((width * height) / (GRID_SCALE * GRID_SCALE));
            outlineLabel.textContent = `${structureName} - ${area}m²`;
        }
    }

    /**
     * Update canvas information bar
     */
    function updateCanvasInfo() {
        const roomCount = editorState.placedRooms.size;
        let totalArea = 0;
        let totalVolume = 0;

        // Calculate totals
        for (const [instanceId, roomInstance] of editorState.placedRooms) {
            totalArea += roomInstance.roomData.area;
            totalVolume += roomInstance.roomData.area * roomInstance.roomData.dimensions.height;
        }

        // Update displays
        updateElement('rooms-placed-count', roomCount);
        
        // Calculate percentage of available space used (rough estimate)
        const availableArea = 144; // m² (standard module)
        const spaceUsed = Math.min(100, Math.round((totalArea / availableArea) * 100));
        updateElement('space-used-percent', spaceUsed + '%');
        
        updateElement('volume-allocated', Math.round(totalVolume) + ' m³');
    }

    /**
     * Update navigation state based on validation
     */
    function updateNavigationState() {
        const completeBtn = document.getElementById('complete-design-btn');
        const isReadyToComplete = editorState.complianceScore >= 75; // 75% compliance threshold

        if (completeBtn) {
            completeBtn.disabled = !isReadyToComplete;
            completeBtn.classList.toggle('disabled', !isReadyToComplete);
            
            if (isReadyToComplete) {
                completeBtn.textContent = 'Complete Design →';
            } else {
                completeBtn.textContent = `Complete Design (${editorState.complianceScore}% compliance)`;
            }
        }
    }

    /**
     * Handle design completion
     */
    function handleCompleteDesign() {
        const score = editorState.complianceScore;
        
        if (score < 75) {
            alert(`Design compliance is only ${score}%. Please improve compliance to at least 75% before completing.`);
            return;
        }

        // Save final design
        saveFinalDesign();

        // Show completion message
        const message = `Design completed with ${score}% NASA compliance!\n\n` +
                       `Rooms placed: ${editorState.placedRooms.size}\n` +
                       `Total volume: ${calculateTotalVolume()}m³\n\n` +
                       `Your space habitat design is ready for mission deployment.`;

        alert(message);

        // Could navigate to results page or return to welcome
        if (typeof SpaceArchitects !== 'undefined') {
            SpaceArchitects.showPage('welcome');
        }
    }

    /**
     * Calculate total volume of placed rooms
     */
    function calculateTotalVolume() {
        let total = 0;
        for (const [instanceId, roomInstance] of editorState.placedRooms) {
            total += roomInstance.roomData.area * roomInstance.roomData.dimensions.height;
        }
        return Math.round(total);
    }

    /**
     * Save room layout to localStorage
     */
    function saveRoomLayout() {
        try {
            const roomsData = [];
            for (const [instanceId, roomInstance] of editorState.placedRooms) {
                roomsData.push({
                    instanceId: instanceId,
                    roomType: roomInstance.roomType,
                    position: roomInstance.position,
                    dimensions: roomInstance.dimensions
                });
            }

            const saveData = {
                rooms: roomsData,
                complianceScore: editorState.complianceScore,
                timestamp: Date.now()
            };

            localStorage.setItem('spaceArchitects_roomLayout', JSON.stringify(saveData));
            console.log('💾 Room layout saved');
        } catch (error) {
            console.error('❌ Failed to save room layout:', error);
        }
    }

    /**
     * Load saved room layout
     */
    function loadSavedRoomLayout() {
        try {
            const saved = localStorage.getItem('spaceArchitects_roomLayout');
            if (!saved) return;

            const saveData = JSON.parse(saved);
            if (!saveData.rooms) return;

            // Recreate rooms from saved data
            for (const roomData of saveData.rooms) {
                const roomSpec = ROOM_CATALOG[roomData.roomType];
                if (!roomSpec) continue;

                // Create room element
                const roomElement = createRoomElement(
                    roomData.instanceId,
                    roomSpec,
                    roomData.position.x,
                    roomData.position.y,
                    roomData.dimensions.width,
                    roomData.dimensions.height
                );

                // Add to canvas
                const placedRoomsContainer = document.getElementById('placed-rooms');
                if (placedRoomsContainer) {
                    placedRoomsContainer.appendChild(roomElement);
                }

                // Add to state
                editorState.placedRooms.set(roomData.instanceId, {
                    id: roomData.instanceId,
                    roomType: roomData.roomType,
                    roomData: roomSpec,
                    position: roomData.position,
                    dimensions: roomData.dimensions,
                    element: roomElement
                });
            }

            console.log('📂 Room layout loaded');
        } catch (error) {
            console.error('❌ Failed to load room layout:', error);
        }
    }

    /**
     * Save final design for future reference
     */
    function saveFinalDesign() {
        try {
            const finalDesign = {
                missionConfig: editorState.missionConfig,
                structureConfig: editorState.structureConfig,
                roomLayout: Array.from(editorState.placedRooms.values()).map(room => ({
                    roomType: room.roomType,
                    roomName: room.roomData.name,
                    position: room.position,
                    area: room.roomData.area,
                    volume: room.roomData.area * room.roomData.dimensions.height
                })),
                validation: editorState.validationResults,
                complianceScore: editorState.complianceScore,
                totalVolume: calculateTotalVolume(),
                completedAt: new Date().toISOString()
            };

            localStorage.setItem('spaceArchitects_finalDesign', JSON.stringify(finalDesign));
            console.log('💾 Final design saved');
        } catch (error) {
            console.error('❌ Failed to save final design:', error);
        }
    }

    /**
     * Utility function to update element text
     */
    function updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Show context menu for room options
     */
    function showRoomContextMenu(event, instanceId) {
        // Simple implementation - could be enhanced with actual context menu
        if (confirm('Remove this room?')) {
            removeRoom(instanceId);
        }
    }

    // Public API
    return {
        initialize: initialize,
        placeRoom: placeRoom,
        removeRoom: removeRoom,
        clearAllRooms: clearAllRooms,
        generateAutoLayout: generateAutoLayout,
        validateCurrentLayout: validateCurrentLayout,
        saveRoomLayout: saveRoomLayout,
        getEditorState: () => ({ ...editorState })
    };

})();

// Make available globally
if (typeof window !== 'undefined') {
    window.HabitatEditor = HabitatEditor;
}

// Auto-initialize when DOM loads and editor page is active
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('editor-page')?.classList.contains('active')) {
        HabitatEditor.initialize();
    }
});

// Listen for page navigation to initialize editor
document.addEventListener('navigateToPage', function(event) {
    if (event.detail.page === 'editor') {
        setTimeout(() => {
            HabitatEditor.initialize();
        }, 100);
    }
});

// Listen for SpaceArchitects page changes
document.addEventListener('pageChanged', function(event) {
    if (event.detail.to === 'editor') {
        setTimeout(() => {
            HabitatEditor.initialize();
        }, 200);
    }
});

console.log('🎨 Habitat Editor module loaded successfully');