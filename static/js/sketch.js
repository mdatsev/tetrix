// @ts-check
/// <reference path="../lib/p5.d.ts" />
new p5(( /** @type {p5} */ p) => {

    class Mino {
        constructor(tiles, textures, center, x, y, tile_size) {
            this.tiles = tiles
            this.textures = textures
            this.center = center
            this.x = x
            this.y = y
            this.tile_size = tile_size
        }

        render() {
            for (const tile of this.tiles) {
                const ts = this.tile_size;
                p.fill(255)
                p.rect(ts * (this.x + tile[0]), ts * (this.y + tile[1]), ts, ts)
            }
        }
    }

    class Tetris {
        constructor() {
            this.width = 10
            this.height = 22
            this.tile_size = 20
            this.active_mino = null
            this.fallen_minos = []
            this.last_drop_tick = performance.now()
        }

        render() {
            for (const mino of this.fallen_minos) {
                mino.render()
            }
            this.active_mino.render()
        }

        spawn_mino() {
            this.active_mino = new Mino(SRS_tiles[p.random([...'LJSZTOI'])][0], null, null, this.width / 2, 0, this.tile_size)
        }

        update() {
            this.time = performance.now()
            if(this.active_mino instanceof Mino) {
                if(this.time - this.last_drop_tick > 1000)
                {
                    this.active_mino.y++
                    this.last_drop_tick = performance.now()
                }
            }
            else {
                this.spawn_mino()
            }
            for (const mino of this.fallen_minos) {
                
            }
        }

    }

    let SRS
    let SRS_tiles = {}
    let tetris = new Tetris()

    p.preload = () => {
        SRS = p.loadJSON('/data/SRS.json')
    }

    p.setup = () => {
        for (const mino in SRS) {
            SRS_tiles[mino] = SRS[mino]
                .map(rotation => {
                    let tiles = []
                    for (let i = 0; i < rotation.length; i++) {
                        for (let j = 0; j < rotation[i].length; j++) {
                            if (rotation[i][j] == '#')
                                tiles.push([j, i])
                        }
                    }
                    return tiles
                })
        }
        p.createCanvas(tetris.width * tetris.tile_size, tetris.height * tetris.tile_size)
    }
    
    p.draw = () => {
        p.background(0)
        tetris.update()
        tetris.render()
    }
})