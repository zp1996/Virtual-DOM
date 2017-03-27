import listDiff from './list-diff';

const target = ['a', 'b', 'c', 'd', 'e'],
    source = ['e', 'd', 'e'];

console.log(listDiff(source, target, _ => _));
