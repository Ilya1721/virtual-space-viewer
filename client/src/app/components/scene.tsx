"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "./scene.module.css";
import { MatterportSDK } from "../lib/matterportSDK";
import { Vector3 } from "three";
import { ShowcaseBundleWindow } from "../../../public/third_party/matterportSDK/sdk";

export default function Scene() {
  const apiKey = process.env.MATTERPORT_SDK_KEY;
  const modelSID = process.env.MATTERPORT_MODEL_SID;
  const iframeSrc = `/third_party/matterportSDK/showcase.html?m=${modelSID}&applicationKey=${apiKey}`;
  const iframeId = 'viewer';
  const mpSDKRef = useRef<MatterportSDK | null>(null);

  const initScene = async () => {
    const mpSDK = mpSDKRef.current;

    if (!mpSDK) {
      return;
    }

    await mpSDK.addTag({
      label: 'Office',
      anchorPosition: new Vector3(1.39, 2.00, -0.122),
      stemVector: new Vector3(0, 0, 0)
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
  }, []);

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
