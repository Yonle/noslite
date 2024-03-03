const $ = document.querySelectorAll.bind(document);
const defaultBackground = document.body.style.background;

function updateRelaysList() {
  localStorage.setItem("relays", JSON.stringify($("#relays_textbox")[0].value.split("\n")));
  location.hash = "#";
  
  bb.innerText = "Changes Saved. Refresh to apply.";
  if (!sub) getDefaultFeed();
}

async function lt(id) {
  inThread = true;
  sub.unsub();
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
  const events = await pool.list(relays, [{
    kinds: [1],
    "#e": [id]
  }]);
  
  for (i of events) {
    ps.appendChild(await mpe(i));
  }
}

async function lp(pubkey) {
  inThread = true;
  sub.unsub();
  let profile = authors[pubkey] || await pool.get(relays, { kinds: [0], authors: [pubkey] });
  
  if (!profile) {
    bb.innerText = "No profile metadata was found.";
    bb.style.visibility = "visible";
  } else {
    ps.innerHTML = "";
    profile = (typeof(profile) === "string") ? JSON.parse(profile.content) : profile;
    if (profile.banner) {
      document.body.style.background = `url('${profile.banner}')`;
      document.body.style.color = "white";
    }
  }
}