import React, { useState } from 'react';
import { HomepageSection, Product } from '../../../types';
import { HomeScreen } from '../../../views/customer/HomeScreen';
import { useApp } from '../../../context/AppContext';
import { X, Smartphone, Monitor, CheckCircle, ExternalLink } from 'lucide-react';

interface HomepagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections?: HomepageSection[];
}

export const HomepagePreviewModal: React.FC<HomepagePreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { navigateTo } = useApp();
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl h-[94vh] bg-[#F0F4F8] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="px-5 py-3 bg-[#192E4D] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold">Homepage Live Preview</h3>
            <span className="hidden sm:inline text-slate-400 text-xs">· Kerala Customer View</span>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-[#08A9A2] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'desktop'
                  ? 'bg-[#08A9A2] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Width</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Preview Viewport */}
        <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start scrollbar-thin">
          <div
            className={`w-full bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 ${
              viewMode === 'mobile'
                ? 'max-w-md border-[8px] border-slate-800 rounded-3xl min-h-[600px]'
                : 'max-w-4xl border border-slate-200'
            }`}
          >
            {/* Embedded Live HomeScreen */}
            <div className="pt-2">
              <HomeScreen />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Interactive real-time preview (live products and links active)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigateTo('/');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#08A9A2] hover:bg-[#079690] font-bold text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Customer Storefront</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
