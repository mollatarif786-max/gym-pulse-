import React, { useState } from 'react';
import { BodyMeasurement, UnitSystem } from '../types';
import { kgToLbs, lbsToKg } from '../services/calculationEngine';
import { Scale, X, Check } from 'lucide-react';

interface LogMeasurementModalProps {
  isOpen: boolean;
  currentWeightKg: number;
  unitSystem: UnitSystem;
  onSaveMeasurement: (measurement: BodyMeasurement) => void;
  onClose: () => void;
}

export const LogMeasurementModal: React.FC<LogMeasurementModalProps> = ({
  isOpen,
  currentWeightKg,
  unitSystem,
  onSaveMeasurement,
  onClose,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<number>(currentWeightKg || 75);
  const [weightLbs, setWeightLbs] = useState<number>(kgToLbs(currentWeightKg || 75));
  const [waistCm, setWaistCm] = useState<string>('81');
  const [bodyFat, setBodyFat] = useState<string>('15');
  const [notes, setNotes] = useState<string>('Morning weigh-in');

  const handleWeightChange = (val: number, isLbs: boolean) => {
    if (isLbs) {
      setWeightLbs(val);
      setWeightKg(lbsToKg(val));
    } else {
      setWeightKg(val);
      setWeightLbs(kgToLbs(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const measurement: BodyMeasurement = {
      id: `meas_${date}_${Date.now()}`,
      date,
      weightKg: Number(weightKg.toFixed(1)),
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
      notes,
    };
    onSaveMeasurement(measurement);
    onClose();
  };

  return (
    <div id="log_measurement_modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#171717] border border-[#262626] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-[#EDEDED]">
        <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#EDEDED] text-base">Log Body Measurement</h3>
              <p className="text-xs text-[#A1A1AA]">Calibrates metabolic rate and composition trends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-white p-1 rounded-lg hover:bg-[#202020]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Body Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
            </label>
            {unitSystem === 'metric' ? (
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                required
                value={weightKg}
                onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 70, false)}
                className="w-full bg-[#121212] border border-[#262626] rounded-xl px-4 py-2.5 text-xl font-black font-mono text-[#EDEDED] text-center focus:outline-none focus:border-orange-500"
              />
            ) : (
              <input
                type="number"
                step="0.2"
                min="65"
                max="650"
                required
                value={weightLbs}
                onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 160, true)}
                className="w-full bg-[#121212] border border-[#262626] rounded-xl px-4 py-2.5 text-xl font-black font-mono text-[#EDEDED] text-center focus:outline-none focus:border-orange-500"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Waist (cm) [Optional]</label>
              <input
                type="number"
                step="0.5"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                placeholder="e.g. 81"
                className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Body Fat % [Optional]</label>
              <input
                type="number"
                step="0.5"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="e.g. 15.0"
                className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fasted, post-bathroom"
              className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEDED] placeholder-[#737373] focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white bg-[#121212] hover:bg-[#202020] border border-[#262626]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 text-black hover:bg-orange-400"
            >
              Save Metric
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
