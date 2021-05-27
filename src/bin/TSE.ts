import { GLUtilities, gl } from './gl/GL';
import { Shader } from './gl/Shader';

export class Engine {
    private canvas: HTMLCanvasElement | null;
    private shader: Shader;

    public constructor() {
        this.canvas = null;
    }

    public start(): void {
        this.canvas = GLUtilities.initialize();
        this.resize();
        gl.clearColor(0,0,0,1);
        this.loadShaders();

        this.loop();
    }

    public resize(): void {
        if ( this.canvas !== undefined ) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = innerHeight;
        }
    }

    private loop(): void {
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.shader.use();

        requestAnimationFrame(this.loop.bind( this ));
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