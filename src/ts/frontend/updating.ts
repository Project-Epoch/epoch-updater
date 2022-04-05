const bootstrap = require('bootstrap');
import { hide, show } from "./helpers";

export class Updating {
    /** DOM Objects. */
    private initButton: HTMLElement;
    private installButton: HTMLElement;
    private updateButton: HTMLElement;
    private playButton: HTMLElement;
    private chooseDirectoryButton: HTMLElement;
    private directoryErrorContainer: HTMLElement;
    private directoryErrorMessage: HTMLElement;
    private progressBarContainer: HTMLElement;
    private progressBar: HTMLElement;
    private installModal: HTMLElement;

    constructor() {
        /** Button References. */
        this.initButton = document.getElementById('initialising-button');
        this.installButton = document.getElementById('install-button');
        this.updateButton = document.getElementById('update-button');
        this.playButton = document.getElementById('play-button');
        this.chooseDirectoryButton = document.getElementById('install-choose-directory');

        /** UI References */
        this.directoryErrorContainer = document.getElementById('client-path-error-display');
        this.directoryErrorMessage = document.getElementById('client-path-error-text');
        this.progressBar = document.getElementById('progress-bar');
        this.progressBarContainer = document.getElementById('progress-bar-container');
        this.installModal = document.getElementById('installModal');

        /** Register Callbacks. */
        window.updaterAPI.onStateChanged((state) => { this.onStateChanged(state); });
        this.chooseDirectoryButton.addEventListener('click', () => { window.updaterAPI.onOpenDirectoryPicker(); });
        window.updaterAPI.onValidDirectoryChosen(this.onValidDirectoryChosen);
        window.updaterAPI.onInvalidDirectoryChosen(this.onInvalidDirectoryChosen);
    }

    onValidDirectoryChosen() {
        let modal = bootstrap.Modal.getInstance(this.installModal);
        modal.hide();
    }

    onInvalidDirectoryChosen(message: string) {
        show(this.directoryErrorContainer);
        this.directoryErrorMessage.innerText = message;
    }

    /**
     * Fires when the Updating State is adjusted by 
     * the backend.
     * @param state The new state.
     */
    onStateChanged(state: string) {
        switch (state) {
            case 'setup':
                this.onSetupState();
                break;

            case 'get-manifest':
                this.onGetManifestState();
                break;
        
            default:
                console.log(`Frontend - Unexpected State: ${state}`);
                break;
        }
    }

    /**
     * Fired when the Setup State has been sent by backend.
     */
    onSetupState() {
        /** Hide / Display Buttons. */
        show(this.installButton);
        hide(this.initButton);
        hide(this.updateButton);
        hide(this.playButton);
    }

    /**
     * Fired when the Get Manifest State has been sent by backend.
     */
    onGetManifestState() {
        /** Hide / Display Buttons. */
        show(this.initButton);
        hide(this.installButton);
        hide(this.updateButton);
        hide(this.playButton);

        /** Progress Bar */
        show(this.progressBarContainer);
        this.progressBar.classList.add('progress-bar-striped');
        this.progressBar.classList.add('progress-bar-animated');
        this.setProgressBarPercentage(100, 100);
    }

    /**
     * Updates the Progress Bar State.
     * @param current The number to use when calculating percentage.
     * @param maximum The maximum to use when calculating percentage.
     */
    setProgressBarPercentage(current: number, maximum: number) {
        let percent = Math.ceil((current / maximum) * 100);

        this.progressBar.style.width = `${percent}%`;
        this.progressBar.ariaValueNow = `${percent}`;
    }
}