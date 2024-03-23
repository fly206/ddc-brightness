const Applet = imports.ui.applet;
const Lang = imports.lang;
const Util = imports.misc.util;
const PopupMenu = imports.ui.popupMenu;
const Tooltips = imports.ui.tooltips;

const APPLET_PATH = imports.ui.appletManager.appletMeta['ddc-brightness@fly206'].path;
const logging = true;

function log(message) {
    if (logging) global.log(`[ddc-brightness@fly206]: ${message}`);
}

class DDCBrightnessApplet extends Applet.IconApplet {
    constructor(metadata, orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id);

        this.setAllowedLayout(Applet.AllowedLayout.BOTH);

        this.set_applet_icon_symbolic_name("display-brightness-high-symbolic");
        this.set_applet_tooltip('DDC Brightness');

        this.brightness = -1;

        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        this._on_get_brightness();

        this._add_menu();
    }

    _add_menu() {
        log("add menu slider");
        this.brightness_slider = new PopupMenu.PopupSliderMenuItem(this.brightness);
        this.brightness_slider.connect('value-changed', Lang.bind(this, this._on_set_brightness));
        this.menu.addMenuItem(this.brightness_slider);
    }

    _on_get_brightness() {
        log("_on_get_brightness: active");
        Util.spawn_async(["/usr/bin/ddcutil", "getvcp", "10"], Lang.bind(this, function (out) {
            this.brightness = out.match(/\d+/g)[2];
            log(out + "\n" + this.brightness);
            this.brightness_slider.setValue(this.brightness / 100);
        }));
    }

    _on_set_brightness() {
        let value = Math.round(this.brightness_slider.value * 100);
        log("_on_brightness: active");
        log("slider: " + value);
        Util.spawn_async(["/usr/bin/ddcutil", "setvcp", "10", "" + value], Lang.bind(this, this._on_get_brightness));
        log("brightness: " + this.brightness);
    }

    destroy() {
        log("ddc-brightness: destroy");
    }

    on_applet_removed_from_panel() {
        log("ddc-brightness: on_applet_removed_from_panel");
    }

    // Override
    on_applet_clicked(event) {
        this._openMenu();
    }

    _openMenu() {
        this.menu.toggle();
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new DDCBrightnessApplet(metadata, orientation, panel_height, instance_id);
}
