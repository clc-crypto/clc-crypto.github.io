function stats() {
    fetch(server + "/ledger-length").then(res => res.json()).then(data => {
        document.getElementById("infoHeight").innerText = data.length + 1;
    });
    fetch(server + "/circulation").then(res => res.json()).then(data => {
        document.getElementById("infoCirculation").innerText = Math.round(data.circulation * 100) / 100 + " CLC";
    });
    fetch(server + "/get-challenge").then(res => res.json()).then(data => {
        const target = BigInt("0x" + data.diff);
        const MAX_TARGET = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"); // or your own base
        const difficulty = MAX_TARGET / target;
        const hashrate = difficulty / 60n;

        function formatHashrate(hr) {
            const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s'];
            let rate = Number(hr);
            let i = 0;
            while (rate >= 1000 && i < units.length - 1) {
                rate /= 1000;
                i++;
            }
            return `${rate.toFixed(2)} ${units[i]}`;
        }

        document.getElementById("hashrate").innerText = formatHashrate(hashrate);
    });
}

stats();
setInterval(stats, 5000);