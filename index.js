/* eslint-disable no-undef */
'use strict'
import './3rd-party/firebase-app.js'
import './3rd-party/firebase-database.js'
import './3rd-party/lightweight-charts.standalone.production.js'

const firebaseConfig = {
  apiKey: 'AIzaSyACS_fW9fiDEgCOZSBukKe-OBlbvlNU4rE',
  authDomain: 'bstat-9075b.firebaseapp.com',
  databaseURL: 'https://bstat-9075b-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'bstat-9075b',
  storageBucket: 'bstat-9075b.appspot.com',
  messagingSenderId: '981942669785',
  appId: '1:981942669785:web:f211e285240079348dc9c8'
}
firebase.initializeApp(firebaseConfig)

const onlineDiv = document.getElementById('online')
const adminsDiv = document.getElementById('admins')
const membersCount = document.getElementById('members-count')
const updated = document.getElementById('updated')
const topMembers = document.getElementById('top-members')
const getURL = (vkId) => vkId > 0 ? `https://vk.com/id${vkId}` : `https://vk.com/club${Math.abs(vkId)}`
const database = firebase.database()

database.ref('online').on('value', (snapshot) => {
  const online = snapshot.val()
  onlineDiv.innerHTML = ''
  for (const member of Object.keys(online)) {
    onlineDiv.innerHTML += `<div onclick="window.open('${getURL(member)}', '_blank')" class="member">
      <img src="${online[member][1]}"><br>
      ${online[member][0]}
    </div>`
  }
})
database.ref('admins').on('value', (snapshot) => {
  const admins = snapshot.val()
  adminsDiv.innerHTML = ''
  for (const member of Object.keys(admins)) {
    adminsDiv.innerHTML += `<div onclick="window.open('${getURL(member)}', '_blank')" class="member">
        <img src="${admins[member][1]}"><br>
        ${admins[member][0]}
      </div>`
  }
})
database.ref('members_count').on('value', (snapshot) => {
  membersCount.innerHTML = snapshot.val()
})
database.ref('updated').on('value', (snapshot) => {
  const date = new Date(snapshot.val() * 1000)
  updated.innerText = `${date.getHours()}:${('0' + date.getMinutes()).substr(-2)}:${('0' + date.getSeconds()).substr(-2)} \
${date.getDate()}.${('0' + (date.getMonth() + 1)).substr(-2)}.${date.getFullYear()}`
})
database.ref('members_active').on('value', (snapshot) => {
  const membersActive = snapshot.val()
  topMembers.innerHTML = ''
  const res = {}
  for (const member of Object.keys(membersActive)) {
    if (membersActive[member][2] === undefined) continue
    if (res[membersActive[member][2]] === undefined) res[membersActive[member][2]] = ''
    res[membersActive[member][2]] += `<div onclick="window.open('${getURL(member)}', '_blank')" class="top-member">
        <img src="${membersActive[member][1]}"><br>
        ${membersActive[member][0]}<br>
        <span class="messages-label">Сообщений: <span class="messages-count">${membersActive[member][2]}</span></span>
      </div>`
  }
  const labels = Object.keys(res)
    .map(x => Number(x))
    .sort((a, b) => a - b)
    .reverse()
  for (const label of labels) {
    topMembers.innerHTML += res[label]
  }
})
database.ref('online_history').once('value', (snapshot) => {
  const val = snapshot.val()
  const dataset = []
  const chartContainer = document.getElementById('chart-container')
  const timezoneOffset = (new Date()).getTimezoneOffset() * 60
  for (const timestamp of Object.keys(val)) {
    dataset.push({ value: val[timestamp] - 1, time: Number(timestamp) - timezoneOffset })
  }
  const chart = LightweightCharts.createChart(chartContainer, {
    width: 300,
    height: 300,
    timeScale: {
      timeVisible: true,
      secondsVisible: false
    }
  })
  new ResizeObserver(entries => {
    if (entries.length === 0 || entries[0].target !== chartContainer) return
    const newRect = entries[0].contentRect
    chart.applyOptions({ height: newRect.height, width: newRect.width })
    chart.timeScale().fitContent()
  }).observe(chartContainer)
  const lineSeries = chart.addLineSeries()
  lineSeries.setData(dataset)
  chart.timeScale().fitContent()
})
