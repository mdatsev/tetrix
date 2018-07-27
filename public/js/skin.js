function equip_skin(name) {
    $.post( '/account/skin', {
        skinName: name
    }).done(() => {
        var buttons = $('div.acc-skins').find('button')
        for(let b of buttons) {
            b.disabled = false
            b.innerHTML = 'equip'
        }
        let el = document.getElementById(name)
        el.disabled = true
        el.innerHTML = 'equipped'
    })
}