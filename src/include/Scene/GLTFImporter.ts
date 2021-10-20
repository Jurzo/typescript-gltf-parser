import { Mesh } from "./Mesh";
import { gltfStructure } from "../util/gltf";
import { AiNode, Skin } from "./AiNode";
import { loadModel } from "./GLTFLoader";
import { Asset } from "./Asset";
import { gl } from "../util/GL";

export class GLTFImporter {
    private gltf: gltfStructure;
    private buffers: ArrayBuffer[];

    private skins: Skin[];

    /**
     * 
     * @param scene 
     * @param URI 
     * @returns - a promise with the value true when the asset is loaded and added to the scene object
     */
    public async importModel(URI: string): Promise<Asset> {
        const data = await loadModel(URI);
        this.gltf = data.gltf;
        this.buffers = data.buffers;

        const roots = this.gltf.scenes[0].nodes;
        this.skins = [];
        const nodes: AiNode[] = [];
        for (let i = 0; i < this.gltf.nodes.length; i++) {
            nodes.push(this.parseNode(i));
        }
        return new Asset(roots, nodes, this.skins);
    }

    private parseNode(nodeID: number): AiNode {
        const currentNode = this.gltf.nodes[nodeID];
        const name = currentNode.name;
        const childIDs = currentNode.children;
        const meshID = currentNode.mesh;
        const skinID = currentNode.skin;
        const matrix = currentNode.matrix;
        const translation = currentNode.translation;
        const rotation = currentNode.rotation;
        const scale = currentNode.scale;

        // do stuff if node properties are not undefined
        const aiNode: AiNode = {
            ...(name !== undefined) && { name: name },
            ...(childIDs !== undefined) && { children: childIDs },
            ...(matrix !== undefined) && { matrix: matrix },
            ...(translation !== undefined) && { translation: translation },
            ...(rotation !== undefined) && { rotation: rotation },
            ...(scale !== undefined) && { scale: scale },
            ...(meshID !== undefined) && { mesh: this.parseMesh(meshID) },
            ...(skinID !== undefined) && { skin: this.parseSkin(skinID) }
        }
        return aiNode;
    }

    private parseMesh(meshID: number): Mesh {
        const primitives = this.gltf.meshes[meshID].primitives.map(primitive => {
            const positionAccessorID = primitive.attributes.POSITION;
            const normalAccessorID = primitive.attributes.NORMAL;
            const texCoordAccessorID = primitive.attributes.TEXCOORD_0;
            const jointsAccessorID = primitive.attributes.JOINTS_0;
            const weightsAccessorID = primitive.attributes.WEIGHTS_0;

            const attributeAccessors = [
                this.gltf.accessors[positionAccessorID],
                this.gltf.accessors[normalAccessorID],
                ...(texCoordAccessorID !== undefined ? [this.gltf.accessors[texCoordAccessorID]] : []),
                ...(jointsAccessorID !== undefined ? [this.gltf.accessors[jointsAccessorID]] : []),
                ...(weightsAccessorID !== undefined ? [this.gltf.accessors[weightsAccessorID]] : [])
            ];

            // get buffers, byteOffsets and byteStrides for vertex attributes
            const vertexData = attributeAccessors.map(accessor => {
                if (!accessor) return null; // why was this here?
                const bufferView = this.gltf.bufferViews[accessor.bufferView];
                const bufferIndex = bufferView.buffer;
                const byteOffset = bufferView.byteOffset + (accessor.byteOffset || 0);
                const byteStride = bufferView.byteStride || 0;
                const componentType = accessor.componentType;
                const type = accessor.type;
                const count = accessor.count;
                const buffer = readBuffer(
                    this.buffers[bufferIndex],
                    type,
                    componentType,
                    count,
                    byteOffset,
                    byteStride
                    );

                return {
                    buffer,
                    componentType,
                    type
                };
            });

            // Index
            const accessor = this.gltf.accessors[primitive.indices];
            const bufferView = this.gltf.bufferViews[accessor.bufferView];
            const bufferIndex = bufferView.buffer;
            const byteOffset = bufferView.byteOffset + (accessor.byteOffset || 0);
            const byteStride = bufferView.byteStride || 0;
            // for now parsing as if index won't have byte stride
            const indexBuffer = readBuffer(
                this.buffers[bufferIndex],
                accessor.type,
                accessor.componentType,
                accessor.count,
                byteOffset,
                byteStride
                );

            const VAO = generateVAO(vertexData, indexBuffer);

            return { VAO, elementCount: accessor.count };
        });

        return { primitives };
    }

