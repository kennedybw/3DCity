function GeneratePoints()
{
    
    Scene.objects["darkcube"] = new Scene.SceneObject(points.length, 36, gl.TRIANGLES);
    quad( cubePoints, 1, 0, 3, 2, 10);
    quad( cubePoints, 2, 3, 7, 6, 10);
    quad( cubePoints, 3, 0, 4, 7, 10);
    quad( cubePoints, 6, 5, 1, 2, 10);
    quad( cubePoints, 4, 5, 6, 7, 10);
    quad( cubePoints, 5, 4, 0, 1, 10);
  
    Scene.objects["road"] = new Scene.SceneObject(points.length, 6, gl.TRIANGLES);
    generateRoad(roadPoints, 7); // 8 is the color index for the road

    Scene.objects["stripe"] = new Scene.SceneObject(points.length, 6, gl.TRIANGLES);
    generateStripe(stripePoints, 1); // 1 is the color index for yellow

  
    var totalTrianglesForCylinder = numPoints * 2; // Cylinder triangles
    var stopCube = 6 * 6;
    var together = totalTrianglesForCylinder + stopCube;

    Scene.objects["poleAndCube"] = new Scene.SceneObject( points.length,  together * 3, gl.TRIANGLES);
    generateStoplight();

   
    Scene.objects["building"] = new Scene.SceneObject(points.length, 24, gl.TRIANGLES);
    generateBuilding();


    Scene.objects["topPiece"] = new Scene.SceneObject(points.length,36 , gl.TRIANGLES);
    quad(topPiecePoints, 1, 0, 3, 2, 1); // Top face
    quad(topPiecePoints, 2, 3, 7, 6, 1); // Right face
    quad(topPiecePoints, 3, 0, 4, 7, 1); // Front face
    quad(topPiecePoints, 6, 5, 1, 2, 1); // Back face
    quad(topPiecePoints, 4, 5, 6, 7, 1); // Bottom face 
    quad(topPiecePoints, 5, 4, 0, 1, 1); // Left face

    Scene.objects["door"] = new Scene.SceneObject(points.length, 6, gl.TRIANGLES);
    quad(doorPoints, 0, 1, 2, 3, 7);

    Scene.objects["window"] = new Scene.SceneObject(points.length, 6, gl.TRIANGLES);
    generateWindow(windowPoints, 2); 


    Scene.objects["house"] = new Scene.SceneObject(points.length,24, gl.TRIANGLES); 
    generateHouse();

    Scene.objects["roof"] = new Scene.SceneObject(points.length,6 *3, gl.TRIANGLES); 
    generateHouseRoof();

    Scene.objects["storeBuilding"] = new Scene.SceneObject(points.length, 24, gl.TRIANGLES);
    generateBuilding(storeBuildingPoints, 9); 

    Scene.objects["storeRoof"] = new Scene.SceneObject(points.length, 6, gl.TRIANGLES);
    generateRoof(storeRoofPoints, 0); 

    Scene.objects["chimney"] = new Scene.SceneObject(points.length, 24, gl.TRIANGLES); 
    generateChimney();

    
    Scene.objects["bench"] = new Scene.SceneObject(points.length, 12 * 5, gl.TRIANGLES);
    generateBench();

    Scene.objects["sign"] = new Scene.SceneObject(points.length, 36, gl.TRIANGLES);
    generateSign();

    Scene.objects["m"] = new Scene.SceneObject(points.length, 15, gl.TRIANGLES);
    generateM();


    Scene.objects["cylinder"] = new Scene.SceneObject(points.length, cylinderPoints.length * 2.9, gl.TRIANGLES);
    generateCylinder(cylinderPoints, 9); 
    
    var totalTrianglesForTrunk = 12 * 2; // 24 triangles for the trunk
    var totalTrianglesForFoliage = 20 * 20 * 2; // 800 triangles for the foliage
    var totalTrianglesForTree = totalTrianglesForTrunk + totalTrianglesForFoliage; // 824 triangles in total
    Scene.objects["tree"] = new Scene.SceneObject(points.length, totalTrianglesForTree * 3, gl.TRIANGLES);
    generateTree();
  

    let latBands = 20; // Number of latitude bands
    let longBands = 20; // Number of longitude bands
    Scene.objects["bush"] = new Scene.SceneObject(points.length, latBands * longBands * 6, gl.TRIANGLES);
    generateSphere(1.0, 20, 20, 11); // 11 is the color index for green

}


