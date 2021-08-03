Hooks.on("init", () => {

    // Whether or not to pause showing the context menu
    let pause = false;

    // If Ctrl key is pressed, pause showing the context menu
    document.addEventListener("keydown", event => {
        if (event.key === "Control") pause = true;
    });

    // If Ctrl key is let go, unpause showing the context menu
    document.addEventListener("keyup", event => {
        if (event.key === "Control") pause = false;
    });

    // Show the context menu, depending on if it's paused or not
    document.addEventListener("contextmenu", event => {
        if (!pause) event.stopPropagation();
    }, true);
});