// Variable to keep track of the selected element
let selectedElement = null;

// Function to handle element selection
function selectElement(event) {
    // Remove the 'selected' class from the previously selected element
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    // Set the current element as selected and add the 'selected' class
    selectedElement = event.target;
    selectedElement.classList.add('selected');
}

// Add click event listeners to all elements with the 'selectable' class
document.querySelectorAll('.selectable').forEach(element => {
    element.addEventListener('click', selectElement);
});

// Add keydown event listener to the document
document.addEventListener('keydown', function(event) {
    // Check if the delete key (key code 46) is pressed
    if (event.key === 'Delete' || event.keyCode === 46) {
        // If an element is selected, remove it from the DOM
        if (selectedElement) {
            selectedElement.remove();
            selectedElement = null; // Reset the selected element variable
        }
    }
});
