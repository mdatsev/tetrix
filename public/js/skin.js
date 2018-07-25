function equipSkin(name) {
    $.post( "/account/skin", {
      skinName: name
    }).done((data) => {
      var buttons = $("div.acc-skins").find("button")
      for(b of buttons) {
        b.disabled = false;
        b.innerHTML = "equip"
      }
      let el = document.getElementById(name)
      el.disabled = true;
      el.innerHTML = "equipped"
    });
  }