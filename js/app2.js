/**
 * Notions étudiées dans cet exercice :
 *      - Structuration du code à l'aide de fonction pour une meilleure organisation
 *      - Création d'une skybox : backgrounds appliqués sur les faces d'un cube pour simuler un arrière plan 3D
 *      - Hiérarchie entre les objets : un objet peut être enfant d'un autre objet.
 *        Les transformations sur un parent (translation, rotation, scale) sont répercutées sur ses enfants
 *      - Création d'une interface utilisateur en HTML/CSS & création d'un menu via Dat.GUI
 **/

import * as THREE from 'three';
import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GUI } from './dat.gui/dat.gui.module.js';

/**
 * Déclaration des variables globales utilisées dans l'application.
 * Je marque mes variables globales avec un prefix _ pour bien les distinguer
 */
var _scene // Scene
var _renderer // Renderer
var _camera // Camera
var _control // Controle de la camera
var _clock = new THREE.Clock() // Timer
var _elapsedTime = 0 //  Durée écoulée entre la frame actuelle N et N-1
var _hydrogene // Déclaration de la variable hydrogene
var electronMesh2 // Déclaration de la variable hydrogene
var electronMesh // Déclaration de la variable hydrogene
var Terre // Déclaration de la variable hydrogene
var Mars // Déclaration de la variable hydrogene
var Lune // Déclaration de la variable hydrogene
var Saturne // Déclaration de la variable hydrogene
var Soleil // Déclaration de la variable hydrogene


var _focusTerre
var _focusLune
var _focusMars
var _focusSoleil
var _focusSaturn
var _background

var DatGUISettings = { // Parametres disponible dans le menu dat GUI
    electronSpeedFactor: 1,
    protonColor: 0xffffff
}

//  Initialisation de la scene 3D
function InitScene() {

    // Initialisation de la scene
    _scene = new THREE.Scene()

    // Initialisation du renderer, activation de l'anti aliasing et des ombres
    _renderer = new THREE.WebGLRenderer({ antialias: true })
    _renderer.shadowMap.enabled = true
    _renderer.shadowMap.type = THREE.PCFSoftShadowMap
    _renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(_renderer.domElement)

    // Création des axes helper
    const axesHelper = new THREE.AxesHelper(5)
    _scene.add(axesHelper)

    // Initialisation et placement de la camera
    _camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
    _camera.position.set(100, 100, 80)

    // Création du controle camera
    _control = new OrbitControls(_camera, _renderer.domElement)
    _control.enableDamping = true;
    _control.dampingFactor = 0.1;
    _control.enablePan = false

    // Création d'une lumiere ambiante
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.25)
    _scene.add(ambientLight)

    // Création d'une lumiere directionelle
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1)
    directionalLight.position.set(-10, 10, 0)
    _scene.add(directionalLight)

    // Création d'un helper pour la lumiere directionelle
    const dlHelper = new THREE.DirectionalLightHelper(directionalLight)
    _scene.add(dlHelper)

    const sphereGeometry = new THREE.SphereGeometry(400);
    const sphere1Texture = new THREE.TextureLoader().load('/assets/textures/space-background.jpg');
    const sphereMaterial = new THREE.MeshLambertMaterial({ map: sphere1Texture, side: THREE.DoubleSide });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.x = 3;
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;
    _scene.add(sphereMesh);

    // Création et positionnement de l'atome d'hygdrogene
    _hydrogene = new Hydrogene(5, 25, 5)
    _hydrogene.obj.position.x = 0

    const size = 100;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper(size, divisions);
    _scene.add(gridHelper);
}



/**
 * Fonction qui permet de créer un atome d'hydrogene 3D
 * @param {number} protonRadius -  Rayon du proton
 * @param {number} electronSpeed - Vitesse de deplacement de l'electron en deg/sec
 * @param {number} electronSpeed - Vitesse de deplacement de l'electron en unite/sec
 */
