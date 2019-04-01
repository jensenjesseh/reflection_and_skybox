MySample.main = (function() {
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let gl = canvas.getContext('webgl');
    let ext = gl.getExtension('OES_element_index_uint');

    let environment = {}
    //let model = {};
    //let buffers = {};
    let shaders = {};
    let previousTime = performance.now();
    let count = 0;
    let models = [];
    let bufferArray = [];
    let shaderArray = [];
    let skybox = {};
    let skyBuffer = {};


function setupSkybox(skyShader){
    let buffer = {};

    //models.push(model);
    //bufferArray.push(buffer);
    //shaderArray.push(shader);

    // vertices: vertices,
    // vertexColors: vertexColors,
    // indices: indices,
    // center: center,
    // normals: normals

    skybox.vertices = new Float32Array([
        -10.0, -10.0,  10.0, //0.0, 0.0, //(0)
        10.0, -10.0,  10.0, //1.0, 0.0, //(1)
        10.0,  10.0,  10.0, //1.0, 1.0, //(2)
        -10.0,  10.0,  10.0, //0.0, 1.0, //(3)
        -10.0, -10.0, -10.0, //1.0, 0.0, //(4)
        10.0, -10.0, -10.0, //0.0, 0.0, //(5)
        10.0,  10.0, -10.0, //0.0, 1.0, //(6)
        -10.0,  10.0, -10.0, //1.0, 1.0, // (7)
        -10.0,  10.0,  10.0, //0.0, 0.0, //(8)
        10.0,  10.0,  10.0, //1.0, 0.0, //(9)
        10.0,  10.0, -10.0, //1.0, 1.0, //(10)
        -10.0,  10.0, -10.0, //0.0, 1.0, //(11)
        10.0, -10.0,  10.0, //0.0, 0.0, //(12)
        10.0, -10.0, -10.0, //1.0, 0.0, //(13)
        10.0,  10.0, -10.0, //1.0, 1.0, //(14)
        10.0,  10.0,  10.0, //0.0, 1.0, //(15)
        -10.0, -10.0,  10.0, //0.0, 0.0, //(16)
        -10.0, -10.0, -10.0, //1.0, 0.0, //(17)
        -10.0,  10.0, -10.0, //1.0, 1.0, //(18)
        -10.0,  10.0,  10.0 //0.0, 1.0, //(19)

    ]);

    skybox.indices = new Uint32Array([
         1, 2, 0,	//(front face)
         0, 2, 3,
         4, 6, 5, //(back face)
         7, 6, 4,
         8, 9, 10, //(top face)
         8, 10, 11,
         12, 13, 14, //(right face)
         12, 14, 15,
         18, 17, 16, //(left face)
         19, 18, 16
    ]); 

    skybox.center = {
        x: 0.0,
        y: 0.0,
        z: 0.0
    }

    skybox.shader = skyShader;

    initializeWebGLSettings();
    console.log('   skybox raw data');
    initializeData();
    console.log(' skybox   vertex buffer objects');
    initializeSkyboxBufferObjects(skybox);
    console.log('  skybox  shaders');
    //associateSkyboxShaders(skybox.shader);

    skyBuffer = buffer;

    return initializeTexture();

}

function associateSkyboxShaders(shaderProgram){
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, skybox.vertexBuffer);
    shaders.matAspect = gl.getUniformLocation(shaderProgram, 'uAspect');
    shaders.matProjection = gl.getUniformLocation(shaderProgram, 'uProjection');
    shaders.matView = gl.getUniformLocation(shaderProgram, 'uView');

    let position = gl.getAttribLocation(shaderProgram, 'aPosition');
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, skybox.vertices.BYTES_PER_ELEMENT * 3, 0);
    gl.enableVertexAttribArray(position);

    skybox.samplerLocation = gl.getUniformLocation(shaderProgram, 'uSampler');
}

function initializeSkyboxBufferObjects(buffer){

        skybox.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, skybox.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, buffer.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        skybox.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skybox.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // buffers.textureCoordsBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoordsBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, skybox.texCoords, gl.STATIC_DRAW);
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);

}

function setupModel(file, filenum, shader){
    return new Promise((resolve, reject) =>{
        ModelLoaderPLY.load(file, filenum)
        .then(modelSource => {
            let model = modelSource;
            let buffer = {};
            initializeModelRotation(model);
            console.log('    WebGL settings');
            initializeWebGLSettings();
            console.log('    raw data');
            initializeData();
            console.log('    vertex buffer objects');
            initializeBufferObjects(model, buffer);
            console.log('    shaders');
            models.push(model);
            bufferArray.push(buffer);
            shaderArray.push(shader);

            resolve();
        });
    });
}

