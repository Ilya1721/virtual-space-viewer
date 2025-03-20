"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./scene.module.css";
import { MatterportSDK } from "../lib/matterportSDK";
import { ShowcaseBundleWindow, Tag } from "../../../public/third_party/matterportSDK/sdk";
import MainMenu from "./main_menu";
import { EnvConfig } from "../api/config/route";
import { defaultLightSettings, defaultMeshUrl, defaultScale, tagDescriptor } from "../lib/tempData";

enum SCENE_CALLBACKS {
  ADD_MESH_TO_CURRENT_SWEEP = "addMeshToCurrentSweep",
}

export default function Scene() {
  const [iframeSrc, setIframeSrc] = useState<string | undefined>();
  const [mpSDK, setMPSDK] = useState<MatterportSDK | null>(null);
  const [officeTag, setOfficeTag] = useState<Tag.Descriptor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const addMeshToCurrentSweep = useCallback(async (): Promise<void> => {
    const currentSweep = mpSDK?.getCurrentSweep();
    if (mpSDK && currentSweep) {
      await mpSDK.addGLTFObjectToScene(defaultMeshUrl, currentSweep.position, defaultLightSettings, defaultScale);
      mpSDK.removeOnCurrentSweepChangedCallback(SCENE_CALLBACKS.ADD_MESH_TO_CURRENT_SWEEP);
    }
  }, [mpSDK]);

  const initScene = useCallback(async (): Promise<void> => {
    if (!mpSDK) {
      return;
    }

    await mpSDK.init();
    await mpSDK.addTag(tagDescriptor);
    setOfficeTag(tagDescriptor);
    mpSDK.addOnCurrentSweepChangedCallback(SCENE_CALLBACKS.ADD_MESH_TO_CURRENT_SWEEP, addMeshToCurrentSweep);
  }, [addMeshToCurrentSweep, mpSDK]);

  const handleIframeLoad = useCallback(() => {
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
    const data = (await res.json()) as EnvConfig;
    const { matterportSDKKey, matterportModelSID } = data;
    setIframeSrc(
      `/third_party/matterportSDK/showcase.html?m=${matterportModelSID}&applicationKey=${matterportSDKKey}`
    );
  }, []);

  useEffect(() => {
    setIframeSrcFromConfig();
    initScene();

    return () => {
      mpSDK?.disconnect();
    };
  }, [initScene, mpSDK, setIframeSrcFromConfig]);

  return (
    <div className={styles.scene}>
      <iframe ref={iframeRef} src={iframeSrc} onLoad={handleIframeLoad} />
      <MainMenu mpSDK={mpSDK} officeTag={officeTag} />
    </div>
  );
}
