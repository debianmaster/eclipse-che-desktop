const electron = require('electron')
var shell = require('shelljs')
shell.config.execPath = shell.which('node')
const child_process = require('child_process');
var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function loadPage(page){
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
      shell.exit(0);
    })
}
function createWindow () {
  if (!shell.which('docker')) {
    loadPage("pages/notinstalled.html");
  }
  else {
    var container = docker.getContainer('che');
    // query API for container info
    container.inspect(function (err, data) {
      if(err!=null){
          docker.createContainer({
            Image: 'eclipse/che',
            Cmd: ['start'],
            'Volumes': {
              '/var/run/docker.sock': {},
              '/data':{}
            },
            'Hostconfig': {
              'Binds': ['/var/run/docker.sock:/var/run/docker.sock','/Users/jjonagam/che:/data']
            }
          }, function(err, container) {
            container.attach({
              stream: true,
              stdout: true,
              stderr: true,
              tty: true
            }, function(err, stream) {
              stream.pipe(process.stdout);

              container.start(function(err, data) {
                console.log("Done",err,data);
              });
            });
          });
      }
    });
    /*
    if(shell.exec('docker inspect che',{async:false}).code !== 0) {
      //loadPage("pages/runche.html");
      /*child_process.spawnSync('docker', [ 'run', '--rm', '-ti', 'hello-world' ], {
        stdio: 'inherit'
      }); 
      shell.exec("docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v $(pwd)/che:/data eclipse/che start",{async:false,stdio: 'pipe'},function(code, stdout, stderr){
          console.log('Exit code:', code);
          console.log('Program output:', stdout);
          console.log('Program stderr:', stderr);
          if(code==0)
          loadPage("index.html");
      })
      
    }
    else{
      loadPage("index.html");
    }
    */
  }
  
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
const {ipcMain} = electron;

ipcMain.on('close-main-window', function () {
    app.quit();
});