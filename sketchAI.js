//General variables
 /*Variables in camera and shapes*/
var camera, scene, renderer, mouse, raycaster, controls,/*The piece that is selected*/selectedPice = null, /*Places where piece can't  put it.*/wayGroup, cube, /*Places where piece can put it.*/parkGroup, /*The group of the pieces for the first player */standGroup1, /*The group of the pieces for the second player */standGroup2;
var numPiscesOnstands = 3, /*Current turn for whom?  1 (Person) or  2 (AI)*/currentPlayer = 1,/*Are pieces left on the stand?*/ remianOnStand = true;
var /*Create pieces for the first player*/cylindersGroup1, /*Create pieces for the second  player*/cylindersGroup2;
var playWithAI = true, numOfCylOnStandForAI = 3, counter = 0;
var bestMoveIndex = -1;
//Create a stateNode inside the node and the value that it represents for evaluation function.
class stateNode {

    constructor(node, value) {
        this.node = node;
        this.value = value;
    }
}
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
    scene.background = new THREE.Color(0x1e555c);
    var geometry = new THREE.BoxGeometry(1, 0.1, 1);
    /*Material places where piece can't  put it.*/
    var parkBoxMaterial = new THREE.MeshStandardMaterial({ color: 0xeba570, wireframe: false })
    /*Material places where piece can  put it.*/
    var wayBoxMaterial = new THREE.MeshStandardMaterial({ color: 0xedb183, wireframe: false })
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
    cylindersGroup1 = new THREE.Group()
    cylindersGroup2 = new THREE.Group()

    var cylinderNumber = 1;//Giving value to each piece to simplify access to it.
    //The first three pieces belong to the first player (1,2,3).
    //The last three pieces belong to the second player (4,6,7).
    for (let i = 0; i < 9; i++) {
        let cylinder;
        if (i == 1 || i == 2 || i == 3) {
            cube = new THREE.Mesh(geometry, parkBoxMaterial);
            cube.position.set(-1, 1, i);
            standGroup1.add(cube);

            var materialPlayer1 = new THREE.MeshStandardMaterial({ color: 0xf15152 });
            cylinder = new THREE.Mesh(cylGeometry, materialPlayer1);
            cylinder.position.set(-1, 1.1, i);
            cylinder.userData.cylinderNumber = cylinderNumber;
            cylinder.userData.playerNumber = 1;
            cylinder.userData.onBoard = false;
            cylinder.userData.currentSquareNumber = 0;
            // scene.add(cylinder);
            cylindersGroup1.add(cylinder);
            cylinderNumber++;
        }

        else if (i == 5 || i == 6 || i == 7) {
            cube = new THREE.Mesh(geometry, parkBoxMaterial);
            cube.position.set(-1, 1, i);
            standGroup2.add(cube);
            var materialPlayer2 = new THREE.MeshStandardMaterial({ color: 0x3a2e39 });
            cylinder = new THREE.Mesh(cylGeometry, materialPlayer2);
            cylinder.position.set(-1, 1.1, i);
            cylinder.userData.cylinderNumber = cylinderNumber;
            cylinder.userData.playerNumber = 2;
            cylinder.userData.onBoard = false;
            cylinder.userData.currentSquareNumber = 0;
            // scene.add(cylinder);
            cylindersGroup2.add(cylinder);
            cylinderNumber++;
        }
    }
    console.log("cylinderNumber"+cylinderNumber)
    scene.add(standGroup1);
    scene.add(standGroup2);
    scene.add(cylindersGroup1);
    scene.add(cylindersGroup2);

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
    if (playWithAI) {
        if (currentPlayer == 2) {
            AIMove();
        }
    }
    // console.log(playWithAI);
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
/*Get position the pieces where put it.*/
function getCylinderUsingPosition(x, z) {
    const found = cylindersGroup2.children.find((child) => (child.position.x == x && child.position.z == z));
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
    let intersects = raycaster.intersectObjects(cylindersGroup1.children);

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
            const selectedObject = cylindersGroup1.children.find((child) => child.userData.cylinderNumber == selectedPice);
            if (!targatSquare || !selectedObject) return;
            const targatPosition = positionForSquare(targatSquare);
            let playerNumber = selectedObject.userData.playerNumber;
            let isItOnBoard = selectedObject.userData.onBoard;

            // console.log("player num "+playerNumber)
            // console.log("current Player " + currentPlayer)
            // console.log("remianOnStand " + remianOnStand)
            let isBusy = intersects[0].object.userData.busy;
            if (playerNumber == currentPlayer && remianOnStand && (!isItOnBoard) && (!isBusy)) {
                selectedObject.position.set(targatPosition.x, 0.1, targatPosition.z);
                numPiscesOnstands--;
                selectedObject.userData.onBoard = true;
                selectedObject.userData.currentSquareNumber = getSquareUsingPosition(selectedObject.position.x, selectedObject.position.z).userData.squareNumber;
                intersects[0].object.userData.busy = true;
                setTimeout(()=>{currentPlayer == 1 ? currentPlayer = 2 : currentPlayer = 1;}, 2000);
                if (numPiscesOnstands == 0) {
                    remianOnStand = false
                    isplayer1Win = checkIfWin(cylindersGroup1, 1)
                    isplayer2Win = checkIfWin(cylindersGroup2, 2)
                    if (isplayer1Win) {
                        window.alert("You win ")
                        location.reload();
                    }
                    else if (isplayer2Win) {
                        window.alert("AI win")
                        location.reload();
                    }
                }

            }
            else if ((((selectedObject.position.x + selectedObject.position.z - 4) == (targatPosition.x + targatPosition.z))
                || ((selectedObject.position.x + selectedObject.position.z + 4) == (targatPosition.x + targatPosition.z)))
                && playerNumber == currentPlayer && (!remianOnStand) && (!isBusy)) {
                console.log("remianOnStand " + remianOnStand)
                getSquareUsingPosition(selectedObject.position.x, selectedObject.position.z).userData.busy = false;
                selectedObject.position.set(targatPosition.x, 0.1, targatPosition.z);
                getSquareUsingPosition(targatPosition.x, targatPosition.z).userData.busy = true;
                
                setTimeout(()=>{currentPlayer == 1 ? currentPlayer = 2 : currentPlayer = 1;}, 2000);
                

                isplayer1Win = checkIfWin(cylindersGroup1, 1);
                isplayer2Win = checkIfWin(cylindersGroup2, 2);
                if (isplayer1Win) {
                    window.alert("You win ")
                    location.reload();
                }
                else if (isplayer2Win) {
                    window.alert("AI win")
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
    let intersects = raycaster.intersectObjects(cylindersGroup1.children);

    for (let i = 0; i < intersects.length; i++) {

        intersects[i].object.material.transparent = true;
        intersects[i].object.material.opacity = 0.5;
        //console.log("hi i'm here number is "+intersects.length);

    }
}
//After placing it in the right place a decision will be transparent will change to 1 .
function resetMaterial() {
    for (let i = 0; i < cylindersGroup1.children.length; i++) {
        if (cylindersGroup1.children[i].material) {
            cylindersGroup1.children[i].material.opacity = cylindersGroup1.children[i].userData.cylinderNumber == selectedPice ? 0.5 : 1.0;
            // console.log("lask")
        }
    }
}
//Check whether the players won or not
function checkIfWin(cylinderGroup, groupNumber) {
    let isWinX = false;
    let isWinZ = false;
    let cylinder1
    let cylinder2
    let cylinder3
    if (groupNumber == 1) {
        cylinder1 = cylinderGroup.children.find((child) => (child.userData.cylinderNumber == 1 && child.userData.playerNumber == groupNumber));
        cylinder2 = cylinderGroup.children.find((child) => (child.userData.cylinderNumber == 2 && child.userData.playerNumber == groupNumber));
        cylinder3 = cylinderGroup.children.find((child) => (child.userData.cylinderNumber == 3 && child.userData.playerNumber == groupNumber));
    } else {
        cylinder1 = cylinderGroup.children.find((child) => (child.userData.cylinderNumber == 4 && child.userData.playerNumber == groupNumber));
        cylinder2 = cylinderGroup.children.find((child) => (child.userData.cylinderNumber == 5 && child.userData.playerNumber == groupNumber));
        cylinder3 = cylinderGroup.children.find((child) => (child.userData.cylinderNumber == 6 && child.userData.playerNumber == groupNumber));
    }

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
function isItAi(isItAi) {
    playWithAI = isItAi;
}
//Take current status and put it into the 2D array.
function getCurrentState() {

    var currentStateArr = new Array(3);
    for (let i = 0; i < 3; i++) {
        currentStateArr[i] = new Array(3).fill("-")
    }

    for (let i = 1; i < 4; i++) {
        let cylinder = cylindersGroup1.children.find((child) => child.userData.cylinderNumber == i);
        let xIndexColumn = 0.25 * cylinder.position.x
        let zIndexRow = 0.25 * cylinder.position.z
        let yPosetion = cylinder.position.y
        if (yPosetion == 0.1)
            currentStateArr[zIndexRow][xIndexColumn] = "1";
    }
    for (let i = 4; i < 7; i++) {
        let cylinder = cylindersGroup2.children.find((child) => child.userData.cylinderNumber == i);
        let xIndexColumn = 0.25 * cylinder.position.x
        let zIndexRow = 0.25 * cylinder.position.z
        let yPosetion = cylinder.position.y
        if (yPosetion == 0.1)
            currentStateArr[zIndexRow][xIndexColumn] = "2"
    }
    console.log("currentStateArr"+currentStateArr);
    return currentStateArr;
}
//Here we are given the next movement of artificial intelligence
function AIMove() {
    currentState = getCurrentState();

    let bestStateMove = alpahBeta(currentState, 5, -100, 100, true);
    console.log("best move  sffaadwdwd;"+ bestStateMove.node)
    bestMove = getNextStates(currentState,true)[bestMoveIndex];
    console.log("best move  ;"+ bestMove)
    let targetPosition = new Array(2);  //0 index = i = x axis , 1 index = j = z axis 
    let currentPosition = new Array(2); //0 index = i = x axis , 1 index = j = z axis
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (currentState[i][j] == bestMove[i][j])
                continue;
            else if (currentState[i][j] == "-" && bestMove[i][j] == "2") {
                targetPosition[0] = j * 4;
                targetPosition[1] = i * 4;
            }
            else if (currentState[i][j] == "2" && bestMove[i][j] == "-" ) {
                currentPosition[0] = j * 4;
                currentPosition[1] = i * 4;
            }
        }
    }
    // console.log("x: "+currentPosition[0] + "z: "+currentPosition[0])
    console.log("x:tar "+targetPosition[0] + "z: tar"+targetPosition[1])

    if(numOfCylOnStandForAI >= 1){           // on stand 
        cylinderNum = numOfCylOnStandForAI + 3;
        // console.log("cylinderNum"+cylinderNum);
        const found = cylindersGroup2.children.find((child) => child.userData.cylinderNumber == cylinderNum);
        found.position.set(targetPosition[0], 0.1, targetPosition[1])
        // getSquareUsingPosition(targetPosition[0], targetPosition[1]).userData.isBusy = true;
    }
    else if (numOfCylOnStandForAI < 1){
        selectedCylinderByAI = getCylinderUsingPosition(currentPosition[0], currentPosition[1]);
        selectedCylinderByAI.position.set(targetPosition[0], 0.1, targetPosition[1]);
        getSquareUsingPosition(currentPosition[0], currentPosition[1]).userData.isBusy = false;
    }

    getSquareUsingPosition(targetPosition[0], targetPosition[1]).userData.isBusy = true;
    console.log("Hiiiii")
    numOfCylOnStandForAI--;
    currentPlayer = 1;
    
    // if (counter == 0) {
    //     let cylinder = cylindersGroup2.children.find((child) => child.userData.cylinderNumber == 4)
    //     cylinder.position.set(0, 0.1, 0)
    // }
    // else if (counter == 1) {
    //     let cylinder = cylindersGroup2.children.find((child) => child.userData.cylinderNumber == 5)
    //     cylinder.position.set(8, 0.1, 8)
    // }
    // else if (counter == 2) {
    //     let cylinder = cylindersGroup2.children.find((child) => child.userData.cylinderNumber == 6)
    //     cylinder.position.set(4, 0.1, 8)
    //     console.log(currentPlayer);
    // }
    // else if (counter == 3) {
    //     let cylinder = cylindersGroup2.children.find((child) => child.userData.cylinderNumber == 4)
    //     cylinder.position.set(4, 0.1, 0)
    //     console.log(currentPlayer);
    // }
    // counter++;

    // if (checkIfWin(cylindersGroup1)) {
    //     window.alert('AI wins you');
    //     location.reload();

    // }
    // else if (checkIfWin(cylindersGroup12)) {
    //     window.alert('you win');
    //     location.reload();

    // }

}
// node = array of busy and not busy squares 
//       ,cylinders {cylindersGroup1, cylindersGroup2}

//Given the best next move 
function getNextStates(currentState, maximizingPlayer) { // maximizingPlayer if true -> AI -> player 2

    let nextStates = []
    // var newState = new Array(3);
    // for (let i = 0; i < 3; i++) {
    //     newState[i] = new Array(3)
    // }
    // nextStates.push(newState)
    let cylindersCount1 = 0;
    let cylindersCount2 = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (currentState[i][j] == "1") {
                cylindersCount1++;
            }
            else if (currentState[i][j] == "2") {
                cylindersCount2++;
            }
        }
    }

    if (maximizingPlayer) {           // AI turn    
        if (cylindersCount2 == 3) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {

                    if (currentState[i][j] == "2") {
                        if (i + 1 < 3 && currentState[i + 1][j] != "1" && currentState[i + 1][j] != "2" && currentState[i + 1][j] == "-") {
                            let newState = myClone(currentState);
                            newState[i + 1][j] = "2"
                            newState[i][j] = "-"
                            nextStates.push(newState);
                        }
                        if (i - 1 > -1 && currentState[i - 1][j] != "1" && currentState[i - 1][j] != "2" && currentState[i - 1][j] == "-") {
                            let newState = myClone(currentState);
                            newState[i - 1][j] = "2"
                            newState[i][j] = "-"
                            nextStates.push(newState);
                        }
                        if (j + 1 < 3 && currentState[i][j + 1] != "1" && currentState[i][j + 1] != "2" && currentState[i][j + 1] == "-") {
                            let newState = myClone(currentState);
                            newState[i][j + 1] = "2"
                            newState[i][j] = "-"
                            nextStates.push(newState);
                        }
                        if (j - 1 > -1 && currentState[i][j - 1] != "1" && currentState[i][j - 1] != "2" && currentState[i][j - 1] == "-") {
                            let newState = myClone(currentState);
                            newState[i][j - 1] = "2"
                            newState[i][j] = "-"
                            nextStates.push(newState);
                        }
                    }
                }
            }
        }
        else {              //less than 3 on board (has cylinders on stand)
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (currentState[i][j] == "-") {
                        let newState = myClone(currentState);
                        newState[i][j] = "2"
                        nextStates.push(newState);
                    }
                }
            }
        }
    }
    else {              
        console.log("human turn")             // human turn 
        if (cylindersCount1 == 3) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (currentState[i][j] == "1") {
                        if (i + 1 < 3 && currentState[i + 1][j] != "2" && currentState[i + 1][j] != "1" && currentState[i + 1][j] == "-") {
                            let newState = myClone(currentState);
                            newState[i + 1][j] = "1"
                            newState[i][j] = "-"
                            nextStates.push(newState);
                        }
                        if (i - 1 > -1 && currentState[i - 1][j] != "2" && currentState[i - 1][j] != "1" && currentState[i - 1][j] == "-") {
                            let newState = myClone(currentState);
                            newState[i - 1][j] = "1"
                            newState[i][j] = "-"
                            nextStates.push(newState);
                        }
                        if (j + 1 < 3 && currentState[i][j + 1] != "2" && currentState[i][j + 1] != "1" && currentState[i][j + 1] == "-") {
                            let newState = myClone(currentState);
                            newState[i][j + 1] = "1"
                            newState[i][j] = "-"
                            nextStates.push(newState);
                        }
                        if (j - 1 > -1 && currentState[i][j - 1] != "2" && currentState[i][j - 1] != "1" && currentState[i][j - 1] == "-") {
                            let newState = myClone(currentState);
                            newState[i][j - 1] = "1"
                            newState[i][j] = "-"
                            nextStates.push(newState);
                        }
                    }
                }
            }
        }
        else {              //less than 3 on board (has cylinders on stand)
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (currentState[i][j] == "-") {
                        let newState = myClone(currentState);
                        newState[i][j] = "1"
                        nextStates.push(newState);
                    }
                }
            }
        }
    }   
    console.log(nextStates);
    return nextStates;
}

