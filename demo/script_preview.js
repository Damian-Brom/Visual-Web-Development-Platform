// JavaScript specific to the new tab

// Function to change the text color of the content
function changeTextColor() {
    var content = document.getElementById('editableZone');
    content.style.color = content.style.color === 'red' ? 'black' : 'red';
}

// Function to disable text editing on elements
function disableTextEditing() {
    var content = document.getElementById('editableZone');
    var allElements = content.querySelectorAll('*');
    allElements.forEach(element => {
        element.setAttribute('contenteditable', 'false');
        element.style.userSelect = 'none';
    });
}

// var styles = '<link rel="stylesheet" type="text/css" href="styles_preview.css">'
// var script = ''
function saveContentAsHTMLFile() {
    var contentHTML = document.getElementById('editableZone').outerHTML;

    // Create a Blob with the HTML content
    var blob = new Blob([contentHTML], { type: 'text/html' });

    // Create a URL for the Blob
    var url = URL.createObjectURL(blob);

    // Create an anchor element to trigger the download
    var link = document.createElement('a');
    link.href = url;
    link.download = 'my_content.html'; // Set the desired filename
    link.click();

    // Clean up the URL
    URL.revokeObjectURL(url);
}


document.addEventListener('DOMContentLoaded', () => {

    // // Add a button to the new tab to save html
    // var saveAsHTMLBtn = document.createElement('button');
    // saveAsHTMLBtn.textContent = 'save html';
    // saveAsHTMLBtn.onclick = saveContentAsHTMLFile;
    // document.body.appendChild(saveAsHTMLBtn); // Append the button to the body

    // Disable text editing on all elements within the editableZone div
    disableTextEditing();


    const editableZone = document.getElementById('editableZone');

    // Function to load page content
    function loadPageContent(pageId) {
        if (pages[pageId]) {
            editableZone.innerHTML = pages[pageId].content;

            // Reinitialize elements with target page
            initializeTargetPageElements();
        }
    }

    // Function to initialize target page elements
    function initializeTargetPageElements() {
        const elementsWithTargetPage = document.querySelectorAll('[data-target-page]');
        elementsWithTargetPage.forEach(element => {
            const targetPage = element.getAttribute('data-target-page');
            if (targetPage) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadPageContent(targetPage);
                });
            }
        });
    }

    // Initialize elements with target page on initial load
    initializeTargetPageElements();
});


document.addEventListener('DOMContentLoaded', () => {
    disableTextEditing();
});