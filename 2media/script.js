// ========================================
// ELEMENTS
// ========================================

const video =
    document.getElementById("video");

const canvas =
    document.getElementById("overlayCanvas");

const ctx =
    canvas.getContext("2d");

const startBtn =
    document.getElementById("startBtn");

const stopBtn =
    document.getElementById("stopBtn");


// ========================================
// THREE.JS
// ========================================

const threeCanvas =
    document.getElementById("threeCanvas");


const renderer =
    new THREE.WebGLRenderer({

        canvas: threeCanvas,

        alpha: true,

        antialias: true

    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


// ========================================
// SCENE
// ========================================

const scene =
    new THREE.Scene();


// ========================================
// 3D CAMERA
// ========================================

const camera3D =
    new THREE.PerspectiveCamera(

        45,

        window.innerWidth /
        window.innerHeight,

        0.01,

        1000

    );


camera3D.position.set(
    0,
    0,
    5
);


// ========================================
// LIGHT
// ========================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        2
    );

scene.add(
    ambientLight
);


const directionalLight =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );


directionalLight.position.set(
    0,
    1,
    3
);


scene.add(
    directionalLight
);


// ========================================
// GLASSES
// ========================================

let glasses = null;


// 현재 선택된 안경
let currentGlasses =
    "heart";


// 모델 로더
const loader =
    new THREE.GLTFLoader();


// ========================================
// FACE CAMERA
// ========================================

let faceCamera =
    null;


// ========================================
// SMOOTHING
// ========================================

// 위치
const smoothPosition =
    0.32;


// 크기
const smoothScale =
    0.22;


// 얼굴 기울기
const smoothRotationZ =
    0.25;


// 얼굴 좌우 회전
const smoothRotationY =
    0.18;


// ========================================
// GLASSES SETTINGS
// ========================================

// 전체 안경 크기
const GLASSES_SCALE =
    2.05;


// 전체 좌우 위치
const GLASSES_X_OFFSET =
    0;


// 전체 위아래 위치
const GLASSES_Y_OFFSET =
    -0.15;


// 전체 앞뒤 위치
const GLASSES_Z_OFFSET =
    0;


// ========================================
// ROTATION OFFSET
// ========================================

// 전체 안경 기본 기울기
const GLASSES_ROTATION_OFFSET =
    0;


// ========================================
// GLASSES MODEL PATH
// ========================================

const GLASSES_MODELS = {

    heart:
        "./model/heart-shaped-glasses/source/coeur.glb",

    round:
        "./model/glasses01.glb",

    cat:
        "./model/cat-eye_glasses.glb",

    black:
        "./model/deal_with_it_glasses_edition.glb",

    classic:
        "./model/glasses.glb"

};


// ========================================
// MODEL SETTINGS
// ========================================
//
// ★ 안경마다 개별 설정
//
// positionX
// → 좌우 위치
//
// positionY
// → 위아래 위치
//
// positionZ
// → 앞뒤 위치
//
// scale
// → 안경 크기
//
// rotationX
// → 위아래 방향 회전
//
// rotationY
// → 좌우 방향 회전
//
// rotationZ
// → 화면에서 기울이기
//
// rotation 값은 DEGREE(도)
// position 값은 Three.js 좌표
//
// ========================================

const GLASSES_MODEL_SETTINGS = {

    heart: {

        positionX: 0,

        positionY: 0,

        positionZ: 0,

        scale: 1.00,

        rotationX: 0,

        rotationY: 0,

        rotationZ: 0

    },


    round: {

        positionX: 0,

        positionY: -0.1,

        positionZ: 0,

        scale: 15.00,

        rotationX: 0,

        rotationY: 0,

        rotationZ: 0

    },


    cat: {

        positionX: -0.05,

        positionY: 0.7,

        positionZ: 0,

        scale: 0.25,

        rotationX: 0,

        rotationY: 0,

        rotationZ: -5

    },


    black: {

        positionX: 0.32,

        positionY: 0,

        positionZ: 0,

        scale: 2.00,

        rotationX: 0,

        rotationY: 0,

        rotationZ: 3

    },


    classic: {

        positionX: -0.11,

        positionY: 0.92,

        positionZ: 0,

        scale: 0.27,

        rotationX: 0,

        rotationY: 0,

        rotationZ: 0

    }

};


