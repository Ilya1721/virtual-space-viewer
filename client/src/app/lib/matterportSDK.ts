import { LightSettings } from "./light";
import {
  MpSdk,
  ShowcaseBundleWindow,
  Tag,
  Scene,
  Sweep,
  Vector3,
  Dictionary,
} from "../../../public/third_party/matterportSDK/sdk";

export class MatterportSDK {
  private sdk: MpSdk | null = null;
  private currentSweep: Sweep.ObservableSweepData | null = null;
  private sweeps: Dictionary<Sweep.ObservableSweepData> | null = null;
  private onCurrentSweepChangedCallbacks: Map<string, () => Promise<void>> = new Map();

  public constructor(private window: ShowcaseBundleWindow) {}

  public async init(): Promise<void> {
    await this.connect();
    this.subscribeToSweepChanges();
  }

  private async connect(): Promise<void> {
    this.sdk = await this.window.MP_SDK.connect(this.window);
  }

  public async addTag(tag: Tag.Descriptor): Promise<void> {
    await this.sdk?.Tag.add(tag);
  }

  public async teleportToOffice(tagId: string): Promise<void> {
    this.sdk?.Tag.allowAction(tagId, { docking: true, navigating: true });
    this.sdk?.Tag.dock(tagId);
    this.sdk?.Tag.allowAction(tagId, { docking: false, navigating: false });
  }

  public async navigateToOffice(tag: Tag.Descriptor | null): Promise<void> {
    if (!tag || !this.sdk) {
      return;
    }
    
    const closestToTagSweepId = await this.findClosestSweep(tag.anchorPosition);

    if (!this.currentSweep?.id || !closestToTagSweepId) {
      return;
    }

    const sweepGraph = await this.sdk.Sweep.createGraph();
    const startSweep = sweepGraph.vertex(this.currentSweep.id);
    const endSweep = sweepGraph.vertex(closestToTagSweepId);

    if (!startSweep || !endSweep) {
      return;
    }

    const path = this.sdk.Graph.createAStarRunner(
      sweepGraph,
      startSweep,
      endSweep
    ).exec();

    if (path && path.status === this.sdk.Graph.AStarStatus.SUCCESS) {
      for (const vertex of path.path) {
        const { rotation } = vertex.data;
        const negatedRotation = {x: -rotation.x, y: -rotation.y, z: -rotation.z };
        await this.sdk.Sweep.moveTo(vertex.id, {
          rotation: negatedRotation,
          transition: this.sdk.Sweep.Transition.FLY,
          transitionTime: 2000,
        });
      }
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

  public async addObjectToScene(
    meshUrl: string,
    meshPos: Vector3,
    lightSettings: LightSettings
  ): Promise<Scene.IObject | undefined> {
    const objects = await this.sdk?.Scene.createObjects(1);
    if (!objects) {
      console.log("Could not create an object");
      return;
    }
    const sceneObject = objects[0];
    const node = sceneObject.addNode();
    node.position.copy(meshPos);

    node.addComponent("mp.gltfLoader", {
      url: meshUrl,
      localScale: {
        x: 0.025,
        y: 0.025,
        z: 0.025,
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

  private onCurrentSweepChanged(currentSweep: Sweep.ObservableSweepData): void {
    this.currentSweep = currentSweep;
    for (const callback of this.onCurrentSweepChangedCallbacks.values()) {
      callback();
    }
  }

  private onSweepDataChanged(sweeps: Dictionary<Sweep.ObservableSweepData>): void {
    this.sweeps = sweeps;
  }

  private subscribeToSweepChanges(): void {
    this.sdk?.Sweep.current.subscribe((currentSweep) => {
      this.onCurrentSweepChanged(currentSweep);
    });
    this.sdk?.Sweep.data.subscribe({
      onCollectionUpdated: this.onSweepDataChanged
    });
  }

  public getCurrentSweep(): Sweep.ObservableSweepData | null {
    return this.currentSweep;
  }

  public getAllSweeps(): Dictionary<Sweep.ObservableSweepData> | null {
    return this.sweeps;
  }

  public addOnCurrentSweepChangedCallback(key: string, callback: () => Promise<void>): void {
    this.onCurrentSweepChangedCallbacks.set(key, callback);
  }

  public removeOnCurrentSweepChangedCallback(key: string): void {
    this.onCurrentSweepChangedCallbacks.delete(key);
  }
}
