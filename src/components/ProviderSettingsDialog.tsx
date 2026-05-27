"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/i18n";
import type { LlmProvider } from "@/lib/llm";

interface Props {
  open: boolean;
  provider: LlmProvider;
  onClose: () => void;
}

function DialogContent({ provider, onClose }: { provider: LlmProvider; onClose: () => void }) {
  const { t } = useI18n();
  const providerConfigs = useStore((s) => s.providerConfigs);
  const setProviderConfig = useStore((s) => s.setProviderConfig);

  const currentConfig = providerConfigs[provider] || { baseUrl: "", apiKey: "" };
  const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl);
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);

  const needsApiKey = provider === "openai" || provider === "anthropic";
  const providerName = t(`provider.${provider}` as never);

  const handleSave = () => {
    setProviderConfig(provider, { baseUrl: baseUrl.trim(), apiKey: apiKey.trim() });
    onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-[460px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <h2 className="text-lg font-semibold">{t("providerSettings.title", { provider: providerName })}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("providerSettings.baseUrl")}</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={t(`providerSettings.baseUrlPlaceholder.${provider}` as never)}
            className="w-full p-2 border rounded text-sm"
          />
          <p className="mt-1 text-xs text-gray-400">
            {provider === "ollama" || provider === "lmstudio"
              ? t("providerSettings.baseUrlHint")
              : t("providerSettings.baseUrlHintCloud")}
          </p>
        </div>

        {needsApiKey && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("providerSettings.apiKey")}</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t("providerSettings.apiKeyPlaceholder")}
              className="w-full p-2 border rounded text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">{t("providerSettings.apiKeyHint")}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-gray-50 rounded-b-lg">
        <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100">
          {t("providerSettings.cancel")}
        </button>
        <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          {t("providerSettings.save")}
        </button>
      </div>
    </div>
  );
}

export default function ProviderSettingsDialog({ open, provider, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <DialogContent key={`${provider}-${open}`} provider={provider} onClose={onClose} />
    </div>
  );
}
