
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


const dropzone  = document.getElementById('dropzone')
const fileInput = document.getElementById('file_input')
const filelist  = document.getElementById('filelist')
const statusEl  = document.getElementById('status')




function handleFiles(files) {
    selectedFiles   = Array.from(files)

    if ( selectedFiles.length > 0 ) {
        inputType   = selectedFiles[0].type === 'application/pdf' ? 'pdf' : 'image'
        const names = selectedFiles.map(function (file) { return file.name }).join(', ')
        statusEl.textContent = selectedFiles.length + ' file(s) ready : ' + names 
    } else {
        inputType            = null
        statusEl.textContent = ''
    }

    renderStackItems()

}



fileInput.addEventListener('change' ,  function () {
    handleFiles(fileInput.files)
})


dropzone.addEventListener('dragover' , function(e) {
    e.preventDefault()
})

dropzone.addEventListener('drop' ,    function(e) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
})


// reuse of code from my other website ( this one is from claude Ai ! ) 

// output stack menu

const CONVERSIONS = {
    image: ['pdf'],
    pdf:   ['jpg', 'png']
}

const outputStack = document.getElementById('output_stack');
const outputTrigger = document.getElementById('output_btn');
const stackItems = document.getElementById('stack_items');

function renderStackItems() {
    stackItems.innerHTML = ''

    if (!inputType) return

    CONVERSIONS[inputType].forEach(function (format) {
        const item = document.createElement('div')
        item.className = 'item'
        item.textContent = format
        item.dataset.format = format
        stackItems.appendChild(item)
    })
}

outputTrigger.addEventListener('click', function (e) {
    e.stopPropagation()
    if (!inputType) return
    outputStack.classList.toggle('open')
})

stackItems.addEventListener('click', function (e)   {
    if (!e.target.classList.contains('item')) return
    const format = e.target.dataset.format
    outputStack.classList.remove('open')
    console.log('convert to:', format)
})

document.addEventListener('click', function (e)    {
    if (!outputStack.contains(e.target)) {
        outputStack.classList.remove('open')
    }
})


// loading bar 


const loadingOverlay = document.getElementById('loading_overlay')
const loadingFill    = document.getElementByid('loading_fill')

function showLoading(){

    loadingFill.style.width = '0%'
    loadingOverlay.hidden   = false

}


function setProgress(percent) {
    loadingFill.style.width = percent + '%'

}

function hideLoading() {
    loadingOverlay.hidden = true

}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL   (blob)
    const a   = document.createElement('a')
    a.href    = url
    a.download= filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}



// image to pdf from scratch without using a lib ! . . here we go