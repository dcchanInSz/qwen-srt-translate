"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";

const TIME_REGEX = /^\d{2}:\d{2}:\d{2}[,.]\d{3}$/;

function EditableCell({
  value,
  onSave,
  className = "",
  validate,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  validate?: (v: string) => boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState(false);

  const handleSave = useCallback(() => {
    if (validate && !validate(draft)) {
      setError(true);
      return;
    }
    setError(false);
    onSave(draft);
    setEditing(false);
  }, [draft, onSave, validate]);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setError(false);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") handleCancel();
    },
    [handleSave, handleCancel]
  );

  if (editing) {
    return (
      <input
        type="text"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setError(false);
        }}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full p-0.5 border rounded text-sm outline-none ${error ? "border-red-500 bg-red-50" : "border-blue-400"} ${className}`}
        autoFocus
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      className={`p-1 text-sm cursor-pointer hover:bg-gray-100 rounded min-h-[24px] ${className}`}
    >
      {value || <span className="text-gray-300">Double-click to edit</span>}
    </div>
  );
}

export default function SubtitleTable() {
  const { entries, selectedIndices, updateEntry, toggleSelected } = useStore();

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Load an SRT file to begin
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-gray-100 z-10">
          <tr>
            <th className="w-8 p-2 text-left text-xs font-medium text-gray-500 border-b">
              <input
                type="checkbox"
                checked={selectedIndices.length === entries.length && entries.length > 0}
                onChange={() => {
                  if (selectedIndices.length === entries.length) {
                    useStore.getState().setSelectedIndices([]);
                  } else {
                    useStore.getState().setSelectedIndices(entries.map((_, i) => i));
                  }
                }}
                className="w-3.5 h-3.5"
              />
            </th>
            <th className="w-10 p-2 text-left text-xs font-medium text-gray-500 border-b">#</th>
            <th className="w-28 p-2 text-left text-xs font-medium text-gray-500 border-b">Start</th>
            <th className="w-28 p-2 text-left text-xs font-medium text-gray-500 border-b">End</th>
            <th className="p-2 text-left text-xs font-medium text-gray-500 border-b">Original</th>
            <th className="p-2 text-left text-xs font-medium text-gray-500 border-b">Translation</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <tr
                key={entry.id}
                className={`border-b ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
              >
                <td className="p-1 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(idx)}
                    className="w-3.5 h-3.5"
                  />
                </td>
                <td className="p-1 text-xs text-gray-400 text-center">{idx + 1}</td>
                <td className="p-1">
                  <EditableCell
                    value={entry.startTime}
                    onSave={(v) => updateEntry(entry.id, { startTime: v })}
                    validate={(v) => TIME_REGEX.test(v)}
                    className="font-mono text-xs"
                  />
                </td>
                <td className="p-1">
                  <EditableCell
                    value={entry.endTime}
                    onSave={(v) => updateEntry(entry.id, { endTime: v })}
                    validate={(v) => TIME_REGEX.test(v)}
                    className="font-mono text-xs"
                  />
                </td>
                <td className="p-1 text-sm whitespace-pre-wrap">{entry.original}</td>
                <td className="p-1">
                  <EditableCell
                    value={entry.translated}
                    onSave={(v) => updateEntry(entry.id, { translated: v })}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
