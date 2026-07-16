# New Wrap Go App

## Recent Updates

The app has been expanded with a fuller Expo 54 experience for onboarding, driver verification, Supabase-backed auth, and reusable UI modules.

Highlights:
- The app shell in App.js now loads the local Lufga font family and initializes login state from AsyncStorage before rendering the main content.
- Authentication and onboarding flows in the signup/signin screens were refreshed for sign-in, sign-up, and OTP-based password recovery.
- Verification screens were updated for driver details, vehicle type, vehicle photos, vehicle documents, and selfie capture.
- New shared UI modules such as BottomSheet, Map, Week, and upload extend the onboarding and profile experience.
- Backend integration in the service layer now covers Supabase auth, driver persistence, document upload, and password reset flows.

Latest patch updates:
- `npm start` now runs Expo with `--dev-client` so local runtime matches native-module setup.
- Home screen now stores fetched driver profile to `AsyncStorage` as `userData` for cross-screen reuse.
- Settings and SettingsContent now use `ScrollView` for safer small-screen layout behavior.
- Personal Information screen was rebuilt as controlled form state with editable inputs, change detection, and conditional Save button.
- Personal Information now supports profile persistence: loads from `AsyncStorage`, updates Supabase via `updatePersonalInfo`, then writes back locally.
- DateInput now supports read-only mode through `disabled` prop and normalizes displayed values to `YYYY/MM/DD`.
- Added `BUGS.md` as current iOS/UI known-issues list.
- Settings now includes a Vehicle Information route backed by Supabase vehicle lookup.
- Added `NonEditableInfo` reusable UI block for read-only profile and vehicle fields.
- Profile page was redesigned to load and render real user data from `AsyncStorage` (`userData`) including avatar, name, and quick stats.
- Profile metrics now include daily averages based on registration date (`userData.created_at`):
	- Distance average per day = `totaldistance / daysSinceRegistration`
	- Zone hours average per day = `zonehourse / daysSinceRegistration`
- Added `ScoreBreakdown` component (`src/components/ui/ScoreBreakdown.jsx`) to display Safety, Acceptance, and Activity progress bars with an aggregate score.
- Added `ProfileInfoBlock` component (`src/components/ui/profileInfoBlock.jsx`) for reusable stat cards on the profile screen.
- Added new theme color tokens in `src/styles/theme.js`:
	- `colors.iconBG` (`#131313`) for profile edit-button background
	- `colors.loaderBG` (`#2C2C2C`) for score progress track background
- Profile screen now includes a segmented switch (`Distance` / `Hours`) and weekly chart section under profile metrics.
- Added `Chart` component (`src/components/ui/Chart.jsx`) with:
	- custom data support via `data` prop (`label`/`lable`, `value`, `data`)
	- press-to-activate columns (green active state only after tap)
	- active value bubble above the selected week
	- corrected rounded active bars with proper clipping and top marker positioning
- `SegmentedControl_` (`src/components/ui/segmentedControl.jsx`) now has animated slider transition when switching options.
- Profile page wrapper now uses `ScrollView` to keep the full profile + chart layout scrollable on smaller screens.
- Home screen now normalizes `weeklyStat` before saving to `AsyncStorage`, and logs full nested profile payload via `JSON.stringify(..., null, 2)`.
- Profile weekly charts now read real values from `userData.weeklyStat.distance` and `userData.weeklyStat.hours` instead of hardcoded demo data.
- Added `ProfilePhotoSheet` (`src/components/ui/ProfilePhotoSheet.jsx`) as an animated bottom action sheet for avatar actions:
	- Choose from library
	- Take photo
	- Remove current photo
- Profile photo flow is now end-to-end:
	- pick/take image with `expo-image-picker`
	- upload image to Supabase storage via `uploadImageToStorage`
	- persist URL to `drivers.selfie` via `updateDriverSelfie`
	- sync updated profile back to `AsyncStorage`
