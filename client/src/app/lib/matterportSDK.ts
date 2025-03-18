export interface MP_SDK
{
  connect: () => Promise<void>;
}

export interface MP_Window extends Window
{
  MP_SDK: MP_SDK
}

export class MatterportSDK {
  private sdk: MP_SDK;

  public constructor(private window: MP_Window) {
    this.sdk = this.window.MP_SDK as MP_SDK;
  }

  public async connect(): Promise<void> {
    await this.sdk.connect();
  };
}
