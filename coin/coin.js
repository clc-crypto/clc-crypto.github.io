const id = parseInt(new URLSearchParams(document.location.search).get("id"));
if (id === undefined || id === null || isNaN(id)) document.location.href = "/explore"

const height = parseInt(new URLSearchParams(document.location.search).get("height"));
ge("id").innerText = "#" + id;

function bigIntToExponential(bigint) {
    let str = bigint.toString();
    let length = str.length;

    // Convert to scientific notation format: first digit . rest of digits * 10^(length-1)
    let firstDigit = str[0];
    let restDigits = str.slice(1, 5);

    return `${firstDigit}.${restDigits}e+${length - 1}`;
}

fetch(server + "/coin/" + id).then(res => res.json()).then(data => {
    const coin = data.coin;
    console.log(coin);


    ge("val").innerText = coin.val;
    ge("genesis").innerText = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    }).format(new Date(coin.genesisTime));
    if (coin.hash) {
        ge("hash").innerText = coin.hash;
        ge("diff").innerText = bigIntToExponential(BigInt("0x" + coin.diff));
    } else {
        ge("hash").innerText = "Split";
        ge("diff").innerText = "Split";
    }

    const transElement = ge("transactions");

    let i = 0;
    for (const trans of coin.transactions) {
        const e = document.createElement("adiv");
        e.className = "transactionElement";
        e.id = "trans" + i;
        e.onclick = (function(index) {
            return function() {
                document.location.href = "/coin/transaction?id=" + id + "&height=" + index;
            }
        })(i);

        const holderE = document.createElement("p");
        holderE.innerText = trans.holder.slice(0, 5) + "..." + trans.holder.slice(-6);
        e.appendChild(holderE);

        const valAtTrans = document.createElement("p");
        valAtTrans.innerText = "...";
        valAtTrans.style.color = "var(--text-light)";
        valAtTrans.id = "val" + i;
        e.appendChild(valAtTrans);

        transElement.appendChild(e);
        if (!trans.transformation) transElement.appendChild(document.createElement("div"));
        else {
            const transformE = document.createElement("div");
            transformE.className = "merge";
            transformE.id = "merge" + i;

            const mergeArrow = document.createElement("div");
            mergeArrow.className = "mergeArrow";
            if (trans.transformation.origin !== undefined) mergeArrow.style.backgroundColor = "var(--good)";
            else mergeArrow.style.backgroundColor = "var(--bad)";
            transformE.appendChild(mergeArrow);

            const mergeGeneralDetails = document.createElement("div");
            mergeGeneralDetails.className = "mergeGeneralDetails";

            const vol = document.createElement("h3");
            vol.innerHTML = `<span style='color: ${trans.transformation.origin !== undefined ? "var(--good)" : "var(--bad)"}; font-weight: 900;'>${trans.transformation.vol > 0 ? "+" : ""}${trans.transformation.vol}</span> CLC`;
            mergeGeneralDetails.appendChild(vol);

            const mergeCoin = document.createElement("h3");
            mergeCoin.innerHTML = `Merge ${trans.transformation.origin !== undefined ? "from" : "to"} <a href="/coin?id=${trans.transformation.origin !== undefined ? trans.transformation.origin : trans.transformation.target}&height=${trans.transformation.height}">#${trans.transformation.origin  !== undefined ? trans.transformation.origin : trans.transformation.target}</a>`;
            mergeGeneralDetails.appendChild(mergeCoin);

            transformE.appendChild(mergeGeneralDetails)

            transElement.appendChild(transformE);
        }
        i++;
    }

    let val = null;
    i = coin.transactions.length - 1;
    for (const trans of coin.transactions.reverse()) {
        if (val === null) {
            val = coin.val;
        }
        ge("val" + i).innerText = val;
        if (val === 0) ge("val" + i).style.color = "var(--bad)";
        else ge("val" + i).style.color = "var(--primary)";
        if (trans.transformation) val -= trans.transformation.vol;
        i--;
    }

    // scroll to height if specified
    if (height) {
        scrollToElement("trans" + height);
        ge("merge" + height).style.background = "var(--sbg)";
    }
});