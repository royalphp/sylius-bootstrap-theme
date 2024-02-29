## Why do we need this?

Conventionally, the user interface can be divided into two parts, the admin panel `SyliusAdminBundle`, and the customer shop `SyliusShopBundle`, both parts use another common bundle `SyliusUiBundle`.
When one UI framework is used for both the admin panel and the customer shop (as is currently the case with `Semantic UI`),
it works correctly. However, if one part begins to use another UI framework (for example `Bootstrap`),
then by redefining common templates from the `SyliusUiBundle` bundle to provide correct rendering for `SyliusShopBundle`, these changes will also affect `SyliusAdminBundle`.

Unfortunately, the Sylius development team does not currently provide a solution to this problem,
so we have come up with a workaround that will allow avoiding unwanted style collisions.

The idea is to redefine templates from `SyliusUiBundle` used by `SyliusShopBundle` and place them inside the templates directory of your theme,
and then in the project settings specify new template paths for the `SyliusUiBundle` and `SyliusGridBundle` bundles to be used for this theme.

Let's look in more detail at what is meant. From the [installation guide](installation.md), you have indicated the following settings:

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

First and foremost, let's say that we use the prefix `theme.bootstrap` for all overrides, so you can quickly find what was overridden,
and since we are overriding templates for the customer's shop, their path now starts with `@SyliusShop`, not `@SyliusUi`.
Using a prefix is needed so as not to override the base templates from the `SyliusUiBundle` and `SyliusGridBundle` bundles, essentially this is what we aim for,
to have templates with `Semantic UI` styles work for the admin panel, but for your customer shop theme `Bootstrap` is used.

You can verify this for yourself by running the following command for `SyliusUiBundle` settings:

```shell
php bin/console debug:config sylius_ui events
```

and find your new events, for example `theme.bootstrap.sylius.grid`, also you can find an event without a prefix called `sylius.grid`,
and as you might have guessed, they differ in that they have different template paths.

You can also check the same for `SyliusGridBundle` settings:

```shell
php bin/console debug:config sylius_grid templates
```

Here you can observe, for example, for the action `theme.bootstrap.default` we have the template `@SyliusShop/Grid/Action/default.html.twig` (this is what we specified in the settings for your theme),
and you can also see the action `default`, which has the corresponding template `@SyliusUi/Grid/Action/default.html.twig`, the naming logic is the same for everything else.

In this way, you can keep the logic of using `SyliusUiBundle` and `SyliusGridBundle` bundles without worrying about something somewhere being overridden, and it works as intended.
However, it should be noted that it works with the standard content that is immediately provided in the `Sylius-Standard` edition.
If you already have or want to add a new grid for your project that will be used for both the admin panel and the customer shop,
you should keep in mind that for grid templates you need to manually specify them in your Grid classes, this is described in more detail in [this guide](programing.md).

**[Go back to the documentation's installation](installation.md)**
