import React from 'react';
import {
  Headphones, Radio, Headset, Usb, Cpu, Zap, Gamepad2, Volume2, Speaker,
  Tv, Play, Circle, Cable, Mic, Mic2, Sliders, BatteryCharging, Info,
  Disc, CircleDot, Wifi, Layers,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Headphones, Radio, Headset, Usb, Cpu, Zap, Gamepad2, Volume2, Speaker,
  Tv, Play, Circle, Cable, Mic, Mic2, Sliders, BatteryCharging, Info,
  Disc, CircleDot, Wifi,
};

export const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const Icon = ICONS[name] || Layers;
  return <Icon className={className} />;
};
