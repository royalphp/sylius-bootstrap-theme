export default function (): void {
    const checkboxAllElements = document.querySelectorAll<HTMLInputElement>('[data-js-bulk-checkboxes]');
    const buttonAllElements = document.querySelectorAll<HTMLButtonElement>('[data-bulk-action-requires-confirmation]');

    checkboxAllElements.forEach((checkboxAllElement) => {
        const checkboxes = document.querySelectorAll<HTMLInputElement>(checkboxAllElement.getAttribute('data-js-bulk-checkboxes') ?? '');
        const buttons = document.querySelectorAll<HTMLButtonElement>(checkboxAllElement.getAttribute('data-js-bulk-buttons') ?? '');

        const isAnyChecked = (): boolean => Array.from(checkboxes).some((checkbox) => checkbox.checked);
        const buttonsPropRefresh = (): void => {
            buttons.forEach((button) => {
                button.disabled = !isAnyChecked();
            });
        };

        checkboxAllElement.addEventListener('change', () => {
            Array.from(checkboxes).forEach((checkbox): void => {
                checkbox.checked = checkboxAllElement.checked;
            });

            buttonsPropRefresh();
        });

        Array.from(checkboxes).forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                checkboxAllElement.checked = isAnyChecked();

                buttonsPropRefresh();
            });
        });

        buttonsPropRefresh();
    });

    buttonAllElements.forEach((buttonAllElement) => {
        buttonAllElement.addEventListener('click', (event) => {
            event.preventDefault();

            const actionButton = event.currentTarget as HTMLAnchorElement | HTMLButtonElement;

            if (actionButton.tagName.toLowerCase() === 'a') {
                const confirmationButton = document.querySelector<HTMLButtonElement>('.btn-confirmation');
                confirmationButton?.addEventListener('click', (event) => {
                    event.preventDefault();

                    window.location.href = (actionButton as HTMLAnchorElement).href;
                });
            }

            if (actionButton.tagName.toLowerCase() === 'button') {
                const confirmationButton = document.querySelector<HTMLButtonElement>('.btn-confirmation');
                confirmationButton?.addEventListener('click', (event) => {
                    event.preventDefault();

                    const form = actionButton.closest<HTMLFormElement>('form');
                    if (form !== null) {
                        Array.from(document.querySelectorAll<HTMLInputElement>('input.bulk-select-checkbox:checked')).forEach((element) => {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = 'ids[]';
                            input.value = element.value;

                            form.appendChild(input);
                        });

                        form.submit();
                    }
                });
            }
        });
    });
}
