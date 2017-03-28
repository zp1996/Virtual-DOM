const RE = /\[object\s|\]/g,
    util = {};

const setStyle = obj => {
    let res = '';
    for (let key in obj) {
        res += `${key}: ${obj[key]};`
    }
};

util.type = obj => Object.prototype.toString.call(obj).replace(RE, "");

util.each = (arr, fn) => {
    for (let i = 0, len = arr.length; i < len; i++) {
        fn(arr[i], i);
    }
};

util.each(['String', 'Array'], (val) => {
    util[`is${val}`] = obj => util.type(obj) === val;
});

util.setAttr = (ele, attr, val) => {
    switch (attr) {
        case 'style':
            ele.style.cssText = setStyle(val);
            break;
        case 'value':
            const { tagName } = ele;
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
