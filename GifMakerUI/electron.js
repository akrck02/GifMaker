const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

//remove menu bar
app.on('browser-window-created',function(e,window) {
    window.setMenu(null);
});

app.whenReady().then(() => {

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })


    mainWindow.setMinimumSize(1200, 720)
    
    // and load the index.html of the app.
    mainWindow.loadFile('app/index.html')
    
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    
})



require('./api.js')
