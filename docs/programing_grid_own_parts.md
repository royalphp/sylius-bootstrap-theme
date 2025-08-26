## How to create your own grid parts?

> [!IMPORTANT]  
> This is a continuation of [this guide](programing.md), and it's strongly recommended to start with it.

In [this helper](programing_grid_helper.md) it is also defined that we can set the style type for the action, let's try it on the example of creating your own action, which does not exist yet.
You should remember if you want to control something that will be displayed differently, you have to take care of all the cases of these displays.
That is, if you want to add a new action template for `Bootstrap` theme, you should also create the same action template for other themes,
in your case it's `Semantic UI` theme (by default for the admin panel, and for the customer's shop, if there are no themes).

Let's create a `Detail` action, and an appropriate template for it, for this we first need to define this in the settings.

In `config/packages/sylius_grid.yaml` add the following paths:

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

use App\Entity\Product\Product;
use App\Entity\Product\ProductDemonstration;
use App\Utils\GridHelperInterface;
use Sylius\Bundle\GridBundle\Builder\Action\Action;
use Sylius\Bundle\GridBundle\Builder\ActionGroup\BulkActionGroup;
use Sylius\Bundle\GridBundle\Builder\ActionGroup\ItemActionGroup;
use Sylius\Bundle\GridBundle\Builder\ActionGroup\MainActionGroup;
use Sylius\Bundle\GridBundle\Builder\Field\DateTimeField;
use Sylius\Bundle\GridBundle\Builder\Field\Field;
use Sylius\Bundle\GridBundle\Builder\Field\StringField;
use Sylius\Bundle\GridBundle\Builder\Field\TwigField;
use Sylius\Bundle\GridBundle\Builder\Filter\Filter;
use Sylius\Bundle\GridBundle\Builder\GridBuilderInterface;
use Sylius\Bundle\GridBundle\Grid\AbstractGrid;
use Sylius\Bundle\GridBundle\Grid\ResourceAwareGridInterface;

final class ProductDemonstrationGrid extends AbstractGrid implements ResourceAwareGridInterface
{
    public function __construct(
        private readonly GridHelperInterface $gridHelper,
    ) {
    }

    public static function getName(): string
    {
        return 'app_product_demonstration';
    }

    public function getResourceClass(): string
    {
        return ProductDemonstration::class;
    }

    public function buildGrid(GridBuilderInterface $gridBuilder): void
    {
        $gridBuilder
            ->addFilter(Filter::create('product', 'entity')
                ->setFormOptions(['class' => Product::class])
                ->setLabel('sylius.ui.product')
                ->setTemplate($this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_FILTER, 'entity'))
                ->setEnabled($this->gridHelper->getUserAccessHelper()->isAdminUser())
            )
            ->addFilter(Filter::create('title', 'string')
                ->setLabel('sylius.ui.title')
                ->setTemplate($this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_FILTER, 'string'))
            )
            ->addFilter(Filter::create('createdAt', 'date')
                ->setLabel('sylius.ui.created_at')
                ->setTemplate($this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_FILTER, 'date'))
            )
            ->addFilter(Filter::create('featured', 'boolean')
                ->setLabel('app.ui.featured')
                ->setTemplate($this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_FILTER, 'boolean'))
            )

            ->addField(StringField::create('product')
                ->setLabel('sylius.ui.product')
                ->setSortable(true)
                ->setEnabled($this->gridHelper->getUserAccessHelper()->isAdminUser())
            )
            ->addField(Field::create('title', 'string')
                ->setLabel('sylius.ui.title')
                ->setSortable(true)
            )
            ->addField(StringField::create('description')
                ->setLabel('sylius.ui.description')
                ->setEnabled($this->gridHelper->getUserAccessHelper()->isAdminPage())
            )
            ->addField(TwigField::create('featured', $this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_FIELD, 'yesNo'))
                ->setLabel('app.ui.featured')
                ->setSortable(true)
            )
            ->addField(DateTimeField::create('createdAt')
                ->setLabel('sylius.ui.created_at')
                ->setSortable(true)
            )
            ->addField(DateTimeField::create('completedAt')
                ->setLabel('app.ui.completed_at')
                ->setSortable(true)
                ->setEnabled($this->gridHelper->getUserAccessHelper()->isAdminUser())
            )

            ->addActionGroup(MainActionGroup::create(
                Action::create('create', $this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_ACTION, 'create'))
                    ->setEnabled($this->gridHelper->getUserAccessHelper()->isAdminUser()),
            ))
            ->addActionGroup(ItemActionGroup::create(
                Action::create('detail', $this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_ACTION, 'detail'))
                    ->setLabel('app.ui.detail')
                    ->setOptions(['link' => [
                        'route' => 'sylius_shop_product_show',
                        'parameters' => ['slug' => 'resource.product.slug'],
                    ]]),
                Action::create('show', $this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_ACTION, 'show'))
                    ->setEnabled($this->gridHelper->getUserAccessHelper()->isShopUser()),
                Action::create('update', $this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_ACTION, 'update')),
                Action::create('delete', $this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_ACTION, 'delete'))
                    ->setEnabled($this->gridHelper->getUserAccessHelper()->isAdminUser()),
            ))
            ->addActionGroup(BulkActionGroup::create(
                Action::create('delete', $this->gridHelper->getTemplateByTheme(GridHelperInterface::GRID_ACTION, 'delete'))
                    ->setEnabled($this->gridHelper->getUserAccessHelper()->isAdminUser()),
            ))

            ->addOrderBy('createdAt')
            ->setLimits([8, 16, 32, 64])
        ;
    }
}
```

**[Go back to the documentation's programing](programing.md)**
