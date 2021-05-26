import { GLUtilities, gl } from './GL';

export class Engine {
    private canvas: HTMLCanvasElement | null;


    public constructor() {
        this.canvas = null;
    }

    public start(): void {
        this.canvas = GLUtilities.initialize();
        this.resize();
        gl.clearColor(0,0,0,1);

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

        requestAnimationFrame(this.loop.bind( this ));
    }
}