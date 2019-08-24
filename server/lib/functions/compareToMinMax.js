function compareToMinMax(value, min, max) {
    if (value === undefined) throw new Error(`No value passed to compareToMinMax`);
    if (min && value < min) return false;
    if (max && value > max) return false;
    return true;
}

module.exports = compareToMinMax;