function Hydrogene(protonRadius, electronSpeed, speed) {


    // Création de l'objet parent qui va regrouper l"ensemble
    const obj = new THREE.Object3D()

    // Création du soleil
    const protonGeo = new THREE.SphereGeometry(30, 16, 16)
    const proton = new THREE.TextureLoader().load('/assets/textures/sun-texture.jpg');

    const protonMat = new THREE.MeshLambertMaterial({ map: proton })
    Soleil = new THREE.Mesh(protonGeo, protonMat)
        // Ajoute le proton à l'objet
    obj.add(Soleil)
        // Place le proton au centre de l'objet
    Soleil.position.set(0, 0, 0)

    // Création de l'orbite, représentée par un anneau, rayon = protonRadius * 3, epaisseur = 0.05
    const orbitGeo = new THREE.TorusGeometry(75, 0.05, 32, 64)
    const obitMat = new THREE.MeshLambertMaterial({ color: 0xDBDBDB })
    const orbitMesh = new THREE.Mesh(orbitGeo, obitMat)
    obj.add(orbitMesh)
        // Place l'anneau au centre de l'objet
    orbitMesh.position.set(0, 0, 0)
    orbitMesh.rotation.x = THREE.MathUtils.degToRad(90)
        // Creation d'un axis helper pour visualiser les axes de l'orbite
    const axesHelper = new THREE.AxesHelper(5)
    orbitMesh.add(axesHelper)


    // Création de l'electron, rayon = protonRadius * 0.25
    const electronRadius = protonRadius * 0.5
    const electronGeo = new THREE.SphereGeometry(5, 16, 16)
    const _terre = new THREE.TextureLoader().load('/assets/textures/earth-texture.jpg');

    const electronMat = new THREE.MeshLambertMaterial({ map: _terre })
    Terre = new THREE.Mesh(electronGeo, electronMat)
    obj.add(Terre)
        // Ajout l'electron à l'orbite afin de le déplacer selon les mouvements de l'orbite 
    orbitMesh.add(Terre)
        // Placement de l'electron sur l'orbit
    Terre.position.y = 75

    // Création de l'orbite lune
    const orbitGeo3 = new THREE.TorusGeometry(10, 0.05, 32, 64)
    const obitMat3 = new THREE.MeshLambertMaterial({ color: 0xDBDBDB })
    const orbitMesh3 = new THREE.Mesh(orbitGeo3, obitMat3)
    obj.add(orbitMesh3)
        // Place l'anneau au centre de l'objet
    orbitMesh3.position.set(0, 0, 0)
    Terre.add(orbitMesh3)
    orbitMesh3.rotation.x = THREE.MathUtils.degToRad(25)
        // Creation d'un axis helper pour visualiser les axes de l'orbite
    const axesHelper3 = new THREE.AxesHelper(5)
    orbitMesh3.add(axesHelper3)


    // Création de l'electron, rayon = protonRadius * 0.25
    const electronRadius4 = protonRadius * 0.5
    const electronGeo4 = new THREE.SphereGeometry(0.75, 16, 16)
    const _lune = new THREE.TextureLoader().load('/assets/textures/moon-texture.jpg');

    const electronMat4 = new THREE.MeshLambertMaterial({ map: _lune })
    Lune = new THREE.Mesh(electronGeo4, electronMat4)
    obj.add(Lune)
        // Ajout l'electron à l'orbite afin de le déplacer selon les mouvements de l'orbite 
    orbitMesh3.add(Lune)

    // Placement de l'electron sur l'orbit
    Lune.position.y = 10

    // Création de l'orbite01
    const orbitGeo1 = new THREE.TorusGeometry(100, 0.05, 32, 64)
    const obitMat1 = new THREE.MeshLambertMaterial({ color: 0xDBDBDB })
    const orbitMesh1 = new THREE.Mesh(orbitGeo1, obitMat1)
    obj.add(orbitMesh1)
        // Place l'anneau au centre de l'objet
    orbitMesh1.position.set(0, 0, 0)
    orbitMesh1.rotation.x = THREE.MathUtils.degToRad(90)
        // Creation d'un axis helper pour visualiser les axes de l'orbite
    const axesHelper1 = new THREE.AxesHelper(5)
    orbitMesh1.add(axesHelper1)


    // Création de l'electron, rayon = protonRadius * 0.25
    const electronRadius2 = protonRadius * 0.5
    const electronGeo2 = new THREE.SphereGeometry(3, 16, 16)
    const _mars = new THREE.TextureLoader().load('/assets/textures/mars-texture.jpg');

    const electronMat2 = new THREE.MeshLambertMaterial({ map: _mars })
    Mars = new THREE.Mesh(electronGeo2, electronMat2)
    obj.add(Mars)
        // Ajout l'electron à l'orbite afin de le déplacer selon les mouvements de l'orbite
    orbitMesh.add(Mars)
        // Placement de l'electron sur l'orbit
    Mars.position.y = 100


    // Création de l'orbite02
    const orbitGeo2 = new THREE.TorusGeometry(160, 0.05, 32, 64)
    const obitMat2 = new THREE.MeshLambertMaterial({ color: 0xDBDBDB })
    const orbitMesh2 = new THREE.Mesh(orbitGeo2, obitMat2)
    obj.add(orbitMesh2)
        // Place l'anneau au centre de l'objet
    orbitMesh2.position.set(0, 0, 0)
    orbitMesh2.rotation.x = THREE.MathUtils.degToRad(90)
        // Creation d'un axis helper pour visualiser les axes de l'orbite
    const axesHelper2 = new THREE.AxesHelper(5)
    orbitMesh2.add(axesHelper2)


    const electronRadius3 = protonRadius * 0.5
    const electronGeo3 = new THREE.SphereGeometry(8, 16, 16)
    const _saturn = new THREE.TextureLoader().load('/assets/textures/saturn-texture.jpg');

    const electronMat3 = new THREE.MeshLambertMaterial({ map: _saturn })
    Saturne = new THREE.Mesh(electronGeo3, electronMat3)
    obj.add(Saturne)
        // Ajout l'electron à l'orbite afin de le déplacer selon les mouvements de l'orbite 
    orbitMesh.add(Saturne)
        // Placement de l'electron sur l'orbit
    Saturne.position.y = 160

    const _saturn_ring = new THREE.TextureLoader().load('/assets/textures/saturn-ring-texture.png');

    const geometry = new THREE.RingGeometry(8, 14, 32);
    const material = new THREE.MeshBasicMaterial({ map: _saturn_ring, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh)
    _scene.add(mesh);
    Saturne.add(mesh)



    // Ajout de l'ensemble à la scene
    _scene.add(obj)

    // On reference nos objets 3D au sein de valeurs liées à l'objet Hydrogene
    this.obj = obj // L'objet 3D dans sa globalité
    this.proton = Soleil // Le proton 3D
    this.orbit = orbitMesh // l'orbite 3D
    this.electron = electronMesh // l'electron 3D
    this.electronSpeed = electronSpeed // vitesse de rotation de l'orbit (deg/sec)
    this.speed = speed // vitesse de deplacement de l'atome
    this.direction = 1 // sens de direction du deplacement
    this.planet01 = Terre
    this.planet02 = Lune
    this.planet03 = Saturne
    this.planet04 = Mars
}

// Fonction qui permet d'initialiser l'UI Dat.GUI
function InitDatGUI() {
    const gui = new GUI()
        // Création des parametres pour l'atom
    const atomSettings = gui.addFolder("Parametres de l'atome")
    atomSettings.add(DatGUISettings, "electronSpeedFactor", 1, 10, 0.1, ).name("Vitesse de l'electron")
    atomSettings.addColor(DatGUISettings, "protonColor").name("Couleur du proton").onChange(OnChangeProtonColor)
    atomSettings.open()
}

// Fonction appelée lors du changement de la couleur du proton
function OnChangeProtonColor() {
    _hydrogene.proton.material.color.setHex(DatGUISettings.protonColor)
}

// // Fonction appelée lors du clic sur le bouton Focus Atom. Permet à la camera de focus l'atome
// function OnClickFocusTerre() {
//     _focusTerre = true;
//     _focusMars = false;
//     _focusLune = false;
//     _focusSoleil = false;
//     _focusSoleil = false;
// }

// function OnClickFocusLune() {
//     _focusLune = true;
//     _focusTerre = false;
//     _focusMars = false;
//     _focusSaturn = false;
//     _focusSoleil = false;
// }

// function OnClickFocusSoleil() {
//     _focusSoleil = true;
//     _focusLune = false;
//     _focusTerre = false;
//     _focusMars = false;
//     _focusSaturn = false;
// }

// function OnClickFocusMars() {
//     _focusMars = true;
//     _focusLune = false;
//     _focusTerre = false;
//     _focusSaturn = false;
//     _focusSoleil = false;
// }

// function OnClickFocusSaturn() {
//     _focusSaturn = true;
//     _focusLune = false;
//     _focusTerre = false;
//     _focusMars = false;
//     _focusSoleil = false;
// }

function OnClickFocus(focus) {
    _focusTerre = focus === "Terre";
    _focusLune = focus === "Lune";
    _focusSoleil = focus === "Soleil";
    _focusMars = focus === "Mars";
    _focusSaturn = focus === "Saturn";
}
// Bind la fonction OnClickFocusAtom à l'event click du bouton
document.getElementById("Soleil").addEventListener("click", OnClickFocus("Soleil"))
document.getElementById("Lune").addEventListener("click", OnClickFocus("Lune"))
document.getElementById("Mars").addEventListener("click", OnClickFocus("Mars"))
document.getElementById("Saturn").addEventListener("click", OnClickFocus("Saturn"))
document.getElementById("Terre").addEventListener("click", OnClickFocus("Terre"))

// Redimensionnement de la fenetre
function Resize() {
    _camera.aspect = window.innerWidth / window.innerHeight;
    _camera.updateProjectionMatrix();
    _renderer.setSize(window.innerWidth, window.innerHeight)
}

console.log(_focusTerre)


// Boucle d'animation
function Animate() {

    // Mise à jour d'elapsed time
    _elapsedTime = _clock.getDelta()

    //  Definit l'axe souhaité pour la rotation (ici z)
    var zAxis = new THREE.Vector3(0, 0, 1)

    // // Applique la rotation sur l'axe z. Vitesse = deg/sec * elapsedTime * coef
    // _hydrogene.rotateOnAxis(zAxis, THREE.MathUtils.degToRad(_hydrogene.electronSpeed * _elapsedTime * DatGUISettings.electronSpeedFactor))

    // // Change la direction du deplacement selon la position en x
    // if (_hydrogene.obj.position.x > 10) {
    //     _hydrogene.direction = -1
    // } else if (_hydrogene.obj.position.x < -10) {
    //     _hydrogene.direction = 1
    // }
    // // Applique le deplacement sur l'axe X. Vitesse = unite/sec * elapsedTime * direction
    // _hydrogene.obj.translateX(_hydrogene.speed * _elapsedTime * _hydrogene.direction)


    // Si le focus de l'atome est activé
    if (_focusTerre == "Terre") {

        // Offset de la caméra par rapport à la planète (offset = rayon planète + 10)
        var offset = new THREE.Vector3(-20, 20, 60)
            // Déclare un Vector3 worldPosition
        var worldPosition = new THREE.Vector3()
            // Enregistre la world position de la Terre (position globale) dans worldPosition
        Terre.getWorldPosition(worldPosition)
            // Applique la position au control
        var controlPosition = worldPosition.add(offset)
        _control.object.position.copy(controlPosition)
            // Focus la world position de la Terre
        _control.target = worldPosition
    }

    // Si le focus de l'atome est activé
    if (_focusLune == Lune) {

        // Offset de la caméra par rapport à la planète (offset = rayon planète + 10)
        var offset = new THREE.Vector3(0, 0, 25)
            // Déclare un Vector3 worldPosition
        var worldPosition = new THREE.Vector3()
            // Enregistre la world position de la Terre (position globale) dans worldPosition
        Lune.getWorldPosition(worldPosition)
            // Applique la position au control
        var controlPosition = worldPosition.add(offset)
        _control.object.position.copy(controlPosition)
            // Focus la world position de la Terre
        _control.target = worldPosition
    }

    // Si le focus de l'atome est activé
    if (_focusMars == true) {

        // Offset de la caméra par rapport à la planète (offset = rayon planète + 10)
        var offset = new THREE.Vector3(0, 0, 25)
            // Déclare un Vector3 worldPosition
        var worldPosition = new THREE.Vector3()
            // Enregistre la world position de la Terre (position globale) dans worldPosition
        Mars.getWorldPosition(worldPosition)
            // Applique la position au control
        var controlPosition = worldPosition.add(offset)
        _control.object.position.copy(controlPosition)
            // Focus la world position de la Terre
        _control.target = worldPosition
    }

    // Si le focus de l'atome est activé
    if (_focusSaturn == true) {

        // Offset de la caméra par rapport à la planète (offset = rayon planète + 10)
        var offset = new THREE.Vector3(0, 30, 60)
            // Déclare un Vector3 worldPosition
        var worldPosition = new THREE.Vector3()
            // Enregistre la world position de la Terre (position globale) dans worldPosition
        Saturne.getWorldPosition(worldPosition)
            // Applique la position au control
        var controlPosition = worldPosition.add(offset)
        _control.object.position.copy(controlPosition)
            // Focus la world position de la Terre
        _control.target = worldPosition
    }
    // Si le focus de l'atome est activé
    if (_focusSoleil == true) {

        // Offset de la caméra par rapport à la planète (offset = rayon planète + 10)
        var offset = new THREE.Vector3(0, 0, 25)
            // Déclare un Vector3 worldPosition
        var worldPosition = new THREE.Vector3()
            // Enregistre la world position de la Terre (position globale) dans worldPosition
        Soleil.getWorldPosition(worldPosition)
            // Applique la position au control
        var controlPosition = worldPosition.add(offset)
        _control.object.position.copy(controlPosition)
            // Focus la world position de la Terre
        _control.target = worldPosition
    }



    // Mise à jour du control  ( /!\ necessaire car on utilise le damping)
    _control.update()
    _renderer.render(_scene, _camera)
    requestAnimationFrame(Animate)
}

InitScene()
InitDatGUI()
Animate()
window.addEventListener('resize', Resize);
