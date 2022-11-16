"use strict";
//----------------------------------------------------------------------------------------
//IMPORT

import * as THREE from "./three.module.js";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import {getModel, loadCubeModel, loadModels, LODModel} from "../models/ModelLoader.js";
import {OrbitControls} from "./OrbitControls.js";
import {Water} from "./Water.js";
import {VRButton} from "../Common/VRButton.js"
import {addTreeSprite} from "./Sprite.js";

//IMPORT END
//----------------------------------------------------------------------------------------
//INIT RENDERER
/**
 * setter opp renderer med canvas
 * @type {WebGLRenderer}
 */
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
    antialias: true,
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);

const scene = new THREE.Scene();

//INIT RENDERER END
//----------------------------------------------------------------------------------------
//VR CAMERA

//Camera for vr
renderer.xr.enabled = true; // Enable VR

document.body.appendChild(VRButton.createButton(renderer)); //VR button

const vrCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
vrCamera.position.set( 0, 13.5, -0.4); // set the initial position entering VR
//When entering VR
renderer.xr.addEventListener(`sessionstart`, function (){
  scene.add(vrCamera);
  vrCamera.add(camera);
})
//When exiting VR
renderer.xr.addEventListener(`sessionend`, function (){
  scene.remove(vrCamera);
  camera.remove(vrCamera);
});

//VR CAMERA END
//----------------------------------------------------------------------------------------
//PERSPECTIVE CAMERA

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set( -12, 20, -20 );
camera.lookAt(-10,0,-10);
controls.update();

scene.add(camera);

//PERSPECTIVE CAMERA END
//----------------------------------------------------------------------------------------
//SKYBOX

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'images/sky/Daylight_Right.jpg',
  'images/sky/Daylight_Left.jpg',
  'images/sky/Daylight_Top.jpg',
  'images/sky/Daylight_Bottom.jpg',
  'images/sky/Daylight_Front.jpg',
  'images/sky/Daylight_Back.jpg',
]);
scene.background = texture;

//SKYBOX END
//----------------------------------------------------------------------------------------
//GROUND

const size = 1024;
const height = 4;
const geometry = new THREE.PlaneGeometry(200, 200, size-1, size-1);

geometry.rotateX((Math.PI / 180)*-90);
const terrainImage = new Image();



terrainImage.onload = () => {
  const data = getHeightmapData(terrainImage,size);

  for(let i = 0; i < data.length; i++){
    geometry.attributes.position.setY(i, data[i] * height);

  }

  const mesh = new THREE.Mesh(geometry,material);

  mesh.receiveShadow = true;

  scene.add(mesh);
};

/**
 * url til heightmap som skal brukes til byen
 * @type {string}
 */
terrainImage.src = 'images/map/HeightMap.png';

/**
 *
 * @param url - url til texturen
 * @param scale - scaleringfaktoren
 * @returns {*|Texture} - returnerer teksturobjekt
 */
function loadTexture(url,scale){
  const texture = new THREE.TextureLoader().load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.multiplyScalar(scale);
  return texture;
}

/**
 * teksturer til bakken
 * @type {*|Texture}
 */
const road = loadTexture('images/ground/road.jpg',500);
const ground = loadTexture('images/ground/ground.png',500);
const marking = loadTexture('images/ground/marking.png',200);
const people = loadTexture('images/ground/people.png',500);
const grass1 = loadTexture('images/ground/grass.png', 1000);
const grass2 = loadTexture('images/ground/grass2.png', 1000);
const flower = loadTexture('images/ground/flower.png', 300);
/**
 * Maps til bakken
 * @type {Texture|*}
 */
const alpha1 = new THREE.TextureLoader().load('images/map/sidewalk.png');
const alpha2 = new THREE.TextureLoader().load('images/map/road.png');
const alpha3 = new THREE.TextureLoader().load('images/map/people.png');
const alpha4 = new THREE.TextureLoader().load('images/map/terrain.png');
const alpha5 = new THREE.TextureLoader().load('images/map/grass.png');
const alpha6 = new THREE.TextureLoader().load('images/map/flower.png');

