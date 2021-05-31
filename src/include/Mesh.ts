import * as glm from 'gl-matrix';
import * as gl from './GL';
import { Shader } from './Shader';

export interface Vertex {
    Position: glm.vec3;
    Normal: glm.vec3;
    TexCoords: glm.vec2;
    Tangent: glm.vec3;
    Bitangent: glm.vec3;
}

export interface Texture {
    id: number;
    type: string;
    path: string;
}

export class Mesh {
    public vertices: Vertex[];
    public indices: number[];
    public textures: Texture[];
    public VAO: number;

    constructor(vertices: Vertex[], indices: number[], textures: Texture[]) {
        this.vertices = vertices;
        this.indices = indices;
        this.textures = textures;

        this.setupMesh();
    }

    public draw(shader: Shader): void {
        //TODO
    }

    private setupMesh(): void {
        //TODO
    }
}