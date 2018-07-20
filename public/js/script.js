function buyItem(id) {
    $.post( "/shop/item", {
        itemId: id
    });
}

function buySkin(id) {
    $.post( "/shop/skin", {
        itemId: id
    });
}