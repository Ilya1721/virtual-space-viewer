"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "./scene.module.css";
import { MatterportSDK, MP_Window } from "../lib/matterportSDK";

export default function Scene() {
  const apiKey = process.env.MATTERPORT_SDK_KEY;
  const modelSID = process.env.MATTERPORT_MODEL_SID;
  const iframeSrc = `/third_party/matterportSDK/showcase.html?m=${modelSID}&applicationKey=${apiKey}`;
  const iframeId = 'viewer';
  const mpSDKRef = useRef<MatterportSDK | null>(null);

  const handleIframeLoad = useCallback(async () => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    if (!iframe) {
      return;
    }

    mpSDKRef.current = new MatterportSDK(iframe.contentWindow as MP_Window);
    const mpSDK = mpSDKRef.current;
    await mpSDK.connect();

    if (!mpSDK) {
      return;
    }
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
