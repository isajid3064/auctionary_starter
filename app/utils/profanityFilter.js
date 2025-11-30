const Filter = require('bad-words');

const filter = new Filter();

const profanityFilter = (text) => {
    return filter.clean(text || '');
};

module.exports = profanityFilter;