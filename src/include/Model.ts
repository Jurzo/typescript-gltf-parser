import { Texture, Mesh } from './Mesh';

export class Model {
    public textures_loaded: Texture[];
    public meshes: Mesh[];
    public directory: string;

    constructor(path: string) {
        this.loadModel(path);
    }

    private loadModel(path: string): void {
        //TODO
    }

}

function textureFromFile(path: string, directory: string, gamma = false) {
    //TODO
}