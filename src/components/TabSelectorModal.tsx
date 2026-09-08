import React, { useState } from 'react';
import { X, Search, Headphones, Radio, Headset, Usb, Cpu, Zap, Gamepad2, Volume2, Speaker, Tv, Play, Circle, Cable, Mic, Mic2, Sliders, BatteryCharging, Info, Disc, CircleDot, Wifi } from 'lucide-react';
import { SPREADSHEET_TABS, SpreadsheetTab } from '../data/spreadsheetTabs.ts';

interface TabSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGid: string;
  onSelectTab: (tab: SpreadsheetTab) => void;
}

export const TabSelectorModal: React.FC<TabSelectorModalProps> = ({
  isOpen,
  onClose,
  activeGid,
  onSelectTab,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredTabs = SPREADSHEET_TABS.filter(
    t => t.label.toLowerCase().includes(search.toLowerCase()) ||
         t.category.toLowerCase().includes(search.toLowerCase()) ||
         t.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderIcon = (iconName: string) => {
    const props = { className: "w-5 h-5 text-slate-700" };
    switch (iconName) {
      case 'Headphones': return <Headphones {...props} />;
      case 'Radio': return <Radio {...props} />;
      case 'Headset': return <Headset {...props} />;
      case 'Usb': return <Usb {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Gamepad2': return <Gamepad2 {...props} />;
      case 'Volume2': return <Volume2 {...props} />;
      case 'Speaker': return <Speaker {...props} />;
      case 'Tv': return <Tv {...props} />;
      case 'Play': return <Play {...props} />;
      case 'Circle': return <Circle {...props} />;
      case 'Cable': return <Cable {...props} />;
      case 'Mic': return <Mic {...props} />;
      case 'Mic2': return <Mic2 {...props} />;
      case 'Sliders': return <Sliders {...props} />;
      case 'BatteryCharging': return <BatteryCharging {...props} />;
      case 'Disc': return <Disc {...props} />;
      case 'CircleDot': return <CircleDot {...props} />;
      case 'Wifi': return <Wifi {...props} />;
      default: return <Info {...props} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity">
      <div
        id="tab-selector-modal"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Pilih Tab Spreadsheet Kitab Audio
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Tersedia 21 kategori perangkat audio dari Google Sheets
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tab audio (IEM, TWS, Dongle, Speaker, Kabel)..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        {/* Grid of Tabs */}
        <div className="overflow-y-auto no-scrollbar py-2 space-y-2 flex-1 pr-1">
          {filteredTabs.map((tab) => {
            const isSelected = tab.gid === activeGid;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab);
                  onClose();
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {renderIcon(tab.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {tab.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    GID: {tab.gid}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
