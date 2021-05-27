import { gl } from "./GL";

export class Shader {
    private name: string;
    private program: WebGLProgram;

    public constructor(name: string, vertexSource: string, fragmentSource: string) {
        this.name = name;
        const vertexShader = this.loadShader(vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = this.loadShader(fragmentSource, gl.FRAGMENT_SHADER);
        this.createProgram(vertexShader, fragmentShader);
    }

    public getName(): string {
        return this.name;
    }

    public use(): void {
        gl.useProgram(this.program);
    }

    private loadShader(source: string, shaderType: number): WebGLShader {
        const shader: WebGLShader = gl.createShader(shaderType);
        console.log(gl);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const error = gl.getShaderInfoLog(shader);
        if (error !== "") {
            throw new Error("Error compiling shader " + this.name + ":" + error);
        }
        return shader;
    }

    private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader){
        this.program = gl.createProgram();

        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);

        gl.linkProgram(this.program);
        const error = gl.getProgramInfoLog(this.program);
        if (error !== "") {
            throw new Error("Error linking shader " + this.name + ":" + error);
        }
    }
}