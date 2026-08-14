import { useEffect, useState } from 'react';

function ProgressBar({ percent = 0, label = true }) {
  const value = Math.min(100, Math.max(0, Number(percent) || 0));
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFill(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="progress-bar-wrap">
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar-fill" style={{ width: `${fill}%` }} />
      </div>
      {label ? <span className="progress-bar-label">{value}%</span> : null}
    </div>
  );
}

export default ProgressBar;