/**
 * materiale som skal brukes for bakken.
 * @type {TextureSplattingMaterial}
 */
const material = new TextureSplattingMaterial({
  color: THREE.Color.NAMES.grey,
  colorMaps: [road,ground,marking,people,grass1,grass2,flower],
  alphaMaps: [alpha1,alpha2,alpha3,alpha4,alpha5,alpha6]
});

material.wireframe = false;

//GROUND END
//----------------------------------------------------------------------------------------
//LIGHT

/**
 * lager hemispherelys som skal gjenskape dagslys
 * @type {HemisphereLight}
 */
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemiLight.color.setHSL(0.6,1,0.6);
hemiLight.groundColor.setHSL(0.095,1,0.75);
hemiLight.position.set(0,50,0);
scene.add(hemiLight);

//const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
//scene.add(hemiLightHelper);

/**
 * lager retningslys som skal gjenskape direkte sollys og skygger
 * @type {DirectionalLight}
 */
const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( - 1, 1.75, 1 );
dirLight.position.multiplyScalar( 10 );
scene.add( dirLight );

dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 50;

dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.0001;

//const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
//scene.add( dirLightHelper );

//LIGHT END
//----------------------------------------------------------------------------------------
//BUILDING

/**
 * lager 4 lister med bygninger for hver type bygning i byen
 * @type {Object3D[]}
 */
let building0 = [new THREE.Object3D(),
  new THREE.Object3D(),
  new THREE.Object3D(),
  new THREE.Object3D(),
  new THREE.Object3D()];

let building1 = [new THREE.Object3D(),
  new THREE.Object3D()];

let building2 = [new THREE.Object3D(),
    new THREE.Object3D];

let building3 = [new THREE.Object3D(),
    new THREE.Object3D(),
    new THREE.Object3D()];

/**
 * ligger alle listene av bygninger i en samlet liste
 * @type {Object3D[][]}
 */
const buildings = [building0,building1,building2,building3];
const ranges = [[0.0,5.0,10.0,20.0,30.0],[0.0,30.0],[0.0,30.0],[0.0,15.0,30.0]];  // avstanden lod skal bytte modell
const amounts = [4,1,1,2];                                                        // antall modeller
const scales = [[0.05,0.08,0.05],[0.9,0.9,1.2],[0.1,0.12,0.1],[0.08,0.10,0.05]];  // skaleringer

/**
 * url til bygningene
 * @type {string}
 */
const buildingUrl = 'models/building/building';

/**
 * lager 4 kuber som skal fremstille laveste lod av bygningene
 * @type {Raycaster.params.Mesh}
 */
const cube00 = loadCubeModel('models/building/textures/building0.jpg', 10, 1,19,1.7);
cube00.position.set(1.1,0,0);
const cube01 = loadCubeModel('models/building/textures/building0.jpg', 5, 1.9,3.5,1.9);
cube01.position.set(-0.7,0,0);
const cube1 = loadCubeModel('models/building/textures/building1.jpg', 2, 2,10,2);
const cube2 = loadCubeModel('models/building/textures/building2.jpg', 2, 2,12.5,2);
const cube3 = loadCubeModel('models/building/textures/building3.jpg', 2, 2,7,2);

/**
 * ligger cubene til siste objektet i bygning listene
 */
building0[building0.length -1].add(cube00);
building0[building0.length -1].add(cube01);

building1[building1.length -1].add(cube1);

building2[building2.length -1].add(cube2);

building3[building3.length -1].add(cube3);


/**
 * definerer maks distanse og mellomrom mellom bygningene, kan endres for å forbedre fps
 * @type {number}
 */
const maxDist = 30;
const spacing = 3;
/**
 * laster inn modeller og distribuerer de jevnt over byen
 */
