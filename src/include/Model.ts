import { GLTFImporter } from "./GLTFImporter";
import { gltfStructure } from "./gltf";
import { Mesh, VertexLayout } from "./Mesh";

export class Model {
    public meshData: Mesh[][] = [];
    public loaded = false;
    private scene: gltfStructure;
    private buffer: ArrayBuffer;

    constructor(source: string) {
        this.loadGLTF(source);


    }

    public draw(): void {
        for (const node of this.scene.scenes[this.scene.scene].nodes) {
            this.drawNode(node);
        }
    }

    /** TODO:
     * Draw function takes into account node transformations
     ** Need to somehow tie the primitive/mesh that is generated to a node to make use of node properties
     ** Should be done using a transformation matrix that is passed down the chain
     ** Make sure to pass a copy and not reference to matrix
     * Draw function takes in a reference to the shader that will be used for rendering
     */
    private drawNode(node: number): void {
        const meshId = this.scene.nodes[node].mesh;
        if (meshId !== undefined) {
            for (const mesh of this.meshData[meshId]) {
                mesh.draw();
            }
        }
        const children = this.scene.nodes[node].children;
        if (children !== undefined) {
            for (const childNode of children) {
                this.drawNode(childNode);
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
        console.log(this.meshData);
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