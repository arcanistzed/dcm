/** Default Context Menu
 * @class Dcm
 */
class Dcm {
    /** Creates an instance of Dcm
     * @memberof Dcm
     */
    constructor() {
        // Register settings
        Hooks.on("init", () => game.settings.register(Dcm.ID, "invert", {
            name: "Invert Keybinding",
            hint: "Only enable the default context menu when the Control key is pressed",
            scope: "client",
            config: true,
            type: Boolean,
            default: false,
            onChange: val => { this.pause = val; Dcm.log(false, "settings changed", this.pause) },
        }));

        // Register for DevMode
        Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
            registerPackageDebugFlag(Dcm.ID);
        });

        // Activate listeners
        this.activateEventListeners();
    };

    /** Module ID
     * @static
     * @memberof Dcm
     */
    static ID = "dcm";

    /** DevMode logging helper
     * @static
     * @param {Boolean} force - Whether to force logging
     * @param {*} args - Arguments to log
     * @memberof Dcm
     */
    static log(force, ...args) {
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(Dcm.ID);
        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        };
    };

    /** Whether Foundry's context menu is "paused"
     * @memberof Dcm
     */
    pause;

    /** Activate event listeners which handle Ctrl key down, Ctrl key up, and right-click
     * @memberof Dcm
     */
    activateEventListeners() {
        // If Ctrl key is pressed, pause showing the context menu
        document.addEventListener("keydown", event => {
            if (event.key === "Control") this.pause = !game.settings.get(Dcm.ID, "invert");
            Dcm.log(false, "keydown | pause:", this.pause, "; Invert:", game.settings.get(Dcm.ID, "invert"));
        });

        // If Ctrl key is let go, unpause showing the context menu
        document.addEventListener("keyup", event => {
            if (event.key === "Control") this.pause = game.settings.get(Dcm.ID, "invert");
            Dcm.log(false, "keyup | pause:", this.pause, "; Invert:", game.settings.get(Dcm.ID, "invert"));
        });

        // Show the context menu, depending on if it's paused or not
        document.addEventListener("contextmenu", event => {
            if (!this.pause) event.stopPropagation();
            Dcm.log(false, "contextmenu", !this.pause);
            this.pause = game.settings.get(Dcm.ID, "invert");
        }, true);
    };
};
new Dcm();

// Default           ; keydown: pause = true  ; keyup: pause = false
// If invert = false ; keydown: pause = true  ; keyup: pause = false
// If invert = true  ; keydown: pause = false ; keyup: pause = true
