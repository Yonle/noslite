const conn = new Set();
let mem = new Set();

function makeConn(url) {
  const ws = new WebSocket(url);

  ws.messages = new Set();

  ws.addEventListener('error', console.error);
  ws.addEventListener('close', _ => {
    conn.delete(ws);

    if (_.code === 1002) return;
    makeConn(url);
  });

  ws.addEventListener('message', handleRelayMessage);
  ws.addEventListener('open', _ => {
    bb.style.visibility = "visible";
    bb.innerText = "Connected to " + url;
    for (const req of mem) {
      ws.send(JSON.stringify(req));
    }
  });

  conn.add(ws);
}

function sendToRelays(...msg) {
  for (const ws of conn) {
    if (ws.readyState !== 1) continue;

    ws.send(
      JSON.stringify(msg)
    );
  }

  mem.add(msg);
}

function handleRelayMessage(msg) {
  const data = JSON.parse(msg.data);

  switch (data[0]) {
    case "EVENT":
      if (data[1].startsWith("notes_")) {
        feed_handleNote(data.slice(1));
      }
      if (data[1].startsWith("profile_"))
        sp(data[2], data[1]);

      if (data[1] === "currentprofile") {
        if (inThread) return sendToRelays("CLOSE", data[1]);
        authors[data[2].pubkey] = JSON.parse(data[2].content);
        lp(data[2].pubkey);
        sendToRelays("CLOSE", data[1]);
      }

      if (data[1] === "contacts") {
        contacts = data[2].tags.filter(i => i[0] === "p").map(i => i[1]);
        loadFollowingsTimeline();
      }
      break;
  }
}
