document.addEventListener('DOMContentLoaded', () => {
    disableTextEditing();

    // Initialize elements with target page on initial load
    initializeTargetPageElements();

    // Add animations
    applyAnimations();
});

function disableTextEditing() {
    const content = document.getElementById('editableZone');
    const allElements = content.querySelectorAll('*');
    allElements.forEach(element => {
        element.setAttribute('contenteditable', 'false');
        element.style.userSelect = 'none';
    });
}

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
        link.addEventListener('click', function(event) {
            event.preventDefault();
            window.open(this.href, '_blank');
        });
    });
}

function applyAnimations() {
    const animatedElements = document.querySelectorAll('[data-animation]');
    animatedElements.forEach(element => {
        const animationClass = element.getAttribute('data-animation');
        if (animationClass && animationClass !== 'none') {
            element.classList.add(animationClass);
            const duration = element.style.getPropertyValue('--duration') || '1s';
            const startTime = element.style.getPropertyValue('--start-time') || '0s';
            const hoverActive = element.classList.contains('hover-activated');

            element.style.setProperty('--duration', duration);
            element.style.setProperty('--start-time', startTime);

            if (hoverActive) {
                element.addEventListener('mouseover', () => {
                    element.style.animationPlayState = 'running';
                });
                element.addEventListener('mouseout', () => {
                    element.style.animationPlayState = 'paused';
                });
                element.style.animationPlayState = 'paused';
            }
        }
    });
}

function loadPageContent(pageId) {
    fetch(`/loadPageContent?${pageId}`)
        .then(response => response.json())
        .then(data => {
            const editableZone = document.getElementById('editableZone');
            editableZone.innerHTML = ''; // Clear previous content

            if (data.content) {
                editableZone.innerHTML = data.content;

                // Initialize Three.js elements
                setTimeout(() => {
                    initializeThreeJsElements(data.threeJsElements);
                }, 100); // Adjust delay as necessary

                // Reinitialize target page elements
                initializeTargetPageElements();
            }
        })
        .catch(error => {
            console.error('Error loading page content:', error);
        });
}

function initializeThreeJsElements(threeJsElements) {
    const threeJsContainers = document.querySelectorAll('.three-js-container');
    threeJsContainers.forEach((container, index) => {
        const type = container.getAttribute('data-threejs-type');
        const properties = threeJsElements ? threeJsElements[index] : {};
        createThreeJsScene(container, type, properties);
    });
}

// Function to initialize a Three.js scene within a container
function createThreeJsScene(container, type, properties) {
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

    // Apply properties
    if (properties.scale) {
        mesh.scale.set(properties.scale.x, properties.scale.y, properties.scale.z);
    }
    if (properties.color && !properties.texture) {
        mesh.material.color.setHex(properties.color);
    }

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