function myClone(arr) {
    let newArray = new Array(arr.length)
    for (let i = 0; i < arr[0].length; i++) {
        newArray[i] = new Array(arr[0].length)
       // console.log("hi")
    }
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            newArray[i][j] = arr[i][j]
        }
    }
    return newArray
}

function typeAi(type) {

}
/*Blocked node*/
function getNumberOfBlocked(node, playerNum) {
    // console.log("getNumberOfBlocked "+node);
    let numberOfBlockedCylinder = 0
    let isItBlocked = new Array(3).fill(true);
    let cylinderNum = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (node[i][j] == playerNum) {
                //Bottom
                if (i + 1 < 3 && node[i + 1][j] == "-") {
                    isItBlocked[cylinderNum] = false;
                }
                //UP
                else if (i - 1 > -1 && node[i - 1][j] == "-") {
                    isItBlocked[cylinderNum] = false;
                }
                //Right
                else if (j + 1 < 3 && node[i][j + 1] == "-") {
                    isItBlocked[cylinderNum] = false;
                }
                //Left
                else if (j - 1 > -1 && node[i][j + 1] == "-") {
                    isItBlocked[cylinderNum] = false;
                }
                cylinderNum++;
            }
        }
    }
    for (let i = 0; i < 3; i++) {
        if (isItBlocked[i])
            numberOfBlockedCylinder++;
    }
    console.log("numberOfBlockedCylinder "+numberOfBlockedCylinder);
    return numberOfBlockedCylinder;
}
/*Two nodes in same lines */
function getNumberOfTwoCylindersInSameLine(node, playerNum) {
    // console.log("getNumberOfTwoCylindersInSameLine "+ node);
    let numberOfTwoCylindersInSameLine = 0;
    for (let i = 0; i < 3; i++) {
        if ((node[i][0] == playerNum || node[i][1] == playerNum) && (node[i][0] == node[i][1] || node[i][1] == node[i][2] || node[i][0] == node[i][2]))
            numberOfTwoCylindersInSameLine++;
    }
    for (let i = 0; i < 3; i++) {
        if ((node[0][i] == playerNum || node[1][i] == playerNum) && (node[i][0] == node[1][i] || node[1][i] == node[2][i] || node[0][i] == node[2][i]))
            numberOfTwoCylindersInSameLine++;
    }
    console.log("numberOfTwoCylindersInSameLine "+numberOfTwoCylindersInSameLine);

    return numberOfTwoCylindersInSameLine;
}
/*Disance between player's cylinders */
function getDisanceBetweenPlayersCylinders(node, playerNum) {
    // console.log("getDisanceBetweenPlayersCylinders "+ node);

    var arrayIndicesCylinder = new Array(3);
    var distance = 0;
    for (let i = 0; i < 3; i++) {
        arrayIndicesCylinder[i] = new Array(2)
    }
    let cylinderNum = 0
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (node[i][j] == playerNum) {
                arrayIndicesCylinder[cylinderNum][0] = i;
                arrayIndicesCylinder[cylinderNum][1] = j;
                cylinderNum++;
            }
        }
    }
    distance += Math.abs(arrayIndicesCylinder[0][0] - arrayIndicesCylinder[1][0]) + Math.abs(arrayIndicesCylinder[0][1] - arrayIndicesCylinder[1][1]); //between 0 and 1 
    distance += Math.abs(arrayIndicesCylinder[0][0] - arrayIndicesCylinder[2][0]) + Math.abs(arrayIndicesCylinder[0][1] - arrayIndicesCylinder[2][1]); //betwwen 0, 2 
    distance += Math.abs(arrayIndicesCylinder[1][0] - arrayIndicesCylinder[2][0]) + Math.abs(arrayIndicesCylinder[1][1] - arrayIndicesCylinder[2][1]); // between 1, 2
    // console.log("node "+node);
    // console.log("plater  "+playerNum+"  distance "+distance);

    return distance
}
//evaluation function 
//It is based on three evaluate
function evaluateState(node, playerNum) {  // playerNum = "1" or "2"
    //node[][]
    /*Blocked node*/
    numberOfBlocked = getNumberOfBlocked(node, playerNum);
    /*Two nodes in same lines */
    numberOfTwoCylindersInSameLine = getNumberOfTwoCylindersInSameLine(node, playerNum);
    /*Disance between player's cylinders */
    disanceBetweenPlayersCylinders = getDisanceBetweenPlayersCylinders(node, playerNum);
    let evaluateTwoCylindersInSameLine = 0;
    // numberOfTwoCylindersInSameLine == 1 ? 2 : -2 ;
    if (numberOfTwoCylindersInSameLine == 0) {
        evaluateTwoCylindersInSameLine = -2;
    }
    else if (numberOfTwoCylindersInSameLine == 1) {
        evaluateTwoCylindersInSameLine = 2;
    }
    // else if (numberOfTwoCylindersInSameLine == 2) {
    //     evaluateTwoCylindersInSameLine = -2;
    // }
    return (numberOfBlocked * -2) + evaluateTwoCylindersInSameLine + ((disanceBetweenPlayersCylinders * -1)+4)

}

