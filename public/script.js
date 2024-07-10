let currentPageId = '';
let selectedElement = null;
let selectedThreeJsElement = null;
let selectedThreeJsMesh = null;

document.addEventListener("DOMContentLoaded", function() {
    loadPages();
    initThreeJsScene();

    document.getElementById('addResizableBoxBtn').addEventListener('click', () => addElement('box'));
    document.getElementById('addTextBtn').addEventListener('click', () => addElement('text'));
    document.getElementById('addButtonBtn').addEventListener('click', () => addElement('button'));
    document.getElementById('addImageBtn').addEventListener('click', () => {
        document.getElementById('imageUpload').click();
    });
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    document.getElementById('addLinkBtn').addEventListener('click', addLink);
    document.getElementById('deletePageBtn').addEventListener('click', deletePage);
    document.getElementById('pageSelect').addEventListener('change', function () {
        let selectedValue = this.value;
        if (selectedValue) {
            document.getElementById('deletePageBtn').disabled = false;
            currentPageId = selectedValue; // Assuming currentPageId is used to track the current page
        } else {
            document.getElementById('deletePageBtn').disabled = true;
        }
    });

    document.getElementById('addCubeBtn').addEventListener('click', () => addThreeJsElement('cube'));
    document.getElementById('addSphereBtn').addEventListener('click', () => addThreeJsElement('sphere'));
    document.getElementById('addCylinderBtn').addEventListener('click', () => addThreeJsElement('cylinder'));

    document.getElementById('threeJsWidth').addEventListener('input', function () {
        if (selectedThreeJsMesh) {
            selectedThreeJsMesh.scale.x = this.value;
            saveContent();
        }
    });
    document.getElementById('threeJsHeight').addEventListener('input', function () {
        if (selectedThreeJsMesh) {
            selectedThreeJsMesh.scale.y = this.value;
            saveContent();
        }
    });
    document.getElementById('threeJsDepth').addEventListener('input', function () {
        if (selectedThreeJsMesh) {
            selectedThreeJsMesh.scale.z = this.value;
            saveContent();
        }
    });
    document.getElementById('threeJsUniformScale').addEventListener('input', function () {
        if (selectedThreeJsMesh) {
            const scaleValue = this.value;
            selectedThreeJsMesh.scale.set(scaleValue, scaleValue, scaleValue);
            saveContent();
        }
    });
    document.getElementById('threeJsColor').addEventListener('input', function () {
        if (selectedThreeJsMesh) {
            selectedThreeJsMesh.material.color.set(this.value);
            saveContent();
        }
    });

    document.getElementById('fontSelect').addEventListener('change', function (event) {
        if (selectedElement) {
            selectedElement.style.fontFamily = event.target.value;
            saveContent();
        }
    });
    document.getElementById('fontSizeSelect').addEventListener('change', function (event) {
        if (selectedElement) {
            selectedElement.style.fontSize = event.target.value;
            saveContent();
        }
    });
    document.getElementById('fontSizeSelect').addEventListener('input', function (event) {
        const newSize = event.target.value;
        if (selectedElement) {
            selectedElement.style.fontSize = newSize + 'px';
            saveContent();
        }
    });
    document.getElementById('colorPicker').addEventListener('input', function (event) {
        if (selectedElement) {
            selectedElement.style.color = event.target.value;
            saveContent();
        }
    });
    document.getElementById('targetPageSelect').addEventListener('change', function (event) {
        if (selectedElement) {
            const targetPage = event.target.value;
            selectedElement.setAttribute('data-target-page', targetPage);
            saveContent();
        }
    });
    document.getElementById('alignmentSelect').addEventListener('change', function (event) {
        if (selectedElement) {
            selectedElement.style.textAlign = event.target.value;
            saveContent();
        }
    });
    document.getElementById('backgroundColorPicker').addEventListener('input', function (event) {
        if (selectedElement) {
            selectedElement.style.backgroundColor = event.target.value;
            saveContent();
        }
    });
    document.getElementById('zIndexInput').addEventListener('input', function (event) {
        if (selectedElement) {
            selectedElement.style.zIndex = event.target.value;
            saveContent();
        }
    });

    document.getElementById('animationSelect').addEventListener('change', function (event) {
        if (selectedElement) {
            const animationClass = event.target.value;
            selectedElement.setAttribute('data-animation', animationClass);
            saveContent();
        }
    });
    document.getElementById('animationSelect').addEventListener('change', updateAnimationSettings);
    document.getElementById('animationDuration').addEventListener('input', updateAnimationSettings);
    document.getElementById('animationStartTime').addEventListener('input', updateAnimationSettings);
    document.getElementById('animationHover').addEventListener('change', updateAnimationSettings);

    const backgroundSelect = document.getElementById('backgroundSelect');
    const colorOptions = document.getElementById('colorOptions');

    backgroundSelect.addEventListener('change', function (event) {
        const selectedOption = event.target.value;
        if (selectedOption === 'color') {
            colorOptions.style.display = 'block';
        } else {
            colorOptions.style.display = 'none';
            if (selectedElement) {
                selectedElement.style.backgroundColor = 'transparent';
                saveContent();
            }
        }
    });

    document.addEventListener('input', function (event) {
        if (event.target.isContentEditable) {
            saveContent();
        }
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Delete' || event.keyCode === 46) {
            if (selectedElement) {
                selectedElement.remove();
                selectedElement = null;
                hideControlPanel();
                saveContent();
            }
        }
    });
    document.addEventListener('click', function (event) {
        if (!event.target.closest('#controlPanel') && !event.target.classList.contains('resizable-box') && !event.target.classList.contains('resizer')) {
            deselectElement();
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.resizable-box').forEach(initializeBox);
        });
});

