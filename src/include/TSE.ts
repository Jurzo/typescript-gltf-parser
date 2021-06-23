import { GLUtilities, gl } from './GL';
import { Shader } from './Shader';
import { Model } from './Model';
import { m4, v3 } from './MathFunctions';
import { Camera } from './Camera';
import { Scene } from './Scene';

export class Engine {
    private canvas: HTMLCanvasElement | null;
    private shader: Shader;
    private camera: Camera;
    private uniformLocations: WebGLUniformLocation[] = [];

    private model: Model;
    private rot = 0.0;

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
        const scene = new Scene('resources/tree.gltf');

        this.canvas = GLUtilities.initialize();
        this.camera = new Camera([3.0, 3.0, 6.0]);
        this.camera.setTarget([0, 0, 0]);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0,0,0,1);
        this.loadShaders();
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'model'));
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'view'));
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'projection'));
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'color'));
        this.resize();
        this.model = new Model('resources/Chair.obj');
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
        let model = m4.identity();
        model = m4.quatRotation(v3.normalize([1.0, 0.8, 0.0]), this.rot);
        this.rot = (this.rot + 1) % 360;
        gl.uniformMatrix4fv(this.uniformLocations[0], false, model);
        gl.uniformMatrix4fv(this.uniformLocations[1], false, view);
        gl.uniformMatrix4fv(this.uniformLocations[2], false, projection);
        gl.uniform3fv(this.uniformLocations[3], [(Math.sin(now/1000)+1) / 2, (Math.cos(now/1000)+1) / 2, 1.0]);
        this.model.draw();
        requestAnimationFrame(this.loop.bind( this ));
    }

    private loadShaders(): void {
        const vertexShaderSource = 
        `#version 300 es
        layout (location = 0) in vec3 aPos;
        layout (location = 1) in vec2 aTexCoord;
        layout (location = 2) in vec3 aNormal;

        out vec3 OurColor;
        out vec2 TexCoord;

        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;
        uniform vec3 color;

        void main() {
            gl_Position = projection * view * model * vec4(aPos, 1.0);
            TexCoord = aTexCoord;
            OurColor = color;
        }`;

        const fragmentShaderSource = 
        `#version 300 es
        precision highp float;
        out vec4 fragColor;

        in vec3 OurColor;
        in vec2 TexCoord;

        void main() {
            fragColor = vec4(OurColor, 1.0);    
        }`;

        this.shader = new Shader("basic", vertexShaderSource, fragmentShaderSource);
    }
}