function alpahBeta(node, depth, alpha, beta, maximizingPlayer) {

    isTerminalnode = checkIfTerminal(node);
    console.log("isTerminalnode "+isTerminalnode)
    if (isTerminalnode){
        if(maximizingPlayer){
            console.log("im terminal ")
            return new stateNode(node, 50);
        }else return new stateNode(node, -50);
    }
    if (depth == 0) {
        //Node of Heurisic 
        evaluatedStateForPlayer1 = evaluateState(node, "1");
        evaluatedStateForPlayer2 = evaluateState(node, "2");
        console.log(evaluatedStateForPlayer2 - evaluatedStateForPlayer1 )

        return new stateNode(node, evaluatedStateForPlayer2 - evaluatedStateForPlayer1);
    }

    if (maximizingPlayer) {
        var v = new stateNode(null, -100);
        children = getNextStates(node, true);
        for (let i = 0; i < children.length; i++) {
            newStateNode = alpahBeta(children[i], depth - 1, alpha, beta, false)
            // console.log("newStateNode node" + newStateNode.node)
            // console.log("newStateNode value" + newStateNode.value)
            // console.log("v value befor: " + v.value)
            if(newStateNode.value > v.value){
                bestMoveIndex = i;
                v = newStateNode;
            }
                
            // console.log("v value after " + v.value)
            alpha = Math.max(v.value, alpha)
            if (beta <= alpha)  
                break
            //CUT OFF
            return v;
        }
    }
    else {
        var v = new stateNode(null,100);
        children = getNextStates(node, false);
        for (let i = 0; i < children.length; i++) {
            console.log("hihiiihihhisa      dasdadasdadsah")
            newStateNode = alpahBeta(children[i], depth - 1, alpha, beta, true)
            if(newStateNode.value < v.value)
                v = newStateNode
            beta = Math.min(v.value, beta)
            if (beta <= alpha)
                break
            //CUT OFF
            return v;

        }
    }
}
//Check whether the players won or not

function checkIfTerminal(node) {
    let win1ByX = false
    let win1ByY = false
    let win2ByX = false
    let win2ByY = false
    for (let i = 0; i < 3; i++) {
        if (node[i][0] == node[i][1] && node[i][0] == node[i][2] && node[i][1] == node[i][2] && node[i][2] == "1") {
            win1ByX = true;
            return win1ByX
        }
        if (node[i][0] == node[i][1] && node[i][0] == node[i][2] && node[i][1] == node[i][2] && node[i][2] == "2") {
            win2ByX = true;
            return win2ByX
        }
    }
    for (let i = 0; i < 3; i++) {
        if (node[0][i] == node[1][i] && node[0][i] == node[2][i] && node[1][i] == node[2][i] && node[2][i] == "1") {
            win1ByY = true;
            return win1ByY
        }
        if (node[0][i] == node[1][i] && node[0][i] == node[2][i] && node[1][i] == node[2][i] && node[2][i] == "2") {
            win2ByY = true;
            return win2ByY
        }
    }
    return false;

}



function twoPacesInSameLine() { }
window.addEventListener("resize", onWindowResize);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener("click", onClick);
window.onload = init;
