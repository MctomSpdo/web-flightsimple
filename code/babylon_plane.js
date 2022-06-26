const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine


let leftArrow = false;
let rightArrow = false;
let upArrow = false;
let downArrow = false;

let plane;
let speed = 1.0;

//current plane movement multiplier:
let plane_bank = 0;
let plane_rotate_side = 0;
let plane_pitch = 0;


const STEERING_BANK = 0.02;
const STEERING_PITCH = 0.01;

const DRAG = 0.95;

let airspeed = 2.0;
let engine_power = 0.5;


function createScene() {
    
    // Scene and Camera
    let scene = new BABYLON.Scene(engine);


    // This creates and initially positions a follow camera 	
    let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, 30), scene);
	
	//The goal distance of camera from target
	camera.radius = 0.15;
	
	// The goal height of camera above local origin (centre) of target
	camera.heightOffset = 2;
	
	// The goal rotation of camera around local origin (centre) of target in x y plane
	camera.rotationOffset = 180;
	
	//Acceleration of camera in moving from current to goal position
	camera.cameraAcceleration = 0.025;
	
	//The speed at which acceleration is halted 
	camera.maxCameraSpeed = 10;
	
    //camera.attachControl(canvas, true);


    // Lights
    let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.6;
    light.specular = BABYLON.Color3.Black();

    let light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    light2.position = new BABYLON.Vector3(0, 5, 5);


    // Load plane character and play infinity animation
    BABYLON.SceneLoader.ImportMesh("", "https://models.babylonjs.com/", "aerobatic_plane.glb", scene, function (meshes) {          
        
        plane = meshes[0];

        //Scale the model    
        plane.scaling.scaleInPlace(5);
        plane.position.z = -15;
        plane.position.y = 10;

        const planeAnim_idle = scene.getAnimationGroupByName("idle");
        planeAnim_idle.stop();
        //planeAnim_idle.start(true, 0.25, planeAnim_idle.from, planeAnim_idle.to, false); // slow
        planeAnim_idle.start(true, 1, planeAnim_idle.from, planeAnim_idle.to, false); // full speed


        /*****************SET TARGET FOR CAMERA************************/ 
        camera.lockedTarget = plane;
        /**************************************************************/
        
    });



    let ground = BABYLON.Mesh.CreateGround("ground1", 2000, 2000, 0, scene);

    for (let index = -50; index < 50; index++) {
        let sphere;
        sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
        sphere.position.y = 0;
        sphere.position.z = 20*index;
        let groundMaterial = new BABYLON.StandardMaterial("Ground Material", scene);
        sphere.material = groundMaterial;
        sphere.material.diffuseColor = BABYLON.Color3.Yellow();   
    }
    for (let index = -50; index < 50; index++) {
        let sphere;
        sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
        sphere.position.y = 0;
        sphere.position.x = 20*index;
        let groundMaterial = new BABYLON.StandardMaterial("Ground Material", scene);
        sphere.material = groundMaterial;
        sphere.material.diffuseColor = BABYLON.Color3.Red();   
    }
    

    return scene;

};


const scene = createScene(); //Call the createScene function



// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {

    /* keyboard game loop */
    if(leftArrow) {
        plane_bank -= STEERING_BANK;
    }
    if(rightArrow) {
        plane_bank += STEERING_BANK;
    }
    if(upArrow) {
        plane_pitch -= STEERING_PITCH;
    }
    if(downArrow) {
        plane_pitch += STEERING_PITCH;
    }

    plane_rotate_side += plane_bank * 0.008;

    //slow down airspeed by default:
    airspeed *= DRAG;

    //engine power:
    if(airspeed < 3) {
        airspeed = airspeed + engine_power;
        if(airspeed > 3) {
            airspeed = 3;
        }
    }

    //up and down movement:
    airspeed -= plane_pitch;


    /* fly forward */
    if (plane) {
        plane.rotation = new BABYLON.Vector3(plane_pitch, plane_rotate_side, plane_bank);
        plane.movePOV(0,0,airspeed*0.1);
    }
    
    scene.render();
});



// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});






/*****************************************
 * KEYBOARD EVENTS
 *****************************************/
/* x ... left/right */
/* y ... up/down    */
/* z ... forward    */

document.onkeydown = keyListenerDown;
document.onkeyup = keyListenerUp;


/* CHECK PRESSED KEY */
function keyListenerDown(e){
    if (e.keyCode == 37){ // leftArrow
        leftArrow = true;
    }
    if (e.keyCode == 38){ //upArrow
        upArrow = true;
    }
    if (e.keyCode == 39){ // rightArrow
        rightArrow = true;
    }
    if (e.keyCode == 40){ // downArrow
        downArrow = true;
    }
}
/* CHECK RELEASED KEY */
function keyListenerUp(e){
    if (e.keyCode == 37){ // leftArrow
        leftArrow = false;
    }
    if (e.keyCode == 38){ //upArrow
        upArrow = false;
    }
    if (e.keyCode == 39){ // rightArrow
        rightArrow = false;
    }
    if (e.keyCode == 40){ // downArrow
        downArrow = false;
    }

}
