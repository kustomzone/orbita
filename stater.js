var _ = require('lodash');
module.exports = (initialState, onChange) => {
    var stater = (partialState) => {
        if (_.isFunction(partialState)) {
            partialState = partialState(stater.state);
        }
        partialState = _.clone(partialState);
        if (_.isPlainObject(partialState) && _.isPlainObject(stater.state)) {
            partialState = _.extend({}, stater.state, partialState);
        }
        if (!_.isEqual(partialState, stater.state)) {
            stater.state = partialState;
            onChange(stater.state);
        }
    }
    stater.state = _.clone(initialState);
    return stater;
}