function updateAnimationSettings() {
    if (selectedElement) {
        const animationClass = document.getElementById('animationSelect').value;
        const duration = document.getElementById('animationDuration').value;
        const startTime = document.getElementById('animationStartTime').value;
        const hoverActive = document.getElementById('animationHover').checked;

        selectedElement.classList.forEach(cls => {
            if (cls.startsWith('fadeIn') || cls.startsWith('fadeOut') || cls.startsWith('slideIn') ||
                cls.startsWith('slideOut') || cls.startsWith('bounce') || cls.startsWith('rotate')) {
                selectedElement.classList.remove(cls);
            }
        });

        if (hoverActive) {
            selectedElement.classList.add('hover-activated');
        } else {
            selectedElement.classList.remove('hover-activated');
        }

        if (animationClass !== 'none') {
            selectedElement.classList.add(animationClass);
            selectedElement.style.setProperty('--duration', `${duration}s`);
            selectedElement.style.setProperty('--start-time', `${startTime}s`);
        }
        saveContent();
    }
}

function enableContentEditableSave() {
    document.querySelectorAll('[contentEditable="true"]').forEach(element => {
        element.addEventListener('input', function() {
            saveContent();
        });
    });
}

function saveContent() {
    const content = document.getElementById('editableZone').innerHTML;
    const pageTitle = document.getElementById('pageSelect').selectedOptions[0].textContent;
    const threeJsElements = Array.from(document.querySelectorAll('.three-js-container')).map(container => {
        const mesh = container.__threeJsMesh;
        return {
            type: container.getAttribute('data-threejs-type'),
            scale: {
                x: mesh.scale.x,
                y: mesh.scale.y,
                z: mesh.scale.z
            },
            color: mesh.material.color.getHex(),
            width: container.style.width,
            height: container.style.height,
            position: {
                left: container.style.left,
                top: container.style.top
            }
        };
    });

    fetch('/savePageContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId: currentPageId, pageTitle, content, threeJsElements }),
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Failed to save content');
            }
        })
        .catch(error => {
            console.error('Error saving content:', error);
        });
}

