import 'gl-matrix';
import { mat4, vec3, vec4 } from 'gl-matrix';

let gl: WebGLRenderingContext = null;
let canvas: HTMLCanvasElement = null;
var elapsedTime: number = 0;
var lastRenderTime: number = 0;

// 准备WebGL的绘制上下文
function prepare() {
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.position = 'absolute';
    canvas.style.width = '' + canvas.width;
    canvas.style.height = '' + canvas.height;
    canvas.style.left = (window.innerWidth - canvas.width) / 2.0 + "px";
    canvas.style.top = (window.innerHeight - canvas.height) / 2.0 + "px";

    document.body.append(canvas);
    window.onresize = function(evt: Event) {
        canvas.style.left = (window.innerWidth - canvas.width) / 2.0 + "px";
        canvas.style.top = (window.innerHeight - canvas.height) / 2.0 + "px";
    };
    gl = canvas.getContext("webgl");
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
        400, 200, -2, 
        300, 300, -2, 
        500, 300, -2, 
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
"uniform mat4 projection;"+
"void main() {" +
    "gl_Position = projection * position;" +
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


    let projection:mat4 = mat4.create();
    mat4.ortho(projection, 0, 800, 600, 0, -100,100);
    let uniformLoc = gl.getUniformLocation(program, "projection");
    gl.uniformMatrix4fv(uniformLoc, false, projection);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
}

window.onload = () => {
    // 主流程
    prepare();
    webglPrepare();
    render();
}