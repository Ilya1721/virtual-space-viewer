import { Mesh, BoxGeometry, MeshBasicMaterial, ColorRepresentation } from "three";

export const createCube = (width: number, height: number, depth: number, color: ColorRepresentation): Mesh => {
  const geometry = new BoxGeometry(width, height, depth); 
  const material = new MeshBasicMaterial({color}); 
  return new Mesh(geometry, material);
}