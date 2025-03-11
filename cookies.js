// Function to get a cookie value by name
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

// Function to set a cookie with name, value, and optional expiration days
function setCookie(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
}

// Function to delete all cookies
function deleteAllCookies() {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key] = cookie.split('=');
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }
}

server = "https://clc.ix.tc";
