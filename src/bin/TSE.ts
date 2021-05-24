import { GLUtilities, gl } from './GL';

export class Engine {
    private _canvas: HTMLCanvasElement | null;


    public constructor() {
        this._canvas = null;
    }

    public start(): void {
        this._canvas = GLUtilities.initialize();

        gl.clearColor(0,0,0,1);

        this.loop();
    }

    private loop(): void {
        gl.clear(gl.COLOR_BUFFER_BIT);

        requestAnimationFrame(this.loop.bind( this ));
    }
}