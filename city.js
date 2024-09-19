// Names: Kennedy Bowles, Gatlin Murr

var modelViewMatrix=mat4(); // identity
var modelViewMatrixLoc;
var projectionMatrix;
var projectionMatrixLoc;
var modelViewStack=[];
var rotateSignAndMFlag = false;
var program;
// Variables that control the orthographic projection bounds.
var y_max = 5;
var y_min = -5;
var x_max = 8;
var x_min = -8;
var near = -50;
var far = 50;

// Camera 
var eye = vec3(0, 0, 0);
const at = vec3(0, 0, 0);
const up = vec3(0, 1, 0);

var points=[];
var colors=[];
var normals=[];
var texCoordsArray = [];


// TODO: Set a single scene light (handled in scene?)
//       and give each object its own material (in scene).
var lightPosition = vec4(-4, 3, 4, 0.0 );
var lightAmbient = vec4(.8, 0.8, 0.8, 1.0 );
var lightDiffuse = vec4( .5, .5, .5, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.1, 0.1, 0.1, 1.0 );
var materialDiffuse = vec4( 0.1, 0.1, 0.1, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 4.0;

var ambientColor, diffuseColor, specularColor;

var texture;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

//*******************************************************************************
//* Scene namespace. Contains the object which holds all SceneObjects along with
//* its definition. Also contains the function to draw SceneObjects.
//*******************************************************************************
var Scene = {

    // Holds all of the objects in a scene, defined in SceneObject.
    objects : {},

    SceneObject : function (start, length, type, translate, rotate, scale) {
        this.start = start;
        this.length = length;
        this.type = type;
        this.translate = translate || vec3(0, 0, 0);
        this.scale = scale || vec3(1, 1, 1);
        this.rotate = rotate || vec4(0, 1.0, 0, 0);
    },

    // TODO: Add the transformations to each object and add
    //       a way to set them (ex. objects["this"].setTranslate(x, y, z)).
    DrawObject : function (objectName) {
        var obj = Scene.objects[objectName];


        gl.drawArrays(obj.type, obj.start, obj.length);
        //modelViewMatrix = modelViewStack.pop();
    }
};
//*******************************************************************************
//* End Scene namespace
//*******************************************************************************

//*******************************************************************************
//* PFour namespace - contains information about the current project.
//*******************************************************************************
var PFour = {


    currentStep : 0,
    animating: false,
    // Camera pan control variables.
    zoomFactor : 2,
    translateX : 0,
    translateY : 0,

    // Camera rotate control variables.
    phi : 1,
    theta : 0.5,
    radius : 1,
    dr : 5.0 * Math.PI/180.0,

    // Mouse control variables - check AttachHandlers() to see how they're used.
    mouseDownRight : false,
    mouseDownLeft : false,

    mousePosOnClickX : 0,
    mousePosOnClickY : 0

};

//*******************************************************************************
//* Called when the window is loaded. Sets up WebGL, generates the points
//* (see generatepoints.js), and starts the update loop.
//*******************************************************************************
window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // See generatepoints.js for function definition.
    GeneratePoints();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 135/255, 206/255, 235/255, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //*******************************************************************************
    //* Create the shader program and set up the variables in the shaders and 
    //* on the buffers.
    //*******************************************************************************
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // set up texture buffer
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
  // gl.enableVertexAttribArray( vTexCoord );


    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc= gl.getUniformLocation(program, "projectionMatrix");

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );  
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);

    //*******************************************************************************
    //* End shader program setup
    //*******************************************************************************

    // Attach the handlers to the document/canvas.
    AttachHandlers();

    Update();
}

//*******************************************************************************
//* This is constantly called and 
//*******************************************************************************
function Update() {
    if (PFour.animating) {
        PFour.phi += 0.01;
        PFour.theta += 0.01;
    }
    Render();
    requestAnimFrame(Update);
}

//*******************************************************************************
//* Call the functions we need to draw each object in the scene.
//*******************************************************************************
function Render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    // Setup the projection matrix.
    projectionMatrix = ortho( x_min*PFour.zoomFactor - PFour.translateX, 
                              x_max*PFour.zoomFactor - PFour.translateX, 
                              y_min*PFour.zoomFactor - PFour.translateY, 
                              y_max*PFour.zoomFactor - PFour.translateY, 
                              near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Setup the initial model-view matrix.
    eye = vec3( PFour.radius*Math.cos(PFour.phi), 
                PFour.radius*Math.sin(PFour.theta),
                PFour.radius*Math.sin(PFour.phi));
    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    
    // CITY
    DrawGround();
    
    DrawRoad();

    DrawStripes();

    DrawBuilding();

    DrawHouse();

    DrawStore();

    DrawCylinder(); 

    DrawBushes();

    DrawSign();

    DrawM();

    DrawLightPole();

    DrawBench();

    DrawTree();

}

