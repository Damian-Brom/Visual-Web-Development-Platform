// JavaScript specific to the new tab goes here

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
    // // Add a button to the new tab to change text color
    // var changeColorButton = document.createElement('button');
    // changeColorButton.textContent = 'Change Text Color';
    // changeColorButton.onclick = changeTextColor;
    //
    // // Append the button to the body
    // document.body.appendChild(changeColorButton);

    // Add a button to the new tab to save html
    var saveAsHTMLBtn = document.createElement('button');
    saveAsHTMLBtn.textContent = 'save html';
    saveAsHTMLBtn.onclick = saveContentAsHTMLFile;
    document.body.appendChild(saveAsHTMLBtn); // Append the button to the body

    // Disable text editing on all elements within the editableZone div
    disableTextEditing();
});

