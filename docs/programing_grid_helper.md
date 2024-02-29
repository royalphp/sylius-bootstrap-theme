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

interface GridHelperInterface extends UserAccessInterface, UserThemeInterface
{
    final public const GRID_ACTION = 'action';

    final public const GRID_FIELD = 'field';

    final public const GRID_FILTER = 'filter';

    final public const GRID_PARTS = [
        self::GRID_ACTION,
        self::GRID_FIELD,
        self::GRID_FILTER,
    ];

    public function getTemplateByTheme(string $type, string $name): string;
}
```

Next, create the `App\Utils\GridHelperTrait` trait:

```php
<?php

namespace App\Utils;

trait GridHelperTrait
{
    use UserAccessTrait;
    use UserThemeTrait;

    public function isShopPageOfBootstrapTheme(): bool
    {
        return $this->isShopPage() && $this->isBootstrapTheme();
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
            $type,
            $name,
        );
    }
}
```

And now let's finalize your grid using the newly created helper:

```php
<?php

namespace App\Grid;

use App\Entity\Product\ProductDemonstration;
use App\Utils\GridHelperInterface;
use App\Utils\GridHelperTrait;
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
