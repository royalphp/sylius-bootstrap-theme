export default function (): void {
    const changeMainImage = function (newImageDiv?: HTMLDivElement): void {
        const mainImageLink = document.querySelector<HTMLAnchorElement>('.main-image-link');
        const mainImage = mainImageLink?.querySelector<HTMLImageElement>(':scope img');

        if (
            !(mainImageLink instanceof HTMLAnchorElement) ||
            !(mainImage instanceof HTMLImageElement)
        ) {
            throw new Error('Elements of main image not found');
        }

        if (newImageDiv === undefined) {
            const mainImageWrapper = document.querySelector<HTMLDivElement>('.main-image-wrapper');
            if (mainImageWrapper === null) {
                throw new Error('Element of main image wrapper not found');
            }

            const productLink = mainImageWrapper.dataset.productLink ?? '';
            const productImage = mainImageWrapper.dataset.productImage ?? '';
            if (productLink.length === 0 || productImage.length === 0) {
                throw new Error('Data of product media not found');
            }

            mainImageLink.setAttribute('href', productLink);
            mainImage.setAttribute('src', productImage);

            return;
        }

        const newImageLink = newImageDiv.querySelector<HTMLAnchorElement>(':scope a');
        const newImage = newImageLink?.querySelector<HTMLImageElement>(':scope img');

        if (
            !(newImageLink instanceof HTMLAnchorElement) ||
            !(newImage instanceof HTMLImageElement)
        ) {
            throw new Error('Elements of wrapper main image not found');
        }

        mainImageLink.setAttribute('href', newImageLink.getAttribute('href') ?? '#');
        mainImage.setAttribute('src', newImage.dataset.largeThumbnail ?? '#');
    };

    const handleProductOptionImages = function (variantSelect: HTMLSelectElement, variantOptions: NodeListOf<HTMLDivElement>): void {
        let options = '';

        const productOptions = variantSelect.querySelectorAll<HTMLOptionElement>(':scope option');
        for (const productOption of productOptions) {
            if (productOption.selected) {
                options = options.concat(' ', productOption.value);
            }
        }

        const imagesWithOptions = [];
        for (const variantOption of variantOptions) {
            const imageOptions = variantOption.dataset.variantOptions ?? '';
            const hasImageOptions = options.trim().split(' ')
                .every((option) => imageOptions.includes(option));
            const getImageOptions = variantOption.closest<HTMLDivElement>('.product-images');

            if (hasImageOptions && getImageOptions instanceof HTMLDivElement) {
                imagesWithOptions.push(getImageOptions);
            }
        }

        changeMainImage(imagesWithOptions.shift());
    };

    const handleProductVariantImages = function (variantChoice: HTMLInputElement, variantCodes: NodeListOf<HTMLDivElement>): void {
        const imagesWithVariantCode = [];
        for (const variantCode of variantCodes) {
            const getImageOptions = variantCode.closest<HTMLDivElement>('.product-images');
            if (variantCode.dataset.variantCode === variantChoice.value && getImageOptions instanceof HTMLDivElement) {
                imagesWithVariantCode.push(getImageOptions);
            }
        }

        changeMainImage(imagesWithVariantCode.shift());
    };

    const variantOptions = document.querySelectorAll<HTMLDivElement>('[data-variant-options]');
    const variantCodes = document.querySelectorAll<HTMLDivElement>('[data-variant-code]');

    if (variantOptions.length > 0) {
        const variantSelects = document.querySelectorAll<HTMLSelectElement>('[name*="sylius_add_to_cart[cartItem][variant]"]');
        for (const variantSelect of variantSelects) {
            variantSelect.addEventListener('change', () => {
                handleProductOptionImages(variantSelect, variantOptions);
            });
        }
    } else if (variantCodes.length > 0) {
        const variantChoices = document.querySelectorAll<HTMLInputElement>('[name="sylius_add_to_cart[cartItem][variant]"]');
        for (const variantChoice of variantChoices) {
            variantChoice.addEventListener('change', () => {
                handleProductVariantImages(variantChoice, variantCodes);
            });
        }
    }
}
