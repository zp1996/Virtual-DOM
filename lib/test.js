const listdiff = require('./list-diff');

var oldList = [{id: "a"}, {id: "b"}, {id: "c"}, {id: "d"}, {zp: true}, {id: "e"}];
var newList = [{zp: false}, {id: "c"}, {id: "a"}, {id: "b"}, {id: "e"}, {id: "f"}];

const patch = (arr, moves) => {
    moves.forEach(move => {
        if (move.type === 0)
            arr.splice(move.index, 1);
        else
            arr.splice(move.index, 0, move.item);
    });
    return arr;
};

console.log(patch(oldList, listdiff(oldList, newList, 'id').moves));
