import Element from './element';
import diff from './diff';
import { patch } from './patch';

const ul = new Element('ul', { id: 'list' }, [
    new Element('li', {class: 'item', key: '4'}, ['Item 4']),
    new Element('li', {class: 'item', key: '1'}, ['Item 1']),
    new Element('li', {class: 'item', key: '2'}, ['Item 2']),
    new Element('li', {class: 'item', key: '3'}, ['Item 3'])
]);
const ul1 = new Element('ul', { id: 'list' }, [
    new Element('li', {class: 'item', key: '1'}, ['Item 1']),
    new Element('li', {class: 'item', key: '2'}, ['Item 2']),
    new Element('li', {class: 'item', key: '3'}, ['Item 3']),
    new Element('li', {class: 'item', key: '5'}, ['Item 5']),
    new Element('li', {class: 'item', key: '6'}, ['Item 6']),
]);
const patches = diff(ul , ul1),
    dom = ul.render();

document.body.appendChild(dom);

setTimeout(function () {
    patch(dom, patches);
}, 2000);
