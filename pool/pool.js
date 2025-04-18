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
    const ps = document.getElementById("poolSecret").value;
    const addr = document.getElementById("receiver").value;
    if (ps === "") {
        document.getElementById("error").innerText = "please provide your pool secret";
        return;
    }
    fetch(poolServer + "/payout/" + ps + "?addr=" + addr).then(res => res.json()).then(data => {
        if (data.error) document.getElementById("error").innerText = data.error;
        else {
            document.getElementById("payoutAddr").innerHTML = "Transaction id #<span style='color: var(--primary)'>" + data.id + "</span>";
            document.getElementById("payoutAddr").style.display = "";
        }
    });
}