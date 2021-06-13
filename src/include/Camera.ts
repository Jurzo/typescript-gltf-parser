import { m4, v3 } from './MathFunctions';

export const enum Camera_Movement {
    FORWARD,
    BACWARD,
    LEFT,
    RIGHT,
    UP,
    DOWN
}

// default camera values
const YAW = -90.0;
const PITCH = 0.0;
const FRONT = [0.0, 0.0, -1.0];
const SPEED = 2.5;
const SENSITIVITY = 0.1;
const ZOOM = 45.0;

export class Camera {
    // Camera attributes
    public position: number[];
    public front: number[];
    public up: number[];
    public right: number[];
    public worldUp: number[];
    // euler angles
    public yaw: number;
    public pitch: number;
    // camera options
    public movementSpeed: number;
    public mouseSensitivity: number;
    public Zoom: number;

    constructor(position: number[], up: number[], yaw = YAW, pitch = PITCH) {
        this.position = position;
        this.worldUp = up;
        this.yaw = yaw;
        this.pitch = pitch;
        this.front = FRONT;
        this.movementSpeed = SPEED;
        this.mouseSensitivity = SENSITIVITY;
        this.Zoom = ZOOM;

        this.updateCameraVectors();
    }

    public getViewMatrix(): number[] {
        return m4.lookAt(this.position, v3.add(this.position, this.front), this.up);
    }

    private updateCameraVectors(): void {
        const yawRad = this.yaw / 180 * Math.PI;
        const pitchRad = this.pitch / 180 * Math.PI;
        const x = Math.cos(yawRad) * Math.cos(pitchRad);
        const y = Math.sin(pitchRad);
        const z = Math.sin(yawRad) * Math.cos(pitchRad);
        this.front = [x, y, z];

        this.right = v3.normalize(v3.cross(this.front, this.worldUp));
        this.up = v3.normalize(v3.cross(this.right, this.front));
    }
}