document.addEventListener('DOMContentLoaded', () => {
    // Disable text editing on all elements within the editableZone div
    disableTextEditing();

    const editableZone = document.getElementById('editableZone');

    // Function to load page content
    function loadPageContent(pageId) {
        if (pages[pageId]) {
            editableZone.innerHTML = pages[pageId].content;
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

        // Ensure that links work normally
        const previewLinks = document.querySelectorAll('[data-preview-link]');
        previewLinks.forEach(link => {
            link.removeAttribute('onclick');
        });
    }

    // Initialize elements with target page on initial load
    initializeTargetPageElements();
});

function disableTextEditing() {
    var content = document.getElementById('editableZone');
    var allElements = content.querySelectorAll('*');
    allElements.forEach(element => {
        element.setAttribute('contenteditable', 'false');
        element.style.userSelect = 'none';
    });
}
