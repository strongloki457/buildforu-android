// TODO: replace with API in v0.2 (Bug #2 — chat backend)
export const mockThreads = [
  {
    id: "thread-1",
    name: "Sophie Carter",
    participants: ["u-admin-1", "u-employee-1"],
    messages: [
      {
        id: "m-1",
        senderId: "u-admin-1",
        textKey: "chat.messages.m-1",
        timestamp: "08:12"
      },
      {
        id: "m-2",
        senderId: "u-employee-1",
        textKey: "chat.messages.m-2",
        timestamp: "08:24"
      }
    ]
  },
  {
    id: "thread-2",
    name: "Mia Berger",
    participants: ["u-admin-1", "u-employee-2"],
    messages: [
      {
        id: "m-3",
        senderId: "u-admin-1",
        textKey: "chat.messages.m-3",
        timestamp: "07:48"
      },
      {
        id: "m-4",
        senderId: "u-employee-2",
        textKey: "chat.messages.m-4",
        timestamp: "08:01"
      }
    ]
  },
  {
    id: "thread-3",
    name: "Luca Moretti",
    participants: ["u-admin-1", "u-employee-3"],
    messages: [
      {
        id: "m-5",
        senderId: "u-employee-3",
        textKey: "chat.messages.m-5",
        timestamp: "08:05"
      }
    ]
  }
];
