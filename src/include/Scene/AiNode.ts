import { Mesh } from "./Mesh";
import { Skin } from "./Skin";

export interface AiNode {
    name?: string;
    children?: number[];
    matrix?: number[];
    translation?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    mesh?: Mesh;
    skin?: Skin;
}