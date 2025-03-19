import { Mesh, BoxGeometry, MeshBasicMaterial, ColorRepresentation } from "three";
import { Scene } from "../../../public/third_party/matterportSDK/sdk";

class BoxComponent implements Scene.IComponent {
  inputs = {};
  outputs: Record<string, unknown> & Scene.PredefinedOutputs = {
    objectRoot: null,
    collider: null
  };
  onInit() {
    const geometry = new BoxGeometry(1, 1, 1);
	  const mesh = new Mesh( geometry, new MeshBasicMaterial());
	  this.outputs.objectRoot = mesh;
  }
};

export const boxFactory = (): Scene.IComponent => {
  return new BoxComponent();
}

export const createBox = (width: number, height: number, depth: number, color: ColorRepresentation): Mesh => {
  const geometry = new BoxGeometry(width, height, depth); 
  const material = new MeshBasicMaterial({color}); 
  return new Mesh(geometry, material);
}