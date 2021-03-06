import { GLTFImporter } from "../Asset/GLTFImporter";
import { Asset } from "../Asset/Asset";
import { gl, GLUtilities } from "../util/GL";
import { m4 } from "../util/Math";
import { Camera } from "./Camera";
import { Shader } from "./Shader";

export class Engine {
    private canvas: HTMLCanvasElement | null;
    private shader: Shader;
    private camera: Camera;
    private uniformLocations: WebGLUniformLocation[] = [];
    private asset: Asset;

    private lastFrame = 0;

    public constructor() {
        this.canvas = null;
        this.asset = null;
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
        this.camera = new Camera([0, 5, 5]);
        this.camera.setTarget([0, 0, 0]);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0,0,0,1);

        this.loadShaders();
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'model'));
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'view'));
        this.uniformLocations.push(gl.getUniformLocation(this.shader.getProgram(), 'projection'));

        const importer = new GLTFImporter();
        importer.importModel('resources/cubes-anim.gltf')
            .then(asset => {
                this.asset = asset;
                this.asset.setShader(this.shader);
                this.asset.scale = 0.5;
                //this.asset.rotation = {axis: [0, 1, 0], angle: 75};
                this.asset.calculateLocals();
                this.asset.jointMatrices();
            });

        this.resize();
        this.loop(0);
    }

    private loop(now: number): void {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const deltaTime = now - this.lastFrame;
        this.lastFrame = now;
        //console.log(deltaTime);

        this.shader.use();
        const projection = m4.perspective(this.camera.Zoom, this.canvas.width / this.canvas.height, 0.1, 100.0);
        const view = this.camera.getViewMatrix();
        //const model = m4.scale(m4.identity(), 0.5, 0.1, 0.5);
        const model = m4.identity();
        gl.uniformMatrix4fv(this.uniformLocations[0], false, model);
        gl.uniformMatrix4fv(this.uniformLocations[1], false, view);
        gl.uniformMatrix4fv(this.uniformLocations[2], false, projection);
        if (this.asset) {
            this.asset.animate(deltaTime);
            this.asset.calculateLocals();
            this.asset.render();
        }
        requestAnimationFrame(this.loop.bind( this ));
    }

    private loadShaders(): void {
        const vertexShaderSource = 
        `#version 300 es
        layout (location = 0) in vec3 aPos;
        layout (location = 1) in vec3 aNormal;
        layout (location = 2) in vec3 aTexCoord;

        uniform mat4 model;
        uniform mat4 local;
        uniform mat4 view;
        uniform mat4 projection;

        void main() {
            gl_Position = projection * view * model * vec4(aPos, 1.0);
        }`;

        const fragmentShaderSource = 
        `#version 300 es
        precision highp float;
        out vec4 fragColor;


        void main() {
            fragColor = vec4(1.0);    
        }`;

        this.shader = new Shader("basic", vertexShaderSource, fragmentShaderSource);
    }
}