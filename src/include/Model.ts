interface Geometry {
    object: string;
    groups: string[];
    material: string;
    data : {
        position: number[];
        texcoord: number[];
        normal: number[];
    };
}

export class Model {
    public geometries: Geometry[];
    public materialLibs: string[];

    constructor(path: string) {
        this.loadModel(path);
    }

    private loadModel(path: string): void {
        let data: string;
        fetch(path)
            .then(resp => resp.text())
            .then(text => data = text);
        this.processData(data);
    }

    private processData(data: string): void {
        // because indices are base 1 let's just fill in the 0th data
        const objPositions = [[0, 0, 0]];
        const objTexcoords = [[0, 0]];
        const objNormals = [[0, 0, 0]];

        // same order as `f` indices
        const objVertexData = [
            objPositions,
            objTexcoords,
            objNormals,
        ];

        // same order as `f` indices
        let webglVertexData: number[][] = [
            [],   // positions
            [],   // texcoords
            [],   // normals
        ];

        const geometries: Geometry[] = [];
        const materialLibs: string[] = [];
        let geometry: Geometry;
        let groups = ['default'];
        let object = 'default';
        let material = 'default';

        function newGeometry(): void {
            if (geometry && geometry.data.position.length) {
                geometry = undefined;
            }
        }

        function setGeometry(): void {
            if (!geometry) {
                const position: number[] = [];
                const texcoord: number[] = [];
                const normal: number[] = [];
                webglVertexData = [
                    position,
                    texcoord,
                    normal
                ];
                geometry = {
                    object,
                    groups,
                    material,
                    data: {
                        position,
                        texcoord,
                        normal
                    }
                };
                geometries.push(geometry);
            }
        }

        function addVertex(vert: string): void {
            const ptn = vert.split('/');
            ptn.forEach((objIndexStr, i) => {
                if (!objIndexStr) {
                    return;
                }
                const objIndex = parseInt(objIndexStr);
                const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
                webglVertexData[i].push(...objVertexData[i][index]);
            });
        }

        const keywords: { [key: string]: (parts: string[], unparsedArgs?: string) => void } = {
            v (parts: string[]): void {
                objPositions.push(parts.map(parseFloat));
            },
            vn (parts: string[]): void {
                objNormals.push(parts.map(parseFloat));
            },
            vt(parts: string[]): void {
                objTexcoords.push(parts.map(parseFloat));
            },
            f(parts: string[]): void {
                setGeometry();
                const numTriangles = parts.length - 2;
                for (let tri = 0; tri < numTriangles; ++tri) {
                    addVertex(parts[0]);
                    addVertex(parts[tri + 1]);
                    addVertex(parts[tri + 2]);
                }
            },
            usemtl(parts: string[], unparsedArgs: string): void {
                material = unparsedArgs;
                newGeometry();
            },
            mtllib(parts: string[], unparsedArgs: string): void {
                materialLibs.push(unparsedArgs);
            },
            o(parts: string[], unparsedArgs: string): void {
                object = unparsedArgs;
                newGeometry();
            },
            g(parts: string[]): void {
                groups = parts;
                newGeometry();
            },
            s(parts: string[], unparsedArgs: string): void {
                console.log('not supported\n', parts, unparsedArgs);
            }
        };

        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
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
            console.log(unparsedArgs);
            handler(parts);
        }
        
        this.geometries = geometries;
        this.materialLibs = materialLibs;
    }
}