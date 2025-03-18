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
}
