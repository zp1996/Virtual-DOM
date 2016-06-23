define(["util"], function ($) {
	function Element (tagName, props, children) {
		if (!(this instanceof Element)) {
			return new Element(tagName, props, children);
		}
		if ($.isArray(props)) {
			children = props;
			props = {}; 
		}
		// the element's tageName
		this.tagName = tagName;
		// the element's attr, such as id,class,cssText...
		this.props = props || {};
		// the element's children
		this.children = children || [];
		// the key, the sign of the element
		this.key = props.key || void 0;   
		var count = 0;
		$.each(children, function (child, i) {
			if (child instanceof Element) {
				count += child.count;
			} else {
				children[i] = "" + child;
			}
			count++;
		});
		this.count = count;
	}
	Element.prototype.render = function () {
		var ele = document.createElement(this.tagName),
			props = this.props,
			children = this.children;
		// add attr
		for (var name in props) {
			$.setAttr(ele, name, props[name]);
		}
		// add children
		children.forEach(function (child) {
			var childEle = (child instanceof Element) ?
								child.render() : document.createTextNode(child);
			ele.appendChild(childEle);					
		});
		return ele;
	};
	return Element;
});