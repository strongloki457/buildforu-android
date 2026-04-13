export function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 102.4) / 10} KB`;
  }

  return `${Math.round(size / 1024 / 102.4) / 10} MB`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function buildAttachments(files, source) {
  return Promise.all(
    files.map(async (file) => ({
      id: `${source}-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      source,
      previewUrl: file.type.startsWith("image/") ? await readFileAsDataUrl(file) : ""
    }))
  );
}
