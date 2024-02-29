import * as dom from '../util/crawler';

interface ResponseResultData extends Response {
    readonly content: string;
}

export default function (): void {
    const countrySelects: NodeListOf<HTMLSelectElement> = document.querySelectorAll('select[name$="[countryCode]"]');

    Array.from(countrySelects).forEach((countrySelect: HTMLSelectElement) => {
        countrySelect.addEventListener('change', (event: Event) => {
            const select = event.currentTarget as HTMLSelectElement;

            const selectAttributeId = select.getAttribute('id');
            const selectAttributeName = select.getAttribute('name');

            if (selectAttributeId === null || selectAttributeName === null) {
                throw new Error('Missing id or name attribute from the select element.');
            }

            const provinceSelectFieldId = selectAttributeId.replace('country', 'province');
            const provinceInputFieldId = selectAttributeId.replace('countryCode', 'provinceName');
            const provinceSelectFieldName = selectAttributeName.replace('country', 'province');
            const provinceInputFieldName = selectAttributeName.replace('countryCode', 'provinceName');

            const provinceContainer = Array
                .from(document.querySelectorAll<HTMLDivElement>('[data-province-container]'))
                .find((element) => element.dataset.provinceContainer === select.dataset.selectAddress) ?? null;

            if (provinceContainer === null) {
                throw new Error('The container for filling out the provinces of the country cannot be found or initialized.');
            }

            if (select.value === undefined || select.value.length === 0) {
                dom.toggle(provinceContainer, false);
                if (provinceContainer.firstElementChild !== null) {
                    provinceContainer.removeChild(provinceContainer.firstElementChild);
                }

                return;
            } else {
                dom.toggle(provinceContainer, true);
            }

            provinceContainer.setAttribute('data-loading', 'true');

            const form = dom.parents(select, 'form', true) as HTMLFormElement;
            form.classList.add('loading');

            const url = new URL(provinceContainer.dataset.absoluteUrl ?? '/');
            url.search = new URLSearchParams({'countryCode': select.value}).toString();

            fetch(url)
                .then(async (response) => await response.json())
                .then((result: ResponseResultData) => {
                    const getProvinceInputValue = function getProvinceInputValue(valueSelector: HTMLInputElement | HTMLOptionElement | null): string {
                        return valueSelector === null ? '' : `value="${valueSelector.value}"`;
                    };

                    if (result.content.length === 0) {
                        if (provinceContainer.firstElementChild !== null) {
                            provinceContainer.removeChild(provinceContainer.firstElementChild);
                        }

                        provinceContainer.removeAttribute('data-loading');
                        form.classList.remove('loading');
                    } else if (result.content.includes('select')) {
                        const provinceSelectValue = getProvinceInputValue(provinceContainer.querySelector<HTMLOptionElement>('select > option[selected$="selected"]'));

                        provinceContainer.innerHTML = result.content
                            .replace('name="sylius_address_province"', `name="${provinceSelectFieldName}"${provinceSelectValue}`)
                            .replace('id="sylius_address_province"', `id="${provinceSelectFieldId}"`)
                            .replace('option value="" selected="selected"', 'option value=""')
                            .replace(`option ${provinceSelectValue}`, `option ${provinceSelectValue}" selected="selected"`);

                        provinceContainer.removeAttribute('data-loading');
                        form.classList.remove('loading');
                    } else {
                        const provinceInputValue = getProvinceInputValue(provinceContainer.querySelector<HTMLInputElement>('input'));

                        provinceContainer.innerHTML = result.content
                            .replace('name="sylius_address_province"', `name="${provinceInputFieldName}"${provinceInputValue}`)
                            .replace('id="sylius_address_province"', `id="${provinceInputFieldId}"`);

                        provinceContainer.removeAttribute('data-loading');
                        form.classList.remove('loading');
                    }
                }, (error: Response) => {
                    throw new Error(error.statusText);
                });
        });

        if (countrySelect.value !== '') {
            countrySelect.dispatchEvent(new Event('change'));
        }

        const shippingAddressCheckbox = document.querySelector<HTMLInputElement>('input[type="checkbox"][name$="[differentShippingAddress]"]');
        const shippingAddressContainer = document.querySelector<HTMLDivElement>('#sylius-shipping-address-container');

        if (shippingAddressCheckbox !== null && shippingAddressContainer !== null) {
            const toggleShippingAddress = function (): void {
                dom.toggle(shippingAddressContainer, shippingAddressCheckbox.checked);
            };

            toggleShippingAddress();

            shippingAddressCheckbox.addEventListener('change', toggleShippingAddress);
        }
    });
}
