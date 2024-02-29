## How to create a shared grid using different styles?

> [!IMPORTANT]
> We assume that you are familiar with grids. If not check the documentation of the [Customizing Grids](https://docs.sylius.com/en/latest/customization/grid.html) first.

As was described in [this guide](installation_overrides.md), we can't just use templates for `SyliusGridBundle` for any theme,
so a certain workaround has been invented, and this is what we're going to demonstrate here. Also, you will need helper classes,
which were provided as examples in [this guide](programing_helpers.md).

We are going to create a common grid, which will be used both in the admin panel and in the customer's shop,
using the `SyliusBootstrapTheme`. your goal is to style the customer's shop grid based on `Bootstrap`,
and leave the admin panel unchanged, that is, `Semantic UI` will be used. The main complexity lies in the fact
that both sides use the same component, so we have to trick it this way.

> [!NOTE]  
> You can use your own entity to generate the grid, or even an already generated grid,
> but if you don't have anything, you can use the following example.

First, you need to create an entity, for example, call it `App\Entity\Product\ProductDemonstration`, and add the following fields:

| Property name | Field type         | Notes                      |
|---------------|--------------------|----------------------------|
| product       | OneToOne           | App\Entity\Product\Product |
| title         | string             | all by default             |
| description   | text               | all by default             |
| counted       | integer            | all by default             |
| enabled       | boolean            | all by default             |
| createdAt     | datetime_immutable | all by default             |
| updatedAt     | datetime_immutable | all by default             |

> [!TIP]
> For `createdAt`, `updatedAt`, and `enabled` properties, you can use
> `Sylius\Component\Resource\Model\TimestampableTrait` and `Sylius\Component\Resource\Model\ToggleableTrait` traits, respectively.
> Also, using `StofDoctrineExtensionsBundle` bundle is a good idea.

After the creation of your demo entity, you will also need to create a migration, execute it,
and finally, generate a grid. As a result, `App\Grid\ProductDemonstrationGrid` grid,
which can be used for both, the admin panel and the customer's shop, will be generated for you.

The example of the generated demo grid might look like this:

```php
<?php

namespace App\Entity\Product;

use App\Repository\Product\ProductDemonstrationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Sylius\Component\Resource\Model\ResourceInterface;

#[ORM\HasLifecycleCallbacks]
#[ORM\Table(name: 'sylius_product_information')]
#[ORM\Entity(repositoryClass: ProductDemonstrationRepository::class)]
class ProductDemonstration implements ResourceInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(cascade: ['persist'])]
    private ?Product $product = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column]
    private int $counted = 0;

    #[ORM\Column]
    private bool $enabled = true;

    #[ORM\Column(name: 'created_at')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'updated_at', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\PrePersist]
    public function prePersistEntity(): void
    {
        $this->setCreatedAt(new \DateTimeImmutable());
    }

    #[ORM\PreUpdate]
    public function preUpdateEntity(): void
    {
        $this->setUpdatedAt(new \DateTimeImmutable());
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function setProduct(?Product $product): static
    {
        $this->product = $product;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getCounted(): int
    {
        return $this->counted;
    }

    public function setCounted(int $counted): static
    {
        $this->counted = $counted;

        return $this;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): static
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }
}
```

> [!TIP]
> If you encounter difficulties when setting up your grid for display,
> we recommend first reviewing the guide to create [your first grid](https://github.com/Sylius/SyliusGridBundle/blob/master/docs/your_first_grid.md).

In this guide, we are interested in how we can control the styling of both parts of the application,
while using the same component for each element in the grid.
Let's start by looking at what possibilities are already available out of the box, let's connect helpers,
make some fields available only for admin, and the rest will be available to the customer, and also add one simple filter.

```php
<?php

namespace App\Grid;

use App\Entity\Product\ProductDemonstration;
use App\Utils\UserAccessInterface;
use App\Utils\UserAccessTrait;
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
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

final class ProductDemonstrationGrid extends AbstractGrid implements ResourceAwareGridInterface, UserAccessInterface
{
    use UserAccessTrait;

    public function __construct(
        private readonly ?TokenStorageInterface $tokenStorage,
    ) {
    }

    public function buildGrid(GridBuilderInterface $gridBuilder): void
    {
        $gridBuilder
            ->addFilter(Filter::create('title', 'string'))
            ->addField(
                StringField::create('product')
                    ->setLabel('Product')
                    ->setSortable(true)
                    ->setEnabled($this->isAdminUser())
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
                TwigField::create('counted', '@SyliusUi/Grid/Field/rawLabel.html.twig')
            )
            ->addField(
                TwigField::create('enabled', '@SyliusUi/Grid/Field/enabled.html.twig')
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
}
```

Now, if you look at this grid in the admin panel, everything is perfectly displayed, but if you switch to the customer's shop,
you can see that `title` filter field, and `counted`, `enabled` fields are not styled.
That's it! This is the problem this whole party is about. If you try to override the templates for `SyliusUiBundle`,
you will face the situation that these changes will be applied to both sides. Fortunately, now we can fix it this way:

```php
<?php

namespace App\Grid;

use App\Entity\Product\ProductDemonstration;
use App\Utils\UserAccessInterface;
use App\Utils\UserAccessTrait;
use App\Utils\UserThemeInterface;
use App\Utils\UserThemeTrait;
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

final class ProductDemonstrationGrid extends AbstractGrid implements ResourceAwareGridInterface, UserAccessInterface, UserThemeInterface
{
    use UserAccessTrait;
    use UserThemeTrait;

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
                    ->setTemplate($this->getTemplateByTheme('filter', 'string'))
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
                TwigField::create('counted', $this->getTemplateByTheme('field', 'rawLabel'))
            )
            ->addField(
                TwigField::create('enabled', $this->getTemplateByTheme('field', 'enabled'))
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

    public function getTemplateByTheme(string $type, string $name): string
    {
        return sprintf(
            '@Sylius%s/Grid/%s/%s.html.twig',
            $this->isShopPage() && $this->isBootstrapTheme() ? 'Shop' : 'Ui',
            $type,
            $name,
        );
    }
}
```

Here we add a new `getTemplateByTheme` method, through which all the magic of controlling styling happens,
we substitute the template we need for the customer's shop, if it's actually a customer's shop page, and `Bootstrap` theme is active,
in other cases, everything will be displayed by default, that is, the admin panel will be displayed correctly, and even the customer's shop with other themes.

Read in [this guide](programing_grid_helper.md) how the `getTemplateByTheme` method usage can be improved with a helper,
and in [this guide](programing_grid_own_parts.md), how to create your own grid parts.

**[Go back to the documentation's index](index.md)**