//------------------------------------------------------------------
//
// Helper function used to load a texture file from the server.
//
//------------------------------------------------------------------
function loadTextureFromServer(filename) {
    return new Promise((resolve, reject) => {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onload = function() {
            if (xmlHttp.status === 200) {
                let asset = new Image();
                asset.onload = function() {
                window.URL.revokeObjectURL(asset.src);
                resolve(asset);
                }
                asset.src = window.URL.createObjectURL(xmlHttp.response);
            } else {
                reject();
            }
        };
        xmlHttp.open("GET", filename, true);
        xmlHttp.responseType = 'blob';
        xmlHttp.send();
    });
}

function initializeTexture(){
    return new Promise((resolve, reject) => {
    let front, back, left, right, top, down;
    front = loadTextureFromServer('/skybox/front.jpg');
    back = loadTextureFromServer('/skybox/back.jpg');
    left = loadTextureFromServer('/skybox/left.jpg');
    right = loadTextureFromServer('/skybox/right.jpg');
    top = loadTextureFromServer('/skybox/top.jpg');
    down = loadTextureFromServer('/skybox/down.jpg');

    Promise.all([front, back, left, right, top, down])
    .then((sides) => {
        skybox.cube = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.cube);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sides[3]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sides[2]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sides[4]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sides[5]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sides[0]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sides[1]);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        resolve();
    })});
}


    //------------------------------------------------------------------
    //
    // Helper function used to set the rotation state and parameters for
    // the model.
    //
    //------------------------------------------------------------------
    function initializeModelRotation(model) {
        //
        // Current rotation status
        model.rotation = {  // Radians
            x: Math.PI / 4,
            y: 0,
            z: 0
        };
        //
        // Rotation update rate
        model.rotationRate = {   // Radians per second (divide by 1000 to go from ms to seconds)
            x: 0,
            y: (Math.PI / 4) / 1000,
            z: 0
        };
    }

    //------------------------------------------------------------------
    //
    // Prepare the rendering environment.
    //
    //------------------------------------------------------------------
    function initializeData() {
        environment.matAspect = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
        if (canvas.width > canvas.height) {
            environment.matAspect[0] = canvas.height / canvas.width;
        } else {
            environment.matAspect[5] = canvas.width / canvas.height;
        }

        //
        // Obtain the projection matrix
        environment.matProjection = projectionPerspectiveFOV(Math.PI/4, 1.0, 10.0);

        environment.vEye = new Float32Array([0.0, 0.0, 3.0]);
        environment.matView  = [
            1,  0,  0,  -environment.vEye[0],
            0,  1,  0,  -environment.vEye[1],
            0,  0,  1,  -environment.vEye[2],
            0,  0,  0,  1
        ];
        environment.matView = transposeMatrix4x4(environment.matView);

        let Ka = [1.0, 1.0, 1.0];
        let La = [0.1, 0.1, 0.1];
        let Kd = [1.0, 1.0, 1.0];
        let Ld = [
            // 1000.0, 1000.0, 1000.0,
            // 2000.0, 2000.0, 1200.0,
            // 0.0, 0.0, 2000.0

             0.5, 0.5, 0.5,
             0.2, 0.2, 0.0,
             0.0, 0.0, 0.0

        ];
        environment.matLight = lightMat(Ka, La);
        environment.diffuseLight = diffuseLightMat(Kd, Ld);
        environment.lightPosition =[
            0.0, 0.0, -1.0,
            0.0, 10.0, -3.0,
            10.0, 5.0, -3.0
            
        ];
    }

    //------------------------------------------------------------------
    //
    // Creates a Perspective Projection matrix based on a requested FOV.
    // The matrix results in the vertices in Normalized Device Coordinates...
    //
    //------------------------------------------------------------------
    function projectionPerspectiveFOV(fov, near, far) {
        let scale = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        let m = [
            scale, 0.0, 0.0, 0.0,
            0.0, scale, 0.0, 0.0,
            0.0, 0.0, -(far + near) / (far - near), -(2 * far * near) / (far - near),
            0.0, 0.0, -1, 0
        ];
        return transposeMatrix4x4(m);
    }

    function lightMat(Ka, La, Kd, Ld){
        let ambient = [];
        let diffuse = [];
        //let L1 = [light1Position[0] - model.,]

        
        ambient[0] = Ka[0]*La[0];
        ambient[1] = Ka[1]*La[1];
        ambient[2] = Ka[2]*La[2];
        //ambient[3] = 1.0;

        let totalLight = new Float32Array([ambient[0], ambient[1], ambient[2]]);
        return totalLight;
        //let diffuse = [];

    }

    function diffuseLightMat(Kd, Ld){
        let ambient = [];
        let diffuse = [];
        //let L1 = [light1Position[0] - model.,]

        
        ambient[0] = Kd[0]*Ld[0];
        ambient[1] = Kd[1]*Ld[1];
        ambient[2] = Kd[2]*Ld[2];
        ambient[3] = Kd[0]*Ld[3];
        ambient[4] = Kd[1]*Ld[4];
        ambient[5] = Kd[2]*Ld[5];
        ambient[6] = Kd[0]*Ld[6];
        ambient[7] = Kd[1]*Ld[7];
        ambient[8] = Kd[2]*Ld[8];
        //ambient[3] = 1.0;

        let totalLight = new Float32Array([ambient[0], ambient[1], ambient[2], ambient[3], ambient[4], ambient[5], ambient[6], ambient[7], ambient[8]]);
        return totalLight;
        //let diffuse = [];

    }
    

    //------------------------------------------------------------------
    //
    // Prepare and set the Vertex Buffer Object to render.
    //
    //------------------------------------------------------------------
    function initializeBufferObjects(model, buffers) {
        buffers.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        buffers.normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);


        buffers.vertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, model.vertexColors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        buffers.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    }

    //------------------------------------------------------------------
    //
    // Prepare and set the shaders to be used.
    //
    //------------------------------------------------------------------
    function initializeShaders(file1, file2) {
        return new Promise((resolve, reject) => {
            let vertexShader;
            let fragmentShader;
            let shaderProgram;
            loadFileFromServer(file1)
            .then(source => {
                vertexShader = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(vertexShader, source);
                gl.compileShader(vertexShader);
                return loadFileFromServer(file2);              //'shaders/simple.frag');
            })
            .then(source => {
                fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(fragmentShader, source);
                gl.compileShader(fragmentShader);
            })
            .then(() => {
                shaderProgram = gl.createProgram();
                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, fragmentShader);
                gl.linkProgram(shaderProgram);

                resolve(shaderProgram);
            })
            .catch(error => {
                console.log('(initializeShaders) something bad happened: ', error);
                reject();
            });
        });
    }

    //------------------------------------------------------------------
    //
    // Associate the vertex and pixel shaders, and the expected vertex
    // format with the VBO.
    //
    //------------------------------------------------------------------
    function associateShadersWithBuffers(model, buffers, shaderProgram) {
        gl.useProgram(shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        shaders.matAspect = gl.getUniformLocation(shaderProgram, 'uAspect');
        shaders.matProjection = gl.getUniformLocation(shaderProgram, 'uProjection');
        shaders.matView = gl.getUniformLocation(shaderProgram, 'uView');
        shaders.matModel = gl.getUniformLocation(shaderProgram, 'uModel');
        shaders.inverseMatModel = gl.getUniformLocation(shaderProgram, 'uInverseModel');


        let position = gl.getAttribLocation(shaderProgram, 'aPosition');
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, model.vertices.BYTES_PER_ELEMENT * 3, 0);
        gl.enableVertexAttribArray(position);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalsBuffer);
        let normals = gl.getAttribLocation(shaderProgram, 'aNormal');
        gl.vertexAttribPointer(normals, 3, gl.FLOAT, false, model.normals.BYTES_PER_ELEMENT * 3, 0);
        gl.enableVertexAttribArray(normals);

        shaders.matLight = gl.getUniformLocation(shaderProgram, 'uLight');
        shaders.diffuseLight = gl.getUniformLocation(shaderProgram, 'uDiffuse');
        shaders.lightPosition = gl.getUniformLocation(shaderProgram, 'uLightPos');

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexColorBuffer);
        let color = gl.getAttribLocation(shaderProgram, 'aColor');
        gl.vertexAttribPointer(color, 3, gl.FLOAT, false, model.vertexColors.BYTES_PER_ELEMENT * 3, 0);
        gl.enableVertexAttribArray(color);
    }

    //------------------------------------------------------------------
    //
    // Prepare some WegGL settings, things like the clear color, depth buffer, etc.
    //
    //------------------------------------------------------------------
    function initializeWebGLSettings() {
        gl.clearColor(0.3921568627450980392156862745098, 0.58431372549019607843137254901961, 0.92941176470588235294117647058824, 1.0);
        gl.clearDepth(1.0);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
    }

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {

        for ( let i = 0; i < models.length; i++){

            models[i].rotation.x += (models[i].rotationRate.x * elapsedTime);
            let sinX = Math.sin(models[i].rotation.x);
            let cosX = Math.cos(models[i].rotation.x);
            let matRotateX = [
                1,    0,    0,   0,
                0,  cosX, -sinX, 0,
                0,  sinX,  cosX, 0,
                0,     0,    0,  1
            ];
            matRotateX = transposeMatrix4x4(matRotateX);

            models[i].rotation.y += (models[i].rotationRate.y * elapsedTime);
            let sinY = Math.sin(models[i].rotation.y);
            let cosY = Math.cos(models[i].rotation.y);
            let matRotateY = [
                cosY,  0,  sinY, 0,
                0,  1,     0, 0,
            -sinY,  0,  cosY, 0,
                0,  0,     0, 1
            ];
            matRotateY = transposeMatrix4x4(matRotateY);

            models[i].rotation.z += (models[i].rotationRate.z * elapsedTime);
            let sinZ = Math.sin(models[i].rotation.z);
            let cosZ = Math.cos(models[i].rotation.z);
            let matRotateZ = [
                cosZ, -sinZ, 0, 0,
                sinZ,  cosZ, 0, 0,
                    0,     0, 1, 0,
                    0,     0, 0, 1
            ];
            matRotateZ = transposeMatrix4x4(matRotateZ);

            let matTranslate = [
                1,  0,  0, models[i].center.x,
                0,  1,  0, models[i].center.y,
                0,  0,  1, models[i].center.z,
                0,  0,  0, 1
            ];
            matTranslate = transposeMatrix4x4(matTranslate);

            models[i].matModel = [
                1,  0,  0,  0,
                0,  1,  0,  0,
                0,  0,  1,  0,
                0,  0,  0,  1
            ];
            models[i].matModel = transposeMatrix4x4(models[i].matModel);

            models[i].matModel = multiplyMatrix4x4(matTranslate, models[i].matModel);
            models[i].matModel = multiplyMatrix4x4(matRotateX, models[i].matModel);
            models[i].matModel = multiplyMatrix4x4(matRotateY, models[i].matModel);
            models[i].matModel = multiplyMatrix4x4(matRotateZ, models[i].matModel);

            models[i].inverseMatModel = computeInverse(models[i].matModel);
            models[i].inverseMatModel = transposeMatrix4x4(models[i].inverseMatModel);
        }
    }


    function computeInverse(m){
        let r = [];
        r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
        r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
        r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
        r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];

        r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
        r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
        r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
        r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];

        r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
        r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
        r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
        r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];

        r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
        r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
        r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
        r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];

        var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
        for (var i = 0; i < 16; i++) r[i] /= det;
        return r;
    }
    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //
        // This sets which buffers/shaders to use for the draw call in the render function.
        associateShadersWithBuffers(models[0], bufferArray[0], shaderArray[0]);
        gl.uniformMatrix4fv(shaders.matAspect, false, environment.matAspect);
        gl.uniformMatrix4fv(shaders.matProjection, false, environment.matProjection);
        gl.uniformMatrix4fv(shaders.matView, false, environment.matView);
        gl.uniform3fv(shaders.matLight, environment.matLight);
        gl.uniform3fv(shaders.diffuseLight, environment.diffuseLight);
        gl.uniform3fv(shaders.lightPosition, environment.lightPosition);
        gl.uniformMatrix4fv(shaders.matModel, false, models[0].matModel);
        gl.uniformMatrix4fv(shaders.inverseMatModel, false, models[0].inverseMatModel);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferArray[0].indexBuffer);
        gl.drawElements(gl.TRIANGLES, models[0].indices.length, gl.UNSIGNED_INT, 0);

        associateShadersWithBuffers(models[1], bufferArray[1], shaderArray[1]);
        gl.uniformMatrix4fv(shaders.matAspect, false, environment.matAspect);
        gl.uniformMatrix4fv(shaders.matProjection, false, environment.matProjection);
        gl.uniformMatrix4fv(shaders.matView, false, environment.matView);
        gl.uniform3fv(shaders.matLight, environment.matLight);
        gl.uniform3fv(shaders.diffuseLight, environment.diffuseLight);
        gl.uniform3fv(shaders.lightPosition, environment.lightPosition);
        gl.uniformMatrix4fv(shaders.matModel, false, models[1].matModel);
        gl.uniformMatrix4fv(shaders.inverseMatModel, false, models[1].inverseMatModel);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferArray[1].indexBuffer);
        gl.drawElements(gl.TRIANGLES, models[1].indices.length, gl.UNSIGNED_INT, 0);

        associateShadersWithBuffers(models[2], bufferArray[2], shaderArray[2]);
        gl.uniformMatrix4fv(shaders.matAspect, false, environment.matAspect);
        gl.uniformMatrix4fv(shaders.matProjection, false, environment.matProjection);
        gl.uniformMatrix4fv(shaders.matView, false, environment.matView);
        gl.uniform3fv(shaders.matLight, environment.matLight);
        gl.uniform3fv(shaders.diffuseLight, environment.diffuseLight);
        gl.uniform3fv(shaders.lightPosition, environment.lightPosition);
        gl.uniformMatrix4fv(shaders.matModel, false, models[2].matModel);
        gl.uniformMatrix4fv(shaders.inverseMatModel, false, models[2].inverseMatModel);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.cube);
        shaders.samplerLocation = gl.getUniformLocation(shaderArray[2], 'uSampler')
        gl.uniform1i(shaders.samplerLocation, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferArray[2].indexBuffer);
        gl.drawElements(gl.TRIANGLES, models[2].indices.length, gl.UNSIGNED_INT, 0);

        associateShadersWithBuffers(models[3], bufferArray[3], shaderArray[3]);
        gl.uniformMatrix4fv(shaders.matAspect, false, environment.matAspect);
        gl.uniformMatrix4fv(shaders.matProjection, false, environment.matProjection);
        gl.uniformMatrix4fv(shaders.matView, false, environment.matView);
        gl.uniform3fv(shaders.matLight, environment.matLight);
        gl.uniform3fv(shaders.diffuseLight, environment.diffuseLight);
        gl.uniform3fv(shaders.lightPosition, environment.lightPosition);
        gl.uniformMatrix4fv(shaders.matModel, false, models[3].matModel);
        gl.uniformMatrix4fv(shaders.inverseMatModel, false, models[3].inverseMatModel);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.cube);
        shaders.samplerLocation = gl.getUniformLocation(shaderArray[3], 'uSampler')
        gl.uniform1i(shaders.samplerLocation, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferArray[3].indexBuffer);
        gl.drawElements(gl.TRIANGLES, models[3].indices.length, gl.UNSIGNED_INT, 0);


        associateSkyboxShaders(skybox.shader);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.cube);
        gl.uniform1i(skybox.samplerLocation, 0);
        gl.uniformMatrix4fv(shaders.matAspect, false, environment.matAspect);
        gl.uniformMatrix4fv(shaders.matProjection, false, environment.matProjection);
        gl.uniformMatrix4fv(shaders.matView, false, environment.matView);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skybox.indexBuffer);
        gl.drawElements(gl.TRIANGLES, skybox.indices.length, gl.UNSIGNED_INT, 0);

    }

    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {
        let elapsedTime = previousTime - time;
        previousTime = time;

        update(elapsedTime);
        render();

        requestAnimationFrame(animationLoop);
    }

    Promise.all([initializeShaders('shaders/simple.vs', 'shaders/simple.frag'), initializeShaders('shaders/simple.vs', 'shaders/specDiffuse.frag'), initializeShaders('shaders/reflect.vs', 'shaders/reflect.frag'), initializeShaders('shaders/reflectDiffuse.vs', 'shaders/reflectDiffuse.frag'), initializeShaders('shaders/skybox.vs', 'shaders/skybox.frag')])
    
    .then((allShaders) => {
        let diffuseShader = allShaders[0];
        let specularShader = allShaders[1];
        let reflectShader = allShaders[2];
        let reflectDiffuseShader = allShaders[3];
        let skyboxShader = allShaders[4];

        

        return Promise.all([setupModel('models/happy_recon/happy_vrip_res2.ply', 0, diffuseShader), setupModel('models/happy_recon/happy_vrip_res2.ply', 1, specularShader), setupModel('models/happy_recon/happy_vrip_res2.ply', 2, reflectShader), setupModel('models/happy_recon/happy_vrip_res2.ply', 3, reflectDiffuseShader), setupSkybox(skyboxShader)]);
    })
    .then((allModels) =>{
        requestAnimationFrame(animationLoop);
    })

}());
