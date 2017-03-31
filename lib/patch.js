import { each, isString, isObject, setAttr } from './util';
// 根据patches数组来改变真实的dom
export const REPLACE = 0;
export const PROPS = 1;
export const REORDER = 2;
export const TEXT = 3;

const emptyArr = [];

const currentPatchArr = [
    (node, currentPatch) => {
        const childNode = currentPatch.node;
        const newNode = isString(childNode) ?
            document.createTextNode(childNode) :
            node.render();
        node.parentNode.replaceChild(newNode, childNode);
    },
    (node, currentPatch) => {
        const { props } = currentPatch;
        for (let key in props) {
            if (props[key] == null) {
                node.removeAttribute(key);
            } else {
                setAttr(node, key, props[key]);
            }
        }
    },
    (node, currentPatch) => {
        const { moves } = currentPatch,
            nodeList = Array.prototype.slice.call(node.childNodes);
        let map = {};
        each(nodeList, node => {
            // 为了复用节点
            if (node.nodeType === 1) {
                const key = node.getAttribute('key');
                if (key) {
                    map[key] = node;
                }
            }
        });
        each(moves, move => {
            const { index, type, item } = move;
            if (type === 0) {
                node.removeChild(node.childNodes[index]);
                nodeList.splice(index, 1);
            } else {
                const { key } = item;
                const insertNode = map[key] ?
                    map[key] :
                    isObject(item) ?
                        item.render() :
                        document.createTextNode(item);
                nodeList.splice(index, 0, insertNode);
                node.insertBefore(insertNode, node.childNodes[index]);
            }
        });
        map = null;
    },
    (node, currentPatch) => {
        node.nodeValue = currentPatch.content;
    }
];

const applyPatches = (node, currentPatches) => {
    each(currentPatches, (currentPatch) => {
        currentPatchArr[currentPatch.type](node, currentPatch);
    });
};

// 利用DFS遍历整颗树
const dfsWalk = (node, walker, patches) => {
    const currentPatches = patches[walker.index],
        children = node.childNodes || [];
    for (let i = 0, child; child = children[i++];) {
        walker.index++;
        dfsWalk(child, walker, patches);
    }
    if (currentPatches) {
        applyPatches(node, currentPatches);
    }
};

export const patch = (node, patches) => {
    const walker = { index: 0 };
    dfsWalk(node, walker, patches);
};
