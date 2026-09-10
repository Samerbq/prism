
/* here ill reuse code used from my other website */

function updateTime() {
    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', { timeZone: 'Europe/Brussels' , hour12: true} )  

document.getElementById('clock').innerText = " central european time - " + timeString }


setInterval(updateTime , 1000 )
updateTime()


// ill also reuse my dark mode code !

function toggleDarkMode() {
    const btn = document.getElementById('darkModeBtn')
    if ( document.body.classList.toggle('dark-theme')) {
        btn.innerText = ' light mode '
    } else {
        btn.innerText = ' dark mode '
    }
}