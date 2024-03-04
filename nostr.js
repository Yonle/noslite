const pool = new window.NostrTools.SimplePool();
let relays = JSON.parse(localStorage.getItem("relays") || "[]");
let authors = {};
let contacts = [];
let sub = null;

relays = relays.filter(i => !!i);

let contactAsked = false;
async function getDefaultFeed() {
  $("#postbtn")[0].innerText = "Post";
  if (!relays.length) {
    bb.innerText = "No relay was configured. Please configure one.";
    location.hash = "#relays";
    return false;
  }

  for (const id of sess) {
    sendToRelays("CLOSE", id);
  }
  sess.clear();

  if (privkey) {
    bb.innerText = "Fetching contact list....";
    bb.style.visibility = "visible";
    sendToRelays("REQ", "contacts", {
      kinds: [3],
      authors: [window.NostrTools.getPublicKey(privkey)],
      limit: 1
    });

    $("#my_profilelink")[0].href = "#u_" + window.NostrTools.getPublicKey(privkey);

    contactAsked = true;
  } else getFeed({ kinds: [1], limit: 10 });
}

function loadFollowingsTimeline() {
  if (!contactAsked) return false;
  getFeed({
    kinds: [1],
    limit: 100,
    authors: contacts,
    since: (Date.now() / 1000) - 10000
  }, {
    kinds: [1],
    limit: 100,
    "#p": contacts,
    since: (Date.now() / 1000) - 10000
  });

  for (const pub of contacts) {
    authors[pub] = {};
  }
  gp();

  contactAsked = false;
}

$("#relays_textbox")[0].value = relays.join("\n");

function getFeed(...filter) {
  inThread = false;
  ps.innerHTML = "";
  bb.innerText = "Wait....";

  let currentSess = "notes_" + Date.now();

  sess.add(currentSess);

  sendToRelays("REQ", currentSess, ...filter);
}

async function gp() {
  const keys = Object.keys(authors).filter(i => !authors[i].name && !authors[i].meta_name);

  if (keys.length) {
    sendToRelays("REQ", "profile_" + Date.now(), {
      kinds: [0],
      authors: keys
    });
  }
}

function myprofile() {
  for (const id of sess) {
    sendToRelays("CLOSE", id);
  }
  sess.clear();
  ps.innerHTML = "";
  location.hash = "#u_" + window.NostrTools.getPublicKey(privkey);

  sendToRelays("REQ", "currentprofile", { kinds: [0], authors: [location.hash.slice(3)], limit: 1 });
}

if (location.hash.startsWith("#u_")) {
  sendToRelays("REQ", "currentprofile", { kinds: [0], authors: [location.hash.slice(3)], limit: 1 });
} else {
  getDefaultFeed();
}

relays.forEach(makeConn);
