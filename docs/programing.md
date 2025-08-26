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

> [!TIP]
> Create this enum first so that it can be used later when creating the entity.

```php
<?php

namespace App\Entity\Product;

enum ProductDemonstrationStatus: string
{
    case Requested = 'requested';
    case Handling = 'handling';
    case Pending = 'pending';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * @return string[]
     */
    public static function toArray(): array
    {
        return array_column(self::cases(), 'value');
    }
}
```

| Property name | Field type         | Notes                                                                            |
|---------------|--------------------|----------------------------------------------------------------------------------|
| product       | ManyToOne          | related to: App\Entity\Product\Product <br/> nullable: no <br/> add property: no |
| title         | string             | all by default                                                                   |
| description   | text               | nullable: yes                                                                    |
| capacity      | integer            | all by default                                                                   |
| featured      | boolean            | all by default                                                                   |
| status        | enum               | enum class: App\Entity\Product\ProductDemonstrationStatus                        |
| createdAt     | datetime_immutable | all by default                                                                   |
| updatedAt     | datetime_immutable | nullable: yes                                                                    |

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
use Sylius\Resource\Model\ResourceInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Table(name: 'app_product_demonstration')]
#[ORM\Entity(repositoryClass: ProductDemonstrationRepository::class)]
class ProductDemonstration implements ResourceInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Product $product = null;

    #[Assert\NotBlank(groups: ['sylius']), Assert\Length(max: 255, groups: ['sylius'])]
    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[Assert\Positive(groups: ['sylius'])]
    #[ORM\Column]
    private int $capacity = 0;

    #[ORM\Column]
    private bool $featured = false;

    #[ORM\Column(enumType: ProductDemonstrationStatus::class)]
    private ProductDemonstrationStatus $status = ProductDemonstrationStatus::Requested;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $completedAt = null;

    public function __construct()
    {
        $this->setCreatedAt(new \DateTimeImmutable());
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

    public function setTitle(?string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getCapacity(): int
    {
        return $this->capacity;
    }

    public function setCapacity(int $capacity): static
    {
        $this->capacity = $capacity;

        return $this;
    }

    public function isFeatured(): bool
    {
        return $this->featured;
    }

    public function setFeatured(bool $featured): static
    {
        $this->featured = $featured;

        return $this;
    }

    public function getStatus(): ProductDemonstrationStatus
    {
        return $this->status;
    }

    public function setStatus(ProductDemonstrationStatus $status): static
    {
        $this->status = $status;

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

    public function getCompletedAt(): ?\DateTimeImmutable
    {
        return $this->completedAt;
    }

    public function setCompletedAt(?\DateTimeImmutable $completedAt): static
    {
        $this->completedAt = $completedAt;

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

use App\Entity\Product\Product;
use App\Entity\Product\ProductDemonstration;
use App\Entity\Product\ProductDemonstrationStatus;
use App\Utils\UserAccessHelperInterface;
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
        private readonly UserAccessHelperInterface $userAccessHelper,
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
                ->setEnabled($this->userAccessHelper->isAdminUser())
            )
            ->addFilter(Filter::create('title', 'string')
                ->setLabel('sylius.ui.title')
            )
            ->addFilter(Filter::create('createdAt', 'date')
                ->setLabel('sylius.ui.created_at')
            )
            ->addFilter(Filter::create('featured', 'boolean')
                ->setLabel('app.ui.featured')
            )

            ->addField(StringField::create('product')
                ->setLabel('sylius.ui.product')
                ->setSortable(true)
                ->setEnabled($this->userAccessHelper->isAdminUser())
            )
            ->addField(Field::create('title', 'string')
                ->setLabel('sylius.ui.title')
                ->setSortable(true)
            )
            ->addField(StringField::create('description')
                ->setLabel('sylius.ui.description')
                ->setEnabled($this->userAccessHelper->isAdminPage())
            )
            ->addField(TwigField::create('featured', '@SyliusUi/Grid/Field/enabled.html.twig')
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
                ->setEnabled($this->userAccessHelper->isAdminUser())
            )

            ->addActionGroup(MainActionGroup::create(
                Action::create('create', 'create')
                    ->setEnabled($this->userAccessHelper->isAdminUser()),
            ))
            ->addActionGroup(ItemActionGroup::create(
                Action::create('show', 'show')
                    ->setEnabled($this->userAccessHelper->isShopUser()),
                Action::create('update', 'update'),
                Action::create('delete', 'delete')
                    ->setEnabled($this->userAccessHelper->isAdminUser()),
            ))
            ->addActionGroup(BulkActionGroup::create(
                Action::create('delete', 'delete')
                    ->setEnabled($this->userAccessHelper->isAdminUser()),
            ))

            ->addOrderBy('createdAt')
            ->setLimits([8, 16, 32, 64])
        ;
    }
}
```

Now, if you look at this grid in the admin panel, everything is perfectly displayed, but if you switch to the customer's shop,
you can see that `title` filter and `featured` field are not styled as well as others.
That's it! This is the problem this whole party is about. If you try to override the templates for `SyliusUiBundle`,
you will face the situation that these changes will be applied to both sides. Fortunately, now we can fix it this way:

```php
<?php

namespace App\Grid;

use App\Entity\Product\Product;
use App\Entity\Product\ProductDemonstration;
use App\Utils\UserAccessHelperInterface;
use App\Utils\UserThemeHelperInterface;
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
        private readonly UserAccessHelperInterface $userAccessHelper,
        private readonly UserThemeHelperInterface $userThemeHelper,
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
                ->setTemplate($this->getTemplateByTheme('filter', 'entity'))
                ->setEnabled($this->userAccessHelper->isAdminUser())
            )
            ->addFilter(Filter::create('title', 'string')
                ->setLabel('sylius.ui.title')
                ->setTemplate($this->getTemplateByTheme('filter', 'string'))
            )
            ->addFilter(Filter::create('createdAt', 'date')
                ->setLabel('sylius.ui.created_at')
                ->setTemplate($this->getTemplateByTheme('filter', 'date'))
            )
            ->addFilter(Filter::create('featured', 'boolean')
                ->setLabel('app.ui.featured')
                ->setTemplate($this->getTemplateByTheme('filter', 'boolean'))
            )

            ->addField(StringField::create('product')
                ->setLabel('sylius.ui.product')
                ->setSortable(true)
                ->setEnabled($this->userAccessHelper->isAdminUser())
            )
            ->addField(Field::create('title', 'string')
                ->setLabel('sylius.ui.title')
                ->setSortable(true)
            )
            ->addField(StringField::create('description')
                ->setLabel('sylius.ui.description')
                ->setEnabled($this->userAccessHelper->isAdminPage())
            )
            ->addField(TwigField::create('featured', $this->getTemplateByTheme('field', 'yesNo'))
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
                ->setEnabled($this->userAccessHelper->isAdminUser())
            )

            ->addActionGroup(MainActionGroup::create(
                Action::create('create', $this->getTemplateByTheme('action', 'create'))
                    ->setEnabled($this->userAccessHelper->isAdminUser()),
            ))
            ->addActionGroup(ItemActionGroup::create(
                Action::create('show', $this->getTemplateByTheme('action', 'show'))
                    ->setEnabled($this->userAccessHelper->isShopUser()),
                Action::create('update', $this->getTemplateByTheme('action', 'update')),
                Action::create('delete', $this->getTemplateByTheme('action', 'delete'))
                    ->setEnabled($this->userAccessHelper->isAdminUser()),
            ))
            ->addActionGroup(BulkActionGroup::create(
                Action::create('delete', $this->getTemplateByTheme('action', 'delete'))
                    ->setEnabled($this->userAccessHelper->isAdminUser()),
            ))

            ->addOrderBy('createdAt')
            ->setLimits([8, 16, 32, 64])
        ;
    }

    private function getTemplateByTheme(string $type, string $name): string
    {
        $isShopPageOfBootstrapTheme = $this->userAccessHelper->isShopPage() && $this->userThemeHelper->isBootstrapTheme();

        if ($type === 'action') {
            return $isShopPageOfBootstrapTheme ? 'theme.bootstrap.' . $name : $name;
        }

        return sprintf(
            '@Sylius%s/Grid/%s/%s.html.twig',
            $isShopPageOfBootstrapTheme ? 'Shop' : 'Ui',
            ucfirst($type),
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
