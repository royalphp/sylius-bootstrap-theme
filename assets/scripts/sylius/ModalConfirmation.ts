import {type Modal} from 'bootstrap';

export default function (): void {
    const idConfirmationModal = '#confirmationModal';

    // disable click action from all actions
    const triggers = document.querySelectorAll(`[data-bs-target="${idConfirmationModal}"]`);
    Array.from(triggers).forEach((value) => {
        value.addEventListener('click', (event: Event) => {
            event.preventDefault();
        });
    });

    const modal = document.querySelector<HTMLElement>(idConfirmationModal);
    if (modal instanceof HTMLElement) {
        modal.addEventListener('show.bs.modal', (event: Event) => {
            const trigger = (event as Modal.Event).relatedTarget;
            const button = modal.querySelector(':scope .btn-confirmation');
            if (trigger instanceof HTMLElement && button instanceof HTMLElement) {
                switch (trigger.tagName.toLowerCase()) {
                    case 'a':
                        button.setAttribute('href', trigger.getAttribute('href') ?? '#');
                        break;
                    case 'button':
                        button.addEventListener('click', (event: Event) => {
                            event.preventDefault();

                            const triggerFormElement = trigger.closest('form');
                            if (triggerFormElement instanceof HTMLFormElement) {
                                triggerFormElement.submit();
                            }
                        });
                        break;
                }
            }
        });
    }
}
