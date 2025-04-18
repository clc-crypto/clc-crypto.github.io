function stats() {
    fetch(server + "/ledger-length").then(res => res.json()).then(data => {
        document.getElementById("infoHeight").innerText = data.length + 1;
    });
    fetch(server + "/circulation").then(res => res.json()).then(data => {
        document.getElementById("infoCirculation").innerText = Math.round(data.circulation * 100) / 100 + " CLC";
    });
}

stats();
setInterval(stats, 5000);