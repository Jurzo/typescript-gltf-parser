import { Shader } from "../TSE/Shader";
import { gl } from "../util/GL";
import { findPrevious, m4 } from "../util/Math";
import { AiNode, Skin } from "./AiNode";
import { Mesh } from "./Mesh";
import { Animation } from "./Animation";
import { interpolationValue, lerp, slerp } from "../util/Interpolation";

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
    private animationTime: number;

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
        this.animationTime = 0;
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
        const rotation = node.rotation || [0, 0, 0, 0];
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

    public animate(delta: number): void {
        this.animationTime += (delta / 1000.0);
        if (this.animationTime > this.animations[0].max)
            this.animationTime -= this.animations[0].max;
        const time = this.animationTime;
        const prev = findPrevious(this.animations[0].input, time);
        const x1 = this.animations[0].input[prev];
        const x2 = this.animations[0].input[prev + 1];
        const t = interpolationValue(x1, x2, time);
        for (const animation of this.animations) {
            animation.channels.forEach(channel => {
                const vec1: number[] = [];
                const vec2: number[] = [];
                const type: string = channel.property;
                let components: number;
                if (type === "rotation") {
                    components = 4;
                } else {
                    components = 3;
                }
                for (let i = 0; i < components; i++) {
                    const sampler = animation.samplers[channel.sampler];
                    vec1.push(sampler.output[prev * components + i]);
                    vec2.push(sampler.output[(prev + 1) * components + i]);
                }
                let vec3: number[];
                if (components === 4) {
                    vec3 = slerp(vec1, vec2, t);
                } else {
                    vec3 = lerp(vec1, vec2, t);
                }
                this.nodes[channel.target][type] = vec3;
            });
        }
    }

    public addAnimation(animation: Animation): void {
        if (!this.animations) this.animations = [];
        this.animations.push(animation);
        //console.log(new Float32Array(this.animations[0].samplers[4].output));
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