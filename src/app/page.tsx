"use client";

import type { ReactNode } from "react";

import { EditorScreen } from "@/components/editor/EditorScreen";
import { ExportScreen } from "@/components/export/ExportScreen";
import { TopBar } from "@/components/layout/TopBar";
import { ListScreen } from "@/components/list/ListScreen";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { ToastHost } from "@/components/ui/Toast";
import { UploadScreen } from "@/components/upload/UploadScreen";
import { ImageStoreProvider, useImageStore } from "@/hooks/useImageStore";

function WizardShell() {
  const { state } = useImageStore();

  let body: ReactNode;
  switch (state.step) {
    case "settings":
      body = <SettingsScreen />;
      break;
    case "list":
      body = <ListScreen />;
      break;
    case "edit":
      body = <EditorScreen />;
      break;
    case "export":
      body = <ExportScreen />;
      break;
    case "upload":
    default:
      body = <UploadScreen />;
      break;
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      <TopBar />
      <div
        className={`flex min-h-0 flex-1 flex-col ${state.step === "upload" ? "overflow-auto" : "overflow-hidden"}`}
      >
        {body}
      </div>
      <ToastHost />
    </div>
  );
}

export default function Home() {
  return (
    <ImageStoreProvider>
      <WizardShell />
    </ImageStoreProvider>
  );
}
