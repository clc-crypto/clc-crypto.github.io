const footer = document.createElement("div");
footer.className = "footer";

const cc = document.createElement("p");
cc.innerText = "© Icy @ CLC Crypto " + new Date().getFullYear() + ", all rights reserved.";

footer.appendChild(cc);

document.body.appendChild(footer);