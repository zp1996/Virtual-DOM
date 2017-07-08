var vdom = (function () {
'use strict';

var RE = /\[object\s|\]/g;
var util = {};

var setStyle = function setStyle(obj) {
    var res = '';
    for (var key in obj) {
        res += key + ': ' + obj[key] + ';';
    }
};

util.type = function (obj) {
    return Object.prototype.toString.call(obj).replace(RE, "");
};

util.each = function (arr, fn) {
    for (var i = 0, len = arr.length; i < len; i++) {
        fn(arr[i], i);
    }
};

util.each(['String', 'Array', 'Object'], function (val) {
    util['is' + val] = function (obj) {
        return util.type(obj) === val;
    };
});

util.setAttr = function (ele, attr, val) {
    switch (attr) {
        case 'style':
            ele.style.cssText = setStyle(val);
            break;
        case 'value':
            var tagName = ele.tagName;

            if (tagName === 'textarea') {
                ele.innerText = val;
            } else {
                ele.setAttribute(attr, val);
            }
            break;
        default:
            ele.setAttribute(attr, val);
    }
};

var util_1 = util;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isArray = util_1.isArray;
var setAttr = util_1.setAttr;
var each = util_1.each;

var Element = function () {
    function Element(tagName, props) {
        var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

        _classCallCheck(this, Element);

        if (isArray(props)) {
            children = props;
            props = {};
        }
        this.tagName = tagName;
        this.props = props || {};
        this.children = children;
        // 统计子节点个数,用于后面利用前序遍历进行diff生成opatches的过程
        var count = 0;
        each(children, function (child, i) {
            if (child instanceof Element) {
                count += child.count;
            } else {
                children[i] = child + '';
            }
            count++;
        });
        this.count = count;
    }

    _createClass(Element, [{
        key: 'render',
        value: function render() {
            // 利用递归将内存中的树形结构渲染到页面上
            var ele = document.createElement(this.tagName);
            // 添加节点属性
            for (var prop in this.props) {
                setAttr(ele, prop, this.props[prop]);
            }
            for (var i = 0, child; child = this.children[i++];) {
                var childEle = child instanceof Element ? child.render() : document.createTextNode(child);
                ele.appendChild(childEle);
            }
            return ele;
        }
    }]);

    return Element;
}();

// 获取需要进行比对的键的值
var getItemKey = function getItemKey(item, key) {
    if (!item || !key) return void 0;
    return typeof key === 'string' ? item[key] : key(item);
};
/*
 * 提取数组
 * keyIndex 拥有该键的元素hash,键为key对应的值,值为在数组中的索引
 * free 无该键的元素集合
*/
var makeKeyIndexAndFree = function makeKeyIndexAndFree(list, key) {
    var keyIndex = {},
        free = [];
    for (var i = 0, item; item = list[i++];) {
        var itemKey = getItemKey(item, key);
        if (itemKey) {
            keyIndex[itemKey] = i - 1;
        } else {
            free.push(item);
        }
    }
    return { keyIndex: keyIndex, free: free };
};
/*
 * 更改老的数组使其与新的数组保持一致
 * type: 0 为删除, 1 为新增
 */
var remove = function remove(index) {
    return {
        index: index,
        type: 0
    };
};
var insert = function insert(index, item) {
    return {
        index: index,
        item: item,
        type: 1
    };
};
// diff比较,只比一层
var listDiff = function listDiff(oldList, newList, key) {
    var oldMap = makeKeyIndexAndFree(oldList, key),
        newMap = makeKeyIndexAndFree(newList, key),
        newFree = newMap.free,
        oldKeyIndex = oldMap.keyIndex,
        newKeyIndex = newMap.keyIndex,
        moves = [],
        children = [];
    var freeIndex = 0,
        itemKey = void 0,
        item = void 0;
    // 遍历老的数组
    for (var _i = 0, _item; _item = oldList[_i++];) {
        itemKey = getItemKey(_item, key);
        if (itemKey) {
            if (!newKeyIndex.hasOwnProperty(itemKey)) {
                // 假如新的数组中没有,则这个元素应该被删除
                children.push(null);
            } else {
                children.push(newList[newKeyIndex[itemKey]]);
            }
        } else {
            // 假如元素没有key这个键,则把新的数组中没有这个键的元素加上去
            var freeItem = newFree[freeIndex++] || null;
            children.push(freeItem);
        }
    }
    var simulateList = children.slice(0);
    var i = 0;
    // 新的数组中不存在该元素,则删除
    while (i < simulateList.length) {
        if (simulateList[i] === null) {
            moves.push(remove(i));
            simulateList.splice(i, 1);
        } else {
            i++;
        }
    }
    var j = 0;
    var newLen = newList.length;
    for (var _i2 = 0; _i2 < newLen; _i2++) {
        item = newList[_i2];
        itemKey = getItemKey(item, key);
        var simulateItem = simulateList[j],
            simulateItemKey = getItemKey(simulateItem, key);
        if (simulateItem) {
            if (itemKey === simulateItemKey) {
                // 此处节点不需要移动
                j++;
            } else {
                if (!oldKeyIndex.hasOwnProperty(simulateItemKey)) {
                    moves.push(insert(_i2, item));
                } else {
                    var nextItemKey = getItemKey(simulateList[j + 1], key);
                    if (nextItemKey === itemKey) {
                        // 假设在老的数组中的下一个位置,则把该位置元素删除
                        moves.push(remove(_i2));
                        simulateList.splice(j++, 1);
                    } else {
                        moves.push(insert(_i2, item));
                    }
                }
            }
        } else {
            // 插入新增的元素
            moves.push(insert(_i2, item));
        }
    }
    // 删除老的数组中多余的元素
    var k = 0;
    while (k++ <= simulateList.length - 1 - j) {
        moves.push(remove(newLen));
    }
    return { moves: moves, children: children };
};

var each$2 = util_1.each;
var isString$1 = util_1.isString;
var isObject = util_1.isObject;
var setAttr$1 = util_1.setAttr;

// 根据patches数组来改变真实的dom

var REPLACE = 0;
var PROPS = 1;
var REORDER = 2;
var TEXT = 3;

var currentPatchArr = [function (node, currentPatch) {
    var childNode = currentPatch.node;
    var newNode = isString$1(childNode) ? document.createTextNode(childNode) : node.render();
    node.parentNode.replaceChild(newNode, childNode);
}, function (node, currentPatch) {
    var props = currentPatch.props;

    for (var key in props) {
        if (props[key] == null) {
            node.removeAttribute(key);
        } else {
            setAttr$1(node, key, props[key]);
        }
    }
}, function (node, currentPatch) {
    var moves = currentPatch.moves,
        nodeList = Array.prototype.slice.call(node.childNodes);

    var map = {};
    each$2(nodeList, function (node) {
        // 为了复用节点
        if (node.nodeType === 1) {
            var key = node.getAttribute('key');
            if (key) {
                map[key] = node;
            }
        }
    });
    each$2(moves, function (move) {
        var index = move.index,
            type = move.type,
            item = move.item;

        if (type === 0) {
            node.removeChild(node.childNodes[index]);
            nodeList.splice(index, 1);
        } else {
            var key = item.key;

            var insertNode = map[key] ? map[key] : isObject(item) ? item.render() : document.createTextNode(item);
            nodeList.splice(index, 0, insertNode);
            node.insertBefore(insertNode, node.childNodes[index]);
        }
    });
    map = null;
}, function (node, currentPatch) {
    node.nodeValue = currentPatch.content;
}];

var applyPatches = function applyPatches(node, currentPatches) {
    each$2(currentPatches, function (currentPatch) {
        currentPatchArr[currentPatch.type](node, currentPatch);
    });
};

// 利用DFS遍历整颗树
var dfsWalk$1 = function dfsWalk(node, walker, patches) {
    var currentPatches = patches[walker.index],
        children = node.childNodes || [];
    for (var i = 0, child; child = children[i++];) {
        walker.index++;
        dfsWalk(child, walker, patches);
    }
    if (currentPatches) {
        applyPatches(node, currentPatches);
    }
};

var patch = function patch(node, patches) {
    var walker = { index: 0 };
    dfsWalk$1(node, walker, patches);
};

var isString = util_1.isString;
var each$1 = util_1.each;

// 比较节点属性(就是比较两个对象的差异)

var diffProps = function diffProps(oldNode, newNode) {
    var propsPatches = {};
    var count = 0,
        key = void 0,
        val = void 0;
    var oldProps = oldNode.props,
        newProps = newNode.props;
    // 找出属性中变化的项
    for (key in oldProps) {
        val = oldProps[key];
        if (newProps[key] !== val) {
            count++;
            propsPatches[key] = newProps[key];
        }
    }
    // 添加新的属性
    for (key in newProps) {
        if (newProps.hasOwnProperty(key) && !oldProps.hasOwnProperty(key)) {
            count++;
            propsPatches[key] = newProps[key];
        }
    }
    return count === 0 ? null : propsPatches;
};

var diffChildren = function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
    // 根据每一个节点的key属性来进行判断,两个节点是否相等
    var diffs = listDiff(oldChildren, newChildren, 'key');
    newChildren = diffs.children;
    // 先将节点的子节点整理
    if (diffs.moves.length) {
        var reorderPatch = {
            type: REORDER,
            moves: diffs.moves
        };
        currentPatch.push(reorderPatch);
    }
    // 而后利用递归比较每一个子节点的子节点
    var leftNode = null,
        currentNodeIndex = index;
    each$1(oldChildren, function (child, i) {
        currentNodeIndex += leftNode && leftNode.count ? leftNode.count + 1 : 1;
        dfsWalk(child, newChildren[i], currentNodeIndex, patches);
        leftNode = child;
    });
};
/*
 * 利用前序遍历的方式遍历整颗树
 * diff过程先对上层进行整理,而后在对象下层节点进行比较
 * 而patches的过程正相反,先对下层节点进行中整理,而后再对上层节点进行改变
 * 返回的patch为一个对象,索引值对应的是如何更改相应节点的子节点(索引值遵循前序遍历的方式)
 */
var dfsWalk = function dfsWalk(oldNode, newNode, index, patches) {
    var currentPatch = [];
    if (newNode == null) {} else if (isString(oldNode) && isString(newNode)) {
        oldNode !== newNode && currentPatch.push({
            type: TEXT,
            content: newNode
        });
    } else if (oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
        // 节点未发生变化,比较其属性以及子节点是否变化
        var propsPatches = diffProps(oldNode, newNode);
        if (propsPatches) {
            currentPatch.push({
                type: PROPS,
                props: propsPatches
            });
        }
        diffChildren(oldNode.children, newNode.children, index, patches, currentPatch);
    } else {
        // 节点类型发生了改变,不用比较直接替换
        currentPatch.push({
            type: REPLACE,
            node: newNode
        });
    }
    currentPatch.length && (patches[index] = currentPatch);
};

/*
 * 对两棵树进行对比,生成patches
 * 利用patches来最小化的更改dom
 */
var diff = function diff(oldTree, newTree) {
    var patches = {};
    dfsWalk(oldTree, newTree, 0, patches);
    return patches;
};

var index = {
    Element: Element,
    diff: diff,
    patch: patch
};

return index;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmRvbS5qcyIsInNvdXJjZXMiOlsiLi4vbGliL3V0aWwuanMiLCIuLi9saWIvZWxlbWVudC5qcyIsIi4uL2xpYi9saXN0LWRpZmYuanMiLCIuLi9saWIvcGF0Y2guanMiLCIuLi9saWIvZGlmZi5qcyIsIi4uL2xpYi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBSRSA9IC9cXFtvYmplY3RcXHN8XFxdL2csXG4gICAgdXRpbCA9IHt9O1xuXG5jb25zdCBzZXRTdHlsZSA9IG9iaiA9PiB7XG4gICAgbGV0IHJlcyA9ICcnO1xuICAgIGZvciAobGV0IGtleSBpbiBvYmopIHtcbiAgICAgICAgcmVzICs9IGAke2tleX06ICR7b2JqW2tleV19O2BcbiAgICB9XG59O1xuXG51dGlsLnR5cGUgPSBvYmogPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikucmVwbGFjZShSRSwgXCJcIik7XG5cbnV0aWwuZWFjaCA9IChhcnIsIGZuKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBmbihhcnJbaV0sIGkpO1xuICAgIH1cbn07XG5cbnV0aWwuZWFjaChbJ1N0cmluZycsICdBcnJheScsICdPYmplY3QnXSwgKHZhbCkgPT4ge1xuICAgIHV0aWxbYGlzJHt2YWx9YF0gPSBvYmogPT4gdXRpbC50eXBlKG9iaikgPT09IHZhbDtcbn0pO1xuXG51dGlsLnNldEF0dHIgPSAoZWxlLCBhdHRyLCB2YWwpID0+IHtcbiAgICBzd2l0Y2ggKGF0dHIpIHtcbiAgICAgICAgY2FzZSAnc3R5bGUnOlxuICAgICAgICAgICAgZWxlLnN0eWxlLmNzc1RleHQgPSBzZXRTdHlsZSh2YWwpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgIGNvbnN0IHsgdGFnTmFtZSB9ID0gZWxlO1xuICAgICAgICAgICAgaWYgKHRhZ05hbWUgPT09ICd0ZXh0YXJlYScpIHtcbiAgICAgICAgICAgICAgICBlbGUuaW5uZXJUZXh0ID0gdmFsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbGUuc2V0QXR0cmlidXRlKGF0dHIsIHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGVsZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWw7XG4iLCJpbXBvcnQgdXRpbCBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCB7IGlzQXJyYXksIHNldEF0dHIsIGVhY2ggfSA9IHV0aWw7XG5cbmNsYXNzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHRhZ05hbWUsIHByb3BzLCBjaGlsZHJlbiA9IFtdKSB7XG4gICAgICAgIGlmIChpc0FycmF5KHByb3BzKSkge1xuICAgICAgICAgICAgY2hpbGRyZW4gPSBwcm9wcztcbiAgICAgICAgICAgIHByb3BzID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50YWdOYW1lID0gdGFnTmFtZTtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzIHx8IHt9O1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIC8vIOe7n+iuoeWtkOiKgueCueS4quaVsCznlKjkuo7lkI7pnaLliKnnlKjliY3luo/pgY3ljobov5vooYxkaWZm55Sf5oiQb3BhdGNoZXPnmoTov4fnqItcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZWFjaChjaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY291bnQgKz0gY2hpbGQuY291bnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldID0gY2hpbGQgKyAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvdW50ID0gY291bnQ7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8g5Yip55So6YCS5b2S5bCG5YaF5a2Y5Lit55qE5qCR5b2i57uT5p6E5riy5p+T5Yiw6aG16Z2i5LiKXG4gICAgICAgIGNvbnN0IGVsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy50YWdOYW1lKTtcbiAgICAgICAgLy8g5re75Yqg6IqC54K55bGe5oCnXG4gICAgICAgIGZvciAobGV0IHByb3AgaW4gdGhpcy5wcm9wcykge1xuICAgICAgICAgICAgc2V0QXR0cihlbGUsIHByb3AsIHRoaXMucHJvcHNbcHJvcF0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBjaGlsZDsgY2hpbGQgPSB0aGlzLmNoaWxkcmVuW2krK107KSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZEVsZSA9IChjaGlsZCBpbnN0YW5jZW9mIEVsZW1lbnQpID9cbiAgICAgICAgICAgICAgICBjaGlsZC5yZW5kZXIoKSA6XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY2hpbGQpO1xuICAgICAgICAgICAgZWxlLmFwcGVuZENoaWxkKGNoaWxkRWxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRWxlbWVudDtcbiIsIi8vIOiOt+WPlumcgOimgei/m+ihjOavlOWvueeahOmUrueahOWAvFxuY29uc3QgZ2V0SXRlbUtleSA9IChpdGVtLCBrZXkpID0+IHtcbiAgICBpZiAoIWl0ZW0gfHwgIWtleSkgcmV0dXJuIHZvaWQgMDtcbiAgICByZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3N0cmluZycgPyBpdGVtW2tleV0gOiBrZXkoaXRlbSk7XG59O1xuLypcbiAqIOaPkOWPluaVsOe7hFxuICoga2V5SW5kZXgg5oul5pyJ6K+l6ZSu55qE5YWD57SgaGFzaCzplK7kuLprZXnlr7nlupTnmoTlgLws5YC85Li65Zyo5pWw57uE5Lit55qE57Si5byVXG4gKiBmcmVlIOaXoOivpemUrueahOWFg+e0oOmbhuWQiFxuKi9cbmNvbnN0IG1ha2VLZXlJbmRleEFuZEZyZWUgPSAobGlzdCwga2V5KSA9PiB7XG4gICAgY29uc3Qga2V5SW5kZXggPSB7fSwgZnJlZSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBpdGVtOyBpdGVtID0gbGlzdFtpKytdOykge1xuICAgICAgICBjb25zdCBpdGVtS2V5ID0gZ2V0SXRlbUtleShpdGVtLCBrZXkpO1xuICAgICAgICBpZiAoaXRlbUtleSkge1xuICAgICAgICAgICAga2V5SW5kZXhbaXRlbUtleV0gPSBpIC0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyZWUucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBrZXlJbmRleCwgZnJlZSB9O1xufTtcbi8qXG4gKiDmm7TmlLnogIHnmoTmlbDnu4Tkvb/lhbbkuI7mlrDnmoTmlbDnu4Tkv53mjIHkuIDoh7RcbiAqIHR5cGU6IDAg5Li65Yig6ZmkLCAxIOS4uuaWsOWinlxuICovXG5jb25zdCByZW1vdmUgPSBpbmRleCA9PiAoe1xuICAgIGluZGV4LFxuICAgIHR5cGU6IDBcbn0pO1xuY29uc3QgaW5zZXJ0ID0gKGluZGV4LCBpdGVtKSA9PiAoe1xuICAgIGluZGV4LFxuICAgIGl0ZW0sXG4gICAgdHlwZTogMVxufSk7XG4vLyBkaWZm5q+U6L6DLOWPquavlOS4gOWxglxubW9kdWxlLmV4cG9ydHMgPSAob2xkTGlzdCwgbmV3TGlzdCwga2V5KSA9PiB7XG4gICAgY29uc3Qgb2xkTWFwID0gbWFrZUtleUluZGV4QW5kRnJlZShvbGRMaXN0LCBrZXkpLFxuICAgICAgICBuZXdNYXAgPSBtYWtlS2V5SW5kZXhBbmRGcmVlKG5ld0xpc3QsIGtleSksXG4gICAgICAgIG5ld0ZyZWUgPSBuZXdNYXAuZnJlZSxcbiAgICAgICAgb2xkS2V5SW5kZXggPSBvbGRNYXAua2V5SW5kZXgsXG4gICAgICAgIG5ld0tleUluZGV4ID0gbmV3TWFwLmtleUluZGV4LFxuICAgICAgICBtb3ZlcyA9IFtdLFxuICAgICAgICBjaGlsZHJlbiA9IFtdO1xuICAgIGxldCBmcmVlSW5kZXggPSAwLCBpdGVtS2V5LCBpdGVtO1xuICAgIC8vIOmBjeWOhuiAgeeahOaVsOe7hFxuICAgIGZvciAobGV0IGkgPSAwLCBpdGVtOyBpdGVtID0gb2xkTGlzdFtpKytdOykge1xuICAgICAgICBpdGVtS2V5ID0gZ2V0SXRlbUtleShpdGVtLCBrZXkpO1xuICAgICAgICBpZiAoaXRlbUtleSkge1xuICAgICAgICAgICAgaWYgKCFuZXdLZXlJbmRleC5oYXNPd25Qcm9wZXJ0eShpdGVtS2V5KSkge1xuICAgICAgICAgICAgICAgIC8vIOWBh+WmguaWsOeahOaVsOe7hOS4reayoeaciSzliJnov5nkuKrlhYPntKDlupTor6XooqvliKDpmaRcbiAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0W25ld0tleUluZGV4W2l0ZW1LZXldXVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDlgYflpoLlhYPntKDmsqHmnIlrZXnov5nkuKrplK4s5YiZ5oqK5paw55qE5pWw57uE5Lit5rKh5pyJ6L+Z5Liq6ZSu55qE5YWD57Sg5Yqg5LiK5Y67XG4gICAgICAgICAgICBjb25zdCBmcmVlSXRlbSA9IG5ld0ZyZWVbZnJlZUluZGV4KytdIHx8IG51bGw7XG4gICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGZyZWVJdGVtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzaW11bGF0ZUxpc3QgPSBjaGlsZHJlbi5zbGljZSgwKTtcbiAgICBsZXQgaSA9IDA7XG4gICAgLy8g5paw55qE5pWw57uE5Lit5LiN5a2Y5Zyo6K+l5YWD57SgLOWImeWIoOmZpFxuICAgIHdoaWxlIChpIDwgc2ltdWxhdGVMaXN0Lmxlbmd0aCkge1xuICAgICAgICBpZiAoc2ltdWxhdGVMaXN0W2ldID09PSBudWxsKSB7XG4gICAgICAgICAgICBtb3Zlcy5wdXNoKHJlbW92ZShpKSk7XG4gICAgICAgICAgICBzaW11bGF0ZUxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxldCBqID0gMDtcbiAgICBjb25zdCBuZXdMZW4gPSBuZXdMaXN0Lmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ld0xlbjsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBuZXdMaXN0W2ldO1xuICAgICAgICBpdGVtS2V5ID0gZ2V0SXRlbUtleShpdGVtLCBrZXkpO1xuICAgICAgICBjb25zdCBzaW11bGF0ZUl0ZW0gPSBzaW11bGF0ZUxpc3Rbal0sXG4gICAgICAgICAgICBzaW11bGF0ZUl0ZW1LZXkgPSBnZXRJdGVtS2V5KHNpbXVsYXRlSXRlbSwga2V5KTtcbiAgICAgICAgaWYgKHNpbXVsYXRlSXRlbSkge1xuICAgICAgICAgICAgaWYgKGl0ZW1LZXkgPT09IHNpbXVsYXRlSXRlbUtleSkge1xuICAgICAgICAgICAgICAgIC8vIOatpOWkhOiKgueCueS4jemcgOimgeenu+WKqFxuICAgICAgICAgICAgICAgIGorKztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvbGRLZXlJbmRleC5oYXNPd25Qcm9wZXJ0eShzaW11bGF0ZUl0ZW1LZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdmVzLnB1c2goaW5zZXJ0KGksIGl0ZW0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0SXRlbUtleSA9IGdldEl0ZW1LZXkoc2ltdWxhdGVMaXN0W2ogKyAxXSwga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRJdGVtS2V5ID09PSBpdGVtS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlgYforr7lnKjogIHnmoTmlbDnu4TkuK3nmoTkuIvkuIDkuKrkvY3nva4s5YiZ5oqK6K+l5L2N572u5YWD57Sg5Yig6ZmkXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3Zlcy5wdXNoKHJlbW92ZShpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaW11bGF0ZUxpc3Quc3BsaWNlKGorKywgMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3Zlcy5wdXNoKGluc2VydChpLCBpdGVtKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDmj5LlhaXmlrDlop7nmoTlhYPntKBcbiAgICAgICAgICAgIG1vdmVzLnB1c2goaW5zZXJ0KGksIGl0ZW0pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyDliKDpmaTogIHnmoTmlbDnu4TkuK3lpJrkvZnnmoTlhYPntKBcbiAgICBsZXQgayA9IDA7XG4gICAgd2hpbGUgKGsrKyA8PSBzaW11bGF0ZUxpc3QubGVuZ3RoIC0gMSAtIGopIHtcbiAgICAgICAgbW92ZXMucHVzaChyZW1vdmUobmV3TGVuKSk7XG4gICAgfVxuICAgIHJldHVybiB7IG1vdmVzLCBjaGlsZHJlbiB9O1xufTtcbiIsImltcG9ydCB1dGlsIGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IHsgZWFjaCwgaXNTdHJpbmcsIGlzT2JqZWN0LCBzZXRBdHRyIH0gPSB1dGlsO1xuXG4vLyDmoLnmja5wYXRjaGVz5pWw57uE5p2l5pS55Y+Y55yf5a6e55qEZG9tXG5leHBvcnQgY29uc3QgUkVQTEFDRSA9IDA7XG5leHBvcnQgY29uc3QgUFJPUFMgPSAxO1xuZXhwb3J0IGNvbnN0IFJFT1JERVIgPSAyO1xuZXhwb3J0IGNvbnN0IFRFWFQgPSAzO1xuXG5jb25zdCBlbXB0eUFyciA9IFtdO1xuXG5jb25zdCBjdXJyZW50UGF0Y2hBcnIgPSBbXG4gICAgKG5vZGUsIGN1cnJlbnRQYXRjaCkgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZE5vZGUgPSBjdXJyZW50UGF0Y2gubm9kZTtcbiAgICAgICAgY29uc3QgbmV3Tm9kZSA9IGlzU3RyaW5nKGNoaWxkTm9kZSkgP1xuICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY2hpbGROb2RlKSA6XG4gICAgICAgICAgICBub2RlLnJlbmRlcigpO1xuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIGNoaWxkTm9kZSk7XG4gICAgfSxcbiAgICAobm9kZSwgY3VycmVudFBhdGNoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgcHJvcHMgfSA9IGN1cnJlbnRQYXRjaDtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHByb3BzKSB7XG4gICAgICAgICAgICBpZiAocHJvcHNba2V5XSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0QXR0cihub2RlLCBrZXksIHByb3BzW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAobm9kZSwgY3VycmVudFBhdGNoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbW92ZXMgfSA9IGN1cnJlbnRQYXRjaCxcbiAgICAgICAgICAgIG5vZGVMaXN0ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobm9kZS5jaGlsZE5vZGVzKTtcbiAgICAgICAgbGV0IG1hcCA9IHt9O1xuICAgICAgICBlYWNoKG5vZGVMaXN0LCBub2RlID0+IHtcbiAgICAgICAgICAgIC8vIOS4uuS6huWkjeeUqOiKgueCuVxuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBub2RlLmdldEF0dHJpYnV0ZSgna2V5Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgICAgICBtYXBba2V5XSA9IG5vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZWFjaChtb3ZlcywgbW92ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGluZGV4LCB0eXBlLCBpdGVtIH0gPSBtb3ZlO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG5vZGUuY2hpbGROb2Rlc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgIG5vZGVMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsga2V5IH0gPSBpdGVtO1xuICAgICAgICAgICAgICAgIGNvbnN0IGluc2VydE5vZGUgPSBtYXBba2V5XSA/XG4gICAgICAgICAgICAgICAgICAgIG1hcFtrZXldIDpcbiAgICAgICAgICAgICAgICAgICAgaXNPYmplY3QoaXRlbSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5yZW5kZXIoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpdGVtKTtcbiAgICAgICAgICAgICAgICBub2RlTGlzdC5zcGxpY2UoaW5kZXgsIDAsIGluc2VydE5vZGUpO1xuICAgICAgICAgICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKGluc2VydE5vZGUsIG5vZGUuY2hpbGROb2Rlc1tpbmRleF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWFwID0gbnVsbDtcbiAgICB9LFxuICAgIChub2RlLCBjdXJyZW50UGF0Y2gpID0+IHtcbiAgICAgICAgbm9kZS5ub2RlVmFsdWUgPSBjdXJyZW50UGF0Y2guY29udGVudDtcbiAgICB9XG5dO1xuXG5jb25zdCBhcHBseVBhdGNoZXMgPSAobm9kZSwgY3VycmVudFBhdGNoZXMpID0+IHtcbiAgICBlYWNoKGN1cnJlbnRQYXRjaGVzLCAoY3VycmVudFBhdGNoKSA9PiB7XG4gICAgICAgIGN1cnJlbnRQYXRjaEFycltjdXJyZW50UGF0Y2gudHlwZV0obm9kZSwgY3VycmVudFBhdGNoKTtcbiAgICB9KTtcbn07XG5cbi8vIOWIqeeUqERGU+mBjeWOhuaVtOmil+agkVxuY29uc3QgZGZzV2FsayA9IChub2RlLCB3YWxrZXIsIHBhdGNoZXMpID0+IHtcbiAgICBjb25zdCBjdXJyZW50UGF0Y2hlcyA9IHBhdGNoZXNbd2Fsa2VyLmluZGV4XSxcbiAgICAgICAgY2hpbGRyZW4gPSBub2RlLmNoaWxkTm9kZXMgfHwgW107XG4gICAgZm9yIChsZXQgaSA9IDAsIGNoaWxkOyBjaGlsZCA9IGNoaWxkcmVuW2krK107KSB7XG4gICAgICAgIHdhbGtlci5pbmRleCsrO1xuICAgICAgICBkZnNXYWxrKGNoaWxkLCB3YWxrZXIsIHBhdGNoZXMpO1xuICAgIH1cbiAgICBpZiAoY3VycmVudFBhdGNoZXMpIHtcbiAgICAgICAgYXBwbHlQYXRjaGVzKG5vZGUsIGN1cnJlbnRQYXRjaGVzKTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgcGF0Y2ggPSAobm9kZSwgcGF0Y2hlcykgPT4ge1xuICAgIGNvbnN0IHdhbGtlciA9IHsgaW5kZXg6IDAgfTtcbiAgICBkZnNXYWxrKG5vZGUsIHdhbGtlciwgcGF0Y2hlcyk7XG59O1xuIiwiaW1wb3J0IGxpc3REaWZmIGZyb20gJy4vbGlzdC1kaWZmJztcbmltcG9ydCB7IFRFWFQsIFJFUExBQ0UsIFJFT1JERVIsIFBST1BTIH0gZnJvbSAnLi9wYXRjaCc7XG5pbXBvcnQgdXRpbCBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCB7IGlzU3RyaW5nLCBlYWNoIH0gPSB1dGlsO1xuXG4vLyDmr5TovoPoioLngrnlsZ7mgKco5bCx5piv5q+U6L6D5Lik5Liq5a+56LGh55qE5beu5byCKVxuY29uc3QgZGlmZlByb3BzID0gKG9sZE5vZGUsIG5ld05vZGUpID0+IHtcbiAgICBjb25zdCBwcm9wc1BhdGNoZXMgPSB7fTtcbiAgICBsZXQgY291bnQgPSAwLCBrZXksIHZhbDtcbiAgICBjb25zdCBvbGRQcm9wcyA9IG9sZE5vZGUucHJvcHMsXG4gICAgICAgIG5ld1Byb3BzID0gbmV3Tm9kZS5wcm9wcztcbiAgICAvLyDmib7lh7rlsZ7mgKfkuK3lj5jljJbnmoTpoblcbiAgICBmb3IgKGtleSBpbiBvbGRQcm9wcykge1xuICAgICAgICB2YWwgPSBvbGRQcm9wc1trZXldO1xuICAgICAgICBpZiAobmV3UHJvcHNba2V5XSAhPT0gdmFsKSB7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgcHJvcHNQYXRjaGVzW2tleV0gPSBuZXdQcm9wc1trZXldO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIOa3u+WKoOaWsOeahOWxnuaAp1xuICAgIGZvciAoa2V5IGluIG5ld1Byb3BzKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIG5ld1Byb3BzLmhhc093blByb3BlcnR5KGtleSkgJiZcbiAgICAgICAgICAgICFvbGRQcm9wcy5oYXNPd25Qcm9wZXJ0eShrZXkpXG4gICAgICAgICkge1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIHByb3BzUGF0Y2hlc1trZXldID0gbmV3UHJvcHNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY291bnQgPT09IDAgPyBudWxsIDogcHJvcHNQYXRjaGVzO1xufTtcblxuY29uc3QgZGlmZkNoaWxkcmVuID0gKG9sZENoaWxkcmVuLCBuZXdDaGlsZHJlbiwgaW5kZXgsIHBhdGNoZXMsIGN1cnJlbnRQYXRjaCkgPT4ge1xuICAgIC8vIOagueaNruavj+S4gOS4quiKgueCueeahGtleeWxnuaAp+adpei/m+ihjOWIpOaWrSzkuKTkuKroioLngrnmmK/lkKbnm7jnrYlcbiAgICBjb25zdCBkaWZmcyA9IGxpc3REaWZmKG9sZENoaWxkcmVuLCBuZXdDaGlsZHJlbiwgJ2tleScpO1xuICAgIG5ld0NoaWxkcmVuID0gZGlmZnMuY2hpbGRyZW47XG4gICAgLy8g5YWI5bCG6IqC54K555qE5a2Q6IqC54K55pW055CGXG4gICAgaWYgKGRpZmZzLm1vdmVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCByZW9yZGVyUGF0Y2ggPSB7XG4gICAgICAgICAgICB0eXBlOiBSRU9SREVSLFxuICAgICAgICAgICAgbW92ZXM6IGRpZmZzLm1vdmVzXG4gICAgICAgIH07XG4gICAgICAgIGN1cnJlbnRQYXRjaC5wdXNoKHJlb3JkZXJQYXRjaCk7XG4gICAgfVxuICAgIC8vIOiAjOWQjuWIqeeUqOmAkuW9kuavlOi+g+avj+S4gOS4quWtkOiKgueCueeahOWtkOiKgueCuVxuICAgIGxldCBsZWZ0Tm9kZSA9IG51bGwsXG4gICAgICAgIGN1cnJlbnROb2RlSW5kZXggPSBpbmRleDtcbiAgICBlYWNoKG9sZENoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgY3VycmVudE5vZGVJbmRleCArPSAobGVmdE5vZGUgJiYgbGVmdE5vZGUuY291bnQpID9cbiAgICAgICAgICAgIGxlZnROb2RlLmNvdW50ICsgMSA6IDE7XG4gICAgICAgIGRmc1dhbGsoY2hpbGQsIG5ld0NoaWxkcmVuW2ldLCBjdXJyZW50Tm9kZUluZGV4LCBwYXRjaGVzKTtcbiAgICAgICAgbGVmdE5vZGUgPSBjaGlsZDtcbiAgICB9KTtcbn07XG4vKlxuICog5Yip55So5YmN5bqP6YGN5Y6G55qE5pa55byP6YGN5Y6G5pW06aKX5qCRXG4gKiBkaWZm6L+H56iL5YWI5a+55LiK5bGC6L+b6KGM5pW055CGLOiAjOWQjuWcqOWvueixoeS4i+WxguiKgueCuei/m+ihjOavlOi+g1xuICog6ICMcGF0Y2hlc+eahOi/h+eoi+ato+ebuOWPjSzlhYjlr7nkuIvlsYLoioLngrnov5vooYzkuK3mlbTnkIYs6ICM5ZCO5YaN5a+55LiK5bGC6IqC54K56L+b6KGM5pS55Y+YXG4gKiDov5Tlm57nmoRwYXRjaOS4uuS4gOS4quWvueixoSzntKLlvJXlgLzlr7nlupTnmoTmmK/lpoLkvZXmm7TmlLnnm7jlupToioLngrnnmoTlrZDoioLngrko57Si5byV5YC86YG15b6q5YmN5bqP6YGN5Y6G55qE5pa55byPKVxuICovXG5jb25zdCBkZnNXYWxrID0gKG9sZE5vZGUsIG5ld05vZGUsIGluZGV4LCBwYXRjaGVzKSA9PiB7XG4gICAgY29uc3QgY3VycmVudFBhdGNoID0gW107XG4gICAgaWYgKG5ld05vZGUgPT0gbnVsbCkge1xuXG4gICAgfSBlbHNlIGlmIChpc1N0cmluZyhvbGROb2RlKSAmJiBpc1N0cmluZyhuZXdOb2RlKSkge1xuICAgICAgICBvbGROb2RlICE9PSBuZXdOb2RlICYmIGN1cnJlbnRQYXRjaC5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IFRFWFQsXG4gICAgICAgICAgICBjb250ZW50OiBuZXdOb2RlXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIG9sZE5vZGUudGFnTmFtZSA9PT0gbmV3Tm9kZS50YWdOYW1lICYmXG4gICAgICAgIG9sZE5vZGUua2V5ID09PSBuZXdOb2RlLmtleVxuICAgICkge1xuICAgICAgICAvLyDoioLngrnmnKrlj5HnlJ/lj5jljJYs5q+U6L6D5YW25bGe5oCn5Lul5Y+K5a2Q6IqC54K55piv5ZCm5Y+Y5YyWXG4gICAgICAgIGNvbnN0IHByb3BzUGF0Y2hlcyA9IGRpZmZQcm9wcyhvbGROb2RlLCBuZXdOb2RlKTtcbiAgICAgICAgaWYgKHByb3BzUGF0Y2hlcykge1xuICAgICAgICAgICAgY3VycmVudFBhdGNoLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFBST1BTLFxuICAgICAgICAgICAgICAgIHByb3BzOiBwcm9wc1BhdGNoZXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGRpZmZDaGlsZHJlbihcbiAgICAgICAgICAgIG9sZE5vZGUuY2hpbGRyZW4sXG4gICAgICAgICAgICBuZXdOb2RlLmNoaWxkcmVuLFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICBwYXRjaGVzLFxuICAgICAgICAgICAgY3VycmVudFBhdGNoXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8g6IqC54K557G75Z6L5Y+R55Sf5LqG5pS55Y+YLOS4jeeUqOavlOi+g+ebtOaOpeabv+aNolxuICAgICAgICBjdXJyZW50UGF0Y2gucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiBSRVBMQUNFLFxuICAgICAgICAgICAgbm9kZTogbmV3Tm9kZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY3VycmVudFBhdGNoLmxlbmd0aCAmJiAocGF0Y2hlc1tpbmRleF0gPSBjdXJyZW50UGF0Y2gpO1xufTtcblxuLypcbiAqIOWvueS4pOajteagkei/m+ihjOWvueavlCznlJ/miJBwYXRjaGVzXG4gKiDliKnnlKhwYXRjaGVz5p2l5pyA5bCP5YyW55qE5pu05pS5ZG9tXG4gKi9cbmNvbnN0IGRpZmYgPSAob2xkVHJlZSwgbmV3VHJlZSkgPT4ge1xuICAgIGNvbnN0IHBhdGNoZXMgPSB7fTtcbiAgICBkZnNXYWxrKG9sZFRyZWUsIG5ld1RyZWUsIDAsIHBhdGNoZXMpO1xuICAgIHJldHVybiBwYXRjaGVzO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZGlmZjtcbiIsImltcG9ydCBFbGVtZW50IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQgZGlmZiBmcm9tICcuL2RpZmYnO1xuaW1wb3J0IHsgcGF0Y2ggfSBmcm9tICcuL3BhdGNoJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIEVsZW1lbnQsXG4gICAgZGlmZixcbiAgICBwYXRjaFxufTtcbiJdLCJuYW1lcyI6WyJSRSIsInV0aWwiLCJzZXRTdHlsZSIsInJlcyIsImtleSIsIm9iaiIsInR5cGUiLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImNhbGwiLCJyZXBsYWNlIiwiZWFjaCIsImFyciIsImZuIiwiaSIsImxlbiIsImxlbmd0aCIsInZhbCIsInNldEF0dHIiLCJlbGUiLCJhdHRyIiwic3R5bGUiLCJjc3NUZXh0IiwidGFnTmFtZSIsImlubmVyVGV4dCIsInNldEF0dHJpYnV0ZSIsImlzQXJyYXkiLCJFbGVtZW50IiwicHJvcHMiLCJjaGlsZHJlbiIsImNvdW50IiwiY2hpbGQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJwcm9wIiwiY2hpbGRFbGUiLCJyZW5kZXIiLCJjcmVhdGVUZXh0Tm9kZSIsImFwcGVuZENoaWxkIiwiZ2V0SXRlbUtleSIsIml0ZW0iLCJtYWtlS2V5SW5kZXhBbmRGcmVlIiwibGlzdCIsImtleUluZGV4IiwiZnJlZSIsIml0ZW1LZXkiLCJwdXNoIiwicmVtb3ZlIiwiaW5zZXJ0IiwiaW5kZXgiLCJvbGRMaXN0IiwibmV3TGlzdCIsIm9sZE1hcCIsIm5ld01hcCIsIm5ld0ZyZWUiLCJvbGRLZXlJbmRleCIsIm5ld0tleUluZGV4IiwibW92ZXMiLCJmcmVlSW5kZXgiLCJoYXNPd25Qcm9wZXJ0eSIsImZyZWVJdGVtIiwic2ltdWxhdGVMaXN0Iiwic2xpY2UiLCJzcGxpY2UiLCJqIiwibmV3TGVuIiwic2ltdWxhdGVJdGVtIiwic2ltdWxhdGVJdGVtS2V5IiwibmV4dEl0ZW1LZXkiLCJrIiwiaXNTdHJpbmciLCJpc09iamVjdCIsIlJFUExBQ0UiLCJQUk9QUyIsIlJFT1JERVIiLCJURVhUIiwiY3VycmVudFBhdGNoQXJyIiwibm9kZSIsImN1cnJlbnRQYXRjaCIsImNoaWxkTm9kZSIsIm5ld05vZGUiLCJwYXJlbnROb2RlIiwicmVwbGFjZUNoaWxkIiwicmVtb3ZlQXR0cmlidXRlIiwibm9kZUxpc3QiLCJBcnJheSIsImNoaWxkTm9kZXMiLCJtYXAiLCJub2RlVHlwZSIsImdldEF0dHJpYnV0ZSIsIm1vdmUiLCJyZW1vdmVDaGlsZCIsImluc2VydE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJub2RlVmFsdWUiLCJjb250ZW50IiwiYXBwbHlQYXRjaGVzIiwiY3VycmVudFBhdGNoZXMiLCJkZnNXYWxrIiwid2Fsa2VyIiwicGF0Y2hlcyIsInBhdGNoIiwiZGlmZlByb3BzIiwib2xkTm9kZSIsInByb3BzUGF0Y2hlcyIsIm9sZFByb3BzIiwibmV3UHJvcHMiLCJkaWZmQ2hpbGRyZW4iLCJvbGRDaGlsZHJlbiIsIm5ld0NoaWxkcmVuIiwiZGlmZnMiLCJsaXN0RGlmZiIsInJlb3JkZXJQYXRjaCIsImxlZnROb2RlIiwiY3VycmVudE5vZGVJbmRleCIsImRpZmYiLCJvbGRUcmVlIiwibmV3VHJlZSJdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsSUFBTUEsS0FBSyxnQkFBWDtJQUNJQyxPQUFPLEVBRFg7O0FBR0EsSUFBTUMsV0FBVyxTQUFYQSxRQUFXLE1BQU87UUFDaEJDLE1BQU0sRUFBVjtTQUNLLElBQUlDLEdBQVQsSUFBZ0JDLEdBQWhCLEVBQXFCO2VBQ1BELEdBQVYsVUFBa0JDLElBQUlELEdBQUosQ0FBbEI7O0NBSFI7O0FBT0FILEtBQUtLLElBQUwsR0FBWTtXQUFPQyxPQUFPQyxTQUFQLENBQWlCQyxRQUFqQixDQUEwQkMsSUFBMUIsQ0FBK0JMLEdBQS9CLEVBQW9DTSxPQUFwQyxDQUE0Q1gsRUFBNUMsRUFBZ0QsRUFBaEQsQ0FBUDtDQUFaOztBQUVBQyxLQUFLVyxJQUFMLEdBQVksVUFBQ0MsR0FBRCxFQUFNQyxFQUFOLEVBQWE7U0FDaEIsSUFBSUMsSUFBSSxDQUFSLEVBQVdDLE1BQU1ILElBQUlJLE1BQTFCLEVBQWtDRixJQUFJQyxHQUF0QyxFQUEyQ0QsR0FBM0MsRUFBZ0Q7V0FDekNGLElBQUlFLENBQUosQ0FBSCxFQUFXQSxDQUFYOztDQUZSOztBQU1BZCxLQUFLVyxJQUFMLENBQVUsQ0FBQyxRQUFELEVBQVcsT0FBWCxFQUFvQixRQUFwQixDQUFWLEVBQXlDLFVBQUNNLEdBQUQsRUFBUztn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
