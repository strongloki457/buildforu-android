import { createEntityId } from "./ids";

export function createChatActions({ dispatch }) {
  const sendMessage = ({ threadId, senderId, text, attachments = [] }) => {
    if (!text.trim() && !attachments.length) {
      return null;
    }

    const timestamp = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());

    const message = {
      id: createEntityId("m"),
      senderId,
      text: text.trim(),
      timestamp,
      attachments
    };

    dispatch({
      type: "SEND_MESSAGE",
      payload: {
        threadId,
        message
      }
    });

    return message;
  };

  return {
    sendMessage
  };
}
