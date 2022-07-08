/*
Menu:
Moves, Styles, Actions
*/

// let scene, renderer, camera, innerHeight;


// // earth, nature
// // annie's homescreen
// // electric
// // MURICA THEME

// function init() {
//     scene = new THREE.Scene();
//     // scene.background = new THREE.Color("rgb(200, 200, 200)");

//     innerHeight = window.innerHeight - 126;
//     camera = new THREE.PerspectiveCamera(50, window.innerWidth/innerHeight, 0.5, 30);
//     camera.position.z = 10;

//     renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
//     renderer.setSize(window.innerWidth, innerHeight);
//     renderer.setClearColor( 0x000000, 0 );
//     renderer.setPixelRatio(window.devicePixelRatio);
//     document.body.appendChild(renderer.domElement);

//     window.addEventListener("resize", onWindowResize, false);

//     // Light
//     // let ambientLight =  new THREE.AmbientLight(0xFFFFFF, 0.3);
//     // let hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 2);
//     let light = new THREE.PointLight(0xFFFFFF, 0.7, 0, 1);
//     let light2 = light.clone();
//     let light3 = light.clone();
//     let light4 = light.clone();
//     let posConst = 25;
//     light.position.set(0, posConst, 0);
//     light2.position.set(-posConst, 0, posConst);
//     light3.position.set(posConst, 0, posConst);
//     light4.position.set(0, -posConst, 0);
//     // scene.add(hemiLight);
//     // scene.add(ambientLight);
//     scene.add(light);
//     scene.add(light2);
//     scene.add(light3);
//     scene.add(light4);
//     // scene.add(light5);

//     // Cube rotation + resize
//     mouseDown = false,
//         mouseX = 0,
//         mouseY = 0;

//     window.addEventListener('mousewheel', onMouseWheel, false);
//     window.addEventListener('mousemove', function (e) { onMouseMove(e); }, false);
//     window.addEventListener('mousedown', function (e) { onMouseDown(e); }, false);
//     window.addEventListener('mouseup', function (e) { onMouseUp(e); }, false);

//     // OrbitControls
//     // let controls = new THREE.OrbitControls(camera, renderer.domElement);
// }

window.addEventListener('mousewheel', onMouseWheel, false);
window.addEventListener('mousemove', function (e) { onMouseMove(e); }, false);
window.addEventListener('mousedown', function (e) { onMouseDown(e); }, false);
window.addEventListener('mouseup', function (e) { onMouseUp(e); }, false);
window.addEventListener("resize", onWindowResize, false);

let mouseDown = false;
let raycastObjects = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let faceX, faceY, face, deltaAxis, faceNorm;
let numMouseMove = 0;
let initialDeltaX, initialDeltaY, mouseX, mouseY, deltaX, deltaY, deltaCoord;
let firstMouseX, firstMouseY, timestamp = null;

function onMouseDown(evt) {
    let element = document.elementFromPoint(evt.clientX, evt.clientY);
    if (element != renderer.domElement) {
        return;
    }

    if (idle) {
        document.getElementById('idle-rotate').className = "button-actions";
        document.getElementById('idle-rotate-icon').className = "bx bx-play";
        tweenIdleA.stop();
        tweenIdleB.stop();
        idle = false;
    }
    // disable cube rotation when clicked on cube
    mouse.x = (evt.offsetX / renderer.domElement.width) * 2 - 1;
    mouse.y = -(evt.offsetY / renderer.domElement.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(raycastObjects, false);

    if (intersects.length > 0) {
        if (locked) {
            return;
        }
        reset();
        mouseDown = 2;
        let cubiePos = new THREE.Vector3();
        intersects[0].object.parent.getWorldPosition(cubiePos);
        // console.log('cubie world coord:', worldPos);
        faceNorm = intersects[0].face.normal.clone();
        // console.log('face normal:', normal);
        // var normalMatrix = new THREE.Matrix3().getNormalMatrix( intersects[0].object.matrixWorld );
        var cubeNormal = new THREE.Matrix3().getNormalMatrix( cube.matrixWorld ); // cube rotation
        // console.log('normalMatrix3:', normalMatrix.elements);
        cubiePos.applyMatrix3(cubeNormal.clone().invert())
        // normalParent.normalize();
        let faceNormal = new THREE.Matrix3().getNormalMatrix(intersects[0].object.matrixWorld);
        faceNorm.applyMatrix3( faceNormal ).normalize();
        // console.log('face globalNormal:', normal);

        faceNorm.applyMatrix3(cubeNormal.clone().invert());
        // use faceNorm, cubiePos
        cubiePos.x = Math.round(cubiePos.x);
        cubiePos.y = Math.round(cubiePos.y);
        cubiePos.z = Math.round(cubiePos.z);
        faceNorm.x = Math.round(faceNorm.x);
        faceNorm.y = Math.round(faceNorm.y);
        faceNorm.z = Math.round(faceNorm.z);

        console.log('cubie local coord:', cubiePos);
        console.log('face localNormal (inverted):', faceNorm);

        if (faceNorm.x != 0) {
            faceX = cubiePos.y > 0 ? up : down;
            faceY = cubiePos.z == 1 ? front : back;
        }
        else if (faceNorm.y != 0) {
            let epsilon = 0.00001;
            let cubeYRounded = Math.round(cube.rotation.y / (Math.PI / 2)) * Math.PI / 2;
            if (Math.abs(cubeYRounded - Math.PI / 2) < epsilon) {
                faceX = cubiePos.x == 1 ? right : left;
                faceY = cubiePos.z == 1 ? front : back;
            }
            else if (Math.abs(cubeYRounded - Math.PI * 3 / 2) < epsilon) {
                faceX = cubiePos.x == 1 ? right : left;
                faceY = cubiePos.z == 1 ? front : back;
            }
            else {
                faceX = cubiePos.z == 1 ? front : back;
                faceY = cubiePos.x == 1 ? right : left;
            }
        }
        else {
            faceX = cubiePos.y > 0 ? up : down;
            faceY = cubiePos.x == 1 ? right : left;
        }
    }
    else {
        mouseDown = 1;
    }
    evt.preventDefault();

    timestamp = Date.now();
    mouseX = evt.clientX;
    mouseY = evt.clientY;
    firstMouseX = mouseX;
    firstMouseY = mouseY;
}

function onMouseMove(evt) {
    if (mouseDown == 0) {
        return;
    }
    if (mouseDown == 2 && locked) {
        return;
    }
    evt.preventDefault();

    deltaX = evt.clientX - mouseX,
    deltaY = evt.clientY - mouseY;

    initialDeltaX += evt.clientX - mouseX,
    initialDeltaY += evt.clientY - mouseY;

    mouseX = evt.clientX;
    mouseY = evt.clientY;

    // get initial x or y movement
    if (numMouseMove < 5) {
        face = Math.abs(initialDeltaX) >= Math.abs(initialDeltaY) ? faceX : faceY;
        deltaAxis = Math.abs(initialDeltaX) >= Math.abs(initialDeltaY) ? 'x' : 'y';
        // console.log(deltaAxis);
    }
    numMouseMove++;

    if (mouseDown == 1) {
        rotateCube(deltaX, deltaY);
    }
    else if (numMouseMove == 5) {
        getFace(face);
    }
    else if (numMouseMove >= 5) {
        rotateFace(deltaX, deltaY, deltaAxis, face, faceNorm);
    }
}

function onMouseUp(evt) {
    evt.preventDefault();

    if (mouseDown == 2) {
        let dt = Date.now() - timestamp;
        let dx = mouseX - firstMouseX;
        let dy = mouseY - firstMouseY;
        let speedX = dx / dt;
        let speedY = dy / dt;
        let speed = Math.sqrt(speedX * speedX + speedY * speedY);

        // Tweening
        let duration = sliderDuration / 2;
        locked = true;

        let axisR = face.rotation.z;
        if (convertRotation.get(face).axis == 0) {
            axisR = face.rotation.x;
        }
        else if (convertRotation.get(face).axis == 1) {
            axisR = face.rotation.y;
        }
        
        let correction;
        if (speed >= 0.25) {
            duration = sliderDuration;
            if (deltaCoord > 0) {
                correction = Math.ceil(axisR / (Math.PI / 2)) * Math.PI / 2;
            }
            else {
                correction = Math.floor(axisR / (Math.PI / 2)) * Math.PI / 2;
            }
        }
        else {
            correction = Math.round(axisR / (Math.PI / 2)) * Math.PI / 2;
        }
        

        let curR = { axis: axisR };
        let newR = { axis: correction };
        
        new TWEEN.Tween(curR)
            .to(newR, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                if (convertRotation.get(face).axis == 0) {
                    face.rotation.x = curR.axis;
                }
                else if (convertRotation.get(face).axis == 1) {
                    face.rotation.y = curR.axis;
                }
                else {
                    face.rotation.z = curR.axis;
                }
            })
            .start();
        
        setTimeout(unlock, duration + 5);
    }

    mouseDown = 0;
    numMouseMove = 0;
    initialDeltaX = 0;
    initialDeltaY = 0;
    timestamp = null;
    // console.log(cube.rotation.y);
}

