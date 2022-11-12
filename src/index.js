"use strict";

import * as THREE from "./three.module.js";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import {getModel, loadModel, LODModel} from "../models/ModelLoader.js";
import {OrbitControls} from "./OrbitControls.js";
import {Water} from "./Water.js";
import {VRButton} from "../Common/VRButton.js"


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
})

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set( -12, 20, -20 );
camera.lookAt(-10,0,-10);
controls.update();

scene.add(camera);
//Camera end


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

// TODO: implement terrain.
const size = 1024;
const height = 4;
const geometry = new THREE.PlaneGeometry(200, 200, size-1, size-1);

//LIGHT
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemiLight.color.setHSL(0.6,1,0.6);
hemiLight.groundColor.setHSL(0.095,1,0.75);
hemiLight.position.set(0,50,0);
scene.add(hemiLight);

//const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
//scene.add(hemiLightHelper);

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

const texLoad0 = new THREE.TextureLoader();
const texCube0 = texLoad0.load('models/building/textures/building0.jpg');

texCube0.wrapS = THREE.RepeatWrapping;
texCube0.wrapT = THREE.RepeatWrapping;

texCube0.repeat.multiplyScalar(5);

const cube0 = new THREE.Mesh(
    new THREE.BoxGeometry(30,240,30),
    new THREE.MeshPhongMaterial({
      map: texCube0
    })
);
cube0.receiveShadow = true;
cube0.castShadow = true;

const texLoad1 = new THREE.TextureLoader();
const texCube1 = texLoad1.load('models/building/textures/building1.jpg');

texCube1.wrapS = THREE.RepeatWrapping;
texCube1.wrapT = THREE.RepeatWrapping;

texCube1.repeat.multiplyScalar(2);

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(30,240,30),
    new THREE.MeshPhongMaterial({
      map: texCube1
    })
);
cube1.receiveShadow = true;
cube1.castShadow = true;

const texLoad2 = new THREE.TextureLoader();
const texCube2 = texLoad2.load('models/building/textures/building2.jpg');

texCube2.wrapS = THREE.RepeatWrapping;
texCube2.wrapT = THREE.RepeatWrapping;

texCube2.repeat.multiplyScalar(2);

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(40,250,40),
    new THREE.MeshPhongMaterial({
      map: texCube2
    })
);
cube2.receiveShadow = true;
cube2.castShadow = true;

const texLoad3 = new THREE.TextureLoader();
const texCube3 = texLoad3.load('models/building/textures/building3.jpg');

texCube3.wrapS = THREE.RepeatWrapping;
texCube3.wrapT = THREE.RepeatWrapping;

texCube3.repeat.multiplyScalar(5);

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(55,130,75),
    new THREE.MeshPhongMaterial({
      map: texCube3
    })
);
cube3.receiveShadow = true;
cube3.castShadow = true;


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

let buildings = [building0,building1,building2,building3];
const ranges = [[0.0,5.0,10.0,20.0,30.0],[0.0,30.0],[0.0,30.0],[0.0,15.0,30.0]];

const buildingUrl = 'models/building/building';


getModel('models/planes/plane.glb',0,(gltf,ind)=>{
  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.receiveShadow = true;
      node.castShadow = true;
    }
  });
  gltf.scene.scale.set(0.1,0.12,0.1);
  gltf.scene.position.set(5,15,5);
  scene.add(gltf.scene);
});

let amount = 4;
let done = 4;

building0.forEach((building, index) => {
  if(index < amount) {
    getModel(buildingUrl + '0_' + index + '.glb', 0, (gltf, ind) => {
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.receiveShadow = true;
          node.castShadow = true;
        }
      });
      building.add(gltf.scene);
      gltf.scene.scale.set(1.0,1.0,1.0);
      done--;
    });
  } else {
    console.log(index);
  }
});

amount = 1;
done += 1;

building1.forEach((building, index) => {
  if(index < amount) {
    getModel(buildingUrl + '1_' + index + '.glb', 0, (gltf, ind) => {
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.receiveShadow = true;
          node.castShadow = true;
        }
      });
      building.add(gltf.scene);
      gltf.scene.scale.set(15.0,20.0,15.0);
      done--;

    });
  } else {
    console.log(index);
  }
});

amount = 1;
done += 1;

building2.forEach((building, index) => {
  if(index < amount) {
    getModel(buildingUrl + '2_' + index + '.glb', 0, (gltf, ind) => {
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.receiveShadow = true;
          node.castShadow = true;
        }
      });
      building.add(gltf.scene);
      gltf.scene.scale.set(2.0,2.5,2.0);
      done--;
    });
  } else {
    console.log(index);
  }
});

