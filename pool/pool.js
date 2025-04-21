const poolServer = "https://pool.clc.ix.tc";

function checkRewards(event) {
    event.preventDefault();
    const ps = document.getElementById("poolSecret").value;
    if (ps === "") {
        document.getElementById("error").innerText = "please provide your pool secret";
        return;
    }
    fetch(poolServer + "/total/" + ps).then(res => res.json()).then(data => {
        const total = Math.round(data.total * 100) / 100;
        document.getElementById("total").innerHTML = total + "<span style='color: var(--primary)'>CLC</span>";
    });
}

function payout(event) {
    event.preventDefault();
    const form = document.getElementById('poForm');
    const elements = form.elements;

    for (let i = 0; i < elements.length; i++) {
        elements[i].disabled = true;
    }

    const ps = document.getElementById("poolSecret").value;
    if (ps === "") {
        document.getElementById("error").innerText = "please provide your pool secret";
        return;
    }
    fetch(poolServer + "/payout/" + ps).then(res => res.json()).then(data => {
        if (data.error) {
            if (data.error === "Already in the paying out process.") {
                fetch(poolServer + "/process/" + ps).then(res => res.json()).then(data => {
                    if (!data.error) {
                        document.getElementById("transid").innerText = "(Recovered) Transaction ID: " + data.id;
                        document.getElementById("finish").style.display = "";
                    }
                });
                return
            }
            document.getElementById("error").innerText = data.error;
        }
        if (!data.error || data.error !== "Already paid out your rewards, or you have not yet mined any.") document.getElementById("finish").style.display = "";
        if (!data.error) document.getElementById("transid").innerText = "Transaction ID: " + data.id;
    });
}

function finish(event) {
    event.preventDefault();
    const ps = document.getElementById("poolSecret").value;
    const addr = document.getElementById("receiver").value;
    if (ps === "") {
        document.getElementById("error").innerText = "please provide your pool secret";
        return;
    }
    fetch(poolServer + "/finish/" + ps + "?addr=" + addr).then(res => res.json()).then(data => {
        if (data.error) document.getElementById("error").innerText = data.error;
        else document.getElementById("success").style.display = "";
    });
}