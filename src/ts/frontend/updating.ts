const bootstrap = require('bootstrap');
import { hide, show } from "./helpers";

export class Updating {
    /** Main Buttons. */
    private initButton: HTMLElement;
    private installButton: HTMLElement;
    private updateButton: HTMLElement;
    private playButton: HTMLElement;
    private cancelButton: HTMLElement;

    /** Install Modal Elements. */
    private installModal: HTMLElement;
    private chooseDirectoryButton: HTMLElement;
    private directoryErrorContainer: HTMLElement;
    private directoryErrorMessage: HTMLElement;

    /** Progress Bar Elements. */
    private progressBarContainer: HTMLElement;
    private progressBar: HTMLElement;
    private progressBarText: HTMLElement;

    constructor() {
        /** Button References. */
        this.initButton = document.getElementById('initialising-button');
        this.installButton = document.getElementById('install-button');
        this.updateButton = document.getElementById('update-button');
        this.playButton = document.getElementById('play-button');
        this.chooseDirectoryButton = document.getElementById('install-choose-directory');
        this.cancelButton = document.getElementById('cancel-button');

        /** UI References */
        this.directoryErrorContainer = document.getElementById('client-path-error-display');
        this.directoryErrorMessage = document.getElementById('client-path-error-text');
        this.progressBar = document.getElementById('progress-bar');
        this.progressBarContainer = document.getElementById('progress-bar-container');
        this.progressBarText = document.getElementById('progress-bar-text');
        this.installModal = document.getElementById('installModal');

        /** Register Callbacks. */
        window.updaterAPI.onStateChanged((state) => { this.onStateChanged(state); });
        this.chooseDirectoryButton.addEventListener('click', () => { window.updaterAPI.onOpenDirectoryPicker(); });
        window.updaterAPI.onValidDirectoryChosen(this.onValidDirectoryChosen);
        window.updaterAPI.onInvalidDirectoryChosen(this.onInvalidDirectoryChosen);
    }

    /**
     * Fires when a User has chosen a valid install directory.
     */
    onValidDirectoryChosen() {
        let modal = bootstrap.Modal.getInstance(this.installModal);
        modal.hide();
    }

    /**
     * Fires when a User has chosen an invalid directory during install.
     * @param message The reason why it was invalid.
     */
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

            case 'verifying-integrity':
                this.onVerifyingIntegrityState();
                break;

            case 'downloading':
                this.onDownloadingState();
                break;

            case 'update-available':
                this.onUpdateAvailableState();
                break;
        
            default:
                console.log(`Frontend - Unexpected State: ${state}`);
                break;
        }
    }

    hideAllButtons() {
        hide(this.initButton);
        hide(this.installButton);
        hide(this.updateButton);
        hide(this.playButton);
        hide(this.cancelButton);
    }

    /**
     * Fired when the Setup State has been sent by backend.
     */
    onSetupState() {
        /** Hide / Display Buttons. */
        this.hideAllButtons();
        show(this.installButton);
    }

    /**
     * Fired when the Get Manifest State has been sent by backend.
     */
    onGetManifestState() {
        /** Hide / Display Buttons. */
        this.hideAllButtons();
        show(this.initButton);

        /** Progress Bar */
        show(this.progressBarContainer);
        this.progressBar.classList.add('progress-bar-striped');
        this.progressBar.classList.add('progress-bar-animated');
        this.setProgressBarPercentage(100, 100);
    }

    onVerifyingIntegrityState() {
        /** Hide / Display Buttons. */
        this.hideAllButtons();
        show(this.cancelButton);

        /** Remove Striping if present. */
        this.progressBar.classList.remove('progress-bar-striped');
        this.progressBar.classList.remove('progress-bar-animated');

        /** Update Text. */
        this.progressBarText.innerText = "";

        /** Reset Bar. */
        this.setProgressBarPercentage(0, 100);
    }

    onUpdateAvailableState() {
        /** Hide / Display Buttons. */
        this.hideAllButtons();
        show(this.updateButton);

        /** Update Text. */
        this.progressBarText.innerText = "Update Available!";
        this.progressBarText.classList.add('text-info');

        /** Reset Bar. */
        this.setProgressBarPercentage(0, 100);
    }

    onDownloadingState() {
        /** Hide / Display Buttons. */
        this.hideAllButtons();
        show(this.cancelButton);

        /** Update Text. */
        this.progressBarText.innerText = "Downloading Files...";
        this.progressBarText.classList.add('text-info');

        /** Reset Bar. */
        this.setProgressBarPercentage(0, 100);
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