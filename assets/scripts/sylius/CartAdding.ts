import * as dom from '../util/crawler';

interface FormErrorValidation {
    readonly errors: {
        readonly errors: string[];
        readonly form: {
            readonly code: number;
            readonly message: string;
            readonly errors: object;
        };
    };
}

export default function (): void {
    const form = document.querySelector<HTMLFormElement>('#sylius-product-adding-to-cart');

    if (form !== null) {
        const formUrl = form.getAttribute('action') ?? '#';
        const formRedirect = form.dataset.redirect ?? '/';

        const formValidationElement = document.querySelector<HTMLDivElement>('#sylius-cart-validation-error');
        if (formValidationElement === null) {
            throw new Error('Validation element in form not found');
        }

        form.addEventListener('submit', function (event: SubmitEvent): void {
            event.preventDefault();

            (async () => {
                const response = await fetch(formUrl, {
                    'method': 'POST',
                    'body': new FormData(form)
                });

                if (response.status >= 400) {
                    const result: FormErrorValidation = await response.json();

                    dom.alert(formValidationElement, result.errors.errors, 'danger');
                    dom.toggle(formValidationElement, true);

                    return;
                }

                dom.toggle(formValidationElement, false);

                window.location.href = formRedirect;
            })().catch((error) => {
                console.error('Unexpected error:', error);
            });
        });
    }
}
