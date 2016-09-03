var _ = require('lodash');
module.exports = (initialState, onChange) => {
    var state = _.clone(initialState);
    return (partialState) => {
        if (_.isFunction(partialState)) {
            partialState = partialState(state);
        }
        partialState = _.clone(partialState);
        if (_.isPlainObject(partialState) && _.isPlainObject(state)) {
            partialState = _.extend({}, state, partialState);
        }
        if (!_.isEqual(partialState, state)) {
            state = partialState;
            onChange(state);
        }
    }
}