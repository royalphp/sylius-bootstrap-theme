import * as dom from '../util/crawler';

interface ResponseResultData extends Response {
    readonly username?: string;
}

export default function (): void {
    const apiLogin = document.querySelector<HTMLDivElement>('#sylius-api-login');
    const apiLoginEmail = apiLogin?.querySelector<HTMLInputElement>(':scope #sylius_checkout_address_customer_email');
    const apiLoginPassword = apiLogin?.querySelector<HTMLInputElement>(':scope #sylius_checkout_address_customer_password');
    const apiLoginCsrf = apiLogin?.querySelector<HTMLInputElement>(':scope #sylius_checkout_address_customer_csrf');
    const apiLoginSubmit = apiLogin?.querySelector<HTMLButtonElement>(':scope #sylius-api-login-submit');

    if (apiLoginEmail instanceof HTMLInputElement) {
        apiLoginEmail.addEventListener('change', (event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            const url = new URL(target.dataset.absoluteUrl ?? '/');
            url.search = new URLSearchParams({'email': target.value}).toString();

            fetch(url)
                .then(async (response) => await response.json())
                .then((result: ResponseResultData) => {
                    const loginForm = apiLogin?.querySelector<HTMLDivElement>(':scope #sylius-api-login-form');
                    if (loginForm?.parentElement instanceof HTMLDivElement) {
                        dom.toggle(loginForm.parentElement, typeof result.username === 'string' && result.username.length > 0);
                    }
                }, (error: Response) => {
                    throw new Error(error.statusText);
                });
        });
    }

    if (apiLoginSubmit instanceof HTMLButtonElement) {
        apiLoginSubmit.addEventListener('click', (event: Event) => {
            event.preventDefault();

            const target = event.currentTarget as HTMLButtonElement;
            const formData = new FormData();
            formData.append('_username', apiLoginEmail?.value ?? '');
            formData.append('_password', apiLoginPassword?.value ?? '');
            formData.append('_csrf_shop_security_token', apiLoginCsrf?.value ?? '');

            (async () => {
                const response = await fetch(target.dataset.absoluteUrl ?? '/', {
                    'method': 'POST',
                    'body': formData
                });
                if (response.redirected && response.url.includes('login')) {
                    const apiLoginMessage = apiLogin?.querySelector<HTMLDivElement>(':scope #sylius-api-validation-error');
                    if (apiLoginMessage instanceof HTMLDivElement) {
                        dom.alert(apiLoginMessage, 'Invalid credentials.', 'danger');
                    }
                } else {
                    window.location.href = response.url;
                }
            })().catch((error) => {
                console.error('Unexpected error:', error);
            });
        });
    }
}
