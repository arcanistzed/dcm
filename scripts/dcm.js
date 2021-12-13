/** Default Context Menu
 * @class Dcm
 */
class Dcm {
    /** Creates an instance of Dcm
     * @memberof Dcm
     */
    constructor() {
        Hooks.on("init", () => {
            // Register settings
            game.settings.register(Dcm.ID, "invert", {
                name: game.i18n.localize("dcm.settings.invert.name"),
                hint: game.i18n.localize("dcm.settings.invert.hint"),
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
                name: game.i18n.localize("dcm.settings.dmOnly.name"),
                hint: game.i18n.localize("dcm.settings.dmOnly.hint"),
                scope: "world",
                config: true,
                type: Boolean,
                default: false,
            });
            game.settings.register(Dcm.ID, "showStateIcon", {
                name: game.i18n.localize("dcm.settings.showStateIcon.name"),
                hint: game.i18n.localize("dcm.settings.showStateIcon.hint"),
                scope: "client",
                config: true,
                type: Boolean,
                default: true,
            });
            game.settings.register(Dcm.ID, "timeoutDuration", {
                name: game.i18n.localize("dcm.settings.timeoutDuration.name"),
                hint: game.i18n.localize("dcm.settings.timeoutDuration.hint"),
                scope: "client",
                config: true,
                type: Number,
                range: {
                    min: 1,
                    max: 60,
                    step: 1
                },
                default: 10,
            });

            // Activate listeners
            this.activateEventListeners();

            // Expose API
            game.modules.get(Dcm.ID).pause = this.pause;
        });

        // Register for DevMode
        Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
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
        const state = document.querySelector(`#${Dcm.ID}-state`);
        if (game.settings.get(Dcm.ID, "showStateIcon") && state) !value ? state.style.opacity = "75%" : state.style.opacity = "20%";
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
            name: game.i18n.localize("dcm.keybindings.pauseContextMenu.name"),
            hint: game.i18n.localize("dcm.keybindings.pauseContextMenu.hint"),
            uneditable: [
                { key: "CONTROL" }
            ],
            // If Ctrl key is pressed, pause showing the context menu
            onDown: () => {
                this.pause = !game.settings.get(Dcm.ID, "invert");

                Dcm.log(false, "keydown | pause:", this.pause, "; Invert:", game.settings.get(Dcm.ID, "invert"));

                // Return to default after the timeout elapses
                setTimeout(() => this.pause = game.settings.get(Dcm.ID, "invert"), game.settings.get(Dcm.ID, "timeoutDuration") * 1000);
            },

            // If Ctrl key is let go, unpause showing the context menu
            onUp: () => {
                this.pause = !!game.settings.get(Dcm.ID, "invert");

                Dcm.log(false, "keyup | pause:", this.pause, "; Invert:", game.settings.get(Dcm.ID, "invert"));
            },
        });
    };

    /** State Icon
     * @return {HTMLDivElement} - The state icon 
     * @memberof Dcm
     */
    async displayStateIcon() {
        const state = document.createElement("div")
        state.id = `${Dcm.ID}-state`;
        state.innerHTML = await fetch(`modules/${Dcm.ID}/assets/context-menu.svg`).then(r => r.text());
        mergeObject(state.style, {
            width: "32px",
            height: "32px",
            padding: "2px 0",
            marginBottom: "5px",
            backgroundColor: "white",
            borderRadius: "5px",
            border: "4px outset",
            opacity: this.pause ? "20%" : "75%",
        });
        document.querySelector("#navigation")?.after(state);
        return state;
    };
};
new Dcm();

// Default           ; keydown: pause = true  ; keyup: pause = false
// If invert = false ; keydown: pause = true  ; keyup: pause = false
// If invert = true  ; keydown: pause = false ; keyup: pause = true
