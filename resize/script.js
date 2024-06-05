document.getElementById('addElementBtn').addEventListener('click', addElement);
document.getElementById('addTextBtn').addEventListener('click', addTextElement);
document.getElementById('addButtonBtn').addEventListener('click', addButtonElement);

function addElement() {
    const container = document.querySelector('.container');
    const newBox = document.createElement('div');
    newBox.classList.add('resizable-box');
    newBox.innerHTML = `
        <div class="resizer resizer-tl"></div>
        <div class="resizer resizer-tr"></div>
        <div class="resizer resizer-bl"></div>
        <div class="resizer resizer-br"></div>
    `;
    container.appendChild(newBox);
    initializeBox(newBox);
}

function addTextElement() {
    const container = document.querySelector('.container');
    const newTextElement = document.createElement('div');
    newTextElement.classList.add('resizable-box', 'text-element');
    newTextElement.contentEditable = true;
    newTextElement.innerHTML = `
        ...edit me...
        <div class="resizer resizer-tl"></div>
        <div class="resizer resizer-tr"></div>
        <div class="resizer resizer-bl"></div>
        <div class="resizer resizer-br"></div>
    `;
    container.appendChild(newTextElement);
    initializeBox(newTextElement);
}

function addButtonElement() {
    const container = document.querySelector('.container');
    const newButtonElement = document.createElement('div');
    newButtonElement.classList.add('resizable-box', 'button-element');
    newButtonElement.contentEditable = true;
    newButtonElement.innerHTML = `
        ...edit me...
        <div class="resizer resizer-tl"></div>
        <div class="resizer resizer-tr"></div>
        <div class="resizer resizer-bl"></div>
        <div class="resizer resizer-br"></div>
    `;
    container.appendChild(newButtonElement);
    initializeBox(newButtonElement);
}

function initializeBox(box) {
    const resizers = box.querySelectorAll('.resizer');
    const editableZone = document.getElementById('editableZone');
    let isResizing = false;
    let isDragging = false;

    // Show resizers when the resizable element is clicked
    box.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.resizable-box').forEach(item => {
            item.classList.remove('active');
        });
        box.classList.add('active');
        selectElement(e);  // Ensure element is selected on click
    });

    // Stop hiding resizers when clicking on the resizers
    resizers.forEach(resizer => {
        resizer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        resizer.addEventListener('mousedown', initResize);
    });

    function initResize(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        const resizer = e.target;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(box).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(box).height, 10);
        const startLeft = box.offsetLeft;
        const startTop = box.offsetTop;

        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);

        function resize(e) {
            if (isResizing) {
                if (resizer.classList.contains('resizer-br')) {
                    box.style.width = startWidth + e.clientX - startX + 'px';
                    box.style.height = startHeight + e.clientY - startY + 'px';
                } else if (resizer.classList.contains('resizer-bl')) {
                    box.style.width = startWidth - (e.clientX - startX) + 'px';
                    box.style.height = startHeight + (e.clientY - startY) + 'px';
                    box.style.left = startLeft + (e.clientX - startX) + 'px';
                } else if (resizer.classList.contains('resizer-tr')) {
                    box.style.width = startWidth + (e.clientX - startX) + 'px';
                    box.style.height = startHeight - (e.clientY - startY) + 'px';
                    box.style.top = startTop + (e.clientY - startY) + 'px';
                } else if (resizer.classList.contains('resizer-tl')) {
                    box.style.width = startWidth - (e.clientX - startX) + 'px';
                    box.style.height = startHeight - (e.clientY - startY) + 'px';
                    box.style.left = startLeft + (e.clientX - startX) + 'px';
                    box.style.top = startTop + (e.clientY - startY) + 'px';
                }
            }
        }

        function stopResize() {
            isResizing = false;
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResize);
        }
    }

    // Make the element draggable
    box.addEventListener('mousedown', function(e) {
        if (!e.target.classList.contains('resizer')) {
            isDragging = true;
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = box.offsetLeft;
            const startTop = box.offsetTop;

            window.addEventListener('mousemove', drag);
            window.addEventListener('mouseup', stopDrag);

            function drag(e) {
                if (isDragging) {
                    let newLeft = startLeft + e.clientX - startX;
                    let newTop = startTop + e.clientY - startY;

                    // Constrain movement within the editableZone
                    const zoneRect = editableZone.getBoundingClientRect();
                    const boxRect = box.getBoundingClientRect();

                    // Constrain horizontal movement
                    if (newLeft < zoneRect.left - editableZone.offsetLeft) {
                        newLeft = zoneRect.left - editableZone.offsetLeft;
                    } else if (newLeft + boxRect.width > zoneRect.right - editableZone.offsetLeft) {
                        newLeft = zoneRect.right - editableZone.offsetLeft - boxRect.width;
                    }

                    // Constrain vertical movement
                    if (newTop < zoneRect.top - editableZone.offsetTop) {
                        newTop = zoneRect.top - editableZone.offsetTop;
                    } else if (newTop + boxRect.height > zoneRect.bottom - editableZone.offsetTop) {
                        newTop = zoneRect.bottom - editableZone.offsetTop - boxRect.height;
                    }

                    box.style.left = newLeft + 'px';
                    box.style.top = newTop + 'px';
                }
            }

            function stopDrag() {
                isDragging = false;
                window.removeEventListener('mousemove', drag);
                window.removeEventListener('mouseup', stopDrag);
            }
        }
    });

    // Ensure element is selected on initialization
    box.addEventListener('click', selectElement);
}

