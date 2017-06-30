// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')
var IPCStream = require('electron-ipc-stream')
var ipcs = new IPCStream('progress')
var fs = require('fs')
var path = require('path')
var Writable = require('stream').Writable;
document.addEventListener('DOMContentLoaded', function () {
    try{
        var ws = Writable();
        ws._write = function (chunk, enc, next) {
            document.writeln(chunk+"</br>");
            if(chunk.indexOf('http://localhost:8080')>-1){
                ipcRenderer.send('load-page','main-page');
            }
            next();
        };
        ws.setDefaultEncoding('utf-8')
        ipcs.pipe(ws);
    }
    catch(ex){
        alert('exception');
        alert(ex.toString());
    }
})