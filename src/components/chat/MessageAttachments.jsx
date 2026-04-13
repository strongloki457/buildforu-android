import AttachmentPreview from "./AttachmentPreview";

export default function MessageAttachments({ attachments }) {
  if (!attachments?.length) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {attachments.map((attachment) => (
        <AttachmentPreview key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}
