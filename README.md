# Explorer with NodeJS

`Node.js: v8.11.3`

## Scraping with `puppeteer`

This is simply to get `innerText` of specified pages.

### How to set up

1. Create a json file referring a sample file where it's `/mysettings/targets.sample.json`.
2. Require the file within an `app.js` instead of the `/mysettings/targets.sample.json`.

If you want to simply scraping then the `cassette` property set empty string as `""` and when the `selectors` property should have single value for array.  
Otherwise set string of the selector then it's searching selector with in the `cassette`.  