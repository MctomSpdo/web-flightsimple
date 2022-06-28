import PFD from "./pfd.js";
import WarningManager, { Warning } from "./warning.js";

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

//terrain imports: (https://playground.babylonjs.com/#FJNR5#826)
var terrain_url = "https://cdn.rawgit.com/BabylonJS/Extensions/master/DynamicTerrain/dist/babylon.dynamicTerrain.min.js";
var terrain_script = document.createElement("script");
terrain_script.src = terrain_url;
document.head.appendChild(terrain_script);

// ******************
// Noise Library : https://github.com/josephg/noisejs/blob/master/perlin.js
var noise;
(function (global) {
    var module = noise = {};

    function Grad(x, y, z) {
        this.x = x; this.y = y; this.z = z;
    }

    Grad.prototype.dot2 = function (x, y) {
        return this.x * x + this.y * y;
    };

    Grad.prototype.dot3 = function (x, y, z) {
        return this.x * x + this.y * y + this.z * z;
    };

    var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
    new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
    new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];

    var p = [151, 160, 137, 91, 90, 15,
        131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
        190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
        88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
        77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
        102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
        135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
        5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
        223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
        251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
        49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
        138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
    // To remove the need for index wrapping, double the permutation table length
    var perm = new Array(512);
    var gradP = new Array(512);

    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    module.seed = function (seed) {
        if (seed > 0 && seed < 1) {
            // Scale the seed out
            seed *= 65536;
        }

        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }

        for (var i = 0; i < 256; i++) {
            var v;
            if (i & 1) {
                v = p[i] ^ (seed & 255);
            } else {
                v = p[i] ^ ((seed >> 8) & 255);
            }

            perm[i] = perm[i + 256] = v;
            gradP[i] = gradP[i + 256] = grad3[v % 12];
        }
    };

    module.seed(0);

    /*
    for(var i=0; i<256; i++) {
      perm[i] = perm[i + 256] = p[i];
      gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
    }*/

    // Skewing and unskewing factors for 2, 3, and 4 dimensions
    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;

    var F3 = 1 / 3;
    var G3 = 1 / 6;

    // 2D simplex noise
    module.simplex2 = function (xin, yin) {
        var n0, n1, n2; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin) * F2; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin - j + t;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
            i1 = 1; j1 = 0;
        } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
            i1 = 0; j1 = 1;
        }
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1 + 2 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        i &= 255;
        j &= 255;
        var gi0 = gradP[i + perm[j]];
        var gi1 = gradP[i + i1 + perm[j + j1]];
        var gi2 = gradP[i + 1 + perm[j + 1]];
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot2(x1, y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot2(x2, y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70 * (n0 + n1 + n2);
    };

    // 3D simplex noise
    module.simplex3 = function (xin, yin, zin) {
        var n0, n1, n2, n3; // Noise contributions from the four corners

        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin + zin) * F3; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var k = Math.floor(zin + s);

        var t = (i + j + k) * G3;
        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin - j + t;
        var z0 = zin - k + t;

        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
            else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
        } else {
            if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
            else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
            else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        var x1 = x0 - i1 + G3; // Offsets for second corner
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;

        var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
        var y2 = y0 - j2 + 2 * G3;
        var z2 = z0 - k2 + 2 * G3;

        var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
        var y3 = y0 - 1 + 3 * G3;
        var z3 = z0 - 1 + 3 * G3;

        // Work out the hashed gradient indices of the four simplex corners
        i &= 255;
        j &= 255;
        k &= 255;
        var gi0 = gradP[i + perm[j + perm[k]]];
        var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
        var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
        var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];

        // Calculate the contribution from the four corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 32 * (n0 + n1 + n2 + n3);

    };

    // ##### Perlin noise stuff

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }

    // 2D Perlin Noise
    module.perlin2 = function (x, y) {
        // Find unit grid cell containing point
        var X = Math.floor(x), Y = Math.floor(y);
        // Get relative xy coordinates of point within that cell
        x = x - X; y = y - Y;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255; Y = Y & 255;

        // Calculate noise contributions from each of the four corners
        var n00 = gradP[X + perm[Y]].dot2(x, y);
        var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
        var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
        var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);

        // Compute the fade curve value for x
        var u = fade(x);

        // Interpolate the four results
        return lerp(
            lerp(n00, n10, u),
            lerp(n01, n11, u),
            fade(y));
    };

    // 3D Perlin Noise
    module.perlin3 = function (x, y, z) {
        // Find unit grid cell containing point
        var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
        // Get relative xyz coordinates of point within that cell
        x = x - X; y = y - Y; z = z - Z;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255; Y = Y & 255; Z = Z & 255;

        // Calculate noise contributions from each of the eight corners
        var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
        var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
        var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
        var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
        var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
        var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
        var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
        var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);

        // Compute the fade curve value for x, y, z
        var u = fade(x);
        var v = fade(y);
        var w = fade(z);

        // Interpolate
        return lerp(
            lerp(
                lerp(n000, n100, u),
                lerp(n001, n101, u), w),
            lerp(
                lerp(n010, n110, u),
                lerp(n011, n111, u), w),
            v);
    };

})(this);

