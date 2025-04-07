if (!getCookie("password")) document.location.href = "/login";

let coins = null;
loadWallet().then(c => {
    coins = c;
    updateBalance().then();
})
let loadAnimationDone = false;

async function updateBalance() {
    let bal = 0;
    for (const coinId of Object.keys(coins)) {
        const data = await (await fetch(server + "/coin/" + coinId)).json();
        bal += data.coin.val;
        if (!loadAnimationDone) ge("balanceDisplay").innerText = Math.round(bal * 1000) / 100;
    }
    ge("balanceDisplay").innerText = Math.round(bal * 1000) / 1000;
    loadAnimationDone = true;
    return Math.round(bal * 1000) / 1000;
}

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

async function importCoins() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.coin';

    input.addEventListener('change', async (event) => {
        const files = event.target.files;

        for (const file of files) {
            console.log(`File Name: ${file.name}`);

            if (coins[file.name.replace(".coin", "")]) {
                console.log(file.name.replace(".coin", ""), "is already imported, omitting...");
                continue;
            }
            coins[file.name.replace(".coin", "")] = await readFileAsync(file);
        }
        saveWallet(coins);
        await updateBalance();
    });

    input.click();
}

setInterval(updateBalance, 10000);
