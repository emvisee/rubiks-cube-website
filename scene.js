let scene, renderer, camera, innerHeight;

function init() {
    scene = new THREE.Scene();
    innerHeight = window.innerHeight - 136;
    camera = new THREE.PerspectiveCamera(50, window.innerWidth/innerHeight, 0.5, 30);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(window.innerWidth, innerHeight);
    renderer.setClearColor( 0x000000, 0 );
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Light
    let light = new THREE.PointLight(0xFFFFFF, 0.7, 0, 1);
    let light2 = light.clone();
    let light3 = light.clone();
    let light4 = light.clone();
    let posConst = 25;
    light.position.set(0, posConst, 0);
    light2.position.set(-posConst, 0, posConst);
    light3.position.set(posConst, 0, posConst);
    light4.position.set(0, -posConst, 0);
    scene.add(light);
    scene.add(light2);
    scene.add(light3);
    scene.add(light4);
}

init();
renderer.render(scene, camera);