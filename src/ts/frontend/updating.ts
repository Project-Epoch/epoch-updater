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
        this.playButton.addEventListener('click', () => { this.onPlayButtonClicked(); });
        this.updateButton.addEventListener('click', () => { this.onUpdateButtonClicked(); });
        this.cancelButton.addEventListener('click', () => { this.onCancelButtonClicked(); });

        /** Download Events. */
        window.updaterAPI.onDownloadStart((filename, total, index) => { this.onDownloadStart(filename, total, index); });
        window.updaterAPI.onDownloadFinished(() => { this.onDownloadFinished() });
        window.updaterAPI.onDownloadProgress((total, name, downloaded, progress, speed) => { this.onDownloadProgress(total, name, downloaded, progress, speed); });
        window.updaterAPI.onVersionReceived((version) => { this.onVersionReceived(version); });
    
        /** Modal Events */
        document.getElementById('installModal').addEventListener('hidden.bs.modal', function (event) {
            hide(document.getElementById('client-path-error-display'));
        });
    }

    /**
     * Fires when an update was available and they accepted it.
     */
    onUpdateButtonClicked() {
        window.updaterAPI.onUpdateButtonClicked();
    }

    /**
     * Fires when the Cancel button is clicked during the
     * download process.
     */
    onCancelButtonClicked() {
        window.updaterAPI.onCancelButtonClicked();
    }

    /**
     * Fires when the Play Button is clicked.
     */
    onPlayButtonClicked() {
        this.hideAllButtons();
        show(this.initButton);
        this.playButton.setAttribute('disabled', '');
        window.updaterAPI.onPlayButtonClicked();
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
        console.log('onInvalidDirectoryChosen');
        console.log(message);

        let container = document.getElementById('client-path-error-display');
        let error = document.getElementById('client-path-error-text');

        show(container);
        error.innerText = message;
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

    /**
     * Hides all the primary buttons.
     */
    hideAllButtons() {
        hide(this.initButton);
        hide(this.installButton);
        hide(this.updateButton);
        hide(this.playButton);
        hide(this.cancelButton);
    }

    /**
     * Fires when all other actions are done and we're 
     * ready to play.
     */
    onDoneState() {
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

    /**
     * Fired when we start to verify the integrity of files.
     */
    onVerifyingIntegrityState() {
        /** Hide / Display Buttons. */
        this.hideAllButtons();
        show(this.initButton);
        hide(this.progressBarEndText);

        /** Remove Striping if present. */
        this.progressBar.classList.add('progress-bar-striped');
        this.progressBar.classList.add('progress-bar-animated');

        /** Update Text. */
        this.progressBarText.innerText = "Verifying Game Integrity...";

        /** Reset Bar. */
        this.setProgressBarPercentage(100, 100);
    }

    /**
     * Fired when Updates are available.
     */
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

    /**
     * Fires when we receive the version number for the 
     * latest update.
     * @param version The latest version.
     */
    onVersionReceived(version: string) {
        this.progressBarText.innerText = `Update Available! - ${version}`;
    }

    /**
     * Fired when we move to the Downloading Files state.
     */
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
     * Fires each time a new file download begins.
     * @param filename The file that started.
     * @param total Total number of files.
     * @param index Current file out of that total.
     */
    onDownloadStart(filename: string, total: number, index: number) {
        show(this.progressBarEndText);
        this.progressBarText.innerText = `Current File: ${filename}`;
        this.setProgressBarPercentage(0, 100);
    }

    /**
     * Fires each time a file download ends.
     */
    onDownloadFinished() {
        this.setProgressBarPercentage(0, 100);
    }

    /**
     * Every time we get a file download progress update this fires.
     * @param total File size in bytes.
     * @param name File name.
     * @param downloaded Number of bytes downloaded.
     * @param progress Progress percentage.
     * @param speed Current speed in bytes.
     */
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

    /**
     * Formats a given number of bytes to their appropriate higher order type.
     * @param bytes 
     * @param decimals 
     * @returns Formatted Bytes.
     */
    formatBytes(bytes: number, decimals: number = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}