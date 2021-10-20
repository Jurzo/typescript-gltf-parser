import { Mesh } from "./Mesh";

export interface AiNode {
    name?: string;
    children?: AiNode[];
    matrix?: number[];
    translation?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    mesh?: Mesh;
    skin?: {
        name: string;
        joints: number[];
        inverseBindMatrices: ArrayBuffer;
    }
}