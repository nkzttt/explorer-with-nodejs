const fs = require('fs');
const path = require('path');
const idx = require('idx');
const {diff} = require('deep-object-diff');
const explorePage = require('./modules/scraping');
const line = require('./modules/line');

const targets = require('./mysettings/targets');
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

  // check cache data
  let hasCache = false;
  try {
    fs.accessSync(cacheDataPath);
    hasCache = true;
  } catch (err) {}

  // check updated
  let newData;
  if (hasCache && targets[site].noticeNewData) {
    const beforeData = JSON.parse(fs.readFileSync(cacheDataPath));
    newData = await checkUpdated(beforeData, desiredData);
  }

  // push line
  if (targets[site].pushLine) {
    let pushData = targets[site].noticeNewData ? newData : desiredData;

    // to string
    if (idx(pushData, _ => _.length)) {
      pushData = pushData.map(currentData => {
        if (idx(currentData, _ => _.length)) {
          return currentData.join('\n')
        }
        return currentData;
      }).join('\n\n');
    }

    if (pushData) line.pushMessage(createMessage(pushData));
  }

  // update cache
  fs.writeFile(cacheDataPath, JSON.stringify(desiredData));
}

/**
 * check updated from checking before
 * @param {Array} before
 * @param {Array} after
 * @returns {Promise<void>}
 */
async function checkUpdated(before, after) {
  // search first match
  let matchedIndex = -1;
  after.some((currentData, i) => {
    const matched = Object.keys(diff(before[0], currentData)).length === 0;
    if (matched) matchedIndex = i;
    return matched;
  });

  // new data is before matched index.
  // if not match then all data is new.
  let newData;
  if (matchedIndex !== 0) {
    newData = matchedIndex === -1 ? after : after.slice(0, matchedIndex);
  }

  return newData;
}

/**
 * create message for line push
 * @param {string} pushData
 * @returns {string}
 */
function createMessage(pushData) {
  return `

新しいデータを見つけました！

${pushData}

  `.trim();
}
