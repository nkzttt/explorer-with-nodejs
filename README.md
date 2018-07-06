# Explorer with NodeJS

`Node.js: v8.11.3`

## Scraping with `puppeteer`

This is simply to get `innerText` of specified pages.

### How to set up

1. Create a json file referring a sample file where it's `/mysettings/targets.sample.json`.
2. Require the file within an `app.js` instead of the `/mysettings/targets.sample.json`.

#### Behavior for property

- `url`: is opened by browser
- `cassette`: is depended from the `selectors`
- `selectors`:
  - `type`: refer below table
  - `selector`: in the client code
- `noticeNewData`: whether to search new data

`type` property in the `selectors` is specification that what to get property of node.

| type | to get property |
| :---: | :---: |
| text | `innerText` |
| link | `href` |
