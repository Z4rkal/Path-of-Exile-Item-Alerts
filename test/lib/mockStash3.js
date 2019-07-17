//Second update of mock data, adds a Voidfletcher to the first stash and removes one from the second stash.
module.exports = {
    "next_change_id": "mock-4",
    "stashes": [
        {
            "id": "7fb974548120fc1c87316e633167eeece5746e28833c6fe3968dc40d349bb15e",
            "public": true,
            "accountName": "OwO_Master",
            "lastCharacterName": "Master_of_OwOs",
            "stash": "testStash1",
            "stashType": "PremiumStash",
            "league": "Legion",
            "items":
                [{
                    "verified": false,
                    "w": 2, "h": 3,
                    "ilvl": 86,
                    "icon": "https:\/\/web.poecdn.com\/image\/Art\/2DItems\/Quivers\/EldarQuiver.png?scale=1&w=2&h=3&v=16fa253f909d0a6ebbd47aeeed36557c",
                    "league": "Legion",
                    "id": "c8895eb54aa00e5d278583b2e0916bb5902903b7f5946f23ef6e19dea1043f08",
                    "elder": true,
                    "name": "Voidfletcher",
                    "typeLine": "Penetrating Arrow Quiver",
                    "identified": true,
                    "note": "~price 25 chaos",
                    "requirements": [{
                        "name": "Level",
                        "values": [["64", 0]], "displayMode": 0
                    }],
                    "implicitMods": ["Arrows Pierce an additional Target"],
                    "explicitMods":
                        [
                            "Consumes a Void Charge to Trigger Level 20 Void Shot when you fire Arrows",
                            "Adds 30 to 87 Cold Damage to Attacks",
                            "+106 to maximum Energy Shield",
                            "+23% to Cold Resistance",
                            "+39 Mana gained on Kill",
                            "30% increased Projectile Speed",
                            "5 Maximum Void Charges",
                            "Gain a Void Charge every 0.5 seconds"
                        ],
                    "flavourText": ["Even emptiness may be harnessed."],
                    "frameType": 3,
                    "category": { "armour": ["quiver"] },
                    "x": 9, "y": 8,
                    "inventoryId": "Stash9"
                },
                {
                    "verified": false,
                    "w": 2, "h": 3,
                    "ilvl": 86,
                    "icon": "https:\/\/web.poecdn.com\/image\/Art\/2DItems\/Quivers\/EldarQuiver.png?scale=1&w=2&h=3&v=16fa253f909d0a6ebbd47aeeed36557c",
                    "league": "Legion",
                    "id": "c8895eb54aa00e5d278583b2e0916bb5902903b7f5946f23ef6e19dea104346e",
                    "elder": true,
                    "corrupted": true,
                    "name": "Voidfletcher",
                    "typeLine": "Penetrating Arrow Quiver",
                    "identified": true,
                    "note": "~price 1 exa",
                    "requirements": [{
                        "name": "Level",
                        "values": [["64", 0]], "displayMode": 0
                    }],
                    "implicitMods": ["Adds 16 to 30 Cold Damage to Bow Attacks"],
                    "explicitMods":
                        [
                            "Consumes a Void Charge to Trigger Level 20 Void Shot when you fire Arrows",
                            "Adds 36 to 97 Cold Damage to Attacks",
                            "+98 to maximum Energy Shield",
                            "+25% to Cold Resistance",
                            "+32 Mana gained on Kill",
                            "30% increased Projectile Speed",
                            "5 Maximum Void Charges",
                            "Gain a Void Charge every 0.5 seconds"
                        ],
                    "flavourText": ["Even emptiness may be harnessed."],
                    "frameType": 3,
                    "category": { "armour": ["quiver"] },
                    "x": 1, "y": 8,
                    "inventoryId": "Stash9"
                }]
        },
        {
            "id": "9fc47fcc8556028d46eb329724577b2773c92c85ff5847a2a1806af7db01646e",
            "public": true,
            "accountName": "UwU_Master",
            "lastCharacterName": "Master_of_UwUs",
            "stash": "testStash2", "stashType": "PremiumStash",
            "league": "Legion",
            "items":[]
        }]
};