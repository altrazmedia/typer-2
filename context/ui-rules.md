# UI Rules


## Reusable UI Components

- All reusable UI components must be imported from `components/ui/`.
- If a required component does not exist, add it via the shadcn CLI: `npx shadcn@latest add <component>`.
- These components must not contain any business logic.


## Styling

- All styling must use Tailwind utility classes.
- Use the `cn()` helper from `lib/utils.ts` to conditionally combine classes.
- Do not use inline `style` props or hardcoded color values (hex, rgb, oklch, etc.).
- Do not use raw Tailwind color palette classes (`gray-*`, `blue-*`, `red-*`, etc.).
- Apply colors exclusively via semantic token classes: `bg-primary`, `text-muted-foreground`, `border-border`, `bg-destructive`, etc.
- Use the custom border-radius tokens defined in `app/globals.css` (`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, etc.) rather than arbitrary values.


## Colors

- All color tokens are defined in `app/globals.css`.
- Both light and dark themes are supported. The dark theme is activated by adding the `dark` class to the `<html>` element.


## Typography

- Use the font token classes (`font-sans`, `font-mono`, `font-heading`) defined in `app/globals.css`; do not reference font family names directly.


## Icons

- Use icons from the `lucide-react` package.
- Import icons by name: `import { Trophy, Users } from "lucide-react"`.


## Animations

- Use utility classes from `tw-animate-css` and Tailwind's built-in animation utilities (e.g., `animate-pulse` for skeleton loading states).
- Do not add custom CSS animations unless no existing utility class covers the need.


## Mobile First

The app is used primarily on mobile devices. Default layouts must work well on small screens. Use responsive prefixes (`sm:`, `md:`, `lg:`) only to progressively enhance the experience on wider viewports.

- Use stacked/vertical layouts as the base case.
- Ensure interactive elements have touch-friendly tap targets (minimum ~44 px height/width).


## Language

All user-facing text — labels, buttons, titles, descriptions, error messages, and placeholders — must be written in **Polish**. See `context/code-standards.md` for the full language rule.
