import { SettingsManager } from './settings';
import fs from 'fs';
import { WindowManager } from './window';
import { dialog } from 'electron';

/**
 * A class to handle interacting with the Client.
 */
export class Client {
    /**
     * Triggered by the Frontend. Allows us to choose a Directory 
     * where the Client will be installed.
     */
    async chooseDirectory(cb: () => void) {
        const result = await dialog.showOpenDialog(WindowManager.get(), {
            title: 'Choose Client Directory',
            properties: ['openDirectory']
        });

        let dir = result.filePaths[0];

        if (this.isEmpty(dir)) {
            WindowManager.get().webContents.send('valid-install-directory-chosen', dir);
            this.setClientDirectory(dir);
            cb();
            return;
        }

        if (! this.isWarcraftDirectory(dir)) {
            WindowManager.get().webContents.send('invalid-install-directory-chosen', 'Chosen Directory is not empty and is not a World of Warcraft directory.');
            return;
        }

        if (! this.isCorrectLocale(dir)) {
            WindowManager.get().webContents.send('invalid-install-directory-chosen', 'Invalid World of Warcraft Locale - enUS Required.');
            return;
        }

        /** All other contitions not met, default to valid. */
        WindowManager.get().webContents.send('valid-install-directory-chosen', dir);
        this.setClientDirectory(dir);
        cb();
        return;
    }

    /**
     * Sets and saves the Client Directory we're using.
     * @param path The full path to the Client.
     * @returns this
     */
    setClientDirectory(path: string): Client {
        SettingsManager.storage().set('clientDirectory', path);
        return this;
    }
    
    /**
     * Gets the Directory for where we're keeping our Client.
     * @returns The Directory.
     */
    getClientDirectory(): string {
        return SettingsManager.storage().get('clientDirectory');
    }

    /**
     * Checks to see if we have a Client Directory Set.
     */
    hasClientDirectory(): boolean {
        return this.getClientDirectory() !== '';
    }

    /**
     * Given a Directory it will check to see if it is a Warcraft 
     * Directory based on whether it has a Data subdir and 
     * specific MPQ.
     * @param path The Directory we're checking.
     */
    isWarcraftDirectory(path: string): boolean {
        /** Data Directory Doesnt Exists. */
        if (! fs.existsSync(`${path}\\Data\\`)) {
            return false;
        }
        /** Lich King MPQ Doesn't Exist. */
        if (! fs.existsSync(`${path}\\Data\\lichking.MPQ`)) {
            return false;
        }

        return true;
    }

    /**
     * Check to see if a Client Directory is empty.
     * @param path Path we're checking.
     */
    isEmpty(path: string): boolean {
        return fs.readdirSync(path).length === 0;
    }

    /**
     * Checks to see if the Warcraft Directory provided is 
     * of the locale enUS.
     * @param path The directory we're checking.
     */
    isCorrectLocale(path: string): boolean {
        /** enUS Locale Doesn't Exist. */
        if (! fs.existsSync(`${path}\\Data\\enUS\\`)) {
            return false;
        }

        /** Double check with an MPQ. */
        if (! fs.existsSync(`${path}\\Data\\enUS\\locale-enUS.MPQ`)) {
            return false;
        }

        return true;
    }
}

export const ClientManager = new Client();