const ps = $("#ps")[0];
const bb = $("#bb")[0];
const cl = $("#cl")[0];

const br = document.createElement("br");
const nav = $("#nav")[0];

async function mpe(e) {
  if (!window.NostrTools.validateEvent(e) || !window.NostrTools.verifySignature(e)) return;
  if (!authors[e.pubkey]) authors[e.pubkey] = {};

  const tags = new Map(e?.tags.filter(i => !i.includes(i.id)));
  const p = document.createElement("div"); //div cont
  const u = document.createElement("a"); //user
  const d = document.createElement("a"); //date
  const c = document.createElement("pre"); //content

  p.id = "n_" + e.id;
  u.setAttribute("onclick", `lp("${e.pubkey}")`);
  d.setAttribute("onclick", `lt("${e.id}")`);
  p.classList.add("p");
  u.classList.add("u");
  d.classList.add("d");
  c.classList.add("c");

  u.classList.add("u_" + e.pubkey);

  u.innerText = authors[e.pubkey]?.meta_name || authors[e.pubkey]?.name || e.pubkey.slice(0, 5) + ":" + e.pubkey.slice(e.pubkey.length - 5);
  d.innerText = (new Date(e.created_at * 1000)).toLocaleString("ia");
  c.innerText = e.content;
  c.innerHTML = rt(c.innerHTML);
  
  u.href = "#u_" + e.pubkey;
  d.href = "#n_" + e.id;
  
  p.appendChild(u);
  p.appendChild(d);
  p.appendChild(br.cloneNode(true));
  
  if (tags.has("e")) {
    const reply = await pool.get(relays, {
      kinds: [1],
      "ids": [tags.get("e")]
    });

    if (reply) {
      const rp = await mpe(reply);
      rp.classList.add("i");
      p.appendChild(rp);
    }
  }

  p.appendChild(c);
  p.appendChild(br.cloneNode(true));
  
  bb.innerHTML = "";
  bb.appendChild(u.cloneNode(true));
  bb.appendChild(d.cloneNode(true));
  bb.appendChild(br.cloneNode(true));
  bb.innerHTML += c.innerText.slice(0, 110) + ((c.innerText.length > 110) ? "...." : "");
  bb.style.visibility = "visible";
  return p;
}

function sp(d) {
  if (!window.NostrTools.validateEvent(d) || !window.NostrTools.verifySignature(d)) return;
  const j = JSON.parse(d.content);
  authors[d.pubkey] = j;
  for (i of $(".u_" + d.pubkey)) {
    i.innerText = j.meta_name || j.name || d.pubkey.slice(0, 5) + ":" + d.pubkey.slice(5, 10);
  }
}

function tme(u) {
  return encodeURI(u);
}

function mme(t) {
  return t.split(" ").map(line => {
    if (!line.startsWith("http")) return line;
    const path = line.split("?")[0];

    // Videos
    for (ex of ["mp4", "mov", "webm", "ogv"]) {
      if (path.endsWith("." + ex)) {
        return `<video loading="lazy" controls src="${tme(line)}"></video>`;
        break;
      }
    }

    // Audios
    for (ex of ["mp3", "aac", "weba", "m4a", "flac", "wav", "ogg", "oga", "opus"]) {
      if (path.endsWith("." + ex)) {
        return `<audio loading="lazy" controls src="${tme(line)}"></audio>`;
        break;
      }
    }

    // Images
    for (ex of ["jpg", "jpeg", "png", "apng", "webp", "avif", "gif"]) {
      if (path.endsWith("." + ex)) {
        return `<a href="${encodeURI(line)}"><img loading="lazy" src="${tme(line)}" /></a>`
        break;
      }
    }
    return line;
  }).join(" ");
}

function rt(t) {
  return t
    .split("<br>").map(mme).join("<br>");
}

bb.onclick = _ => bb.style.visibility = "hidden";
setInterval(_ => {
  cl.innerText = (new Date()).toLocaleTimeString();
}, 500);
