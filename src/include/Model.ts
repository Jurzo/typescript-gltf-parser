import * as twgl from 'twgl.js';
import { gl } from './GL';
import { Mesh } from './Mesh';

interface Geometry {
    object: string;
    groups: string[];
    material: string;
    data: {
        position: number[];
        texcoord: number[];
        normal: number[];
    };
}


export class Model {
    private meshes: Mesh[];
    private loaded = false;

    constructor(path: string) {
        this.loadModel(path);
    }

    public draw(): void {
        if (this.loaded)
            this.meshes.forEach(mesh => mesh.draw());
    }

    private loadModel(path: string): void {
        fetch(path)
            .then(resp => resp.text())
            .then(text => {
                this.processData(text);
                this.loaded = true;
            });
    }

    /*
    ** For each mesh
    First read all vertex data (pos, norm, texCoord) into a list each.
    Then read faces and based on face data create an object with the key being
    the vertex data for the current vertex (pos, norm, texCoord).
    Keep count of the current index and add it to indices-list for each vertex of a face.
    If the current vertex is not found in the map, increment the index and add it
    to the map.

    ** Splitting model to meshes
    Whenever a new material, object or group is encountered when reading the obj file,
    create a new mesh. A mesh holds data of its vertices, indices and textures as well
    as its buffers.
    */
    private processData(data: string): void {
        const meshes: Mesh[] = [];
        // because indices are base 1 let's just fill in the 0th data
        const objPositions = [[0, 0, 0]];
        const objTexcoords = [[0, 0]];
        const objNormals = [[0, 0, 0]];

        // used to identify and discard duplicate vertices while parsing
        // key is vertex data, value is index
        let vertMap: Map<string, number>;
        let vertices: number[];
        let indices: number[];
        let currentIndex = 0;

        const materialLibs: string[] = [];
        let groups = ['default'];
        let object = 'default';
        let material = 'default';

        function newMesh(): void {
            if (indices && indices.length > 0) {
                meshes.push(new Mesh(vertices, indices));
            }

            vertMap = new Map<string, number>();
            vertices = [];
            indices = [];
            currentIndex = 0;
        }

        // Assumes data that has pos, norm, tex
        function addVertex(vert: string): void {
            const points = vert.split('/');
            const vertex = [
                ...objPositions[parseInt(points[0])],
                ...objTexcoords[parseInt(points[1])],
                ...objNormals[parseInt(points[2])]
            ];
            const key = vertex.map(point => point.toString()).join('');
            if (vertMap.has(key)) {
                indices.push(vertMap.get(key));
            } else {
                vertMap.set(key, currentIndex);
                vertices.push(...vertex);
                indices.push(currentIndex);
                currentIndex++;
            }
        }

        const keywords: { [key: string]: (parts: string[], unparsedArgs?: string) => void } = {
            v(parts: string[]): void {
                objPositions.push(parts.map(parseFloat));
            },
            vn(parts: string[]): void {
                objNormals.push(parts.map(parseFloat));
            },
            vt(parts: string[]): void {
                objTexcoords.push(parts.map(parseFloat));
            },
            f(parts: string[]): void {
                const numTriangles = parts.length - 2;
                for (let tri = 0; tri < numTriangles; ++tri) {
                    addVertex(parts[0]);
                    addVertex(parts[tri + 1]);
                    addVertex(parts[tri + 2]);
                }
            },
            usemtl(parts: string[], unparsedArgs: string): void {
                material = unparsedArgs;
                newMesh();
            },
            mtllib(parts: string[], unparsedArgs: string): void {
                materialLibs.push(unparsedArgs);
            },
            o(parts: string[], unparsedArgs: string): void {
                object = unparsedArgs;
                newMesh();
            },
            g(parts: string[]): void {
                groups = parts;
                newMesh();
            },
            s(parts: string[], unparsedArgs: string): void {
                console.log('not supported\n', parts, unparsedArgs);
            }
        };

        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            const m = keywordRE.exec(line);
            if (!m) continue;

            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            const handler = keywords[keyword];
            if (!handler) {
                console.warn('unhandled keyword:', keyword, 'at line', i + 1);
            }
            
            handler(parts, unparsedArgs);
        }

        meshes.push(new Mesh(vertices, indices));
        this.meshes = meshes;
    }

}