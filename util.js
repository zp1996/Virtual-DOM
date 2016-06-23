define([], function () {
	var $ = {};
	$.type = function (obj) {
		return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, "");
	};
	$.each = function (arr, fn) {
		arr.forEach(function (val, i) {
			fn(val, i);
		});
	};
	$.setAttr = function (node, key, value) {
		switch (key) {
			case 'style':
				node.style.cssText = value;
				break;
			case "value":
				var tagName = node.tagName || '';
				tagName = tagName.toLowerCase();
				if (tagName === "input" || tagName === "textarea") {
					node.value = value;
				} else {
					node.setAttribute(key, value);
				}
				break;
			default:
				node.setAttribute(key, value);
				break;
		} 
	};
	$.each(["String", "Array"], function (value) {
		$["is" + value] = function (obj) {
			return $.type(obj) === value;
		}
	});
	return $;
});