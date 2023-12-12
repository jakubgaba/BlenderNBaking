import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesvertexshader from './shaders/fireflies/vertex.glsl'
import firefliesfragmentshader from './shaders/fireflies/fragment.glsl'


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

const debugObject={}
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

// Portal light material
const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

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
const fireFliesCount = 30;
const positionArray = new Float32Array(fireFliesCount * 3)

for(let i = 0 ; i < fireFliesCount; i++){
    positionArray[i*3+0]=(Math.random() -0.5) * 4
    positionArray[i*3+1]=Math.random() * 1.5
    positionArray[i*3+2]=(Math.random() -0.5) * 4
}

fireFliesGeometry.setAttribute('position',new THREE.BufferAttribute(positionArray, 3))

//Material

const fireFliesMaterial = new THREE.ShaderMaterial({
    uniforms:
    {
        uPixelRatio:{value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: firefliesvertexshader ,
    fragmentShader: firefliesfragmentshader
})

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

    fireFliesMaterial.uniforms.uPixelRatio.value=Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
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

debugObject.clearColor = '#ffffff'
renderer.setClearColor(debugObject.clearColor)
gui
.addColor(debugObject,'clearColor')
.onChange(()=>{
    renderer.setClearColor(debugObject.clearColor)
})
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()