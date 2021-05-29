import { GLUtilities, gl } from './gl/GL';
import { Shader } from './gl/Shader';

export class Engine {
    private canvas: HTMLCanvasElement | null;
    private shader: Shader;

    private buffer: WebGLBuffer;
    private VAO: WebGLVertexArrayObject;

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
        this.loop();
    }

    private loop(): void {
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.shader.use();
        gl.bindVertexArray(this.VAO);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

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
        `attribute vec3 aPos;

        void main() {
            gl_Position = vec4(aPos, 1.0);    
        }`;

        const fragmentShaderSource = 
        `precision mediump float;

        void main() {
            gl_FragColor = vec4(1.0);    
        }`;

        this.shader = new Shader("basic", vertexShaderSource, fragmentShaderSource);
    }
}