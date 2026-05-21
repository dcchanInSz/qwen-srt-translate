"use client";

import HeaderBar from "@/components/HeaderBar";
import Sidebar from "@/components/Sidebar";
import SubtitleTable from "@/components/SubtitleTable";
import StatusBar from "@/components/StatusBar";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <SubtitleTable />
      </div>
      <StatusBar />
    </div>
  );
}
