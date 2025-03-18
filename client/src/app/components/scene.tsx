import { useEffect } from "react";
import styles from "./scene.module.css";
import { connect } from "../lib/matterportSDK";

export default function Scene() {
  const apiKey = process.env.MATTERPORT_SDK_KEY;
  const modelSID = process.env.MATTERPORT_MODEL_SID;
  const iframeSrc = `/third_party/matterportSDK/showcase.html?m=${modelSID}&applicationKey=${apiKey}`;
  const iframeId = 'viewer';

  return (
    <div className={styles.scene}>
      <iframe id={iframeId} src={iframeSrc} />
    </div>
  );
}
