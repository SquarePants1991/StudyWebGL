import 'gl-matrix';
import { mat4, vec3, vec4 } from 'gl-matrix';

let gl: WebGLRenderingContext = null;
let canvas: HTMLCanvasElement = null;
var elapsedTime: number = 0;
var lastRenderTime: number = 0;
var viewMatrix: mat4 = mat4.create();
var cameraAngleAroundY = 0;
var cameraAngleAroundX = 0;
var cameraDistanceFromTarget = 3;

// 准备WebGL的绘制上下文
function prepare() {
    canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '' + canvas.width;
    canvas.style.height = '' + canvas.height;

    document.body.append(canvas);
    window.onresize = function(evt: Event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = '' + canvas.width;
        canvas.style.height = '' + canvas.height;
    };
    gl = canvas.getContext("webgl");
    gl.enable(gl.DEPTH_TEST);
    lastRenderTime = (new Date()).getTime();
}


// 准备WebGL需要使用的素材
function webglPrepare() {
    prepareVertexData();
    createProgram();
}


var vertexData: WebGLBuffer;
function prepareVertexData() {
    // Prepare Vertex Data
    let vertices = [
        // X轴上的平面
        0.5,  -0.5,    0.5, 1,  0,  0,
        0.5,  -0.5,  -0.5, 1,  0,  0,
        0.5,  0.5,   -0.5, 1,  0,  0,
        0.5,  0.5,    -0.5, 1,  0,  0,
        0.5,  0.5,    0.5, 1,  0,  0,
        0.5,  -0.5,   0.5, 1,  0,  0,
    
        -0.5,  -0.5,    0.5, 1,  0,  0,
        -0.5,  -0.5,  -0.5, 1,  0,  0,
        -0.5,  0.5,   -0.5, 1,  0,  0,
        -0.5,  0.5,    -0.5, 1,  0,  0,
        -0.5,  0.5,    0.5, 1,  0,  0,
        -0.5,  -0.5,   0.5, 1,  0,  0,

        // Y 轴上的平面
        -0.5,  0.5,  0.5, 0,  1,  0,
        -0.5, 0.5, -0.5, 0,  1,  0,
        0.5, 0.5,  -0.5, 0,  1,  0,
        0.5,  0.5,  -0.5, 0,  1,  0,
        0.5, 0.5,   0.5, 0,  1,  0,
        -0.5, 0.5,  0.5, 0,  1,  0,

         -0.5, -0.5,   0.5, 0,  1,  0,
         -0.5, -0.5, -0.5, 0,  1,  0,
         0.5, -0.5,  -0.5, 0,  1,  0,
         0.5,  -0.5,  -0.5, 0,  1,  0,
         0.5, -0.5,   0.5, 0,  1,  0,
         -0.5, -0.5,  0.5, 0,  1,  0,

         // Z 轴上的平面
         -0.5,   0.5,  0.5,   0,  0,  1,
         -0.5,  -0.5,  0.5,  0,  0,  1,
         0.5,   -0.5,  0.5,  0,  0,  1,
         0.5,    -0.5, 0.5,   0,  0,  1,
         0.5,  0.5,  0.5,    0,  0,  1,
         -0.5,   0.5,  0.5,  0,  0,  1,
         -0.5,   0.5,  -0.5,   0,  0,  1,
         -0.5,  -0.5,  -0.5,  0,  0,  1,
         0.5,   -0.5,  -0.5,  0,  0,  1,
         0.5,    -0.5, -0.5,   0,  0,  1,
         0.5,  0.5,  -0.5,    0,  0,  1,
         -0.5,   0.5,  -0.5,  0,  0,  1,
    ];

    // 在GPU上为顶点数据开辟空间
    vertexData = gl.createBuffer();
    // 将上面开辟的空间进入编辑模式
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexData);
    // 向上面开辟的空间写入数据
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

var program: WebGLProgram;
var vertexShader: WebGLShader;
var fragmentShader: WebGLShader;
let vertexShaderCode = 
"attribute vec4 position;"+
"attribute vec3 color;"+
"varying vec3 frag_color;"+
"uniform mat4 projection;"+
"uniform mat4 view;"+
"uniform mat4 model;"+
"void main() {" +
    "frag_color = color;" + 
    "gl_Position = projection * view * model * position;" +