function rotateCube(deltaX, deltaY) {
    const deg360 = Math.PI * 2;
    const cubeX = posMod(cube.rotation.x, deg360);
    // if bottom is on top
    const fac = 125 * 70 / camera.fov;
    if (cubeX > Math.PI / 2 && cubeX < Math.PI * 3 / 2) {
        cube.rotation.y -= deltaX / fac;
    }
    else {
        cube.rotation.y += deltaX / fac; 
    }
    cube.rotation.x += deltaY / fac;

    cube.rotation.y = posMod(cube.rotation.y, deg360);
    cube.rotation.x = posMod(cube.rotation.x, deg360);
}

function rotateFace(deltaX, deltaY, deltaAxis, face, faceNorm) {
    const fac = 125 * 70 / camera.fov;

    deltaCoord = deltaAxis == 'x' ? deltaX : deltaY;
        
    // correct deltaCoord for back, right
    if (faceNorm.x == 1 || faceNorm.z == -1) {
        if (face != up && face != down) {
            deltaCoord *= -1;
        }
    }
    // correct deltaCoord for up, down
    epsilon = 0.0001;
    let cubeYRounded = Math.round(cube.rotation.y / (Math.PI / 2)) * Math.PI / 2;
    if (faceNorm.y == 1) {
        if (face == front || face == back) {
            // if cubeY is 0, 270, 360
            if (Math.abs(cubeYRounded) < epsilon || Math.abs(cubeYRounded - Math.PI * 2) < epsilon || Math.abs(cubeYRounded - Math.PI * 3 / 2) < epsilon) {
                deltaCoord *= -1;
            }
        }
        if (face == left || face == right) {
            // if cubeY is 180, 270
            if (Math.abs(cubeYRounded - Math.PI) < epsilon || Math.abs(cubeYRounded - Math.PI * 3 / 2) < epsilon) {
                deltaCoord *= -1;
            }
        }
    }
    // correct deltaCoord for bottom face
    if (faceNorm.y == -1) {
        if (face == front || face == back) {
            // if cubeY is 180, 270
            if (Math.abs(cubeYRounded - Math.PI) < epsilon || Math.abs(cubeYRounded - Math.PI * 3 / 2) < epsilon) {
                deltaCoord *= -1;
            }
        }
        if (face == left || face == right) {
            // if cubeY is 90, 180
            if (Math.abs(cubeYRounded - Math.PI) < epsilon || Math.abs(cubeYRounded - Math.PI / 2) < epsilon) {
                deltaCoord *= -1;
            }
        }   
    }
    // correct deltaCoord for upside down
    const cubeX = posMod(cube.rotation.x, Math.PI * 2);
    // if bottom is on top
    if (cubeX > Math.PI / 2 && cubeX < Math.PI * 3 / 2) {
        if (face == front || face == back || face == left || face == right) {
            // not up or down
            if (faceNorm.y == 0) {
                deltaCoord *= -1;
            }
        }
        if (face == up || face == down) {
            deltaCoord *= -1;
        }
    }
    
    // rotate
    if (convertRotation.get(face).axis == 0) {
        face.rotation.x += deltaCoord / fac;
    }
    else if (convertRotation.get(face).axis == 1) {
        face.rotation.y += deltaCoord / fac;
    }
    else {
        face.rotation.z += deltaCoord / fac;
    }
}