//*******************************************************************************
//* Sets all of the event handlers onto the document/canvas.
//*******************************************************************************
function AttachHandlers() {

    // These four just set the handlers for the buttons.
    document.getElementById("thetaup").addEventListener("click", function(e) {
        PFour.theta += PFour.dr;
    });
    document.getElementById("thetadown").addEventListener("click", function(e) {
        PFour.theta -= PFour.dr;
    });
    document.getElementById("phiup").addEventListener("click", function(e) {
        PFour.phi += PFour.dr;
    });
    document.getElementById("phidown").addEventListener("click", function(e) {
        PFour.phi -= PFour.dr;
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === 'a' || e.key === 'A') {
            buildingY += 0.1; // Increase the vertical position of the building
        }
    });

    // Set the scroll wheel to change the zoom factor.
    document.getElementById("gl-canvas").addEventListener("wheel", function(e) {
        if (e.wheelDelta > 0) {
            PFour.zoomFactor = Math.max(0.1, PFour.zoomFactor - 0.3);
        } else {
            PFour.zoomFactor += 0.3;
        }
    });

    //************************************************************************************
    //* When you click a mouse button, set it so that only that button is seen as
    //* pressed in PFour. Then set the position. The idea behind this and the mousemove
    //* event handler's functionality is that each update we see how much the mouse moved
    //* and adjust the camera value by that amount.
    //************************************************************************************
    document.getElementById("gl-canvas").addEventListener("mousedown", function(e) {
        if (e.which == 1) {
            PFour.mouseDownLeft = true;
            PFour.mouseDownRight = false;
            PFour.mousePosOnClickY = e.y;
            PFour.mousePosOnClickX = e.x;
        } else if (e.which == 3) {
            PFour.mouseDownRight = true;
            PFour.mouseDownLeft = false;
            PFour.mousePosOnClickY = e.y;
            PFour.mousePosOnClickX = e.x;
        }
    });

    document.addEventListener("mouseup", function(e) {
        PFour.mouseDownLeft = false;
        PFour.mouseDownRight = false;
    });

    document.addEventListener("mousemove", function(e) {
        if (PFour.mouseDownRight) {
            PFour.translateX += (e.x - PFour.mousePosOnClickX)/30;
            PFour.mousePosOnClickX = e.x;

            PFour.translateY -= (e.y - PFour.mousePosOnClickY)/30;
            PFour.mousePosOnClickY = e.y;
        } else if (PFour.mouseDownLeft) {
            PFour.phi += (e.x - PFour.mousePosOnClickX)/100;
            PFour.mousePosOnClickX = e.x;

            PFour.theta += (e.y - PFour.mousePosOnClickY)/100;
            PFour.mousePosOnClickY = e.y;
        }
    });

    // If you press 'a', start or end animation.
    document.addEventListener("keypress", function(e) {
        if (e.keyCode == 97) {
            PFour.animating = !PFour.animating;
        }
    });

    document.addEventListener("keypress", function(e) {
        if (e.keyCode == 98) {
            // Reset camera position
            PFour.translateX = 0;
            PFour.translateY = 0;
            PFour.zoomFactor = 2;
            PFour.phi = 0;
            PFour.theta = 0;
        }
    });

    // Create an audio element
    var audio = document.createElement('audio'); 
    audio.src = 'carsound.m4a'; 

    // Add keydown event listener to the document
    document.addEventListener('keydown', function(event) {
        // Check if the pressed key is 'A' or 'a'
        if (event.key === 'A' || event.key === 'a') {
            // Toggle play/pause based on the current state
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
        }
    }
   });
}

// Set texture image
function setTexture(img,texture,u)
{
     gl.enableVertexAttribArray(vTexCoord);
  
    // ========  Establish Textures =================
    // --------create texture object 1----------
    var texture2 = gl.createTexture();

    // create the image object
    texture2.image = new Image();

    // Tell the broswer to load an image
    texture2.image.src=img;

    // register the event handler to be called on loading an image
    texture2.image.onload = function() {  loadTexture(texture2, texture); }

    gl.uniform1i(gl.getUniformLocation(program, "texture"), u);
    // modelViewMatrix=mvMatrixStack.pop();
}


