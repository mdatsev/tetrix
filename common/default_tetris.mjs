import Tetris from "../common/tetris"
import fs from "fs"
let SRS = JSON.parse(fs.readFileSync('./public/data/SRS_rotations.json').toString())
let SRS_wallkick = JSON.parse(fs.readFileSync('./public/data/SRS_wallkicks.json').toString())
let SRS_tiles = {}
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
export default function tetrisMaker(event_callback) {
        return new Tetris(SRS_tiles, SRS_wallkick, event_callback)
}