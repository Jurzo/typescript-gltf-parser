import { GLTFImporter } from "./GLTFImporter";
import { Mesh } from "./Mesh";

export class Model {
    public meshes: Mesh[];
    public loaded = false;

    constructor(source: string) {
        this.loadGLTF(source);


    }

    private async loadGLTF(source: string): Promise<void> {
        const asset = await GLTFImporter.loadModel(source);
        

    }
    /**
     * process all the meshes and textures and store them in individual Mesh
     * objects. Maybe store the scene structure for accessing node transformations
     * and for drawing the meshes and skins while using said transformations
     */

    private processNode() {

    }

}