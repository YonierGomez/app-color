const fs = require('fs');
const path = require('path');

class ShortcutConfig {
    constructor() {
        this.configPath = path.join(__dirname, '..', 'config', 'shortcuts.json');
        this.userConfigPath = path.join(__dirname, '..', 'config', 'user-shortcuts.json');
        this.config = null;
        this.loadConfig();
    }

    loadConfig() {
        try {
            // Primero intentar cargar configuración del usuario
            if (fs.existsSync(this.userConfigPath)) {
                const userConfig = JSON.parse(fs.readFileSync(this.userConfigPath, 'utf8'));
                this.config = userConfig;
                console.log('✅ Configuración personalizada de atajos cargada');
                return;
            }

            // Si no existe configuración del usuario, cargar la por defecto
            if (fs.existsSync(this.configPath)) {
                const defaultConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                this.config = defaultConfig;
                console.log('✅ Configuración por defecto de atajos cargada');
            } else {
                throw new Error('No se encontró archivo de configuración');
            }
        } catch (error) {
            console.error('❌ Error cargando configuración de atajos:', error.message);
            this.createDefaultConfig();
        }
    }

    createDefaultConfig() {
        const defaultConfig = {
            "version": "1.0",
            "shortcuts": {
                "control": {
                    "toggleDrawingMode": "CommandOrControl+Shift+D",
                    "clearDrawing": "CommandOrControl+Shift+C",
                    "resetAll": "CommandOrControl+Shift+R",
                    "undoLastAction": "CommandOrControl+Z",
                    "exitDrawingMode": "Escape"
                },
                "tools": {
                    "drawPen": "CommandOrControl+Alt+P",
                    "drawRectangle": "CommandOrControl+Alt+R",
                    "drawCircle": "CommandOrControl+Alt+C",
                    "drawEraser": "CommandOrControl+Alt+E",
                    "moveTool": "CommandOrControl+Alt+M",
                    "changeColor": "CommandOrControl+Alt+Q",
                    "changeSize": "CommandOrControl+Alt+W"
                },
                "basicColors": {
                    "setRedColor": "Alt+1",
                    "setGreenColor": "Alt+2",
                    "setBlueColor": "Alt+3",
                    "setYellowColor": "Alt+4",
                    "setWhiteColor": "Alt+5",
                    "setBlackColor": "Alt+6"
                },
                "additionalColors": {
                    "setOrangeColor": "Alt+7",
                    "setPurpleColor": "Alt+8",
                    "setPinkColor": "Alt+9",
                    "setMagentaColor": "Alt+0",
                    "setCyanColor": "CommandOrControl+Alt+1",
                    "setLimeColor": "CommandOrControl+Alt+2",
                    "setBrownColor": "CommandOrControl+Alt+3",
                    "setGrayColor": "CommandOrControl+Alt+4",
                    "setLightGrayColor": "CommandOrControl+Alt+5",
                    "setDarkGrayColor": "CommandOrControl+Alt+6"
                },
                "letterColors": {
                    "setRedColorLetter": "Alt+R",
                    "setGreenColorLetter": "Alt+G",
                    "setBlueColorLetter": "Alt+B",
                    "setYellowColorLetter": "Alt+Y",
                    "setWhiteColorLetter": "Alt+W",
                    "setBlackColorLetter": "Alt+K",
                    "setOrangeColorLetter": "Alt+O",
                    "setPurpleColorLetter": "Alt+P"
                }
            }
        };

        this.config = defaultConfig;
        this.saveDefaultConfig();
    }

    saveDefaultConfig() {
        try {
            const configDir = path.dirname(this.configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            console.log('✅ Configuración por defecto creada');
        } catch (error) {
            console.error('❌ Error creando configuración por defecto:', error.message);
        }
    }

    getShortcut(category, action) {
        try {
            return this.config.shortcuts[category][action];
        } catch (error) {
            console.error(`❌ Error obteniendo atajo para ${category}.${action}:`, error.message);
            return null;
        }
    }

    getAllShortcuts() {
        return this.config.shortcuts;
    }

    getDescription(category, action) {
        try {
            return this.config.descriptions?.[category]?.[action] || action;
        } catch (error) {
            return action;
        }
    }

    updateShortcut(category, action, newShortcut) {
        try {
            if (!this.config.shortcuts[category]) {
                this.config.shortcuts[category] = {};
            }
            this.config.shortcuts[category][action] = newShortcut;
            return true;
        } catch (error) {
            console.error(`❌ Error actualizando atajo ${category}.${action}:`, error.message);
            return false;
        }
    }

    saveUserConfig() {
        try {
            const configDir = path.dirname(this.userConfigPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            fs.writeFileSync(this.userConfigPath, JSON.stringify(this.config, null, 2));
            console.log('✅ Configuración personalizada guardada');
            return true;
        } catch (error) {
            console.error('❌ Error guardando configuración personalizada:', error.message);
            return false;
        }
    }

    resetToDefault() {
        try {
            if (fs.existsSync(this.userConfigPath)) {
                fs.unlinkSync(this.userConfigPath);
            }
            this.loadConfig();
            console.log('✅ Configuración reseteada a valores por defecto');
            return true;
        } catch (error) {
            console.error('❌ Error reseteando configuración:', error.message);
            return false;
        }
    }

    validateShortcut(shortcut) {
        // Validaciones básicas para atajos de teclado
        if (!shortcut || typeof shortcut !== 'string') {
            return false;
        }

        // Lista de modificadores válidos
        const validModifiers = ['CommandOrControl', 'Command', 'Control', 'Ctrl', 'Alt', 'Option', 'Shift', 'Meta'];
        const validKeys = /^[A-Za-z0-9]$|^F[1-9]$|^F1[0-2]$|^(Enter|Escape|Space|Tab|Backspace|Delete|Insert|Home|End|PageUp|PageDown|Up|Down|Left|Right)$/;

        const parts = shortcut.split('+');
        const key = parts[parts.length - 1];
        const modifiers = parts.slice(0, -1);

        // Validar que tenga al menos una tecla
        if (!key) return false;

        // Validar la tecla principal
        if (!validKeys.test(key)) return false;

        // Validar modificadores
        for (const modifier of modifiers) {
            if (!validModifiers.includes(modifier)) return false;
        }

        return true;
    }

    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }

    importConfig(configJson) {
        try {
            const newConfig = JSON.parse(configJson);
            
            // Validar estructura básica
            if (!newConfig.shortcuts) {
                throw new Error('Configuración inválida: falta sección shortcuts');
            }

            this.config = newConfig;
            return this.saveUserConfig();
        } catch (error) {
            console.error('❌ Error importando configuración:', error.message);
            return false;
        }
    }
}

module.exports = ShortcutConfig;
