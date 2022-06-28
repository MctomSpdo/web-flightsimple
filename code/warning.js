export default class WarningManager {
    static path = './files/audio/warning_';
    static fileType = 'mp3';

    warnings

    constructor() {
        this.warnings = new Map();
    }

    addWarning(warning) {
        if (warning instanceof Warning) {
            this.warnings.set(warning.name.toLowerCase(), warning);
            return true;
        }
        return false;
    }

    addWarning(path, name) {
        this.warnings.set(name.toLowerCase(), new Warning(path, name));
    }

    /**
     * adds a warning to the list by only having a name given. The File should be located in: ./files/audio/warning_<NAME>.mp3
     * The name will be lowercased. 
     * @param {String} name Name
     */
    addWarningByName(name) {
        let path = `${WarningManager.path}${name.toLowerCase()}.${WarningManager.fileType}`;
        this.addWarning(path, name);
    }

    /**
     * adds multiple warnings to the system at ones, works like {@link addWarningByName}
     * @param {Array} names String array
     */
    addWarningsByName(/**/) {
        let args = arguments;
        for (var i = 0; i < args.length; i++) {
            this.addWarningByName(args[i]);
        }
    }

    enableWarningByName(name) {
        let warning = this.warnings.get(name.toLowerCase());
        if (warning == undefined) return false;
        warning.enable();
        return true;
    }

    warn(name, boolean) {
        let warning = this.warnings.get(name.toLowerCase());
        if (warning == undefined) return false;
        if(boolean) warning.enable();
        else warning.disable();
        return true;
    }

    disableWarningByName(name) {
        let warning = this.warnings.get(name.toLowerCase());
        if (warning == undefined) return false;
        warning.disable();
        return true;
    }
}

export class Warning {
    audio
    active
    name

    constructor(path, name) {
        this.audio = new Audio(path);
        this.name = name;
        this.active = false;

        this.#enableLoop();
    }

    enable() {
        if (!this.active) {
            this.audio.play();
            this.active = true;
        }
    }

    disable() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.active = false;
        }
    }

    #enableLoop() {
        //loop audio
        if (typeof this.audio.loop == 'boolean') {
            this.audio.loop = true;
        } else {
            this.audio.addEventListener('ended', () => {
                this.currentTime = 0;
                this.play();
            }, false);
        }
    }
}

