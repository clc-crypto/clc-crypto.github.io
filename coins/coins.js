if (!getCookie("password")) document.location.href = "/login";

let coins = null;
loadWallet().then(c => {
    coins = c;
    updateBalance().then();

    (async () =>{
        for (const id in coins) {
            const data = await (await fetch(server + "/coin/" + id)).json();
            const coinData = data.coin;

            const cE = document.createElement("div");
            cE.className = "coinElement";

            const idE = document.createElement("a");
            idE.innerText = "#" + id;
            idE.className = "coinId";
            idE.href = "/coin?id=" + id;

            cE.appendChild(idE);

            const valE = document.createElement("p");
            valE.innerText = coinData.val + " CLC";

            cE.appendChild(valE);

            const pKey = document.createElement("p");
            pKey.innerHTML = "<span style='color: var(--text-light)'>Public key:</span> <span style='color: var(--primary)'>" + coinData.transactions[coinData.transactions.length - 1].holder + "</span>";
            pKey.className = "coinPKey";

            cE.appendChild(pKey);

            const privKey = document.createElement("p");
            privKey.innerHTML = "Click to show private key";
            privKey.style.color = "var(--text-light)";
            privKey.className = "privKey";
            privKey.onclick = () => {
                privKey.innerHTML = coins[id] + ` <span style="color: var(--text-light)">Click to copy</span>`;
                privKey.style.color = "";
                privKey.onclick = () => {
                    const textarea = document.createElement('textarea');
                    textarea.value = coins[id];
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    privKey.innerHTML = coins[id] + ` <span style="color: var(--text-light)">Copied!</span>`;
                    setTimeout(() => privKey.innerHTML = coins[id] + ` <span style="color: var(--text-light)">Click to copy</span>`, 1000);
                }
            }

            cE.appendChild(privKey);

            ge("coins").appendChild(cE);
        }
    })();
});

let loadAnimationDone = false;

async function updateBalance() {
    let bal = 0;
    for (const coinId of Object.keys(coins)) {
        const data = await (await fetch(server + "/coin/" + coinId)).json();
        bal += data.coin.val;
        if (!loadAnimationDone) ge("balanceDisplay").innerText = bal;
    }
    ge("balanceDisplay").innerText = bal;
    loadAnimationDone = true;
    return bal;
}

setInterval(updateBalance, 60000);