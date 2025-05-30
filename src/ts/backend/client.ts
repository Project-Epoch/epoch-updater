import { SettingsManager } from './settings';
import fs from 'fs-extra';
import { WindowManager } from './window';
import { dialog } from 'electron';
import cp from "child_process";

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

        /** Pressed Cancel. */
        if (dir === undefined) {
            WindowManager.get().webContents.send('invalid-install-directory-chosen', 'Must choose a directory.');
            return;
        }

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
        WindowManager.get()?.webContents.send('client-directory-loaded', path);
        return this;
    }
    
    /**
     * Gets the Directory for where we're keeping our Client.
     * @returns The Directory.
     */
    getClientDirectory(): string {
        return SettingsManager.storage().get('clientDirectory') as string;
    }

    /**
     * Checks to see if we have a Client Directory Set.
     */
    hasClientDirectory(): boolean {
        const dir = this.getClientDirectory();
        return typeof dir === 'string' && dir !== '';
    }

    /**
     * Given a Directory it will check to see if it is a Warcraft 
     * Directory based on whether it has a Data subdir and 
     * specific MPQ.
     * @param path The Directory we're checking.
     */
    isWarcraftDirectory(path: string): boolean {
        if (!path || typeof path !== 'string') return false;
        /** Battlenet dll doesn't exist. */
        if (! fs.existsSync(`${path}\\Battle.net.dll`)) {
            return false;
        }

        /** Data Directory Doesnt Exists. */
        if (! fs.existsSync(`${path}\\Data\\`)) {
            return false;
        }

        /** Check First Patch. */
        if (! fs.existsSync(`${path}\\Data\\lichking.MPQ`)) {
            return false;
        }

        /** Check Second Patch. */
        if (! fs.existsSync(`${path}\\Data\\patch-3.MPQ`)) {
            return false;
        }

        return true;
    }

    /**
     * Check to see if a Client Directory is empty.
     * @param path Path we're checking.
     */
    isEmpty(path: string): boolean {
         if (!path || typeof path !== 'string' || !fs.existsSync(path)) return true;
        return fs.readdirSync(path).length === 0;
    }

    /**
     * Check to see if a Client Directory may require UAC prompt.
     * @param path Path we're checking.
     */
    requiresElevation(path: string): boolean {
        if (!path || typeof path !== 'string') return false;
        return path.includes('C:\\Program Files (x86)') || path.includes('C:\\Program Files');
    }

    /**
     * Checks to see if the Warcraft Directory provided is 
     * of the locale enUS.
     * @param path The directory we're checking.
     */
    isCorrectLocale(path: string): boolean {
        if (!path || typeof path !== 'string') return false;
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

    /**
     * Attempts to open the WoW Client Exe.
     */
    open() {
        let exe = 'Project-Epoch.exe';
        const clientDir = this.getClientDirectory();
        if (!clientDir) {
            console.error("Client directory not set. Cannot open game.");
            return;
        }
        let path = `${clientDir}\\${exe}`;

        /** Clean Cache. */
        try {
            fs.removeSync(`${clientDir}\\Cache`);
        } catch (err) {
            console.error("Failed to remove Cache directory:", err);
        }


        cp.exec(`"${path}"`, (error) => {
            if (error) {
                console.error(`Error opening game: ${error.message}`);
                WindowManager.get()?.webContents.send('play-game-error', 'Failed to start the game. Please check your installation.');
            }
        });
    }
}

export const ClientManager = new Client();