import { gl } from './GL';

export class Mesh {
    public VAO: WebGLVertexArrayObject;
    public vertices: number[];
    public indices: number[];
    private VBO: WebGLBuffer;
    private EBO: WebGLBuffer;

    constructor(vertices: number[], indices: number[]) {
        this.vertices = vertices;
        this.indices = indices;
        console.log(vertices, indices);

        this.setupMesh();
    }

    public draw(): void {
        gl.bindVertexArray(this.VAO);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(undefined);
    }

    private setupMesh(): void {
        this.VAO = gl.createVertexArray();
        this.VBO = gl.createBuffer();
        this.EBO = gl.createBuffer();

        gl.bindVertexArray(this.VAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        // bind vertex data
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        // Set the vertex attribute pointers
        // pos
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
        // texCoord
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);
        // normal
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 20);

        gl.bindVertexArray(undefined);
    }
}