function onMouseWheel(evt) {
    let fovMAX = 70;
    let fovMIN = 30;

    camera.fov -= evt.wheelDeltaY * 0.05;
    camera.fov = Math.max(Math.min(camera.fov, fovMAX), fovMIN);
    camera.updateProjectionMatrix();
}

function onWindowResize() {
    const {innerWidth, innerHeight} = window;
    let header = document.getElementById('flex-menu-header');
    camera.aspect = innerWidth / (innerHeight - header.offsetHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - header.offsetHeight);
}

function posMod(a, b) {
    return ((a % b) + b) % b;
}

// Cube
// let geometry = new THREE.BoxGeometry(1, 1, 1);
// let material = new THREE.MeshStandardMaterial({vertexColors: THREE.FaceColors});

let cube, front, back, left, right, up, down, stickerColors, stickerMats, stickerMatsBasic, baseColor, convertRotation, matCubie, matCubieBasic;

function cubeInit() {
    cube = new THREE.Group();
    cube.name = "cube";
    front = new THREE.Group();
    back = new THREE.Group();
    left = new THREE.Group();
    right = new THREE.Group();
    up = new THREE.Group();
    down = new THREE.Group();

    convertRotation = new Map();
    convertRotation.set(front, { axis: 2, val: 1 });
    convertRotation.set(back, { axis: 2, val: -1 });
    convertRotation.set(left, { axis: 0, val: -1 });
    convertRotation.set(right, { axis: 0, val: 1 });
    convertRotation.set(up, { axis: 1, val: 1 });
    convertRotation.set(down, { axis: 1, val: -1 });

    // Colors (R, L, U, D, F, B)
    stickerColors = [
        new THREE.Color("rgb(0, 155, 72)"),
        new THREE.Color("rgb(0, 69, 173)"),
        new THREE.Color("rgb(255, 230, 0)"),
        new THREE.Color("rgb(255, 255, 255)"),
        new THREE.Color("rgb(185, 0, 0)"),
        new THREE.Color("rgb(255, 89, 0)")
    ];
    stickerMats = [
        new THREE.MeshStandardMaterial({color: stickerColors[0], roughness: 0.5, metalness: 0, transparent: true, opacity: 1}),
        new THREE.MeshStandardMaterial({color: stickerColors[1], roughness: 0.5, metalness: 0, transparent: true, opacity: 1}),
        new THREE.MeshStandardMaterial({color: stickerColors[2], roughness: 0.5, metalness: 0, transparent: true, opacity: 1}),
        new THREE.MeshStandardMaterial({color: stickerColors[3], roughness: 0.5, metalness: 0, transparent: true, opacity: 1}),
        new THREE.MeshStandardMaterial({color: stickerColors[4], roughness: 0.5, metalness: 0, transparent: true, opacity: 1}),
        new THREE.MeshStandardMaterial({color: stickerColors[5], roughness: 0.5, metalness: 0, transparent: true, opacity: 1})
    ];
    stickerMatsBasic = [
        new THREE.MeshBasicMaterial({color: stickerColors[0], transparent: true, opacity: 1}),
        new THREE.MeshBasicMaterial({color: stickerColors[1], transparent: true, opacity: 1}),
        new THREE.MeshBasicMaterial({color: stickerColors[2], transparent: true, opacity: 1}),
        new THREE.MeshBasicMaterial({color: stickerColors[3], transparent: true, opacity: 1}),
        new THREE.MeshBasicMaterial({color: stickerColors[4], transparent: true, opacity: 1}),
        new THREE.MeshBasicMaterial({color: stickerColors[5], transparent: true, opacity: 1})
    ];

    scene.add(cube);
    cube.attach(front);
    cube.attach(back);
    cube.attach(left);
    cube.attach(right);
    cube.attach(up);
    cube.attach(down);
    cube.position.set(0, 0, 0);
    
    // Cubie
    baseColor = new THREE.Color("#404040");
    matCubie = new THREE.MeshStandardMaterial({color: baseColor, roughness: 0.7, transparent: true, opacity: 1});
    matCubieBasic = new THREE.MeshBasicMaterial({color: baseColor, transparent: true, opacity: 1});
    const geoCubie = createBoxWithRoundedEdges(1, 1, 1, 0.11, 2);
    const geoBox = new THREE.BoxBufferGeometry(1, 1, 1);
    // Sticker
    const geoSticker = roundedRectangle(0.75, 0.75, 0.1, 3);

    for (let x = -1; x <= 1; ++x) {
        for (let y = -1; y <= 1; ++y) {
            for (let z = -1; z <= 1; ++z) {
                createCubie(x, y, z, geoCubie, matCubie, matCubieBasic, geoSticker, geoBox);
            }
        }
    }

    cube.rotation.set(Math.PI / 6, -Math.PI / 4, 0);
}

