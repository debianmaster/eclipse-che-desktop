// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')
var fs = require('fs')
var path = require('path')
var Writable = require('stream').Writable;
ipcRenderer.send('on-load','hello world');


var IPCStream = require('electron-ipc-stream')
var ipcs = new IPCStream('progress')
var tmpfile = '/tmp/mainfile'

document.addEventListener('DOMContentLoaded', function () {
    var ws = Writable();
    ws._write = function (chunk, enc, next) {
        document.writeln(chunk+"</br>");
        next();
    };
    ipcs.pipe(ws);
})