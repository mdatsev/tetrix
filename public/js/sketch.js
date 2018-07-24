// @ts-check
/// <reference path="../vendor/p5.d.ts" />
import Mino from "/common/mino.mjs"
import Tetris from "/common/tetris.mjs"
import KeyboardManager from "/js/keyboard_manager.js"
import TetrisRenderer from "/js/tetris_renderer.js"

let default_skin, ghost_skin

let kb_manager = new KeyboardManager()

window.addEventListener('keydown', (e)=>{
    kb_manager.keyPressed(e.keyCode)
})
window.addEventListener('keyup', (e)=>{
    kb_manager.keyReleased(e.keyCode)
})
export default function createTetris(parent){
    return new p5(( /** @type {p5} */ p) => {
        let SRS
        let SRS_tiles = {}
        let SRS_wallkick
        let tetris
        let renderer
        let paused = false
        let socket
        p.preload = () => {
            SRS = p.loadJSON('/data/SRS_rotations.json')
            SRS_wallkick = p.loadJSON('/data/SRS_wallkicks.json')
            jQuery.ajaxSetup({async:false})
            let skinPath = $.get('/account/skin').responseJSON.skinPath
            jQuery.ajaxSetup({async:true})
            default_skin = p.loadImage("/textures/" + skinPath)
            ghost_skin = p.loadImage("/textures/ghost.png")
            renderer = new TetrisRenderer(p, 10,5,default_skin,ghost_skin)
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
            tetris = new Tetris(SRS_tiles, SRS_wallkick)
            
            const canvas = p.createCanvas((tetris.width + 12) * renderer.tile_size, tetris.visible_height * renderer.tile_size)
            canvas.parent(parent)
            socket = io('/game/room')
            socket.on('sync', function (data) { 
                if(data.id == parent){ 
                    console.log("mine")  
                    tetris.deserialize(data.data)    
                }else{
                    console.log("peshos")  
                }
            });
        }
        
        p.draw = () => {
            paused = kb_manager.is_paused()
            if(!tetris.dead && !paused) {
                let inputs = kb_manager.get_inputs()
                socket.emit('inputs', {inputs:inputs,id:parent});
                // tetris.update(inputs)
                renderer.render(tetris)
                renderer.render_queue(tetris, SRS_tiles)
                renderer.render_holded(tetris)
            }else if(!paused)
            {
                alert('you die')
                tetris = new Tetris(SRS_tiles)
            }
        }
    })    
}