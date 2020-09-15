let gl: WebGLRenderingContext = null;
let canvas: HTMLCanvasElement = null;

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

function render() {
    // logic code
    
    requestAnimationFrame(render);
}

window.onload = () => {
    // 主流程
    prepare();
    render();
}