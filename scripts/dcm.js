/** Default Context Menu
 * @class Dcm
 */
class Dcm {
    /** Creates an instance of Dcm
     * @memberof Dcm
     */
    constructor() {

        Hooks.on("init", () => {// Register settings
            game.settings.register(Dcm.ID, "invert", {
                name: "Invert Keybinding",
                hint: "Only enable the default context menu when the Control key is pressed",
                scope: "client",
                config: true,
                type: Boolean,
                default: false,
                onChange: val => {
                    this.pause = val;
                    Dcm.log(false, "settings changed", this.pause);
                },
            });
            game.settings.register(Dcm.ID, "dmOnly", {
                name: "DM Only",
                hint: "Only enable the default context menu for DMs",
                scope: "world",
                config: true,
                type: Boolean,
                default: false,
            });
            // Activate listeners
            this.activateEventListeners();
        });

        // Register for DevMode
        Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
            registerPackageDebugFlag(Dcm.ID);
        });
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

    /** Store whether Foundry's context menu is "paused" privately
     * @memberof Dcm
     */
    #pause = false;

    /** Get whether Foundry's context menu is "paused"
     * @memberof Dcm
     */
    get pause() { return this.#pause; };

    /** Runs when the pause value is changed and updates the state icon
     * @memberof Dcm
     */
    set pause(value) {
        Dcm.log(false, "pause set to", value);
        this.#pause = value;
    };

    /** Activate event listeners which handle Ctrl key down, Ctrl key up, and right-click
     * @memberof Dcm
     */
    activateEventListeners() {
            this.registerKeybindings();
        if (game.settings.get(Dcm.ID, "showStateIcon")) this.displayStateIcon();

        // Default value
        this.pause = !!game.settings.get(Dcm.ID, "invert");

            // Show the context menu, depending on if it's paused or not and if it's DM only
            document.addEventListener("contextmenu", event => {
            if (!this.pause && (!game.settings.get(Dcm.ID, "dmOnly") || game.user.isGM)) event.stopPropagation();
            Dcm.log(false, "contextmenu", !this.pause);
            }, true);
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
                this.pause = !game.settings.get(Dcm.ID, "invert");

                Dcm.log(false, "keydown | pause:", this.pause, "; Invert:", game.settings.get(Dcm.ID, "invert"));

                // Return to default after ten seconds
                setTimeout(() => this.pause = game.settings.get(Dcm.ID, "invert"), 10000);
            },

            // If Ctrl key is let go, unpause showing the context menu
            onUp: () => {
                this.pause = !!game.settings.get(Dcm.ID, "invert");

                Dcm.log(false, "keyup | pause:", this.pause, "; Invert:", game.settings.get(Dcm.ID, "invert"));
            },
        });
    };
};
new Dcm();

// Default           ; keydown: pause = true  ; keyup: pause = false
// If invert = false ; keydown: pause = true  ; keyup: pause = false
// If invert = true  ; keydown: pause = false ; keyup: pause = true