amount = 2;
done += 2;

building3.forEach((building, index) => {
  if(index < amount) {
    getModel(buildingUrl + '3_' + index + '.glb', 0, (gltf, ind) => {
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.receiveShadow = true;
          node.castShadow = true;
        }
      });
      building.add(gltf.scene);
      gltf.scene.scale.set(2.0,2.0,1.5);
      done--;
    });
  } else {
    console.log(index);
  }
});

building0[4].add(cube0.clone(true));

building1[1].add(cube1.clone(true));

building2[1].add(cube2.clone(true));

building3[2].add(cube3.clone(true));

// x = [-26 , -8]
// y = [-28 ,-10]

// max x [-95,95]
// max y [-95,95]

let maxDist = 35;
let spacing = 3;

function waitForElement() {
  if(done > 0){
    setTimeout(waitForElement,250);
  } else {
    let x = -maxDist;
    let y = -maxDist;
    while(x<maxDist){
      while(y<maxDist){
        if(Math.sqrt(x*x+y*y) < maxDist && (x < -26 || x > -8 || y < -28 || y > -10) && (x < -3 || x > 3 || y < -2 || y > 2)) {
          const i = Math.floor(Math.random()*buildings.length);
          const lod = LODModel(
              buildings[i].map((model) => model.clone(true)),
              scene,
              0.04,
              x + Math.random() - 0.5, 2.05, y + Math.random() - 0.5,
              ranges[i]
          );
          scene.add(lod);
        }
        y += spacing;
      }
      y = -maxDist;
      x += spacing;
    }
  }
}
waitForElement();

//Water
const waterGeometry = new THREE.PlaneGeometry(2048,2048);

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
      fog: scene.fog !== undefined
    });
water.rotation.x = -Math.PI / 2;
water.position.setY(1.8);
scene.add(water);


getModel('models/empire_state/empireState.glb',0,(model) => {
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

terrainImage.src = 'images/map/HeightMap.png';

const road = new THREE.TextureLoader().load('images/ground/road.jpg');
const ground = new THREE.TextureLoader().load('images/ground/ground.png');
const marking = new THREE.TextureLoader().load('images/ground/marking.png');
const people = new THREE.TextureLoader().load('images/ground/people.png');
const grass1 = new THREE.TextureLoader().load('images/ground/grass.png');
const grass2 = new THREE.TextureLoader().load('images/ground/grass2.png');
const flower = new THREE.TextureLoader().load('images/ground/flower.png');

const alpha1 = new THREE.TextureLoader().load('images/map/sidewalk.png');
const alpha2 = new THREE.TextureLoader().load('images/map/road.png');
const alpha3 = new THREE.TextureLoader().load('images/map/people.png');
const alpha4 = new THREE.TextureLoader().load('images/map/terrain.png');
const alpha5 = new THREE.TextureLoader().load('images/map/grass.png');
const alpha6 = new THREE.TextureLoader().load('images/map/flower.png');

road.wrapS = THREE.RepeatWrapping;
ground.wrapS = THREE.RepeatWrapping;
people.wrapS = THREE.RepeatWrapping;
grass1.wrapS = THREE.RepeatWrapping;
grass2.wrapS = THREE.RepeatWrapping;
flower.wrapS = THREE.RepeatWrapping;

road.wrapT = THREE.RepeatWrapping;
ground.wrapT = THREE.RepeatWrapping;
people.wrapT = THREE.RepeatWrapping;
grass1.wrapT = THREE.RepeatWrapping;
grass2.wrapT = THREE.RepeatWrapping;
flower.wrapT = THREE.RepeatWrapping;

road.repeat.multiplyScalar(500);
ground.repeat.multiplyScalar(200);
people.repeat.multiplyScalar(500);
grass1.repeat.multiplyScalar(1000);
grass2.repeat.multiplyScalar(1000);
flower.repeat.multiplyScalar(300);

const material = new TextureSplattingMaterial({
  color: THREE.Color.NAMES.grey,
  colorMaps: [road,ground,marking,people,grass1,grass2,flower],
  alphaMaps: [alpha1,alpha2,alpha3,alpha4,alpha5,alpha6]
});

material.wireframe = false;

scene.fog = new THREE.FogExp2(0xffffff,0.05);


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

function loop() {
  updateRendererSize();
  water.material.uniforms['time'].value += 1.0/240.0;

  console.log(building1);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(loop);