function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}


function loadTexture(texture,whichTexture) 
{
     // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    // Enable texture unit 0
    gl.activeTexture(whichTexture);

    // bind the texture object to the target
    gl.bindTexture( gl.TEXTURE_2D, texture );

    // set the texture image
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // v1 (combination needed for images that are not powers of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // set the texture parameters
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    

}


function DrawBuilding() {
    // building structure
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true); // Enable texturing
    setTexture("buildtext.jpg",gl.TEXTURE0,0);
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-6.0, -4.0, 3.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(90,vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, scale4(2.5, 1.0, 4.0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("building");
    modelViewMatrix = modelViewStack.pop();
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false); // Disable texturing for subsequent objects

    // roof 
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-6.0, -15.9, 3.0)); 
    modelViewMatrix = mult(modelViewMatrix, rotate(90,vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, scale4(3.1, 2.0, 4.1)); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("topPiece");
    modelViewMatrix = modelViewStack.pop();

    // door
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-6, -3.5, 1.4)); 
    modelViewMatrix = mult(modelViewMatrix, scale4(5, 5, 4));    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("door");
    modelViewMatrix = modelViewStack.pop();

    // window
    let windowLocations = [vec3(-5, -7, 1.5), vec3(-3, -7, 1.5), vec3(-7, -7, 1.5),
        vec3(-5, -5, 1.5), vec3(-3, -5, 1.5), vec3(-7, -5, 1.5)]; // Add more locations as needed
    for (let location of windowLocations) {
        modelViewStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(location));
        modelViewMatrix = mult(modelViewMatrix, scale4(5, 3.5, 4));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        Scene.DrawObject("window");
        modelViewMatrix = modelViewStack.pop();
    }
    
}

// house function
function DrawHouse(){
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true); // Enable texturing
    setTexture("house.jpg",gl.TEXTURE1,1);
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-6.0, -4.0, -5)); 
    modelViewMatrix = mult(modelViewMatrix, scale4(6.0, 8.0, 3.0)); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("house");
    modelViewMatrix = modelViewStack.pop();
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false); // Disable texturing for subsequent objects


    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true); // Enable texturing
    setTexture("roof.jpg",gl.TEXTURE2,2);
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-6.0, -4.0, -5)); 
    modelViewMatrix = mult(modelViewMatrix, scale4(6.0, 8.0, 3.0)); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("roof");
    modelViewMatrix = modelViewStack.pop();
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false); // Disable texturing for subsequent objects


    // door
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-6, -3.5, -11.7)); 
    modelViewMatrix = mult(modelViewMatrix, scale4(5, 5, 4));    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("door");
    modelViewMatrix = modelViewStack.pop();

        // window
    let windowLocations = [vec3(-6, -10, -9.5), vec3(0, -10, -9.5)]; // Add more locations as needed
    for (let location of windowLocations) {
        modelViewStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(location));
        modelViewMatrix = mult(modelViewMatrix, scale4(15, 4, 2)); // Adjust the size of the bush
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        Scene.DrawObject("window");
        modelViewMatrix = modelViewStack.pop();
    }

    // chimney
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true); // Enable texturing
    setTexture("house.jpg",gl.TEXTURE1,1);
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-8.3,-1.6, -3.5)); 
    modelViewMatrix = mult(modelViewMatrix, scale4(4.2, 4.3, 4.2)); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("chimney");
    modelViewMatrix = modelViewStack.pop();
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false); // Disable texturing for subsequent objects
}


// ground function
function DrawGround() {
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(0, -4, 0));
    modelViewMatrix = mult(modelViewMatrix, scale4(25, 0.9, 25));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("darkcube");
    modelViewMatrix = modelViewStack.pop();
}

// New store function
function DrawStore() {
    // Store building
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true); // Enable texturing
    setTexture("mcdonalds.jpg",gl.TEXTURE3,3);
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(4.0, -4.0, -1.0)); // Change the translation values as needed
    modelViewMatrix = mult(modelViewMatrix, scale4(2.5, 0.5, 4.0)); // Make the store shorter
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("storeBuilding");
    modelViewMatrix = modelViewStack.pop();
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false); // Disable texturing for subsequent objects

    // Store roof
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(4.0, -1, -1.0)); // Position the roof on top of the store
    modelViewMatrix = mult(modelViewMatrix, scale4(2.5, 0.2, 4.0)); // Adjust the size of the roof
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("storeRoof");
    modelViewMatrix = modelViewStack.pop();

    // door
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(2.4, -3.5, -2)); 
    modelViewMatrix = mult(modelViewMatrix, rotate(90,vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, scale4(5, 5, 4));    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("door");
    modelViewMatrix = modelViewStack.pop();

    // door
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(2.4, -3.5, 0)); 
    modelViewMatrix = mult(modelViewMatrix, rotate(90,vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, scale4(5, 5, 4));    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("door");
    modelViewMatrix = modelViewStack.pop();
}

