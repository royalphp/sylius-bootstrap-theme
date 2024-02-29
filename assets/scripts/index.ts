import {Toast, Tooltip, Popover} from 'bootstrap';
import * as sylius from './sylius';
import * as custom from './custom';

export {ready as whenReady} from './util/crawler';

export function initBootstrapPlugins(): void {
    Array.from(document.querySelectorAll('.toast'))
        .forEach((toastNode) => new Toast(toastNode));
    Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        .forEach((tooltipNode) => new Tooltip(tooltipNode, {'boundary': document.body}));
    Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'))
        .forEach((popoverNode) => new Popover(popoverNode, {'html': true}));
}

export function initSyliusExtensions(): void {
    sylius.initLoginCheck();
    sylius.initAddressField();
    sylius.initProvinceField();
    sylius.addBulkActions();
    sylius.addToggleElement();
    sylius.addFormValidation();
    sylius.addModalConfirmation();
    sylius.addVariantImages();
    sylius.addVariantPrices();
    sylius.addToCart();
}

export function initCustomExtensions(): void {
    custom.addColorModes();
}