function loadContent(pageId) {
    fetch(`/loadPageContent?${pageId}`)
        .then(response => response.json())
        .then(data => {
            const editableZone = document.getElementById('editableZone');
            editableZone.innerHTML = ''; // Clear previous content

            if (data.content) {
                editableZone.innerHTML = data.content;
                enableEditing();
                enableContentEditableSave(); // Ensure the new content is monitored

                // Initialize Three.js elements
                setTimeout(() => {
                    const threeJsContainers = editableZone.querySelectorAll('.three-js-container');
                    threeJsContainers.forEach(container => {
                        const type = container.getAttribute('data-threejs-type');
                        createThreeJsScene(container, type);

                        // Apply saved properties
                        const mesh = container.__threeJsMesh;
                        const savedElement = data.threeJsElements.find(el => el.type === type && el.position.left === container.style.left && el.position.top === container.style.top);
                        if (savedElement) {
                            mesh.scale.set(savedElement.scale.x, savedElement.scale.y, savedElement.scale.z);
                            mesh.material.color.setHex(savedElement.color);
                        }
                        initializeBox(container); // Ensure the element is draggable and resizable
                    });
                }, 100); // Adjust delay as necessary
            } else {
                enableEditing();
            }
            document.getElementById('pageTitle').textContent = data.pageTitle || 'No Page Selected';
            showContentArea();
        })
        .catch(error => {
            console.error('Error loading content:', error);
        });
}

function enableEditing() {
    document.querySelectorAll('.resizable-box').forEach(initializeBox);
}

function loadPages() {
    fetch('/loadPages')
        .then(response => response.json())
        .then(data => {
            const pageSelect = document.getElementById('pageSelect');
            const targetPageSelect = document.getElementById('targetPageSelect');
            pageSelect.innerHTML = '<option value="" disabled selected>Select a page</option>';
            targetPageSelect.innerHTML = '<option value="">None</option>';

            data.pages.forEach(page => {
                const option = document.createElement('option');
                option.value = page.pageId;
                option.textContent = page.pageTitle;
                pageSelect.appendChild(option);

                const targetOption = document.createElement('option');
                targetOption.value = page.pageId;
                targetOption.textContent = page.pageTitle;
                targetPageSelect.appendChild(targetOption);
            });
        })
        .catch(error => {
            console.error('Error loading pages:', error);
        });
}

function loadPage(pageId) {
    currentPageId = pageId;
    loadContent(pageId);
}

function addPage() {
    const pageId = `page-${Date.now()}`;
    const pageTitle = prompt('Enter page title:');
    if (pageTitle) {
        fetch('/savePageContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pageId, pageTitle, content: '' }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const pageSelect = document.getElementById('pageSelect');
                    const targetPageSelect = document.getElementById('targetPageSelect');
                    const option = document.createElement('option');
                    option.value = pageId;
                    option.textContent = pageTitle;
                    pageSelect.appendChild(option);

                    const targetOption = document.createElement('option');
                    targetOption.value = pageId;
                    targetOption.textContent = pageTitle;
                    targetPageSelect.appendChild(targetOption);

                    pageSelect.value = pageId;
                    currentPageId = pageId;
                    loadPage(pageId);
                } else {
                    alert('Failed to add page');
                }
            })
            .catch(error => {
                console.error('Error adding page:', error);
            });
    }
}

