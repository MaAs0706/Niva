import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Square, 
  Play, 
  Pause, 
  Download, 
  X, 
  RotateCcw,
  Zap,
  ZapOff,
  Monitor,
  Smartphone,
  Timer,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface CameraRecorderProps {
  onClose: () => void;
  onRecordingComplete: (recording: { blob: Blob; url: string; duration: number }) => void;
}

const CameraRecorder: React.FC<CameraRecorderProps> = ({ onClose, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, [cameraFacing]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const initializeCamera = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Check for camera permission
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setHasPermission(permission.state === 'granted');

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setHasPermission(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
      setHasPermission(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        await initializeCamera();
      }

      if (!streamRef.current) {
        throw new Error('No camera stream available');
      }

      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const switchCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && 'getCapabilities' in videoTrack) {
        const capabilities = videoTrack.getCapabilities();
        if (capabilities.torch) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ torch: !flashEnabled } as any]
            });
            setFlashEnabled(!flashEnabled);
          } catch (err) {
            console.error('Flash not supported:', err);
          }
        }
      }
    }
  };

  const downloadRecording = () => {
    if (recordedUrl && recordedBlob) {
      const a = document.createElement('a');
      a.href = recordedUrl;
      a.download = `niva-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const saveRecording = () => {
    if (recordedBlob && recordedUrl) {
      onRecordingComplete({
        blob: recordedBlob,
        url: recordedUrl,
        duration: duration
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    setIsRecording(false);
    setIsPaused(false);
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Initializing Camera...</p>
          <p className="text-sm text-gray-300 mt-2">Please allow camera access</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Camera Access Required</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Niva needs camera access to record safety videos. Please enable camera permissions in your browser settings.
          </p>
          <div className="space-y-4">
            <button
              onClick={initializeCamera}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-500 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-bold text-xl">Niva Recorder</h2>
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-mono text-lg">{formatTime(duration)}</span>
              {isPaused && <span className="text-yellow-400 text-sm font-semibold">PAUSED</span>}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-3 text-white hover:bg-white/20 rounded-2xl transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Video Preview */}
      <div className="flex-1 relative">
        {!recordedUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
        ) : (
          <video
            src={recordedUrl}
            className="w-full h-full object-cover"
            controls
            autoPlay
          />
        )}

        {/* Recording Overlay */}
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">REC</span>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-slate-800 dark:text-slate-100 font-semibold mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  initializeCamera();
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-sm p-6">
        {!recordedBlob ? (
          <div className="flex items-center justify-center space-x-6">
            {/* Camera Switch */}
            <button
              onClick={switchCamera}
              className="p-4 bg-white/20 text-white rounded-2xl hover:bg-white/30 transition-all duration-200"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            {/* Flash Toggle */}
            <button
              onClick={toggleFlash}
              className={`p-4 rounded-2xl transition-all duration-200 ${
                flashEnabled 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {flashEnabled ? <Zap className="w-6 h-6" /> : <ZapOff className="w-6 h-6" />}
            </button>

            {/* Main Record Button */}
            <div className="relative">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-2xl"
                >
                  <Video className="w-8 h-8 text-white" />
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="w-16 h-16 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                  >
                    {isPaused ? <Play className="w-6 h-6 text-white" /> : <Pause className="w-6 h-6 text-white" />}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                  >
                    <Square className="w-6 h-6 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Camera Type Indicator */}
            <div className="p-4 bg-white/20 text-white rounded-2xl">
              {cameraFacing === 'user' ? (
                <Smartphone className="w-6 h-6" />
              ) : (
                <Monitor className="w-6 h-6" />
              )}
            </div>

            {/* Duration Display */}
            <div className="p-4 bg-white/20 text-white rounded-2xl min-w-[80px] text-center">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5" />
                <span className="font-mono font-bold">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={resetRecording}
              className="flex items-center space-x-2 bg-slate-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-700 transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Record Again</span>
            </button>

            <button
              onClick={downloadRecording}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <button
              onClick={saveRecording}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition-all duration-200"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Save & Use</span>
            </button>
          </div>
        )}

        {/* Recording Info */}
        {recordedBlob && (
          <div className="mt-4 text-center">
            <p className="text-white/80 text-sm">
              Recording completed • Duration: {formatTime(duration)} • Size: {(recordedBlob.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraRecorder;