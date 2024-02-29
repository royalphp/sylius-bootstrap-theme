enum SCHEMES {
    Auto = 'auto',
    Light = 'light',
    Dark = 'dark',
}

export default function (): void {
    const getStoredTheme = (): SCHEMES | null => {
        const storedTheme = localStorage.getItem('theme')?.toLowerCase() as SCHEMES;

        return Object.values(SCHEMES).includes(storedTheme) ? storedTheme : null;
    };
    const setStoredTheme = (theme: SCHEMES): void => {
        localStorage.setItem('theme', theme);
    };
    const getPreferredTheme = (): SCHEMES => {
        const storedTheme = getStoredTheme();
        if (storedTheme != null) {
            return storedTheme;
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? SCHEMES.Dark : SCHEMES.Light;
    };
    const setTheme = (theme: SCHEMES): void => {
        if (theme === SCHEMES.Auto && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-bs-theme', SCHEMES.Dark);
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme);
        }
    };

    setTheme(getPreferredTheme());

    const showActiveTheme = (theme: SCHEMES, focus = false): void => {
        const themeSwitcher = document.querySelector<HTMLButtonElement>('#bd-theme');

        if (themeSwitcher === null) {
            return;
        }

        const themeSwitcherText = document.querySelector<HTMLSpanElement>('#bd-theme-text');
        const activeThemeIcon = document.querySelector<SVGUseElement>('.theme-icon-active use');
        const btnToActive = document.querySelector<HTMLButtonElement>(`[data-bs-theme-value="${theme}"]`);
        const svgOfActiveBtn = btnToActive?.querySelector<SVGUseElement>('svg use')?.getAttribute('href');

        document.querySelectorAll('[data-bs-theme-value]').forEach((element) => {
            element.classList.remove('active');
            element.setAttribute('aria-pressed', 'false');
        });

        btnToActive?.classList.add('active');
        btnToActive?.setAttribute('aria-pressed', 'true');
        activeThemeIcon?.setAttribute('href', svgOfActiveBtn ?? '#');
        const themeSwitcherLabel = `${themeSwitcherText?.textContent} (${btnToActive?.dataset.bsThemeValue})`;
        themeSwitcher.setAttribute('aria-label', themeSwitcherLabel);

        if (focus) {
            themeSwitcher.focus();
        }
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== SCHEMES.Light && storedTheme !== SCHEMES.Dark) {
            setTheme(getPreferredTheme());
        }
    });

    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme());

        document.querySelectorAll('[data-bs-theme-value]').forEach((toggle) => {
            toggle.addEventListener('click', () => {
                const theme = toggle.getAttribute('data-bs-theme-value') as SCHEMES;
                setStoredTheme(theme);
                setTheme(theme);
                showActiveTheme(theme, true);
            });
        });
    });
}
