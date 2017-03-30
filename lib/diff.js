import listDiff from './listDiff';
import { TEXT, REPLACE } from './patch';
import { isString } from './util';

const dfsWalk = (oleNode, newNode, index, patches) => {
    const currentPatch = [];
    if (newNode == null) {

    } else if (isString(oldNode) && isString(newNode)) {
        currentPatch.push({
            type: TEXT,
            content: newNode
        });
    } else if (
        oldNode.tagName === newNode.tagName &&
        oldNode.key === newNode.key
    ) {
        // 节点未发生变化,比较其属性以及子节点是否变化
    } else {
        // 节点类型发生了改变,不用比较直接替换
        currentPatch.push({
            type: REPLACE,
            node: newNode
        });
    }
    currentPatch.length && (patches[index] = currentPatch);
};

// 对两棵树进行对比,生成patches
// 利用patches来最小化的更改dom
const diff = (oldTree, newTree) => {

};

export default diff;
