import {GLTFLoader} from "../src/GLTFLoader.js";
import * as THREE from "../src/three.module.js";

/**
 *
 * @param model - url til modell som skal lastes
 * @param callback - funksjon som skal utføres etter modellen er lastet inn
 */
export function getModel(model,callback) {
    const loader = new GLTFLoader();
    loader.load(
        model,
        function (gltf) {
            callback(gltf);
        }
    );
}

/**
 *
 * @param models - liste av 3DObjekter som skal brukes
 * @param x - posisjon i x kordinater
 * @param y - posisjon i y kordinater
 * @param z - posisjon i z kordinater
 * @param ranges - liste av avstander som skal brukes
 * @returns {LOD} - LOD objekt
 */
export function LODModel(models,x,y,z,ranges) {
    const lod = new THREE.LOD();
    let i = 0;
    models.forEach((model)=>{
        lod.addLevel(model,ranges[i]);
        i++;
    });
    lod.traverse((mesh)=>{
        if (mesh.isMesh) {
            mesh.receiveShadow = true;
            mesh.castShadow = true;
        }
    });
    lod.position.set(x,y,z);
    return lod;
}

/**
 *
 * @param models - liste av en liste av 3DObjekter som modeller skal legges til
 * @param url - url til mappe og filnavn til modellene
 * @param filetype - filtypen av modellene
 * @param amounts - liste av antall modeller som skal lastes for hver liste med modeller
 * @param scales - liste av skaleringer for hver liste med modeller
 * @param callback - funksjon som skal utføres etter alle modeller er lastet inn
 */
export function loadModels(models, url, filetype, amounts, scales, callback) {
    let done = 0;
    models.forEach((model,i)=>{
        model.forEach((mod, index) => {
            if(index < amounts[i]) {
                getModel(url + i + '_' + index + filetype, (gltf) => {
                    gltf.scene.traverse((node) => {
                        if (node.isMesh) {
                            node.receiveShadow = true;
                            node.castShadow = true;
                        }
                    });
                    gltf.scene.scale.set(scales[i][0],scales[i][1],scales[i][2]);
                    mod.add(gltf.scene);
                    done++;
                });
            }
        });
    });

    /**
     * hjelpefunskjon som utsetter callbackfunksjon til alle elementer er lastet inn
     */
    function waitForElement() {
        if (done < amounts.reduce((item, base) => item + base, 0)) {
            setTimeout(waitForElement, 250);
        } else {
            callback();
        }
    }
    waitForElement();
}

/**
 *
 * @param url - url til texturen
 * @param texSize - skaleringsfaktoren til teksturen
 * @param x - størrelse i x retning
 * @param y - størrelse i y retning
 * @param z - størrelse i z retning
 * @returns {Mesh} - returnerer kuben som ble generert
 */
export function loadCubeModel(url, texSize, x, y ,z) {
    const texLoad = new THREE.TextureLoader();
    const texCube = texLoad.load(url);

    texCube.wrapS = THREE.RepeatWrapping;
    texCube.wrapT = THREE.RepeatWrapping;

    texCube.repeat.multiplyScalar(texSize);

    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(x,y,z),
        new THREE.MeshPhongMaterial({
            map: texCube
        })
    );
    cube.receiveShadow = true;
    cube.castShadow = true;
    return cube;
}