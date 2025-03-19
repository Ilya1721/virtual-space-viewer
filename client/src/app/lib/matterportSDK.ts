import { Mesh } from "three";
import { LightSettings } from "./light";
import {
  MpSdk,
  ShowcaseBundleWindow,
  Tag,
  Scene,
  Sweep,
  Vector3,
} from "../../../public/third_party/matterportSDK/sdk";

export class MatterportSDK {
  private sdk: MpSdk | null = null;

  public constructor(private window: ShowcaseBundleWindow) {}

  public async connect(): Promise<void> {
    this.sdk = await this.window.MP_SDK.connect(this.window);
  }

  public async addTag(tag: Tag.Descriptor): Promise<void> {
    await this.sdk?.Tag.add(tag);
  }

  public async registerComponents(
    componentDesc: Scene.IComponentDesc[]
  ): Promise<void> {
    await this.sdk?.Scene.registerComponents(componentDesc);
  }

  public async teleportToOffice(tagId: string): Promise<void> {
    this.sdk?.Tag.allowAction(tagId, { docking: true, navigating: true });
    this.sdk?.Tag.dock(tagId);
    this.sdk?.Tag.allowAction(tagId, { docking: false, navigating: false });
  }

  public async navigateToOffice(tag: Tag.Descriptor | null): Promise<void> {
    if (!tag) {
      return;
    }

    const sweepGraph = await this.sdk?.Sweep.createGraph();
    if (!sweepGraph) {
      return;
    }

    const currentSweep = await this.sdk?.Sweep.current.waitUntil((currentSweep) => currentSweep.id !== '');
    const closestToTagSweepId = await this.findClosestSweep(tag.anchorPosition);

    if (!currentSweep?.id || !closestToTagSweepId) {
      return;
    }

    const startSweep = sweepGraph.vertex(currentSweep.id);
    const endSweep = sweepGraph.vertex(closestToTagSweepId);

    if (!startSweep || !endSweep) {
      return;
    }

    const path = this.sdk?.Graph.createAStarRunner(
      sweepGraph,
      startSweep,
      endSweep
    ).exec();

    if (!path ||path.status !== this.sdk?.Graph.AStarStatus.SUCCESS) {
      return;
    }

    for (const vertex of path.path) {
      await this.sdk?.Sweep.moveTo(vertex.id, { transition: this.sdk?.Sweep.Transition.FLY, transitionTime: 2000 });
    }
  }

  private async findClosestSweep(position: Vector3): Promise<string | undefined> {
    const sweeps = (await this.sdk?.Model.getData())?.sweeps;

    if (!sweeps) {
      return;
    }

    const closestSweep = sweeps.reduce((closest, sweep) => {
      const dist = Math.hypot(
        position.x - sweep.position.x,
        position.y - sweep.position.y,
        position.z - sweep.position.z
      );
      return dist < closest.dist ? { sid: sweep.sid, dist } : closest;
    }, { sid: "", dist: Infinity });

    return closestSweep.sid;
  }

  private async addObjectToScene(
    mesh: Mesh,
    name: string,
    lightSettings: LightSettings
  ): Promise<Scene.IObject | undefined> {
    const objects = await this.sdk?.Scene.createObjects(1);
    if (!objects) {
      console.log("Could not create an object");
      return;
    }
    const sceneObject = objects[0];
    const node = sceneObject.addNode();
    //node.addComponent(name, {});
    //component.outputs.objectRoot = mesh;
    //component.outputs.collider = mesh;
    node.position.copy(mesh.position);

    node.addComponent("mp.gltfLoader", {
      url: "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Parrot.glb",
      localScale: {
        x: 0.5,
        y: 0.5,
        z: 0.5,
      },
    });

    this.addLightToObject(sceneObject, lightSettings);

    sceneObject.start();

    return sceneObject;
  }

  private addLightToObject(
    sceneObject: Scene.IObject,
    lightSettings: LightSettings
  ): void {
    const lightsNode = sceneObject.addNode();
    lightsNode.addComponent(
      "mp.directionalLight",
      lightSettings.directionalLight
    );
    lightsNode.addComponent("mp.ambientLight", lightSettings.ambientLight);
  }

  private async getSweepByIndex(
    index: number
  ): Promise<Sweep.SweepData | undefined> {
    return (await this.sdk?.Model.getData())?.sweeps[index];
  }

  public async addMeshToSweep(
    mesh: Mesh,
    meshName: string,
    sweepIndex: number,
    lightSettings: LightSettings
  ): Promise<Scene.IObject | undefined> {
    const sweep = await this.getSweepByIndex(sweepIndex);
    if (sweep) {
      mesh.position.copy(sweep.position);
      return await this.addObjectToScene(mesh, meshName, lightSettings);
    }
  }
}
