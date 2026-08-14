import api from './api';

const getFilename = (contentDisposition, fallback) => {
  if (!contentDisposition) {
    return fallback;
  }

  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
};

const messageFromBlob = async (blob) => {
  const text = await blob.text();
  try {
    const parsed = JSON.parse(text);
    return parsed.message || 'Unable to download certificate';
  } catch {
    return 'Unable to download certificate';
  }
};

export const downloadCertificate = async (courseId, courseTitle) => {
  try {
    const response = await api.get(`/certificates/${courseId}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const filename = getFilename(
      response.headers['content-disposition'],
      `certificate-${courseTitle || 'course'}.pdf`,
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      throw new Error(await messageFromBlob(error.response.data));
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Unable to download certificate',
    );
  }
};