loadModels(buildings, buildingUrl, '.glb', amounts, scales,()=>{
  let x = -maxDist;
  let y = -maxDist;
  while(x<maxDist){
    while(y<maxDist){
      if(Math.sqrt(x*x+y*y) < maxDist
          && (x < -26 || x > -8 || y < -28 || y > -10)
          && (x < -3 || x > 3 || y < -2 || y > 2)) {
        const i = Math.floor(Math.random()*buildings.length);
        const lod = LODModel(
            buildings[i].map((model) => model.clone(true)),
            x + Math.random() - 0.5, 2.05, y + Math.random() - 0.5,
            ranges[i]
        );
        lod.rotateY(Math.floor(Math.random()*4)*Math.PI/2);
        scene.add(lod);
      }
      y += spacing;
    }
    y = -maxDist;
    x += spacing;
  }
});

// BUILDING END
//----------------------------------------------------------------------------------------
//PLANE

/**
 * lager en liste av liste av 3DObjekter som flyene skal ligges til
 * @type {Object3D[][]}
 */
const plane = [[new THREE.Object3D(),
  new THREE.Object3D(),
  new THREE.Object3D()]];

const pranges = [0.0,5.0,10.0];         // avstanden lod skal bytte modell
const pamounts = [3];                   // antall modeller
const pscales = [[0.003,0.003,0.003]];  // skaleringer

/**
 * url til flymodellen
 * @type {string}
 */
const planeUrl = 'models/planes/spitfire';

const plane1 = new THREE.Object3D();
const plane2 = new THREE.Object3D();

/**
 * laster inn flymodell
 */
loadModels(plane, planeUrl, '.glb', pamounts, pscales,()=> {
  const lod = LODModel(
      plane[0].map((model) => model.clone(true)),
      0,0,0,
      pranges
  );
  plane1.add(lod.clone(true));
  plane2.add(lod.clone(true));
});

// CatMulRomCurve3 closed loop for first plane
const curve1 = new THREE.CatmullRomCurve3([
  new THREE.Vector3( -5, 15, 5 ),
  new THREE.Vector3( -2.5, 13, -2.5 ),
  new THREE.Vector3( 5, 18, -5 ),
  new THREE.Vector3( 2.5, 14, -2.5 ),
  new THREE.Vector3( 5, 19, 5 )
]);

// CatMulRomCurve3 closed loop for second plane
const curve2 = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 6, 15, 4 ),
  new THREE.Vector3( -2.5, 16, 2.5 ),
  new THREE.Vector3( -2.5, 19, 2.5 ),
  new THREE.Vector3( -2.5, 14, -2.5 ),
  new THREE.Vector3( 6, 19, -5 )
]);



scene.add(plane1);
scene.add(plane2);

// Ends meet
curve1.closed = true;
const points = curve1.getPoints( 50 );
const geometryCurve = new THREE.BufferGeometry().setFromPoints( points );
//Color of first curve
const materialCurve = new THREE.LineBasicMaterial( { color : white, transparent : true, opacity : 0.0 } );
const curveObject = new THREE.Line( geometryCurve, materialCurve );
scene.add( curveObject );

curve2.closed = true;
const points2 = curve2.getPoints( 50 );
const geometryCurve2 = new THREE.BufferGeometry().setFromPoints( points2 );
//Color of second curve
const materialCurve2 = new THREE.LineBasicMaterial( { color : white, transparent : true, opacity : 0.0 } );
const curveObject2 = new THREE.Line( geometryCurve2, materialCurve2 );
scene.add( curveObject2 );

// Move plane along curve
function animate(plane,curve) {
  // Get time
  const time = Date.now();
  // Get position along curve
  const position = curve.getPointAt( ( time % 10000 ) / 10000 );
  // Get rotation along curve
  const tangent = curve.getTangentAt( ( time % 10000 ) / 10000 ).normalize();
  // Set plane position
  plane.position.copy(position);
  // Set plane rotation
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
  plane.quaternion.copy(quaternion);
  // Set plane scale
  //plane.scale.set(0.5, 0.5, 0.5);
  // Add plane to scene
}

