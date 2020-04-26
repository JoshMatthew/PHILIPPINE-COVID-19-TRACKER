const { remote, ipcRenderer } = require('electron')

// Just a state to store our current data. I just thought of 
// doing this because it feels kinda right than directly 
// getting the data from the main process (mp)
const state = {
  data: null
}

// some constants from the DOM that has to do with functionality
const min = document.getElementById('minBtn')
const close = document.getElementById('closeBtn')
const refresh = document.getElementById('btnRefresh')
const moreDetailsBtn = document.getElementById('moreDetails')
const back = document.getElementById('backToMain')
const mainWin = document.getElementById('mainWin')
const secondWin = document.getElementById('secondWin')

// constants of elements that are not stable, means that it changes depending
// on the data recieved from the mp
const recoveries = document.getElementById('recovered')
const current = document.getElementById('current')
const death = document.getElementById('death')
const casesToday = document.getElementById('casesToday')
const deathsToday = document.getElementById('deathsToday')
const recoveriesToday = document.getElementById('recoveriesToday')
const fatalityRate = document.getElementById('fatalityRate')
const recoveryRate = document.getElementById('recoveryRate')


// function to minimize the current window
function minimize() {
  remote.getCurrentWindow().minimize()
}

// function to terminate the program, close it in other words
function exit() {
  remote.getCurrentWindow().close()
}

// Refresh the data. Well it is not really refreshing but what I think
// this function does is it calls the get data again from the mp so that
// it gives us the new and fresh data
function refreshData() {
  ipcRenderer.send('get-data')
}


// I kinda love this funciton. What this does is, it checks wether the current
// html that is show is the main one. If not it removes the class that making 
// it visible and vise verse to the second one. If that is not clear, it is a
// function to switch windows. 
function switchWindow() {
  let isInMainWin = mainWin.classList.contains('show')

  if (isInMainWin) {
    secondWin.classList.replace('hide', 'show')
    mainWin.classList.replace('show', 'hide')
  } else {
    mainWin.classList.replace('hide', 'show')
    secondWin.classList.replace('show', 'hide')
  }
}

// gets the data immediately when this window loads
ipcRenderer.send('get-data')

// Obviousley some event listeners to do something
refresh.addEventListener('click', refreshData)
min.addEventListener('click', minimize)
close.addEventListener('click', exit)
moreDetailsBtn.addEventListener('click', switchWindow)
back.addEventListener('click', switchWindow)

// okay so this part has to do with data manipulation and setting the actual
// data to the DOM
ipcRenderer.on('data-coming', (event, payload) => {
  if (payload) {
    // sets the revieved data as the state of this file
    state.data = payload

    // sets the content of the element in the DOM
    if (state.data !== null) {
      recoveries.innerText = state.data.recoveries
      current.innerText = state.data.cases
      death.innerText = state.data.deaths
      casesToday.innerText = state.data.cases_today
      deathsToday.innerText = state.data.deaths_today
      recoveriesToday.innerText = state.data.recoveries_today
      fatalityRate.innerText = state.data.fatality_rate
      recoveryRate.innerText = state.data.recovery_rate
    }
  }
})