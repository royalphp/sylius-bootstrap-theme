## How to manually install the theme?

Given that this theme is based on the [SyliusThemeBundle](https://github.com/Sylius/SyliusThemeBundle) bundle,
you can directly place your own, or third-party theme in the `themes` directory, which by default is located at the root of your Sylius project.
To install in the `themes` directory, you can either simply download this repository and then manually place it in the `themes` directory,
or clone this repository into the corresponding directory of your project.

> [!WARNING]
> After manual installation, you lose the ability for automatic updates support and fixes, and you will have to maintain this manually.

### How to download the source code?

You can either go to the [releases page](https://github.com/royalphp/sylius-bootstrap-theme/releases), and download the archive of the latest release,
or on the main [repository page](https://github.com/royalphp/sylius-bootstrap-theme) click the green "Code" button, and from the drop-down list choose the "Local" tab, and then the "Download ZIP" option.
Once you have done this, extract it into the `themes` directory in such a way to maintain the structure of the theme,
i.e., so that there are no subfolders.

### How to clone the source code?

You can clone the repository into the `themes` directory, which should be located at the root of your project. To do this, execute the following command:

```shell
git clone git@github.com:royalphp/sylius-bootstrap-theme.git themes/SyliusBootstrapTheme
```

**[Go back to the documentation's installation](installation.md)**
