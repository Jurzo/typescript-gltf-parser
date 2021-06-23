

/* interface gltfStructure {
    asset: {
        generator: string,
        version: string
    },
    scene: number,
    scenes: {
            name: string,
            nodes: number[]
    }[],
    nodes: {
        name: string,
        children?: number[],
        mesh?: number,
        camera?: number,
        translation?: number[],
        rotation?: number[],
        scale?: number[],
        matrix?: number[]
    }[],
    cameras?: {
        name: string,
        type: string,
        perspective?: {
            aspectRatio: number,
            yfov: number,
            zfar: number,
            znear: number
        },
        orthographic?: {
            xmag: number,
            ymag: number,
            zfar: number,
            znear: number
        }
    }[],
} */

export class Scene {
    private source: string;
    private structure: any;
    private buffers: ArrayBuffer[];

    constructor(source: string) {
        this.source = source;
        this.readJson();
    }

    private readJson(): void{
        fetch(this.source)
        .then(resp => resp.json())
        .then(body => {
            this.structure = body;
            console.log(body);
            this.loadBuffers();
        });
    }

    private loadBuffers(): void {
        //
    }

    private readBinary(): void {
        // load binary files when referenced in json tree
    }
}