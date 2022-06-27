
class PFD {
    canvas
    ctx

    height
    width

    airspeed = 'ERR'
    altitude = 'ERR'
    heading = 'ERR'
    autopilot = 'N/A'
    bank = "ERR"
    pitch = 'ERR'

    constructor(canvasElement) {
        this.canvas = canvasElement;

        this.canvas.height = canvas.getBoundingClientRect().height * 2;
        this.canvas.width = canvas.getBoundingClientRect().width;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx = this.canvas.getContext("2d");
    }

    render() {
        this.#renderHorizon();
        this.#renderHeader();
        this.#renderBody();
    }

    #renderHorizon() {
        this.ctx.save();
        let degHeight = (this.height *0.01) * this.pitch;


        //background:
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.fillStyle = '#11aed1';
        this.ctx.beginPath();
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fill();

        
        this.ctx.fillStyle = '#488000';
        this.ctx.lineWidth = 0;

        //calculate offset
        let offset = this.#getHorizonPixelLevel(this.width, this.bank);

        if(offset == Infinity) {
            offset = 9999999999999;
        }

        let centerPos = this.height * 0.5 + degHeight;

        this.ctx.beginPath();
        this.ctx.moveTo(0, centerPos - offset);
        this.ctx.lineTo(this.width, centerPos + offset);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.lineTo(0, this.height * 0.5 - offset)

        this.ctx.stroke();
        this.ctx.fill();

        this.ctx.fillStyle = '#fff';
        //pitch lines:
        let lineDistance = this.height * 0.03;
        let tinyWidth = this.width * 0.1;
        let smallWidth = this.width * 0.2;
        let wideWith = this.width * 0.3;

        let textHOffset = 25;
        let textWOffset = 100;

        //rotate everything by bank:
        this.ctx.translate(this.width * 0.5, centerPos);
        this.ctx.rotate(Math.round(this.bank * Math.PI / 2) * 0.011);

