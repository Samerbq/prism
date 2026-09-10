
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



// file selection 

let selectedFiles = []
let inputType     = null


const dropzone  = document.getElementById('dropzone  ')
const fileInput = document.getElementById('file_input')
const filelist  = document.getElementById('filelist  ')
const statusEl  = document.getElementById('status    ')




function handleFIles(files) {
    selectedFiles       = Array.from(files)
    filelist.innterHTML = ''


    selectedFiles.forEach(function (file) {
        const li       = document.createElement('li')
        li.textContent = file.name
        filelist.appendChild(li)
    })


    if ( selectedFiles.length > 0 ) {
        inputType            = selectedFomes[0].type === 'application/pdf' ? 'pdf' : 'image'
        statusEl.textContent = selectedFiles.length + ' file(s) ready '
    } else {
        inputType = null
        statusEl.textContent = ''
    }
}



fileInput.addEventListener('change' , function () {
    handleFiles(fileInput.files)
})


dropzone.addEventListener('dragover' , function(e) {
    e.preventDefault()
})

dropzone.addEventListener('drop' , function(e) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
})