// ######################################################

//primary flight display:
let pfd = new PFD(document.getElementById('PFD-js'));
pfd.render();

class Engine {
    power_input = 0.5
    active_power = 0.5

    calculate() {
        if (this.power_input > this.active_power) {
            this.active_power += 0.05;
        } else if (this.power_input < this.active_power) {
            this.active_power -= 0.05;
        }
    }

    powerUp() {
        this.power_input += 0.005;
        if (this.power_input > 1) {
            this.power_input = 1;
        }
    }

    powerDown() {
        this.power_input -= 0.005;
        if (this.power_input < 0) {
            this.power_input = 0;
        }
    }

    getPower() {
        return this.active_power;
    }

    destroy() {
        this.active_power = 0;
    }
}

let warnings = new WarningManager();
warnings.addWarningsByName('speed', 'overspeed', 'terrain', 'bankangle', 'stall', 'autopilot-disconnect');


let leftArrow = false;
let rightArrow = false;
let upArrow = false;
let downArrow = false;
let engine_up = false;
let engine_down = false;

let keys = new Array(120);

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
let gameover = false;

//stall
let stall = false;
let stallFall = 0;
const STALLCONTROLDISABLER = 50;

//ground:
let ground


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
    light.intensity = 0.2;
    light.specular = BABYLON.Color3.Black(); 

    let light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    light2.position = new BABYLON.Vector3(0, 5, 5);
    light2.intensity = 1.6;


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

    for (let index = -50; index < 50; index++) {
        let sphere;
        sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
        sphere.position.y = 0;
        sphere.position.z = 20 * index;
        let groundMaterial = new BABYLON.StandardMaterial("Ground Material", scene);
        sphere.material = groundMaterial;
        sphere.material.diffuseColor = BABYLON.Color3.Yellow();
        sphere.checkCollisions = true;
    }
    for (let index = -50; index < 50; index++) {
        let sphere;
        sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
        sphere.position.y = 0;
        sphere.position.x = 20 * index;
        let groundMaterial = new BABYLON.StandardMaterial("Ground Material", scene);
        sphere.material = groundMaterial;
        sphere.material.diffuseColor = BABYLON.Color3.Red();
    }

    //Shadows:
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    shadowGenerator.getShadowMap().renderList.push(plane);

    //terrain:

    var mapSubX = 1000;             // point number on X axis
    var mapSubZ = 800;              // point number on Z axis
    var seed = 1.3;                 // seed
    var noiseScale = 0.03;         // noise frequency
    var elevationScale = 6.0;
    noise.seed(seed);
    var mapData = new Float32Array(mapSubX * mapSubZ * 3); // 3 float values per point : x, y and z
    var mapColors = new Float32Array(mapSubX * mapSubZ * 3); // x3 because 3 values per point : r, g, b
    //var paths = [];                             // array for the ribbon model
    for (var l = 0; l < mapSubZ; l++) {
        //var path = [];                          // only for the ribbon
        for (var w = 0; w < mapSubX; w++) {
            var x = (w - mapSubX * 0.5) * 2.0;
            var z = (l - mapSubZ * 0.5) * 2.0;
            var y = noise.simplex2(x * noiseScale, z * noiseScale);
            y *= (0.5 + y) * y * elevationScale;   // let's increase a bit the noise computed altitude

            mapData[3 * (l * mapSubX + w)] = x;
            mapData[3 * (l * mapSubX + w) + 1] = y;
            mapData[3 * (l * mapSubX + w) + 2] = z;

            // colors of the map
            mapColors[3 * (l * mapSubX + w)] = (0.5 + Math.random() * 0.2);
            mapColors[3 * (l * mapSubX + w) + 1] = (0.5 + Math.random() * 0.4);
            mapColors[3 * (l * mapSubX + w) + 2] = (0.5);

            //path.push(new BABYLON.Vector3(x, y, z));
        }
        //paths.push(path);
    }

    // Texture and material
    var terrain_texture_url = "https://www.babylonjs-playground.com/textures/ground.jpg";
    var terrainTexture = new BABYLON.Texture(terrain_texture_url, scene);
    terrainTexture.uScale = 4.0;
    terrainTexture.vScale = terrainTexture.uScale;

    var terrainMaterial = new BABYLON.StandardMaterial("tm", scene);
    terrainMaterial.diffuseTexture = terrainTexture;
    terrainMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    //terrainMaterial.diffuseColor = BABYLON.Color3.Green();
    //terrainMaterial.alpha = 0.8;
    //terrainMaterial.wireframe = true;

    // wait for dynamic terrain extension to be loaded
    terrain_script.onload = function () {

        // Dynamic Terrain
        // ===============
        var terrainSub = 500;               // 20 terrain subdivisions
        var params = {
            mapData: mapData,               // data map declaration : what data to use ?
            mapSubX: mapSubX,               // how are these data stored by rows and columns
            mapSubZ: mapSubZ,
            mapColors: mapColors,
            terrainSub: terrainSub          // how many terrain subdivisions wanted
        }
        var terrain = new BABYLON.DynamicTerrain("t", params, scene);
        terrain.mesh.material = terrainMaterial;
        terrain.useCustomVertexFunction = true;
        terrain.receiveShadows = true;

        // user custom function
        terrain.updateVertex = function (vertex, i, j) {
            if (vertex.position.y > 2.0) {
                vertex.color.r = 1.0;
                vertex.color.b = 0.2;
            }
        };

        terrain.update(true);

    }   // onload closing bracket

    //outside of renderDistance
    let boxMat = new BABYLON.StandardMaterial("groundMat");
    boxMat.diffuseTexture = terrainTexture;
    ground = BABYLON.Mesh.CreateGround("ground1", 2000, 2000, 0, scene);
    ground.checkCollisions = true;
    ground.material = terrainMaterial;
    ground.position.y = -10;
    ground.receiveShadows = true;

    return scene;
};


