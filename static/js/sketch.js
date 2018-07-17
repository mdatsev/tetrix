// @ts-check
/// <reference path="../vendor/p5.d.ts" />
new p5(( /** @type {p5} */ p) => {

    class Mino {
        constructor(rotations, textures, x, y, tile_size) {
            this.rotations = rotations
            this.textures = textures
            this.x = x
            this.y = y
            this.tile_size = tile_size
            this.current_rotation = 0
        }

        render() {
            const tiles = this.rotations[this.current_rotation]
            const ts = this.tile_size;
            p.fill(255)
            for(const tile of tiles) {
                p.rect(ts * (this.x + tile[0]), ts * (this.y + tile[1]), ts, ts)
            }
        }

        rotate_cw() {
            if(++this.current_rotation > this.rotations.length - 1)
                this.current_rotation = 0
        }

        rotate_ccw() {
            if(--this.current_rotation < 0)
                this.current_rotation = this.rotations.length - 1
        }

        get_solid_tiles() {
            
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
            const srs_mino = SRS_tiles[p.random([...'LJSZTOI'])]
            this.active_mino = new Mino(srs_mino, null, Math.floor((this.width - srs_mino.length) / 2), 0, this.tile_size)
        }

        lock_mino() {
            this.fallen_minos.push(this.active_mino);
        }

        update() {
            this.time = performance.now()
            if(this.active_mino instanceof Mino) {
                if(this.time - this.last_drop_tick > 400)
                {
                    this.active_mino.y++
                    this.rotate_ccw()
                    if(this.active_mino.y > this.height - 4) {
                        this.lock_mino()
                        this.spawn_mino()
                    }
                    this.last_drop_tick = performance.now()
                }
            }
            else {
                this.spawn_mino()
            }
        }

        rotate_cw() {
            this.active_mino.rotate_cw()
        }

        rotate_ccw() {
            this.active_mino.rotate_ccw()
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