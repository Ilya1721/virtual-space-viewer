import { MP_SDK, MP_Window, TagDescription } from "./matterportTypes";

export class MatterportSDK {
  private sdk: MP_SDK;

  public constructor(window: MP_Window) {
    this.sdk = window.MP_SDK as MP_SDK;
  }

  public async connect(): Promise<void> {
    this.sdk = await this.sdk.connect();
    console.log(this.sdk);
  };

  public async addTag(tag: TagDescription): Promise<void> {
    await this.sdk.Tag.add(tag);
  }
}
