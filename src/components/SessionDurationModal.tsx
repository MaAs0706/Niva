import React, { useState } from 'react';
import { Clock, Timer, X, Play, Infinity } from 'lucide-react';

interface SessionDurationModalProps {
  onConfirm: (duration?: number) => void;
  onCancel: () => void;
  sessionType: 'quick' | 'route';
  routeName?: string;
}

const SessionDurationModal: React.FC<SessionDurationModalProps> = ({
  onConfirm,
  onCancel,
  sessionType,
  routeName
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const presetDurations = [
    { value: 30, label: '30 minutes', description: 'Quick trip' },
    { value: 60, label: '1 hour', description: 'Short journey' },
    { value: 120, label: '2 hours', description: 'Medium trip' },
    { value: 240, label: '4 hours', description: 'Long journey' },
    { value: 480, label: '8 hours', description: 'Full day' },
  ];

  const handleConfirm = () => {
    if (selectedDuration === -1) {
      // No duration (unlimited)
      onConfirm();
    } else if (selectedDuration) {
      onConfirm(selectedDuration);
    } else if (showCustomInput && customDuration) {
      const duration = parseInt(customDuration);
      if (duration > 0 && duration <= 1440) { // Max 24 hours
        onConfirm(duration);
      }
    }
  };

  const isValid = selectedDuration !== null || (showCustomInput && customDuration && parseInt(customDuration) > 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl transition-colors duration-300">
                <Timer className="w-6 h-6 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">Session Duration</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
                  {sessionType === 'route' && routeName ? `For ${routeName}` : 'How long will you be out?'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
              Setting a duration helps me provide better safety checks. When time is up, I'll gently check if you're okay.
            </p>
          </div>

          {/* No Duration Option */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedDuration(-1);
                setShowCustomInput(false);
              }}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                selectedDuration === -1
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl transition-colors duration-300">
                  <Infinity className="w-5 h-5 text-slate-600 dark:text-slate-300 transition-colors duration-300" />
                </div>
                <div>
                  <div className="font-bold">No specific duration</div>
                  <div className="text-sm mt-1 opacity-75">I'll check in at regular intervals</div>
                </div>
              </div>
            </button>
          </div>

          {/* Preset Durations */}
          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">Quick Select</h3>
            {presetDurations.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setSelectedDuration(preset.value);
                  setShowCustomInput(false);
                }}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selectedDuration === preset.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl transition-colors duration-300">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                    </div>
                    <div>
                      <div className="font-bold">{preset.label}</div>
                      <div className="text-sm mt-1 opacity-75">{preset.description}</div>
                    </div>
                  </div>
                  {selectedDuration === preset.value && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Duration */}
          <div className="mb-8">
            <button
              onClick={() => {
                setShowCustomInput(!showCustomInput);
                if (!showCustomInput) {
                  setSelectedDuration(null);
                }
              }}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                showCustomInput
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-slate-200 dark:border-slate-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl transition-colors duration-300">
                  <Timer className="w-5 h-5 text-indigo-600 dark:text-indigo-400 transition-colors duration-300" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">Custom duration</div>
                  <div className="text-sm mt-1 text-slate-600 dark:text-slate-300 transition-colors duration-300">Set your own time</div>
                </div>
              </div>
            </button>

            {showCustomInput && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl transition-colors duration-300">
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
                    placeholder="Enter minutes"
                    min="1"
                    max="1440"
                    autoFocus
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-medium transition-colors duration-300">minutes</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 transition-colors duration-300">
                  Maximum 24 hours (1440 minutes)
                </p>
              </div>
            )}
          </div>

          {/* Safety Info */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-8 transition-colors duration-300">
            <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-3 transition-colors duration-300">🛡️ How Safety Checks Work</h4>
            <div className="space-y-2 text-purple-800 dark:text-purple-200 text-sm transition-colors duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-500 rounded-full transition-colors duration-300"></div>
                <span>When time expires, I'll ask if you're okay</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-500 rounded-full transition-colors duration-300"></div>
                <span>You'll have 2 minutes to respond</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-500 rounded-full transition-colors duration-300"></div>
                <span>If no response, gentle alerts are sent to your circle</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 dark:bg-purple-500 rounded-full transition-colors duration-300"></div>
                <span>Sessions auto-extend by 5 minutes if you respond</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-slate-500 text-white py-4 px-6 rounded-2xl font-bold hover:bg-slate-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Start Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDurationModal;