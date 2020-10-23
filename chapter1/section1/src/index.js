var glm = require("gl-matrix")

let gl = null;
let canvas = null;

// 准备WebGL的绘制上下文
function prepare() {
    canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = window.innerWidth;
    canvas.style.height = window.innerHeight;

    document.body.append(canvas);
    window.onresize = function(evt) {
        console.log(evt);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = window.innerWidth;
        canvas.style.height = window.innerHeight;
    };
    gl = canvas.getContext("webgl");
}


// 准备WebGL需要使用的素材
function webglPrepare() {
    prepareVertexData();
    createProgram();
    gl.enable(gl.DEPTH_TEST);
}


var vertexData;
function prepareVertexData() {
    // Prepare Vertex Data
    // let vertices = [
    //     // 底面
    //     0, 1, 0, 
    //     0.5, 0, 0, 
    //     -0.5, 0, 0, 
    //     // 左侧面
    //     0, 1, 0, 
    //     0, 1.0 / 3.0, 1.384, 
    //     -0.5, 0, 0,
    //     // 右侧面
    //     0, 1, 0, 
    //     -0.5, 0, 0, 
    //     0, 1.0 / 3.0, 1.384,
    //     // 下侧面
    //     -0.5, 0, 0, 
    //     0, 1.0 / 3.0, 1.384,
    //     0.5, 0, 0,
    // ];
    let halfSideLen = Math.sqrt(1.0/3.0);
    let centerVertexHeight = Math.sqrt(Math.pow(2 * halfSideLen, 2) - Math.pow(2 / 3.0, 2));
    let vertices = [
        // 底面
        0, 0, 1,
        halfSideLen, 0, 0, 
        halfSideLen, 0, 0, 
        -halfSideLen, 0, 0, 
        -halfSideLen, 0, 0, 
        0, 0, 1, 
        // 左侧面
        0, 0, 1, 
        0, centerVertexHeight, 1.0 / 3.0, 
        0, centerVertexHeight, 1.0 / 3.0, 
        -halfSideLen, 0, 0,
        -halfSideLen, 0, 0,
        0, 0, 1, 
        // 右侧面
        0, 0, 1, 
        -halfSideLen, 0, 0, 
        -halfSideLen, 0, 0, 
        0, centerVertexHeight, 1.0 / 3.0,
        0, centerVertexHeight, 1.0 / 3.0,
        0, 0, 1, 
        // 下侧面
        -halfSideLen, 0, 0, 
        0, centerVertexHeight, 1.0 / 3.0,
        0, centerVertexHeight, 1.0 / 3.0,
        halfSideLen, 0, 0,
        halfSideLen, 0, 0,
        -halfSideLen, 0, 0, 
    ];

    // 在GPU上为顶点数据开辟空间
    vertexData = gl.createBuffer();
    // 将上面开辟的空间进入编辑模式
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexData);
    // 向上面开辟的空间写入数据
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

var program;
let vertexShaderCode = 
"attribute vec4 position;"+
"uniform mat4 proj;"+
"uniform mat4 view;"+
"uniform mat4 model;"+
"void main() {" +
    "gl_Position = proj * view * model * position;" +
"}";
let fragmentShaderCode = 
"void main() {"+
    "gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
"}";

function createProgram() {
    program = gl.createProgram();

    vertexShader = compileShader(vertexShaderCode, gl.VERTEX_SHADER);
    fragmentShader = compileShader(fragmentShaderCode, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    }
    return program;
}
  
function compileShader(shaderSrc, shaderType) {
    shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

var elapsedTime = 0;
var lastUpdateTime = (new Date()).getTime();

function render() {
    let now = (new Date()).getTime();
    let delta = now - lastUpdateTime;
    elapsedTime += delta;
    lastUpdateTime = now;

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(1, 1, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexData);
    positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 4 * 3, 0);

    let projLoc = gl.getUniformLocation(program, 'proj');
    let projMatrix = glm.mat4.create();
    glm.mat4.perspective(projMatrix, 60 / 180.0 * Math.PI, canvas.width / canvas.height, 0.01, 100);
    gl.uniformMatrix4fv(projLoc, false, projMatrix);

    let viewLoc = gl.getUniformLocation(program, 'view');
    let viewMatrix = glm.mat4.create();
    glm.mat4.lookAt(viewMatrix, glm.vec3.fromValues(2, 4, 4), glm.vec3.fromValues(0, 0, 0), glm.vec3.fromValues(0, 1, 0));
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix);

    let modelLoc = gl.getUniformLocation(program, 'model');
    let modelMatrix = glm.mat4.create();
    // glm.mat4.rotateY(modelMatrix, modelMatrix, elapsedTime * 0.001);
    glm.mat4.translate(modelMatrix, modelMatrix, glm.vec3.fromValues(0, 0, -1.0/3.0));
    gl.uniformMatrix4fv(modelLoc, false, modelMatrix);

    gl.lineWidth(5);
    gl.drawArrays(gl.LINES, 0, 24);

    requestAnimationFrame(render);
}


// 主流程
prepare();
webglPrepare();
render();