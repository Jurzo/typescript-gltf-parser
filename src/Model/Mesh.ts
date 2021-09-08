import { gl } from '../include/util/GL';
import { Shader } from '../include/Shader';

export interface Texture {
    id: number,
    type: string,
    path: string
}

export interface VertexLayout {
    stride: number,
    posOffset: number,
    normalOffset: number,
    texCoordsOffset: number
}

export class Mesh {
    public VAO: WebGLVertexArrayObject;
    public vertices: ArrayBuffer;
    public indices: ArrayBuffer;
    public vertexLayout: VertexLayout;
    private VBO: WebGLBuffer;
    private EBO: WebGLBuffer;

    constructor(vertices: ArrayBuffer, indices: ArrayBuffer, vertexLayout: VertexLayout) {
        this.vertices = vertices;
        this.indices = indices;
        this.vertexLayout = vertexLayout;

        this.setupMesh();
    }

    public draw(shader: Shader, localMatrix: number[]): void {
        gl.uniformMatrix4fv(gl.getUniformLocation(shader.getProgram(), 'local'), false, localMatrix);
        gl.bindVertexArray(this.VAO);
        gl.drawElements(gl.TRIANGLES, this.indices.byteLength / 2, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(undefined);
    }

    private setupMesh(): void {
        this.VAO = gl.createVertexArray();
        this.VBO = gl.createBuffer();
        this.EBO = gl.createBuffer();

        gl.bindVertexArray(this.VAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        // bind vertex data
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // Set the vertex attribute pointers
        // pos
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, this.vertexLayout.stride, this.vertexLayout.posOffset);
        // normal
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, this.vertexLayout.stride, this.vertexLayout.normalOffset);
        // texCoord
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, this.vertexLayout.stride, this.vertexLayout.texCoordsOffset);

        gl.bindVertexArray(undefined);
    }
}