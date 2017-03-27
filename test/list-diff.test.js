const mocha = require('mocha'),
    { assert } = require('chai'),
    listDiff = require('../lib/list-diff');

const equal = (arrA, arrB) => JSON.stringify(arrA) === JSON.stringify(arrB);

const patch = (arr, moves) => {
    moves.forEach(move => {
        if (move.type === 0)
            arr.splice(move.index, 1);
        else
            arr.splice(move.index, 0, move.item);
    });
    return arr;
};

const start = 97, count = 26, maxLen = 20;

describe('测试list-diff', () => {
    describe('随机测试字符串数组', () => {
        const target = ['a', 'b', 'c', 'd', 'e'];
        let i = 0;
        while (i++ < 1000) {
            const len = Math.ceil(Math.random() * maxLen),
                source = [];
            let j = 0;
            while (j < len) {
                source[j++] = String.fromCharCode(
                    Math.floor(Math.random() * count) + start
                );
            }
            it(`${source}转化为${target}`, () => {
                assert(
                    equal(
                        target,
                        patch(source, listDiff(source, target, _ => _).moves)
                    )
                );
            });
        }
    });
});