- Profile now shows a fallback avatar placeholder when no selfie is available.
- Camera permission handling was hardened in profile flow:
	- blocked permission path now offers `Open settings`
	- camera errors now display the original exception message for faster debugging
- `app.json` now includes `expo-image-picker` and `expo-camera` plugins with explicit permission strings for stable native permission prompts.

## Development Build

This app uses native modules such as `@rnmapbox/maps`, so Expo Go is not the intended runtime.

Use the Android development build workflow:

```sh
npm run android
npm start
```

Run `npm run android` again after changing native dependencies or app config so the dev client stays in sync.

## Navigation

### Design System
- [Design System](#design-system)
- [Theme Tokens](#theme-tokens)
- [Fonts](#fonts)

### Components
- [Components](#components)
- [Button_](#button_)
- [Input_](#input_)
- [DateInput](#dateinput)
- [ProgressBar](#progressbar)
- [BottomSheet](#bottomsheet)
- [ProfilePhotoSheet](#profilephotosheet)
- [Map](#map)
- [Week](#week)
- [Upload](#upload)
- [OTPinput](#otpinput)
- [Selector_](#selector_)
- [SettingsButton](#settingsbutton)
- [InfoInput_](#infoinput_)
- [NonEditableInfo](#noneditableinfo)
- [InfoButton_](#infobutton_)
- [ToggleButton_](#togglebutton_)
- [SegmentControl_](#segmentcontrol_)
- [StatusBar_](#statusbar_)
- [TopSlide](#topslide)
- [TopControl](#topcontrol)
- [LOGO](#logo)
- [Menu](#menu)

### Pages
- [Pages](#pages)
- [Content](#content)
- [Settings](#settings)
- [SettingsContent](#settingscontent)
- [PersonalInfo](#personalinfo)
- [VehicleInformation](#vehicleinformation)
- [OnboardingContent](#onboardingcontent)
- [Page1](#page1)
- [Page2](#page2)
- [Page3](#page3)
- [Signup](#signup)
- [Signin](#signin)
- [OTPScreen](#otpscreen)
- [VereficationContent](#vereficationcontent)
- [DriverInfo](#driverinfo)
- [VehicleType](#vehicletype)
- [VehicleInfo](#vehicleinfo)
- [VehiclePhoto](#vehiclephoto)
- [VehicleDocuments](#vehicledocuments)
- [Selfie](#selfie)
- [Success](#success)
- [HowItWorks](#howitworks)
- [Loading](#loading)

### Backend
- [Backend](#backend)
- [Supabase Client](#supabase-client)
- [Service Layer](#service-layer)
- [signUpWithEmail](#signupwithemail)
- [signInWithEmail](#signinwithemail)
- [saveDriverData](#savedriverdata)
- [getVehicleDataByOTP](#getvehicledatabyotp)
- [sendOTP](#sendotp)
- [verifyOTP](#verifyotp)
- [changePassword](#changepassword)
- [updateDriverSelfie](#updatedriverselfie)

### Automation
- [Copilot Automation](#copilot-automation)
- [Git AutoPush Agent](#git-autopush-agent)
- [Conventional Commit Push Skill](#conventional-commit-push-skill)
- [.env Configuration](#env-configuration)

## Design System

### Theme Tokens

Path: src/styles/theme.js

This project now uses a centralized design tokens file for UI styling.

Exports:
- `colors`: global color palette (background, surface, text, accent, error, etc.)
- `spacing`: shared spacing scale (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`)
- `radius`: shared corner radius scale (`sm`, `md`, `lg`, `pill`, `full`)
- `typography`: shared font sizes, weights, and font family tokens

Recent update:
- `colors.icons` token was added for consistent icon color usage (`#626262`).

Usage pattern:

```jsx
import {colors, spacing, radius, typography} from '../../styles/theme';
```

Applied in:
- core UI components (`buttons`, `inputs`, `menu`, `selectors`, `settingsButton`, `statusBar`, `topControl`, `topSlide`, `toggleButton`, etc.)
- onboarding pages
- signup/signin pages
- success screen

Benefits:
- consistent visual style across screens
- faster global updates for colors, spacing, and typography
- reduced hardcoded style values in components

### Fonts

Paths:
- `src/styles/lufga/`
- `App.js`
- `src/styles/theme.js`

This project uses the local `Lufga` font family across the application.

Font loading:
- Fonts are loaded at runtime in `App.js` using `useFonts` from `expo-font`.
- The app waits until fonts are loaded before rendering the main UI.

Available families in `typography`:
- `familyThin`
- `familyLight`
- `familyRegular`
- `familyMedium`
- `familySemiBold`
- `familyBold`
- `familyBlack`

Usage pattern:

```jsx
import {typography} from '../../styles/theme';

<Text style={{ fontFamily: typography.familyRegular }}>
	Example text
</Text>
```

Applied in:
- shared UI components with text rendering
- onboarding text blocks
- signup/signin screens
- success screen

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
| disable | boolean | No | Initial editable state for input. Default is `true` |

Notes:
- `icon` is rendered inside the input on the left.
- `isPassword` adds an eye toggle inside the input on the right and switches `secureTextEntry`.
- when `error` is true and `errorText` is empty, the default message is "Input error".
- `style` prop can be passed to customize container spacing/layout per screen.
- `editable` is controlled by internal `disableInput` state.
- When input starts as non-editable (`disable={false}`), an edit icon appears to enable editing.

#### Example

```jsx
<Input_
	placeholder="Phone"
	value={phone}
	onChangeText={setPhone}
	label="Password"
	style={{marginBottom: 20}}
	isPassword={true}
	error={true}
	errorText="Invalid password"
	icon={<Feather name="phone" size={20} color="#626262" />}
/>
```

### DateInput

Path: src/components/ui/DateInput.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| label | string | No | Label shown above the field |
| value | string | No | Selected date in `YYYY-MM-DD` format |
| onChange | function | No | Callback fired when date is selected. Receives formatted `YYYY-MM-DD` string |
| error | boolean \| string | No | Error state or error text shown under the field |
| style | object \| array | No | Additional styles for the outer container |
| placeholder | string | No | Placeholder text when no date is selected |
| disabled | boolean | No | When `true`, date picker does not open and the field is read-only |

Notes:
- Uses `@react-native-community/datetimepicker` for native date selection.
- Opens picker modal when pressed (Android: closes after selection, iOS: uses Cancel/Done actions).
- Restricts date selection to today or earlier via `maximumDate={new Date()}`.
- Displays selected value as formatted `YYYY/MM/DD`.
- Accepts both `YYYY-MM-DD` and `YYYY/MM/DD` incoming values and normalizes rendering.

#### Example

```jsx
const [birthDate, setBirthDate] = React.useState('');

<DateInput
	label="Date of Birth"
	value={birthDate}
	onChange={setBirthDate}
	placeholder="YYYY/MM/DD"
/>
```

### ProgressBar

Path: src/components/ui/ProgressBar.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| step | number | Yes | Total number of progress segments rendered in the bar |
| activeStep | number | No | Active segment index (0-based). Active segment is highlighted with accent color |

Notes:
- Renders segments dynamically using `step` value.
- Segment count is sanitized with `Math.max(0, Number(step) || 0)`.
- Each segment uses equal width via `flex: 1`.
- Non-active segments use `colors.surface`; active segment uses `colors.accent`.

#### Example

```jsx
<ProgressBar step={4} activeStep={1} />
```

### BottomSheet

Path: src/components/ui/BottomSheet.jsx

This component renders a fullscreen modal-style bottom sheet with animated slide-up behavior and drag-to-close support. It is useful for onboarding guidance and other temporary panels.

### ProfilePhotoSheet

Path: src/components/ui/ProfilePhotoSheet.jsx

This component wraps `BottomSheet` for profile avatar actions and provides:
- choose from library action
- take photo action
- remove current photo action
- loading state while avatar upload/update is in progress

### Map

Path: src/components/ui/Map.jsx

This component wraps the Mapbox map view for location-based UI and can be dropped into screens that need a map preview.

### Week

Path: src/components/ui/Week.jsx

This small helper renders a compact weekly indicator with the current day highlighted.

### Upload

Path: src/components/ui/upload.jsx

This helper provides a styled document-upload surface with an upload icon and text prompt for document capture flows.

### OTPinput

Path: src/components/ui/OTPinput.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| value | object | Yes | OTP state object with keys `input1` to `input6` |
| onChangeText | function | Yes | State updater that receives full OTP object on each change |
| error | boolean \| string | No | When truthy, empty fields are highlighted as invalid |

Notes:
- Component renders six one-character inputs via `map`.
- Filled inputs use accent border color (`colors.accent`).
- If `error` is truthy, empty inputs use error border color (`colors.error`).
- On `Backspace` in an empty field, previous field is cleared.
- Auto-focus starts from first field and moves to the next field after entering one symbol.

#### Example

```jsx
const [otp, setOtp] = React.useState({
	input1: '',
	input2: '',
	input3: '',
	input4: '',
	input5: '',
	input6: '',
});

<OTPinput value={otp} onChangeText={setOtp} error={otpError} />
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

### NonEditableInfo

Path: src/components/ui/NonEdditableInfo.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| label | string | Yes | Label shown above the read-only value |
| value | string \| number | Yes | Displayed non-editable value |

Notes:
- Renders simple read-only information rows for settings and vehicle details.
- Uses theme typography tokens and rounded bordered surface styling.
- Intended for data that should be visible but not directly editable.

#### Example

```jsx
<NonEditableInfo
	label="Vehicle Make"
	value={vehicleData.mark}
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

### ToggleButton_

Path: src/components/ui/toggleButton.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| onPress | function | No | Callback fired on press. Receives next state: `true` or `false` |
| dispable | boolean | No | Disables toggle interaction and lowers opacity |
| style | object \| array | No | Additional styles for the outer toggle container |

Notes:
- Component keeps internal `isOn` state and switches it on every press.
- Toggle thumb moves left/right based on state.
- Active thumb color: `#39ff14`, inactive thumb color: `#626262`.

#### Example

```jsx
<ToggleButton_
	dispable={false}
	onPress={nextValue => console.log('Toggle value:', nextValue)}
/>
```

### SegmentControl_

Path: src/components/ui/segmentedControl.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| options | array | Yes | List of segments. Expected item shape: { label, value } |
| value | string | Yes | Current selected segment value |
| onValueChange | function | Yes | Callback fired on segment press. Receives selected `option.value` |
| style | object \| array | No | Additional styles for the outer container |

Notes:
- Component is controlled: active segment depends on incoming `value`.
- Active segment background: `#39ff14`; inactive segment background: transparent.
- Text color switches by state: active `#000`, inactive `#f5f5f5`.
- In code, exported component name is `SegmentedControl_`.

#### Example

```jsx
<SegmentedControl_
	options={[
		{ label: 'Day', value: 'day' },
		{ label: 'Week', value: 'week' },
		{ label: 'Month', value: 'month' },
	]}
	value={period}
	onValueChange={setPeriod}
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

### TopSlide

Path: src/components/ui/topSlide.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| slidePage | number | Yes | Active page index for the top indicator. Supported values: `0`, `1`, `2` |

Notes:
- Component renders a compact 3-step top progress indicator.
- Active green indicator (`#39ff14`) smoothly slides between steps when `slidePage` changes.
- Animation uses `Animated.timing` with cubic easing for a soft transition.
- Designed for flows with 3 pages/steps.

#### Example

```jsx
<TopSlide slidePage={1} />
```

### TopControl

Path: src/components/ui/topControl.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setLocalPage | function | Yes | Callback fired when back button is pressed. Called with `"signin"` |
| title | string | Yes | Header text shown on the right of back button |

Notes:
- Component renders a compact top header with a round back button and customizable page title.
- Back button icon uses `src/components/ui/imgs/ArrowLeft.png`.
- Back button background uses `LinearGradient` from `expo-linear-gradient` (`#0F0F0F` to `#202020`).

#### Example

```jsx
<TopControl setLocalPage={setLocalPage} title="Create Account" />
```

### LOGO

Path: src/components/ui/LOGO.jsx

#### Props

This component does not accept props.

Notes:
- Renders brand text split into two parts: Wrap and Go.
- Color style: Wrap uses light text (`#F5F5F5`), Go uses accent green (`#39FF14`).
- Intended for inline usage in headings and onboarding screens.

#### Example

```jsx
<LOGO />
```

### Menu

Path: src/components/ui/menu.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| items | array | Yes | Bottom menu items. Expected shape: { title, img } |
| onSelect | function | No | Callback fired on item press. Receives selected item object |

Notes:
- Component renders a fixed bottom capsule menu.
- Menu uses custom SVG icons from src/components/ui/imgs.
- Supported img keys: Home, Settings (or Contract), Info (or Wallet), User (or Profile).
- Active item is highlighted with a green circle.
- Green circle moves left/right with animation when active item changes.
- Icon colors: active `#000000`, inactive `#626262`.

#### Example

```jsx
<Menu
	items={[
		{ title: 'Home', img: 'Home' },
		{ title: 'Contract', img: 'Settings' },
		{ title: 'Wallet', img: 'Info' },
		{ title: 'Profile', img: 'User' },
	]}
	onSelect={(item) => console.log('Selected menu item:', item)}
/>
```

## Pages

### Content

Path: src/Pages/Content.js

#### Props

This page does not accept props.

Notes:
- Root page container for app page flow.
- Uses page state with 4 routes: `onboarding`, `signupandsignin`, `success`, `verification`.
- Renders `OnboardingContent` for onboarding flow.
- Renders `SignupAndSigninContent` for auth flow.
- Renders `VereficationContent` for driver verification flow.
- Renders `Success` screen after successful auth actions.
- Current initial route is `verification`.
- Uses dark background (`#040404`) and vertical margins.

#### Example

```jsx
<Content />
```

### Settings

Path: src/Pages/Content/SettingsScreens/Settings.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setPage | function | Yes | Parent page callback passed to `TopControl` for returning to profile |
| setSettingsPage | function | Yes | Local settings router used to open nested settings screens |

Notes:
- Renders settings actions through a `settingsContent` config array.
- Includes navigation entries for Personal Information and Vehicle Information.
- Uses `ScrollView` to avoid clipping on smaller screens.

#### Example

```jsx
<Settings setPage={setPage} setSettingsPage={setSettingsPage} />
```

### SettingsContent

Path: src/Pages/Content/SettingsScreens/SettingsContent.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setPage | function | Yes | Top-level page callback forwarded into nested settings screens |

Notes:
- Manages local settings route state with `settingsPage`.
- Switches between `Settings`, `PersonalInfo`, and `VehicleInformation` screens.
- Wraps the local settings flow in `ScrollView`.

#### Example

```jsx
<SettingsContent setPage={setPage} />
```

### PersonalInfo

Path: src/Pages/Content/SettingsScreens/PersonalInfo.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setPage | function | No | Currently accepted but not used inside the component |
| setSettingsPage | function | Yes | Used by `TopControl` to return to the main Settings list |

Notes:
- Loads driver profile from `AsyncStorage` key `userData`.
- Normalizes incoming profile fields from both local and Supabase-style field names.
- Tracks initial state and only shows `Save` when values changed.
- Uses `updatePersonalInfo` to persist editable fields to the `drivers` table.
- Keeps `Member Since` read-only by rendering it through disabled `DateInput`.

#### Example

```jsx
<PersonalInfo setSettingsPage={setSettingsPage} />
```

### VehicleInformation

Path: src/Pages/Content/SettingsScreens/VehicleInformation.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setPage | function | No | Currently accepted but not used inside the component |
| setSettingsPage | function | Yes | Used by `TopControl` to return to the main Settings list |

Notes:
- Fetches vehicle data on mount via `getVehicleDataByOTP("666666")`.
- Displays vehicle make, model, year, and plate as read-only values.
- Uses `NonEditableInfo` for consistent presentation of immutable vehicle details.

#### Example

```jsx
<VehicleInformation setSettingsPage={setSettingsPage} />
```

### OnboardingContent

Path: src/Pages/Onboarding/OnboardingContent.js

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setPage | function | Yes | Navigation callback used to switch page flow (for example to `signupandsignin`) |

Notes:
- Manages onboarding state with internal `slidePage` (`0`, `1`, `2`).
- Renders `TopSlide` and switches onboarding pages by current index.
- `Next` button cycles pages; on last page button title changes to `Done` and calls `setPage("signupandsignin")`.

#### Example

```jsx
<OnboardingContent setPage={setPage} />
```

### Page1

Path: src/Pages/Onboarding/Page1.js

#### Props

This page does not accept props.

Notes:
- First onboarding step with marketing headline and short description.
- Uses image asset `src/components/ui/imgs/W.png`.
- Text block is placed near the bottom while the image is positioned toward the top-right.

#### Example

```jsx
<Page1 />
```

### Page2

Path: src/Pages/Onboarding/Page2.js

#### Props

This page does not accept props.

Notes:
- Second onboarding step with earnings-focused message.
- Renders `LOGO` in top area and inline inside the headline.
- Uses chart image asset `src/components/ui/imgs/onb_chart.png`.

#### Example

```jsx
<Page2 />
```

### Page3

Path: src/Pages/Onboarding/Page3.js

#### Props

This page does not accept props.

Notes:
- Third onboarding step focused on weekly performance tracking.
- Renders `LOGO` in the top area of the screen.
- Uses chart image asset `src/components/ui/imgs/onb_lastchart.png`.

#### Example

```jsx
<Page3 />
```

### Signup

Path: src/Pages/SignupAndSignin/Signup.js

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setLocalPage | function | Yes | Navigation callback passed to `TopControl` for local page switching |
| setPage | function | Yes | Parent page callback used to move from auth flow to `success` |

Notes:
- Renders registration form with 4 controlled fields: Full Name, Email, Password, Confirm Password.
- Input fields are rendered from a config array via `map`, reducing repeated JSX.
- All fields are required.
- Email is validated by format (must be a valid email address).
- Password minimum length is 8 characters.
- Confirm Password must match Password.
- Terms of Service checkbox must be checked before submit.
- Submit action always runs validation and shows field errors when invalid.
- Validation errors are shown under corresponding fields and under checkbox when needed.
- Validation rules and initial form state are extracted to `src/Pages/SignupAndSignin/signupFormUtils.js`.

#### Example

```jsx
<Signup setLocalPage={setLocalPage} />
```

### Signin

Path: src/Pages/SignupAndSignin/Signin.js

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setLocalPage | function | Yes | Navigation callback used to switch back to `signup` from the sign in screen |
| setPage | function | Yes | Parent page callback used to open `success` after successful sign in |

Notes:
- Renders sign in screen with welcome block and `LOGO`.
- Contains email and password inputs rendered from field config (`map`).
- `Forgot Password?` switches local route to `otp`.
- `Sign Up` text at the bottom switches the local page to `signup`.
- `Sign In` button calls `signInWithEmail(email, password)`.
- On successful sign in, page state is switched to `success`.
- Shows inline validation errors for email/password after submit attempt.
- On auth failure, shows backend error message under inputs.
- Sign-in form config, initial state, and validation are extracted to `src/Pages/SignupAndSignin/signinFormUtils.js`.

#### Example

```jsx
<Signin setLocalPage={setLocalPage} />
```

### OTPScreen

Path: src/Pages/SignupAndSignin/OTP/OTPScreen.js

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setLocalPage | function | Yes | Passed to `TopControl` for returning to `signin` |
| setPage | function | Yes | Used to navigate to `success` after reset flow |

Notes:
- Screen has 3-step button state flow: `getOTP` -> `verify` -> `reset`.
- On `getOTP`, email is required; validation errors are shown through `Input_`.
- On `verify`, OTP is validated to 6 digits and shown with `OTPinput`.
- On `reset`, user enters `New Password` and `Confirm New Password`.
- Password validation on `reset`: passwords must match and have minimum length 8.
- On successful reset submit, screen calls `changePassword(newPassword)` and navigates to `success`.
- Email input uses `style` prop to adjust spacing based on current step.

#### Example

```jsx
<OTPScreen setLocalPage={setLocalPage} setPage={setPage} />
```

### VereficationContent

Path: src/Pages/Verefiacation/VereficationContent.js

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| setPage | function | Yes | Parent page callback used for top-level page navigation |

Notes:
- Entry screen for driver verification flow.
- Uses `TopControl` with title `Driver Verification`.
- Uses `ProgressBar` with `step={7}` and current active step index.
- Currently renders `DriverInfo` as first screen (`currentScreen === 0`).
- Continue button is present at bottom and currently calls `setPage('verification')`.

#### Example

```jsx
<VereficationContent setPage={setPage} />
```

### DriverInfo

Path: src/Pages/Verefiacation/DriverInfo.js

#### Props

This page does not accept props.

Notes:
- Uses `KeyboardAwareScrollView` to avoid keyboard overlap on form fields.
- Contains controlled form state: `fullName`, `email`, `phoneNumber`, `birthDate`.
- Uses shared `Input_` for text fields and `DateInput` for birth date.
- Full name field is rendered with `disable={false}` to start in non-editable mode with edit toggle.

#### Example

```jsx
<DriverInfo />
```

### VehicleType

Path: src/Pages/Verefiacation/VehicleType.js

Notes:
- Placeholder file created for upcoming verification step.

### VehicleInfo

Path: src/Pages/Verefiacation/VehicleInfo.js

Notes:
- Placeholder file created for upcoming verification step.

### VehiclePhoto

Path: src/Pages/Verefiacation/VehiclePhoto.js

Notes:
- Placeholder file created for upcoming verification step.

### VehicleDocuments

Path: src/Pages/Verefiacation/VehicleDocuments.js

Notes:
- Placeholder file created for upcoming verification step.

### Selfie

Path: src/Pages/Verefiacation/Selfie.js

Notes:
- Placeholder file created for upcoming verification step.

### Success

Path: src/components/screens/Success.jsx

#### Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| title | string | Yes | Main success headline text |
| description | string | Yes | Secondary success description text |

Notes:
- Renders centered success state screen on dark background.
- Shows round green icon container with Feather `check` icon.
- Used by `Content` when page state is `success`.

#### Example

```jsx
<Success
	title="Success"
	description="Your account has been created successfully!"
/>
```

## Backend

### Supabase Client

Path: src/components/service/supabase.js

Purpose:
- Creates and exports a shared Supabase client instance.
- Reads Supabase credentials from environment variables.

Environment keys used:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

Export:
- `supabase`: configured result of `createClient(supabaseUrl, supabaseKey)`.

### Service Layer

Path: src/components/service/service.js

#### signUpWithEmail

Signature:
- `signUpWithEmail(email, password)`

Description:
- Registers a new user using Supabase Auth email/password flow.
- Internally calls `supabase.auth.signUp({ email, password })`.

Params:
- `email` (string): user email.
- `password` (string): user password.

Returns:
- Supabase user object from `data.user`.

Throws:
- Supabase auth error when signup fails.

#### signInWithEmail

Signature:
- `signInWithEmail(email, password)`

Description:
- Signs in an existing user using Supabase Auth password login.
- Internally calls `supabase.auth.signInWithPassword({ email, password })`.

Params:
- `email` (string): user email.
- `password` (string): user password.

Returns:
- Supabase user object from `data.user`.

Throws:
- Supabase auth error when sign in fails.

#### saveDriverData

Signature:
- `saveDriverData(userId, fullName, email)`

Description:
- Inserts initial driver profile row into `drivers` table after successful signup.

Params:
- `userId` (string): auth user id.
- `fullName` (string): full name for driver profile.
- `email` (string): driver email.

Returns:
- Inserted row payload returned by Supabase (`data`).

Throws:
- Supabase insert error when write fails.

#### getVehicleDataByOTP

Signature:
- `getVehicleDataByOTP(otp)`

Description:
- Looks up a single vehicle record in the `vehicles` table by invite code / OTP.

Params:
- `otp` (string): invite code used to query the vehicle.

Returns:
- Matching vehicle row from Supabase.

Throws:
- Supabase select error when the vehicle cannot be fetched.

#### sendOTP

Signature:
- `sendOTP(email)`

Description:
- Sends an auth OTP/magic-link challenge for existing users by email.
- Internally calls `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`.

Params:
- `email` (string): email to send OTP/challenge.

Returns:
- No payload on success.

Throws:
- Supabase auth error when sending OTP/challenge fails.

#### verifyOTP

Signature:
- `verifyOTP(email, token)`

Description:
- Verifies OTP code for email auth flow.
- Internally calls `supabase.auth.verifyOtp({ email, token, type: "email" })`.

Params:
- `email` (string): email used during OTP request.
- `token` (string): 6-digit OTP code entered by user.

Returns:
- `true` when verification succeeds.
- `false` when Supabase verification returns an error.

#### changePassword

Signature:
- `changePassword(newPassword)`

Description:
- Updates current authenticated user password.
- Internally calls `supabase.auth.updateUser({ password: newPassword })`.

Params:
- `newPassword` (string): new password value.

Returns:
- No payload.

#### updatePersonalInfo

Signature:
- `updatePersonalInfo(email, updatedData)`

Description:
- Updates editable personal profile fields in the `drivers` table from Settings > Personal Information.

Params:
- `email` (string): user email used in `.eq('email', email)` filter.
- `updatedData` (object): mapped payload with `fullName`, `PhoneNumber`, and `birthDate`.

Returns:
- Updated row payload returned by Supabase (`data`).

Throws:
- Supabase update error when write fails.

#### updateDriverSelfie

Signature:
- `updateDriverSelfie(email, selfieUrl)`

Description:
- Updates `selfie` field in the `drivers` table for the matched email.
- Used by profile avatar action sheet after gallery/camera selection or remove-photo action.

Params:
- `email` (string): user email used in `.eq('email', email)` filter.
- `selfieUrl` (string | null): public URL of uploaded image, or `null` to remove current avatar.

Returns:
- Updated row payload returned by Supabase (`data`).

Throws:
- Supabase update error when write fails.

### Known Issues

Path: `BUGS.md`

Current known iOS/UI issues are tracked in a dedicated document:
- Splash screen layout issue in horizontal line.
- TopControl vertical position issue.
- Input keyboard-dismiss behavior issue.
- Signin/signup TopControl back navigation issue.
- Date of birth layout/position issue.

## Copilot Automation

### Git AutoPush Agent

Path: .github/agents/git-autopush.agent.md

Purpose:
- Provides a dedicated Copilot agent for safe `git add`, Conventional Commit creation, and `git push`.
- Uses Conventional Commits 1.0.0 commit title format.
- Avoids destructive git operations by default (no force push, no history rewrite unless explicitly requested).

### Conventional Commit Push Skill

Path: .github/skills/conventional-commit-push/SKILL.md

Purpose:
- Defines workflow rules for commit and push operations with Conventional Commits.
- Documents commit type guidance (`feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `ci`, `perf`).
- Includes safety checks for clean and predictable GitHub pushes.

### .env Configuration

Path: .env

Use only these keys:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

### Dependency Updates

Recent additions in dependencies:
- `@react-native-community/datetimepicker` for native date selection in `DateInput`.
- `react-native-keyboard-aware-scroll-view` for keyboard-safe form scrolling in verification pages.