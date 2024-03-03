const pool = new window.NostrTools.SimplePool();
let relays = JSON.parse(localStorage.getItem("relays") || "[]");
let authors = {};
let sub = null;
let inThread = false;

relays = relays.filter(i => !!i);

async function getDefaultFeed() {
  if (!relays.length) {
    bb.innerText = "No relay was configured. Please configure one.";
    location.hash = "#relays";
    return false;
  }

  if (privkey) {
    bb.innerText = "Fetching contact list....";
    bb.style.visibility = "visible";
    let contacts = await pool.get(relays, {
      kinds: [3],
      authors: [window.NostrTools.getPublicKey(privkey)]
    });
    
    if (!contacts) {
      getFeed({ limit: 10 });
      bb.innerText = "No contact list was found. Fetching default timeline....";
      bb.style.visibility = "visible";
      return;
    }
    
    contacts = contacts.tags.filter(i => i[0] === "p").map(i => i[1]);
    getFeed({
      limit: 50,
      authors: contacts,
      since: (Date.now() / 1000) - 10000
    });

    getFeed({
      limit: 25,
      "#p": contacts,
      since: (Date.now() / 1000) - 10000
    });

    for (const pub of contacts) {
      authors[pub] = {};
    }
    gp();
  } else getFeed({ limit: 10 });
}

$("#relays_textbox")[0].value = relays.join("\n");

function getFeed(filter = {}) {
  inThread = false;
  if (sub) sub.unsub();
  ps.innerHTML = "";
  bb.innerText = "Wait....";
  sub = pool.sub(relays, [{
    kinds: [1],
    ...filter
  }]);

  sub.on('event', async ev => {
    if (inThread) return;
    const p = await mpe(ev);
    ps.appendChild(p);
  });

  sub.on('eose', _ => {
    gp();
    bb.innerText = "EOSE received. Now receiving live events";
    bb.style.visibility = "visible";
  });
}

async function gp() {
  const keys = Object.keys(authors).filter(i => !authors[i].name && !authors[i].meta_name);

  if (keys.length) {
    bb.innerText = "Fetching profiles....";
    bb.style.visibility = "visible";
    try {
      const evs = await pool.list(relays, [{
        kinds: [0],
        authors: keys
      }]);
      evs.forEach(sp);

      bb.style.visibility = "hidden";
    } catch {
      bb.innerText = "Failed fetching profiles.";
      bb.style.visibility = "visible";
    }
  }
}

let tim = null;
window.onscroll = _ => {
  bb.style.visibility = "hidden";
  clearTimeout(tim);
  tim = setTimeout(gp, 100);
}

getDefaultFeed();
