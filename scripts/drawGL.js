/**
 * Created by psd on 2017/5/11.
 */
function initWebGL(canvas){//初始化context
    var gl=null;
    try{
        gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');//experimental-webgl
    }catch(e){
        alert(e.toString());
    }
    return gl;
}
function initViewPort(gl,canvas){//初始化视口
    gl.viewport(0,0,800,600); //视口变大
}
//投影矩阵 摄像机 ，模型矩阵 立方体
var projectionMatrix,modelViewMatrix;
var rotateAxis;
function initMartics(canvas){//初始化矩阵
    modelViewMatrix=mat4.create(); //通过 mat4 来创建 正方体模型
    mat4.translate(modelViewMatrix,modelViewMatrix,[0,0,-12]);//-3.33 向里 移动 立方体
    projectionMatrix=mat4.create();
    mat4.perspective(projectionMatrix,Math.PI/4,2/1,
    1,1000);//投影矩阵，视角，y/x，近裁切面，远裁切面 视角越大 物体越远4/3 1/2 视口 和 长宽 要一致
    //创建3
    rotateAxis=vec3.create();
    //roteAxis = vec3.create();
    vec3.normalize(rotateAxis,[1,0,0]);//创建 y轴的向量
}
function createSquare(gl){
    var vertexBuffer=gl.createBuffer();//顶点缓冲
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);//顶点缓冲按照数组与画笔绑定
    var verts=[
        0.5,0.5,0.0,
        -0.5,0.5,0.0,
        0.5,-0.5,0.0,
        -0.5,-0.5,0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
    var square={buffer:vertexBuffer,vertSize:3,nVerts:4,primtype:gl.TRIANGLE_STRIP};
    return square;
}
//建立立方体
function createCube(gl){
    var vertexBuffer=gl.createBuffer();//顶点缓冲
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); //gl绑定 缓存
    var verts=[ //表明点
        //前面
        -1.0,-1.0,1.0,//0
        1.0,-1.0,1.0,//1
        1.0,1.0,1.0,//2
        -1.0,1.0,1.0,//3
        //背面
        -1.0,-1.0,-1.0,//4
        -1.0,1.0,-1.0,//5
        1.0,1.0,-1.0,//6
        1.0,-1.0,-1.0,//7
        //顶面
        -1.0,1.0,-1.0,//8
        -1.0,1.0,1.0,//9
        1.0,1.0,1.0,//10
        1.0,1.0,-1.0,//11
        //底面
        -1.0,-1.0,-1.0,//12
        1.0,-1.0,-1.0,//13
        1.0,-1.0,1.0,//14
        -1.0,-1.0,1.0,//15
        //右侧
        1.0,-1.0,-1.0,//16
        1.0,1.0,-1.0,//17
        1.0,1.0,1.0,//18
        1.0,-1.0,1.0,//19
        //左侧
        -1.0,-1.0,-1.0,//20
        -1.0,-1.0,1.0,//21
        -1.0,1.0,1.0,//22
        -1.0,1.0,-1.0//23
    ];
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW)//加载一次一直有效 将点加载到内存中
    //顶点索引缓冲
    var verIndexBuffer=gl.createBuffer();// 创建顶点索引缓冲
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,verIndexBuffer);//gl 绑定 缓冲
    var verIndex=[ //声明 顶点 按照 顺序描述
        //前面
        0,1,2,0,2,3,
        //背面
        4,5,6,4,6,7,
        //顶面
        8,9,10,8,10,11,
        //底面
        12,13,14,12,14,15,
        //右面
        16,17,18,16,18,19,
        //左面
        20,21,22,20,22,23
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(verIndex),gl.STATIC_DRAW); //将 顶点缓冲放入内存
    //创建颜色缓冲
    var colorBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    var faceColor=[ //声明面的颜色
        [1.0,0.0,0.0,1.0],//前面 红
        [0.0,1.0,0.0,1.0],//背面 绿
        [0.0,0.0,1.0,1.0],//顶面 蓝
        [1.0,1.0,0.0,1.0],//底面 黄
        [1.0,0.0,1.0,1.0],//右面 字色
        [0.0,1.0,1.0,1.0]//左面 青色
    ];
    var verColor=[];//点的颜色 24个点
    for(var i=0;i<6;i++){
        var color=faceColor[i];
        for(var j=0;j<4;j++){
            verColor=verColor.concat(color);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verColor),gl.STATIC_DRAW);
    var cube={buffer:vertexBuffer,indices:verIndexBuffer,
        colorBuffer:colorBuffer,colorSize:4,nColors:24,
    vertSize:3,nVerts:24,nIndices:36,primtype:gl.TRIANGLES
    }; // 将 顶点缓冲 索引缓冲 颜色缓冲 一组多少个 共多少个  以 三角带的形式画 组成个对象 返回
    return cube;
}
//建立渲染器，画笔，glsl语言字符串，渲染器类型
function createShader(gl,str,type){
    var shader;
    if(type=="fragment"){//片元渲染器
        shader=gl.createShader(gl.FRAGMENT_SHADER);
    }else if(type=="vertex"){//点元渲染器
        shader=gl.createShader(gl.VERTEX_SHADER);
    }else{
        return null;
    }
    gl.shaderSource(shader,str);//加载语法源
    gl.compileShader(shader);//编译
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){//编译状态
        return null;
    }
    return shader;
}
//顶点渲染器
var vertexShaderSource="attribute vec3 vertexPos;\n"+  // 顶点着色器 attribute 修饰符声明由 浏览器 传输给顶点 着色器 的变量值
    "uniform mat4 modelViewMatrix;\n"+ // 声明 模型矩阵
        "uniform mat4 projectionMatrix;\n"+ //声明 摄影矩阵
        "attribute vec4 vertexColor;\n"+ //什么 点颜色
        "varying vec4 colors;\n"+//
        "void main(void){\n"+
    "gl_Position=projectionMatrix*modelViewMatrix*vec4(vertexPos,1.0);\n"+
        "colors=vertexColor;\n"+
        "}";
