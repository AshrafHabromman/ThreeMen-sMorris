//General variables
 /*Variables in camera and shapes*/
var camera, scene, renderer, mouse, raycaster, controls, selectedPice = null, wayGroup, cube, parkGroup, standGroup1, standGroup2;
var numPiscesOnstands = 6, currentPlayer = 1, remianOnStand = true;
var cylindersGroup1 = [], cylindersGroup2 = [];
//initialization camera & environment

function init() {

    ///implement your functionality here in this fill please 

    scene = new THREE.Scene();
        //Screen size is equal to the size of our environment
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    //Background color

    scene.background = new THREE.Color(0x161a1d);

    var geometry = new THREE.BoxGeometry(1, 0.1, 1);
        /*Material places where piece can't  put it.*/
    var parkBoxMaterial = new THREE.MeshStandardMaterial({ color: 0x2B343B, wireframe: false })
        /*Material places where piece can  put it.*/
    var wayBoxMaterial = new THREE.MeshStandardMaterial({ color: 0x3D4851, wireframe: false })
    //var cube = new THREE.Mesh(geometry,material);
    /////////////////
    /*Material pieces */
    var cylGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.3, 100, 1, false, 400, 6.3);

    //var cylinder = new THREE.Mesh(cylGeometry, material);
    //cylinder.position.set(8, 0.1, 4);
    ///cylinder.userData.cylinderNumber = 1;
    //scene.add(cylinder);

    // var cylinderPlayer2 = new THREE.Mesh(cylGeometry, material2);
    // cylinderPlayer2.position.set(4, 0.1, 4);
    // cylinderPlayer2.userData.cylinderNumber = 2;
    // scene.add(cylinder2);

    //Give light to shapes
    var light = new THREE.PointLight(0xFFFFFF, 1.5, 70, 2);
    light.position.set(4, 10, 4);
    //Add light to an environment
    scene.add(light);
    ///////////////
    wayGroup = new THREE.Group();
    parkGroup = new THREE.Group();
    standGroup1 = new THREE.Group();
    standGroup2 = new THREE.Group();

    var cylinderNumber = 1;//Giving value to each piece to simplify access to it.
    //The first three pieces belong to the first player (1,2,3).
    //The last three pieces belong to the second player (4,6,7).

    for (let i = 0; i < 9; i++) {
        let cylinder;
        if (i == 1 || i == 2 || i == 3) {
            cube = new THREE.Mesh(geometry, parkBoxMaterial);
            cube.position.set(-1, 1, i);
            standGroup1.add(cube);

            var materialPlayer1 = new THREE.MeshStandardMaterial({ color: 0x660708 });
            cylinder = new THREE.Mesh(cylGeometry, materialPlayer1);
            cylinder.position.set(-1, 1.1, i);
            cylinder.userData.cylinderNumber = cylinderNumber;
            cylinder.userData.playerNumber = 1;
            cylinder.userData.onBoard = false;
            cylinder.userData.currentSquareNumber = 0;
            scene.add(cylinder);
            cylindersGroup1.push(cylinder);
            cylinderNumber++;
        }

        else if (i == 5 || i == 6 || i == 7) {
            cube = new THREE.Mesh(geometry, parkBoxMaterial);
            cube.position.set(-1, 1, i);
            standGroup2.add(cube);
            var materialPlayer2 = new THREE.MeshStandardMaterial({ color: 0x0b090a });
            cylinder = new THREE.Mesh(cylGeometry, materialPlayer2);
            cylinder.position.set(-1, 1.1, i);
            cylinder.userData.cylinderNumber = cylinderNumber;
            cylinder.userData.playerNumber = 2;
            cylinder.userData.onBoard = false;
            cylinder.userData.currentSquareNumber = 0;
            scene.add(cylinder);
            cylindersGroup2.push(cylinder);
            cylinderNumber++;
        }
    }
    // console.log("")
    scene.add(standGroup1);
    scene.add(standGroup2)

    let squareNumber = 1;
    for (let x = 0; x < 9; x++) {
        for (let z = 0; z < 9; z++) {
            let cube;
            if (((x + z) % 4) == 0 && (x % 4 == 0) && (z % 4 == 0)) {
                       /*Determine in the environment the places where the piece can put it.*/
                cube = new THREE.Mesh(geometry, parkBoxMaterial);
                cube.position.set(x, 0, z);
                cube.userData.squareNumber = squareNumber;
                cube.userData.busy = false;
                squareNumber++;
                parkGroup.add(cube);
            }
            else if (((x == 1 || x == 2 || x == 3 || x == 5 || x == 6 || x == 7) && (z % 4 == 0)) || ((z == 1 || z == 2 || z == 3 || z == 5 || z == 6 || z == 7) && (x % 4 == 0))) {
                          /*Determine in the environment the places where the piece can't put it.*/
                cube = new THREE.Mesh(geometry, wayBoxMaterial);
                cube.position.set(x, 0, z);
                wayGroup.add(cube);
            }
            else continue;
        }
    }


    //console.log(squareNumber);

    //Add the places to an environment 
    scene.add(wayGroup);
    scene.add(parkGroup);
    //Camera position
    camera.position.z = 10;
    camera.position.x = 4;
    camera.position.y = 4;

    ////Controls Camera
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.target.set(4, 0, 4);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2.5;
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
function positionForSquare(square) {
    const found = parkGroup.children.find((child) => child.userData.squareNumber == square);
    if (found) {
        return found.position;
    }
    return null;
}
/*Get position the places where the piece can put it.*/
function getSquareUsingPosition(x, z) {
    const found = parkGroup.children.find((child) => (child.position.x == x && child.position.z == z));
    if (found) {
        return found;
    }
    return null;
}
//Reshape the environment after resizing the screen.
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
//When a mouse on click what has been put press on it and then based the decision.