let meshCubies = [];
let standardStickers = [];
let basicStickers = [];
function createCubie(x, y, z, geoCubie, matCubie, matCubieBasic, geoSticker, geoBox) {
    let cubie = new THREE.Group();
    let stickers = new THREE.Group();
    cube.attach(cubie);
    cubie.attach(stickers);
    
    // Cubie
    const meshCubie = new THREE.Mesh(geoCubie, matCubie);
    cubie.attach(meshCubie);
    cubie.position.set(x, y, z);
    meshCubies.push(meshCubie);

    // Bounding box
    let cubieBounds = new THREE.Mesh(geoBox, matCubieBasic);
    cubieBounds.visible = false;
    cubie.add(cubieBounds);
    // raycastObjects.push(cubie);
    raycastObjects.push(cubieBounds);

    // Stickers
    let sticker;
    let stickerMat;
    let stickerMatBasic;
    const offset = 0.505;
    const stickerP = new THREE.Vector3();
    const stickerR = new THREE.Euler();
    const deg90 = Math.PI / 2;
    if (x == 1) {
        stickerMat = stickerMats[0];
        stickerMatBasic = stickerMatsBasic[0];
    }
    else if (x == -1) {
        stickerMat = stickerMats[1];
        stickerMatBasic = stickerMatsBasic[1];
    }
    if (x != 0) {
        stickerP.set(offset * x, 0, 0);
        stickerR.set(0, deg90 * x, 0);
        sticker = new THREE.Mesh(geoSticker, stickerMat);
        stickerBasic = new THREE.Mesh(geoSticker, stickerMatBasic);
        stickerBasic.visible = false;
        stickers.attach(sticker);
        stickers.attach(stickerBasic);
        sticker.position.copy(stickerP);
        stickerBasic.position.copy(stickerP);
        sticker.setRotationFromEuler(stickerR);
        stickerBasic.setRotationFromEuler(stickerR);
        standardStickers.push(sticker);
        basicStickers.push(stickerBasic);
    }

    if (y == 1) {
        stickerMat = stickerMats[2];
        stickerMatBasic = stickerMatsBasic[2];
    }
    else if (y == -1) {
        stickerMat = stickerMats[3];
        stickerMatBasic = stickerMatsBasic[3];
    }
    if (y != 0) {
        stickerP.set(0, offset * y, 0);
        stickerR.set(-deg90 * y, 0, 0);
        sticker = new THREE.Mesh(geoSticker, stickerMat);
        stickerBasic = new THREE.Mesh(geoSticker, stickerMatBasic);
        stickerBasic.visible = false;
        stickers.attach(sticker);
        stickers.attach(stickerBasic);
        sticker.position.copy(stickerP);
        stickerBasic.position.copy(stickerP);
        sticker.setRotationFromEuler(stickerR);
        stickerBasic.setRotationFromEuler(stickerR);
        standardStickers.push(sticker);
        basicStickers.push(stickerBasic);
    }

    if (z == 1) {
        stickerMat = stickerMats[4];
        stickerMatBasic = stickerMatsBasic[4];
    }
    else if (z == -1) {
        stickerMat = stickerMats[5];
        stickerMatBasic = stickerMatsBasic[5];
    }
    if (z != 0) {
        stickerP.set(0, 0, offset * z);
        stickerR.set(0, (1 - z) * deg90, 0);
        sticker = new THREE.Mesh(geoSticker, stickerMat);
        stickerBasic = new THREE.Mesh(geoSticker, stickerMatBasic);
        stickerBasic.visible = false;
        stickers.attach(sticker);
        stickers.attach(stickerBasic);
        sticker.position.copy(stickerP);
        stickerBasic.position.copy(stickerP);
        sticker.setRotationFromEuler(stickerR);
        stickerBasic.setRotationFromEuler(stickerR);
        standardStickers.push(sticker);
        basicStickers.push(stickerBasic);
    }
}

function changeColorScheme(colorScheme) {
    // R L U D F B
    if (colorScheme == 'pastel') {
        stickerColors[0].set("rgb(193, 225, 193)");
        stickerColors[1].set("rgb(174, 198, 207)");
        stickerColors[2].set("rgb(248, 241, 174)");
        stickerColors[3].set("rgb(240, 240, 240)");
        stickerColors[4].set("rgb(255, 154, 162)");
        stickerColors[5].set("rgb(255, 218, 193)");
        baseColor = "rgb(160, 158, 156)";
    }
    else if (colorScheme == 'nature') {
        stickerColors[0].set(0x9EB45B);
        stickerColors[1].set(0x3A997C);
        stickerColors[2].set(0xCBC497);
        stickerColors[3].set(0xD5DCDC);
        stickerColors[4].set(0x8B341F);
        stickerColors[5].set(0xB87F45);
        baseColor = "#404040";       
    }
    else {
        stickerColors[0].set("rgb(0, 155, 72)");
        stickerColors[1].set("rgb(0, 69, 173)");
        stickerColors[2].set("rgb(255, 230, 0)");
        stickerColors[3].set("rgb(255, 255, 255)");
        stickerColors[4].set("rgb(185, 0, 0)");
        stickerColors[5].set("rgb(255, 89, 0)");
        baseColor = "#404040";
    }

    for (let i = 0; i < 6; ++i) {
        stickerMats[i].color = stickerColors[i];
        stickerMatsBasic[i].color = stickerColors[i];
    }
    matCubie.color.set(baseColor);
    matCubieBasic.color.set(baseColor);
}

function createBoxWithRoundedEdges( width, height, depth, radius0, smoothness ) {
    let shape = new THREE.Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
    shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
    shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
    shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
    let geometry = new THREE.ExtrudeBufferGeometry( shape, {
        depth: depth - radius0 * 2,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius0,
        curveSegments: smoothness
    });
    
    geometry.center();
    
    return geometry;
}

function roundedRectangle( w, h, r, s ) { // width, height, radius corner, smoothness  
    // helper const's
    const wi = w / 2 - r;		// inner width
    const hi = h / 2 - r;		// inner height
    const w2 = w / 2;			// half width
    const h2 = h / 2;			// half height
    const ul = r / w;			// u left
    const ur = ( w - r ) / w;	// u right
    const vl = r / h;			// v low
    const vh = ( h - r ) / h;	// v high
    
    let positions = [
        -wi, -h2, 0,  wi, -h2, 0,  wi, h2, 0,
        -wi, -h2, 0,  wi,  h2, 0, -wi, h2, 0,
        -w2, -hi, 0, -wi, -hi, 0, -wi, hi, 0,
        -w2, -hi, 0, -wi,  hi, 0, -w2, hi, 0,
        wi, -hi, 0,  w2, -hi, 0,  w2, hi, 0,
        wi, -hi, 0,  w2,  hi, 0,  wi, hi, 0
    ];
    let uvs = [
        ul,  0, ur,  0, ur,  1,
        ul,  0, ur,  1, ul,  1,
        0, vl, ul, vl, ul, vh,
        0, vl, ul, vh,  0, vh,
        ur, vl,  1, vl,  1, vh,
        ur, vl,  1, vh,	ur, vh 
    ];
    let phia = 0; 
    let phib, xc, yc, uc, vc, cosa, sina, cosb, sinb;
    
    for ( let i = 0; i < s * 4; i ++ ) {
        phib = Math.PI * 2 * ( i + 1 ) / ( 4 * s );
        cosa = Math.cos( phia );
        sina = Math.sin( phia );
        cosb = Math.cos( phib );
        sinb = Math.sin( phib );
        
        xc = i < s || i >= 3 * s ? wi : - wi;
        yc = i < 2 * s ? hi : -hi;
        positions.push( xc, yc, 0, xc + r * cosa, yc + r * sina, 0,  xc + r * cosb, yc + r * sinb, 0 );
        
        uc =  i < s || i >= 3 * s ? ur : ul;
        vc = i < 2 * s ? vh : vl;
        uvs.push( uc, vc, uc + ul * cosa, vc + vl * sina, uc + ul * cosb, vc + vl * sinb );
        
        phia = phib;
    }
    
    const geometry = new THREE.BufferGeometry( );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
    geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
    geometry.computeVertexNormals();
    return geometry;
}

