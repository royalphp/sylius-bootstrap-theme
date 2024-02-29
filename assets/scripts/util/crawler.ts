export function ready(callback: () => void): void {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

export function alert<T extends HTMLElement>(targetSelector: T, messages: string | string[], type: string): void {
    let message = '';

    if (Array.isArray(messages)) {
        for (const value of messages) {
            message = message.concat(message.length > 0 ? '<br>' : '', value);
        }
    } else {
        message = messages;
    }

    targetSelector.innerHTML = `
        <div class="alert alert-${type} alert-dismissible d-flex align-items-center" role="alert">
            <div>${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

export function toggle<T extends HTMLElement>(targetSelector: T, toggler: boolean, display = 'block'): void {
    if (toggler) {
        if (targetSelector.classList.contains('d-none')) {
            targetSelector.classList.remove('d-none');
        }

        targetSelector.classList.add(`d-${display}`);
    } else {
        if (targetSelector.classList.contains(`d-${display}`)) {
            targetSelector.classList.remove(`d-${display}`);
        }

        targetSelector.classList.add('d-none');
    }
}

export function parents(targetElement: HTMLElement, selector?: string, onlyLastParent = false): HTMLElement | HTMLElement[] {
    const parentElements: HTMLElement[] = [];

    let parentElement: HTMLElement | null = targetElement.parentElement;
    while (parentElement !== null) {
        parentElements.push(parentElement);
        parentElement = parentElement.parentElement;

        if (parentElement !== null && typeof selector === 'string' && selector.length > 0) {
            if (parentElement.matches(selector)) {
                parentElements.push(parentElement);

                break;
            }
        }
    }

    return onlyLastParent ? parentElements[parentElements.length - 1] : parentElements;
}
