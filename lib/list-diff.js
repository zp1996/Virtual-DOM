// 获取需要进行比对的键的值
const getItemKey = (item, key) => {
    if (!item || !key) return void 0;
    return typeof key === 'string' ? item[key] : key(item);
};
/*
 * 提取数组
 * keyIndex 拥有该键的元素hash,键为key对应的值,值为在数组中的索引
 * free 无该键的元素集合
*/
const makeKeyIndexAndFree = (list, key) => {
    const keyIndex = {}, free = [];
    for (let i = 0, item; item = list[i++];) {
        const itemKey = getItemKey(item, key);
        if (itemKey) {
            keyIndex[itemKey] = i - 1;
        } else {
            free.push(item);
        }
    }
    return { keyIndex, free };
};
/*
 * 更改老的数组使其与新的数组保持一致
 * type: 0 为删除, 1 为新增
 */
const remove = index => ({
    index,
    type: 0
});
const insert = (index, item) => ({
    index,
    item,
    type: 1
});
// diff比较,只比一层
module.exports = (oldList, newList, key) => {
    const oldMap = makeKeyIndexAndFree(oldList, key),
        newMap = makeKeyIndexAndFree(newList, key),
        newFree = newMap.free,
        oldKeyIndex = oldMap.keyIndex,
        newKeyIndex = newMap.keyIndex,
        moves = [],
        children = [];
    let freeIndex = 0, itemKey, item;
    // 遍历老的数组
    for (let i = 0, item; item = oldList[i++];) {
        itemKey = getItemKey(item, key);
        if (itemKey) {
            if (!newKeyIndex.hasOwnProperty(itemKey)) {
                // 假如新的数组中没有,则这个元素应该被删除
                children.push(null);
            } else {
                children.push(
                    newList[newKeyIndex[itemKey]]
                );
            }
        } else {
            // 假如元素没有key这个键,则把新的数组中没有这个键的元素加上去
            const freeItem = newFree[freeIndex++] || null;
            children.push(freeItem);
        }
    }
    const simulateList = children.slice(0);
    let i = 0;
    // 新的数组中不存在该元素,则删除
    while (i < simulateList.length) {
        if (simulateList[i] === null) {
            moves.push(remove(i));
            simulateList.splice(i, 1);
        } else {
            i++;
        }
    }
    let j = 0;
    const newLen = newList.length;
    for (let i = 0; i < newLen; i++) {
        item = newList[i];
        itemKey = getItemKey(item, key);
        const simulateItem = simulateList[j],
            simulateItemKey = getItemKey(simulateItem, key);
        if (simulateItem) {
            if (itemKey === simulateItemKey) {
                // 此处节点不需要移动
                j++;
            } else {
                if (!oldKeyIndex.hasOwnProperty(simulateItemKey)) {
                    moves.push(insert(i, item));
                } else {
                    const nextItemKey = getItemKey(simulateList[j + 1], key);
                    if (nextItemKey === itemKey) {
                        // 假设在老的数组中的下一个位置,则把该位置元素删除
                        moves.push(remove(i));
                        simulateList.splice(i, 1);
                        j++;
                    } else {
                        moves.push(insert(i, item));
                    }
                }
            }
        } else {
            // 插入新增的元素
            moves.push(insert(i, item));
        }
    }
    // 删除老的数组中多余的元素
    let k = 0;
    while (k++ <= simulateList.length - 1 - j) {
        moves.push(remove(newLen));
    }
    return { moves, children };
};
