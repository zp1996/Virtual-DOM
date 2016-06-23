define([], function () {
	function diff (oldList, newList, key) {
		var oldMap = makeKeyIndexAndFree(oldList, key),
			newMap = makeKeyIndexAndFree(newList, key),
			newFree = newMap.free,  
			oldKeyIndex = oldMap.keyIndex,
			newKeyIndex = newMap.keyIndex,
			moves = [],  // need to move
			children = [],
			i = 0,
			item,
			itemKey,
			freeIndex = 0;
		while (i < oldList.length) {
			item = oldList[i];
			itemKey = getItemKey(item, key);
			if (itemKey) {
				if (!newKeyIndex.hasOwnProperty(itemKey)) {
					// the newList doesn't have the item, should remove
					children.push(null);
				} else {
					var newItemIndex = newKeyIndex[itemKey];
					children.push(newList[newItemIndex]);
				}
			} else {
				// the item doesn't have the key, so add the newList's free
				var freeItem = newFree[freeIndex++] || null;
				children.push(freeItem);
			}
			i++;
		}	
		var simulateList = children.slice(0);
		i = 0;
		while (i < simulateList.length) {
			if (simulateList[i] === null) {
				// remove the item that newList doesn't have
				remove(i);
				removeSimulate(i);
			} else {
				i++;
			}
		}
		// now simulateList is the group of the item which the A and the B both have
		var j = i = 0;
		while (i < newList.length) {
			item = newList[i];
			itemKey = getItemKey(item, key); 
			var simulateItem = simulateList[j], // itemKey is the position of item at the oldList
				simulateItemKey = getItemKey(simulateItem, key);
			if (simulateItem) {
				if (itemKey === simulateItemKey) {
					// the item at this position doesn't need change
					j++;
				} else {
					if (!oldKeyIndex.hasOwnProperty(itemKey)) {
						// the oldList doesn't have the item and insert the new item
						insert(i, item);
					} else {
						var nextItemKey = getItemKey(simulateList[j + 1], key);
						if (nextItemKey === itemKey) {
							// In the oldList, the item at the next position 
							remove(i);
							removeSimulate(j);
							j++;
						} else {
							insert(i, item);
						}
					}
				}
			} else {
				// the simulateList loop is over, so should add the
				insert(i, item);
			}
			i++;
		}
		// remove the extra part
		var len = simulateList.length - 1 - j, k = 0;
		while (k <= len) {
			remove(i);
			k++;
		}
		function remove (index) {
			var move = {index: index, type: 0};
			moves.push(move);
		}
		function insert (index, item) {
			var move = {index: index, item: item, type: 1};
			moves.push(move);
		}
		function removeSimulate (index) {
			simulateList.splice(index, 1);
		}
		return {
			move: moves,
			children: children
		};
	}
	function makeKeyIndexAndFree (list, key) {
		var keyIndex = {}, free = [];
		for (var i = 0, item; item = list[i++];) {
			var itemKey = getItemKey(item, key);
			if (itemKey) {
				keyIndex[itemKey] = i - 1;
			} else {
				free.push(item);
			}
		}
		return {
			keyIndex: keyIndex,
			free: free
		};
	}
	function getItemKey (item, key) {
		if (!item || !key) return 0;
		return typeof key === "string" ? item[key] : key(item);
	}
	return diff;
});