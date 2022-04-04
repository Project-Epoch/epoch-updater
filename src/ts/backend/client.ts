import { SettingsManager } from './settings';
import fs from 'fs';

export class Client {
    setClientDirectory(path: string): Client {
        SettingsManager.storage().set('clientDirectory', path);
        return this;
    }
    
    getClientDirectory(): string {
        return SettingsManager.storage().get('clientDirectory');
    }

    hasClientDirectory(): boolean {
        return this.getClientDirectory() !== '';
    }

    isWarcraftDirectory(): boolean {
        let path = this.getClientDirectory();

        /** Data Directory Doesnt Exists. */
        if (! fs.existsSync(`${path}/Data`)) {
            return false;
        }

        /** Lich King MPQ Doesn't Exist. */
        if (! fs.existsSync(`${path}/Data/lichking.MPQ`)) {
            return false;
        }

        return true;
    }

    isEmpty(): boolean {
        return fs.readdirSync(this.getClientDirectory()).length === 0;
    }

    isCorrectLocale(): boolean {
        let path = this.getClientDirectory();

        /** enUS Locale Doesn't Exist. */
        if (! fs.existsSync(`${path}/Data/enUS`)) {
            return false;
        }

        /** Double check with an MPQ. */
        if (! fs.existsSync(`${path}/Data/enUS/locale-enUS.MPQ`)) {
            return false;
        }

        return true;
    }

    isValidPath(path: string): boolean {
        if (path === '') { /** Invalid Path */
            return false;
        }

        if (! fs.existsSync(path)) { /** Doesn't Exist. */
            return false;
        }

        if (fs.readdirSync(path).length !== 0) {
            return true;
        }

        if (fs.readdirSync(path).length === 0) { /** Exists and is empty. */
            return true;
        }
    }


}

export const ClientManager = new Client();