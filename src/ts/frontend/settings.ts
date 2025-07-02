import { Modal } from 'bootstrap';

export class Settings {
    private settingsModal: HTMLElement;
    private cdnProviderSelect: HTMLSelectElement;
    private environmentSelect: HTMLSelectElement;
    private keyInput: HTMLInputElement;
    private saveSettingsButton: HTMLElement;
    private settingsButton: HTMLElement;

    constructor() {
        this.settingsModal = document.getElementById('settingsModal');
        this.cdnProviderSelect = document.getElementById('cdnProviderSelect') as HTMLSelectElement;
        this.environmentSelect = document.getElementById('environmentSelect') as HTMLSelectElement;
        this.keyInput = document.getElementById('keyInput') as HTMLInputElement;
        this.saveSettingsButton = document.getElementById('save-settings-button');
        this.settingsButton = document.getElementById('settings-button');

        this.settingsButton.addEventListener('click', () => {
            window.settingsAPI.getSettings();
        });

        window.settingsAPI.onSettingsReceived((settings) => {
            this.cdnProviderSelect.value = settings.cdnProvider;
            this.environmentSelect.value = settings.environment;
            this.keyInput.value = settings.key;
        });

        this.saveSettingsButton.addEventListener('click', () => {
            this.saveSettings();
        });

        this.settingsModal.addEventListener('hidden.bs.modal', function (event) {
            // Optionally reset form or clear warnings on modal close
        });
    }

    private saveSettings() {
        const settings = {
            cdnProvider: this.cdnProviderSelect.value,
            environment: this.environmentSelect.value,
            key: this.keyInput.value,
        };
        window.settingsAPI.saveSettings(settings);
    }
}