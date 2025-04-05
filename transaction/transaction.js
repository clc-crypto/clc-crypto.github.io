import * as secp from 'https://esm.sh/noble-secp256k1';
import { bytesToHex, hexToBytes } from 'https://esm.sh/@noble/hashes/utils';

if (!getCookie("password")) document.location.href = "/login";

let coins = null;
loadWallet().then(c => {
    coins = c;
    updateBalance().then();
});

function changeAlert(event) {
    event.preventDefault();
    event.returnValue = "Leaving the website at this state might result in loss of funds!";
}

function newPrivate() {
    let result = '';
    const characters = '0123456789abcdef';
    for (let i = 0; i < 64; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

let loadAnimationDone = false;

async function updateBalance() {
    let bal = 0;
    for (const coinId of Object.keys(coins)) {
        const data = await (await fetch(server + "/coin/" + coinId)).json();
        bal += data.coin.val;
        if (!loadAnimationDone) ge("balanceDisplay").innerText = Math.round(bal * 1000) / 1000;
    }
    ge("balanceDisplay").innerText = Math.round(bal * 1000) / 1000;
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

        let i = 0;
        const iterCoinsDownloaded = [...coinsDownloaded];
        for (const coin of iterCoinsDownloaded) {
            if (coin.coin.val < amount && iterCoinsDownloaded.length !== i + 1) { // check if the current coin has not enough and if it's not the last coin
                if (coin.coin.val === 0) {
                    console.log("Empty coin #" + coin.id + ", removing from wallet permanently");
                    delete coins[coin.id];
                    saveWallet(coins);
                    continue;
                }
                ge("status").innerText = "Merging coin #" + coin.id + " and " + iterCoinsDownloaded[i + 1].id + " ...";
                const signHash = await sha256(iterCoinsDownloaded[i + 1].id + " " + (iterCoinsDownloaded[i + 1].coin.transactions.length) + " " + coin.coin.val);
                const sign = await secp.sign(signHash, coins[coin.id]);
                const data = await (await fetch(server + "/merge?origin=" + coin.id + "&target=" + iterCoinsDownloaded[i + 1].id + "&sign=" + sign + "&vol=" + coin.coin.val)).json();
                if (!data.message) {
                    ge("status").innerText = "An unexpected error occurred while merging: " + data.error;
                    ge("status").style.color = "var(--bad)";
                    return;
                }
                iterCoinsDownloaded[i + 1].coin.val += coin.coin.val;
                console.log("Merged coin #" + coin.id + ", removing from wallet permanently");
                delete coins[coin.id];
                saveWallet(coins);
            } else if (coin.coin.val >= amount) {
                if (coin.coin.val !== amount) {
                    // ledger length
                    const length = (await (await fetch(server + "/ledger-length")).json()).length + 1;

                    // split coin
                    ge("status").innerText = "Splitting coin #" + coin.id;
                    console.log(length + " 1 " + amount)
                    const signHash = await sha256(length + " 1 " + amount);
                    const sign = await secp.sign(signHash, coins[coin.id]);
                    const data = await (await fetch(server + "/split?origin=" + coin.id + "&target=" + length + "&sign=" + sign + "&vol=" + amount)).json();
                    if (!data.message) {
                        ge("status").innerText = "An unexpected error occurred while splitting: " + data.error;
                        ge("status").style.color = "var(--bad)";
                        return;
                    }

                    const newKey = newPrivate();

                    const cycleSign = await secp.sign(await sha256(secp.getPublicKey(newKey)), coins[coin.id]);
                    // cycle the keys for the new coin (this one the user keeps)
                    const dataCycle = await (await fetch(server + "/transaction?cid=" + length + "&sign=" + cycleSign + "&newholder=" + secp.getPublicKey(newKey))).json();
                    if (!dataCycle.message) {
                        ge("status").innerText = "An unexpected error occurred while splitting (cycling coin): " + dataCycle.message;
                        ge("status").style.color = "var(--bad)";
                        return;
                    }

                    coins[length] = newKey;
                    saveWallet(coins);

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
    const cid = transactionId;
    const receiver = ge("receiver").value;
    const sign = await secp.sign(await sha256(receiver), coins[cid]);
    // cycle the keys for the new coin (this one the user keeps)
    const dataCycle = await (await fetch(server + "/transaction?cid=" + cid + "&sign=" + sign + "&newholder=" + receiver)).json();
    if (!dataCycle.message) {
        ge("status").innerText = "An unexpected error occurred while sending coin: " + data.error;
        ge("status").style.color = "var(--bad)";
        return;
    }
    delete coins[cid];
    saveWallet(coins);
    await updateBalance();
    ge("status").innerText = "Successfully sent coin to: " + receiver;
    window.removeEventListener("beforeunload", changeAlert);
    // setTimeout(() => document.location.href = '/wallet', 2000);
}

ge("receiveCoin").onclick = () => {
    ge("receiveCoin").style.display = "none";
    ge("prepare").style.display = "none"
    ge("receive").style.display = ""
}

ge("prepare").onsubmit = event => {
    event.preventDefault();
    window.addEventListener("beforeunload", changeAlert);
    prepareTransaction();
}

ge("send").onsubmit = event => {
    event.preventDefault();
    send();
}

ge("refresh").onclick = event => {
    event.preventDefault();
    refresh();
};

let pKey = null;

async function refresh() {
    if (!pKey) alert("Something went wrong!");
    const cid = parseInt(ge("transId").value);
    const data = await ((await fetch(server + "/coin/" + cid)).json());
    if (data.message) return;
    if (data.coin.transactions[data.coin.transactions.length - 1].holder === pKey) {
        await updateBalance();

        ge("wait").style.color = "var(--primary)";
        ge("wait").innerText = "Transaction successful!";
        await updateBalance();
        window.removeEventListener("beforeunload", changeAlert);
        // setTimeout(() => document.location.href = '/wallet', 2000);
        return true;
    }
    return false;
}

ge("receive").onsubmit = async event => {
    window.addEventListener("beforeunload", changeAlert);
    event.preventDefault();
    ge("refresh").style.display = ""
    const cid = parseInt(ge("transId").value);

    if ((await ((await fetch(server + "/coin/" + cid)).json())).error) {
        return;
    }

    document.querySelector("#receive > button").disabled = true;

    const key = secp.utils.randomPrivateKey();
    const pubKey = secp.getPublicKey(key, true);
    pKey = bytesToHex(pubKey);
    ge("address").innerText = pKey;
    ge("copy").style.display = "";
    ge("wait").style.display = "";
    ge("refresh").style.display = "";

    let done = false;

    coins[cid] = bytesToHex(key);
    saveWallet(coins);
    setInterval(async () => {
        if (done) return;
        done = await refresh();
    }, 1000);
}
