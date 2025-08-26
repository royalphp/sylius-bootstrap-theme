## Install SyliusBootstrapTheme

Within the Sylius project, you can either install this theme manually or install it as a composer package.
It is recommended to install via composer, however, to install the theme manually, go to [this guide](installation_manual.md).

### Composer installation

Run the following command:

```shell
composer req royalphp/sylius-bootstrap-theme
```

### Edit project configuration

#### 1. In the `config/packages/_sylius.yaml` file, add the path to the installed package:

```yaml
sylius_theme:
  sources:
    filesystem:
      directories:
        - '%kernel.project_dir%/vendor/royalphp/sylius-bootstrap-theme'
```

#### 2. In the `config/packages/webpack_encore.yaml` file, add paths where the compiled files will be located:

```yaml
webpack_encore:
  builds:
    theme.shop.sylius_bootstrap: '%kernel.project_dir%/public/build/theme/shop/sylius-bootstrap'

framework:
  assets:
    packages:
      theme.shop.sylius_bootstrap:
        json_manifest_path: '%kernel.project_dir%/public/build/theme/shop/sylius-bootstrap/manifest.json'
```

#### 3. Also in the app config, add templates of Grid system:

We redefine general styles for the Grid, so you also need to write the following settings
(why you need to do this, you can find out in [this guide](installation_overrides.md)):

in the `config/packages/sylius_ui.yaml` add:

```yaml
sylius_ui:
  events:
    theme.bootstrap.sylius.grid:
      blocks:
        content:
          template: "@SyliusShop/Grid/_content.html.twig"
          priority: 10
    theme.bootstrap.sylius.grid.body:
      blocks:
        navigation:
          template: "@SyliusShop/Grid/Body/_navigation.html.twig"
          priority: 30
        table:
          template: "@SyliusShop/Grid/Body/_table.html.twig"
          priority: 20
        pagination:
          template: "@SyliusShop/Grid/Body/_pagination.html.twig"
          priority: 10
    theme.bootstrap.sylius.grid.filters:
      blocks:
        content:
          template: "@SyliusShop/Grid/Filter/_content.html.twig"
          priority: 10
```

and in the `config/packages/sylius_grid.yaml` add:

```yaml
sylius_grid:
  templates:
    action:
      theme.bootstrap.default: '@SyliusShop/Grid/Action/default.html.twig'
      theme.bootstrap.create: '@SyliusShop/Grid/Action/create.html.twig'
      theme.bootstrap.delete: '@SyliusShop/Grid/Action/delete.html.twig'
      theme.bootstrap.show: '@SyliusShop/Grid/Action/show.html.twig'
      theme.bootstrap.update: '@SyliusShop/Grid/Action/update.html.twig'
      theme.bootstrap.apply_transition: '@SyliusShop/Grid/Action/applyTransition.html.twig'
      theme.bootstrap.links: '@SyliusShop/Grid/Action/links.html.twig'
      theme.bootstrap.archive: '@SyliusShop/Grid/Action/archive.html.twig'
    filter:
      theme.bootstrap.string: '@SyliusShop/Grid/Filter/string.html.twig'
      theme.bootstrap.boolean: '@SyliusShop/Grid/Filter/boolean.html.twig'
      theme.bootstrap.date: '@SyliusShop/Grid/Filter/date.html.twig'
      theme.bootstrap.entity: '@SyliusShop/Grid/Filter/entity.html.twig'
      theme.bootstrap.money: '@SyliusShop/Grid/Filter/money.html.twig'
      theme.bootstrap.exists: '@SyliusShop/Grid/Filter/exists.html.twig'
      theme.bootstrap.select: '@SyliusShop/Grid/Filter/select.html.twig'
    bulk_action:
      theme.bootstrap.delete: '@SyliusShop/Grid/BulkAction/delete.html.twig'
```

### Configuring Encore/Webpack

All javascript extensions for the user interface have been rewritten in typescript,
so if your project is still not using it, you need to perform the following step:

#### 1. Add Encore/Webpack depends:

```shell
npm install --save-dev \
    typescript \
    ts-loader@^9.0.0
```

> [!IMPORTANT]  
> If you are installing typescript for the first time, you will also need a configuration file,
> you can use [this config](https://github.com/royalphp/sylius-demo/blob/1.x/tsconfig.json) from the demo example.

#### 2. Add theme depends:

You need to prepare a new theme for working with webpack and include it in the build process.

```shell
npm install --save-dev \
    @types/bootstrap \
    @popperjs/core \
    bootstrap \
    bootstrap-icons \
    flag-icons \
    tom-select
```

#### 3. In the `webpack.config.js` file, add configurations for the new theme:

```javascript
Encore.reset();

Encore
    .setOutputPath('public/build/theme/shop/sylius-bootstrap/')
    .setPublicPath('/build/theme/shop/sylius-bootstrap')
    .addEntry('theme-shop-sylius-bootstrap-entry', path.resolve(__dirname, 'vendor/royalphp/sylius-bootstrap-theme/assets/scripts/entry.ts'))
    .addStyleEntry('theme-shop-sylius-bootstrap-style', path.resolve(__dirname, 'vendor/royalphp/sylius-bootstrap-theme/assets/styles/entry.scss'))
    .disableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .enableSassLoader()
    .enableTypeScriptLoader();

const themeShopSyliusBootstrapConfig = Encore.getWebpackConfig();
themeShopSyliusBootstrapConfig.name = 'theme.shop.sylius_bootstrap';

module.exports = [
    // other configs
    themeShopSyliusBootstrapConfig,
];
```

> [!WARNING]  
> In this example, it is assumed that you installed this repository via composer,
> but if you chose another option, don't forget to specify the valid path to your entry files in the `addEntry` and `addStyleEntry` methods.

#### 4. Compile assets:

After performing all the above steps, you can build assets:

```shell
npx encore dev
```

> [!NOTE]  
> If you are using the `Sylius-Standard` edition, or `sylius-demo`,
> you are likely to have quick commands from the `package.json` file in the `scripts` section such as `npm run dev` and others.

### Use SyliusBootstrapTheme

After performing all the above steps, now all you have to do is activate your theme in your admin panel, to do this follow these steps:

1. Log in to your admin panel.
2. Go to the `Configuration > Channels` section, and start editing your current channel.
3. In the `Look & feel` section, select the `SyliusBootstrapTheme` theme and save the changes.
4. Enjoy your new frontend for your customer shop.

**[Go back to the documentation's index](index.md)**
