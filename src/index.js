const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const fetch = require('electron-fetch').default
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// This is the function that's gonna be called to set the main
// window of the application.
function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 300,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  Menu.setApplicationMenu(null)
  // win.webContents.openDevTools()
  win.loadFile(path.join(__dirname, 'index.html'));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.


// call the create window function when the app is ready
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// shows the error if server cannot be reached
function showError() {
  dialog.showErrorBox('Server cannot be reached!', 'Please check your internet connection and try again.')
  app.quit()
}

// Fetches the needed data for the app using this wonderful open-source API
// made by Robert Soriano (I'll leave a link in the documentation, so you can check him out (He's awesome))
function fetchData(event) {
  fetch('https://coronavirus-ph-api.herokuapp.com/total')
    .then(data => data.json())
    .then(d => {
      const data = {
        cases: d.data.cases,
        deaths: d.data.deaths,
        recoveries: d.data.recoveries,
        cases_today: d.data.cases_today,
        deaths_today: d.data.deaths_today,
        recoveries_today: d.data.recoveries_today,
        fatality_rate: d.data.fatality_rate,
        recovery_rate: d.data.recovery_rate
      }

      // Sends the data to the front-end or what we call the renderer process in
      // electron vocab
      event.sender.send('data-coming', data)
    })
    .catch(err => showError)
}

// call the fetchData func when the app is ready
app.on('ready', () => {
  fetchData()
})

// Just hang in here to wait for incoming data request so we can send the rp (renderer process)
// an updated data
ipcMain.on('get-data', (event, payload) => {
  fetchData(event)
})