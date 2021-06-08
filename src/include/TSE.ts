import { GLUtilities, gl } from './GL';
import { Shader } from './Shader';
import * as glm from 'gl-matrix';
import { Model } from './Model';

export class Engine {
    private canvas: HTMLCanvasElement | null;
    private shader: Shader;

    private buffer: WebGLBuffer;
    private VAO: WebGLVertexArrayObject;
    private model: Model;

    public constructor() {
        this.canvas = null;
    }

    public resize(): void {
        if ( this.canvas !== undefined ) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.canvas.width = width;
            this.canvas.height = height;

            gl.viewport(0, 0, width, height);
        }
    }

    public start(): void {
        this.canvas = GLUtilities.initialize();
        gl.clearColor(0,0,0,1);
        this.loadShaders();
        this.createBuffer();
        this.resize();
        this.model = new Model('resources/cube.obj');
        this.loop();
    }

    private loop(): void {
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.shader.use();
        this.model.draw();
        requestAnimationFrame(this.loop.bind( this ));
    }

    private createBuffer(): void {
        this.buffer = gl.createBuffer();
        this.VAO = gl.createVertexArray();
        const verts = [
            // x, y, z
            0.0, 0.0, 0.0,     // bottom left
            0.0, 1.0, 0.0,   // top left
            1.0, 1.0, 0.0  // top right
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
        gl.bindVertexArray(this.VAO);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        gl.bindVertexArray(undefined);
        gl.bindBuffer(gl.ARRAY_BUFFER, undefined);
    }

    private loadShaders(): void {
        const vertexShaderSource = 
        `#version 300 es
        layout (location = 0) in vec3 aPos;
        layout (location = 1) in vec2 aTexCoord;
        layout (location = 2) in vec3 aNormal;

        out vec2 TexCoord;

        void main() {
            gl_Position = vec4(aPos, 1.0);
            TexCoord = aTexCoord;  
        }`;

        const fragmentShaderSource = 
        `#version 300 es
        precision highp float;
        out vec4 fragColor;

        in vec2 TexCoord;

        void main() {
            fragColor = vec4(TexCoord, 1.0, 1.0);    
        }`;

        this.shader = new Shader("basic", vertexShaderSource, fragmentShaderSource);
    }
}