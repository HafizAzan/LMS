import { useState } from 'react';
import { downloadCertificate } from '../services/certificateService';

function DownloadCertificateButton({ courseId, courseTitle }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setError('');

    try {
      await downloadCertificate(courseId, courseTitle);
    } catch (err) {
      setError(err.message || 'Unable to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <span className="certificate-action">
      <button
        type="button"
        className="enroll-button"
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? 'Downloading...' : 'Download Certificate'}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </span>
  );
}

export default DownloadCertificateButton;
