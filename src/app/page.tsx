"use client";

import { useCallback, useState } from "react";
import HeaderBar from "@/components/HeaderBar";
import Sidebar from "@/components/Sidebar";
import SubtitleTable from "@/components/SubtitleTable";
import StatusBar from "@/components/StatusBar";
import { useStore } from "@/store/useStore";
import { parseSrt } from "@/lib/srt-parser";

export default function Home() {
  const { entries } = useStore();
  const [dragging, setDragging] = useState(false);

  const loadFile = useCallback((file: File) => {
    if (!file.name.endsWith(".srt")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const parsed = parseSrt(content);
      useStore.getState().setEntries(parsed);
      useStore.getState().setFileName(file.name);
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }, [loadFile]);

  return (
    <div
      className="flex flex-col h-screen relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <SubtitleTable />
      </div>
      <StatusBar />

      {dragging && entries.length === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 border-4 border-dashed border-blue-400 rounded-lg m-2 pointer-events-none">
          <p className="text-2xl font-bold text-blue-500">拖放 SRT 文件到此处</p>
        </div>
      )}
    </div>
  );
}
