import { Tag, Vector3 } from "../../../public/third_party/matterportSDK/sdk";
import { LightSettings } from "./light";

export const officeTagId = "Office";

export const tagDescriptor: Tag.Descriptor = {
  id: officeTagId,
  label: officeTagId,
  anchorPosition: { x: 1.39, y: 2.0, z: -0.122 } as Vector3,
  stemVector: { x: 0, y: 0, z: 0 } as Vector3,
};

export const defaultLightSettings: LightSettings = {
  directionalLight: {
    color: { r: 0.7, g: 0.7, b: 0.7 },
  },
  ambientLight: {
    intensity: 0.5,
    color: { r: 1.0, g: 1.0, b: 1.0 },
  },
}

export const defaultScale: Vector3 = {
  x: 0.025,
  y: 0.025,
  z: 0.025,
};

export const defaultMeshUrl: string = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Parrot.glb";
