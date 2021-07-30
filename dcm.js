Hooks.on("init", () => {
    document.addEventListener("contextmenu", event => event.stopPropagation(), true);
});