var fragmentShaderSource="precision mediump float;\n"+
        "varying vec4 colors;\n"+
    "void main(void){\n"+
        "gl_FragColor=colors;\n"+
        //"gl_FragColor=vec4(1.0,1.0,1.0,1.0);\n"+
        "}\n";
var shaderProgram; //gl 的渲染器程序
var shaderVertexPositionAttribute;
var shaderProjectionMatrixUniform;
var shaderModelViewMatrixUniform;
var shaderVertexColorAttribute;//顶点颜色属性
//初始化渲染器
function initShader(gl){
    var fragmentShader=createShader(gl,fragmentShaderSource,'fragment');//建 片元 渲染器 gl 片元slglstr flag
    var vertexShader=createShader(gl,vertexShaderSource,'vertex');//建立 点元 渲染器 gl 点元slglstr flag
    shaderProgram=gl.createProgram();//gl创建渲染器 程序
    gl.attachShader(shaderProgram,vertexShader); //gl的sp绑定vertexShader
    gl.attachShader(shaderProgram,fragmentShader);//gl的 sp 绑定 vertex Shader
    gl.linkProgram(shaderProgram); //将 sp 在 和gl 绑定 在一起
    shaderVertexPositionAttribute=gl.getAttribLocation(shaderProgram,'vertexPos');//获取顶点着色器
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);//开启顶点着色器
    shaderProjectionMatrixUniform=gl.getUniformLocation(shaderProgram,'projectionMatrix'); // 获取 模型矩阵 和 摄影矩阵 从 sp
    shaderModelViewMatrixUniform=gl.getUniformLocation(shaderProgram,'modelViewMatrix');
    shaderVertexColorAttribute=gl.getAttribLocation(shaderProgram,'vertexColor'); //从 sp 获取点色属性
    gl.enableVertexAttribArray(shaderVertexColorAttribute);// gl 开启 点色
    if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){
        return;
    }
}
function animate(){
    var angle=Math.PI/100;
    //console.log(rotateAxis);//[0.57,0.57,0.57]0
//:
//    0.5773502588272095
//    1
//:
//    0.5773502588272095
//    2
//:
//    0.5773502588272095
    mat4.rotate(modelViewMatrix,modelViewMatrix,angle,rotateAxis); //开启 旋转动画 模型矩阵  单位时间旋转角度 法向量(旋转轴)
}
function rotCube(gl,cube){
    requestAnimationFrame(function(){ //请求动画帧  定时器 递归
        rotCube(gl,cube);
    })
    draw(gl,cube); //画图形
    animate();//开启动画
}
function draw(gl,obj){
    gl.clearColor(0.0,0.0,0.0,1.0); //动画开始前 清理 上次 颜色
    gl.clear(gl.COLOR_BUFFER_BIT); //
    gl.enable(gl.DEPTH_TEST);//depth_text 开启深度检查
    gl.useProgram(shaderProgram);//使用渲染程序
    gl.bindBuffer(gl.ARRAY_BUFFER,obj.buffer);//绑定 正方体点缓冲区
    gl.vertexAttribPointer(shaderVertexPositionAttribute,obj.vertSize,gl.FLOAT,false,0,0);//给点着色器数据
    gl.bindBuffer(gl.ARRAY_BUFFER,obj.colorBuffer);//绑定颜色的缓冲区
    gl.vertexAttribPointer(shaderVertexColorAttribute,obj.colorSize,gl.FLOAT,false,0,0);//给定那颜色值大小

    gl.uniformMatrix4fv(shaderProjectionMatrixUniform,false,projectionMatrix);// 将 spMU 变量 和 pM 联系在一起
    gl.uniformMatrix4fv(shaderModelViewMatrixUniform,false,modelViewMatrix);//将 sMVMU 变量 和 mVM 联系在一起
    //gl.drawArrays(obj.primtype,0,obj.nVerts);
    gl.drawElements(obj.primtype,obj.nIndices,gl.UNSIGNED_SHORT,0); //基本图元 和 顶点索引
}
$(document).ready(
    function(){
        var canvas=document.getElementById("webgl");
        var gl=initWebGL(canvas); //获取gl
        initViewPort(gl,canvas);//初始化视口
        initMartics(canvas);//初始化 模型矩阵 和 摄影矩阵
        //var square = createSquare(gl);
        var cube=createCube(gl); //创建多维数据(告诉计算机怎么绘制立方体)
        initShader(gl);//初始化片元渲染器 和 点元渲染器
        //draw(gl,square);
        //draw(gl,cube);
        rotCube(gl,cube); //开启绘制和动画
    }
)