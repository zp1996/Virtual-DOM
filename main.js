require(['element', 'diff', 'patch'], function (Element, diff, patch) {
	var ul = new Element("ul", {id: "list"}, [
		Element("li", {class: 'item', key: '4'}, ['Item 4']),
		Element("li", {class: 'item', key: '1'}, ['Item 1']),
		Element("li", {class: 'item', key: '2'}, ['Item 2']),
		Element("li", {class: 'item', key: '3'}, ['Item 3'])
	]);
	var ul1 = new Element("ul", {id: "list"}, [
		Element("li", {class: 'item', key: '3'}, ['Item 3']),
		Element("li", {class: 'item', key: '2'}, ['Item 2']),
		Element("li", {class: 'item', key: '1'}, ['Item 1']),
		Element("li", {class: 'item', key: '0'}, ['Item 0']),
	]);
	var patches = diff(ul , ul1),
		dom = ul.render();
	document.body.appendChild(dom);
	setTimeout(function () {
		patch(dom, patches);
	}, 2000);
});