function randomCoin() {
    fetch(server + "/ledger-length").then(res => res.json()).then(data => {
        document.location.href = "/coin?id=" + Math.round(Math.random() * (data.length - 1));
    });
}