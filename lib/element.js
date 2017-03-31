import { isArray, setAttr, each } from './util';

class Element {
    constructor(tagName, props, children = []) {
        if (isArray(props)) {
            children = props;
            props = {};
        }
        this.tagName = tagName;
        this.props = props || {};
        this.children = children;
        // 统计子节点个数,用于后面利用前序遍历进行diff生成opatches的过程
        let count = 0;
        each(children, (child, i) => {
            if (child instanceof Element) {
                count += child.count;
            } else {
                children[i] = child + '';
            }
            count++;
        });
        this.count = count;
    }
    render() {
        // 利用递归将内存中的树形结构渲染到页面上
        const ele = document.createElement(this.tagName);
        // 添加节点属性
        for (let prop in this.props) {
            setAttr(ele, prop, this.props[prop]);
        }
        for (let i = 0, child; child = this.children[i++];) {
            const childEle = (child instanceof Element) ?
                child.render() :
                document.createTextNode(child);
            ele.appendChild(childEle);
        }
        return ele;
    }
}

export default Element;
