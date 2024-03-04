const $ = document.querySelectorAll.bind(document);
const defaultBackground = document.body.style.background;

function updateRelaysList() {
  localStorage.setItem("relays", JSON.stringify($("#relays_textbox")[0].value.split("\n")));
  location.hash = "#";
  
  bb.innerText = "Changes Saved. Refresh to apply.";
  if (!sub) getDefaultFeed();
}

async function lt(id) {
  for (const id of sess) {
    sendToRelays("CLOSE", id);
  }
  sess.clear();
  let rootpost = document.getElementById("n_" + id)
  if (rootpost) {
    rootpost = rootpost.cloneNode(true);
    rootpost.classList.remove("i");
  }
  const back = document.createElement("a");
  back.href = "#";
  back.setAttribute("onclick", 'getDefaultFeed()');
  back.innerText = "<-- Back";
  back.style["margin-bottom"] = "10px";
  
  /*getFeed({
    "#e": [id]
  });*/
  
  ps.innerHTML = "";
  ps.appendChild(back);
  ps.appendChild(br.cloneNode(true));
  ps.appendChild(br.cloneNode(true));
  if (rootpost) ps.appendChild(rootpost);
  else ps.appendChild(await mpe(await pool.get(relays, { ids: [id] })));
  const currentSess = "notes_" + Date.now();
  sess.add(currentSess);
  sendToRelays("REQ", currentSess, {
    kinds: [1],
    "#e": [id]
  });
}

async function lp(pubkey) {
  inThread = true;
  for (const id of sess) {
    sendToRelays("CLOSE", id);
  }
  sess.clear();
  let profile = authors[pubkey];
  
  if (!profile) {
    bb.innerText = "No profile metadata was found.";
    bb.style.visibility = "visible";
  } else {
    ps.innerHTML = "";
    profile = (typeof(profile) === "string") ? JSON.parse(profile.content) : profile;
    if (profile.banner) {
      const banner = document.createElement("img");
      const avatar = document.createElement("img");
      const name = document.createElement(`h2`);
      const about = document.createElement("pre");

      banner.src = tme(profile.banner);
      avatar.src = tme(profile.picture);
      name.innerText = profile.name || profile.meta_name;
      about.innerText = profile.about;

      banner.style.width = "100vw";
      avatar.style.width = "120px";
      avatar.style.float = "right";
      name.style.margin = "0";

      const mp = document.createElement("div");
      mp.style.display = "flow-root";
      mp.style["margin-bottom"] = "1em";
      mp.appendChild(banner);
      mp.appendChild(avatar);
      mp.appendChild(name);
      mp.appendChild(about);

      ps.appendChild(mp);

      const currentSess = "notes_" + Date.now();
      sess.add(currentSess);
      sendToRelays("REQ", currentSess, {
        kinds: [1],
        "authors": [pubkey],
        limit: 50
      });
    }
  }
}