let active = [];
function getFace(face) {
    for (let i in cube.children) {
        let coords = cube.children[i].position;
        let pos = [coords.x, coords.y, coords.z];
        let rotation = convertRotation.get(face);
        let axis = rotation.axis;
        if (Math.round(pos[axis]) == rotation.val) {
            active.push(cube.children[i]);
        }
    }

    for (let i in active) {
        face.attach(active[i]);
    }
}

function reset() {
    for (let i in active) {
        cube.attach(active[i]);
    }
    active = [];
}

// Idle animation
let idle = false;
let tweenIdleA, tweenIdleB;
let curRIdle, newRIdle;
function onClickIdle() {
    curRIdle = { rotY: cube.rotation.y, rotX: cube.rotation.x };
    newRIdle = { rotY: cube.rotation.y + Math.PI * 2, rotX: cube.rotation.x + Math.PI };

    tweenIdleA = new TWEEN.Tween(curRIdle)
        .to(newRIdle, 9000)
        .onComplete(function () {
            cube.rotation.y = posMod(cube.rotation.y, Math.PI * 2);
            cube.rotation.x = posMod(cube.rotation.x, Math.PI * 2);
        })
        .onUpdate(function () {
            cube.rotation.y = curRIdle.rotY;
            cube.rotation.x = curRIdle.rotX;
        });

    let curRIdleB = { rotY: cube.rotation.y, rotX: cube.rotation.x + Math.PI };
    let newRIdleB = { rotY: cube.rotation.y + Math.PI * 2, rotX: cube.rotation.x + Math.PI * 2 };
    tweenIdleB = new TWEEN.Tween(curRIdleB)
        .to(newRIdleB, 7000)
        .onComplete(function () {
            cube.rotation.y = posMod(cube.rotation.y, Math.PI * 2);
            cube.rotation.x = posMod(cube.rotation.x, Math.PI * 2);
        })
        .onUpdate(function () {
            cube.rotation.y = curRIdleB.rotY;
            cube.rotation.x = curRIdleB.rotX;
        });

    tweenIdleA.chain(tweenIdleB);
    tweenIdleB.chain(tweenIdleA);
    tweenIdleA.start();
}

// Reset
function onClickRealign() {
    if (idle) {
        document.getElementById('idle-rotate').className = "button-actions";
        document.getElementById('idle-rotate-icon').className = "bx bx-play";
        tweenIdleA.stop();
        tweenIdleB.stop();
        idle = false;
    }
    let oldPos = { rotX: cube.rotation.x, rotY: cube.rotation.y, FOV: camera.fov };
    let newPos = { rotX: Math.PI / 6, rotY: -Math.PI / 4, FOV: 50 };

    let totalDiff = 0;
    let deg360 = Math.PI * 2;
    let diffA = posMod(Math.PI / 6 - cube.rotation.x, deg360);
    let diffB = posMod(cube.rotation.x - Math.PI / 6, deg360);
    newPos.rotX = diffA < diffB ? oldPos.rotX + diffA : oldPos.rotX - diffB;
    totalDiff += diffA < diffB ? diffA : diffB;

    diffA = posMod(-Math.PI / 4 - cube.rotation.y, deg360);
    diffB = posMod(cube.rotation.y + Math.PI / 4, deg360);
    newPos.rotY = diffA < diffB ? oldPos.rotY + diffA : oldPos.rotY - diffB;
    totalDiff += diffA < diffB ? diffA : diffB;

    tweenReset = new TWEEN.Tween(oldPos)
        .to(newPos, (totalDiff * 180 / Math.PI + 300) * 2)
        // .easing(TWEEN.Easing.Back.InOut)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(function () {
            cube.rotation.x = oldPos.rotX;
            cube.rotation.y = oldPos.rotY;
            camera.fov = oldPos.FOV;
            camera.updateProjectionMatrix();
        })
        .start();
}

// Buttons
let locked = false;
function onClickRotate(face, move, scramble = false) {
    
    let duration;
    if (!scramble) {
        if (locked) { return; }
    }

    // console.log("entered");
    reset();
    getFace(face);
    deltaR = Math.PI;
    duration = sliderDuration;
    if (move == 'clock') {
        deltaR = -Math.PI / 2;
    }
    else if (move == 'counter') {
        deltaR = Math.PI / 2;
    }
    else if (move == 'double') {
        if (duration != 0) {
            duration = sliderDuration + 50;
        }
    }
    if (convertRotation.get(face).val < 0) {
        deltaR *= -1;
    }

    // Tweening
    let axisR = face.rotation.z;
    if (convertRotation.get(face).axis == 0) {
        axisR = face.rotation.x;
    }
    else if (convertRotation.get(face).axis == 1) {
        axisR = face.rotation.y;
    }

    let curR = { axis: axisR };
    let newR = { axis: axisR + deltaR };
    new TWEEN.Tween(curR)
        .to(newR, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
            if (convertRotation.get(face).axis == 0) {
                face.rotation.x = curR.axis;
            }
            else if (convertRotation.get(face).axis == 1) {
                face.rotation.y = curR.axis;
            }
            else {
                face.rotation.z = curR.axis;
            }
        })
        .start();
    
    locked = true;
    if (!scramble) {
        setTimeout(unlock, duration + 5);
    }
}

