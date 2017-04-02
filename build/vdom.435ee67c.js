/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var RE = /\[object\s|\]/g,
    util = {};

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

module.exports = util;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__util__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return REPLACE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return PROPS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return REORDER; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return TEXT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return patch; });

// 根据patches数组来改变真实的dom
var REPLACE = 0;
var PROPS = 1;
var REORDER = 2;
var TEXT = 3;

var emptyArr = [];

var currentPatchArr = [function (node, currentPatch) {
    var childNode = currentPatch.node;
    var newNode = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["isString"])(childNode) ? document.createTextNode(childNode) : node.render();
    node.parentNode.replaceChild(newNode, childNode);
}, function (node, currentPatch) {
    var props = currentPatch.props;

    for (var key in props) {
        if (props[key] == null) {
            node.removeAttribute(key);
        } else {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["setAttr"])(node, key, props[key]);
        }
    }
}, function (node, currentPatch) {
    var moves = currentPatch.moves,
        nodeList = Array.prototype.slice.call(node.childNodes);

    var map = {};
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["each"])(nodeList, function (node) {
        // 为了复用节点
        if (node.nodeType === 1) {
            var key = node.getAttribute('key');
            if (key) {
                map[key] = node;
            }
        }
    });
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["each"])(moves, function (move) {
        var index = move.index,
            type = move.type,
            item = move.item;

        if (type === 0) {
            node.removeChild(node.childNodes[index]);
            nodeList.splice(index, 1);
        } else {
            var key = item.key;

            var insertNode = map[key] ? map[key] : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["isObject"])(item) ? item.render() : document.createTextNode(item);
            nodeList.splice(index, 0, insertNode);
            node.insertBefore(insertNode, node.childNodes[index]);
        }
    });
    map = null;
}, function (node, currentPatch) {
    node.nodeValue = currentPatch.content;
}];

var applyPatches = function applyPatches(node, currentPatches) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["each"])(currentPatches, function (currentPatch) {
        currentPatchArr[currentPatch.type](node, currentPatch);
    });
};

// 利用DFS遍历整颗树
var dfsWalk = function dfsWalk(node, walker, patches) {
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
    dfsWalk(node, walker, patches);
};

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__list_diff__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__list_diff___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__list_diff__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__patch__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__util__);




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
    var diffs = __WEBPACK_IMPORTED_MODULE_0__list_diff___default()(oldChildren, newChildren, 'key');
    newChildren = diffs.children;
    // 先将节点的子节点整理
    if (diffs.moves.length) {
        var reorderPatch = {
            type: __WEBPACK_IMPORTED_MODULE_1__patch__["b" /* REORDER */],
            moves: diffs.moves
        };
        currentPatch.push(reorderPatch);
    }
    // 而后利用递归比较每一个子节点的子节点
    var leftNode = null,
        currentNodeIndex = index;
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__util__["each"])(oldChildren, function (child, i) {
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
    if (newNode == null) {} else if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__util__["isString"])(oldNode) && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__util__["isString"])(newNode)) {
        oldNode !== newNode && currentPatch.push({
            type: __WEBPACK_IMPORTED_MODULE_1__patch__["c" /* TEXT */],
            content: newNode
        });
    } else if (oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
        // 节点未发生变化,比较其属性以及子节点是否变化
        var propsPatches = diffProps(oldNode, newNode);
        if (propsPatches) {
            currentPatch.push({
                type: __WEBPACK_IMPORTED_MODULE_1__patch__["d" /* PROPS */],
                props: propsPatches
            });
        }
        diffChildren(oldNode.children, newNode.children, index, patches, currentPatch);
    } else {
        // 节点类型发生了改变,不用比较直接替换
        currentPatch.push({
            type: __WEBPACK_IMPORTED_MODULE_1__patch__["e" /* REPLACE */],
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

/* harmony default export */ __webpack_exports__["a"] = (diff);

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__util__);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var Element = function () {
    function Element(tagName, props) {
        var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

        _classCallCheck(this, Element);

        if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["isArray"])(props)) {
            children = props;
            props = {};
        }
        this.tagName = tagName;
        this.props = props || {};
        this.children = children;
        // 统计子节点个数,用于后面利用前序遍历进行diff生成opatches的过程
        var count = 0;
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["each"])(children, function (child, i) {
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
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__util__["setAttr"])(ele, prop, this.props[prop]);
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

/* harmony default export */ __webpack_exports__["a"] = (Element);

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__element__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__diff__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__patch__ = __webpack_require__(1);




/* harmony default export */ __webpack_exports__["default"] = ({
    Element: __WEBPACK_IMPORTED_MODULE_0__element__["a" /* default */],
    diff: __WEBPACK_IMPORTED_MODULE_1__diff__["a" /* default */],
    patch: __WEBPACK_IMPORTED_MODULE_2__patch__["a" /* patch */]
});

/***/ }),
/* 5 */
/***/ (function(module, exports) {

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
module.exports = function (oldList, newList, key) {
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

/***/ })
/******/ ]);