function DrawCylinder() {
    // Cylinder
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(6, -4, 6)); // Position the cylinder
    modelViewMatrix = mult(modelViewMatrix, scale4(1,10, 1)); // Adjust the size of the cylinder
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("cylinder");
    modelViewMatrix = modelViewStack.pop();
}

function DrawBushes() {
    let bushLocations = [vec3(-7, -3.3, 6), vec3(-5, -3.3, 6), vec3(7, -3.3, -3), vec3(7, -3.3, -1), vec3(7, -3.3, 1)]; // Add more locations as needed

    for (let location of bushLocations) {
        modelViewStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(location));
        modelViewMatrix = mult(modelViewMatrix, scale4(0.5, 0.5, 0.5)); // Adjust the size of the bush
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        Scene.DrawObject("bush");
        modelViewMatrix = modelViewStack.pop();
    }
}

function DrawRoad() {
let roadLocations = [vec3(0,-3.5,-10), vec3(0,-3.5,10)];

    for (let location of roadLocations){
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(location)); // Position the road
    modelViewMatrix = mult(modelViewMatrix, scale4(12, 0.1, 4)); // Adjust the size of the road
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("road");
    modelViewMatrix = modelViewStack.pop();
    }
}

function DrawStripes() {
    let stripeLocations = [vec3(0,-3.5,-9.8), vec3(0,-3.5,-10.2), vec3(0,-3.5,9.8), vec3(0,-3.5,10.2)];

    for (let location of stripeLocations){
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(location)); 
    modelViewMatrix = mult(modelViewMatrix, scale4(240, 0.1, 1)); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("stripe");
    modelViewMatrix = modelViewStack.pop();
    }
}

function DrawSign() {
    // Sign
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(6, 6, 6)); // Position the sign on top of the cylinder
    modelViewMatrix = mult(modelViewMatrix, scale4(10, 6, 3)); // Adjust the size of the sign
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("sign");
    modelViewMatrix = modelViewStack.pop();
}

function DrawM() {
    // M
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(7.5, 3.5, 6.5)); // Position the M on the sign
    modelViewMatrix = mult(modelViewMatrix, scale4(12, 12, 12)); // Adjust the size of the M
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("m");
    modelViewMatrix = modelViewStack.pop();
  }

  function DrawLightPole() {
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(10, -4, -6)); // Adjust to position the light pole
    modelViewMatrix = mult(modelViewMatrix, rotate(90,vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, scale4(0.1, 6, 0.1)); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("poleAndCube");
    modelViewMatrix = modelViewStack.pop();

    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(-11, -4, 7.2)); // Adjust to position the light pole
    modelViewMatrix = mult(modelViewMatrix, rotate(270,vec3(0, 1, 0))); 
    modelViewMatrix = mult(modelViewMatrix, scale4(0.1, 6, 0.1)); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("poleAndCube");
    modelViewMatrix = modelViewStack.pop();

}


function DrawBench() {
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true); // Enable texturing
    setTexture("bench2.jpg",gl.TEXTURE4,4);
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(4, -4.4, -6)); // Adjust to position the bench
    modelViewMatrix = mult(modelViewMatrix, rotate(180,vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, scale4(3, 3, 1)); // Adjust scale if needed
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("bench");
    modelViewMatrix = modelViewStack.pop();


    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(4, -4.4, 4)); // Adjust to position the bench
    modelViewMatrix = mult(modelViewMatrix, rotate(360,vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, scale4(3, 3, 1)); // Adjust scale if needed
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("bench");
    modelViewMatrix = modelViewStack.pop();
    gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false); // Disable texturing for subsequent objects
}

function DrawTree(){
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(0, -4, 4)); // Adjust to position the tree
    modelViewMatrix = mult(modelViewMatrix, scale4(2, 5, 2)); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    Scene.DrawObject("tree");
    modelViewMatrix = modelViewStack.pop();
}