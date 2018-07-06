const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const {diff} = require('deep-object-diff');
const targets = require('./mysettings/targets.sample');
const sites = Object.keys(targets);

sites.forEach(site => fork(site));

/**
 * fork process
 * @param {string} site
 * @returns {Promise<void>}
 */
async function fork(site) {
  const desiredData = await explorePage(targets[site]);
  const cacheDataPath = path.join(__dirname, '.cache', `${site}.json`);

  // if missing before cache data when fall out block
  try {
    fs.accessSync(cacheDataPath);
  } catch (err) {
    fs.writeFile(cacheDataPath, JSON.stringify(desiredData));
    return;
  }

  // check updated
  if (targets[site].noticeNewData) {
    const beforeData = JSON.parse(fs.readFileSync(cacheDataPath));
    await checkUpdated({
      data: {
        before: beforeData,
        next: desiredData
      },
      site
    });
  }

  // todo: turn on
  // fs.writeFile(filePath, JSON.stringify(desiredData));
}

/**
 * check updated from checking before
 * @param {Object} data - {before: Array, next: Array}
 * @param {string} site
 * @returns {Promise<void>}
 */
async function checkUpdated({data, site}) {
  // search first match
  let matchedIndex = -1;
  data.next.some((currentData, i) => {
    const matched = Object.keys(diff(data.before[0], currentData)).length === 0;
    if (matched) matchedIndex = i;
    return matched;
  });

  // new data is before matched index.
  // if not match then all data is new.
  let newData;
  if (matchedIndex !== 0) {
    newData = matchedIndex === -1 ? data.next : data.next.slice(0, matchedIndex);
  }
  console.log(`newData: ${newData}`);
}

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