function unlock () {
    locked = false;
}

//////////////////// MOVES ////////////////////
let movesCondensed = true;
// Toggle
document.getElementById('toggle-slider-moves').addEventListener("click", function () {
    if (movesCondensed) {
        document.getElementById('moves-grid').style.display = "grid";
        document.getElementById('moves-grid-condensed').style.display = "none";
        movesCondensed = false;
    }
    else {
        document.getElementById('moves-grid').style.display = "none";
        document.getElementById('moves-grid-condensed').style.display = "grid";     
        movesCondensed = true;   
    }
});
document.getElementById('toggle-slider-moves').addEventListener("mouseover", function () {
    document.getElementById('moves-title').innerHTML = movesCondensed ? "MODE: CONDENSED" : "MODE: FULL";
});
document.getElementById('toggle-slider-moves').addEventListener("mouseout", function () {
    document.getElementById('moves-title').innerHTML = "MOVES";
});

let cToggle = true;
let ccToggle = false;
let dToggle = false;
let toggleIDs = ['clockwise-toggle', 'counter-clockwise-toggle', 'double-toggle'];
let toggleHTML = ["CLOCK", "COUNTER", "DOUBLE"];
for (let i = 0; i < toggleIDs.length; ++i) {
    document.getElementById(toggleIDs[i]).addEventListener("mouseover", function () {
        document.getElementById('moves-title').innerHTML = "TOGGLE " + toggleHTML[i];
    });
    document.getElementById(toggleIDs[i]).addEventListener("mouseout", function () {
        document.getElementById('moves-title').innerHTML = "MOVES";
    });
}

document.getElementById('clockwise-toggle').addEventListener("click", function() {
    if (!cToggle) {
        cToggle = true;
        ccToggle = false;
        dToggle = false;
        document.getElementById('clockwise-toggle').className = "button-moves active-button";
        document.getElementById('counter-clockwise-toggle').className = "button-moves";
        document.getElementById('double-toggle').className = "button-moves";
        let faceString = ['F', 'B', 'L', 'R', 'U', 'D'];
        for (let i = 0; i < 6; ++i) {
            document.getElementById('condensed-button-' + faceString[i]).innerHTML = faceString[i];
        }
    }
});
document.getElementById('counter-clockwise-toggle').addEventListener("click", function() {
    if (!ccToggle) {
        cToggle = false;
        ccToggle = true;
        dToggle = false;
        document.getElementById('clockwise-toggle').className = "button-moves";
        document.getElementById('counter-clockwise-toggle').className = "button-moves active-button";
        document.getElementById('double-toggle').className = "button-moves";
        let faceString = ['F', 'B', 'L', 'R', 'U', 'D'];
        for (let i = 0; i < 6; ++i) {
            document.getElementById('condensed-button-' + faceString[i]).innerHTML = faceString[i] + '\'';
        }
    }    
});
document.getElementById('double-toggle').addEventListener("click", function() {
    if (!dToggle) {
        cToggle = false;
        ccToggle = false;
        dToggle = true;
        document.getElementById('clockwise-toggle').className = "button-moves";
        document.getElementById('counter-clockwise-toggle').className = "button-moves";
        document.getElementById('double-toggle').className = "button-moves active-button";
        let faceString = ['F', 'B', 'L', 'R', 'U', 'D'];
        for (let i = 0; i < 6; ++i) {
            document.getElementById('condensed-button-' + faceString[i]).innerHTML = faceString[i] + '2';
        }
    }      
});

// Moves
let rotateButtonClasses = ['rotate-front', 'rotate-back', 'rotate-left', 'rotate-right', 'rotate-up', 'rotate-down'];
let rotateHTML = ["FRONT", "BACK", "LEFT", "RIGHT", "UP", "DOWN"];
for (let n = 0; n < rotateButtonClasses.length; ++n) {
    let rotateFace = document.getElementsByClassName(rotateButtonClasses[n]);
    for (let i = 0; i < rotateFace.length; ++i) {
        // FULL
        if (rotateFace[i].parentElement.id == 'moves-grid') {
            rotateFace[i].addEventListener("mouseover", function() {
                if (rotateFace[i].id.slice(-1) == '\'') {
                    document.getElementById('moves-title').innerHTML = rotateHTML[n] + " COUNTER";
                }
                else if (rotateFace[i].id.slice(-1) == '2') {
                    document.getElementById('moves-title').innerHTML = rotateHTML[n] + " DOUBLE";
                }
                else {
                    document.getElementById('moves-title').innerHTML = rotateHTML[n] + " CLOCK";
                }
            });
        }
        // CONDENSED
        else {
            rotateFace[i].addEventListener("mouseover", function() {
                if (ccToggle) {
                    document.getElementById('moves-title').innerHTML = rotateHTML[n] + " COUNTER";
                }
                else if (dToggle) {
                    document.getElementById('moves-title').innerHTML = rotateHTML[n] + " DOUBLE";
                }
                else {
                    document.getElementById('moves-title').innerHTML = rotateHTML[n] + " CLOCK";
                }
            }); 
        }

        rotateFace[i].addEventListener("mouseout", function() {
            document.getElementById('moves-title').innerHTML = "MOVES";
        });
    } 
}