// Definitions for different colors.
var vertexColors = [
  vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
  vec4(1.0, 1.0, 0.4, 1.0), // yellow
  vec4(0.537, 0.812, 0.941, 1.0),  //cyan
  vec4(0.4, 0.26, 0.13, 1.0),  // brown
  vec4(0.0, 0.8, 0.0, 1.0), // green
  vec4( 97/255, 66/255, 0, 1.0 ),  // brownish
  vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
  vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
  vec4( 166/255, 166/255, 166/255, 1.0 ), // grey
  vec4(0.588, 0.588, 0.588, 1.0), // dark grey
  vec4( 166/255, 166/255, 166/255, 1.0),  // brownish
  vec4(0.0, 0.5, 0.0, 1.0),  // dark green
  vec4(0.8, 0.52, 0.25, 1.0)
];

// Calculate the normals for the indices in sourceArray.
function Newell(sourceArray, indices)
{
   var L=indices.length;
   var x=0, y=0, z=0;
   var index, nextIndex;

   for (var i=0; i<L; i++)
   {
       index=indices[i];
       nextIndex = indices[(i+1)%L];
       
       x += (sourceArray[index][1] - sourceArray[nextIndex][1])*
            (sourceArray[index][2] + sourceArray[nextIndex][2]);
       y += (sourceArray[index][2] - sourceArray[nextIndex][2])*
            (sourceArray[index][0] + sourceArray[nextIndex][0]);
       z += (sourceArray[index][0] - sourceArray[nextIndex][0])*
            (sourceArray[index][1] + sourceArray[nextIndex][1]);
   }

   return (normalize(vec3(x, y, z)));
}


function SurfaceRevolution(pointsArray) {
  var tempVertices = [];

  var len = pointsArray.length;

  for (var i = 0; i<len; i++) {
        tempVertices.push( vec4(pointsArray[i][0], 
                                pointsArray[i][1], 
                                pointsArray[i][2], 1) );
  }

  var r;
  var t=Math.PI/6;

  for (var j = 0; j < len-1; j++) {
    var angle = (j+1)*t; 

    // for each sweeping step, generate 25 new points corresponding to the original points
    for(var i = 0; i < 14 ; i++ ) {   
        r = tempVertices[i][0];
        tempVertices.push( vec4(r*Math.cos(angle), 
                           tempVertices[i][1], 
                           -r*Math.sin(angle), 1) );
    }       
  }
 
  // quad strips are formed slice by slice (not layer by layer)
  for (var i = 0; i < len-1; i++) {
    for (var j = 0; j < len-1; j++) {
      quad( tempVertices,
            i*len+j, 
            (i+1)*len+j, 
            (i+1)*len+(j+1), 
            i*len+(j+1),
            1); 
    }
  }  
}

function quad(sourceArray, a, b, c, d, colorIndex) {

  var indices=[a, b, c, d];
  var normal = Newell(sourceArray, indices);

  points.push(sourceArray[a]); 
    colors.push(vertexColors[colorIndex]); 
    normals.push(normal);
    texCoordsArray.push(texCoord[0]);

  points.push(sourceArray[b]); 
    colors.push(vertexColors[colorIndex]); 
    normals.push(normal);
    texCoordsArray.push(texCoord[1]); 
  points.push(sourceArray[c]); 
    colors.push(vertexColors[colorIndex]); 
    normals.push(normal);   
    texCoordsArray.push(texCoord[2]); 

  points.push(sourceArray[a]); 
    colors.push(vertexColors[colorIndex]); 
    normals.push(normal);
    texCoordsArray.push(texCoord[0]); 

  points.push(sourceArray[c]); 
    colors.push(vertexColors[colorIndex]); 
    normals.push(normal);
    texCoordsArray.push(texCoord[2]); 

  points.push(sourceArray[d]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal);
    texCoordsArray.push(texCoord[3]);   
}

// General triangle generation
function triangle(sourceArray, a, b, c, colorIndex) {

  var indices=[a, b, c];
  var normal = Newell(sourceArray, indices);

  points.push(sourceArray[a]); 
    colors.push(vertexColors[colorIndex]); 
    normals.push(normal);
  points.push(sourceArray[b]); 
    colors.push(vertexColors[colorIndex]); 
    normals.push(normal);
  points.push(sourceArray[c]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal);
}

