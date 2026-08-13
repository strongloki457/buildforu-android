const wsUrl = process.argv[2];
const script = process.argv[3];

const ws = new WebSocket(wsUrl);
let id = 1;

ws.addEventListener("open", () => {
  ws.send(JSON.stringify({ id: id++, method: "Runtime.evaluate", params: { expression: script, returnByValue: true, awaitPromise: true } }));
});

ws.addEventListener("message", (ev) => {
  console.log(ev.data);
  ws.close();
});

ws.addEventListener("error", (ev) => {
  console.error("WS error", ev.message || ev);
  process.exit(1);
});

setTimeout(() => process.exit(0), 5000);
