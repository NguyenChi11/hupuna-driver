"use client";

import React from "react";
import { AssetModalProps } from "@/types/asset";
import { AssetTypeSelector } from "@/components/assets/AssetTypeSelector";
import { AssetForm } from "@/components/assets/AssetForm";
import { AssetSubmitButton } from "@/components/assets/AssetSubmitButton";

const AssetModal: React.FC<AssetModalProps> = (props) => {
  const { onClose, isAnalyzing } = props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create new</h2>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors "
              aria-label="Close"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          <AssetTypeSelector {...props} />
          <AssetForm {...props} />

          <AssetSubmitButton {...props} />

          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">
                Gemini AI is analyzing content...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetModal;
