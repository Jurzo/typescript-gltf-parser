import { Shader } from "../TSE/Shader";
import { gl } from "../util/GL";
import { m4 } from "../util/math";
import { AiNode, Skin } from "./AiNode";
import { Mesh } from "./Mesh";
import { Animation } from "./Animation";

export class Asset {
    public location: number[]
    public rotation: {
        axis: number[],
        angle: number
    }
    public scale: number;

    private shader: Shader;
    private roots: number[];
    private nodes: AiNode[];
    private skins: Skin[];
    private animations: Animation[];

    constructor(roots: number[], nodes: AiNode[], skins: Skin[]) {
        this.roots = roots;
        this.nodes = nodes;
        this.skins = skins;
        this.location = [0, 0, 0];
        this.rotation = {
            axis: [0, 1, 0],
            angle: 0 
        };
        this.scale = 1;
        this.calculateLocals();
    }

    public setShader(shader: Shader): void {
        this.shader = shader;
    }

    public render(): void {
        for (const root of this.roots) {
            this.renderNode(root);
        }
    }

    public calculateLocals(): void  {
        let rootTransform = m4.identity();
        rootTransform = m4.translate(rootTransform, this.location[0], this.location[1], this.location[2]);
        rootTransform = m4.rotateByAngle(rootTransform, this.rotation.angle, this.rotation.axis );
        rootTransform = m4.scale(rootTransform, this.scale, this.scale, this.scale);
        this.roots.forEach(nodeId => this.calculateNodeLocals(nodeId, rootTransform))
    }

    private calculateNodeLocals(nodeId: number, parentTransform: number[]): void {
        const node = this.nodes[nodeId];
        const translation = node.translation || [0, 0, 0];
        const rotation= node.rotation || [0, 0, 0, 0];
        const scale = node.scale || [1, 1, 1];
        let transform = m4.identity();
        transform = m4.translate(transform, ...translation);
        transform = m4.rotate(transform, rotation);
        transform = m4.scale(transform, ...scale);

        transform = m4.multiply(parentTransform, transform);
        node.localTransform = transform;
        if (node.children !== undefined) {
            node.children.forEach(childId => this.calculateNodeLocals(childId, transform));
        }
    }

    public jointMatrices(): void {
        this.skins.forEach(skin => {
            skin.jointMatrices = skin.joints.map(jointId => this.nodes[jointId].localTransform);
            //console.log(skin.jointMatrices);
        })
    }

    public addAnimation(animation: Animation): void {
        if (!this.animations) this.animations = [];
        this.animations.push(animation);
        console.log(new Float32Array(this.animations[0].samplers[4].output));
    }

    private renderNode(nodeId: number): void {
        const node = this.nodes[nodeId];
        const children = node.children || null;
        const mesh = node.mesh || null;
        const skin = node.skin || null;

        mesh && this.drawMesh(mesh, node.localTransform);

        if (children)  {
            for (const childNode of children) {
                this.renderNode(childNode);
            }
        }
    }

    private drawMesh(mesh: Mesh, transform: number[]): void {
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shader.getProgram(), 'model'), false, transform);
        mesh.primitives.forEach(primitive => {
            gl.bindVertexArray(primitive.VAO);
            gl.drawElements(gl.TRIANGLES, primitive.elementCount, gl.UNSIGNED_SHORT, 0);
            gl.bindVertexArray(undefined);
        });
    }
}