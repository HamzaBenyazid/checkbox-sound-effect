import { Plugin } from 'obsidian';

export default class CheckBoxSoundEffect extends Plugin {
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
		this.registerMarkdownPostProcessor((element, _) => {
            const checkboxes = element.querySelectorAll('.task-list-item');
            checkboxes.forEach(checkbox => {
				const inputElement = checkbox as HTMLInputElement;
                this.addClassNameListener(inputElement, () => {
                    if (inputElement.classList.contains('is-checked')) {
                        const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3');
                        audio.play();
                    }
                });
            });
        });
	}
}