function extractModValue(modifier) {
    const values = modifier.match(/[0-9]+/g);
    if (values.length === 0)
        return 0;

    return values.reduce((pre, cur, index) => {
        pre += parseInt(cur);

        if (index === values.length - 1 && index > 0)
            pre = Math.round(pre / values.length);

        return pre;
    }, 0);
}

module.exports = extractModValue;