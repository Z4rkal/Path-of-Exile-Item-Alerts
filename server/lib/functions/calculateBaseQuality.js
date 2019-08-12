function calculateBaseQuality(item, rawQuality) {
    try {
        if (rawQuality < 0) throw new Error(`Bad rawQuality in calculateBaseQuality: ${rawQuality} is less than 0`)

        const MODS_STRINGIFIED = JSON.stringify({ implicit: item.implicitMods, explicit: item.explicitMods, crafted: item.craftedMods });
        const QUALITY_MOD_PATTERN = /"\+[0-9]+% to Quality"/g;
        let modQuality = 0;
        rawQuality = rawQuality || 0;

        if (QUALITY_MOD_PATTERN.test(MODS_STRINGIFIED)) {
            try {
                modQuality = MODS_STRINGIFIED.match(QUALITY_MOD_PATTERN).reduce((a, el) => a + parseInt(el.match(/[0-9]+/)), 0);
            }
            catch (error) {
                console.log(error);
                console.log(QUALITY_MOD_PATTERN.exec(MODS_STRINGIFIED));
                throw new Error(`Couldn't parse quality mods :(`)
            }
        }

        if (modQuality > rawQuality) throw new Error(`Bad rawQuality in calculateBaseQuality: ${rawQuality} is less than the calculated quality from modifiers of ${modQuality}`);

        return rawQuality - modQuality;
    }
    catch (error) {
        console.log(error);
        throw new Error(`Something went wrong in the calculateBaseQuality function, presumably a bad input; only pass in valid items >:(`)
    }
}

module.exports = calculateBaseQuality;