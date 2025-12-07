import PresetHolder from "./components/presets/PresetHolder";
import Panel from "./components/Panel";
import { RefreshProvider } from "./context/RefreshContext";
import { useEffect, useState } from "react";

import Toast from "./utils/Toast";

export default function App() {
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.onDownloadComplete(() => {
      triggerToast("Saved!");
    });

    // window.electronAPI.onDownloadFailed(() => {
    //   triggerToast("Download Cancelled");
    // });
  }, []);

  return (
    <>
      {/* GLOBAL CUSTOM TOAST */}
      <Toast
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      <main className="min-h-screen bg-nero-900 flex flex-wrap-reverse items-center justify-start select-none">
        <RefreshProvider>
          <PresetHolder />
          <Panel />
        </RefreshProvider>
      </main>
    </>
  );
}