const scene = createScene(); //Call the createScene function

//collision detection: 
scene.registerBeforeRender(() => {
    if (plane) {
        let meshes = scene.getActiveMeshes();
        meshes.forEach((mesh) => {
            if (plane.id == mesh.id) {
                return;
            }
            if (plane.intersectsMesh(mesh)) {
                //if mesh is the same as the plane mesh, don't count it
                if (plane.id == mesh.id || mesh.id == 'aerobatic_plane.2') return;
                gameOver("Crashed the Airplane!");
            }
        });

        if(ground) {
            ground.position.x = plane.position.x;
            ground.position.z = plane.position.z;
        }
    }
});


// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    if (gameover) {
        scene.render();
        return;
    }

    //calculte numbers:
    airspeedMPH = (airspeed / 3) * 150;
    plane_pitchDEG = ((plane_pitch % 6) / 6) * 360


    if (plane) {
        heading = (Math.abs(plane.rotation.y % 6) / 6) * 360;
        angle = ((plane.rotation.z % 6) / 6) * 360;
        altitude = plane.position.y;

        //stall caluclation:
        if (airspeedMPH < 28) {
            stall = true;
            stallFall += 0.001;
            if (stallFall > 0.5) {
                stallFall = 0.5;
            }
            plane.position.y -= stallFall;
        } else if (stall) {
            stallFall = 0;
            stall = false;
        }
    }

    /* keyboard game loop */
    if (leftArrow && angle > -90) {
        if (stall) {
            plane_bank -= STEERING_BANK / STALLCONTROLDISABLER;
        } else {
            plane_bank -= STEERING_BANK;
        }
    }
    if (rightArrow && angle < 90) {
        if (stall) {
            plane_bank += STEERING_BANK / STALLCONTROLDISABLER;
        } else {
            plane_bank += STEERING_BANK;
        }
    }
    if (upArrow) {
        if (stall) {
            plane_pitch -= STEERING_PITCH / STALLCONTROLDISABLER;
        } else {
            plane_pitch -= STEERING_PITCH;
        }

    }
    if (downArrow) {
        if (stall) {
            plane_pitch += STEERING_PITCH / STALLCONTROLDISABLER;
        } else {
            plane_pitch += STEERING_PITCH;
        }

    }
    if (engine_up) {
        plane_engine.powerUp();
    }
    if (engine_down) {
        plane_engine.powerDown();
    }

    //slow down airspeed by default:
    airspeed *= DRAG;

    //calculate rotation:
    plane_rotate_side += plane_bank * 0.008;

    //engine power:
    if (airspeed < 5) {
        airspeed += plane_engine.getPower() * 0.025;
    }

    //up and down movement:
    if (plane_pitch < 0) {
        airspeed -= plane_pitch * 0.06;
    } else if (plane_pitch > 0) {
        airspeed -= plane_pitch * 0.01;
    }


    if (airspeed < 0) {
        airspeed = 0;
    }


    /* fly forward */
    if (plane) {
        plane.rotation = new BABYLON.Vector3(plane_pitch, plane_rotate_side, plane_bank);
        plane.movePOV(0, 0, airspeed * 0.1);

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
    pfd.airspeed = airspeedMPH;
    pfd.altitude = altitude;
    pfd.heading = heading;
    pfd.bank = angle;
    pfd.pitch = plane_pitchDEG;
    pfd.render();
}