function onClick(event) {
    //console.log("hellooooooooo");
    // var togglePalyer=1 ;  
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        selectedPice = intersects[0].object.userData.cylinderNumber;
        //console.log("hello : "+selectedPice);
        return;
    }

    if (selectedPice > 0) {
        raycaster.setFromCamera(mouse, camera);
        intersects = raycaster.intersectObjects(parkGroup.children);
        //console.log("helloooooooooooooooooooooo"+intersects.length);

        if (intersects.length > 0) {
            const targatSquare = intersects[0].object.userData.squareNumber;
            const selectedObject = scene.children.find((child) => child.userData.cylinderNumber == selectedPice);
            if (!targatSquare || !selectedObject) return;
            const targatPosition = positionForSquare(targatSquare);
            let playerNumber = selectedObject.userData.playerNumber;
            let isItOnBoard = selectedObject.userData.onBoard;

            // console.log("player num "+playerNumber)
            // console.log("current Player"+currentPlayer)
            let isBusy = intersects[0].object.userData.busy;
            if (playerNumber == currentPlayer && remianOnStand && (!isItOnBoard) && (!isBusy)) {
                selectedObject.position.set(targatPosition.x, 0.1, targatPosition.z);
                currentPlayer == 1 ? currentPlayer = 2 : currentPlayer = 1;
                numPiscesOnstands--;
                selectedObject.userData.onBoard = true;
                selectedObject.userData.currentSquareNumber = getSquareUsingPosition(selectedObject.position.x, selectedObject.position.z).userData.squareNumber;
                intersects[0].object.userData.busy = true;
                if (numPiscesOnstands == 0) {
                    remianOnStand = false
                }
                if (numPiscesOnstands <= 3) {
                    isplayer1Win = checkIfWin(cylindersGroup1)
                    isplayer2Win = checkIfWin(cylindersGroup2)
                    if (isplayer1Win) {
                        window.alert("Red player win")
                        location.reload();
                    }
                    else if (isplayer2Win) {
                        window.alert("Black player win")
                        location.reload();
                    }
                }
            }
            else if ((((selectedObject.position.x + selectedObject.position.z - 4) == (targatPosition.x + targatPosition.z))
                || ((selectedObject.position.x + selectedObject.position.z + 4) == (targatPosition.x + targatPosition.z)))
                && playerNumber == currentPlayer && (!remianOnStand) && (!isBusy)) {

                getSquareUsingPosition(selectedObject.position.x, selectedObject.position.z).userData.busy = false;
                selectedObject.position.set(targatPosition.x, 0.1, targatPosition.z);
                getSquareUsingPosition(targatPosition.x, targatPosition.z).userData.busy = true;
                currentPlayer == 1 ? currentPlayer = 2 : currentPlayer = 1;

                isplayer1Win = checkIfWin(cylindersGroup1);
                isplayer2Win = checkIfWin(cylindersGroup2);
                if (isplayer1Win) {
                    window.alert("Red player win")
                    location.reload();
                }
                else if (isplayer2Win) {
                    window.alert("Black player win")
                    location.reload();
                }
            }
            selectedPice = null;
        }
    }
}
//When hovering over the shape it changes transparent for the shape . 

function hoverPices() {
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {

        intersects[i].object.material.transparent = true;
        intersects[i].object.material.opacity = 0.5;
        //console.log("hi i'm here number is "+intersects.length);

    }
}
//After placing it in the right place a decision will be transparent will change to 1 .
function resetMaterial() {
    for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].material) {
            scene.children[i].material.opacity = scene.children[i].userData.cylinderNumber == selectedPice ? 0.5 : 1.0;
            // console.log("lask")
        }
    }
}
//Check whether the players won or not
function checkIfWin(cylinderGroup) {
    let isWinX = false;
    let isWinZ = false;

    let cylinder1 = cylinderGroup[0];
    let cylinder2 = cylinderGroup[1];
    let cylinder3 = cylinderGroup[2];
    let cylinderPosition1 = cylinder1.position;
    let cylinderPosition2 = cylinder2.position;
    let cylinderPosition3 = cylinder3.position;

    if (cylinderPosition1.x == cylinderPosition2.x && cylinderPosition2.x == cylinderPosition3.x && cylinderPosition1.x == cylinderPosition3.x) {
        isWinX = true;
    } else isWinX = false
    if (cylinderPosition1.z == cylinderPosition2.z && cylinderPosition2.z == cylinderPosition3.z && cylinderPosition1.z == cylinderPosition3.z) {
        isWinZ = true;
    } else isWinZ = false;

    return (isWinX || isWinZ);
}

window.addEventListener("resize", onWindowResize);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener("click", onClick);
window.onload = init;
