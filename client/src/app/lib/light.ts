import { Scene } from "../../../public/third_party/matterportSDK/sdk";

export interface LightSettings {
    ambientLight: Scene.SceneComponentOptions[Scene.Component.AMBIENT_LIGHT],
    directionalLight: Scene.SceneComponentOptions[Scene.Component.DIRECTIONAL_LIGHT]
}