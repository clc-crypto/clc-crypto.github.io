function createWallet() {
    setCookie("password", ge("passwd").value);
    const encryptedWallet = CryptoJS.AES.encrypt(
        JSON.stringify({}),
        getCookie("password")
    ).toString();

    fetch(apiServer + "/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            wallet: encryptedWallet
        }),
    }).then(response => response.json()).then(data => {
        alert("This is your wallet token: " + data.token + " Write it down somewhere safe and DO NOT SHARE IT, you will need it to log in the next time! (You can take a screenshot)");
        setCookie("token", data.token);
        document.location.href = "/wallet";
    }).catch(error => console.error("Error creating wallet:", error));
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