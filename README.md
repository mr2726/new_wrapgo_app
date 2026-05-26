# New Wrap Go App

## Components

### Button_

Path: src/components/ui/buttons.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| title | string | Yes | Text shown inside the button |
| onPress | function | Yes | Callback fired on press |
| style | object \| array | No | Additional styles for the button |
| dispable | boolean | No | Disables press action and reduces button opacity |

Note: the prop is named `dispable` in code (not `disable`).

#### Example

```jsx
<Button_
	title="Continue"
	onPress={() => console.log('Pressed')}
	dispable={false}
/>
```

### Input_

Path: src/components/ui/inputs.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| placeholder | string | No | Placeholder text shown when value is empty |
| value | string | Yes | Current input value |
| onChangeText | function | Yes | Callback fired when text changes |
| style | object \| array | No | Additional styles for the input field |
| label | string | No | Label displayed above the input |
| error | boolean \| string | No | Error state flag. If a string is passed, it is used as the error message |
| errorText | string | No | Error message text shown under the input |
| onFocus | function | No | Callback fired when input gets focus |
| onBlur | function | No | Callback fired when input loses focus |
| icon | ReactNode \| function | No | Icon inside input. Can be an element or a function receiving {isActive, error} |
| isPassword | boolean | No | Enables password mode and shows the eye toggle icon inside the input |

Notes:
- `icon` is rendered inside the input on the left.
- `isPassword` adds an eye toggle inside the input on the right and switches `secureTextEntry`.
- when `error` is true and `errorText` is empty, the default message is "Input error".

#### Example

```jsx
<Input_
	placeholder="Phone"
	value={phone}
	onChangeText={setPhone}
	label="Password"
	isPassword={true}
	error={true}
	errorText="Invalid password"
	icon={<Feather name="phone" size={20} color="#626262" />}
/>
```

### Selector_

Path: src/components/ui/selectors.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| options | array | Yes | List of options for dropdown. Expected item shape: { label, value } |
| value | object | No | Currently selected option object. When empty, selector shows an empty value |
| onValueChange | function | Yes | Callback fired when user selects an option |
| style | object \| array | No | Additional styles for the selector pressable container |
| label | string | No | Label shown above the selector |
| error | boolean \| string | No | Reserved prop in current implementation (not rendered yet) |
| errorText | string | No | Reserved prop in current implementation (not rendered yet) |

Notes:
- Press on selector toggles open/close state.
- Chevron icon on the right switches between up and down based on open state.
- On option press, component calls `onValueChange(option)` and closes the list.

#### Example

```jsx
<Selector_
	label="Category"
	value={selectedCategory}
	options={[
		{ label: 'Food', value: 'food' },
		{ label: 'Transport', value: 'transport' },
		{ label: 'Health', value: 'health' },
	]}
	onValueChange={setSelectedCategory}
/>
```

### SettingsButton

Path: src/components/ui/settingsButton.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| title | string | Yes | Button text shown next to the left icon |
| onPress | function | Yes | Callback fired when button is pressed |
| icon | string | No | Feather icon name for the left icon. Defaults to "settings" |

Notes:
- Left side renders icon + title.
- Right side always renders Feather `arrow-right` icon.
- Component uses fixed dark style and full width.

#### Example

```jsx
<SettingsButton
	title="Profile"
	icon="user"
	onPress={() => console.log('Open Profile settings')}
/>
```

### InfoInput_

Path: src/components/ui/infoInputs.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| label | string | Yes | Text shown above the info row |
| value | string | Yes | Value displayed inside the row |
| style | object \| array | No | Additional styles for the outer Pressable |
| icon | string | No | Feather icon name shown on the right. Defaults to "arrow-right" |
| onPress | function | No | Callback fired when the row is pressed |

Notes:
- Entire component is pressable.
- Label is rendered above a dark rounded row.
- Right icon is rendered with Feather and changes based on `icon`.

#### Example

```jsx
<InfoInput_
	label="Phone"
	value="+1 234 567 890"
	icon="chevron-right"
	onPress={() => console.log('Open phone details')}
/>
```

### InfoButton_

Path: src/components/ui/infoButton.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| icon | string | No | Feather icon name shown in the center. Defaults to "info" |
| onPress | function | No | Callback fired when the button is pressed |

Notes:
- Component renders a compact round icon button.
- Uses `LinearGradient` from `expo-linear-gradient`.
- Background uses a subtle diagonal highlight: from transparent to `rgba(255, 255, 255, 0.05)`.
- Intended for contextual info, help and quick action triggers.

#### Example

```jsx
<InfoButton_
	icon="help-circle"
	onPress={() => console.log('Open help')}
/>
```

### StatusBar_

Path: src/components/ui/statusBar.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| title | string | Yes | Main status title shown in the bar |
| description | string | Yes | Secondary status text shown under the title |
| style | object \| array | No | Additional styles for the outer container |
| icon | string | No | Feather icon name shown on the left. Defaults to "info" |
| color | string | No | Color for the left icon. Defaults to `#939393` |
| onPress | function | No | Callback fired when the close button is pressed |

Notes:
- Component renders a compact dark status row with icon, title and description.
- Close button on the right is rendered only when `onPress` is passed.
- Intended for inline alerts, warnings and short informational messages.

#### Example

```jsx
<StatusBar_
	title="Connection issue"
	description="Check your network and try again."
	icon="alert-triangle"
	color="#FFB020"
	onPress={() => console.log('Dismiss status')}
/>
```