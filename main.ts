import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface CheckBoxSoundEffectSettings {
	soundEffectUrl: string;
}

const DEFAULT_SETTINGS: CheckBoxSoundEffectSettings = {
	soundEffectUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3'
}


export default class CheckBoxSoundEffect extends Plugin {
	settings: CheckBoxSoundEffectSettings;

	addClassNameListener(elem: HTMLElement, callback: () => void): void {
		let lastClassName = elem.className;
		window.setInterval(() => {   
			const className = elem.className;
			if (className !== lastClassName) {
				callback();   
				lastClassName = className;
			}
		}, 10);
	}
	
	async onload() {
		await this.loadSettings();
		this.registerMarkdownPostProcessor((element, _) => {
            const checkboxes = element.querySelectorAll('.task-list-item');
            checkboxes.forEach(checkbox => {
				const inputElement = checkbox as HTMLInputElement;
                this.addClassNameListener(inputElement, () => {
                    if (inputElement.classList.contains('is-checked')) {
                        const audio = new Audio(this.settings.soundEffectUrl);
                        audio.play();
                    }
                });
            });
        });
		this.addSettingTab(new CheckBoxSoundEffectSettingTab(this.app, this));	
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class CheckBoxSoundEffectSettingTab extends PluginSettingTab {
	plugin: CheckBoxSoundEffect;

	constructor(app: App, plugin: CheckBoxSoundEffect) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Sound Effect URL')
			.setDesc("web URL for an audio file that you want to use as sound effect when checking a checkbox.")
			.addText(text => text
				.setPlaceholder('URL')
				.setValue(this.plugin.settings.soundEffectUrl)
				.onChange(async (value) => {
					this.plugin.settings.soundEffectUrl = value;
					await this.plugin.saveSettings();
				}));
	}
}