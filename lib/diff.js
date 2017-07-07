import listDiff from './list-diff';
import { TEXT, REPLACE, REORDER, PROPS } from './patch';
import util from './util';

const { isString, each } = util;

// 比较节点属性(就是比较两个对象的差异)
const diffProps = (oldNode, newNode) => {
    const propsPatches = {};
    let count = 0, key, val;
    const oldProps = oldNode.props,
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
        if (
            newProps.hasOwnProperty(key) &&
            !oldProps.hasOwnProperty(key)
        ) {
            count++;
            propsPatches[key] = newProps[key];
        }
    }
    return count === 0 ? null : propsPatches;
};

const diffChildren = (oldChildren, newChildren, index, patches, currentPatch) => {
    // 根据每一个节点的key属性来进行判断,两个节点是否相等
    const diffs = listDiff(oldChildren, newChildren, 'key');
    newChildren = diffs.children;
    // 先将节点的子节点整理
    if (diffs.moves.length) {
        const reorderPatch = {
            type: REORDER,
            moves: diffs.moves
        };
        currentPatch.push(reorderPatch);
    }
    // 而后利用递归比较每一个子节点的子节点
    let leftNode = null,
        currentNodeIndex = index;
    each(oldChildren, (child, i) => {
        currentNodeIndex += (leftNode && leftNode.count) ?
            leftNode.count + 1 : 1;
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
const dfsWalk = (oldNode, newNode, index, patches) => {
    const currentPatch = [];
    if (newNode == null) {

    } else if (isString(oldNode) && isString(newNode)) {
        oldNode !== newNode && currentPatch.push({
            type: TEXT,
            content: newNode
        });
    } else if (
        oldNode.tagName === newNode.tagName &&
        oldNode.key === newNode.key
    ) {
        // 节点未发生变化,比较其属性以及子节点是否变化
        const propsPatches = diffProps(oldNode, newNode);
        if (propsPatches) {
            currentPatch.push({
                type: PROPS,
                props: propsPatches
            });
        }
        diffChildren(
            oldNode.children,
            newNode.children,
            index,
            patches,
            currentPatch
        );
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
const diff = (oldTree, newTree) => {
    const patches = {};
    dfsWalk(oldTree, newTree, 0, patches);
    return patches;
};

export default diff;
