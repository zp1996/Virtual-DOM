define(["util"], function ($) {
	var replace = 0,
		props = 1,
		reorder = 2,
		text = 3;
	function patch (node, patches) {
		var walker = {index: 0};
		// dfs to change the really dom tree
		dfsWalk(node, walker, patches);
	}
	function dfsWalk (node, walker, patches) {
		var currentPatches = patches[walker.index],
			nodes = node.childNodes,
			len = nodes ? nodes.length : 0;
		for (var i = 0; i < len; i++) {
			var child = nodes[i];
			walker.index++;
			dfsWalk(child, walker, patches); 	
		}
		if (currentPatches) {
			// change the dom
			applyPatches(node, currentPatches);
		}
	}
	function applyPatches (node, currentPatches) {
		$.each(currentPatches, function (currentPatch) {
			currentPatchObj[currentPatch.type](node, currentPatch);
		});
	}
	var currentPatchObj = [
		function (node, currentPatch) {
			var newNode = $.isString(currentPatch.node) ?
										document.createTextNode(currentPatch.node) :
										currentPatch.node.render();
			node.parentNode.replaceChild(newNode, node);
		},
		function (node, currentPatch) {
			var props = currentPatch.props;
			for (var key in props) {
				if (props[key] === void 0) {
					// remove the extra attr
					node.removeAttribute(key);
				} else {
					$.setAttr(node, key, props[key]);
				}
			}
		},
	 	function (node, currentPatch) {
			var moves = currentPatch.move,
				nodeList = Array.prototype.slice.call(node.childNodes),
				maps = {};
			$.each(nodeList, function (node) {
				if (node.nodeType === 1) {
					var key = node.getAttribute("key");
					if (key) {
						maps[key] = node;
					}
				}
			});
			$.each(moves, function (move) {
				var index = move.index;
				if (move.type === 0) {
					if (nodeList[index] === node.childNodes[index]) {
						node.removeChild(node.childNodes[index]);
					}
					nodeList.splice(index, 1);
				} else {
					var insertNode = maps[move.item.key] ? 
													 maps[move.item.key] : // reuse
													 (typeof move.item === 'object') ? 
													 move.item.render() :
													 document.createTextNode(move.item);
					nodeList.splice(index, 0, insertNode);
					node.insertBefore(insertNode, node.childNodes[index] || null);
				}
			});
		},
		function (node, currentPatch) {
			// compatible ie 8
			node.nodeValue = currentPatch.content;
		},
	];
	patch.TEXT = text;
	patch.REPLACE = replace;
	patch.PROPS = props;
	patch.REORDER = reorder;
	return patch;
});