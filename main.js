const electron = require('electron')
var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
const {ipcMain} = electron;
var IPCStream = require('electron-ipc-stream')
var ipcs = new IPCStream('progress')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function loadPage(page,cb){
   mainWindow = new BrowserWindow({width: 800, height: 600,frame:true})

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, page),
      protocol: 'file:',
      slashes: true
    }))
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
      app.quit()
    })
    cb();
}
function createWindow () {
    console.log(path.dirname(__dirname));
    var container = docker.getContainer('che');
    // query API for container info
    container.inspect(function (err, data) {
      if(err!=null){
          var dirpath = __dirname;
          docker.createContainer({
            Image: 'eclipse/che',
            Cmd: ['start'],
            'Volumes': {
              '/var/run/docker.sock': {},
              '/data':{}
            },
            'Hostconfig': {
              'Binds': ['/var/run/docker.sock:/var/run/docker.sock',path.dirname(__dirname)+'/che:/data']
            }
          }, function(err, container) {
            container.attach({
              stream: true,
              stdout: true,
              stderr: true,
              tty: true
            }, function(err, stream) {
              container.start(function(err, data) {
                console.log("Done",err,data);
                loadPage("index.html",function(){
                  var ipcs = new IPCStream('progress', mainWindow)
                  stream.pipe(ipcs);
                })
              });
            });
          });
      }
      else{
        loadPage("index.html",function(){
          
        })
      }
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipcMain.on('close-main-window', function () {
    app.quit();
});
