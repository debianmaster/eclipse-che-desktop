const {ipcRenderer} = require('electron')
function appendToDroidOutput(msg) { getDroidOutput().value += msg; };
function setStatus(msg)           { getStatus().innerHTML = msg; };

function backgroundProcess() {
  try{
    const process = require('child_process');   // The power of Node.JS
    var ls = process.spawn('./startche.sh');

    ls.stdout.on('data', function (data) {    
      appendToDroidOutput(data+'\n');
    });

    ls.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      appendToDroidOutput(data+'\n');
    });

    ls.on('close', function (code) {
        if (code == 0){
         setStatus('child process complete.');
        }
        else{
         setStatus('child process exited with code ' + code);
        }
        ipcRenderer.send('load-page','main-page');
    });
  }
  catch(ex){
    appendToDroidOutput('execption\n');  
  }
};