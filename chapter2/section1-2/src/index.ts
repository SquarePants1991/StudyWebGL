let gl: WebGLRenderingContext = null;
let canvas: HTMLCanvasElement = null;
let lastRenderTime: number = 0;
let elapsedTime: number = 0;

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
        -0.5, -0.5, 0, 1, 0, 0,// 左下角
        0.5, -0.5, 0, 0, 1, 0,// 右下角
        0, 0.5, 0, 0, 0, 1,// 中上
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
"uniform float elapsedTime;"+
"void main() {" +
    "float rad = radians(elapsedTime / 1000.0 * 30.0);" +
    "float x = position.x * cos(rad) - position.y * sin(rad);" +
    "float y = position.x * sin(rad) + position.y * cos(rad);" +
    "gl_Position = vec4(x, y, position.z, position.w);" +
    "frag_color = color;" +
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

function rotatePoint(x: number, y: number, degree: number) {
    let rad = degree / 180 * Math.PI;
    let newX = x * Math.cos(rad) - y * Math.sin(rad);
    let newY = x * Math.sin(rad) + y * Math.cos(rad);
    return {
        x: newX,
        y: newY
    };
}

function render() {
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0.2, 1, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    let now = (new Date()).getTime();
    let delta = now - lastRenderTime;
    lastRenderTime = now;
    elapsedTime += delta;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexData);
    let positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 4 * 6, 0);

    let colorLoc = gl.getAttribLocation(program, 'color');
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 4 * 6, 4 * 3);

    let elapsedTimeLoc = gl.getUniformLocation(program, "elapsedTime");
    gl.uniform1f(elapsedTimeLoc, elapsedTime);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
}

window.onload = () => {
    // 主流程
    prepare();
    webglPrepare();
    lastRenderTime = (new Date()).getTime();
    render();
}