import * as secp from 'https://esm.sh/noble-secp256k1';
import { bytesToHex, hexToBytes } from 'https://esm.sh/@noble/hashes/utils';

if (!getCookie("password")) document.location.href = "/login";

let coins = null;
loadWallet().then(c => {
    coins = c;
    updateBalance().then();
});

let loadAnimationDone = false;

async function updateBalance() {
    let bal = 0;

    for (const coinId of Object.keys(coins)) {
        try {
            const response = await fetch(server + "/coin/" + coinId);
            const data = await response.json();

            const privateKeyBytes = hexToBytes(coins[coinId]);
            const publicKeyBytes = secp.getPublicKey(privateKeyBytes, false); // uncompressed
            const publicKeyHex = bytesToHex(publicKeyBytes);

            const lastTx = data.coin.transactions[data.coin.transactions.length - 1];

            const isInvalid =
                response.status === 400 ||
                lastTx.holder !== publicKeyHex;

            if (isInvalid && confirm(`Coin #${coinId} is invalid. Remove it permanently from your wallet?`)) {
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
            if (!loadAnimationDone)
                ge("balanceDisplay").innerText = Math.round(bal * 1000) / 1000;
        } catch (e) {
            console.log(e.message);
        }
    }

    ge("balanceDisplay").innerText = Math.round(bal * 1000) / 1000;
    loadAnimationDone = true;
    return bal;
}

setInterval(updateBalance, 60000);
