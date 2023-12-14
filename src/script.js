import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesvertexshader from './shaders/fireflies/vertex.glsl'
import firefliesfragmentshader from './shaders/fireflies/fragment.glsl'
import portalvertexshader from './shaders/portal/vertex.glsl'
import portalfragmentshader from './shaders/portal/fragment.glsl'

/**
 * Spector JS
 */
// var SPECTOR = require("spectorjs");

// var spector = new SPECTOR.Spector();
// spector.displayUI();

/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 400
})

const debugObject = {}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

debugObject.portalColorStart = '#ff0000'
debugObject.portalColorEnd = '#0000ff'

// Portal light material
const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms: { 
        uTime: { value: 0 },
        uColorStart: {value: new THREE.Color(debugObject.portalColorStart)},
        uColorEnd:{value: new THREE.Color(debugObject.portalColorEnd)},
        strength: { value: 0.0 },
        strengthOuterGlow: {value: 0.0}
    },
    vertexShader: portalvertexshader,
    fragmentShader: portalfragmentshader
})


gui
.addColor(debugObject,'portalColorStart').onChange(()=>{portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)})

gui
.addColor(debugObject,'portalColorEnd').onChange(()=>{portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)})


// gui.add(debugObject, 'strength', 0.0, 1.0).step(0.01).onChange(value => {
//     portalLightMaterial.uniforms.strength.value = value;
// });
gui.add(portalLightMaterial.uniforms.strength, 'value').min(0).max(1).step(0.01).name("Strength")

gui.add(portalLightMaterial.uniforms.strengthOuterGlow, 'value').min(0).max(1).step(0.01).name("outerStrength")

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })

/**
 * Model
 */
gltfLoader.load(
    'portal.glb',
    (gltf) => {
        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
        const portalLightMesh = gltf.scene.children.find(child => child.name === 'portalLight')
        const poleLightAMesh = gltf.scene.children.find(child => child.name === 'poleLightA')
        const poleLightBMesh = gltf.scene.children.find(child => child.name === 'poleLightB')

        bakedMesh.material = bakedMaterial
        portalLightMesh.material = portalLightMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial

        scene.add(gltf.scene)
    }
)

/**
 * Fireflies
 */
const fireFliesGeometry = new THREE.BufferGeometry()
const fireFliesCount = 300;
const positionArray = new Float32Array(fireFliesCount * 3)
const scaleArray = new Float32Array(fireFliesCount)

for (let i = 0; i < fireFliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
    positionArray[i * 3 + 1] = Math.random() * 1.5
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

    scaleArray[i] = Math.random()
}

fireFliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
fireFliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 3))
//Material

const fireFliesMaterial = new THREE.ShaderMaterial({
    uniforms:
    {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 70 },
        uTime: { value: 0 }
    },
    vertexShader: firefliesvertexshader,
    fragmentShader: firefliesfragmentshader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
})

gui.add(fireFliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name("FireFliesSize")
//Points
const fireflies = new THREE.Points(fireFliesGeometry, fireFliesMaterial)
scene.add(fireflies)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    fireFliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2
camera.position.y = 1
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

debugObject.clearColor = '#696363'
renderer.setClearColor(debugObject.clearColor)
gui
    .addColor(debugObject, 'clearColor')
    .onChange(() => {
        renderer.setClearColor(debugObject.clearColor)
    })
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    //Update material
    fireFliesMaterial.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
