import elliptic from 'https://cdn.jsdelivr.net/npm/elliptic@6.6.1/+esm';

if (!getCookie("coins")) document.location.href = "/addWallet";

const coins = JSON.parse(getCookie("coins"));

let loadAnimationDone = false;

async function updateBalance() {
    let bal = 0;
    for (const coinId of Object.keys(coins)) {
        const data = await (await fetch(server + "/coin/" + coinId)).json();
        bal += data.coin.val;
        if (!loadAnimationDone) ge("balanceDisplay").innerText = bal;
    }
    if (loadAnimationDone) ge("balanceDisplay").innerText = bal;
    loadAnimationDone = true;
    ge("val").onchange = event => {
        event.target.value = Math.max(0, Math.min(bal, event.target.value));
    };
    return bal;
}

async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

let transactionId = null;

async function prepareTransaction() {
    try {
        ge("val").disabled = true;
        ge("send").disabled = true;
        ge("receiveCoin").style.display = "none";
        ge("prepareButton").disabled = true;
        const amount = ge("val").value;
        ge("status").innerText = "Downloading data...";
        const coinsDownloaded = [];
        for (const coinId of Object.keys(coins)) {
            coinsDownloaded.push({id: coinId, coin: (await (await fetch(server + "/coin/" + coinId)).json()).coin});
        }
        coinsDownloaded.sort((a, b) => b.coin.val - a.coin.val);
        console.log(coinsDownloaded);

        const EC = elliptic.ec;
        const ec = new EC('secp256k1');

        let i = 0;
        const iterCoinsDownloaded = [...coinsDownloaded];
        for (const coin of iterCoinsDownloaded) {
            if (coin.coin.val < amount && iterCoinsDownloaded.length !== i + 1) { // check if the current coin has not enough and if it's not the last coin
                if (coin.coin.val === 0) {
                    console.log("Empty coin #" + coin.id + ", removing from wallet permanently");
                    delete coins[coin.id];
                    setCookie("coins", JSON.stringify(coins));
                    continue;
                }
                ge("status").innerText = "Merging coin #" + coin.id + " and " + iterCoinsDownloaded[i + 1].id + " ...";
                const key = ec.keyFromPrivate(coins[coin.id]);
                const signHash = await sha256(iterCoinsDownloaded[i + 1].id + " " + (iterCoinsDownloaded[i + 1].coin.transactions.length) + " " + coin.coin.val);
                const sign = key.sign(signHash).toDER("hex");
                const data = await (await fetch(server + "/merge?origin=" + coin.id + "&target=" + iterCoinsDownloaded[i + 1].id + "&sign=" + sign + "&vol=" + coin.coin.val)).json();
                if (!data.message) {
                    ge("status").innerText = "An unexpected error occurred while merging: " + data.error;
                    ge("status").style.color = "var(--bad)";
                    return;
                }
                iterCoinsDownloaded[i + 1].coin.val += coin.coin.val;
                console.log("Merged coin #" + coin.id + ", removing from wallet permanently");
                delete coins[coin.id];
                setCookie("coins", JSON.stringify(coins));
            } else if (coin.coin.val >= amount) {
                if (coin.coin.val !== amount) {
                    // ledger length
                    const length = (await (await fetch(server + "/ledger-length")).json()).length + 1;

                    // split coin
                    ge("status").innerText = "Splitting coin #" + coin.id;
                    const key = ec.keyFromPrivate(coins[coin.id]);
                    const signHash = await sha256(length + " 1 " + amount);
                    const sign = key.sign(signHash).toDER("hex");
                    const data = await (await fetch(server + "/split?origin=" + coin.id + "&target=" + length + "&sign=" + sign + "&vol=" + amount)).json();
                    if (!data.message) {
                        ge("status").innerText = "An unexpected error occurred while splitting: " + data.error;
                        ge("status").style.color = "var(--bad)";
                        return;
                    }

                    const newKey = ec.genKeyPair();

                    const cycleSign = key.sign(await sha256(newKey.getPublic().encode("hex", false))).toDER("hex");
                    // cycle the keys for the new coin (this one the user keeps)
                    const dataCycle = await (await fetch(server + "/transaction?cid=" + length + "&sign=" + cycleSign + "&newholder=" + newKey.getPublic().encode("hex", false))).json();
                    if (!dataCycle.message) {
                        ge("status").innerText = "An unexpected error occurred while splitting (cycling coin): " + data.error;
                        ge("status").style.color = "var(--bad)";
                        return;
                    }

                    coins[length] = newKey.getPrivate().toString("hex");
                    setCookie("coins", JSON.stringify(coins));

                    ge("cid").innerText = length;
                    transactionId = length;
                }

                ge("status").innerText = "Preparation finished";
                ge("amountSend").innerText = amount;
                ge("send").style.display = "";
                console.log(coin);
                return;
            }
            i++;
        }
        ge("status").style.color = "var(--bad)";
        ge("status").innerText = "Insufficient funds!";
    } catch (e) {
        ge("status").style.color = "var(--bad)";
        ge("status").innerText = "An unexpected error occurred: " + e.message;
        throw e;
    }
}

async function send() {
    const EC = elliptic.ec;
    const ec = new EC('secp256k1');

    const cid = transactionId;
    const receiver = ge("receiver").value;
    const key = ec.keyFromPrivate(coins[cid]);
    const sign = key.sign(await sha256(receiver)).toDER("hex");
    // cycle teh keys for the new coin (this one the user keeps)
    const dataCycle = await (await fetch(server + "/transaction?cid=" + cid + "&sign=" + sign + "&newholder=" + receiver)).json();
    if (!dataCycle.message) {
        ge("status").innerText = "An unexpected error occurred while sending coin: " + data.error;
        ge("status").style.color = "var(--bad)";
        return;
    }
    delete coins[cid];
    setCookie("coins", JSON.stringify(coins));
    await updateBalance();
    ge("status").innerText = "Successfully sent coin to: " + receiver;
    setTimeout(() => document.location.href = '/wallet', 2000);
}

setInterval(updateBalance, 10000);

updateBalance().then();

ge("receiveCoin").onclick = () => {
    ge("receiveCoin").style.display = "none";
    ge("prepare").style.display = "none"
    ge("receive").style.display = ""
}

ge("prepare").onsubmit = event => {
    event.preventDefault();
    prepareTransaction();
}

ge("send").onsubmit = event => {
    event.preventDefault();
    send();
}

ge("receive").onsubmit = event => {
    event.preventDefault();
    if (!confirm("Please do not leave this website until you receive your funds!")) return;
    const EC = elliptic.ec;
    const ec = new EC('secp256k1');
    document.querySelector("#receive > button").disabled = true;

    const key = ec.genKeyPair();
    const pKey = key.getPublic().encode("hex", false);
    ge("address").innerText = pKey;
    ge("copy").style.display = "";
    ge("wait").style.display = "";

    const cid = parseInt(ge("transId").value);

    let done = false;

    coins[cid] = key.getPrivate().toString("hex");
    setCookie("coins", JSON.stringify(coins));

    setInterval(async () => {
        if (done) return;
        const data = await ((await fetch(server + "/coin/" + cid)).json());
        if (data.message) return;
        if (data.coin.transactions[data.coin.transactions.length - 1].holder === pKey) {
            done = true;
            await updateBalance();

            ge("wait").style.color = "var(--primary)";
            ge("wait").innerText = "Transaction successful!";

            setTimeout(() => document.location.href = '/wallet', 2000);
        }
    }, 1000);
}