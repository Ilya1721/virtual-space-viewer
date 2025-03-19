import { Mesh } from "three";
import { LightSettings } from "./light";
import { MpSdk, ShowcaseBundleWindow, Tag, Scene, Sweep } from "../../../public/third_party/matterportSDK/sdk";

export class MatterportSDK {
  private sdk: MpSdk | null = null;

  public constructor(private window: ShowcaseBundleWindow) {}

  public async connect(): Promise<void> {
    this.sdk = await this.window.MP_SDK.connect(this.window);
  };

  public async addTag(tag: Tag.Descriptor): Promise<void> {
    await this.sdk?.Tag.add(tag);
  }

  public async registerComponents(componentDesc: Scene.IComponentDesc[]): Promise<void> {
    await this.sdk?.Scene.registerComponents(componentDesc);
  }

  public async teleportToOffice(tagId: string): Promise<void> {
    this.sdk?.Tag.allowAction(tagId, { docking: true, navigating: true });
    this.sdk?.Tag.dock(tagId);
    this.sdk?.Tag.allowAction(tagId, { docking: false, navigating: false });
  }

  public async navigateToOffice(): Promise<void> {
    
  }

  private async addObjectToScene(mesh: Mesh, name: string, lightSettings: LightSettings): Promise<Scene.IObject | undefined> {
    const objects = await this.sdk?.Scene.createObjects(1);
    if (!objects) {
      console.log('Could not create an object');
      return;
    }
    const sceneObject = objects[0];
    const node = sceneObject.addNode();
    //node.addComponent(name, {});
    //component.outputs.objectRoot = mesh;
    //component.outputs.collider = mesh;
    node.position.copy(mesh.position);

    node.addComponent('mp.gltfLoader', {
      url: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Parrot.glb',
      localScale: {
          x: 0.5,
          y: 0.5,
          z: 0.5,
      },
    });
    
    this.addLightToObject(sceneObject, lightSettings)

    sceneObject.start();

    return sceneObject;
  }

  private addLightToObject(sceneObject: Scene.IObject, lightSettings: LightSettings): void {
    const lightsNode = sceneObject.addNode();
    lightsNode.addComponent('mp.directionalLight', lightSettings.directionalLight);
    lightsNode.addComponent('mp.ambientLight', lightSettings.ambientLight);
  }

  private async getSweepByIndex(index: number): Promise<Sweep.SweepData | undefined> {
    return (await this.sdk?.Model.getData())?.sweeps[index];
  }

  public async addMeshToSweep(mesh: Mesh, meshName: string, sweepIndex: number, lightSettings: LightSettings): Promise<Scene.IObject | undefined> {
    const sweep = await this.getSweepByIndex(sweepIndex);
    if (sweep) {
      mesh.position.copy(sweep.position);
      return await this.addObjectToScene(mesh, meshName, lightSettings);
    }
  }
}
