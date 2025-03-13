function formatHashrate(hashesPerSec) {
    const units = ["H/s", "KH/s", "MH/s", "GH/s", "TH/s", "PH/s", "EH/s"];
    let i = 0;

    while (hashesPerSec >= 1000 && i < units.length - 1) {
        hashesPerSec /= 1000;
        i++;
    }

    return `${hashesPerSec.toFixed(2)} ${units[i]}`;
}

function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 365) {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
}

let timeStamp = 0;
setInterval(() => {
    if (timeStamp) ge("refreshed").innerText = timeAgo(timeStamp);
}, 10);

function monitor() {
    fetch(apiServer + "/report-get?user=" + ge("user").value).then(res => res.json()).then(data => {
        fetch(server + "/get-challenge").then(res => res.json()).then(dataChallenge => {
            ge("speed").innerText = formatHashrate(data.speed);
            ge("mined").innerText = data.mined;
            ge("progress").innerText = data.best.slice(0, 18) + "... / " + dataChallenge.diff.slice(0, 18) + "...";
            setTimeout(() => monitor(), 9000);
            timeStamp = data.timeStamp;
            ge("stats").style.display = "";
        });
    }).catch(e => {
        ge("stats").style.display = "none";
        ge("error").innerText = "Invalid user!"
        ge("error").style.display = "";
    });
}

function startMonitoring() {
    setCookie("user", ge("user").value);
    ge("error").style.display = "none";
    monitor();
}

if (getCookie("user")) {
    ge("user").value = getCookie("user");
    startMonitoring();
}