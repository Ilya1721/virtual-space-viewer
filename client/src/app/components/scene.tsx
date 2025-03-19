"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./scene.module.css";
import { MatterportSDK } from "../lib/matterportSDK";
import { Vector3 } from "three";
import { ShowcaseBundleWindow } from "../../../public/third_party/matterportSDK/sdk";
import { boxFactory, createBox } from "../lib/componentFactory";
import MainMenu from "./main_menu";
import { Config } from "../api/config/route";

export default function Scene() {
  const [iframeSrc, setIframeSrc] = useState<string | undefined>();
  const [mpSDK, setMPSDK] = useState<MatterportSDK | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const officeTagId = 'Office';

  const addBoxToScene = useCallback(async (): Promise<void> => {
    if (!mpSDK) {
      return;
    }

    await mpSDK.addMeshToSweep(createBox(1, 1, 1, 'red'), 'customBox', 2, {
      directionalLight: {
        color: { r: 0.7, g: 0.7, b: 0.7 }
      },
      ambientLight: {
        intensity: 0.5,
        color: { r: 1.0, g: 1.0, b: 1.0 },
      }
    });
  }, [mpSDK]);

  const initScene = useCallback(async (): Promise<void> => {
    if (!mpSDK) {
      return;
    }

    await mpSDK.connect();

    await mpSDK.addTag({
      id: officeTagId,
      label: officeTagId,
      anchorPosition: new Vector3(1.39, 2.00, -0.122),
      stemVector: new Vector3(0, 0, 0)
    });

    await mpSDK.registerComponents([
      {
        name: 'customBox',
        factory: boxFactory
      }
    ]);

    await addBoxToScene();
  }, [addBoxToScene, mpSDK]);

  const handleIframeLoad = useCallback(async () => {
    if (iframeRef.current) {
      setMPSDK(new MatterportSDK(iframeRef.current.contentWindow as ShowcaseBundleWindow));
    }
  }, []);

  const setIframeSrcFromConfig = useCallback(async () => {
    const res = await fetch("/api/config"); 
    const data = await res.json() as Config;
    const { matterportSDKKey, matterportModelSID } = data;
    setIframeSrc(`/third_party/matterportSDK/showcase.html?m=${matterportModelSID}&applicationKey=${matterportSDKKey}`)
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
      <MainMenu mpSDK={mpSDK} officeTagId={officeTagId} />
    </div>
  );
}