"}";
let fragmentShaderCode = 
"precision highp float;" +
"varying vec3 frag_color;"+
"void main() {"+
    "gl_FragColor = vec4(frag_color, 1.0);"+
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
  
function compileShader(shaderSrc: string, shaderType: number): WebGLShader {
    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function updateViewMatrix() {

    // 计算摄像机所在的位置
    let xRot = mat4.create();
    mat4.identity(xRot);
    mat4.rotateX(xRot, xRot, cameraAngleAroundX);

    let yRot = mat4.create();
    mat4.identity(yRot);
    mat4.rotateY(yRot, yRot, cameraAngleAroundY);

    let translate = mat4.create();
    mat4.identity(translate);
    mat4.translate(translate, translate, [0, 0, cameraDistanceFromTarget]);
    
    let finalMatrix = mat4.create();
    mat4.multiply(finalMatrix, yRot, xRot);
    mat4.multiply(finalMatrix, finalMatrix, translate);

    let pos = vec4.create();
    vec4.set(pos, 0, 0, 0, 1);
    vec4.transformMat4(pos, pos, finalMatrix);


    // 沿着x轴多旋转1度，得到位置，和上面的位置求得摄像机近似的up向量
    let xRotPlus = mat4.create();
    mat4.identity(xRotPlus);
    mat4.rotateX(xRotPlus, xRotPlus, cameraAngleAroundX - 1 / 180.0 * Math.PI);
    
    let finalMatrixPlus = mat4.create();
    mat4.multiply(finalMatrixPlus, yRot, xRotPlus);
    mat4.multiply(finalMatrixPlus, finalMatrixPlus, translate);

    let posPlus = vec4.create();
    vec4.set(posPlus, 0, 0, 0, 1);
    vec4.transformMat4(posPlus, posPlus, finalMatrixPlus);

    let cameraUp: vec3 = vec3.create();
    vec3.set(cameraUp, posPlus[0] - pos[0], posPlus[1] - pos[1], posPlus[2] - pos[2]);
    vec3.normalize(cameraUp, cameraUp);

    mat4.lookAt(viewMatrix, [pos[0],pos[1],pos[2]], [0, 0, 0], cameraUp);
}


function render() {
    let now = (new Date()).getTime();
    let delta = now - lastRenderTime;
    lastRenderTime = now;
    elapsedTime += delta;

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0.2, 1, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexData);
    let positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 4 * 6, 0);
    let colorLoc = gl.getAttribLocation(program, 'color');
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 4 * 6, 4 * 3);


    let projection:mat4 = mat4.create();
    mat4.perspective(projection, 60/180 * Math.PI, canvas.width / canvas.height,0.001,1000);
    let uniformLoc = gl.getUniformLocation(program, "projection");
    gl.uniformMatrix4fv(uniformLoc, false, projection);

    updateViewMatrix();
    uniformLoc = gl.getUniformLocation(program, "view");
    gl.uniformMatrix4fv(uniformLoc, false, viewMatrix);

    let model:mat4 = mat4.create();
    mat4.identity(model);
    uniformLoc = gl.getUniformLocation(program, "model");
    gl.uniformMatrix4fv(uniformLoc, false, model);

    gl.drawArrays(gl.TRIANGLES, 0, 3 * 12);

    requestAnimationFrame(render);
}

window.onload = () => {
    // 主流程
    prepare();
    webglPrepare();
    render();
}


var lastX:number = 0, lastY: number = 0, isMouseDown = false;

window.onmousedown = (evt: MouseEvent) => {
    lastX = evt.x;
    lastY = evt.y;
    isMouseDown = true;
}

window.onmousemove = (evt: MouseEvent) => {
    if (isMouseDown) {
        let xdelta = evt.x - lastX;
        let ydelta = evt.y - lastY;
        lastX = evt.x;
        lastY = evt.y;
        cameraAngleAroundX -= ydelta / 100;
        cameraAngleAroundY -= xdelta / 100;
    }
}

window.onmouseup = () => {
    isMouseDown = false;
}

window.onmousewheel = (evt: any) => {
    let wheelDelta = evt["wheelDelta"];
    cameraDistanceFromTarget -= wheelDelta / 30.0;
    cameraDistanceFromTarget = Math.min(Math.max(1, cameraDistanceFromTarget), 10);
}