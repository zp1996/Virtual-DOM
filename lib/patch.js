import { each } from './util';
// 根据patches数组来改变真实的dom
const REPLACE = 0,
    PROPS = 1,
    REORDER = 2,
    TEXT = 3,
    emptyArr = [];

const currentPatchArr = [
    (node, currentPatch) => {
        
    }
];

const applyPatches = (node, currentPatches) => {
    each(currentPatches, (currentPatch) => {
        currentPatchObj[currentPatch.type](node, currentPatch);
    });
};

// 利用DFS遍历整颗树
const dfsWalk = (node, walker, patches) => {
    const currentPatch = patches[walker.index],
        children = node.childNodes || [];
    for (let i = 0, child; child = children[i++];) {
        walker.index++;
        dfsWalk(child, walker, patches);
    }
};

const patch = (node, patches) => {
    const walker = { index: 0 };
    dfsWalk(node, walker, patches);
};

patch.REPLACE = REPLACE;
patch.PROPS = PROPS;
patch.REORDER = REORDER;
patch.TEXT = TEXT;

export default patch;