// ========================================
// START BUTTON
// ========================================

startBtn.addEventListener(
    "click",
    startCamera
);


// ========================================
// STOP BUTTON
// ========================================

if (stopBtn) {

    stopBtn.addEventListener(
        "click",
        stopCamera
    );

}


// ========================================
// GLASSES BUTTONS
// ========================================

const glassesButtons =
    document.querySelectorAll(
        ".glassesButton"
    );


glassesButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const modelName =
                    button.dataset.model;


                if (!modelName) {

                    return;

                }


                selectGlasses(
                    modelName
                );

            }
        );

    }
);


// ========================================
// START CAMERA
// ========================================

async function startCamera() {

    try {

        if (video.srcObject) {

            return;

        }


        const stream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        facingMode:
                            "user",

                        width: {

                            ideal: 1280

                        },

                        height: {

                            ideal: 720

                        }

                    }

                });


        video.srcObject =
            stream;


        startBtn.style.display =
            "none";


        loadGlasses(
            currentGlasses
        );


        startFaceMesh();


    } catch (error) {

        console.error(
            "카메라 오류:",
            error
        );

    }

}


// ========================================
// STOP CAMERA
// ========================================

function stopCamera() {

    console.log(
        "카메라 중지"
    );


    if (video.srcObject) {

        const tracks =
            video.srcObject.getTracks();


        tracks.forEach(
            function(track) {

                track.stop();

            }
        );


        video.srcObject =
            null;

    }


    faceCamera =
        null;


    if (glasses) {

        glasses.visible =
            false;

    }


    ctx.clearRect(

        0,
        0,

        canvas.width,
        canvas.height

    );


    startBtn.style.display =
        "block";

}


// ========================================
// SELECT GLASSES
// ========================================

function selectGlasses(
    modelName
) {

    console.log(
        "안경 선택:",
        modelName
    );


    if (
        !GLASSES_MODELS[modelName]
    ) {

        console.error(
            "안경 모델 경로가 없습니다:",
            modelName
        );

        return;

    }


    currentGlasses =
        modelName;


    // ====================================
    // BUTTON ACTIVE
    // ====================================

    glassesButtons.forEach(
        function(button) {

            button.classList.remove(
                "active"
            );

        }
    );


    const selectedButton =
        document.querySelector(
            `.glassesButton[data-model="${modelName}"]`
        );


    if (selectedButton) {

        selectedButton.classList.add(
            "active"
        );

    }


    // ====================================
    // 기존 모델 제거
    // ====================================

    if (glasses) {

        scene.remove(
            glasses
        );


        disposeObject(
            glasses
        );


        glasses =
            null;

    }


    // ====================================
    // 새 모델 로드
    // ====================================

    loadGlasses(
        modelName
    );

}


// ========================================
// LOAD GLASSES
// ========================================

