import { GLTFImporter } from "./GLTFImporter";
import { gltfStructure } from "./util/gltf";
import { Mesh, VertexLayout } from "./Mesh";
import { m4 } from "./util/math";
import { Shader } from "./Shader";

export class Model {
    public meshData: Mesh[][] = [];
    public loaded = false;
    private scene: gltfStructure;
    private buffer: ArrayBuffer;

    constructor(source: string) {
        this.loadGLTF(source);
    }

    public draw(shader: Shader): void {
        for (const node of this.scene.scenes[this.scene.scene].nodes) {
            this.drawNode(node, shader, m4.identity());
        }
    }

    /** TODO:
     * Solution seems really inelegant right now in terms of passing
     * the shader to the draw function.
     */
    private drawNode(nodeId: number, shader: Shader, parentTransform: number[]): void {
        const node = this.scene.nodes[nodeId];
        const meshId = node.mesh;
        // local transformation matrix
        let localTransform = node.matrix || [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1    
        ];
        const translation = node.translation || [0, 0, -1];
        const rotation= node.rotation || [0, 0, 0, 0];
        const scale = node.scale || [1, 1, 1];

        localTransform = m4.translate(localTransform, ...translation);
        localTransform = m4.rotate(localTransform, rotation);
        localTransform = m4.scale(localTransform, ...scale);

        const transform = m4.multiply(parentTransform, localTransform);

        if (meshId !== undefined) {
            for (const mesh of this.meshData[meshId]) {
                mesh.draw(shader, localTransform);
            }
        }
        const children = node.children;
        if (children !== undefined) {
            for (const childNode of children) {
                this.drawNode(childNode, shader, transform);
            }
        }
    }

    private async loadGLTF(source: string): Promise<void> {
        const asset = await GLTFImporter.loadModel(source);
        this.scene = asset.scene;
        this.buffer = asset.buffer;

        for (const node of this.scene.scenes[this.scene.scene].nodes) {
            this.processNode(node);
        }
        this.loaded = true;
    }
    /**
     * process all the meshes and textures and store them in individual Mesh
     * objects. Maybe store the scene structure for accessing node transformations
     * and for drawing the meshes and skins while using said transformations
     */

    private processNode(node: number) {

        // process mesh in node if found
        const meshId = this.scene.nodes[node].mesh;
        if (meshId !== undefined) {
            this.processMesh(meshId);
        }
        // process child nodes recursively
        const children = this.scene.nodes[node].children || undefined;
        if (children !== undefined) {
            for (const childNode of children) {
                this.processNode(childNode);
            }
        }
    }

    private processMesh(meshId: number) {
        const mesh = this.scene.meshes[meshId];
        // process each primitive of the mesh seperately

        for (const primitive of mesh.primitives) {
            // getting vertex stride and offset data
            const posAccessor = this.scene.accessors[primitive.attributes.POSITION];
            const posBV = this.scene.bufferViews[posAccessor.bufferView];
            const normalAccessor = this.scene.accessors[primitive.attributes.NORMAL];
            const normalBV = this.scene.bufferViews[normalAccessor.bufferView];
            const texCoordAccessor = this.scene.accessors[primitive.attributes.TEXCOORD_0];
            const texCoordBV = this.scene.bufferViews[texCoordAccessor.bufferView];

            // Skipping materials for now
            // only need to check stride on one attribute as everything is in the same buffer
            const stride = posBV.byteStride || 0;
            const posOffset = (posAccessor.byteOffset || 0) + posBV.byteOffset;
            const normalOffset = (normalAccessor.byteOffset || 0) + normalBV.byteOffset - posOffset;
            const texCoordOffset = (texCoordAccessor.byteOffset || 0) + texCoordBV.byteOffset - posOffset;
            // For now assuming mesh only contains a single texture coordinate

            const vertexLayout: VertexLayout = {
                stride: stride,
                // set to zero because we are splitting the buffer at position starting point in the buffer
                posOffset: 0,
                normalOffset: normalOffset,
                texCoordsOffset: texCoordOffset
            }

            const byteSize = posBV.byteLength + normalBV.byteLength + texCoordBV.byteLength;
            const vertexBuffer = this.buffer.slice(posOffset, posOffset+byteSize);

            const indexAccessor = this.scene.accessors[primitive.indices];
            const indexBV = this.scene.bufferViews[indexAccessor.bufferView];
            const indexOffset = (indexAccessor.byteOffset || 0) + indexBV.byteOffset;

            const indexBuffer = this.buffer.slice(indexOffset, indexOffset+indexBV.byteLength);

            this.meshData[meshId] = [];
            this.meshData[meshId].push(new Mesh(vertexBuffer, indexBuffer, vertexLayout));
        }
    }

}