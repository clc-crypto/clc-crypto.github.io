if (getCookie("coins")) document.location.href = "/wallet";

function createWallet() {
    setCookie("coins", JSON.stringify({}));
    setCookie("password", ge("passwd").value);
    alert("Your wallet is stored locally in your browser for this session. After every session DOWNLOAD YOUR WALLET to import it the next time. Failure to do so will result in loss of funds, which we are not responsible for.")
    document.location.href = "/wallet";
}

function importWallet() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.wallet';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                let decrypted = "";
                try {
                    decrypted = CryptoJS.AES.decrypt(e.target.result, ge("passwdImport").value).toString(CryptoJS.enc.Utf8);
                } catch (e) {
                    alert("Invalid password!");
                    return;
                }

                if (!decrypted.startsWith("{") || !decrypted.endsWith("}")) {
                    alert("Invalid wallet format!");
                    return;
                }

                setCookie("coins", decrypted);
                setCookie("password", ge("passwdImport").value);
                document.location.href = "/wallet";
            };
            reader.readAsText(file);
        }
    };
    input.click();
}