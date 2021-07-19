import { gltfStructure } from "./gltf";

const typeToCount: {[key: string]: number} = {
    'SCALAR': 1,
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'MAT3': 9,
    'MAT4': 16
};

/**
 * Change this class to gltfLoader and make it return a model-mesh object like in cpp project
 */

export class GLTFImporter {


    public static async loadModel(source: string): Promise<{scene: gltfStructure, buffer: ArrayBuffer}> {
        const scene = await GLTFImporter.readJson(source);
        const buffer = await this.loadBuffers(scene);

        return {scene, buffer};
    }

    private static async readJson(source: string): Promise<gltfStructure>{
        const resp = await fetch(source);
        const scene = resp.json();
        return scene;
    }

/* 
    private setGlBindings(): void {
        for (const mesh of this.structure.meshes) {
            for (const primitive of mesh.primitives) {
                const positionAccessor = this.structure.accessors[primitive.attributes.POSITION];
                const normalAccessor = this.structure.accessors[primitive.attributes.NORMAL];
                const texAccessor = this.structure.accessors[primitive.attributes.TEXCOORD_0];
                const indexAccessor = this.structure.accessors[primitive.indices];
                const buffer = this.buffers[this.structure.bufferViews[positionAccessor.bufferView].buffer];

                const VAO = gl.createVertexArray();
                const VBO = gl.createBuffer();
                const EBO = gl.createBuffer();

                gl.bindVertexArray(VAO);
                gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
                gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

                const indexByteOffset = this.structure.bufferViews[indexAccessor.bufferView].byteOffset + (indexAccessor.byteOffset || 0);
                const indexBuffer = new Uint16Array(buffer, indexByteOffset, indexAccessor.count);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);

                gl.enableVertexAttribArray(0);
                gl.vertexAttribPointer(0, 3, positionAccessor.componentType, false, 0, this.structure.bufferViews[positionAccessor.bufferView].byteOffset);

                gl.enableVertexAttribArray(1);
                gl.vertexAttribPointer(1, 3, normalAccessor.componentType, false, 0, this.structure.bufferViews[normalAccessor.bufferView].byteOffset);

                gl.enableVertexAttribArray(1);
                gl.vertexAttribPointer(1, 2, texAccessor.componentType, false, 0, this.structure.bufferViews[texAccessor.bufferView].byteOffset);

                gl.bindVertexArray(undefined);
                primitive.VAO = VAO;
            }
        }
    } */

    private static async loadBuffers(scene: gltfStructure): Promise<ArrayBuffer> {
        const buffers: ArrayBuffer[] = [];
        for (const buffer of scene.buffers) {
            const newBuffer = new ArrayBuffer(buffer.byteLength);
            
            if (buffer.uri.includes('data:application/octet-stream;base64')) {
                this.decodeBase64(buffer.uri.split(',')[1], newBuffer);
                buffers.push(newBuffer);
                continue;
            }
            
            if (buffer.uri.includes('.bin')) {
                const newBuffer = await this.readBinary(buffer.uri);
                buffers.push(newBuffer);
            }
        }
        // For now assuming only a single buffer is used per file
        // maybe concatenate them if multiple in the future?
        return buffers[0];
    }

    private static decodeBase64(data: string, buffer: ArrayBuffer): void {
        const binaryString = atob(data);
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
    }

    private static async readBinary(uri: string): Promise<ArrayBuffer> {
        const resp = await fetch('resources/' + uri);
        return await resp.arrayBuffer();
    }
}