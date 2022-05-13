const ipcChannel = {
    // main
    get_version: 'get-version',
    close_app: 'close-app',

    // config
    get_config: 'get-config',
    set_config: 'set-config',
    set_default_config: 'set-default-config',

    // chat code
    get_chat_code: 'get-chat-code',
    set_chat_code: 'set-chat-code',
    set_default_chat_code: 'set-default-chat-code',

    // devtools
    open_devtools: 'open-devtools',
    open_index_devtools: 'open-index-devtools',

    // window
    create_window: 'create-window',
    drag_window: 'drag-window',
    mute_window: 'mute-window',
    minimize_window: 'minimize-window',
    close_window: 'close-window',

    // index
    send_index: 'send-index',
    set_always_on_top: 'set-always-on-top',
    set_click_through: 'set-click-through',
    mouse_out_check: 'mouse-out-check',

    // capture
    start_screen_translation: 'start-screen-translation'
};

exports.ipcChannel = ipcChannel;