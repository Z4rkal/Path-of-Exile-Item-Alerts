function calculatePhysDamageAt20Quality(item, missingQuality, currentQuality, physProperty) {
    try {
        if (missingQuality <= 0) throw new Error(`Bad missingQUality in calculatePhysDamageAt20Quality: ${missingQuality} <= 0`)
        const HIT_PATTERN = /([0-9]+)-([0-9]+)/;

        let physRange = physProperty && HIT_PATTERN.test(physProperty) ? HIT_PATTERN.exec(physProperty).slice(1) : null;

        if (!physRange) {
            try {
                physRange = HIT_PATTERN.exec(item.properties.find((property) => property.name === 'Physical Damage').values[0][0]).slice(1);
            }
            catch (error) {
                throw new Error(`Couldn't find a phys damage property for the item passed into calculatePhysDamageAt20Quality`);
            }
        }

        if (physRange.length !== 2)
            throw new Error(`Couldn't find a phys damage property for the item passed into calculatePhysDamageAt20Quality; physRange: ${physRange}`);

        const MODS_STRINGIFIED = JSON.stringify({ implicit: item.implicitMods, explicit: item.explicitMods, crafted: item.craftedMods });
        const PHYS_INCREASE_PATTERN = /"[0-9]+% increased Physical Damage"/g;

        let physInc = currentQuality || 0;

        if (PHYS_INCREASE_PATTERN.test(MODS_STRINGIFIED)) {
            physInc = MODS_STRINGIFIED.match(PHYS_INCREASE_PATTERN).reduce((a, el) => a + parseInt(el.match(/[0-9]+/)), 0);
        }

        if (physInc > 0) {
            let qualInc = (missingQuality + physInc) / 100;
            physInc = physInc / 100;

            physRange[0] = (physRange[0] * (1 + qualInc)) / (1 + physInc);
            physRange[1] = (physRange[1] * (1 + qualInc)) / (1 + physInc);

            return Math.round(((physRange[0] + physRange[1]) * 10) / 2) / 10;
        }
        else if (physInc === 0) {
            physRange[0] = physRange[0] * (1 + (missingQuality / 100));
            physRange[1] = physRange[1] * (1 + (missingQuality / 100));

            return Math.round((physRange[0] + physRange[1])) / 2;
        }
        else {
            console.log(`Item Mods: ${MODS_STRINGIFIED}`)
            console.log(`Missing: ${missingQuality}\nCurrent: ${currentQuality}\nPhys Inc: ${physInc}\nPhys Range: ${physRange}`);
            throw new Error(`The sum of physical damage increases was negative, bad item in clacluatePhysDamageAt20Quality`);
        }
    }
    catch (error) {
        console.log(error);
        throw new Error(`Something went wrong in the checkFor20Q function, presumably a bad input; only pass in valid items >:(`);
    }
}

module.exports = calculatePhysDamageAt20Quality;