// General shape
function generalShape(sourceArray, vertGroup, center, colorGroup) {
  var colorIndex = 0;
  for(var i = 0; i < vertGroup.length-1; i++) {
    var indices=[vertGroup[i], center, vertGroup[i+1]];
    var normal = Newell(sourceArray, indices);

    points.push(sourceArray[vertGroup[i]]); 
      colors.push(vertexColors[colorGroup[colorIndex]]);
      normals.push(normal); 
    points.push(sourceArray[center]); 
      colors.push(vertexColors[colorGroup[colorIndex]]); 
      normals.push(normal);
    points.push(sourceArray[vertGroup[i+1]]);
      colors.push(vertexColors[colorGroup[colorIndex]]);
      normals.push(normal);
    if(colorIndex < colorGroup.length-1)
      colorIndex++;
  }
}

// Form an octagon shape
// 24 points
function octagon(sourceArray, a, b, c, d, e, f, g, h, center, colorIndex) {

  var indices=[a, b, c, d, e, f, g, h];
  var normal = Newell(sourceArray, indices);

  points.push(sourceArray[a]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[center]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[b]);
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 

  points.push(sourceArray[b]);
    colors.push(vertexColors[colorIndex]);
    normals.push(normal);
  points.push(sourceArray[center]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[c]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 

  
  points.push(sourceArray[c]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[center]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[d]);
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 

  points.push(sourceArray[d]);
    colors.push(vertexColors[colorIndex]);
    normals.push(normal);
  points.push(sourceArray[center]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[e]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 

  
  points.push(sourceArray[e]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[center]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[f]);
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 

  points.push(sourceArray[f]);
    colors.push(vertexColors[colorIndex]);
    normals.push(normal);
  points.push(sourceArray[center]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[g]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  
  
  points.push(sourceArray[g]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[center]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[h]);
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 

  points.push(sourceArray[h]);
    colors.push(vertexColors[colorIndex]);
    normals.push(normal);
  points.push(sourceArray[center]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal); 
  points.push(sourceArray[a]); 
    colors.push(vertexColors[colorIndex]);
    normals.push(normal);
}


var cubePoints = [
  vec4( -0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5,  0.5,  0.5, 1.0 ),
  vec4( 0.5,  0.5,  0.5, 1.0 ),
  vec4( 0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( -0.5,  0.5, -0.5, 1.0 ),
  vec4( 0.5,  0.5, -0.5, 1.0 ),
  vec4( 0.5, -0.5, -0.5, 1.0 ),
];


var buildingPoints = [
  // Front face
  vec4(-1.0, 0.0, 1.0, 1.0), // Bottom left 0
  vec4(1.0, 0.0, 1.0, 1.0),  // Bottom right 1
  vec4(1.0, 10.0, 1.0, 1.0), // Top right 2
  vec4(-1.0, 10.0, 1.0, 1.0), // Top left 3

  // Back face
  vec4(-1.0, 0.0, -1.0, 1.0), // Bottom left 4
  vec4(1.0, 0.0, -1.0, 1.0),  // Bottom right 5
  vec4(1.0, 10.0, -1.0, 1.0), // Top right 6
  vec4(-1.0, 10.0, -1.0, 1.0), // Top left 7



];

var topPieceHeight = 10.5; 
var topPiecePoints = [
    vec4(-1.1, 10.5, 1.1, 1.0),  // Front top left 0
    vec4(-1.1, 11.0, 1.1, 1.0),  // Back top left 1
    vec4(1.1, 11.0, 1.1, 1.0),   // Back top right 2
    vec4(1.1, 10.5, 1.1, 1.0),   // Front top right 3
    vec4(-1.1, 10.5, -1.1, 1.0), // Front bottom left 4
    vec4(-1.1, 11.0, -1.1, 1.0), // Back bottom left 5
    vec4(1.1, 11.0, -1.1, 1.0),  // Back bottom right 6
    vec4(1.1, 10.5, -1.1, 1.0),  // Front bottom right 7
];

var doorPoints = [
    vec4(-0.1, 0.0, 1.05, 1.0),  // Bottom left 0
    vec4(0.1, 0.0, 1.05, 1.0),   // Bottom right 1
    vec4(0.1, 0.4, 1.05, 1.0),   // Top right 2
    vec4(-0.1, 0.4, 1.05, 1.0),  // Top left 3
];



var storeBuildingPoints = [
    // Front face
    vec4(-1.0, 0.0, 1.0, 1.0), // Bottom left 0
    vec4(1.0, 0.0, 1.0, 1.0),  // Bottom right 1
    vec4(1.0, 4.0, 1.0, 1.0), // Top right 2 
    vec4(-1.0, 4.0, 1.0, 1.0), // Top left 3 

    // Back face
    vec4(-1.0, 0.0, -1.0, 1.0), // Bottom left 4
    vec4(1.0, 0.0, -1.0, 1.0),  // Bottom right 5
    vec4(1.0, 4.0, -1.0, 1.0), // Top right 6 
    vec4(-1.0, 4.0, -1.0, 1.0), // Top left 7 
];

var storeRoofPoints = [
    vec4(-1.2, 4.0, 1.2, 1.0), // Front left 0
    vec4(1.2, 4.0, 1.2, 1.0),  // Front right 1
    vec4(1.2, 4.0, -1.2, 1.0), // Back right 2
    vec4(-1.2, 4.0, -1.2, 1.0), // Back left 3
];

var roadPoints = [
    vec4(-1.0, 0.0, 0.5, 1.0),  // Bottom left 0
    vec4(1.0, 0.0, 0.5, 1.0),   // Bottom right 1
    vec4(1.0, 0.0, -0.5, 1.0),  // Top right 2
    vec4(-1.0, 0.0, -0.5, 1.0), // Top left 3
];

var stripePoints = [
    vec4(-0.05, 0.01, 0.1, 1.0),  // Bottom left 0
    vec4(0.05, 0.01, 0.1, 1.0),   // Bottom right 1
    vec4(0.05, 0.01, -0.1, 1.0),  // Top right 2
    vec4(-0.05, 0.01, -0.1, 1.0), // Top left 3
];

function generateRoad(pointsArray, colorIndex) {
    quad(pointsArray, 0, 1, 2, 3, colorIndex); // Front face
}

function generateStripe(pointsArray, colorIndex) {
    quad(pointsArray, 0, 1, 2, 3, colorIndex); // Front face
}

var buildingY = 0.0; // Initial vertical position of the building
function generateBuilding() {
    var sideColorIndex = 9; // Color index for the sides of the building
 
    for (var i = 0; i < housePoints.length; i++) {
      housePoints[i][1] += buildingY;
  }
    // Front
    quad(buildingPoints, 0, 1, 2, 3, sideColorIndex);
    // Back
    quad(buildingPoints, 4, 5, 6, 7, sideColorIndex);
    // Right
    quad(buildingPoints, 1, 5, 6, 2, sideColorIndex);
    // Left
    quad(buildingPoints, 4, 0, 3, 7, sideColorIndex);


}

function generateRoof(pointsArray, colorIndex) {
    quad(pointsArray, 0, 1, 2, 3, colorIndex); // Top face
}

function generatePole(pointsArray, colorIndex) {
    // Generate the cylinder
    quad(pointsArray, 0, 1, 2, 3, colorIndex); // Front face
    quad(pointsArray, 4, 5, 6, 7, colorIndex); // Back face
    quad(pointsArray, 1, 5, 6, 2, colorIndex); // Right face
    quad(pointsArray, 4, 0, 3, 7, colorIndex); // Left face
}

function generateSign(pointsArray, colorIndex) {
    quad(pointsArray, 0, 1, 2, 3, colorIndex); // Front face
}


var windowPoints = [
    vec4(-0.3, 2.0, 1.01, 1.0),  // Bottom left 0
    vec4(-0.1, 2.0, 1.01, 1.0),  // Bottom right 1
    vec4(-0.1, 2.5, 1.01, 1.0),  // Top right 2
    vec4(-0.3, 2.5, 1.01, 1.0),  // Top left 3
];

var housePoints = [
    vec4(-0.8, 0.0, 0.8, 1.0), // Front left corner
    vec4(0.8, 0.0, 0.8, 1.0),  // Front right corner
    vec4(0.8, 0.0, -0.8, 1.0), // Back right corner
    vec4(-0.8, 0.0, -0.8, 1.0), // Back left corner
    
    // Roof peak vertices
    vec4(-0.8, 0.8, 0.8, 1.0), // Front left corner (4)
    vec4(0.8, 0.8, 0.8, 1.0),  // Front right corner (5)
    vec4(0.8, 0.8, -0.8, 1.0), // Back right corner (6)
    vec4(-0.8, 0.8, -0.8, 1.0), // Back left corner (7)
    
    // Roof peak vertices (triangular shape)
    vec4(0, 1.0, 0.8, 1.0),    // Front peak (8)
    vec4(0, 1.0, -0.8, 1.0),   // Back peak (9)
    
    // points to make rectangle parts of roof
    vec4(0, 0.8, 0.8, 1.0),    
    vec4(0, 0.8, -0.8, 1.0),  
    vec4(0, 1.0, 0.8, 1.0),    
    vec4(0, 1.0, -0.8, 1.0),   
];

function generateWindow(pointsArray, colorIndex) {
    quad(pointsArray, 0, 1, 2, 3, colorIndex); // Front face
}

function generateHouse() {
    var wallColorIndex = 3; // wall color

    quad(housePoints, 0, 1, 5, 4, wallColorIndex); // Front wall
    quad(housePoints, 1, 2, 6, 5, wallColorIndex); // Right wall
    quad(housePoints, 2, 3, 7, 6, wallColorIndex); // Back wall
    quad(housePoints, 3, 0, 4, 7, wallColorIndex); // Left wall
}  

function generateHouseRoof(){
  var roofColorIndex = 2; // roof color
    // Generate the roof
    // triangular sides of roof
    triangle(housePoints, 4, 5, 8, roofColorIndex);
    triangle(housePoints, 7, 6, 9, roofColorIndex);
   
    // triangles that form to make rectangle shape of roof
    triangle(housePoints, 4, 8, 9, roofColorIndex); 
    triangle(housePoints, 9, 8, 5, roofColorIndex); 
    
    triangle(housePoints, 4, 9, 7, roofColorIndex);
    triangle(housePoints, 5, 6, 9, roofColorIndex);
    
}

var numPoints = 12;
var radius = 1.0;
var cylinderPoints = [];

// Top circle
cylinderPoints.push(vec4(0.0, 1.0, 0.0, 1.0)); // Center point
for (var i = 0; i < numPoints; i++) {
    var angle = 2 * Math.PI * i / numPoints;
    cylinderPoints.push(vec4(radius * Math.cos(angle), 1.0, radius * Math.sin(angle), 1.0));
}

// Bottom circle
cylinderPoints.push(vec4(0.0, 0.0, 0.0, 1.0)); // Center point
for (var i = 0; i < numPoints; i++) {
    var angle = 2 * Math.PI * i / numPoints;
    cylinderPoints.push(vec4(radius * Math.cos(angle), 0.0, radius * Math.sin(angle), 1.0));
}

// Sides

for (var i = 1; i <= numPoints; i++) {
    cylinderPoints.push(cylinderPoints[i]); // Top circle point
    cylinderPoints.push(cylinderPoints[i + numPoints + 1]); // Corresponding bottom circle point
}

function generateCylinder(pointsArray, colorIndex) {
  console.log(pointsArray);
    // Generate the top and bottom circles
    for (var i = 1; i <= numPoints; i++) {
        triangle(pointsArray, 0, i, (i % numPoints) + 1, colorIndex); // Top circle
        triangle(pointsArray, numPoints + 1, numPoints + 1 + i, numPoints + 1 + ((i % numPoints) + 1), colorIndex); // Bottom circle
    }

    // Generate the sides
    for (var i = 0; i < numPoints; i++) {
        quad(pointsArray, 2*numPoints + 2 + 2*i, 2*numPoints + 2 + 2*i + 1, 2*numPoints + 2 + ((2*i + 3) % (2*numPoints)), 2*numPoints + 2 + ((2*i + 2) % (2*numPoints)), colorIndex); // Sides
    }
}

function generateSphere(radius, latBands, longBands, colorIndex) {
    for (let latNumber = 0; latNumber < latBands; latNumber++) {
        for (let longNumber = 0; longNumber < longBands; longNumber++) {
            let first = (latNumber * (longBands + 1)) + longNumber;
            let second = first + longBands + 1;

            let theta = latNumber * Math.PI / latBands;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);

            let phi = longNumber * 2 * Math.PI / longBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;

            let point1 = vec4(radius * x, radius * y, radius * z, 1.0);
            points.push(point1);
            colors.push(vertexColors[colorIndex]);

            theta = (latNumber + 1) * Math.PI / latBands;
            sinTheta = Math.sin(theta);
            cosTheta = Math.cos(theta);

            x = cosPhi * sinTheta;
            y = cosTheta;
            z = sinPhi * sinTheta;

            let point2 = vec4(radius * x, radius * y, radius * z, 1.0);
            points.push(point2);
            colors.push(vertexColors[colorIndex]);
        }
    }
}

// Chimney points
var chimneyPoints = [
    // Base of the chimney
    vec4(0.7, 1.2, -0.7, 1.0),  // Bottom back right
    vec4(0.9, 1.2, -0.7, 1.0),  // Bottom front right
    vec4(0.9, 1.2, -0.9, 1.0),  // Bottom front left
    vec4(0.7, 1.2, -0.9, 1.0),  // Bottom back left

    // Top of the chimney
    vec4(0.7, 1.5, -0.7, 1.0),  // Top back right
    vec4(0.9, 1.5, -0.7, 1.0),  // Top front right
    vec4(0.9, 1.5, -0.9, 1.0),  // Top front left
    vec4(0.7, 1.5, -0.9, 1.0),  // Top back left
];


function generateChimney() {
    var chimneyColorIndex = 3; // color for chimney

    // Chimney walls
    quad(chimneyPoints, 0, 1, 5, 4, chimneyColorIndex); // Right wall
    quad(chimneyPoints, 2, 3, 7, 6, chimneyColorIndex); // Left wall
    quad(chimneyPoints, 1, 2, 6, 5, chimneyColorIndex); // Front wall
    quad(chimneyPoints, 3, 0, 4, 7, chimneyColorIndex); // Back wall

    // Chimney top
   // quad(chimneyPoints, 4, 5, 6, 7, chimneyColorIndex); // Top cover
}

// Sign points
var signPoints = [
  vec4(-0.5, 0, -0.5, 1.0),  // Bottom back left
  vec4(0.5, 0, -0.5, 1.0),  // Bottom back right
  vec4(0.5, 0, 0.5, 1.0),  // Bottom front right
  vec4(-0.5, 0, 0.5, 1.0),  // Bottom front left
  vec4(-0.5, 1, -0.5, 1.0),  // Top back left
  vec4(0.5, 1, -0.5, 1.0),  // Top back right
  vec4(0.5, 1, 0.5, 1.0),  // Top front right
  vec4(-0.5, 1, 0.5, 1.0)  // Top front left
];

function generateSign() {
  var signColorIndex = 1; // color for sign

  // Sign walls
  quad(signPoints, 0, 1, 5, 4, signColorIndex); // Back wall
  quad(signPoints, 2, 3, 7, 6, signColorIndex); // Front wall
  quad(signPoints, 1, 2, 6, 5, signColorIndex); // Right wall
  quad(signPoints, 3, 0, 4, 7, signColorIndex); // Left wall

  // Sign top
  quad(signPoints, 4, 5, 6, 7, signColorIndex); // Top cover
}

// Sign points
var signPoints = [
    vec4(-0.5, 0, -0.5, 1.0),  // Bottom back left
    vec4(0.5, 0, -0.5, 1.0),  // Bottom back right
    vec4(0.5, 0, 0.5, 1.0),  // Bottom front right
    vec4(-0.5, 0, 0.5, 1.0),  // Bottom front left
    vec4(-0.5, 1, -0.5, 1.0),  // Top back left
    vec4(0.5, 1, -0.5, 1.0),  // Top back right
    vec4(0.5, 1, 0.5, 1.0),  // Top front right
    vec4(-0.5, 1, 0.5, 1.0)  // Top front left
];

function generateSign() {
  var signColorIndex = 0; // color for sign

  // Sign walls
  quad(signPoints, 0, 1, 5, 4, signColorIndex); // Back wall
  quad(signPoints, 2, 3, 7, 6, signColorIndex); // Front wall
  quad(signPoints, 1, 2, 6, 5, signColorIndex); // Right wall
  quad(signPoints, 3, 0, 4, 7, signColorIndex); // Left wall

  // Sign top
  quad(signPoints, 4, 5, 6, 7, signColorIndex); // Top cover

  // Sign bottom
  quad(signPoints, 0, 1, 2, 3, signColorIndex); // Bottom cover
}

// M points
var mPoints = [
  vec4(-0.3, 0.5, 0.1, 1.0),  // Point 0
  vec4(-0.2, 0.7, 0.1, 1.0),  // Point 1
  vec4(-0.1, 0.5, 0.1, 1.0),  // Point 2
  vec4(0, 0.7, 0.1, 1.0),     // Point 3
  vec4(0.1, 0.5, 0.1, 1.0),   // Point 4
  vec4(-0.3, 0.3, 0.1, 1.0),  // Point 5
  vec4(0.1, 0.3, 0.1, 1.0),    // Point 6
  vec4(-0.1,0.3, 0.1, 1.0),// Point 7
  vec4(-0.2,0.5, 0.1, 1.0),// Point 8
  vec4(0,0.5, 0.1, 1.0)// Point 9
];

function generateM() {
  var mColorIndex = 1; // color for M

  // M shape
  triangle(mPoints, 0, 1, 2, mColorIndex);
  triangle(mPoints, 2, 3, 4, mColorIndex);
  triangle(mPoints, 0, 2, 5, mColorIndex);
  triangle(mPoints, 2, 4, 6, mColorIndex);
  triangle(mPoints, 7, 8, 9, mColorIndex);
}


// Parameters for the pole
var poleBaseHeight = 1.0;
var poleBaseRadius = 0.1;
var poleColorIndex = 7;
var poleBasePoints = cylinderPoints;


var signalBoxWidth = 4.5; // Width of the signal box
var signalBoxHeight = 0.15; // Height of the signal box
var signalBoxDepth = 6.5; // Depth of the signal box

// Signal box points 
var signalBoxPoints = [
    // Front face
    vec4(-signalBoxWidth / 2, poleBaseHeight, signalBoxDepth / 2, 1.0),
    vec4(signalBoxWidth / 2, poleBaseHeight, signalBoxDepth / 2, 1.0),
    vec4(signalBoxWidth / 2, poleBaseHeight + signalBoxHeight, signalBoxDepth / 2, 1.0),
    vec4(-signalBoxWidth / 2, poleBaseHeight + signalBoxHeight, signalBoxDepth / 2, 1.0),
    // Back face
    vec4(-signalBoxWidth / 2, poleBaseHeight, -signalBoxDepth / 2, 1.0),
    vec4(signalBoxWidth / 2, poleBaseHeight, -signalBoxDepth / 2, 1.0),
    vec4(signalBoxWidth / 2, poleBaseHeight + signalBoxHeight, -signalBoxDepth / 2, 1.0),
    vec4(-signalBoxWidth / 2, poleBaseHeight + signalBoxHeight, -signalBoxDepth / 2, 1.0)
];

var changeColorFlag = false;
var signalBoxColorIndex = 4;

function generateStoplight() {
  // Generate the base pole
  generateCylinder(poleBasePoints, poleColorIndex);


  if(changeColorFlag == false) {
      // Generate the signal box on top of the pole using quads
      // Front face
      quad(signalBoxPoints, 0, 1, 2, 3, signalBoxColorIndex);
      // Back face
      quad(signalBoxPoints, 4, 5, 6, 7, 7);
      // Top face
      quad(signalBoxPoints, 3, 2, 6, 7, 7);
      // Bottom face
      quad(signalBoxPoints, 4, 5, 1, 0, 7);
      // Left face
      quad(signalBoxPoints, 4, 0, 3, 7, 7);
      // Right face
      quad(signalBoxPoints, 1, 5, 6, 2, 7);
  }
  else if(changeColorFlag == true) {
      quad(signalBoxPoints, 0, 1, 2, 3, 0);
      // Back face
      quad(signalBoxPoints, 4, 5, 6, 7, 7);
      // Top face
      quad(signalBoxPoints, 3, 2, 6, 7, 7);
      // Bottom face
      quad(signalBoxPoints, 4, 5, 1, 0, 7);
      // Left face
      quad(signalBoxPoints, 4, 0, 3, 7, 7);
      // Right face
      quad(signalBoxPoints, 1, 5, 6, 2, 7);
  }
}


// Bench points
var benchSeatPoints = [
  vec4(-0.5, 0.2, -0.5, 1.0), // Bottom back left
  vec4(0.5, 0.2, -0.5, 1.0),  // Bottom back right
  vec4(0.5, 0.2, 0.5, 1.0),   // Bottom front right
  vec4(-0.5, 0.2, 0.5, 1.0),  // Bottom front left
  vec4(-0.5, 0.5, -0.5, 1.0), // Top back left
  vec4(0.5, 0.5, -0.5, 1.0),  // Top back right
  vec4(0.5, 0.5, 0.5, 1.0),   // Top front right
  vec4(-0.5, 0.5, 0.5, 1.0)   // Top front left
];

var backrestZ = -0.5; 

var benchBackrestPoints = [
  vec4(-0.5, 0.5, backrestZ, 1.0), // Bottom back left
  vec4(0.5, 0.5, backrestZ, 1.0),  // Bottom back right
  vec4(0.5, 0.8, backrestZ, 1.0),  // Top back right
  vec4(-0.5, 0.8, backrestZ, 1.0), // Top back left
  vec4(-0.5, 0.5, backrestZ - 0.1, 1.0), // Bottom front left 
  vec4(0.5, 0.5, backrestZ - 0.1, 1.0),  // Bottom front right
  vec4(0.5, 0.8, backrestZ - 0.1, 1.0),  // Top front right
  vec4(-0.5, 0.8, backrestZ - 0.1, 1.0)  // Top front left
];

function generateBench() {
  var benchColorIndex = 12; // color for bench

  // Seat
  quad(benchSeatPoints, 0, 1, 5, 4, benchColorIndex); // Back
  quad(benchSeatPoints, 2, 3, 7, 6, benchColorIndex); // Front
  quad(benchSeatPoints, 1, 2, 6, 5, benchColorIndex); // Right
  quad(benchSeatPoints, 3, 0, 4, 7, benchColorIndex); // Left
  quad(benchSeatPoints, 4, 5, 6, 7, benchColorIndex); // Top

  // Backrest
  quad(benchBackrestPoints, 0, 1, 5, 4, benchColorIndex); // Back
  quad(benchBackrestPoints, 2, 3, 7, 6, benchColorIndex); // Front
  quad(benchBackrestPoints, 1, 2, 6, 5, benchColorIndex); // Right
  quad(benchBackrestPoints, 3, 0, 4, 7, benchColorIndex); // Left
  quad(benchBackrestPoints, 4, 5, 6, 7, benchColorIndex); // Top
}


// Tree trunk points
var trunkPoints = [];

// Trunk height and radius
var trunkHeight = 1.0;
var trunkRadius = 0.2;
var trunkColorIndex = 3; // Trunk color 

// Generate trunk points 
for (var i = 0; i <= 12; i++) {
    var angle = 2 * Math.PI * i / 12;
    trunkPoints.push(vec4(trunkRadius * Math.cos(angle), 0, trunkRadius * Math.sin(angle), 1.0)); // Bottom circle
    trunkPoints.push(vec4(trunkRadius * Math.cos(angle), trunkHeight, trunkRadius * Math.sin(angle), 1.0)); // Top circle
}

// Tree foliage points 
var foliagePoints = [];
var foliageRadius = 0.5;
var foliageColorIndex = 4; // Foliage color 
var latBands = 20;
var longBands = 20;

// Generate foliage points (sphere)
for (let latNumber = 0; latNumber <= latBands; latNumber++) {
    var theta = latNumber * Math.PI / latBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for (let longNumber = 0; longNumber <= longBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longBands);
        var v = 1 - (latNumber / latBands);

        foliagePoints.push(vec4(foliageRadius * x, foliageRadius * y + trunkHeight, foliageRadius * z, 1.0));
    }
}

// Function to generate the tree
function generateTree() {
    // Generate the trunk using cylinder points
    for (var i = 0; i < trunkPoints.length; i+=2) {
        quad(trunkPoints, i, i + 1, (i + 3) % trunkPoints.length, (i + 2) % trunkPoints.length, trunkColorIndex);
    }

    // Generate the foliage using sphere points
    for (let latNumber = 0; latNumber < latBands; latNumber++) {
        for (let longNumber = 0; longNumber < longBands; longNumber++) {
            var first = (latNumber * (longBands + 1)) + longNumber;
            var second = first + longBands + 1;
            triangle(foliagePoints, first, second, first + 1, foliageColorIndex);
            triangle(foliagePoints, second, second + 1, first + 1, foliageColorIndex);
        }
    }
}
