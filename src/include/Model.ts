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

    private processNode() {
        
    }

}