        //0 - 10 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance);
        this.ctx.moveTo(0 - smallWidth * 0.5, 0 - lineDistance * 2);
        this.ctx.lineTo(0 + smallWidth * 0.5, 0 - lineDistance * 2);
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 3);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance * 3);
        this.ctx.moveTo(0 - wideWith * 0.5, 0 - lineDistance * 4);
        this.ctx.lineTo(0 + wideWith * 0.5, 0 - lineDistance * 4);
        this.ctx.fillText('10', 0 - wideWith * 0.5 - textWOffset, 0 - lineDistance * 4 + textHOffset);

        //0 - 20 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 5);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance* 5);
        this.ctx.moveTo(0 - smallWidth * 0.5, 0 - lineDistance * 6);
        this.ctx.lineTo(0 + smallWidth * 0.5, 0 - lineDistance* 6);
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 7);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance* 7);
        this.ctx.moveTo(0 - wideWith * 0.5, 0 - lineDistance * 8);
        this.ctx.lineTo(0 + wideWith * 0.5, 0 - lineDistance* 8);
        this.ctx.fillText('20', 0 - wideWith * 0.5 - textWOffset, 0 - lineDistance * 8 + textHOffset);

        //20 - 25 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 9);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance * 9);
        this.ctx.moveTo(this.width * -1, 0 - lineDistance * 10);
        this.ctx.lineTo(this.width, 0  - lineDistance * 10);

        //0 - -10 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance);
        this.ctx.moveTo(0 - smallWidth * 0.5, 0 + lineDistance * 2);
        this.ctx.lineTo(0 + smallWidth * 0.5, 0 + lineDistance * 2);
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 3);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance * 3);
        this.ctx.moveTo(0 - wideWith * 0.5, 0 + lineDistance * 4);
        this.ctx.lineTo(0 + wideWith * 0.5, 0 + lineDistance * 4);
        this.ctx.fillText('-10', 0 - wideWith * 0.5 - textWOffset, 0 + lineDistance * 4 + textHOffset);
        

        //-10 to -20 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 5);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance* 5);
        this.ctx.moveTo(0 - smallWidth * 0.5, 0 + lineDistance * 6);
        this.ctx.lineTo(0 + smallWidth * 0.5, 0 + lineDistance* 6);
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 7);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance* 7);
        this.ctx.moveTo(0 - wideWith * 0.5, 0 + lineDistance * 8);
        this.ctx.lineTo(0 + wideWith * 0.5, 0 + lineDistance* 8);
        this.ctx.fillText('-20', 0 - wideWith * 0.5 - textWOffset, 0 + lineDistance * 8 + textHOffset);

        //-20 to -25:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 9);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance * 9);
        this.ctx.moveTo(this.width * -1, 0 + lineDistance * 10);
        this.ctx.lineTo(this.width, 0  + lineDistance * 10);

        //draw:
        this.ctx.stroke();

        //restore angles:
        this.ctx.restore();

        //black overlay:
        this.ctx.beginPath();
        this.ctx.fillStyle = '#000';
        this.ctx.arc(this.width * 0.5, this.height * 0.5, this.height * 0.3 , 0, 2 * Math.PI);
        this.ctx.rect(this.width, 0, -this.width, this.height);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.width * 0.20, this.height);
        this.ctx.rect(this.width * 0.8, 0, this.width * 0.2, this.height);
        this.ctx.fill();        
    }

    #renderHeader() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = "center";
        this.ctx.font = "60px Calibri"

        //section lines:
        let lineSep = this.width / 5;
        let lineHeight = this.height / 8;

        this.ctx.lineWidth = 4;
        this.ctx.moveTo(lineSep, 0);
        this.ctx.lineTo(lineSep, lineHeight);

        this.ctx.moveTo(lineSep * 2, 0);
        this.ctx.lineTo(lineSep * 2, lineHeight);

        this.ctx.moveTo(lineSep * 3, 0)
        this.ctx.lineTo(lineSep * 3, lineHeight);

        this.ctx.moveTo(lineSep * 4, 0)
        this.ctx.lineTo(lineSep * 4, lineHeight);

        //text:
        let renderHeight = this.height * 0.05;

        this.ctx.fillText("S P E E D", lineSep * 0.5, renderHeight);
        this.ctx.fillText("A L T", lineSep * 1.5, renderHeight);
        this.ctx.fillText("H D G", lineSep * 2.5, renderHeight);
        this.ctx.fillText("B A N K", lineSep * 3.5, renderHeight);
        this.ctx.fillText("A P", lineSep * 4.5, renderHeight);

        //values:
        renderHeight = this.height * 0.1;
        this.ctx.fillStyle = "#5882f3";
        this.ctx.fillText(this.airspeed, lineSep * 0.5, renderHeight);
        this.ctx.fillText(this.altitude, lineSep * 1.5, renderHeight);
        this.ctx.fillText(this.heading, lineSep * 2.5, renderHeight);
        this.ctx.fillText(this.bank, lineSep * 3.5, renderHeight);
        this.ctx.fillText(this.autopilot, lineSep * 4.5, renderHeight);
        this.ctx.stroke();
    }

    #renderBody() {
        this.#renderLeftBody();
        this.#renderRightBody();
        this.#renderMiddleBody();
    }

    #renderLeftBody() {
        this.ctx.beginPath();
        this.strokeStyle = '#fff';
        this.ctx.fillStyle = '#808080';
        this.ctx.lineWidth = 6;

        //primary rect:
        this.ctx.fillRect(this.width * 0.02, this.height * 0.20, this.width * 0.10, this.height * 0.6);
        this.ctx.rect(this.width * 0.02, this.height * 0.20, this.width * 0.10, this.height * 0.6);

        //litte markings at top and bottom of primary rect:
        this.ctx.moveTo(this.width * 0.10, this.height * 0.20)
        this.ctx.lineTo(this.width * 0.15, this.height * 0.20);
        this.ctx.moveTo(this.width * 0.10, this.height * 0.80);
        this.ctx.lineTo(this.width * 0.15, this.height * 0.80);
        this.ctx.stroke();
    }

    #renderRightBody() {
        this.strokeStyle = '#fff';
        this.ctx.fillStyle = '#808080';
        this.ctx.lineWidth = 6;

        //primary rect:
        this.strokeStyle = '#fff';
        this.ctx.fillStyle = '#808080';
        this.ctx.lineWidth = 6;

        //litte markings at top and bottom of primary rect:
        this.ctx.fillRect(this.width * 0.88, this.height * 0.20, this.width * 0.10, this.height * 0.6);
        this.ctx.rect(this.width * 0.88, this.height * 0.20, this.width * 0.10, this.height * 0.6);

        this.ctx.moveTo(this.width * 0.88, this.height * 0.20);
        this.ctx.lineTo(this.width * 0.85, this.height * 0.20);
        this.ctx.moveTo(this.width * 0.88, this.height * 0.80);
        this.ctx.lineTo(this.width * 0.85, this.height * 0.80);
        this.ctx.stroke();
    }

    #renderMiddleBody() {
        
    }

    #getHorizonPixelLevel(width, angle) {
        let alpha = 90 - angle;
        let a = width / 2;
        return a / Math.tan(alpha * Math.PI / 180);
    }
}

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

