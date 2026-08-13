import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export const isNativeApp = Capacitor.isNativePlatform();

function dataUrlToBase64(dataUrl) {
  const commaIndex = dataUrl.indexOf(",");
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

function extensionForMimeType(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function fileNameFor(attachment) {
  const base = (attachment.name || "buildforu-image").replace(/\.[^.]+$/, "");
  return `${base}-${Date.now()}.${extensionForMimeType(attachment.type)}`;
}

// Writes the (data-URL) image to the app cache and hands it to the native share
// sheet — works for any target the user picks (chat apps, Google Photos, Files...).
export async function shareImageAttachment(attachment) {
  const written = await Filesystem.writeFile({
    path: fileNameFor(attachment),
    data: dataUrlToBase64(attachment.previewUrl),
    directory: Directory.Cache
  });

  await Share.share({ title: attachment.name, url: written.uri });
}

// Saves into the app's Documents directory (no runtime permission needed on
// modern Android). Not the system Photos gallery — see AttachmentPreview for
// the user-facing wording that reflects this.
export async function saveImageAttachment(attachment) {
  await Filesystem.writeFile({
    path: fileNameFor(attachment),
    data: dataUrlToBase64(attachment.previewUrl),
    directory: Directory.Documents,
    recursive: true
  });
}

export async function shareText({ title, text }) {
  await Share.share({ title, text });
}

// For plain-text exports (CSV, etc). The web build keeps its existing
// blob + <a download> flow — Android WebView has no download manager to
// hand a blob to, so native goes through Filesystem + the share sheet instead.
export async function shareTextFile({ fileName, content, title }) {
  const written = await Filesystem.writeFile({
    path: fileName,
    data: content,
    directory: Directory.Cache,
    encoding: Encoding.UTF8
  });

  await Share.share({ title, url: written.uri });
}
