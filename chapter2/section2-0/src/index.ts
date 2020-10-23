import 'gl-matrix';
import { mat4, vec3, vec4 } from 'gl-matrix';

let gl: WebGLRenderingContext = null;
let canvas: HTMLCanvasElement = null;
var elapsedTime: number = 0;
var lastRenderTime: number = 0;

// 准备WebGL的绘制上下文
function prepare() {
    canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '' + window.innerWidth;
    canvas.style.height = '' + window.innerHeight;

    document.body.append(canvas);
    window.onresize = function(evt: Event) {
        console.log(evt);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = '' + window.innerWidth;
        canvas.style.height = '' + window.innerHeight;
    };
    gl = canvas.getContext("webgl");
    lastRenderTime = (new Date()).getTime();

    var translateVec = vec3.create();
    vec3.set(translateVec, 1,2,3);

    var translateMatrix = mat4.create();
    mat4.identity(translateMatrix);
    mat4.translate(translateMatrix, translateMatrix, translateVec);

    var matrixStr = "";
    var counter = 0;
    for (let idx in translateMatrix) {
        matrixStr += translateMatrix[idx] + ", "
        counter++;
        if (counter >= 4) {
            counter = 0;
            matrixStr += '\n';
        }
    }
    console.log(matrixStr);
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
        -0.5, -0.5, 0, // 左下角
        0.5, -0.5, 0, // 右下角
        0, 0.5, 0, // 中上
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
"uniform mat4 transform;"+
"void main() {" +
    "gl_Position = transform * position;" +
"}";
let fragmentShaderCode = 
"void main() {"+
    "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);"+
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


function render() {
    let now = (new Date()).getTime();
    let delta = now - lastRenderTime;
    lastRenderTime = now;
    elapsedTime += delta;

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0.2, 1, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexData);
    let positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 4 * 3, 0);


    var translateVec = vec3.create();
    vec3.set(translateVec, Math.sin(elapsedTime / 1000.0), Math.cos(elapsedTime / 1000.0), 0);

    var translateMatrix = mat4.create();
    mat4.identity(translateMatrix);
    mat4.translate(translateMatrix, translateMatrix, translateVec);

    let uniformLoc = gl.getUniformLocation(program, "transform");
    gl.uniformMatrix4fv(uniformLoc, false, translateMatrix);


    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
}

window.onload = () => {
    // 主流程
    prepare();
    webglPrepare();
    render();
}