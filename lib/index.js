import listDiff from './list-diff';
import Element from './element';

const target = ['a', 'b', 'c', 'd', 'e'],
    source = ['e', 'd', 'e'];

const root = new Element('ul', {
    class: 'test-ul'
}, [
    new Element('li', ['Text1']),
    new Element('li', ['Text2']),
    new Element('li', ['Text3'])
]);

document.getElementById('root').appendChild(
    root.render()
);

console.log(listDiff(source, target, _ => _));
