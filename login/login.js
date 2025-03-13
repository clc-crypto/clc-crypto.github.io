
function createWallet() {
    setCookie("password", ge("passwd").value);

    fetch(apiServer + "/register?wallet=" + CryptoJS.AES.encrypt("{}", ge("passwd").value).toString()).then(res => res.json()).then(data => {
        alert("This is your wallet token: " + data.token + " Write it down somewhere safe, you will need it to log in the next time!");
        setCookie("token", data.token);
        document.location.href = "/wallet";
    });
}

function loginToWallet() {
    fetch(apiServer + "/wallet?token=" + ge("token").value).then(res => res.json()).then(data => {
        if (data.message) {
            ge("logInError").innerText = data.message;
            return;
        }
        if (CryptoJS.AES.decrypt(data.wallet, ge("passwdLogIn").value).toString(CryptoJS.enc.Utf8).startsWith("{")) {
            setCookie("password", ge("passwdLogIn").value);
            setCookie("token", ge("token").value);
            document.location.href = "/wallet";
        }
        else ge("logInError").innerText = "Incorrect password!";
    });
}