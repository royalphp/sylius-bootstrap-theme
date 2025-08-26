## How to customize this theme?

Since this theme was created based on [SyliusThemeBundle](https://github.com/Sylius/SyliusThemeBundle), we have the ability to inherit an existing theme.
To utilize this ability, we need to repeat all the steps described in the aforementioned documentation.
For example, let's create a new theme and name it `CustomBootstrapTheme`, for this, we need to:

> [!NOTE]
> It is assumed that you are at the root of your project.

#### 1. Create a new folder with the same name in `themes/`:

```shell
mkdir -p themes/CustomBootstrapTheme
```

#### 2. Create a new `composer.json` file with the following content:

```shell
touch themes/CustomBootstrapTheme/composer.json
```

```json
{
  "name": "vendor/custom-bootstrap-theme",
  "extra": {
    "sylius-theme": {
      "title": "CustomBootstrapTheme",
      "parents": ["royalphp/sylius-bootstrap-theme"]
    }
  }
}
```

#### 3. Enable your new theme in your admin panel settings.

The steps are the same as when [installing](installation.md#use-syliusbootstraptheme) a theme.

## How to override theme templates?

If you check your customer shop, you won't see any changes because we only prepared the environment for making changes, but we didn't make any overrides.
Let's fix this and override the main page template, specifically the banner at the top, for this we need to:

#### 1. Create a file at the following path:

```shell
mkdir -p themes/CustomBootstrapTheme/templates/bundles/SyliusShopBundle/Homepage/
touch themes/CustomBootstrapTheme/templates/bundles/SyliusShopBundle/Homepage/_banner.html.twig
```

#### 2. Edit this file with any content, for example, you can use an example one:

```html
<div class="row mt-4">
    <div class="col">
        <div class="ratio ratio-21x9">
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
        </div>
    </div>
</div>
```

If you check your customer shop now, instead of the standard banner, you will see what you added to your new banner template.
In this way, you can override any template files that are available in the main theme following the same [structure](https://github.com/Sylius/SyliusThemeBundle/blob/2.4/docs/your_first_theme.md#theme-structure), and modify the theme to your needs.
Also, now you can switch between themes if you have several of them, and you can control how the theme should appear for one or another channel, while having only one base theme for all others.

> [!CAUTION]
> If you are creating new templates for your theme not present in the base theme, take care of the case
> when no theme is selected in your channel settings, or another theme that does not contain such a template is selected.

## How to override the theme's assets?

Asset management is done using WebpackEncoreBundle, so all the following steps are based on its configuration.
You need entry files for your scripts, and for your styles, for example, you can create them as follows:

#### 1. Create corresponding files:

```shell
mkdir -p themes/CustomBootstrapTheme/assets/{scripts,styles}
touch themes/CustomBootstrapTheme/assets/{scripts/entry.ts,styles/entry.scss}
```

Now you have two entry files for scripts `entry.ts`, and for styles `entry.scss`,
we will be attaching other scripts and styles to each one respectively.

Before we proceed, we need to decide what exactly you are going to do.
If you just need to enhance the project with new functionality, most likely you won't need to override assets from the base theme,
and it would be sufficient to just add scripts and styles to the existing theme. If so, [this guide](customize_assets.md) explains how to do this.
If you need control over all assets, you can do so in the following steps.

But first, we need to set up your `webpack.config.js` at the project root,
so that `Encore/Webpack` could manage the assets of the new custom theme.

#### 2. Append to the end of the file the following settings:

```javascript
Encore.reset();

Encore
    .setOutputPath('public/build/theme/shop/custom-bootstrap/')
    .setPublicPath('/build/theme/shop/custom-bootstrap')
    .addEntry('theme-shop-custom-bootstrap-entry', path.resolve(__dirname, 'themes/CustomBootstrapTheme/assets/scripts/entry.ts'))
    .addStyleEntry('theme-shop-custom-bootstrap-style', path.resolve(__dirname, 'themes/CustomBootstrapTheme/assets/styles/entry.scss'))
    .disableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .enableSassLoader()
    .enableTypeScriptLoader();

const themeShopCustomBootstrapConfig = Encore.getWebpackConfig();
themeShopCustomBootstrapConfig.name = 'theme.shop.custom_bootstrap';

module.exports = [
    // other configs
    themeShopCustomBootstrapConfig,
];
```

Next, we need to add the configuration to the project itself:

#### 3. Add the following to the `config/packages/webpack_encore.yaml` file:

```yaml
webpack_encore:
  builds:
    theme.shop.custom_bootstrap: '%kernel.project_dir%/public/build/theme/shop/custom-bootstrap'

framework:
  assets:
    packages:
      theme.shop.custom_bootstrap:
        json_manifest_path: '%kernel.project_dir%/public/build/theme/shop/custom-bootstrap/manifest.json'
```

Next, we need to override two template files where scripts and styles are being included:

#### 4. Create corresponding files:

```shell
mkdir -p themes/CustomBootstrapTheme/templates/bundles/SyliusShopBundle/
touch themes/CustomBootstrapTheme/templates/bundles/SyliusShopBundle/{_scripts.html.twig,_styles.html.twig}
```

#### 5. For `_scripts.html.twig` file, add the following:

```html
{{ encore_entry_script_tags('theme-shop-custom-bootstrap-entry', null, 'theme.shop.custom_bootstrap') }}
```

#### 6. And add the following for `_styles.html.twig` file:

```html
{{ encore_entry_link_tags('theme-shop-custom-bootstrap-style', null, 'theme.shop.custom_bootstrap') }}
```

#### 7. Include the scripts and styles you need:

As a starting point, you can copy the contents of the scripts/styles entry files
located in the `vendor/royalphp/sylius-bootstrap-theme/assets/scripts/entry.ts`/`vendor/royalphp/sylius-bootstrap-theme/assets/styles/entry.scss` folders,
and then remove or add whatever you want.

#### 8. The only thing left is to compile your assets:

```shell
npx encore dev
```

**[Go back to the documentation's index](index.md)**
