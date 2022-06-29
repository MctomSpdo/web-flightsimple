export function getDefaultCamera(scene) {
    let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, 30), scene);
    camera.lowerRadiusLimit = 0.14;
    camera.radius = 0.4;
    camera.heightOffset = 2;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.025;
    camera.maxCameraSpeed = 10;
    return camera;
}

export function getGlobalLight(scene) {
    let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.2;
    light.specular = BABYLON.Color3.Black();
    return light;
}

export function getSunLight(scene) {
    let light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    light.position = new BABYLON.Vector3(0, 5, 5);
    light.intensity = 1.6;
    return light;
}

export function spawnSpheres(scene) {
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
}

export function getFog(scene) {
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0003;
    scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
    scene.fogStart = 120;
}

export function getGround(scene, terrainTexture, terrainMaterial) {
    let boxMat = new BABYLON.StandardMaterial("groundMat");
    boxMat.diffuseTexture = terrainTexture;
    let ground = BABYLON.Mesh.CreateGround("ground1", 50000, 50000, 0, scene);
    ground.checkCollisions = true;
    ground.material = terrainMaterial;
    ground.position.y = -10;
    ground.receiveShadows = true;
    return ground;
}

export function getTerrainTexture(scene) {
    const terrain_texture_url = "https://www.babylonjs-playground.com/textures/ground.jpg";
    let terrainTexture = new BABYLON.Texture(terrain_texture_url, scene);
    terrainTexture.uScale = 4.0;
    terrainTexture.vScale = terrainTexture.uScale;
    return terrainTexture;
}

export function getSkyBox(scene) {
    let skybox = BABYLON.Mesh.CreateBox("skyBox", 50000, scene);
    let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./files/textures/sky/clouds/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.applyFog = false;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    return skybox;
}

export function spawnTrees(scene, terrain, shadowGenerator, camera) {
    let instances = new Array();
    BABYLON.SceneLoader.ImportMesh("", "//www.babylonjs.com/assets/Tree/", "tree.babylon", scene, function (newMeshes) {
        newMeshes[0].material.opacityTexture = null;
        newMeshes[0].material.backFaceCulling = false;
        newMeshes[0].isVisible = true;
        newMeshes[0].position.y = terrain.getHeightFromMap(0, 0); // Getting height from ground object
        newMeshes[0].scaling.scaleInPlace(5);

        shadowGenerator.getShadowMap().renderList.push(newMeshes[0]);
        var range = 10000;
        var count = 1000;
        for (var index = 0; index < count; index++) {
            var newInstance = newMeshes[0].createInstance("i" + index);
            var x = range / 2 - Math.random() * range;
            var z = range / 2 - Math.random() * range;

            var y = terrain.getHeightFromMap(x, z) - 2; // Getting height from ground object

            newInstance.position = new BABYLON.Vector3(x, y, z);

            newInstance.rotate(BABYLON.Axis.Y, Math.random() * Math.PI * 2, BABYLON.Space.WORLD);

            var scale = 0.5 + Math.random() * 2;
            newInstance.scaling.addInPlace(new BABYLON.Vector3(scale, scale, scale));

            shadowGenerator.getShadowMap().renderList.push(newInstance);
            instances.push(newInstance);
        }
        shadowGenerator.usePoissonSampling = true;

        // Collisions
        camera.checkCollisions = true;
        camera.applyGravity = true;
    });
    return instances;
}

export function explostion(scene, position) {
    BABYLON.ParticleHelper.CreateAsync("explosion", scene).then((set) => {
        set.systems.forEach(s => {
            s.disposeOnStop = true;
        });
        set.start(position);
    });
}

/**
 * get the mesh that the camera is currently looking at
 * @param {*} camera 
 */
export function getObjectCameraLookingOn(scene) {
    return scene.pickWithRay(scene.activeCamera.getForwardRay(800));
}

export function getKillKamera(scene, plane ) {
    let killCam = new BABYLON.UniversalCamera("KillCam", new BABYLON.Vector3(plane.position.x, plane.position.y, plane.position.z));
    let oldCam = scene.activeCamera;
    killCam.position = oldCam.position.clone();
    killCam.rotation = oldCam.rotation.clone();
    return killCam;
}