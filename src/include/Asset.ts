import { gltfStructure } from "./gltf";

export class Asset {
    private source: string;
    private structure: gltfStructure;
    private buffers: ArrayBuffer[] = [];

    constructor(source: string) {
        this.source = source;
        this.readJson();
    }

    private readJson(): void{
        fetch(this.source)
        .then(resp => resp.json())
        .then(body => {
            this.structure = body;
            this.loadBuffers();
            console.log(this.buffers);
        });
    }

    private loadBuffers(): void {
        for (const buffer of this.structure.buffers) {
            const newBuffer = new ArrayBuffer(buffer.byteLength);
            
            if (buffer.uri.includes('data:application/octet-stream;base64')) {
                this.decodeBase64(buffer.uri.split(',')[1], newBuffer);
                this.buffers.push(newBuffer);
                continue;
            }
            
            if (buffer.uri.includes('.bin')) {
                this.readBinary(buffer.uri);
            }
        }
    }

    private decodeBase64(data: string, buffer: ArrayBuffer): void {
        const binaryString = atob(data);
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
    }

    private readBinary(uri: string): void {
        fetch('resources/' + uri)
        .then(resp => resp.arrayBuffer())
        .then(buffer => {
            this.buffers.push(buffer);
        });
    }
}