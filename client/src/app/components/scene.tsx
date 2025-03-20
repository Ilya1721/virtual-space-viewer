"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./scene.module.css";
import { MatterportSDK } from "../lib/matterportSDK";
import { ShowcaseBundleWindow, Tag, Vector3 } from "../../../public/third_party/matterportSDK/sdk";
import MainMenu from "./main_menu";
import { Config } from "../api/config/route";

enum SCENE_CALLBACKS {
  ADD_MESH_TO_CURRENT_SWEEP = "addMeshToCurrentSweep",
}

export default function Scene() {
  const [iframeSrc, setIframeSrc] = useState<string | undefined>();
  const [mpSDK, setMPSDK] = useState<MatterportSDK | null>(null);
  const [officeTag, setOfficeTag] = useState<Tag.Descriptor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const addMeshToScene = useCallback(async (): Promise<void> => {
    if (!mpSDK) {
      return;
    }

    const meshUrl = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Parrot.glb";

    const currentSweep = mpSDK.getCurrentSweep();
    if (!currentSweep) {
      return;
    }

    await mpSDK.addObjectToScene(meshUrl, currentSweep?.position, {
      directionalLight: {
        color: { r: 0.7, g: 0.7, b: 0.7 },
      },
      ambientLight: {
        intensity: 0.5,
        color: { r: 1.0, g: 1.0, b: 1.0 },
      },
    });
  }, [mpSDK]);

  const addMeshToCurrentSweep = useCallback(async (): Promise<void> => {
    if (!mpSDK) {
      return;
    }

    await addMeshToScene();
    mpSDK.removeOnCurrentSweepChangedCallback(SCENE_CALLBACKS.ADD_MESH_TO_CURRENT_SWEEP);
  }, [addMeshToScene, mpSDK]);

  const initScene = useCallback(async (): Promise<void> => {
    if (!mpSDK) {
      return;
    }

    await mpSDK.init();

    const officeTagId = "Office";
    const tagDescriptor: Tag.Descriptor = {
      id: officeTagId,
      label: officeTagId,
      anchorPosition: {x: 1.39, y: 2.0, z: -0.122} as Vector3,
      stemVector: {x: 0, y: 0, z: 0} as Vector3,
    }

    await mpSDK.addTag(tagDescriptor);
    setOfficeTag(tagDescriptor);
    mpSDK.addOnCurrentSweepChangedCallback(SCENE_CALLBACKS.ADD_MESH_TO_CURRENT_SWEEP, addMeshToCurrentSweep);
  }, [addMeshToCurrentSweep, mpSDK]);

  const handleIframeLoad = useCallback(async () => {
    if (iframeRef.current) {
      setMPSDK(
        new MatterportSDK(
          iframeRef.current.contentWindow as ShowcaseBundleWindow
        )
      );
    }
  }, []);

  const setIframeSrcFromConfig = useCallback(async () => {
    const res = await fetch("/api/config");
    const data = (await res.json()) as Config;
    const { matterportSDKKey, matterportModelSID } = data;
    setIframeSrc(
      `/third_party/matterportSDK/showcase.html?m=${matterportModelSID}&applicationKey=${matterportSDKKey}`
    );
  }, []);

  useEffect(() => {
    setIframeSrcFromConfig();
    if (mpSDK) {
      initScene();
    }
  }, [initScene, mpSDK, setIframeSrcFromConfig]);

  return (
    <div className={styles.scene}>
      <iframe ref={iframeRef} src={iframeSrc} onLoad={handleIframeLoad} />
      <MainMenu mpSDK={mpSDK} officeTag={officeTag} />
    </div>
  );
}
