import { Scene, checkLoaded } from "../Scene/Scene";
import { gl, GLUtilities } from "../util/GL";
import { m4 } from "../util/math";
import { Camera } from "./Camera";
import { Shader } from "./Shader";

export class Engine {
    private canvas: HTMLCanvasElement | null;
    private shader: Shader;
    private camera: Camera;
    private uniformLocations: WebGLUniformLocation[] = [];
    private scene: Scene;

    private lastFrame = 0;

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
        this.camera = new Camera([0, 3, 3]);
        this.camera.setTarget([0, 0, 0]);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0,0,0,1);
        this.loadShaders();
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'model'));
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'view'));
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'projection'));
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'color'));
        this.resize();
        this.loop(0);
    }

    private loop(now: number): void {
        gl.clear(gl.COLOR_BUFFER_BIT);

        const deltaTime = now - this.lastFrame;
        this.lastFrame = now;
        //console.log(deltaTime);

        this.shader.use();
        const projection = m4.perspective(this.camera.Zoom, this.canvas.width / this.canvas.height, 0.1, 100.0);
        const view = this.camera.getViewMatrix();
        const model = m4.identity();
        gl.uniformMatrix4fv(this.uniformLocations[0], false, model);
        gl.uniformMatrix4fv(this.uniformLocations[1], false, view);
        gl.uniformMatrix4fv(this.uniformLocations[2], false, projection);
        gl.uniform3fv(this.uniformLocations[3], [(Math.sin(now/1000)+1) / 2, (Math.cos(now/1000)+1) / 2, 1.0]);
        if (checkLoaded(this.scene)) {
            // render
        }
        requestAnimationFrame(this.loop.bind( this ));
    }

    private loadShaders(): void {
        const vertexShaderSource = 
        `#version 300 es
        layout (location = 0) in vec3 aPos;
        layout (location = 1) in vec3 aNormal;
        layout (location = 2) in vec3 aTexCoord;

        out vec3 OurColor;

        uniform mat4 model;
        uniform mat4 local;
        uniform mat4 view;
        uniform mat4 projection;
        uniform vec3 color;

        void main() {
            gl_Position = projection * view * model * local * vec4(aPos, 1.0);
            OurColor = color;
        }`;

        const fragmentShaderSource = 
        `#version 300 es
        precision highp float;
        out vec4 fragColor;

        in vec3 OurColor;

        void main() {
            fragColor = vec4(OurColor, 1.0);    
        }`;

        this.shader = new Shader("basic", vertexShaderSource, fragmentShaderSource);
    }
}