function deletePage() {
    if (currentPageId) {
        fetch(`/deletePageContent?pageId=${currentPageId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadPages(); // Reload the pages to update the list after deletion
                    document.getElementById('deletePageBtn').disabled = true;
                    currentPageId = ''; // Reset currentPageId
                    hideContentArea(); // Hide the content area after deletion
                } else {
                    console.error('Failed to delete page');
                }
            })
            .catch(error => {
                console.error('Error deleting page:', error);
            });
    }
}

function openContentInNewTab() {
    const editableZone = document.getElementById('editableZone');
    const contentHTML = editableZone.innerHTML;

    const threeJsElements = Array.from(document.querySelectorAll('.three-js-container')).map(container => ({
        type: container.getAttribute('data-threejs-type'),
        scale: {
            x: container.__threeJsMesh.scale.x,
            y: container.__threeJsMesh.scale.y,
            z: container.__threeJsMesh.scale.z
        },
        color: container.__threeJsMesh.material.color.getHex(),
        width: container.style.width,
        height: container.style.height,
        position: {
            left: container.style.left,
            top: container.style.top
        }
    }));

    const newWindow = window.open();
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <link rel="stylesheet" type="text/css" href="/style_preview.css">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
            <script src="/script_preview.js"></script>
        </head>
        <body>
            <div id="editableZone">${contentHTML}</div>
            <script>
                const threeJsElements = ${JSON.stringify(threeJsElements)};
                document.addEventListener('DOMContentLoaded', () => {
                    initializeThreeJsElements(threeJsElements);
                    applyAnimations();
                });
            </script>
        </body>
        </html>
    `);
    newWindow.document.close();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newElement = document.createElement('div');
            newElement.classList.add('resizable-box');
            newElement.style.position = 'absolute';
            newElement.innerHTML = `
                <img src="${e.target.result}" style="width: 100%; height: 100%;">
                <div class="resizer resizer-tl"></div>
                <div class="resizer resizer-tr"></div>
                <div class="resizer resizer-bl"></div>
                <div class="resizer resizer-br"></div>
            `;
            const editableZone = document.getElementById('editableZone');
            editableZone.appendChild(newElement);
            initializeBox(newElement);
            saveContent(); // Save changes after adding the image
        };
        reader.readAsDataURL(file);
    }
}

function addLink() {
    let linkURL = prompt("Enter the URL:");
    if (linkURL) {
        if (!linkURL.startsWith('http://') && !linkURL.startsWith('https://')) {
            linkURL = 'http://' + linkURL;
        }
        const linkText = prompt("Enter the text for the link:");
        const newElement = document.createElement('div');
        newElement.classList.add('resizable-box', 'link-element');
        newElement.style.position = 'absolute';
        newElement.innerHTML = `
            <a href="${linkURL}" target="_blank" data-preview-link style="color: inherit; text-decoration: none; border: none; outline: none;" onclick="return false;">${linkText}</a>
            <div class="resizer resizer-tl"></div>
            <div class="resizer resizer-tr"></div>
            <div class="resizer resizer-bl"></div>
            <div class="resizer resizer-br"></div>
        `;
        const editableZone = document.getElementById('editableZone');
        editableZone.appendChild(newElement);
        initializeBox(newElement);
        saveContent(); // Save changes after adding the link
    }
}

function addElement(type) {
    const editableZone = document.getElementById('editableZone');
    let newElement;

    switch (type) {
        case 'box':
            newElement = document.createElement('div');
            newElement.classList.add('resizable-box');
            newElement.innerHTML = `
                <div class="resizer resizer-tl"></div>
                <div class="resizer resizer-tr"></div>
                <div class="resizer resizer-bl"></div>
                <div class="resizer resizer-br"></div>
            `;
            break;
        case 'text':
            newElement = document.createElement('div');
            newElement.classList.add('resizable-box', 'text-element');
            newElement.innerHTML = `
                <div contentEditable="true">...edit me...</div>
                <div class="resizer resizer-tl"></div>
                <div class="resizer resizer-tr"></div>
                <div class="resizer resizer-bl"></div>
                <div class="resizer resizer-br"></div>
            `;
            break;
        case 'button':
            newElement = document.createElement('div');
            newElement.classList.add('resizable-box', 'button-element');
            newElement.innerHTML = `
                <div contentEditable="true">...edit me...</div>
                <div class="resizer resizer-tl"></div>
                <div class="resizer resizer-tr"></div>
                <div class="resizer resizer-bl"></div>
                <div class="resizer resizer-br"></div>
            `;
    }

    if (newElement) {
        editableZone.appendChild(newElement);
        initializeBox(newElement);
        saveContent();
    }
}

