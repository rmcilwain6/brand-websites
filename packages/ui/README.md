# @repo/ui

Shared React components used across apps. Minimal — only truly shared primitives live here. App-specific components stay in the app.

---

## Components

### `Button`

```tsx
import { Button } from '@repo/ui';

<Button variant="primary" size="md" onClick={...}>Book a session</Button>
```

| Prop      | Type                                  | Default     |
| --------- | ------------------------------------- | ----------- |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"primary"` |
| `size`    | `"sm" \| "md" \| "lg"`                | `"md"`      |

### `Card`

```tsx
import { Card } from '@repo/ui';

<Card>...</Card>;
```

A surface container with the warm shadow and border styling from the design system. Accepts standard HTML div props.
