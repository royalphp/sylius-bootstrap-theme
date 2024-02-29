export default function (): void {
    const forms: NodeListOf<HTMLFormElement> = document.querySelectorAll('.needs-validation');

    // make form validation joint with both client-side and server-side
    Array.from(forms).forEach((form) => {
        const errors: NodeListOf<HTMLDivElement> = form.querySelectorAll('.invalid-feedback');
        if (errors.length > 0) {
            // customize symfony-form rendering
            Array.from(errors).forEach((error) => {
                if (error.classList.contains('d-block')) {
                    error.classList.remove('d-block');
                }

                if (error.parentElement !== null) {
                    const inputs: NodeListOf<HTMLInputElement> = error.parentElement.querySelectorAll('.is-invalid');
                    if (inputs.length === 1) {
                        inputs.item(0).classList.remove('is-invalid');
                    } else if (inputs.length > 1) {
                        Array.from(inputs).forEach((input) => {
                            input.classList.remove('is-invalid');
                        });
                        // add a stub for elements of the radio type to correctly display errors
                        const stub: HTMLInputElement = document.createElement('input');
                        stub.setAttribute('type', inputs.item(0).getAttribute('type') ?? '');
                        stub.setAttribute('name', inputs.item(0).getAttribute('name') ?? '');
                        stub.classList.add('d-none');
                        error.before(stub);
                    }
                }
            });

            if (!form.classList.contains('was-validated')) {
                form.classList.add('was-validated');
            }
        } else {
            if (form.classList.contains('was-validated')) {
                form.classList.remove('was-validated');
            }
        }
    });
}
