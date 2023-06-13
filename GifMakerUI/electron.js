const {app, BrowserWindow} = require('electron');
const path = require('path');


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
    
    // and load the index.html of the app.
    mainWindow.loadFile('app/index.html')
    
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    
})

