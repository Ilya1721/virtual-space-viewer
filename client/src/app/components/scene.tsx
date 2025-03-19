"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "./scene.module.css";
import { MatterportSDK } from "../lib/matterportSDK";
import { Vector3 } from "three";
import { ShowcaseBundleWindow } from "../../../public/third_party/matterportSDK/sdk";
import { boxFactory, createBox } from "../lib/componentFactory";

export default function Scene() {
  const apiKey = process.env.MATTERPORT_SDK_KEY;
  const modelSID = process.env.MATTERPORT_MODEL_SID;
  const iframeSrc = `/third_party/matterportSDK/showcase.html?m=${modelSID}&applicationKey=${apiKey}`;
  const iframeId = 'viewer';
  const mpSDKRef = useRef<MatterportSDK | null>(null);

  const initScene = useCallback(async (): Promise<void> => {
    const mpSDK = mpSDKRef.current;

    if (!mpSDK) {
      return;
    }

    await mpSDK.addTag({
      label: 'Office',
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
  }, []);

  const addBoxToScene = async (): Promise<void> => {
    const mpSDK = mpSDKRef.current;
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
  }

  const handleIframeLoad = useCallback(async () => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    if (!iframe) {
      return;
    }

    mpSDKRef.current = new MatterportSDK(iframe.contentWindow as ShowcaseBundleWindow);
    const mpSDK = mpSDKRef.current;
    await mpSDK.connect();

    if (!mpSDK) {
      return;
    }

    await initScene();
  }, [initScene]);

  useEffect(() => {
    // Use timer for now, since onLoad for Iframe does not work for some reason
    const timer = setTimeout(async () => {
      await handleIframeLoad();
    }, 1000);

    return () => clearTimeout(timer);
  }, [handleIframeLoad]);

  if (!apiKey || !modelSID) {
    return <></>;
  }

  return (
    <div className={styles.scene}>
      <iframe id={iframeId} src={iframeSrc} />
    </div>
  );
}