function initializeBox(box) {
    const resizers = box.querySelectorAll('.resizer');
    const editableZone = document.getElementById('editableZone');
    const verticalMark = document.getElementById('verticalMark');
    const horizontalMark = document.getElementById('horizontalMark');
    let isResizing = false;
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    box.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.resizable-box').forEach(item => {
            item.classList.remove('active');
        });
        box.classList.add('active');

        if (box.classList.contains('three-js-container')) {
            selectedThreeJsElement = box;
            selectedThreeJsMesh = box.__threeJsMesh;
            document.getElementById('threeJsWidth').value = selectedThreeJsMesh.scale.x;
            document.getElementById('threeJsHeight').value = selectedThreeJsMesh.scale.y;
            document.getElementById('threeJsDepth').value = selectedThreeJsMesh.scale.z;
            document.getElementById('threeJsColor').value = '#' + selectedThreeJsMesh.material.color.getHexString();
            showControlPanel();
        } else {
            showControlPanel();
        }

        if (box.hasAttribute('data-target-page')) {
            e.preventDefault();
        }
    });

    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', initResize);
    });

    function initResize(e) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        const resizer = e.target;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(box).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(box).height, 10);
        startLeft = box.offsetLeft;
        startTop = box.offsetTop;

        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);

        function resize(e) {
            if (isResizing) {
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;

                if (resizer.classList.contains('resizer-br')) {
                    newWidth = startWidth + e.clientX - startX;
                    newHeight = startHeight + e.clientY - startY;
                } else if (resizer.classList.contains('resizer-bl')) {
                    newWidth = startWidth - (e.clientX - startX);
                    newHeight = startHeight + (e.clientY - startY);
                    newLeft = startLeft + (e.clientX - startX);
                } else if (resizer.classList.contains('resizer-tr')) {
                    newWidth = startWidth + (e.clientX - startX);
                    newHeight = startHeight - (e.clientY - startY);
                    newTop = startTop + (e.clientY - startY);
                } else if (resizer.classList.contains('resizer-tl')) {
                    newWidth = startWidth - (e.clientX - startX);
                    newHeight = startHeight - (e.clientY - startY);
                    newLeft = startLeft + (e.clientX - startX);
                    newTop = startTop + (e.clientY - startY);
                }

                const zoneRect = editableZone.getBoundingClientRect();

                if (newWidth + newLeft > zoneRect.width) {
                    newWidth = zoneRect.width - newLeft;
                }
                if (newHeight + newTop > zoneRect.height) {
                    newHeight = zoneRect.height - newTop;
                }
                if (newLeft < 0) {
                    newLeft = 0;
                }
                if (newTop < 0) {
                    newTop = 0;
                }

                box.style.width = newWidth + 'px';
                box.style.height = newHeight + 'px';
                box.style.left = newLeft + 'px';
                box.style.top = newTop + 'px';
            }
        }

        function stopResize() {
            isResizing = false;
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResize);
            saveContent();
        }
    }

    box.addEventListener('mousedown', function(e) {
        if (!e.target.classList.contains('resizer')) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = box.offsetLeft;
            startTop = box.offsetTop;
            const zoneRect = editableZone.getBoundingClientRect();

            window.addEventListener('mousemove', drag);
            window.addEventListener('mouseup', stopDrag);

            function drag(e) {
                if (isDragging) {
                    let newLeft = startLeft + e.clientX - startX;
                    let newTop = startTop + e.clientY - startY;

                    const boxRect = box.getBoundingClientRect();

                    if (newLeft < 0) {
                        newLeft = 0;
                    } else if (newLeft + boxRect.width > zoneRect.width) {
                        newLeft = zoneRect.width - boxRect.width;
                    }

                    if (newTop < 0) {
                        newTop = 0;
                    } else if (newTop + boxRect.height > zoneRect.height) {
                        newTop = zoneRect.height - boxRect.height;
                    }

                    box.style.left = newLeft + 'px';
                    box.style.top = newTop + 'px';

                    // Check if the element is completely centered horizontally
                    const centerX = zoneRect.width / 2;
                    const elementCenterX = newLeft + boxRect.width / 2;
                    if (Math.abs(centerX - elementCenterX) < 5) {
                        verticalMark.style.left = `${centerX + zoneRect.left}px`;
                        verticalMark.style.top = `${zoneRect.top}px`;
                        verticalMark.style.height = `${zoneRect.height}px`;
                        verticalMark.style.display = 'block';
                    } else {
                        verticalMark.style.display = 'none';
                    }

                    // Check if the element is completely centered vertically
                    const centerY = zoneRect.height / 2;
                    const elementCenterY = newTop + boxRect.height / 2;
                    if (Math.abs(centerY - elementCenterY) < 5) {
                        horizontalMark.style.top = `${centerY + zoneRect.top}px`;
                        horizontalMark.style.left = `${zoneRect.left}px`;
                        horizontalMark.style.width = `${zoneRect.width}px`;
                        horizontalMark.style.display = 'block';
                    } else {
                        horizontalMark.style.display = 'none';
                    }
                }
            }

            function stopDrag() {
                isDragging = false;
                window.removeEventListener('mousemove', drag);
                window.removeEventListener('mouseup', stopDrag);
                verticalMark.style.display = 'none';
                horizontalMark.style.display = 'none';
                saveContent();
            }
        }
    });

    box.addEventListener('click', selectElement);
}