function loadGlasses(
    modelName
) {

    const modelPath =
        GLASSES_MODELS[modelName];


    if (!modelPath) {

        console.error(
            "모델 경로가 없습니다:",
            modelName
        );

        return;

    }


    console.log(
        "안경 로딩:",
        modelName
    );


    loader.load(

        modelPath,


        // ==================================
        // SUCCESS
        // ==================================

        function(gltf) {

            if (
                modelName !==
                currentGlasses
            ) {

                disposeObject(
                    gltf.scene
                );

                return;

            }


            // =================================
            // GLASSES ROOT GROUP
            // =================================

            glasses =
                new THREE.Group();


            const model =
                gltf.scene;


            // =================================
            // MODEL CENTER
            // =================================

            const box =
                new THREE.Box3().setFromObject(
                    model
                );


            const center =
                new THREE.Vector3();


            box.getCenter(
                center
            );


            model.position.sub(
                center
            );


            // =================================
            // MODEL SETTINGS
            // =================================

            const settings =
                GLASSES_MODEL_SETTINGS[
                    modelName
                ] || {

                    positionX: 0,

                    positionY: 0,

                    positionZ: 0,

                    scale: 1,

                    rotationX: 0,

                    rotationY: 0,

                    rotationZ: 0

                };


            // =================================
            // MODEL SCALE
            // =================================

            model.scale.set(

                settings.scale,

                settings.scale,

                settings.scale

            );


            // =================================
            // ADD MODEL
            // =================================

            glasses.add(
                model
            );


            // =================================
            // INITIAL POSITION
            // =================================
            //
            // ★ 여기서 안경마다
            // 개별 위치를 적용
            //

            glasses.position.set(

                settings.positionX || 0,

                settings.positionY || 0,

                settings.positionZ || 0

            );


            // =================================
            // INITIAL ROTATION
            // =================================

            glasses.rotation.set(

                THREE.MathUtils.degToRad(
                    settings.rotationX
                ),

                THREE.MathUtils.degToRad(
                    settings.rotationY
                ),

                THREE.MathUtils.degToRad(
                    settings.rotationZ
                )

            );


            glasses.scale.set(

                1,
                1,
                1

            );


            // 얼굴을 찾기 전까지 숨김

            glasses.visible =
                false;


            // =================================
            // SCENE
            // =================================

            scene.add(
                glasses
            );


            console.log(
                "안경 모델 로드 성공:",
                modelName
            );

        },


        // ==================================
        // LOADING
        // ==================================

        function(progress) {

            if (progress.total) {

                const percent =
                    Math.round(

                        progress.loaded /
                        progress.total *
                        100

                    );


                console.log(

                    modelName +
                    " 모델 로딩:",
                    percent + "%"

                );

            }

        },


        // ==================================
        // ERROR
        // ==================================

        function(error) {

            console.error(

                modelName +
                " 안경 모델 로딩 실패:",
                error

            );

        }

    );

}


// ========================================
// DISPOSE MODEL
// ========================================

function disposeObject(
    object
) {

    object.traverse(
        function(child) {

            if (
                child.geometry
            ) {

                child.geometry.dispose();

            }


            if (
                child.material
            ) {

                if (
                    Array.isArray(
                        child.material
                    )
                ) {

                    child.material.forEach(
                        function(material) {

                            disposeMaterial(
                                material
                            );

                        }
                    );

                } else {

                    disposeMaterial(
                        child.material
                    );

                }

            }

        }
    );

}


// ========================================
// DISPOSE MATERIAL
// ========================================

function disposeMaterial(
    material
) {

    if (!material) {

        return;

    }


    Object.keys(
        material
    ).forEach(
        function(key) {

            const value =
                material[key];


            if (
                value &&
                value.isTexture
            ) {

                value.dispose();

            }

        }
    );


    material.dispose();

}


// ========================================
// MEDIAPIPE
// ========================================

function startFaceMesh() {

    const faceMesh =
        new FaceMesh({

            locateFile:
                function(file) {

                    return (
                        "https://cdn.jsdelivr.net/npm/" +
                        "@mediapipe/face_mesh/" +
                        file
                    );

                }

        });


    faceMesh.setOptions({

        maxNumFaces: 1,

        refineLandmarks: true,

        minDetectionConfidence:
            0.5,

        minTrackingConfidence:
            0.5

    });


    faceMesh.onResults(
        onResults
    );


    // ====================================
    // CAMERA
    // ====================================

    faceCamera =
        new Camera(

            video,

            {

                onFrame:
                    async function() {

                        if (
                            !video.srcObject
                        ) {

                            return;

                        }


                        await faceMesh.send({

                            image: video

                        });

                    },

                width: 1280,

                height: 720

            }

        );


    faceCamera.start();

}


