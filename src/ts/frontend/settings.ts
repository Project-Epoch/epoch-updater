import { Modal } from 'bootstrap';
import { hide, show } from "./helpers";

export class Settings {
    private settingsModalElement: HTMLElement;
    private settingsModal: Modal;
    private currentInstallLocationInput: HTMLInputElement;
    private chooseDirectoryButton: HTMLElement;
    private saveButton: HTMLElement;
    private errorMessageElement: HTMLElement;

    private newDirectoryPath: string | null = null;

    constructor() {
        this.settingsModalElement = document.getElementById('settingsModal');
        this.currentInstallLocationInput = document.getElementById('currentInstallLocation') as HTMLInputElement;
        this.chooseDirectoryButton = document.getElementById('settings-choose-directory');
        this.saveButton = document.getElementById('settings-save-button');
        this.errorMessageElement = document.getElementById('settings-error-message');

        if (this.settingsModalElement) {
            this.settingsModal = new Modal(this.settingsModalElement);
        }

        this.loadCurrentDirectory();
        this.registerEventListeners();
    }

    private async loadCurrentDirectory() {
        try {
            const currentDir = await window.settingsAPI.getCurrentDirectory();
            if (this.currentInstallLocationInput) {
                this.currentInstallLocationInput.value = currentDir || 'Not Set';
            }
            this.newDirectoryPath = currentDir;
        } catch (error) {
            console.error("Failed to load current directory:", error);
            if (this.currentInstallLocationInput) {
                this.currentInstallLocationInput.value = 'Error loading directory';
            }
        }
    }

    private registerEventListeners() {
        if (this.chooseDirectoryButton) {
            this.chooseDirectoryButton.addEventListener('click', async () => {
                try {
                    const chosenPath = await window.settingsAPI.chooseNewDirectory();
                    if (chosenPath) {
                        this.newDirectoryPath = chosenPath;
                        this.currentInstallLocationInput.value = chosenPath;
                        hide(this.errorMessageElement);
                    }
                } catch (error) {
                    console.error("Error choosing new directory:", error);
                    this.showError('Failed to choose directory.');
                }
            });
        }

        if (this.saveButton) {
            this.saveButton.addEventListener('click', async () => {
                if (this.newDirectoryPath) {
                    try {
                        const success = await window.settingsAPI.saveNewDirectory(this.newDirectoryPath);
                        if (success) {
                            this.loadCurrentDirectory();
                            this.settingsModal.hide();
                            window.updaterAPI.refreshState();
                        } else {
                            this.showError('Failed to save new directory. It might be invalid.');
                        }
                    } catch (error) {
                        console.error("Error saving new directory:", error);
                        this.showError('An unexpected error occurred while saving.');
                    }
                } else {
                    this.showError('No new directory selected.');
                }
            });
        }

        if (this.settingsModalElement) {
            this.settingsModalElement.addEventListener('show.bs.modal', () => {
                this.loadCurrentDirectory();
                hide(this.errorMessageElement);
            });
        }

        window.settingsAPI.onDirectoryChangeError((message) => {
            this.showError(message);
        });
    }

    private showError(message: string) {
        if (this.errorMessageElement) {
            this.errorMessageElement.textContent = message;
            show(this.errorMessageElement);
        }
    }
}