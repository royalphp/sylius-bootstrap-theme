import * as dom from '../util/crawler';

interface AppliedPromotion {
    readonly label: string;
    readonly description: string;
}

export default function (): void {
    const formatAppliedPromotions = function (appliedPromotions?: AppliedPromotion[]): void {
        const productAppliedPromotions = document.querySelector('#appliedPromotions');
        if (productAppliedPromotions === null) {
            throw new Error('Element of applied promotions not found');
        }

        if (appliedPromotions !== undefined) {
            let appliedPromotionsElements = '';
            for (const appliedPromotion of appliedPromotions) {
                appliedPromotionsElements = appliedPromotionsElements.concat(`
                    <div class="promotion_label">
                        <span class="badge bg-sylius text-white sylius_catalog_promotion">${appliedPromotion.label}</span>
                        <span class="text-sylius">${appliedPromotion.description}</span>
                    </div>
                `);
            }

            productAppliedPromotions.innerHTML = appliedPromotionsElements;
        } else {
            productAppliedPromotions.innerHTML = '';
        }
    };

    const handleProductOptionsChange = function (variantSelect: HTMLSelectElement, priceVariant: HTMLDivElement): void {
        let selector = '';

        const productOptions = variantSelect.querySelectorAll<HTMLOptionElement>(':scope option');
        for (const productOption of productOptions) {
            if (productOption.selected) {
                selector += `[data-${variantSelect.dataset.option}="${productOption.value}"]`;
            }
        }

        const variantsPricing = priceVariant.querySelector<HTMLDivElement>(`:scope ${selector}`);
        if (variantsPricing === null) {
            throw new Error('Variant of pricing not found');
        }

        const price = variantsPricing.dataset.value;
        const originalPrice = variantsPricing.dataset.originalPrice;
        const appliedPromotion = variantsPricing.dataset.applied_promotions;

        const productPrice = document.querySelector('#product-price');
        if (productPrice === null) {
            throw new Error('Price of product not found');
        }

        const productSubmit = document.querySelector('#sylius-product-adding-to-cart button[type=submit]');
        if (productSubmit === null) {
            throw new Error('Submit button of product not found');
        }

        if (price !== undefined) {
            productPrice.innerHTML = `<strong>${price}</strong>`;
            productSubmit.removeAttribute('disabled');

            const productOriginalPrice = document.querySelector<HTMLSpanElement>('#product-original-price');
            if (productOriginalPrice !== null) {
                if (originalPrice !== undefined) {
                    dom.toggle(productOriginalPrice, true, 'inline');
                    productOriginalPrice.innerHTML = `<del>${originalPrice}</del>`;
                } else {
                    dom.toggle(productOriginalPrice, false, 'inline');
                }
            }

            let appliedPromotions: AppliedPromotion[] | undefined;
            if (appliedPromotion !== undefined && appliedPromotion !== '[]') {
                appliedPromotions = JSON.parse(appliedPromotion);
            }

            formatAppliedPromotions(appliedPromotions);
        } else {
            productPrice.innerHTML = `<strong>${priceVariant.dataset.unavailableText ?? 'unknown'}</strong>`;
            productSubmit.setAttribute('disabled', 'disabled');
        }
    };

    const handleProductVariantsChange = function (variantChoice: HTMLInputElement, productVariant: HTMLTableElement): void {
        const variantRow = dom.parents(variantChoice, 'tr', true) as HTMLTableRowElement;
        const priceCell: HTMLTableCellElement | null = variantRow.querySelector('.sylius-product-variant-price');

        if (priceCell === null) {
            throw new Error('Variant price of product not found');
        }

        const originalPrice = priceCell.dataset.originalPrice;
        const appliedPromotion = priceCell.dataset.appliedPromotions;

        let appliedPromotions: AppliedPromotion[] | undefined;
        if (appliedPromotion !== undefined && appliedPromotion !== '[]') {
            appliedPromotions = JSON.parse(appliedPromotion);
        }

        const productPrice = document.querySelector('#product-price');
        if (productPrice === null) {
            throw new Error('Price of product not found');
        }

        productPrice.textContent = priceCell.textContent;
        formatAppliedPromotions(appliedPromotions);

        const productOriginalPrice = document.querySelector<HTMLSpanElement>('#product-original-price');
        if (productOriginalPrice !== null) {
            if (originalPrice !== undefined) {
                dom.toggle(productOriginalPrice, true, 'inline');
                productOriginalPrice.innerHTML = `<del>${originalPrice}</del>`;
            } else {
                dom.toggle(productOriginalPrice, false, 'inline');
            }
        }
    };

    const priceVariant = document.querySelector<HTMLDivElement>('#sylius-variants-pricing');
    const productVariant = document.querySelector<HTMLTableElement>('#sylius-product-variants');

    if (priceVariant instanceof HTMLDivElement) {
        const variantSelects = document.querySelectorAll<HTMLSelectElement>('[name*="sylius_add_to_cart[cartItem][variant]"]');
        for (const variantSelect of variantSelects) {
            variantSelect.addEventListener('change', () => {
                handleProductOptionsChange(variantSelect, priceVariant);
            });
        }
    } else if (productVariant instanceof HTMLTableElement) {
        const variantChoices = document.querySelectorAll<HTMLInputElement>('[name="sylius_add_to_cart[cartItem][variant]"]');
        for (const variantChoice of variantChoices) {
            variantChoice.addEventListener('change', () => {
                handleProductVariantsChange(variantChoice, productVariant);
            });
        }
    }
}
