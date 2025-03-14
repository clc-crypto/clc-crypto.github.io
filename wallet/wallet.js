import elliptic from 'https://cdn.jsdelivr.net/npm/elliptic@6.6.1/+esm';

if (!getCookie("password")) document.location.href = "/login";

let coins = null;
loadWallet().then(c => {
    coins = c;
    updateBalance().then();
});

let loadAnimationDone = false;

const EC = elliptic.ec;
const ec = new EC('secp256k1');

async function updateBalance() {
    let bal = 0;
    for (const coinId of Object.keys(coins)) {
        try {
            const response = await fetch(server + "/coin/" + coinId);
            const data = await response.json();

            const key = ec.keyFromPrivate(coins[coinId]);
            if ((response.status === 400 || data.coin.transactions[data.coin.transactions.length - 1].holder !== key.getPublic().encode("hex", false)) && confirm("Coin #" + coinId + " is invalid. Would you like to remove it permanently from your wallet?")) {
                delete coins[coinId];
                await saveWallet(coins);
                continue;
            }
            if (data.coin.val === 0) {
                delete coins[coinId];
                await saveWallet(coins);
                continue;
            }

            bal += data.coin.val;
            if (!loadAnimationDone) ge("balanceDisplay").innerText = Math.round(bal * 1000) / 1000;
        } catch (e) {
            console.log(e.message)
        }
    }
    ge("balanceDisplay").innerText = Math.round(bal * 1000) / 1000;
    loadAnimationDone = true;
    return bal;
}

setInterval(updateBalance, 60000);