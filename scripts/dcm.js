/** Default Context Menu
 * @class Dcm
 */
class Dcm {
    /** Creates an instance of Dcm
     * @memberof Dcm
     */
    constructor() {
        // Register settings
        Hooks.on("init", () => {
            game.settings.register(Dcm.ID, "invert", {
                name: "Invert Keybinding",
                hint: "Only enable the default context menu when the Control key is pressed",
                scope: "client",
                config: true,
                type: Boolean,
                default: false,
                onChange: val => { Dcm.pause = val; Dcm.log(false, "settings changed", Dcm.pause); },
            });
            game.settings.register(Dcm.ID, "dmOnly", {
                name: "DM Only",
                hint: "Only enable the default context menu for DMs",
                scope: "world",
                config: true,
                type: Boolean,
                default: false,
            });
        });

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
    static pause = false;

    /** Activate event listeners which handle Ctrl key down, Ctrl key up, and right-click
     * @memberof Dcm
     */
    activateEventListeners() {
        Hooks.on("init", async () => {
            // Default value
            Dcm.pause = !!game.settings.get(Dcm.ID, "invert");
            this.registerKeybindings();

            // Show the context menu, depending on if it's paused or not and if it's DM only
            document.addEventListener("contextmenu", event => {
                if (!Dcm.pause && (!game.settings.get("dcm", "dmOnly") || game.user.isGM)) event.stopPropagation();
                Dcm.log(false, "contextmenu", !Dcm.pause);
            }, true);
        });
    };

    /** Register keybindings
     * @memberof Dcm
     */
    registerKeybindings() {
        game.keybindings.register(Dcm.ID, "pauseContextMenu", {
            name: "Pause Context Menu",
            hint: "Pause showing the Default Context Menu",
            uneditable: [
                { key: "CONTROL" }
            ],
            // If Ctrl key is pressed, pause showing the context menu
            onDown: () => {
                Dcm.pause = !game.settings.get(Dcm.ID, "invert");

                Dcm.log(false, "keydown | pause:", Dcm.pause, "; Invert:", game.settings.get(Dcm.ID, "invert"));
            },

            // If Ctrl key is let go, unpause showing the context menu
            onUp: () => {
                Dcm.pause = !!game.settings.get(Dcm.ID, "invert");

                Dcm.log(false, "keyup | pause:", Dcm.pause, "; Invert:", game.settings.get(Dcm.ID, "invert"));
            },
        });
    };
};
new Dcm();

// Default           ; keydown: pause = true  ; keyup: pause = false
// If invert = false ; keydown: pause = true  ; keyup: pause = false
// If invert = true  ; keydown: pause = false ; keyup: pause = true