function checkAlarm() {
    if (stall) {
        warnings.enableWarningByName('stall');
    } else {
        warnings.disableWarningByName('stall');
    }

    if (airspeedMPH < 70 && !stall) {
        warnings.enableWarningByName('speed');
    } else {
        warnings.disableWarningByName('speed');
    }

    if (airspeedMPH > 200) {
        warnings.enableWarningByName('overspeed');
    } else {
        warnings.disableWarningByName('overspeed');
    }

    if (altitude < 30) {
        warnings.enableWarningByName('terrain');
    } else {
        warnings.disableWarningByName('terrain');
    }

    if (angle > 45 || angle < -45) {
        warnings.enableWarningByName('bankangle');
    } else {
        warnings.disableWarningByName('bankangle');
    }
}

function gameOver(message) {
    gameover = true;
    //reset plane values:
    plane_bank = 0;
    plane_pitch = 0;
    plane_rotate_side = 0;
    airspeed = 0;
    airspeedMPH = 0;
    altitude = 0;
    plane_engine.destroy();
    //update displays:
    pfd.blackOut();

    //hide Plane:
    plane.setEnabled(false);
}



/*****************************************
 * KEYBOARD EVENTS
 *****************************************/
/* x ... left/right */
/* y ... up/down    */
/* z ... forward    */

document.onkeydown = keyListenerDown;
document.onkeyup = keyListenerUp;


/* CHECK PRESSED KEY */
function keyListenerDown(e) {
    if (gameover) return; //if game is over ignore key inputs
    if (e.keyCode >= 0 && e.keyCode < 120) {
        keys[e.keyCode] = true;
    }
    leftArrow = (e.keyCode == 37 || e.keyCode == 65);
    upArrow = (e.keyCode == 38 || e.keyCode == 87);
    rightArrow = (e.keyCode == 39 || e.keyCode == 68);
    downArrow = (e.keyCode == 40 || e.keyCode == 83);
    engine_up = (e.keyCode == 82);
    engine_down = (e.keyCode == 70);
}
/* CHECK RELEASED KEY */
function keyListenerUp(e) {
    if (e.keyCode >= 0 && e.keyCode < 120) {
        keys[e.keyCode] = false;
    }
    if (e.keyCode == 37 || e.keyCode == 65) { // leftArrow
        leftArrow = false;
    }
    if (e.keyCode == 38 || e.keyCode == 87) { //upArrow
        upArrow = false;
    }
    if (e.keyCode == 39 || e.keyCode == 68) { // rightArrow
        rightArrow = false;
    }
    if (e.keyCode == 40 || e.keyCode == 83) { // downArrow
        downArrow = false;
    }
    if (e.keyCode == 82) {
        engine_up = false;
    }
    if (e.keyCode == 70) {
        engine_down = false;
    }
}