let moveButtonClasses = document.getElementsByClassName('button-moves');
for (let i = 0; i < moveButtonClasses.length; ++i) {
    if (moveButtonClasses[i].id.slice(-6) == 'toggle') { continue; }
    // FULL
    let direction;
    if (moveButtonClasses[i].parentElement.id == 'moves-grid') {
        if (moveButtonClasses[i].id.slice(-1) == '\'') { direction = 'counter'; }
        else if (moveButtonClasses[i].id.slice(-1) == '2') { direction = 'double'; }
        else { direction = 'clock'; }

        moveButtonClasses[i].addEventListener("click", function () {
            if (moveButtonClasses[i].innerHTML.charAt(0) == 'F') {
                onClickRotate(front, direction);
            }
            else if (moveButtonClasses[i].innerHTML.charAt(0) == 'B') {
                onClickRotate(back, direction);
            }
            else if (moveButtonClasses[i].innerHTML.charAt(0) == 'L') {
                onClickRotate(left, direction);
            }
            else if (moveButtonClasses[i].innerHTML.charAt(0) == 'R') {
                onClickRotate(right, direction);
            }
            else if (moveButtonClasses[i].innerHTML.charAt(0) == 'U') {
                onClickRotate(up, direction);
            }
            else {
                onClickRotate(down, direction);
            }
        });
    }
    // CONDENSED
    else {
        moveButtonClasses[i].addEventListener("click", function () {
            if (moveButtonClasses[i].innerHTML.charAt(0) == 'F') {
                if (cToggle) { onClickRotate(front, 'clock'); }
                else if (ccToggle) { onClickRotate(front, 'counter'); }
                else { onClickRotate(front, 'double'); }
            }
            else if (moveButtonClasses[i].innerHTML.charAt(0) == 'B') {
                if (cToggle) { onClickRotate(back, 'clock'); }
                else if (ccToggle) { onClickRotate(back, 'counter'); }
                else { onClickRotate(back, 'double'); }
            }
            else if (moveButtonClasses[i].innerHTML.charAt(0) == 'L') {
                if (cToggle) { onClickRotate(left, 'clock'); }
                else if (ccToggle) { onClickRotate(left, 'counter'); }
                else { onClickRotate(left, 'double'); }
            }
            else if (moveButtonClasses[i].innerHTML.charAt(0) == 'R') {
                if (cToggle) { onClickRotate(right, 'clock'); }
                else if (ccToggle) { onClickRotate(right, 'counter'); }
                else { onClickRotate(right, 'double'); }
            }
            else if (moveButtonClasses[i].innerHTML.charAt(0) == 'U') {
                if (cToggle) { onClickRotate(up, 'clock'); }
                else if (ccToggle) { onClickRotate(up, 'counter'); }
                else { onClickRotate(up, 'double'); }
            }
            else {
                if (cToggle) { onClickRotate(down, 'clock'); }
                else if (ccToggle) { onClickRotate(down, 'counter'); }
                else { onClickRotate(down, 'double'); }
            }
        });
    }
}

//////////////////// SETTINGS ////////////////////
// Toggle
let highQuality = true;
document.getElementById('toggle-slider-quality').addEventListener("click", function () {
    if (highQuality) {
        highQuality = false;
        for (let i = 0; i < meshCubies.length; ++i) {
            meshCubies[i].visible = false;
            raycastObjects[i].visible = true;
        }
        for (let i = 0; i < standardStickers.length; ++i) {
            standardStickers[i].visible = false;
            basicStickers[i].visible = true;
        }
        document.getElementById('settings-title').innerHTML = "LOW QUALITY";
        document.getElementById('slider-shine').classList.add('disabled-button');
        document.getElementById('slider-shine').disabled = true;
    }
    else {
        highQuality = true;
        for (let i = 0; i < meshCubies.length; ++i) {
            meshCubies[i].visible = true;
            raycastObjects[i].visible = false;
        }
        for (let i = 0; i < standardStickers.length; ++i) {
            standardStickers[i].visible = true;
            basicStickers[i].visible = false;
        }
        document.getElementById('settings-title').innerHTML = "HIGH QUALITY";
        document.getElementById('slider-shine').classList.remove('disabled-button');
        document.getElementById('slider-shine').disabled = false;
    }
});
document.getElementById('toggle-slider-quality').addEventListener("mouseover", function () {
    document.getElementById('settings-title').innerHTML = highQuality ? "HIGH QUALITY" : "LOW QUALITY";
});
document.getElementById('toggle-slider-quality').addEventListener("mouseout", function () {
    document.getElementById('settings-title').innerHTML = "SETTINGS";
});

// Slider
let sliderSpeed = document.getElementById("slider-speed");
let sliderDuration = 1000 - 100 * sliderSpeed.value;
sliderSpeed.oninput = function () {
    sliderDuration = 1000 - 100 * sliderSpeed.value;
    // console.log(sliderDuration);
}

let sliderShine = document.getElementById("slider-shine");
let sliderMetalness = sliderShine.value / 10;
sliderShine.oninput = function () {
    sliderMetalness = sliderShine.value / 10;
    for (let i = 0; i < 6; ++i) {
        stickerMats[i].metalness = sliderMetalness;
    }
}

let sliderOpacity = document.getElementById("slider-opacity");
let opacity = sliderOpacity.value / 10;
sliderOpacity.oninput = function () {
    opacity = sliderOpacity.value / 10;
    for (let i = 0; i < 6; ++i) {
        stickerMats[i].opacity = opacity + (1 - opacity) * 0.3;
        stickerMatsBasic[i].opacity = opacity + (1 - opacity) * 0.3;
    }
    matCubie.opacity = opacity;
    matCubieBasic.opacity = opacity;
}

let sliderIDs = ['slider-speed', 'slider-shine', 'slider-opacity'];
let sliderHTML = ["SPEED", "REFLECTION", "OPACITY"];
for (let i = 0; i < sliderIDs.length; ++i) {
    document.getElementById(sliderIDs[i]).addEventListener("mouseover", function () {
        document.getElementById('settings-title').innerHTML = sliderHTML[i];
    });
    document.getElementById(sliderIDs[i]).addEventListener("mouseout", function () {
        document.getElementById('settings-title').innerHTML = "SETTINGS";
    });
}

// Colors
let paletteShow = false;
let paletteTimeout;
document.getElementById('palette-dropdown').addEventListener("mouseover", function (event) {
    if (paletteShow) {
        clearTimeout(paletteTimeout);
        document.getElementById('dropdown-menu').style.display = "none";
        paletteShow = false;
    }
    console.log("mouseover");
    document.getElementById('dropdown-menu').style.display = "block";
    document.getElementById('dropdown-menu').classList.remove('dropdown-menu--off');
    paletteShow = true;
});

