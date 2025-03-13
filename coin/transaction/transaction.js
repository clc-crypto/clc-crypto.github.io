const id = parseInt(new URLSearchParams(document.location.search).get("id"));
const height = parseInt(new URLSearchParams(document.location.search).get("height"));

if (id === undefined || id === null || isNaN(id)) document.location.href = "/explore";
if (height === undefined || height === null || isNaN(id)) document.location.href = "/explore";

ge("id").innerText = "#" + id + " at :" + height;

fetch(server + "/coin/" + id).then(res => res.json()).then(data => {
    const coin = data.coin;
    console.log(coin);
    if (!coin.transactions[height]) document.location.href = "/explore";
    const trans = coin.transactions[height];
    ge("holder").innerText = trans.holder;
    ge("signature").innerText = trans.transactionSignature;

    if (trans.transformation) {
        const transform = trans.transformation;
        ge("mergeData").style.display = "";
        ge("mergeCoin").innerHTML = (transform.origin !== undefined ? "from " : "into ") + `<a href="/coin/?id=${transform.origin !== undefined ? transform.origin : transform.target}&height=${transform.height}">#` + (transform.origin !== undefined ? transform.origin : transform.target) + "</a>";
        ge("vol").innerText = transform.vol + " CLC";
        ge("vol").style.color = transform.vol > 0 ? "var(--good)" : "var(--bad)";
        if (transform.originSignature) ge("mergeSign").innerText = transform.originSignature;
        else ge("mergeSignAll").style.display = "none";
    }
});