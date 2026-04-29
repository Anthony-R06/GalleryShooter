"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 600,
    height: 700,
    scene: [GalleryShooter] //put scnene class name here
}

const game = new Phaser.Game(config);