/* ==========================================================================
   SPACE ARCHITECTS - MAIN EDITOR MODULE
   NASA Space Apps Challenge Project
   
   This is the core module that handles:
   - Drag and drop functionality
   - Room placement and management
   - Real-time validation updates
   - Canvas interactions
   - User interface coordination
   ========================================================================== */

const HabitatEditor = (function() {
    'use strict';
    
    // Editor state
    let editorState = {
        placedRooms: [],
        selectedRoom: null,
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        canvasScale: 40, // pixels per meter
        gridSnap: true,
        missionConfig: null,
        moduleDimensions: null
    };
    
    // Canvas elements
    let canvasElement = null;
    let placedRoomsContainer = null;
    let moduleOutline = null;
    
    /**
     * Initialize the habitat editor
     */
    function initialize() {
        console.log('🎨 Initializing Habitat Editor...');
        
        // Get DOM elements
        canvasElement = document.getElementById('habitat-canvas');
        placedRoomsContainer = document.getElementById('placed-rooms');
        moduleOutline = document.getElementById('module-outline');
        
        if (!canvasElement) {
            console.error('❌ Canvas element not found');
            return false;
        }
        
        // Load mission configuration
        editorState.missionConfig = MissionConfig.getCurrentConfig();
        editorState.moduleDimensions = MissionConfig.calculateModuleDimensions();
        
        setupCanvas();
        setupDragAndDrop();
        setupCanvasControls();
        setupRoomCatalog();
        
        // Update mission info display
        updateMissionInfoDisplay();
        
        // Initial validation
        performValidation();
        
        console.log('✅ Habitat Editor initialized');
        return true;
    }
    
    /**
     * Set up the canvas with proper dimensions and grid
     */
    function setupCanvas() {
        console.log('🖼️ Setting up canvas...');
        
        const dims = editorState.moduleDimensions;
        const scale = editorState.canvasScale;
        
        // Set module outline dimensions
        if (moduleOutline) {
            moduleOutline.style.width = `${dims.width * scale}px`;
            moduleOutline.style.height = `${dims.length * scale}px`;
            moduleOutline.style.top = '40px';
            moduleOutline.style.left = '40px';
        }
        
        // Set canvas background grid
        if (canvasElement) {
            const gridSize = 0.5 * scale; // 0.5m grid
            canvasElement.style.backgroundSize = `${gridSize}px ${gridSize}px`;
        }
        
        console.log(`📐 Canvas configured: ${dims.width}m × ${dims.length}m`);
    }
    
    /**
     * Set up drag and drop functionality
     */
    function setupDragAndDrop() {
        console.log('🖱️ Setting up drag and drop...');
        
        // Canvas drop handlers
        if (canvasElement) {
            canvasElement.addEventListener('dragover', handleDragOver);
            canvasElement.addEventListener('drop', handleDrop);
            canvasElement.addEventListener('dragleave', handleDragLeave);
        }
        
        // Room catalog drag handlers
        const roomItems = document.querySelectorAll('.room-item');
        roomItems.forEach(item => {
            item.addEventListener('dragstart', handleRoomDragStart);
            item.addEventListener('dragend', handleRoomDragEnd);
        });
    }
    
    /**
     * Set up canvas control handlers
     */
    function setupCanvasControls() {
        console.log('🎛️ Setting up canvas controls...');
        
        // Clear all button
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', clearAllRooms);
        }
        
        // Auto arrange button
        const autoArrangeBtn = document.getElementById('auto-arrange-btn');
        if (autoArrangeBtn) {
            autoArrangeBtn.addEventListener('click', autoArrangeRooms);
        }
        
        // Grid toggle
        const gridToggle = document.getElementById('show-grid');
        if (gridToggle) {
            gridToggle.addEventListener('change', toggleGrid);
        }
        
        // Submit design button
        const submitBtn = document.getElementById('submit-design-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', submitDesign);
        }
    }
    
    /**
     * Set up room catalog interactions
     */
    function setupRoomCatalog() {
        console.log('📚 Setting up room catalog...');
        
        // Category filter buttons
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterRoomsByCategory(this.dataset.category);
                
                // Update active button
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Populate room catalog if empty
        populateRoomCatalog();
    }
    
    /**
     * Populate room catalog with available rooms
     */
    function populateRoomCatalog() {
        const catalog = document.getElementById('rooms-catalog');
        if (!catalog) return;
        
        // Check if already populated
        if (catalog.querySelector('.room-item')) return;
        
        const roomCatalog = RoomsManager.getRoomCatalog();
        const essentialSection = catalog.querySelector('.room-section');
        
        if (essentialSection) {
            Object.values(roomCatalog).forEach(room => {
                if (room.category === 'essential') {
                    const roomElement = createRoomCatalogItem(room);
                    essentialSection.appendChild(roomElement);
                }
            });
        }
    }
    
    /**
     * Create a room catalog item element
     * @param {Object} room - Room definition
     * @returns {HTMLElement} Room item element
     */
    function createRoomCatalogItem(room) {
        const item = document.createElement('div');
        item.className = 'room-item draggable';
        item.draggable = true;
        item.dataset.roomType = room.id;
        item.dataset.category = room.category;
        
        item.innerHTML = `
            <div class="room-icon">${room.icon}</div>
            <div class="room-info">
                <h4>${room.name}</h4>
                <p>${room.dimensions.width}m × ${room.dimensions.length}m</p>
                <p class="room-volume">${room.volume} m³</p>
            </div>
            <div class="room-color" style="background-color: ${room.color};"></div>
        `;
        
        // Add drag handlers
        item.addEventListener('dragstart', handleRoomDragStart);
        item.addEventListener('dragend', handleRoomDragEnd);
        
        return item;
    }
    
    /**
     * Handle room drag start
     * @param {Event} event - Drag event
     */
    function handleRoomDragStart(event) {
        const roomType = event.target.dataset.roomType;
        event.dataTransfer.setData('text/plain', roomType);
        event.target.classList.add('dragging');
        
        editorState.isDragging = true;
        canvasElement.classList.add('dragging-over');
        
        console.log('🏠 Started dragging room:', roomType);
    }
    
    /**
     * Handle room drag end
     * @param {Event} event - Drag event
     */
    function handleRoomDragEnd(event) {
        event.target.classList.remove('dragging');
        editorState.isDragging = false;
        canvasElement.classList.remove('dragging-over');
        
        console.log('🏠 Finished dragging room');
    }
    
    /**
     * Handle drag over canvas
     * @param {Event} event - Drag event
     */
    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }
    
    /**
     * Handle drop on canvas
     * @param {Event} event - Drop event
     */
    function handleDrop(event) {
        event.preventDefault();
        
        const roomType = event.dataTransfer.getData('text/plain');
        if (!roomType) return;
        
        const roomDef = RoomsManager.getRoomById(roomType);
        if (!roomDef) return;
        
        // Calculate drop position
        const canvasRect = canvasElement.getBoundingClientRect();
        const x = (event.clientX - canvasRect.left - 40) / editorState.canvasScale; // Account for module offset
        const y = (event.clientY - canvasRect.top - 40) / editorState.canvasScale;
        
        // Snap to grid if enabled
        let position = { x, y };
        if (editorState.gridSnap) {
            position = snapToGrid(position);
        }
        
        // Validate position
        if (isValidPosition(roomType, position)) {
            placeRoom(roomType, position);
        } else {
            showErrorMessage('Cannot place room here - overlaps with existing room or outside module bounds');
        }
        
        canvasElement.classList.remove('dragging-over');
    }
    
    /**
     * Handle drag leave canvas
     * @param {Event} event - Drag event
     */
    function handleDragLeave(event) {
        if (!canvasElement.contains(event.relatedTarget)) {
            canvasElement.classList.remove('dragging-over');
        }
    }
    
    /**
     * Snap position to grid
     * @param {Object} position - Position {x, y}
     * @returns {Object} Snapped position
     */
    function snapToGrid(position) {
        const gridSize = 0.5; // 0.5m grid
        return {
            x: Math.round(position.x / gridSize) * gridSize,
            y: Math.round(position.y / gridSize) * gridSize
        };
    }
    
    /**
     * Check if position is valid for room placement
     * @param {string} roomType - Room type
     * @param {Object} position - Position {x, y}
     * @returns {boolean} True if position is valid
     */
    function isValidPosition(roomType, position) {
        const roomDef = RoomsManager.getRoomById(roomType);
        if (!roomDef) return false;
        
        const dims = editorState.moduleDimensions;
        
        // Check module bounds
        if (position.x < 0 || position.y < 0 ||
            position.x + roomDef.dimensions.width > dims.width ||
            position.y + roomDef.dimensions.length > dims.length) {
            return false;
        }
        
        // Check overlap with existing rooms
        const newRoom = {
            x: position.x,
            y: position.y,
            width: roomDef.dimensions.width,
            length: roomDef.dimensions.length
        };
        
        return !editorState.placedRooms.some(existingRoom => {
            const existingDef = RoomsManager.getRoomById(existingRoom.type);
            const existing = {
                x: existingRoom.position.x,
                y: existingRoom.position.y,
                width: existingDef.dimensions.width,
                length: existingDef.dimensions.length
            };
            
            return RoomsManager.checkRoomOverlap(newRoom, existing);
        });
    }
    
    /**
     * Place a room in the habitat
     * @param {string} roomType - Room type
     * @param {Object} position - Position {x, y}
     */
    function placeRoom(roomType, position) {
        const roomDef = RoomsManager.getRoomById(roomType);
        if (!roomDef) return;
        
        const roomId = generateRoomId();
        const placedRoom = {
            id: roomId,
            type: roomType,
            position: position,
            placedAt: Date.now()
        };
        
        // Add to state
        editorState.placedRooms.push(placedRoom);
        
        // Create visual element
        const roomElement = createPlacedRoomElement(placedRoom, roomDef);
        placedRoomsContainer.appendChild(roomElement);
        
        // Update validation and canvas info
        performValidation();
        updateCanvasInfo();
        
        console.log('✅ Room placed:', roomType, 'at', position);
    }
    
    /**
     * Create visual element for placed room
     * @param {Object} placedRoom - Placed room data
     * @param {Object} roomDef - Room definition
     * @returns {HTMLElement} Room element
     */
    function createPlacedRoomElement(placedRoom, roomDef) {
        const element = document.createElement('div');
        element.className = 'placed-room';
        element.dataset.roomId = placedRoom.id;
        element.dataset.roomType = placedRoom.type;
        
        const scale = editorState.canvasScale;
        
        // Position and size
        element.style.left = `${40 + placedRoom.position.x * scale}px`;
        element.style.top = `${40 + placedRoom.position.y * scale}px`;
        element.style.width = `${roomDef.dimensions.width * scale}px`;
        element.style.height = `${roomDef.dimensions.length * scale}px`;
        element.style.backgroundColor = roomDef.color;
        
        // Content
        element.innerHTML = `
            <div class="room-icon">${roomDef.icon}</div>
            <div class="room-name">${roomDef.name}</div>
        `;
        
        // Add click handler for removal
        element.addEventListener('click', function() {
            removeRoom(placedRoom.id);
        });
        
        return element;
    }
    
    /**
     * Remove a placed room
     * @param {string} roomId - Room ID to remove
     */
    function removeRoom(roomId) {
        // Remove from state
        editorState.placedRooms = editorState.placedRooms.filter(room => room.id !== roomId);
        
        // Remove visual element
        const element = placedRoomsContainer.querySelector(`[data-room-id="${roomId}"]`);
        if (element) {
            element.remove();
        }
        
        // Update validation and canvas info
        performValidation();
        updateCanvasInfo();
        
        console.log('🗑️ Room removed:', roomId);
    }
    
    /**
     * Clear all placed rooms
     */
    function clearAllRooms() {
        if (editorState.placedRooms.length === 0) return;
        
        if (confirm('Are you sure you want to clear all placed rooms?')) {
            editorState.placedRooms = [];
            placedRoomsContainer.innerHTML = '';
            
            performValidation();
            updateCanvasInfo();
            
            console.log('🧹 All rooms cleared');
        }
    }
    
    /**
     * Auto-arrange rooms using simple algorithm
     */
    function autoArrangeRooms() {
        if (editorState.placedRooms.length === 0) {
            showErrorMessage('No rooms to arrange. Add some rooms first.');
            return;
        }
        
        console.log('✨ Auto-arranging rooms...');
        
        // Simple grid-based arrangement
        const gridSize = 0.5;
        let currentX = 0;
        let currentY = 0;
        let rowHeight = 0;
        const maxWidth = editorState.moduleDimensions.width;
        
        editorState.placedRooms.forEach(placedRoom => {
            const roomDef = RoomsManager.getRoomById(placedRoom.type);
            if (!roomDef) return;
            
            // Check if room fits in current row
            if (currentX + roomDef.dimensions.width > maxWidth) {
                currentX = 0;
                currentY += rowHeight + gridSize;
                rowHeight = 0;
            }
            
            // Update position
            placedRoom.position = { x: currentX, y: currentY };
            
            // Update visual element
            const element = placedRoomsContainer.querySelector(`[data-room-id="${placedRoom.id}"]`);
            if (element) {
                const scale = editorState.canvasScale;
                element.style.left = `${40 + currentX * scale}px`;
                element.style.top = `${40 + currentY * scale}px`;
            }
            
            // Advance position
            currentX += roomDef.dimensions.width + gridSize;
            rowHeight = Math.max(rowHeight, roomDef.dimensions.length);
        });
        
        performValidation();
        console.log('✅ Auto-arrangement complete');
    }
    
    /**
     * Toggle grid visibility
     * @param {Event} event - Change event
     */
    function toggleGrid(event) {
        const showGrid = event.target.checked;
        canvasElement.classList.toggle('show-grid', showGrid);
        console.log('📏 Grid visibility:', showGrid ? 'ON' : 'OFF');
    }
    
    /**
     * Filter rooms by category
     * @param {string} category - Category name
     */
    function filterRoomsByCategory(category) {
        const roomItems = document.querySelectorAll('.room-item');
        
        roomItems.forEach(item => {
            const itemCategory = item.dataset.category;
            const show = category === 'all' || itemCategory === category;
            item.classList.toggle('hidden', !show);
        });
        
        console.log('🔍 Filtered rooms by category:', category);
    }
    
    /**
     * Perform validation and update displays
     */
    function performValidation() {
        if (ValidationSystem && typeof ValidationSystem.performRealTimeValidation === 'function') {
            ValidationSystem.performRealTimeValidation(
                editorState.placedRooms,
                editorState.missionConfig
            );
        }
    }
    
    /**
     * Update canvas information display
     */
    function updateCanvasInfo() {
        const dimensionsEl = document.getElementById('canvas-dimensions');
        const roomsCountEl = document.getElementById('rooms-count');
        const spaceUsedEl = document.getElementById('space-used');
        
        const dims = editorState.moduleDimensions;
        if (dimensionsEl) {
            dimensionsEl.textContent = `${dims.width}m × ${dims.length}m`;
        }
        
        if (roomsCountEl) {
            roomsCountEl.textContent = editorState.placedRooms.length;
        }
        
        if (spaceUsedEl) {
            const totalRoomArea = editorState.placedRooms.reduce((sum, room) => {
                const roomDef = RoomsManager.getRoomById(room.type);
                return sum + (roomDef ? roomDef.area : 0);
            }, 0);
            
            const moduleArea = dims.width * dims.length;
            const usagePercentage = Math.round((totalRoomArea / moduleArea) * 100);
            spaceUsedEl.textContent = `${usagePercentage}%`;
        }
    }
    
    /**
     * Update mission info display in header
     */
    function updateMissionInfoDisplay() {
        const config = editorState.missionConfig;
        
        const missionEl = document.getElementById('current-mission');
        const crewEl = document.getElementById('current-crew');
        const durationEl = document.getElementById('current-duration');
        
        if (missionEl) missionEl.textContent = config.missionType.charAt(0).toUpperCase() + config.missionType.slice(1);
        if (crewEl) crewEl.textContent = config.crewSize;
        if (durationEl) durationEl.textContent = config.duration;
    }
    
    /**
     * Submit design for final scoring
     */
    function submitDesign() {
        console.log('📤 Submitting design for evaluation...');
        
        if (editorState.placedRooms.length === 0) {
            showErrorMessage('No rooms placed. Please design your habitat first.');
            return;
        }
        
        // Calculate final score
        const finalScore = ScoringSystem.calculateTotalScore(
            editorState.placedRooms,
            editorState.missionConfig,
            editorState.moduleDimensions
        );
        
        // Show submission modal
        showSubmissionModal(finalScore);
    }
    
    /**
     * Show final submission modal with results
     * @param {Object} scoreResults - Final scoring results
     */
    function showSubmissionModal(scoreResults) {
        const modal = document.getElementById('submission-modal');
        const finalScoreEl = document.getElementById('final-score');
        const requirementsEl = document.getElementById('final-requirements');
        const recommendationsEl = document.getElementById('final-recommendations');
        
        if (!modal) return;
        
        // Update score display
        if (finalScoreEl) {
            finalScoreEl.textContent = scoreResults.percentage;
        }
        
        // Update requirements breakdown
        if (requirementsEl) {
            requirementsEl.innerHTML = Object.entries(scoreResults.categories)
                .map(([category, data]) => `
                    <div class="requirement-breakdown">
                        <strong>${category.replace(/([A-Z])/g, ' $1').trim()}:</strong>
                        ${data.percentage}% (${data.weighted.toFixed(1)} points)
                    </div>
                `).join('');
        }
        
        // Update recommendations
        if (recommendationsEl && scoreResults.recommendations.length > 0) {
            recommendationsEl.innerHTML = scoreResults.recommendations
                .map(rec => `
                    <div class="recommendation-item priority-${rec.priority}">
                        <strong>${rec.category}:</strong> ${rec.message}
                    </div>
                `).join('');
        } else if (recommendationsEl) {
            recommendationsEl.innerHTML = '<div class="recommendation-item">🎉 Excellent design! No major improvements needed.</div>';
        }
        
        modal.classList.add('active');
    }
    
    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    function showErrorMessage(message) {
        // Simple alert for now - could be enhanced with custom modal
        alert(message);
    }
    
    /**
     * Generate unique room ID
     * @returns {string} Unique room ID
     */
    function generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Get current editor state (for external access)
     * @returns {Object} Current editor state
     */
    function getEditorState() {
        return {
            ...editorState,
            placedRooms: [...editorState.placedRooms] // Return copy
        };
    }
    
    // Public API
    return {
        initialize: initialize,
        placeRoom: placeRoom,
        removeRoom: removeRoom,
        clearAllRooms: clearAllRooms,
        autoArrangeRooms: autoArrangeRooms,
        submitDesign: submitDesign,
        getEditorState: getEditorState,
        performValidation: performValidation
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.HabitatEditor = HabitatEditor;
}

console.log('🎨 Habitat Editor module loaded successfully');