// ========================================
// FACE TRACKING
// ========================================

function onResults(
    results
) {

    ctx.clearRect(

        0,
        0,

        canvas.width,
        canvas.height

    );


    // ====================================
    // NO FACE
    // ====================================

    if (

        !results.multiFaceLandmarks ||

        results.multiFaceLandmarks.length === 0

    ) {

        if (glasses) {

            glasses.visible =
                false;

        }

        return;

    }


    // ====================================
    // LANDMARKS
    // ====================================

    const landmarks =
        results.multiFaceLandmarks[0];


    // ====================================
    // FACE POINTS
    // ====================================

    const leftEye =
        landmarks[33];


    const rightEye =
        landmarks[263];


    const nose =
        landmarks[1];


    const leftFace =
        landmarks[234];


    const rightFace =
        landmarks[454];


    const forehead =
        landmarks[10];


    const chin =
        landmarks[152];


    // ====================================
    // EYE CENTER
    // ====================================

    const eyeCenterX =
        (
            leftEye.x +
            rightEye.x
        ) / 2;


    const eyeCenterY =
        (
            leftEye.y +
            rightEye.y
        ) / 2;


    // ====================================
    // EYE DISTANCE
    // ====================================

    const eyeDistance =
        Math.sqrt(

            Math.pow(

                rightEye.x -
                leftEye.x,

                2

            )

            +

            Math.pow(

                rightEye.y -
                leftEye.y,

                2

            )

        );


    // ====================================
    // FACE WIDTH
    // ====================================

    const faceWidth =
        Math.sqrt(

            Math.pow(

                rightFace.x -
                leftFace.x,

                2

            )

            +

            Math.pow(

                rightFace.y -
                leftFace.y,

                2

            )

        );


    // ====================================
    // FACE HEIGHT
    // ====================================

    const faceHeight =
        Math.abs(

            chin.y -
            forehead.y

        );


    // ====================================
    // FACE ROLL
    // ====================================

    const angle =
        Math.atan2(

            rightEye.y -
            leftEye.y,

            rightEye.x -
            leftEye.x

        );


    // ====================================
    // FACE YAW
    // ====================================

    const faceCenterX =
        (
            leftFace.x +
            rightFace.x
        ) / 2;


    let yaw =
        nose.x -
        faceCenterX;


    yaw =
        yaw /
        faceWidth;


    yaw =
        Math.max(

            -0.45,

            Math.min(

                0.45,

                yaw * 2.5

            )

        );


    // ====================================
    // FACE PITCH
    // ====================================

    let pitch =
        (
            nose.y -
            eyeCenterY
        )
        /
        faceHeight;


    pitch =
        Math.max(

            -0.35,

            Math.min(

                0.35,

                pitch * 3

            )

        );


    // ====================================
    // GLASSES CHECK
    // ====================================

    if (!glasses) {

        return;

    }


    glasses.visible =
        true;


    // ====================================
    // CURRENT GLASSES SETTINGS
    // ====================================

    const settings =
        GLASSES_MODEL_SETTINGS[
            currentGlasses
        ] || {

            positionX: 0,

            positionY: 0,

            positionZ: 0,

            rotationX: 0,

            rotationY: 0,

            rotationZ: 0

        };


    // ====================================
    // POSITION
    // ====================================
    //
    // 얼굴 추적 위치
    // +
    // 안경마다 설정한 위치
    //
    // ★ 여기 숫자를 바꾸면
    // 안경마다 위치를 다르게 할 수 있음.
    //

    const targetX =
        (
            eyeCenterX -
            0.5
        )
        * 5
        +
        GLASSES_X_OFFSET
        +
        (settings.positionX || 0);


    const targetY =
        -(
            eyeCenterY -
            0.5
        )
        * 3.5
        +
        GLASSES_Y_OFFSET
        +
        (settings.positionY || 0);


    const targetZ =
        GLASSES_Z_OFFSET
        +
        (settings.positionZ || 0);


    // ====================================
    // POSITION SMOOTHING
    // ====================================

    glasses.position.x +=

        (
            targetX -
            glasses.position.x
        )
        *
        smoothPosition;


    glasses.position.y +=

        (
            targetY -
            glasses.position.y
        )
        *
        smoothPosition;


    glasses.position.z +=

        (
            targetZ -
            glasses.position.z
        )
        *
        smoothPosition;


    // ====================================
    // SCALE
    // ====================================

    const eyeScale =
        eyeDistance *
        GLASSES_SCALE;


    const faceScale =
        faceWidth *
        2.35;


    const targetScale =
        (
            eyeScale *
            0.65
        )
        +
        (
            faceScale *
            0.35
        );


    const currentScale =
        glasses.scale.x;


    const newScale =
        currentScale +

        (
            targetScale -
            currentScale
        )
        *
        smoothScale;


    glasses.scale.set(

        newScale,
        newScale,
        newScale

    );


    // ====================================
    // BASE ROTATION
    // ====================================

    const baseRotationX =
        THREE.MathUtils.degToRad(
            settings.rotationX || 0
        );


    const baseRotationY =
        THREE.MathUtils.degToRad(
            settings.rotationY || 0
        );


    const baseRotationZ =
        THREE.MathUtils.degToRad(
            settings.rotationZ || 0
        );


    // ====================================
    // Z ROTATION
    // ====================================

    const targetRotationZ =
        -angle +
        baseRotationZ +
        GLASSES_ROTATION_OFFSET;


    let rotationDifferenceZ =
        targetRotationZ -
        glasses.rotation.z;


    while (
        rotationDifferenceZ >
        Math.PI
    ) {

        rotationDifferenceZ -=
            Math.PI * 2;

    }


    while (
        rotationDifferenceZ <
        -Math.PI
    ) {

        rotationDifferenceZ +=
            Math.PI * 2;

    }


    glasses.rotation.z +=

        rotationDifferenceZ *
        smoothRotationZ;


    // ====================================
    // Y ROTATION
    // ====================================

    const targetRotationY =
        yaw * 0.32 +
        baseRotationY;


    let rotationDifferenceY =
        targetRotationY -
        glasses.rotation.y;


    while (
        rotationDifferenceY >
        Math.PI
    ) {

        rotationDifferenceY -=
            Math.PI * 2;

    }


    while (
        rotationDifferenceY <
        -Math.PI
    ) {

        rotationDifferenceY +=
            Math.PI * 2;

    }


    glasses.rotation.y +=

        rotationDifferenceY *
        smoothRotationY;


    // ====================================
    // X ROTATION
    // ====================================

    const targetRotationX =
        baseRotationX;


    let rotationDifferenceX =
        targetRotationX -
        glasses.rotation.x;


    while (
        rotationDifferenceX >
        Math.PI
    ) {

        rotationDifferenceX -=
            Math.PI * 2;

    }


    while (
        rotationDifferenceX <
        -Math.PI
    ) {

        rotationDifferenceX +=
            Math.PI * 2;

    }


    glasses.rotation.x +=

        rotationDifferenceX *
        0.20;

}


// ========================================
// RESIZE
// ========================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;


    canvas.height =
        window.innerHeight;


    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );


    camera3D.aspect =
        window.innerWidth /
        window.innerHeight;


    camera3D.updateProjectionMatrix();

}


resizeCanvas();


window.addEventListener(
    "resize",
    resizeCanvas
);


// ========================================
// RENDER
// ========================================

function animate() {

    requestAnimationFrame(
        animate
    );


    renderer.render(

        scene,

        camera3D

    );

}


animate();