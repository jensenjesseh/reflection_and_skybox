ModelLoaderPLY = (function() {
    'use strict';
    let numFaces;
    let numVertices;

    function computeNormal(indices, vertices, max){
        let faceForNormal = [];
        let AllNormals = [];
        let normals = [];
        let temp;
        for(let i = 0; i < vertices.length; i++){
            AllNormals.push([]);
        }

        for (let i = 0; i <indices.length; i=i+3){
            faceForNormal[0] = {
                x:vertices[indices[i]*3],
                y:vertices[indices[i]*3 + 1],
                z:vertices[indices[i]*3 + 2]
            }
            faceForNormal[1] = {
                x:vertices[indices[i+1]*3],
                y:vertices[indices[i+1]*3 + 1],
                z:vertices[indices[i+1]*3 + 2]
            }
            
            faceForNormal[2] = {
                x:vertices[indices[i+2]*3],
                y:vertices[indices[i+2]*3 + 1],
                z:vertices[indices[i+2]*3 + 2]
            }
            temp = computeFaceNormal(faceForNormal);
            AllNormals[indices[i]].push(temp);
            AllNormals[indices[i+1]].push(temp);
            AllNormals[indices[i + 2]].push(temp);
        }
        
        for ( let i = 0; i < vertices.length/3; i++){
            let tempx = 0;
            let tempy = 0;
            let tempz = 0;
            for(let j = 0; j < AllNormals[i].length; j++){
               tempx = tempx + AllNormals[i][j].x;
               tempy = tempy + AllNormals[i][j].y;
               tempz = tempz + AllNormals[i][j].z;
            }
            normals[i*3] = tempx/AllNormals[i].length;
            normals[i*3 + 1] = tempy/AllNormals[i].length;
            normals[i*3 + 2] = tempz/AllNormals[i].length;
        }
        return normals;
    }

    function computeFaceNormal(face){
       // let N = new Uint32Array(3);
        let normal;
       // let a, b, c;
                normal = getNormal(face[0], face[1], face[2]);
                //b = getNormal(face[1], face[2], face[0]);
                //c = getNormal(face[2], face[0], face[1]);
                //normal.push(a);
                //normal.push(b);
                //normal.push(c);

        //N[1] = a;
        //N[2] = b;
        //N[3] = c;
        return normal;
    }

    function getNormal(v1, v2, v3){
        let a = {};
        let b = {};
        a.x = v1.x - v2.x;
        a.y = v1.y - v2.y;
        a.z = v1.z - v2.z;

        b.x = v1.x - v3.x;
        b.y = v1.y - v3.y;
        b.z = v1.z - v3.z;

        return Cross(a,b);   
    }

    function Cross(a, b){
        let s = {};
        s.x = a.y*b.z - a.z*b.y;
        s.y = a.z*b.x - a.x*b.z;
        s.z = a.x*b.y - a.y*b.x;
        return s;
    }
    //------------------------------------------------------------------
    //
    // Placeholder function that returns a hard-coded cube.
    //
    //------------------------------------------------------------------
     function defineModel(fileLines, modelNum) {
        let center = {};
        let endNotFound = true;
        let searchNum = 2;
        let elementVertexList = [];
        let elementFaceList = [];
        let format = fileLines[1];

        while(endNotFound){
            if (fileLines[searchNum].includes("end_header")){
                endNotFound = false;
            }
            else if(fileLines[searchNum].includes("element")){
                let elementLine = fileLines[searchNum].split(' ');
                    if (elementLine[1] === "vertex"){
                        let propsNotFound = true;
                        let elementToAdd;
                        let numProps = 0;
                        numVertices = elementLine[2];
                        searchNum = searchNum + 1;
                        while(propsNotFound){
                            if (fileLines[searchNum].includes("property")){
                                if(!fileLines[searchNum].includes("intensity") || !fileLines[searchNum].includes("confidence")){
                                    numProps = numProps + 1;
                                }
                                    searchNum = searchNum + 1;
                            }
                            else{
                                searchNum = searchNum - 1;
                                propsNotFound = false;
                                elementToAdd = {
                                    numVertices:numVertices,
                                    numProps:3
                                };
                                elementVertexList.push(elementToAdd);
                            }
                        }
                    }
                    else if(elementLine[1] === "face"){
                        let propsNotFound = true;
                        let elementToAdd;
                        let firstIndexType;
                        let secondIndexType;
                        numFaces = elementLine[2];
                        searchNum = searchNum + 1;
                        while(propsNotFound){
                            if (fileLines[searchNum].includes("property")){
                                if(!fileLines[searchNum].includes("intensity") || !fileLines[searchNum].includes("confidence")){
                                    let splitLine = fileLines[searchNum].split(" ");
                                    firstIndexType = splitLine[2];
                                    secondIndexType = splitLine[3];
                                }
                                searchNum = searchNum + 1;
                            }
                            else{
                                searchNum = searchNum - 1;
                                propsNotFound = false;
                                elementToAdd = {
                                    numFaces:numFaces,
                                    firstIndexType:firstIndexType,
                                    secondIndexType: secondIndexType
                                };
                                elementFaceList.push(elementToAdd);
                            }
                        }
                    }
            }
            searchNum = searchNum + 1;
        }
        let tempArray = [];
        let tempColorArray = [];
        let totalVertVals = elementVertexList[0].numVertices*elementVertexList[0].numProps;
        let totalFaceVals = elementFaceList[0].numFaces*3;              //assuming all faces are 3
        let vertices = new Float32Array(totalVertVals);
        let indices = new Uint32Array(totalFaceVals);
        let vertexColors = new Float32Array(totalVertVals);
        let test;
        let max = 0;
        for (let i = 0; i < elementVertexList[0].numVertices; i++){
            let splitLine = fileLines[searchNum].split(" ");
            for (let j = 0; j < splitLine.length; j++){
                // tempColorArray.push(0.1);
                // tempColorArray.push(0.5);
                // tempColorArray.push(0.01);

                tempColorArray.push(1.0);
                tempColorArray.push(0.75);
                tempColorArray.push(0.79);

                if(splitLine[j] != ""){
                    tempArray.push(splitLine[j]);
                }
            }
            searchNum = searchNum + 1;
        }

        for (let i = 0; i < totalVertVals; i+=3 ){
            vertices[i] = tempArray[i];
            vertices[i + 1] = tempArray[i + 1];
            vertices[i + 2] = tempArray[i + 2];

            vertexColors[i] = tempColorArray[i];
            vertexColors[i + 1] = tempColorArray[i + 1];
            vertexColors[i + 2] = tempColorArray[i + 2];

            test = Math.sqrt(Math.pow(vertices[i], 2) + Math.pow(vertices[i + 1], 2) + Math.pow(vertices[i + 2], 2));
            if (test > max){
                max = test;
            }
        }

        for (let i = 0; i < totalVertVals; i++){
            vertices[i] = vertices[i]/max;
        }

        let tempArray2 = [];

        for (let i = 0; i < elementFaceList[0].numFaces; i++){
            let splitLine = fileLines[searchNum].split(" ");
            for(let j = 1; j < splitLine.length;j++){
                if(splitLine[j] != ""){
                    tempArray2.push(splitLine[j]);
                }
            }
            searchNum = searchNum + 1;
        }

        for (let i = 0; i < totalFaceVals; i++){
            indices[i] = tempArray2[i];
        }

        if(modelNum === 0){
            center ={
                x: -1.0,
                y: 0.0,
                z: -2.0
            };
        }

        else if(modelNum === 1){
            center = {
                x: 1.0,
                y: 0.0,
                z: -2.0
            }
        }

        else if (modelNum === 2)
            center = {
                x: 0.0,
                y: 0.0,
                z: -2.0
            }

        else if (modelNum === 3)
            center = {
                x: 0.0,
                y: -1.0,
                z: -2.0
            }

        let normals = new Float32Array(computeNormal(indices, vertices, max));

        let model = {
            vertices: vertices,
            vertexColors: vertexColors,
            indices: indices,
            center: center,
            normals: normals
        };

    //     let model = {};

    //     model.vertexProperties = [];

    //     model.vertices = //TODO

    //     model.indices = //TODO

    //     model.vertexColors = //TODO



    //     // model.vertices = new Float32Array([
    //     //     -0.5, -0.5, 0.5,   // 0 - 3 (Front face)
    //     //      0.5, -0.5, 0.5,
    //     //      0.5,  0.5, 0.5,
    //     //     -0.5,  0.5, 0.5,

    //     //     -0.5, -0.5, -0.5,   // 4 - 7 (Back face)
    //     //      0.5, -0.5, -0.5,
    //     //      0.5,  0.5, -0.5,
    //     //     -0.5,  0.5, -0.5,
    //     // ]);

    //     // model.vertexColors = new Float32Array([
    //     //     0.0, 0.0, 1.0,  // Front face
    //     //     0.0, 0.0, 1.0,
    //     //     0.0, 0.0, 1.0,
    //     //     0.0, 0.0, 1.0,

    //     //     1.0, 0.0, 0.0,  // Back face
    //     //     1.0, 0.0, 0.0,
    //     //     1.0, 0.0, 0.0,
    //     //     1.0, 0.0, 0.0,
    //     // ]);

    //     //
    //     // CCW winding order
    //     // model.indices = new Uint16Array([
    //     //     0, 1, 2, 0, 2, 3,   // Front face
    //     //     5, 4, 7, 5, 7, 6,   // Back face
    //     //     1, 5, 6, 1, 6, 2,   // Right face
    //     //     7, 4, 0, 3, 7, 0,   // Left face
    //     //     3, 2, 6, 3, 6, 7,   // Top face
    //     //     5, 1, 0, 5, 0, 4    // Bottom face
    //     //  ]);

    //     model.center = {
    //         x: 0.0,
    //         y: 0.0,
    //         z: -2.0
    //     };

         return model;
     }

    //------------------------------------------------------------------
    //
    // Loads and parses a PLY formatted file into an object ready for
    // rendering.
    //
    //------------------------------------------------------------------
    function load(filename, numModel) {
        return new Promise((resolve, reject) => {
            loadFileFromServer(filename)
            .then(fileText => {
                let fileLines = fileText.split('\n');
                let model = defineModel(fileLines, numModel);
                resolve(model);
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    return {
        load : load
    };

}());
