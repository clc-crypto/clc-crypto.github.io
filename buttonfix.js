for (const btn of document.querySelectorAll("button")) {
    btn.addEventListener("mouseout", function () {
        this.blur();
    });
    btn.addEventListener("mouseup", function () {
        this.blur();
    });
}