//PLANE END
//----------------------------------------------------------------------------------------
//TREE
//første klynge
addTreeSprite(-20,-8, 3, -17, -11, scene);
//andre klynge
addTreeSprite(-28,-10, 3.24, -28, -18, scene);
//tredje klynge
addTreeSprite(-20,-8, 3.5, -28, -17, scene);
//TREE END
//----------------------------------------------------------------------------------------
//WATER

const waterGeometry = new THREE.PlaneGeometry(2048,2048);
/**
 * legger til vann til scenen
 * @type {Water}
 */
let water = new Water(waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('images/map/waternormals.jpg',(texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: true
    });
water.rotation.x = -Math.PI / 2;
water.position.setY(1.8);
scene.add(water);

//WATER END
//----------------------------------------------------------------------------------------
//MAIN BUILDING

/**
 * legger modell i sentrum av byen
 */
getModel('models/empire_state/empireState.glb',(model) => {
  model.scene.position.set(0,2.05,0);
  model.scene.scale.set(0.04,0.04,0.04);
  model.scene.traverse(function (node) {
    if (node.isMesh) {
      node.receiveShadow = true;
      node.castShadow = true;
    }
  });
  scene.add(model.scene);
});

//MAIN BUILDING END
//----------------------------------------------------------------------------------------
//AUDIO
const listener = new THREE.AudioListener();
camera.add(listener);

const soundCity = new THREE.PositionalAudio(listener);

const audioLoaderCity = new THREE.AudioLoader();
audioLoaderCity.load('audio/city.mp3', (buffer) => {
  soundCity.setBuffer(buffer);
  soundCity.setRefDistance(3);
  soundCity.setLoop(true);
});

const soundPlane1 = new THREE.PositionalAudio(listener);
const soundPlane2 = new THREE.PositionalAudio(listener);

const audioLoaderPlane1 = new THREE.AudioLoader();
audioLoaderPlane1.load('audio/spitfire1.mp3', (buffer) => {
  soundPlane1.setBuffer(buffer);
  soundPlane1.setRefDistance(3);
  soundPlane1.setLoop(true);
});

const audioLoaderPlane2 = new THREE.AudioLoader();
audioLoaderPlane2.load('audio/spitfire2.mp3', (buffer) => {
  soundPlane2.setBuffer(buffer);
  soundPlane2.setRefDistance(3);
  soundPlane2.setLoop(true);
});

plane1.add(soundPlane1);
plane2.add(soundPlane2);

scene.add(soundCity);


//AUDIO END
//----------------------------------------------------------------------------------------
//FOG
/**
 * legger til tåke
 * @type {FogExp2}
 */
//  scene.fog = new THREE.FogExp2(0xffffff,0.05);
//FOG END
//----------------------------------------------------------------------------------------
//RENDERING
/**
 * oppdaterer renderstørrelsen ved endring av størrelsen på canvas
 */
function updateRendererSize() {
  const { x: currentWidth, y: currentHeight } = renderer.getSize(
    new THREE.Vector2()
  );
  const width = renderer.domElement.clientWidth;
  const height = renderer.domElement.clientHeight;

  if (width !== currentWidth || height !== currentHeight) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

let start = performance.now()*0.0001;

/**
 * animasjonsloop
 */

addEventListener('click', (event) => {
  if(!soundCity.isPlaying){
    soundCity.play(Math.random());
  }
  if(!soundPlane1.isPlaying){
    soundPlane1.play(Math.random());
  }
  if(!soundPlane2.isPlaying){
    soundPlane2.play(Math.random());
  }
});

function loop() {
  updateRendererSize();

  animate(plane1,curve1);
  animate(plane2,curve2);

  const time = performance.now()*0.0001;
  water.material.uniforms['time'].value += time - start;
  start = time;

  //console.log(buildings);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(loop);
//RENDERING END
//----------------------------------------------------------------------------------------