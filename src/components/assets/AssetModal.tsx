"use client";

import React from "react";

import { AssetModalProps } from "@/types/asset";
import { AssetTypeSelector } from "@/components/assets/AssetTypeSelector";
import { AssetForm } from "@/components/assets/AssetForm";
import { AssetSubmitButton } from "@/components/assets/AssetSubmitButton";

const AssetModal: React.FC<AssetModalProps> = (props) => {
  const { onClose, isAnalyzing } = props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-10 space-y-8">
          <header className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Create Asset</h2>
            <button onClick={onClose}>✕</button>
          </header>

          <AssetTypeSelector {...props} />
          <AssetForm {...props} />

          <AssetSubmitButton {...props} />

          {isAnalyzing && (
            <p className="text-xs text-blue-600 font-bold text-center">
              Gemini AI is analyzing content...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetModal;
