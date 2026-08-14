import { useCallback, useEffect, useRef, useState } from 'react';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SAVE_INTERVAL_MS = 10000;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function VideoPlayer({ src, startTime = 0, onTimeUpdate }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const lastSavedAtRef = useRef(0);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  const reportProgress = useCallback((force = false) => {
    const video = videoRef.current;
    if (!video || !onTimeUpdateRef.current) {
      return;
    }

    const now = Date.now();
    if (!force && now - lastSavedAtRef.current < SAVE_INTERVAL_MS) {
      return;
    }

    lastSavedAtRef.current = now;
    onTimeUpdateRef.current({
      currentTime: video.currentTime,
      duration: video.duration || 0,
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return undefined;
    }

    video.pause();
    video.currentTime = startTime || 0;
    setCurrentTime(startTime || 0);
    setIsPlaying(false);
    lastSavedAtRef.current = 0;

    return () => {
      reportProgress(true);
    };
    // Only reset when the video source changes so progress saves don't rewind playback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, reportProgress]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (event) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.currentTime = Number(event.target.value);
    setCurrentTime(video.currentTime);
  };

  const handleVolume = (event) => {
    const video = videoRef.current;
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    if (video) {
      video.volume = nextVolume;
      video.muted = nextVolume === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSpeed = (event) => {
    const video = videoRef.current;
    const nextSpeed = Number(event.target.value);
    setSpeed(nextSpeed);
    if (video) {
      video.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = async () => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await player.requestFullscreen();
  };

  return (
    <div className="video-player" ref={playerRef}>
      <video
        ref={videoRef}
        src={src}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          reportProgress(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          reportProgress(true);
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          if (startTime) {
            event.currentTarget.currentTime = startTime;
          }
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
          reportProgress(false);
        }}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setIsMuted(event.currentTarget.muted);
        }}
      />

      <div className="video-controls">
        <button type="button" onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <span className="video-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          className="seek-bar"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={handleSeek}
          aria-label="Seek"
        />

        <button type="button" onClick={toggleMute}>
          {isMuted || volume === 0 ? 'Unmute' : 'Mute'}
        </button>

        <input
          className="volume-bar"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolume}
          aria-label="Volume"
        />

        <label className="speed-control">
          Speed
          <select value={speed} onChange={handleSpeed} aria-label="Playback speed">
            {SPEEDS.map((value) => (
              <option key={value} value={value}>
                {value}x
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={toggleFullscreen}>
          Fullscreen
        </button>
      </div>
    </div>
  );
}

export default VideoPlayer;
