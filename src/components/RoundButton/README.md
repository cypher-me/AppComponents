# RoundButton

Actions with a button.

### Usage

```js
import { RoundButton } from "app-components";
```

```jsx
<RoundButton
  disabled={false}
  type="plus"
  onClick={() => alert("Button clicked")}
/>
```

### Properties

| Props      |   Type   | Required |         Values          | Default | Description                                           |
| ---------- | :------: | :------: | :---------------------: | :-----: | ----------------------------------------------------- |
| `disabled` |  `bool`  |    -     |            -            | `false` | Disables the button default functionality             |
| `type`    | `oneOf`  |    -     |`plus`, `minus`| `plus` | Sets the button view type                                 |
| `onClick`  |  `func`  |    -     |            -            |    -    | The event triggered when the button is clicked        |
| `tabIndex` | `number` |    -     |            -            |  `-1`   | The tabIndex attribute specifies the tab order of the button (when the "tab" button is used for navigating).                             |
