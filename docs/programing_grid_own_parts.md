## How to create your own grid parts?

> [!IMPORTANT]  
> This is a continuation of [this guide](programing.md), and it's strongly recommended to start with it.

In [this helper](programing_grid_helper.md) it is also defined that we can set the style type for the action, let's try it on the example of creating your own action, which does not exist yet.
You should remember if you want to control something that will be displayed differently, you have to take care of all the cases of these displays.
That is, if you want to add a new action template for `Bootstrap` theme, you should also create the same action template for other themes,
in your case it's `Semantic UI` theme (by default for the admin panel, and for the customer's shop, if there are no themes).

Let's create a `Detail` action, and an appropriate template for it, for this we first need to define this in the settings.

In `config/packages/_sylius.yaml` add the following paths:

```yaml
sylius_grid:
  templates:
    action:
      detail: '@SyliusUi/Grid/Action/detail.html.twig'
      theme.bootstrap.detail: '@SyliusShop/Grid/Action/detail.html.twig'
```

> [!NOTE]  
> For `filter` and `bulk_action` keys the settings will be similar.

As you can see, the settings contain two templates at once, one for `Semantic UI` theme, and one for `Bootstrap` theme.
This will allow us to display them differently depending on the theme while having one common grid.

Now let's implement these two templates, first for `Semantic UI` theme,
for this create it at `templates/bundles/SyliusUiBundle/Grid/Action/detail.html.twig`:

```html
{% import '@SyliusUi/Macro/buttons.html.twig' as buttons %}

{% set path = options.link.url|default(path(options.link.route, options.link.parameters)) %}

{{ buttons.default(path, action.label, null, 'info circle', 'purple') }}
```

then use it for your customer's shop, for this create it at `templates/bundles/SyliusShopBundle/Grid/Action/detail.html.twig`:

```html
{% extends '@SyliusUi/Grid/Action/detail.html.twig' %}
```

> [!NOTE]  
> In the future, you can use this template for other themes as a stub.

Now let's implement a template for `Bootstrap` theme,
for this create it at `themes/CustomBootstrapTheme/templates/bundles/SyliusShopBundle/Grid/Action/detail.html.twig`:

```html
{% import '@SyliusShop/Common/Macro/buttons.html.twig' as buttons %}

{% set path = options.link.url|default(path(options.link.route, options.link.parameters)) %}

{{ buttons.default(path, action.label, null, 'info-circle', 'btn-outline-primary btn-sm') }}
```

Now you're ready to use it in your grid, let's add this to your previous example:

```php
<?php

namespace App\Grid;

use App\Entity\Product\ProductDemonstration;
use App\Utils\GridHelperInterface;
use App\Utils\GridHelperTrait;
use Sylius\Bundle\GridBundle\Builder\Action\Action;
use Sylius\Bundle\GridBundle\Builder\Action\CreateAction;
use Sylius\Bundle\GridBundle\Builder\Action\DeleteAction;
use Sylius\Bundle\GridBundle\Builder\Action\ShowAction;
use Sylius\Bundle\GridBundle\Builder\Action\UpdateAction;
use Sylius\Bundle\GridBundle\Builder\ActionGroup\BulkActionGroup;
use Sylius\Bundle\GridBundle\Builder\ActionGroup\ItemActionGroup;
use Sylius\Bundle\GridBundle\Builder\ActionGroup\MainActionGroup;
use Sylius\Bundle\GridBundle\Builder\Field\DateTimeField;
use Sylius\Bundle\GridBundle\Builder\Field\StringField;
use Sylius\Bundle\GridBundle\Builder\Field\TwigField;
use Sylius\Bundle\GridBundle\Builder\Filter\Filter;
use Sylius\Bundle\GridBundle\Builder\GridBuilderInterface;
use Sylius\Bundle\GridBundle\Grid\AbstractGrid;
use Sylius\Bundle\GridBundle\Grid\ResourceAwareGridInterface;
use Sylius\Bundle\ThemeBundle\Context\ThemeContextInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

final class ProductDemonstrationGrid extends AbstractGrid implements ResourceAwareGridInterface, GridHelperInterface
{
    use GridHelperTrait;

    public function __construct(
        private readonly ?TokenStorageInterface $tokenStorage,
        private readonly ?ThemeContextInterface $themeContext,
    ) {
    }

    public function buildGrid(GridBuilderInterface $gridBuilder): void
    {
        $gridBuilder
            ->addFilter(
                Filter::create('title', 'string')
                    ->setTemplate($this->getTemplateByTheme(self::GRID_FILTER, 'string'))
            )
            ->addField(
                StringField::create('title')
                    ->setLabel('Title')
                    ->setSortable(true)
            )
            ->addField(
                StringField::create('description')
                    ->setLabel('Description')
                    ->setSortable(true)
            )
            ->addField(
                TwigField::create('counted', $this->getTemplateByTheme(self::GRID_FIELD, 'rawLabel'))
            )
            ->addField(
                TwigField::create('enabled', $this->getTemplateByTheme(self::GRID_FIELD, 'enabled'))
            )
            ->addField(
                DateTimeField::create('createdAt')
            )
            ->addActionGroup(
                MainActionGroup::create(
                    CreateAction::create(),
                )
            )
            ->addActionGroup(
                ItemActionGroup::create(
                    Action::create('detail', $this->getTemplateByTheme(self::GRID_ACTION, 'detail'))
                        ->setLabel('Detail')
                        ->setOptions([
                            'link' => [
                                'route' => 'sylius_shop_product_show',
                                'parameters' => ['slug' => 'resource.product.slug'],
                            ],
                        ]),
                ),
            );

        if ($this->isAdminUser()) {
            $gridBuilder
                ->addField(
                    StringField::create('product')
                        ->setLabel('Product')
                        ->setSortable(true)
                )
                ->addField(
                    DateTimeField::create('updatedAt')
                )
                ->addActionGroup(
                    ItemActionGroup::create(
                        ShowAction::create(),
                        UpdateAction::create(),
                        DeleteAction::create(),
                    )
                )
                ->addActionGroup(
                    BulkActionGroup::create(
                        DeleteAction::create()
                    )
                );
        }

        if ($this->isShopUser()) {
            $gridBuilder
                ->addActionGroup(
                    ItemActionGroup::create(
                        ShowAction::create(),
                        UpdateAction::create(),
                    )
                );
        }
    }

    public static function getName(): string
    {
        return 'app_product_information';
    }

    public function getResourceClass(): string
    {
        return ProductDemonstration::class;
    }

    private function getTokenStorage(): ?TokenStorageInterface
    {
        return $this->tokenStorage;
    }

    private function getThemeContext(): ?ThemeContextInterface
    {
        return $this->themeContext;
    }
}
```

**[Go back to the documentation's programing](programing.md)**
