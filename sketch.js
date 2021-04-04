
var camera, scene, renderer, mouse, raycaster, controls, selectedPice = null,wayGroup,cube,parkGroup;

function init() {
    ///
    ///implement your functionality here in this fill please 

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x1e555c);

    var geometry = new THREE.BoxGeometry(1, 0.1, 1);  
    var parkBoxMaterial = new THREE.MeshStandardMaterial({ color: 0xeba570, wireframe: false })
    var wayBoxMaterial = new THREE.MeshStandardMaterial({ color: 0xedb183, wireframe: false })
    //var cube = new THREE.Mesh(geometry,material);
    /////////////////

    var cylGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.3, 100, 1, false, 400, 32);
    var material = new THREE.MeshStandardMaterial({ color: 0xf15152 });
    var cylinder = new THREE.Mesh(cylGeometry, material);
    cylinder.position.set(8, 0.1, 4);
    cylinder.userData.cylinderNumber = 1;
    scene.add(cylinder);

    var cylGeometry2 = new THREE.CylinderGeometry(0.3, 0.4, 0.3, 100, 1, false, 400, 32);

    var material2 = new THREE.MeshStandardMaterial({ color: 0xf15152 });
    var cylinder2 = new THREE.Mesh(cylGeometry, material2);
    cylinder2.position.set(4, 0.1, 4);
    cylinder2.userData.cylinderNumber = 2;
    scene.add(cylinder2);

    var light = new THREE.PointLight(0xFFFFFF, 1.5, 70,2);
    light.position.set(4, 10, 4);
    
    scene.add(light);
    ///////////////
    wayGroup = new THREE.Group();
    parkGroup = new THREE.Group();
    let squareNumber = 1;
    for (let x = 0; x < 9; x++) {
        for (let z = 0; z < 9; z++) {
            let cube;
            if (((x + z) % 4) == 0 && (x % 4 == 0) && (z % 4 == 0)) {
                cube = new THREE.Mesh(geometry, parkBoxMaterial);
                cube.position.set(x, 0, z);
                cube.userData.squareNumber = squareNumber;
                squareNumber++;
                parkGroup.add(cube);
            }
            else if (((x == 1 || x == 2 || x == 3 || x == 5 || x == 6 || x == 7) && (z % 4 == 0)) || ((z == 1 || z == 2 || z == 3 || z == 5 || z == 6 || z == 7) && (x % 4 == 0))) {
                cube = new THREE.Mesh(geometry, wayBoxMaterial);
                cube.position.set(x, 0, z);
                cube.userData.squareNumber = squareNumber;
                squareNumber++;
                wayGroup.add(cube);
            }
            else continue;
        }
    }
    console.log(squareNumber);
    scene.add(wayGroup);
    scene.add(parkGroup);

    camera.position.z = 10;
    camera.position.x = 4;
    camera.position.y = 4;
    
    ////controls 
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    controls.target.set(4, 0, 4);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 3;
    ////controls 
    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();
    raycaster.far = 15;
    window.requestAnimationFrame(GameLoop);
}


function GameLoop() {
    controls.update();
    resetMaterial();
    hoverPices();
    renderer.render(scene, camera);
    window.requestAnimationFrame(GameLoop);
}
function positionForSquare(square){
    const found = parkGroup.children.find((child) => child.userData.squareNumber == square);
    if(found){
        return found.position;
    }
    return null;
}
function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

}

function onMouseMove(event) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    //  console.log("hi i'm hereeeeeeee");
}   

function onClick(event){
    //console.log("hellooooooooo");
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);

    if(intersects.length > 0){
        selectedPice = intersects[0].object.userData.cylinderNumber;
        //console.log("hello child number : ");
        return;
    }

    if(selectedPice > 0){
        raycaster.setFromCamera(mouse,camera);
        intersects = raycaster.intersectObjects(parkGroup.children);
        //console.log("helloooooooooooooooooooooo"+intersects.length);

        if(intersects.length > 0){
            const targatSquare = intersects[0].object.userData.squareNumber;
            const selectedObject = scene.children.find((child) => child.userData.cylinderNumber == selectedPice);
            if(!targatSquare || !selectedObject) return;
            const targatPosition = positionForSquare(targatSquare);
            if( ((selectedObject.position.x+selectedObject.position.z-4) == (targatPosition.x+targatPosition.z)) || ((selectedObject.position.x+selectedObject.position.z+4) == (targatPosition.x+targatPosition.z)) )
                selectedObject.position.set(targatPosition.x,selectedObject.position.y, targatPosition.z);
            else console.log("hiisss");
            selectedPice = null;
        }
    }

}

function hoverPices() {
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {

        intersects[i].object.material.transparent = true;
        intersects[i].object.material.opacity = 0.5;
        //console.log("hi i'm here number is "+intersects.length);

    }
}
function resetMaterial(){
    for(let i =0; i < scene.children.length; i++){
        if(scene.children[i].material){
            scene.children[i].material.opacity =  scene.children[i].userData.cylinderNumber == selectedPice ? 0.5 : 1.0;
           // console.log("lask")
        }
    }
}

window.addEventListener("resize", onWindowResize);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener("click",onClick);
window.onload = init;
