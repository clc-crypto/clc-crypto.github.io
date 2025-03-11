import elliptic from 'https://cdn.jsdelivr.net/npm/elliptic@6.6.1/+esm';

function downloadFile(filename, content, mimeType = 'text/plain') {
    // Create a Blob with the specified content and type
    const blob = new Blob([content], { type: mimeType });

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;

    // Append to the document, trigger download, and remove the element
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Release the object URL to free memory
    URL.revokeObjectURL(a.href);
}

if (!getCookie("coins")) document.location.href = "/addWallet";

const coins = JSON.parse(getCookie("coins"));

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
                setCookie("coins", JSON.stringify(coins));
                continue;
            }
            if (data.coin.val === 0) {
                delete coins[coinId];
                setCookie("coins", JSON.stringify(coins));
                continue;
            }

            bal += data.coin.val;
            if (!loadAnimationDone) ge("balanceDisplay").innerText = bal;
        } catch (e) {
            console.log(e.message)
        }
    }
    if (loadAnimationDone) ge("balanceDisplay").innerText = bal;
    loadAnimationDone = true;
    return bal;
}

function downloadWallet() {
    let currentDate = new Date();

    let year = currentDate.getFullYear().toString().slice(-2); // Last two digits of the year
    let month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month (0-based, so +1)
    let day = currentDate.getDate().toString().padStart(2, '0'); // Day
    downloadFile("clc." + `${year}-${month}-${day}` + ".wallet", CryptoJS.AES.encrypt(JSON.stringify(coins), getCookie("password")).toString());
}

ge("downloadWalletBtn").onclick = () => downloadWallet();

setInterval(updateBalance, 60000);

updateBalance().then();