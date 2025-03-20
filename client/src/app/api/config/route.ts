export interface Config {
  matterportSDKKey: string | undefined;
  matterportModelSID: string | undefined;
}

export async function GET(): Promise<Response> {
  const res = {
    matterportSDKKey: process.env.MATTERPORT_SDK_KEY,
    matterportModelSID: process.env.MATTERPORT_MODEL_SID
  };
  return Response.json(res);
}
