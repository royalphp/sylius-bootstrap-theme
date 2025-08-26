## How to improve the usage of the getTemplateByTheme method with a helper?

> [!IMPORTANT]  
> This is a continuation of [this guide](programing.md), and it's strongly recommended to start with it.

In the previous example, we wrote some conditions in the `getTemplateByTheme` method, but they do not cover all cases,
and you will also have to duplicate this method everywhere if you want to use this elsewhere, so let's also make a helper for it.

> [!WARNING]  
> This helper will be created based on [these two helpers](programing_helpers.md).

First, let's create the `App\Utils\GridHelperInterface` interface:

```php
<?php

namespace App\Utils;

interface GridHelperInterface
{
    final public const string GRID_ACTION = 'action';
    final public const string GRID_FIELD = 'field';
    final public const string GRID_FILTER = 'filter';
    final public const array GRID_PARTS = [
        self::GRID_ACTION,
        self::GRID_FIELD,
        self::GRID_FILTER,
    ];

    public function getUserAccessHelper(): UserAccessHelperInterface;

    public function getUserThemeHelper(): UserThemeHelperInterface;

    public function getTemplateByTheme(string $type, string $name): string;
}
```

Next, create the `App\Utils\GridHelper` class:

```php
<?php

namespace App\Utils;

final readonly class GridHelper implements GridHelperInterface
{
    public function __construct(
        private UserAccessHelperInterface $userAccessHelper,
        private UserThemeHelperInterface $userThemeHelper,
    ) {
    }

    public function getUserAccessHelper(): UserAccessHelperInterface
    {
        return $this->userAccessHelper;
    }

    public function getUserThemeHelper(): UserThemeHelperInterface
    {
        return $this->userThemeHelper;
    }

    public function getTemplateByTheme(string $type, string $name): string
    {
        if (!in_array($type, GridHelperInterface::GRID_PARTS, true)) {
            throw new \InvalidArgumentException(sprintf('Invalid grid part "%s"', $type));
        }

        if (GridHelperInterface::GRID_ACTION === $type) {
            return $this->isShopPageOfBootstrapTheme() ? 'theme.bootstrap.' . $name : $name;
        }

        return sprintf(
            '@Sylius%s/Grid/%s/%s.html.twig',
            $this->isShopPageOfBootstrapTheme() ? 'Shop' : 'Ui',
            ucfirst($type),
            $name,
        );
    }

    private function isShopPageOfBootstrapTheme(): bool
    {
        return $this->getUserAccessHelper()->isShopPage() && $this->getUserThemeHelper()->isBootstrapTheme();
    }
}
```

And now let's finalize your grid using the newly created helper:

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
