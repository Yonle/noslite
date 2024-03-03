let privkey = localStorage.getItem("privkey");

if (!privkey) $("#loginbutton")[0].style.display = "block";
else {
  $("#myaccbutton")[0].style.display = "block";
  $("#pubkey")[0].value = window.NostrTools.nip19.npubEncode(window.NostrTools.getPublicKey(privkey));
}

function makeAccount() {
  privkey = window.NostrTools.generatePrivateKey();
  applyaccountchange();
}

function applyaccountchange() {
  localStorage.setItem("privkey", privkey);
  $("#myaccbutton")[0].style.display = privkey ? "block" : "none";
  $("#loginbutton")[0].style.display = privkey ? "none" : "block";
  $("#pubkey")[0].value = privkey ? window.NostrTools.nip19.npubEncode(window.NostrTools.getPublicKey(privkey)) : "";
}

function copyPK() {
  navigator.clipboard.writeText(window.NostrTools.nip19.nsecEncode(privkey)).then(_ =>
    alert("Succesfully Copied.")).catch(_ => alert("Failed to copy. But here's your privkey:\n" + privkey));
}

function logout() {
  if (!confirm("Are you sure to logout? Ensure that you've stored your private key in the safe place, or you will not be able to come back with the same account.")) return;
  privkey = "";
  applyaccountchange();
  location.hash = "#";
}

function login() {
  privkey = $("#privkey")[0].value;
  privkey = privkey.startsWith("nsec") ? window.NostrTools.nip19.decode(privkey).data : privkey;
  applyaccountchange();
  location.hash = "#myaccount";
}

async function signEvent(event) {
  event.created_at = Math.floor(Date.now() / 1000);

  if (!privkey && window.nostr && typeof(window.nostr) === "object") {
    event = await window.nostr.signEvent(event);
  } else {
    if (!privkey) return alert("Atleast an working NIP-07 or you've logged in.");
    event.pubkey = window.NostrTools.getPublicKey(privkey);
    event.id = window.NostrTools.getEventHash(event);
    event.sig = window.NostrTools.getSignature(event, privkey);
  }
  
  return event;
}

async function post() {
  const event = {
    kind: 1,
    content: $("#textareapost")[0].value,
    tags: []
  };
  
  const signed = await signEvent(event);
  if (!signed) return;
  pool.publish(relays, signed);
  $("#textareapost")[0].value = "";
  location.hash = "#";
}