    private parseSkin(skinID: number): AiNode['skin'] {
        const skinNode = this.gltf.skins[skinID];
        const accessor = this.gltf.accessors[skinNode.inverseBindMatrices];
        const bufferView = this.gltf.bufferViews[accessor.bufferView];
        const byteOffset = bufferView.byteOffset + (accessor.byteOffset || 0);
        const byteStride = bufferView.byteStride || 0;
        const count = accessor.count;
        const type = accessor.type;
        const compType = accessor.componentType;
        const ivbBuffer = readBuffer(
            this.buffers[bufferView.buffer],
            type,
            compType,
            count,
            byteOffset,
            byteStride
        )
        const skin = {
            name: skinNode.name || 'undefined',
            joints: skinNode.joints,
            inverseBindMatrices: ivbBuffer
        }
        this.skins.push(skin);
        return this.skins.length - 1;
    }
}

const readBuffer = (
    buffer: ArrayBuffer,
    type: string,
    componentType: number,
    elementCount: number,
    offset: number,
    stride: number,
): ArrayBuffer => {
    const elementSize = typeToCount[type];
    const elementByteSize = componentByteSize(componentType);
    const count = elementCount * elementSize;
    let newBuffer: Uint8Array | Uint16Array | Uint32Array;
    let dataView: Uint8Array | Uint16Array | Uint32Array;
    if (elementByteSize === 1) {
        newBuffer = new Uint8Array(count);
        dataView = new Uint8Array(buffer);
    } else if (elementByteSize === 2) {
        newBuffer = new Uint16Array(count);
        dataView = new Uint16Array(buffer);
    } else {
        newBuffer = new Uint32Array(count);
        dataView = new Uint32Array(buffer);
    }
    for (let i = 0; i < count; i += elementSize) {
        const index = offset / elementByteSize + (stride === 0 ? i : i * stride);
        for (let j = 0; j < elementSize; j++) {
            newBuffer[i + j] = dataView[index + j];
        }
    }
    return newBuffer.buffer;
}

const generateVAO = (
    vertexData: {
        buffer: ArrayBuffer,
        componentType: number,
        type: string
    }[],
    indexBuffer: ArrayBuffer
): WebGLVertexArrayObject => {
    const VAO = gl.createVertexArray();
    const EBO = gl.createBuffer();

    gl.bindVertexArray(VAO);

    vertexData.forEach((attribute, i) => {
        const VBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
        gl.enableVertexAttribArray(i);
        gl.bufferData(gl.ARRAY_BUFFER, attribute.buffer, gl.STATIC_DRAW);
        if (attribute.componentType === gl.UNSIGNED_BYTE)
            gl.vertexAttribIPointer(i, typeToCount[attribute.type], attribute.componentType, 0, 0);
        else
            gl.vertexAttribPointer(i, typeToCount[attribute.type], attribute.componentType, false, 0, 0);

    });

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);

    gl.bindVertexArray(undefined);
    return VAO;
}

const typeToCount: { [key: string]: number } = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT4: 16
}

const componentByteSize = (type: number): number => {
    if (type === gl.UNSIGNED_BYTE) return 1;
    if (type === gl.UNSIGNED_SHORT) return 2;
    if (type === gl.FLOAT) return 4;
    if (type === gl.INT) return 4;
    return -1;
}