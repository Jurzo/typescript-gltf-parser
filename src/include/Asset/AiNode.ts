import { Mesh } from "./Mesh";

// change children to list of indices and make asset contain a list of nodes and references to root indices.
export interface AiNode  {
    name?: string;
    children?: number[];
    matrix?: number[];
    translation?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    mesh?: Mesh;
    skin?: number;
    localTransform?: number[];
    [vector: string]: string | number[] | Mesh | number;
}

export interface Skin {
    name: string;
    joints: number[];
    inverseBindMatrices: ArrayBuffer;
    jointMatrices?: number[][];
}