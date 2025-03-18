import { Mesh } from "three";
import { MpSdk, ShowcaseBundleWindow, Tag } from "../../../public/third_party/matterportSDK/sdk";

export class MatterportSDK {
  private sdk: MpSdk | null = null;

  public constructor(private window: ShowcaseBundleWindow) {}

  public async connect(): Promise<void> {
    this.sdk = await this.window.MP_SDK.connect(this.window);
  };

  public async addTag(tag: Tag.Descriptor): Promise<void> {
    await this.sdk?.Tag.add(tag);
  }

  public async addMeshToSweep(mesh: Mesh): Promise<void> {
    //const scene = this.sdk?.Scene;
    this.sdk?.Sweep.data.subscribe({
      onCollectionUpdated(collection) {
        const sweeps = Object.values(collection);
        if (sweeps.length < 2) {
          return;
        }
        const sweep = sweeps[1];
        if (sweep) {
          mesh.position.set(sweep.position.x, sweep.position.y, sweep.position.z);
        }
      },
    })
  }
}
