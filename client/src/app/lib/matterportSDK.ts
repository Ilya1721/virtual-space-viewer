import { LightSettings } from "./light";
import {
  MpSdk,
  ShowcaseBundleWindow,
  Tag,
  Scene,
  Sweep,
  Vector3,
  Dictionary,
  Graph,
} from "../../../public/third_party/matterportSDK/sdk";

type SweepGraph = Graph.IDirectedGraph<Sweep.ObservableSweepData>;
type SweepVertex = Graph.Vertex<MpSdk.Sweep.ObservableSweepData>;

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

  public disconnect(): void {
    this.sdk?.disconnect();
  }

  public async addTag(tag: Tag.Descriptor): Promise<void> {
    await this.sdk?.Tag.add(tag);
  }

  public async teleportToOffice(tagId: string): Promise<void> {
    await this.sdk?.Mattertag.navigateToTag(tagId, this.sdk?.Mattertag.Transition.FLY);
  }

  private async walkSweepGraph(sweepGraph: SweepGraph, startSweep: SweepVertex, endSweep: SweepVertex): Promise<void> {
    if (!this.sdk) {
      return;
    }

    const path = this.sdk.Graph.createAStarRunner(
      sweepGraph,
      startSweep,
      endSweep
    ).exec();

    if (!path || path.status !== this.sdk.Graph.AStarStatus.SUCCESS) {
      return;
    }

    for (const vertex of path.path) {
      await this.sdk.Sweep.moveTo(vertex.id, {
        rotation: vertex.data.rotation,
        transition: this.sdk.Sweep.Transition.FLY,
        transitionTime: 1000,
      });
    }
  }

  public async navigateToOffice(tag: Tag.Descriptor | null): Promise<void> {
    if (!tag || !this.sdk || !this.currentSweep) {
      return;
    }
    
    const closestToTagSweep = this.findClosestSweep(tag.anchorPosition);
    if (!closestToTagSweep) {
      return;
    }

    const sweepGraph = await this.sdk.Sweep.createGraph();
    const startSweep = sweepGraph.vertex(this.currentSweep.id);
    const endSweep = sweepGraph.vertex(closestToTagSweep.id);

    if (startSweep && endSweep) {
      await this.walkSweepGraph(sweepGraph, startSweep, endSweep);
    }
  }

  private findClosestSweep(position: Vector3): Sweep.ObservableSweepData | undefined {
    if (!this.sweeps) {
      return;
    }

    const closestSweepData = Object.values(this.sweeps).reduce((closest, sweep) => {
      const dist = Math.hypot(
        position.x - sweep.position.x,
        position.y - sweep.position.y,
        position.z - sweep.position.z
      );
      return dist < closest.dist ? { sweep, dist } : closest;
    }, { sweep: this.sweeps[0], dist: Infinity });

    return closestSweepData.sweep
  }

  public async addGLTFObjectToScene(
    meshUrl: string,
    meshPos: Vector3,
    lightSettings: LightSettings,
    scale: Vector3
  ): Promise<Scene.IObject | undefined> {
    if (!this.sdk) {
      return;
    }

    const objects = await this.sdk.Scene.createObjects(1);
    if (!objects) {
      console.log("Could not create an object");
      return;
    }

    const sceneObject = objects[0];
    const node = sceneObject.addNode();
    node.position.copy(meshPos);

    node.addComponent(this.sdk.Scene.Component.GLTF_LOADER, {
      url: meshUrl,
      localScale: scale,
    });

    this.addLightToObject(sceneObject, lightSettings);
    sceneObject.start();

    return sceneObject;
  }

  private addLightToObject(
    sceneObject: Scene.IObject,
    lightSettings: LightSettings
  ): void {
    if (!this.sdk) {
      return;
    }

    const lightsNode = sceneObject.addNode();
    lightsNode.addComponent(this.sdk?.Scene.Component.DIRECTIONAL_LIGHT, lightSettings.directionalLight);
    lightsNode.addComponent(this.sdk?.Scene.Component.AMBIENT_LIGHT, lightSettings.ambientLight);
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
      onCollectionUpdated: (sweeps) => this.onSweepDataChanged(sweeps),
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
