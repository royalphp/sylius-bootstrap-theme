import * as dom from '../util/crawler';

export default function (): void {
    const toggles = document.querySelectorAll<HTMLInputElement>('[data-toggles]');

    for (const toggle of toggles) {
        toggle.addEventListener('change', (event: Event) => {
            event.preventDefault();

            const target = event.currentTarget as HTMLInputElement;
            const targetElement = document.querySelector<HTMLElement>(`#${target.dataset.toggles}`);

            if (targetElement !== null) {
                if (toggle.checked) {
                    dom.toggle(targetElement, true);
                } else {
                    dom.toggle(targetElement, false);
                }
            }
        });

        toggle.dispatchEvent(new Event('change'));
    }
}
