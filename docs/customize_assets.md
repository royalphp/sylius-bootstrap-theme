## How to add assets to an existing theme?

At this customization assets step, you've realized that you don't need to fully override the base theme's assets,
but rather just supplement with new scripts or styles. By following the next instructions, you can achieve just that.
For example, let's create a super useful function and equally useful styles:

#### 1. Create corresponding files:

```shell
touch themes/CustomBootstrapTheme/assets/{scripts/message.ts,styles/mark.scss}
```

#### 2. For `message.ts` file, add the following:

```javascript
export default function (name: string): string {
    return `Hello, ${name}!`;
}
```

#### 3. And add the following for `mark.scss` file:

```scss
h2 {
  background-color: yellow;
}
```

Also, don't forget to include them in your entry files:

#### 4. In the `entry.ts` file:

```typescript
import message from './message';

console.log(message('Guest'));
```

#### 5. And in the `mark.scss` file:

```scss
@import './mark';
```

Here you created simple files for displaying a message in the browser console, and highlighted the background for the second level header tag.

Next, we need to supplement two template files, in which scripts and styles are being included:

#### 6. Create corresponding files:

```shell
mkdir -p themes/CustomBootstrapTheme/templates/bundles/SyliusShopBundle/
touch themes/CustomBootstrapTheme/templates/bundles/SyliusShopBundle/{_scripts.html.twig,_styles.html.twig}
```

#### 7. For `_scripts.html.twig` file, add the following:

```html
{{ encore_entry_script_tags('theme-shop-sylius-bootstrap-entry', null, 'theme.shop.sylius_bootstrap') }}
{{ encore_entry_script_tags('additional_entry_script', null, 'theme.shop.sylius_bootstrap') }}
```

#### 8. And add the following for `_styles.html.twig` file:

```html
{{ encore_entry_link_tags('theme-shop-sylius-bootstrap-style', null, 'theme.shop.sylius_bootstrap') }}
{{ encore_entry_link_tags('additional_entry_style', null, 'theme.shop.sylius_bootstrap') }}
```

#### 9. Insert the following methods into an already existing `themeShopSyliusBootstrapConfig` config:

```javascript
Encore
    // other methods
    .addEntry('additional_entry_script', path.resolve(__dirname, 'themes/CustomBootstrapTheme/assets/scripts/entry.ts'))
    .addStyleEntry('additional_entry_style', path.resolve(__dirname, 'themes/CustomBootstrapTheme/assets/styles/entry.scss'))
```

#### 10. The only thing left is to compile your assets:

```shell
yarn encore dev --progress
```

Here you're adding your additional entry files to those that the base theme uses.
This way you can add new scripts and styles without changing the existing ones.

**[Go back to the documentation's customize](customize.md)**
