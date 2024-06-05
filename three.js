import * as THREE from './three.js';

if (typeof window !== "undefined") {
    // browser code
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

class CustomSinCurve extends THREE.Curve {

    constructor( scale = 1 ) {
        super();
        this.scale = scale;
    }

    getPoint( t, optionalTarget = new THREE.Vector3() ) {

        const tx = t * 3 - 1.5;
        const ty = Math.sin( 2 * Math.PI * t );
        const tz = 0;

        return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
    }
}

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );

const path = new CustomSinCurve(5);
const geometry = new THREE.TubeGeometry(path,20,1,5,false)
const material = new THREE.MeshBasicMaterial( { color: 0xfff000   } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 15;

function animate() {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.0;

    renderer.render( scene, camera );
}

animate();