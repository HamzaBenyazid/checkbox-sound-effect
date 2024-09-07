import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

interface CheckBoxSoundEffectSettings {
	soundEffectUrl: string;
}

const DEFAULT_SETTINGS: CheckBoxSoundEffectSettings = {
	soundEffectUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3",
};

export default class CheckBoxSoundEffect extends Plugin {
	settings: CheckBoxSoundEffectSettings;
	audio: HTMLAudioElement;
	observers: MutationObserver[] = [];
	isPlaying = false; // Track play/pause state

	async onload() {
		await this.loadSettings();
		this.audio = new Audio(this.settings.soundEffectUrl);

		this.registerMarkdownPostProcessor((element, _) => {
			const checkboxes = element.querySelectorAll(".task-list-item");
			checkboxes.forEach((checkbox) => {
				const inputElement = checkbox as HTMLElement;
				this.addCheckboxListener(inputElement);
			});
		});

		this.addSettingTab(new CheckBoxSoundEffectSettingTab(this.app, this));
	}

	addCheckboxListener(checkbox: HTMLElement): void {
		const observer = new MutationObserver(() => {
			if (checkbox.classList.contains("is-checked")) {
				try {
					this.audio.currentTime = 0; // Reset audio playback
					this.audio.play().catch((error) => {
						new Notice(`Error playing audio: ${error}`);
					});
				} catch (error) {
					console.error("Error playing audio", error);
				}
			}
		});

		observer.observe(checkbox, {
			attributes: true,
			attributeFilter: ["class"],
		});

		this.observers.push(observer);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async resetSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS);
		this.audio.src = this.settings.soundEffectUrl; // Reset audio source
		await this.saveSettings();
	}

	onunload() {
		this.audio.pause();
		this.observers.forEach((observer) => observer.disconnect());
		this.observers = [];
	}
}

class CheckBoxSoundEffectSettingTab extends PluginSettingTab {
	plugin: CheckBoxSoundEffect;

	constructor(app: App, plugin: CheckBoxSoundEffect) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Checkbox Sound Effect")
			.setDesc("Specify the URL of the audio file to play when a checkbox is checked.")
			.addText((textField) =>
				textField
					.setPlaceholder("Enter the audio file URL")
					.setValue(this.plugin.settings.soundEffectUrl)
					.onChange(async (newValue) => {
						try {
							this.plugin.settings.soundEffectUrl = newValue;
							this.plugin.audio.src = newValue;
							await this.plugin.saveSettings();
						} catch (error) {
							console.error("Failed to save settings:", error);
						}
					})
			)
			// Adding icons to toggle play/pause audio
			.addExtraButton((extraButton) => {
				extraButton.setIcon(this.plugin.isPlaying ? "pause-circle" : "play-circle")
					.setTooltip(this.plugin.isPlaying ? "Pause Audio" : "Play Audio")
					.onClick(async () => {
						if (this.plugin.isPlaying) {
							this.plugin.audio.pause();
							this.plugin.isPlaying = false;
							extraButton.setIcon("play-circle");
							extraButton.setTooltip("Play Audio");
						} else {
							this.plugin.audio.play().catch((error) => {
								new Notice(`Error playing audio: ${error}`);
							});
							this.plugin.isPlaying = true;
							extraButton.setIcon("pause-circle");
							extraButton.setTooltip("Pause Audio");
						}
					});
			})
			// Adding Reset to Default button
			.addExtraButton((extraButton) => {
				extraButton.setIcon("refresh-cw") // Use the refresh icon
					.setTooltip("Reset to Default")
					.onClick(async () => {
						try {
							await this.plugin.resetSettings();
							new Notice("Settings reset to default.");
						} catch (error) {
							new Notice("Failed to reset settings.");
							console.error("Failed to reset settings:", error);
						}
					});
			});
	}
}
