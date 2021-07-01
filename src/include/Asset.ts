import { gltfStructure } from "./gltf";
import { gl } from "./GL";

export class Asset {
    private source: string;
    private structure: gltfStructure;
    private buffers: ArrayBuffer[] = [];
    private loaded = false;

    private VAOs: WebGLVertexArrayObject[] = [];

    constructor(source: string) {
        this.source = source;
        this.readJson();
    }

    public isReady(): boolean {
        return this.loaded;
    }

    public draw(): void {
        for (const mesh of this.structure.meshes) {
            let i = 0;
            for (const primitive of mesh.primitives) {
                gl.bindVertexArray(this.VAOs[i]);
                gl.drawElements(gl.TRIANGLES, this.structure.accessors[primitive.indices].count, this.structure.accessors[primitive.indices].componentType, 0);
                gl.bindVertexArray(undefined);
                i++;
            }
        }
    }

    private readJson(): void{
        fetch(this.source)
        .then(resp => resp.json())
        .then(body => {
            this.structure = body;
            this.loadBuffers().then(() => {
                this.setGlBindings();
                this.loaded = true;
            });
        });
    }

    /**
     * skipping straight to meshes for now insted of nodes
     * and only using pos and normal attributes
     */
    private setGlBindings(): void {
        console.log(this.buffers.keys);
        for (const mesh of this.structure.meshes) {
            for (const primitive of mesh.primitives) {
                const positionAccessor = this.structure.accessors[primitive.attributes.POSITION];
                const normalAccessor = this.structure.accessors[primitive.attributes.NORMAL];
                const texAccessor = this.structure.accessors[primitive.attributes.TEXCOORD_0];
                const indexAccessor = this.structure.accessors[primitive.indices];

                const VAO = gl.createVertexArray();
                const VBO = gl.createBuffer();
                const EBO = gl.createBuffer();

                gl.bindVertexArray(VAO);
                gl.bindBuffer(gl.ARRAY_BUFFER, VBO);

                // need to decide how to handle bufferdata so it is maybe not sent many times to the GPU
                const posBuffer = new Float32Array(this.buffers[0], this.structure.bufferViews[positionAccessor.bufferView].byteOffset, positionAccessor.count * 3);
                /* const normalBuffer = new Float32Array(this.buffers[0], normalAccessor.byteOffset, normalAccessor.count);
                const bufferData = new Float32Array(posBuffer.length + normalBuffer.length);
                bufferData.set(posBuffer);
                bufferData.set(normalBuffer, posBuffer.length); */
                gl.bufferData(gl.ARRAY_BUFFER, posBuffer, gl.STATIC_DRAW);

                const indexBuffer = new Uint16Array(this.buffers[0], this.structure.bufferViews[indexAccessor.bufferView].byteOffset, indexAccessor.count);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);

                gl.enableVertexAttribArray(0);
                gl.vertexAttribPointer(0, 3, positionAccessor.componentType, false, 0, this.structure.bufferViews[positionAccessor.bufferView].byteOffset);

                /* gl.enableVertexAttribArray(1);
                gl.vertexAttribPointer(1, 3, normalAccessor.componentType, false, 0, this.structure.bufferViews[normalAccessor.bufferView].byteOffset);

                gl.enableVertexAttribArray(1);
                gl.vertexAttribPointer(1, 2, texAccessor.componentType, false, 0, this.structure.bufferViews[texAccessor.bufferView].byteOffset); */

                gl.bindVertexArray(undefined);
                this.VAOs.push(VAO);
            }
        }
    }

    private async loadBuffers(): Promise<void> {
        for (const buffer of this.structure.buffers) {
            const newBuffer = new ArrayBuffer(buffer.byteLength);
            
            if (buffer.uri.includes('data:application/octet-stream;base64')) {
                this.decodeBase64(buffer.uri.split(',')[1], newBuffer);
                this.buffers.push(newBuffer);
                continue;
            }
            
            if (buffer.uri.includes('.bin')) {
                const newBuffer = await this.readBinary(buffer.uri);
                console.log(newBuffer);
                this.buffers.push(newBuffer);
            }
        }
    }

    // decoded data is little endian, so needs to be accounted for when changing from 8bit to 16bit
    private decodeBase64(data: string, buffer: ArrayBuffer): void {
        const binaryString = atob(data);
        console.log(binaryString.length);
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
    }

    private async readBinary(uri: string): Promise<ArrayBuffer> {
        return fetch('resources/' + uri)
        .then(resp => resp.arrayBuffer());
    }
}