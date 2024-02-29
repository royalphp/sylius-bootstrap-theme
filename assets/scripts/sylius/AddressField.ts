import TomSelect from 'tom-select';

interface Address {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly company: string;
    readonly street: string;
    readonly countryCode: string;
    readonly provinceCode: string;
    readonly provinceName: string;
    readonly city: string;
    readonly postcode: string;
    readonly phoneNumber: string;
}

export default function (): void {
    const elements = document.querySelectorAll<HTMLDivElement>('#sylius-shipping-address, #sylius-billing-address');

    if (elements !== null) {
        for (const element of elements) {
            const select = element.querySelector<HTMLSelectElement>(':scope .address-book-select');
            if (select === null) {
                continue;
            }

            const parseKey = function (key: string): string {
                return key.replace(/(_\w)/g, (words) => words[1].toUpperCase());
            };

            const findByName = function (name: string): HTMLInputElement | HTMLSelectElement | null {
                return element.querySelector<HTMLInputElement | HTMLSelectElement>(`:scope [name*="[${parseKey(name)}]"]`);
            };

            const getAddressInfo = function (select: HTMLSelectElement, id: string): Address {
                const options: NodeListOf<HTMLOptionElement> = select.querySelectorAll(':scope option');
                const extractInfo = (option: HTMLOptionElement, key: string): string => option.dataset[key] ?? '';

                for (const option of options) {
                    if (option.value === id) {
                        return {
                            'id': extractInfo(option, 'id'),
                            'firstName': extractInfo(option, 'firstName'),
                            'lastName': extractInfo(option, 'lastName'),
                            'company': extractInfo(option, 'company'),
                            'street': extractInfo(option, 'street'),
                            'countryCode': extractInfo(option, 'countryCode'),
                            'provinceCode': extractInfo(option, 'provinceCode'),
                            'provinceName': extractInfo(option, 'provinceName'),
                            'city': extractInfo(option, 'city'),
                            'postcode': extractInfo(option, 'postcode'),
                            'phoneNumber': extractInfo(option, 'phoneNumber')
                        };
                    }
                }

                throw new Error('Address information not found');
            };

            const selectHandler = function (name: string): void {
                const address = getAddressInfo(select, name);
                const {provinceCode, provinceName} = address;

                const provinceContainer = element.querySelector<HTMLDivElement>(':scope [data-province-container]');
                if (provinceContainer === null) {
                    throw new Error('Container of province field not found');
                }

                Array.from(element.querySelectorAll<HTMLInputElement>('input:not([type="radio"]):not([type="checkbox"]), select'))
                    .forEach((input: HTMLInputElement) => {
                        input.value = '';
                    });

                for (const [property, value] of Object.entries(address)) {
                    const field = findByName(property);
                    if (field === null) {
                        continue;
                    }

                    if (field instanceof HTMLSelectElement && property.includes('countryCode')) {
                        field.value = value;
                        field.dispatchEvent(new Event('change'));

                        const exists = setInterval(() => {
                            const provinceCodeField = findByName('provinceCode');
                            const provinceNameField = findByName('provinceName');

                            if (
                                !provinceContainer.hasAttribute('data-loading') &&
                                (provinceCodeField !== null && provinceNameField !== null)
                            ) {
                                if (
                                    provinceCodeField.value.length !== 0 &&
                                    (provinceCode !== '' || provinceCode !== undefined)
                                ) {
                                    provinceCodeField.value = provinceCode;

                                    clearInterval(exists);
                                } else if (
                                    provinceNameField.value.length !== 0 &&
                                    (provinceName !== '' || provinceName !== undefined)
                                ) {
                                    provinceNameField.value = provinceName;

                                    clearInterval(exists);
                                }
                            }
                        }, 100);
                    } else if (
                        field instanceof HTMLInputElement &&
                        (field.type === 'radio' || field.type === 'checkbox')
                    ) {
                        field.checked = false;

                        const valueChecked = field.querySelector<HTMLInputElement>(`:scope [value="${value}"]`);
                        if (valueChecked !== null) {
                            valueChecked.checked = true;
                        }
                    } else {
                        field.value = value;
                    }
                }
            };

            ((): TomSelect => new TomSelect(select, {
                'allowEmptyOption': true,
                'create': true,
                'sortField': [{
                    'field': 'text',
                    'direction': 'asc',
                }],
                'onChange': (value: string | number) => {
                    selectHandler(value.toString());
                }
            }))();
        }
    }
}
