import React, { useState } from 'react';
import { 
  X, 
  Sprout, 
  Check, 
  ArrowRight, 
  Calendar, 
  Layers, 
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Droplets
} from 'lucide-react';
import { CROP_PROFILES, saveCropProfile } from '../../services/cropProfiles';

export default function CropSetupModal({ isOpen, onClose, currentProfile, onSaveSuccess }) {
  if (!isOpen) return null;

  const [selectedCropId, setSelectedCropId] = useState(currentProfile?.cropId || 'wheat');
  const activeCropDef = CROP_PROFILES[selectedCropId] || CROP_PROFILES.wheat;

  const [selectedStageId, setSelectedStageId] = useState(
    currentProfile?.stageId || activeCropDef.stages[0].id
  );
  const [soilType, setSoilType] = useState(currentProfile?.soilType || activeCropDef.soilType);
  const [fieldArea, setFieldArea] = useState(currentProfile?.fieldAreaAcres || 2.5);
  const [sowingDate, setSowingDate] = useState(
    currentProfile?.sowingDate || new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0]
  );

  // When crop changes, set default stage to stage 0
  const handleCropSelect = (cropId) => {
    setSelectedCropId(cropId);
    const newCrop = CROP_PROFILES[cropId];
    if (newCrop && newCrop.stages.length > 0) {
      setSelectedStageId(newCrop.stages[0].id);
      setSoilType(newCrop.soilType);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      cropId: selectedCropId,
      stageId: selectedStageId,
      soilType,
      fieldAreaAcres: Number(fieldArea),
      sowingDate,
      isConfigured: true
    };
    saveCropProfile(updated);
    if (onSaveSuccess) onSaveSuccess(updated);
    onClose();
  };

  const selectedStage = activeCropDef.stages.find(s => s.id === selectedStageId) || activeCropDef.stages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white transition-colors max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        {currentProfile?.isConfigured && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-inner">
            <Sprout size={26} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              Select Field Crop & Growth Stage
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                Step 1 of 2
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The AI Agronomist adapts irrigation triggers, fertilizer schedules, and rain delay based on this crop.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Step 1: Crop Grid */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
              1. Choose Crop
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(CROP_PROFILES).map((crop) => {
                const isSelected = crop.id === selectedCropId;
                return (
                  <button
                    type="button"
                    key={crop.id}
                    onClick={() => handleCropSelect(crop.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="text-2xl">{crop.icon}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-900 dark:text-white line-clamp-1">
                        {crop.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Optimum: {crop.targetMoisture}% • Crit: {crop.criticalMoisture}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Growth Stage */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
              2. Current Growth Stage ({activeCropDef.name})
            </label>
            <div className="space-y-2">
              {activeCropDef.stages.map((stage) => {
                const isSelected = stage.id === selectedStageId;
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="cropStage"
                        checked={isSelected}
                        onChange={() => setSelectedStageId(stage.id)}
                        className="mt-0.5 accent-emerald-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {stage.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {stage.das}
                          </span>
                          {stage.waterCritical && (
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-0.5">
                              <Droplets size={10} /> Water Critical
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                          {stage.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Soil Type & Field Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Layers size={13} className="text-emerald-500" />
                Soil Texture Type
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="Loamy Alluvial">Loamy Alluvial (Best moisture retention)</option>
                <option value="Deep Black Cotton">Deep Black Cotton (High clay, waterlogging sensitive)</option>
                <option value="Sandy Loam">Sandy Loam (Rapid drainage, frequent water)</option>
                <option value="Clayey Loam">Clayey Loam (Paddy / Heavy retention)</option>
                <option value="Red Laterite">Red Laterite (Low water holding capacity)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-500" />
                Sowing Date / Field Area
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                />
                <div className="w-24 relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={fieldArea}
                    onChange={(e) => setFieldArea(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="Acres"
                  />
                  <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 pointer-events-none">Ac</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview of AI Thresholds */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Calibrated AI Limits:</strong> Critical Wilting @ <strong>{activeCropDef.criticalMoisture}%</strong> • Target Hydration @ <strong>{activeCropDef.targetMoisture}%</strong>
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              Rain Tolerance: {activeCropDef.rainTolerance.split('—')[0]}
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-[0.99] cursor-pointer"
            >
              <span>Save Crop Profile & Enter Control Station</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