// Initialize existing elements
document.querySelectorAll('.resizable-box').forEach(initializeBox);

// Variable to keep track of the selected element
let selectedElement = null;

// Function to handle element selection
function selectElement(event) {
    if (!event.target.classList.contains('resizer')) {
        if (selectedElement !== event.currentTarget) {
            // Check if the clicked element is different from the currently selected one
            if (selectedElement) {
                selectedElement.classList.remove('selected');
            }
            selectedElement = event.currentTarget;
            selectedElement.classList.add('selected');
            showControlPanel();
        }
    }
}

// Function to handle deselection
function deselectElement(event) {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
        hideControlPanel(); // Hide control panel when no element is selected
    }
}

// Add keydown event listener to the document
document.addEventListener('keydown', function(event) {
    if (event.key === 'Delete' || event.keyCode === 46) {
        if (selectedElement) {
            selectedElement.remove();
            selectedElement = null;
            hideControlPanel(); // Hide control panel when element is deleted
        }
    }
});

// Add click event listener to the document to handle deselection
document.addEventListener('click', function(event) {
    if (!event.target.closest('#controlPanel') && !event.target.classList.contains('resizable-box') && !event.target.classList.contains('resizer')) {
        deselectElement();
    }
});


// Show control panel
function showControlPanel() {
    const controlPanel = document.getElementById('controlPanel');
    controlPanel.style.display = 'block';

    // Initialize control panel with selected element's styles
    const fontSelect = document.getElementById('fontSelect');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const colorPicker = document.getElementById('colorPicker');

    fontSelect.value = getComputedStyle(selectedElement).fontFamily || 'Arial';
    fontSizeSelect.value = getComputedStyle(selectedElement).fontSize || '16px';
    colorPicker.value = rgbToHex(getComputedStyle(selectedElement).color || '#000000');
}

// Hide control panel
function hideControlPanel() {
    const controlPanel = document.getElementById('controlPanel');
    controlPanel.style.display = 'none';
}

// Update selected element's font family
document.getElementById('fontSelect').addEventListener('change', function(event) {
    if (selectedElement) {
        selectedElement.style.fontFamily = event.target.value;
    }
});

// Update selected element's font size
document.getElementById('fontSizeSelect').addEventListener('change', function(event) {
    if (selectedElement) {
        selectedElement.style.fontSize = event.target.value;
    }
});

// Add event listener to the font size input field
document.getElementById('fontSizeSelect').addEventListener('input', function(event) {
    const newSize = event.target.value;
    if (selectedElement) {
        selectedElement.style.fontSize = newSize + 'px'; // Update font size of the selected element
    }
});

// Update selected element's color
document.getElementById('colorPicker').addEventListener('input', function(event) {
    if (selectedElement) {
        selectedElement.style.color = event.target.value;
    }
});

// Helper function to convert RGB to Hex
function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    });
    return '#' + result.join('');
}
