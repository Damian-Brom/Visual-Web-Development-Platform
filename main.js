function addElement(elementType) {
    var newElement = document.createElement(elementType);
    if (elementType === 'input') {
        newElement.type = 'text';
        newElement.innerHTML = 'Editable text';
    } else if (elementType === 'button') {
        newElement.innerHTML = 'Button';
    }
    newElement.className = 'draggable';
    newElement.setAttribute('draggable', true);
    newElement.ondragstart = drag;
    document.getElementById('editableZone').appendChild(newElement);
}

function drag(ev) {
    ev.dataTransfer.setData('text', ev.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData('text');
    var draggableElement = document.getElementById(data);
    if (ev.target.id === 'editableZone') {
        ev.target.appendChild(draggableElement);
    }
}

