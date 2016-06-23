define(["util", "patch", "list-diff"], function ($, patch, listDiff) {
	function diff (oldTree, newTree) {
		var index = 0,    
			patches = {};   // element's difference
		dfsWalk(oldTree, newTree, index, patches);
		return patches;
	}
	function dfsWalk (oldNode, newNode, index, patches) {
		var currentPatch = [];
		if (newNode === null) {
			// the element has be deleted
		} else if ($.isString(oldNode) && $.isString(newNode)) {
			if (newNode !== oldNode) { 
				// the textNode is change
				currentPatch.push({type: patch.TEXT, content: newNode});
			}
		} else if (oldNode.tagName === newNode.tagName &&
							 oldNode.key === newNode.key) {  
			// the element hasn't change, just check it's attr and children
			var propsPatches = diffProps(oldNode, newNode);
			if (propsPatches) {
				currentPatch.push({type: patch.PROPS, props: propsPatches});
			}
			if (!isIgnoreChildren(newNode)) {
				diffChildren(
					oldNode.children,
					newNode.children,
					index,
					patches,
					currentPatch
				);
			}
		} else {  
			// the element has change
			currentPatch.push({type: patch.REPLACE, node: newNode});
		}
		if (currentPatch.length) {
			patches[index] = currentPatch;
		}
	}
	function diffProps (oldNode, newNode) {
		var count = 0,
			oldProps = oldNode.props,
			newProps = newNode.props,
			propsPatches = {}, 
			value, key;
		// find the changed attr
		for (key in oldProps) {
			value = oldProps[key];
			if (newProps[key] !== value) {
				count++;
				propsPatches[key] = newProps[key];
			}
		}
		// find the new attr
		for (key in newProps) {
			if (!oldProps.hasOwnProperty(key)) {
				count++;
				propsPatches[key] = newProps[key];
			}
		}
		return count === 0 ? null : propsPatches;
	}
	function isIgnoreChildren (node) {
		return node.props && node.props.hasOwnProperty("ignore");
	}
	function diffChildren (oldChildren, newChildren, index, patches, currentPatch) {
		var diffs = listDiff(oldChildren, newChildren, "key");
		newChildren = diffs.children;
		// change dimension, now first dimension is similar
		if (diffs.move.length) {
			var reorderPatch = {type: patch.REORDER, move: diffs.move};
			currentPatch.push(reorderPatch);
		}
		// compare the old child element and the new child element
		var leftNode = null,
			currentNodeIndex = index;
		$.each(oldChildren, function (child, i) {
			var newChild = newChildren[i];
			currentNodeIndex += (leftNode && leftNode.count) ? 
													leftNode.count + 1 : 1;
			dfsWalk(child, newChild, currentNodeIndex, patches);
			leftNode = child;
		});	
	}
	return diff;
});