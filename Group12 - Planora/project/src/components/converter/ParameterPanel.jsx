import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Eye, Sun, Sparkles } from 'lucide-react';

const renderingStyles = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'blueprint', label: 'Architectural Blueprint' },
  { value: 'minimalist', label: 'Modern Minimalist' },
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'clay', label: 'Clay Render' },
  { value: 'artistic', label: 'Artistic Watercolor' },
];

const viewAngles = [
  { value: 'birds-eye', label: "Bird's Eye View" },
  { value: 'isometric', label: 'Isometric' },
  { value: 'walkthrough', label: 'Walk-through' },
  { value: 'corner', label: 'Corner Perspective' },
  { value: 'frontal', label: 'Frontal Elevation' },
];

const lightingTypes = [
  { value: 'natural', label: 'Natural Daylight' },
  { value: 'golden-hour', label: 'Golden Hour' },
  { value: 'studio', label: 'Studio Lighting' },
  { value: 'dramatic', label: 'Dramatic Shadows' },
  { value: 'soft', label: 'Soft Ambient' },
];

const materialQualities = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High Quality' },
  { value: 'ultra', label: 'Ultra HD' },
];

export default function ParameterPanel({ settings, setSettings }) {
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Rendering Style */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Palette className="w-4 h-4 text-primary" />
          Rendering Style
        </Label>
        <Select value={settings.style} onValueChange={(v) => updateSetting('style', v)}>
          <SelectTrigger className="bg-muted/50 border-border">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {renderingStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Angle */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Eye className="w-4 h-4 text-primary" />
          View Angle
        </Label>
        <Select value={settings.viewAngle} onValueChange={(v) => updateSetting('viewAngle', v)}>
          <SelectTrigger className="bg-muted/50 border-border">
            <SelectValue placeholder="Select angle" />
          </SelectTrigger>
          <SelectContent>
            {viewAngles.map((angle) => (
              <SelectItem key={angle.value} value={angle.value}>
                {angle.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lighting Type */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Sun className="w-4 h-4 text-primary" />
          Lighting Type
        </Label>
        <Select value={settings.lighting} onValueChange={(v) => updateSetting('lighting', v)}>
          <SelectTrigger className="bg-muted/50 border-border">
            <SelectValue placeholder="Select lighting" />
          </SelectTrigger>
          <SelectContent>
            {lightingTypes.map((light) => (
              <SelectItem key={light.value} value={light.value}>
                {light.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Material Quality */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-primary" />
          Material Quality
        </Label>
        <Select value={settings.quality} onValueChange={(v) => updateSetting('quality', v)}>
          <SelectTrigger className="bg-muted/50 border-border">
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            {materialQualities.map((quality) => (
              <SelectItem key={quality.value} value={quality.value}>
                {quality.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Requirements */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Additional Requirements</Label>
        <Textarea
          placeholder="Add any specific requirements for your 3D visualization..."
          value={settings.requirements}
          onChange={(e) => updateSetting('requirements', e.target.value)}
          className="bg-muted/50 border-border resize-none h-24"
        />
      </div>
    </div>
  );
}