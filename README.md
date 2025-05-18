# sLogi

<table>
    <tr>
        <td>
            <img src="public/slogi-icon.png" height="75" alt="sLogi Icon"/>
        </td>
        <td style="vertical-align: middle; padding-left: 16px;">
            <a href="https://slogi.joshlmao.com">slogi.joshlmao.com</a>
        </td>
    </tr>
</table>

A fast and lightweight online tool for debugging and analyzing Unreal Engine log files.

# Development

A next.js v15 app, built using the App router approach.

1. Clone the repo
2. `npm install`
3. `npm run dev`

# Tests

Tests can be run using `npm run tests` and verify the core functionality of the app. Can be found under the `/src/app/tests/`

# Localization

The app can be localized and supports expanding to new languages. Locale files can be found as json files under `/public/locales/`

## Adding a new locale

1. Create a new json file with the translated phrases.
2. Add the locale code and localized label inside `languageUtils.ts`, `getSupportedLanguages()`