function selectElement(event) {
    if (!event.target.classList.contains('resizer')) {
        if (selectedElement !== event.currentTarget) {
            if (selectedElement) {
                selectedElement.classList.remove('selected');
            }
            selectedElement = event.currentTarget;
            selectedElement.classList.add('selected');
            showControlPanel();
        }
    }
}

function deselectElement(event) {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
        hideControlPanel();
    }
}

function showControlPanel() {
    const controlPanel = document.getElementById('controlPanel');
    controlPanel.style.display = 'block';

    const fontSelect = document.getElementById('fontSelect');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const colorPicker = document.getElementById('colorPicker');
    const uniformScaleInput = document.getElementById('threeJsUniformScale');
    const zIndexInput = document.getElementById('zIndexInput');

    fontSelect.value = getComputedStyle(selectedElement).fontFamily || 'Arial';
    fontSizeSelect.value = getComputedStyle(selectedElement).fontSize || '16px';
    colorPicker.value = rgbToHex(getComputedStyle(selectedElement).color || '#000000');
    zIndexInput.value = selectedElement.style.zIndex || '1';

    if (selectedThreeJsMesh) {
        uniformScaleInput.value = selectedThreeJsMesh.scale.x;
    }

    targetPageSelect.value = selectedElement.getAttribute('data-target-page') || '';
}

function hideControlPanel() {
    const controlPanel = document.getElementById('controlPanel');
    controlPanel.style.display = 'none';
}

function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    });
    return '#' + result.join('');
}



function showContentArea() {
    document.getElementById("pageContainer").style.display = 'block';
}

function hideContentArea() {
    document.getElementById("pageContainer").style.display = 'none';
}

// Three.js part
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

let scene, camera, renderer, cube;

function initThreeJsScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('editableZone').appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }

    animate();
}

function addThreeJsElement(type) {
    const editableZone = document.getElementById('editableZone');
    const container = document.createElement('div');
    container.classList.add('resizable-box', 'three-js-container');
    container.style.position = 'absolute';

    container.setAttribute('data-threejs-type', type);
    container.innerHTML = `
        <div class="resizer resizer-tl"></div>
        <div class="resizer resizer-tr"></div>
        <div class="resizer resizer-bl"></div>
        <div class="resizer resizer-br"></div>
    `;

    editableZone.appendChild(container);
    initializeBox(container);

    createThreeJsScene(container, type);
    saveContent();
}

function createThreeJsScene(container, type) {
    // Clear existing children to avoid duplicate renders
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable alpha for transparency
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // Set clear color with zero opacity (transparent)
    container.appendChild(renderer.domElement);

    let geometry;
    const material = new THREE.MeshPhongMaterial({ color: 0x0096ff });

    // Create geometry based on the selected type
    switch (type) {
        case 'cube':
            geometry = new THREE.BoxGeometry();
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(1, 32, 32);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
            break;
        default:
            geometry = new THREE.BoxGeometry();
    }

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    container.__threeJsMesh = mesh;

    camera.position.z = 5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}