class Warning {
    audio
    active
    
    constructor(path) {
        this.audio = new Audio(path);
        //loop audio
        if(typeof this.audio.loop == 'boolean') {
            this.audio.loop = true;
        } else {
            this.audio.addEventListener('ended', () => {
                this.currentTime = 0;
                this.play();
            }, false);
        }

        //set to inactive
        this.active = false;
    }

    enable() {
        if(!this.active) {
            this.audio.play();
            this.active = true;
        }
    }

    disable() {
        if(this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.active = false;
        }
    }
}

class Engine {
    power_input = 0.5
    active_power = 0.5

    calculate() {
        if(this.power_input > this.active_power) {
            this.active_power += 0.05;
        } else if(this.power_input < this.active_power) {
            this.active_power -= 0.05;
        }
    }

    powerUp() {
        this.power_input += 0.005;
        if(this.power_input > 1) {
            this.power_input = 1;
        }
    }

    powerDown() {
        this.power_input -= 0.005;
        if(this.power_input < 0) {
            this.power_input = 0;
        }
    }

    getPower() {
        return this.active_power;
    }
}

let warnings = new Object();
//speed warning:
warnings.speed = new Warning('./files/audio/warning_speed.mp3');
warnings.overspeed = new Warning('./files/audio/warning_overspeed.mp3');
warnings.terrain = new Warning('./files/audio/warning_terrain.mp3');
warnings.bankangle = new Warning('./files/audio/warning_bankangle.mp3');
warnings.stall = new Warning('./files/audio/warning_stall.mp3');


let leftArrow = false;
let rightArrow = false;
let upArrow = false;
let downArrow = false;
let engine_up = false;
let engine_down = false;

let plane;

//current plane movement multiplier:
let plane_bank = 0;
let plane_rotate_side = 0;
let plane_pitch = 0;
let plane_pitchDEG = 0;

const STEERING_BANK = 0.02;
const STEERING_PITCH = 0.01;

const DRAG = 0.995;

let airspeed = 2.0;
let airspeedMPH = 150;

let plane_engine = new Engine();

let heading = 0;
let angle = 0;
let altitude = 0;

let touchdown = false;

