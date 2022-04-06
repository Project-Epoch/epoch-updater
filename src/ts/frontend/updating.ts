import { Modal } from 'bootstrap';
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
    private progressBarEndText: HTMLElement;

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
        this.progressBarEndText = document.getElementById('progress-bar-end-text');
        this.installModal = document.getElementById('installModal');

        /** Register Callbacks. */
        window.updaterAPI.onStateChanged((state) => { this.onStateChanged(state); });
        this.chooseDirectoryButton.addEventListener('click', () => { window.updaterAPI.onOpenDirectoryPicker(); });
        window.updaterAPI.onValidDirectoryChosen(() => { this.onValidDirectoryChosen(); });
        window.updaterAPI.onInvalidDirectoryChosen(this.onInvalidDirectoryChosen);

        /** Download Events. */
        window.updaterAPI.onDownloadStart((filename, total, index) => { this.onDownloadStart(filename, total, index); });
        window.updaterAPI.onDownloadFinished(() => { this.onDownloadFinished() });
        window.updaterAPI.onDownloadProgress((total, name, downloaded, progress, speed) => { this.onDownloadProgress(total, name, downloaded, progress, speed); });
    
        /** Verification Progress */
        window.updaterAPI.onVerifyProgress((total, progress, filename) => { this.onVerifyProgress(total, progress, filename); });
    }

    /**
     * Fires when a User has chosen a valid install directory.
     */
    onValidDirectoryChosen() {
        let modal = Modal.getInstance(this.installModal);
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

            case 'done':
                this.onDoneState();
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

    onDoneState() {
        console.log('onDoneState');

        this.hideAllButtons();
        hide(this.progressBarContainer);
        show(this.playButton);
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
        this.progressBarText.innerText = "Verifying Game Integrity...";

        /** Reset Bar. */
        this.setProgressBarPercentage(0, 100);
    }

    onVerifyProgress(total: number, progress: number, filename: string) {
        this.progressBarText.innerText = `Validating ${total - progress} Files: ${filename}`;
        this.setProgressBarPercentage(progress, total);
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
        this.progressBar.classList.add('progress-bar-striped');
        this.progressBar.classList.add('progress-bar-animated');
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

    onDownloadStart(filename: string, total: number, index: number) {
        this.progressBarText.innerText = `${total} Remaining Files: ${filename}`;
        this.setProgressBarPercentage(0, 100);
    }

    onDownloadFinished() {
        this.setProgressBarPercentage(0, 100);
    }

    onDownloadProgress(total: number, name: string, downloaded: number, progress: number, speed: number) {
        this.setProgressBarPercentage(downloaded, total);
        this.progressBarEndText.innerText = `Total: ${this.formatBytes(total, 2)} - Remaining: ${this.formatBytes(total - downloaded, 2)}`;
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

    formatBytes(bytes: number, decimals: number = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}