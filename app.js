const puppeteer = require('puppeteer');
const targets = require('./mysettings/targets.sample');
const sites = Object.keys(targets);

sites.forEach(site => {
  explorePage(targets[site]).then(desiredData => {
    console.log(`site: ${site}`);
    desiredData.forEach(eachData => console.log(eachData));
  });
});

/**
 * get data from data of the targets
 * @param {string} url
 * @param {string} cassette - this param may be empty with string.
 * @param {Array} selectors
 * @returns {Promise<*>}
 */
async function explorePage({url, cassette, selectors}) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // move to target page
  await page.goto(url);

  // waiting for be visible
  const forWaitSelector = cassette || selectors[0].selector;
  await page.waitForSelector(forWaitSelector);

  // execute client scripts
  const desiredData = await page.evaluate(({cassette, selectors}) => {
    if (cassette) {

      // search from element of parent of the selectors
      const cassetteNodes = Array.from(document.querySelectorAll(cassette));
      return cassetteNodes.map(cassetteNode => {
        return selectors.map(({type, selector}) => {
          const node = cassetteNode.querySelector(selector);
          switch (type) {
            case 'link':
              return node.href;
            case 'text':
            default:
              return node.innerText;
          }
        });
      });

    } else {

      // direct search for the selectors
      return selectors.map(({type, selector}) => {
        const nodes = Array.from(document.querySelectorAll(selector));
        return nodes.map(node => {
          switch (type) {
            case 'link':
              return node.href;
            case 'text':
            default:
              return node.innerText;
          }
        });
      });

    }
  }, {cassette, selectors});

  await browser.close();

  return desiredData;
}