//stall
let stall = false;
let stallFall = 0;
const STALLCONTROLDISABLER = 50;


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
        plane.position.y = 50;

        const planeAnim_idle = scene.getAnimationGroupByName("idle");
        planeAnim_idle.stop();
        //planeAnim_idle.start(true, 0.25, planeAnim_idle.from, planeAnim_idle.to, false); // slow
        planeAnim_idle.start(true, 1, planeAnim_idle.from, planeAnim_idle.to, false); // full speed


        /*****************SET TARGET FOR CAMERA************************/ 
        camera.lockedTarget = plane;
        /**************************************************************/
        
    });



    let ground = BABYLON.Mesh.CreateGround("ground1", 2000, 2000, 0, scene);
    ground.checkCollisions = true;

    for (let index = -50; index < 50; index++) {
        let sphere;
        sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
        sphere.position.y = 0;
        sphere.position.z = 20*index;
        let groundMaterial = new BABYLON.StandardMaterial("Ground Material", scene);
        sphere.material = groundMaterial;
        sphere.material.diffuseColor = BABYLON.Color3.Yellow();  
        sphere.checkCollisions = true;
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

    //calculte numbers:
    airspeedMPH = (airspeed / 3) * 150;
    plane_pitchDEG = ((plane_pitch % 6) / 6) * 360

    

    if(plane) {
        heading = (Math.abs(plane.rotation.y % 6) / 6) * 360;
        angle = ((plane.rotation.z % 6) / 6) * 360;
        altitude = plane.position.y;

        //stall caluclation:
        if(airspeedMPH < 28) {
            stall = true;
            stallFall += 0.001;
            if(stallFall > 0.5) {
                stallFall = 0.5;
            }
            plane.position.y -= stallFall;
        } else if (stall) {
            stallFall = 0;
            stall = false;
        }
    }

    /* keyboard game loop */
    if(leftArrow && angle > -90) {
        if(stall) {
            plane_bank -= STEERING_BANK / STALLCONTROLDISABLER;
        } else {
            plane_bank -= STEERING_BANK;
        }
    }
    if(rightArrow && angle < 90) {
        if(stall) {
            plane_bank += STEERING_BANK / STALLCONTROLDISABLER;
        } else {
            plane_bank += STEERING_BANK;
        }   
    }
    if(upArrow) {
        if(stall) {
            plane_pitch -= STEERING_PITCH / STALLCONTROLDISABLER;
        } else {
            plane_pitch -= STEERING_PITCH;
        }
        
    }
    if(downArrow) {
        if(stall) {
            plane_pitch += STEERING_PITCH / STALLCONTROLDISABLER;
        } else {
            plane_pitch += STEERING_PITCH;
        }
        
    }
    if(engine_up) {
        plane_engine.powerUp();
    }
    if(engine_down) {
        plane_engine.powerDown();
    }

    //slow down airspeed by default:
    airspeed *= DRAG;

    //calculate rotation:
    plane_rotate_side += plane_bank * 0.008;

    //engine power:
    if(airspeed < 5) {
        airspeed += plane_engine.getPower() * 0.025;
    }

    //up and down movement:
    if(plane_pitch < 0) {
        airspeed -= plane_pitch * 0.06;
    } else if(plane_pitch > 0) {
        airspeed -= plane_pitch* 0.01;
    }
    

    if(airspeed < 0) {
        airspeed = 0;
    }


    /* fly forward */
    if (plane) {
        plane.rotation = new BABYLON.Vector3(plane_pitch, plane_rotate_side, plane_bank);
        plane.movePOV(0,0,airspeed*0.1);
        
        //flight
        plane_engine.calculate();

        //display
        updatePFD();
        checkAlarm(); 
    }
    
    scene.render();
});



// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

function updatePFD() {
    pfd.airspeed = Math.round(airspeedMPH);
    pfd.altitude = Math.round(altitude);
    pfd.heading = Math.round(heading);
    pfd.bank = Math.round(angle);
    pfd.pitch = Math.round(plane_pitchDEG);
    pfd.render();
}

function checkAlarm() {
    if(stall) {
        warnings.stall.enable();
    } else {
        warnings.stall.disable();
    }

    if(airspeedMPH < 70 && !stall) {
        warnings.speed.enable();
    } else {
        warnings.speed.disable();
    }

    if(airspeedMPH > 200) {
        warnings.overspeed.enable();
    } else {
        warnings.overspeed.disable();
    }

    if(altitude < 30) {
        warnings.terrain.enable();
    } else {
        warnings.terrain.disable();
    }

    if(angle > 45 || angle < -45) {
        warnings.bankangle.enable();
    } else {
        warnings.bankangle.disable();
    }
}

let pfd = new PFD(document.getElementById('PFD-js'));
pfd.render();




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
    if (e.keyCode == 37 || e.keyCode == 65){ // leftArrow
        leftArrow = true;
    }
    if (e.keyCode == 38 || e.keyCode == 87){ //upArrow
        upArrow = true;
    }
    if (e.keyCode == 39 || e.keyCode == 68){ // rightArrow
        rightArrow = true;
    }
    if (e.keyCode == 40 || e.keyCode == 83){ // downArrow
        downArrow = true;
    }
    if(e.keyCode == 82) {
        engine_up = true;
    }
    if(e.keyCode == 70) {
        engine_down = true;
    }
}
/* CHECK RELEASED KEY */
function keyListenerUp(e){
    if (e.keyCode == 37 || e.keyCode == 65){ // leftArrow
        leftArrow = false;
    }
    if (e.keyCode == 38 || e.keyCode == 87){ //upArrow
        upArrow = false;
    }
    if (e.keyCode == 39 || e.keyCode == 68){ // rightArrow
        rightArrow = false;
    }
    if (e.keyCode == 40 || e.keyCode == 83){ // downArrow
        downArrow = false;
    }
    if(e.keyCode == 82) {
        engine_up = false;
    }
    if(e.keyCode == 70) {
        engine_down = false;
    }
}