document.getElementById('palette-dropdown').addEventListener("mouseout", function () {
    document.getElementById('settings-title').innerHTML = "SETTINGS";
    console.log("mouseout");
    document.getElementById('dropdown-menu').classList.add('dropdown-menu--off');
    paletteTimeout = setTimeout(function () {
        document.getElementById('dropdown-menu').style.display = "none";
        paletteShow = false;
    }, 500);
});

let colorIDs = ['color-menu-container', 'color-pastel', 'color-nature', 'color-default'];
let colorHTML = ["PALETTE", "PASTEL", "EARTH", "DEFAULT"];
for (let i = 0; i < colorIDs.length; ++i) {
    if (i != 0) {
        document.getElementById(colorIDs[i]).addEventListener("click", function () {
            changeColorScheme(colorIDs[i].slice(6));
        });
    }
    document.getElementById(colorIDs[i]).addEventListener("mouseover", function () {
        document.getElementById('settings-title').innerHTML = colorHTML[i];
    });
    document.getElementById(colorIDs[i]).addEventListener("mouseout", function () {
        document.getElementById('settings-title').innerHTML = "SETTINGS";
    });
}


//////////////////// ACTIONS ////////////////////
// Action buttons
let actionIDs = ['realign', 'idle-rotate', 'scramble'];
let actionHTML = ["REALIGN", "IDLE", "SCRAMBLE"];
for (let i = 0; i < actionIDs.length; ++i) {
    if (i == 1) {
        document.getElementById(actionIDs[i]).addEventListener("mouseover", function () {
            if (idle) {
                document.getElementById('actions-title').innerHTML = "STOP " + actionHTML[i];
            }
            else {
                document.getElementById('actions-title').innerHTML = "START " + actionHTML[i];
            }
        });
    }
    else {
        document.getElementById(actionIDs[i]).addEventListener("mouseover", function () {
            document.getElementById('actions-title').innerHTML = actionHTML[i];
        });
    }
    document.getElementById(actionIDs[i]).addEventListener("mouseout", function () {
        document.getElementById('actions-title').innerHTML = "ACTIONS";
    });
}
document.getElementById('idle-rotate').addEventListener("click", function () {
    if (!idle) {
        document.getElementById('idle-rotate').className = "button-actions active-button";
        document.getElementById('idle-rotate-icon').className = "bx bx-stop";
        document.getElementById('actions-title').innerHTML = "STOP IDLE";
        onClickIdle();
        idle = true;
    }
    else {
        document.getElementById('idle-rotate').className = "button-actions";
        document.getElementById('idle-rotate-icon').className = "bx bx-play";
        document.getElementById('actions-title').innerHTML = "START IDLE";
        tweenIdleA.stop();
        tweenIdleB.stop();
        idle = false;
    }
});
document.getElementById('realign').addEventListener("click", function () {
    onClickRealign();
});

let scrambleOn = false;
document.getElementById('scramble').addEventListener("click", function () {
    if (!scrambleOn) {
        toggleOnScramble(true);
        document.getElementById('scramble').className = "button-actions active-button";
        scrambleOn = true;
        let scrambleFaces = [front, back, left, right, up, down];
        let scrambleDir = ['clock', 'counter', 'double'];
        let prevA = -1;
        for (let i = 0; i < 20; ++i) {
            let a = randomInt(6);
            while (a == prevA) { a = randomInt(6); }
            let b = randomInt(3);
            
            setTimeout(function () {
                onClickRotate(scrambleFaces[a], scrambleDir[b], true);
                if (i == 19) {
                    document.getElementById('scramble').className = "button-actions";
                    scrambleOn = false;
                    setTimeout(unlock, (sliderDuration + 75));
                    toggleOnScramble(false);
                }
            }, (sliderDuration + 75) * i);
            prevA = a;
        }
    }
});

function toggleOnScramble(disable) {
    let buttonMoves = document.getElementsByClassName('button-moves');
    for (let i = 0; i < buttonMoves.length; ++i) {
        if (disable) {
            buttonMoves[i].classList.add('disabled-button');
            buttonMoves[i].disabled = true;
        }
        else {
            buttonMoves[i].classList.remove('disabled-button');
            buttonMoves[i].disabled = false;
        }
    }
    if (disable) {
        document.getElementById('slider-speed').classList.add('disabled-button');
        document.getElementById('slider-speed').disabled = true;
    }
    else {
        document.getElementById('slider-speed').classList.remove('disabled-button');
        document.getElementById('slider-speed').disabled = false;
    }
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

//////////////////// MENU ////////////////////
let showMenu = true;
let menuTimeout;
document.getElementById('menu').addEventListener("click", function () {
    if (showMenu) {
        showMenu = false;
        document.getElementById('flex-header').classList.add('flex-header--off');
        document.getElementById('menu').style.opacity = "0.6";
        menuTimeout = setTimeout(function () {
            document.getElementById('flex-header').style.display = "none";
            onWindowResize();
        }, 570);
    }
    else {
        clearTimeout(menuTimeout);
        document.getElementById('flex-header').style.display = "none";
        showMenu = true;
        document.getElementById('flex-header').style.display = "flex";
        document.getElementById('flex-header').classList.remove('flex-header--off');
        document.getElementById('menu').style.opacity = "1";
        onWindowResize();
    }
});

document.getElementById('menu').addEventListener("mouseover", function () {
    document.getElementById('menu').style.fontSize = "65px";
});
document.getElementById('menu').addEventListener("mouseout", function () {
    document.getElementById('menu').style.fontSize = "60px";
});

const stats = new Stats();
// container = document.getElementById('flex-header');
document.body.appendChild(stats.domElement);
// stats.domElement.style = 'right: 0px; position: fixed';

// stats.domElement.style.right = '0px';
function animate() {
    stats.begin();
    TWEEN.update();
    stats.update();
    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(animate);
}

cubeInit();
console.log("Scene polycount: ", renderer.info.render.triangles);
console.log("Geometries in memory: ", renderer.info.memory.geometries);
animate();
onWindowResize();