
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

stackItems.addEventListener('click', async function (e) {
    if (!e.target.classList.contains('item')) return

    const format = e.target.dataset.format
    outputStack.classList.remove('open')

    showLoading()

    if (inputType === 'image') {
        const pdfBlob = await convertImagesToPdf(selectedFiles, setProgress)
        downloadBlob(pdfBlob, 'converted.pdf')

    } else if (inputType === 'pdf') {
        const imageBlobs = await convertPdfToImages(selectedFiles[0], format, setProgress)
        imageBlobs.forEach(function (blob, i) {
            setTimeout(function () {
                downloadBlob(blob, 'page-' + (i + 1) + '.' + format)
            }, i * 300)
        })
    }

    setTimeout(hideLoading, 400)
})

document.addEventListener('click', function (e)    {
    if (!outputStack.contains(e.target)) {
        outputStack.classList.remove('open')
    }
})


// loading bar


const loadingOverlay = document.getElementById('loading_overlay')
const loadingFill    = document.getElementById('loading_fill')

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



function loadImageElement(file) {
    return new Promise(function (resolve) {
        const img  = new Image()
        img.onload = function() { resolve(img) }
        img.src    = URL.createObjectURL(file)
    })

}


function imageElementToJpegBytes(img) {
    const canvas  = document.createElement('canvas')
    canvas.width  = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx     = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect  (0, 0, canvas.width, canvas.height)
    ctx.drawImage (img, 0, 0)


    const dataUrl = canvas.toDataURL('image/jpeg' , 0.92)
    const base64  = dataUrl.split(',')[1]
    const binary  = atob(base64)
    const bytes   = new Uint8Array(binary.length)
    for (let i = 0 ; i < binary.length ; i++ ) {
        bytes[i] = binary.charCodeAt(i)
    }
    return { bytes: bytes , width: canvas.width , height: canvas.height }
}


function textToBytes(str) {
    const bytes = new Uint8Array(str.length)
    for (let i = 0 ; i < str.length ; i++ ) {
        bytes[i] = str.charCodeAt(i) & 0xff
    }
    return bytes
}


function concatBytes(chunks) {
    let total = 0
    chunks.forEach(function (c) {                       total += c.length })
    const result                                               = new Uint8Array(total)
    let offset = 0
    chunks.forEach(function(c) { result.set(c, offset); offset += c.length })
    return result
}



function buildPdf(images) {
    const PAGE_W = 595
    const PAGE_H = 842


    const chunks  = [textToBytes('%PDF-1.4\n')]
    let length    = chunks[0].length
    const offsets = {}


    function addObject(objNum, bodyBytes) {
        offsets[objNum] = length

        const header    = textToBytes(objNum + ' 0 obj\n')
        const footer    = textToBytes('\nendobj\n'       )
        chunks.push(header, bodyBytes, footer            )
        length += header.length + bodyBytes.length + footer.length
    }



    const catalogNum = 1
    const pagesNum   = 2
    let   nextObjNum = 3
    const pageNums   = [] , imageNums = [] , contentNums = []

    images.forEach(function() {
        imageNums  .push(nextObjNum++)
        contentNums.push(nextObjNum++)
        pageNums   .push(nextObjNum++)
    })


    images.forEach(function (img , i) {
        const scale = Math.min(PAGE_W / img.width , PAGE_H / img.height )
        const w     = img.width  * scale
        const h     = img.height * scale
        const x     = (PAGE_W - w ) / 2
        const y     = (PAGE_H - h ) / 2


        const imgDict = textToBytes(
            '<< /Type /XObject /Subtype /Image /Width ' + img.width +
            '   /Height ' + img.height +
            '   /ColorSpace /DeviceRGB /BitsPerComponent 8 ' +
            '   /Filter /DCTDecode /Length ' + img.bytes.length + ' >>\nstream\n'
        )
        const imgBody = concatBytes([imgDict, img.bytes, textToBytes('\nendstream')])
        addObject(imageNums[i], imgBody)

        const contentStr =
            'q\n' + w.toFixed(2) + ' 0 0 '      + h.toFixed(2)      + ' '             + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm\n/Im0 Do\nQ'
        const contentDict = '<< /Length ' + contentStr.length + ' >>\nstream\n' + contentStr + '\nendstream'
        addObject(contentNums[i], textToBytes(contentDict))

        const pageDict =
            '<< /Type /Page /Parent ' + pagesNum + ' 0 R /MediaBox [0 0 ' + PAGE_W + ' ' + PAGE_H + ']' + ' /Resources << /XObject << /Im0 ' + imageNums[i] + ' 0 R >> >> ' + ' /Contents ' + contentNums[i] + ' 0 R  >> '
        addObject(pageNums[i], textToBytes(pageDict))

    })


    const kids = pageNums.map(function (n) { return n + ' 0 R' }).join(' ')
    addObject(pagesNum, textToBytes('<< /Type /Pages /Kids [' + kids + '] /Count ' + pageNums.length + ' >>'))
    addObject(catalogNum, textToBytes('<< /Type /Catalog /Pages ' + pagesNum + ' 0 R >>'))


    const maxNum     = nextObjNum - 1
    const xrefOffset = length
    let   xref       = 'xref\n0 ' + (maxNum + 1 ) + '\n0000000000 65535 f \n'
    for   (let n     = 1 ; n <= maxNum; n++ ) {
          xref       += String(offsets[n]).padStart(10, '0') + ' 00000 n \n'
    }



    chunks.push(textToBytes(xref))

    const trailer = 'trailer\n<< /Size ' + (maxNum + 1) + ' /Root ' + catalogNum + ' 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF'
    chunks.push(textToBytes(trailer))


    return concatBytes(chunks)
}


async function convertImagesToPdf(files, onProgress) {
    const images = []

    for ( let i = 0 ; i < files.length ; i ++ ){
        const img = await loadImageElement(files[i])
        images.push(imageElementToJpegBytes(img))
        onProgress(((i + 1) / files.length ) * 90)
    }

    const pdfBytes = buildPdf(images)
    onProgress(100)
    return new Blob([pdfBytes] , { type: 'application/pdf'})
}


// pdf.js library / claude ai 

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

async function convertPdfToImages(file, format, onProgress) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const blobs       = []

    for (let pageNum = 1 ; pageNum <= pdf.numPages ; pageNum++) {
        const page     = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2 })

        const canvas  = document.createElement('canvas')
        canvas.width  = viewport.width
        canvas.height = viewport.height
        const ctx     = canvas.getContext('2d')

        await page.render({ canvasContext: ctx , viewport: viewport }).promise

        const mime = format === 'png' ? 'image/png' : 'image/jpeg'
        const blob = await new Promise(function (resolve) {
            canvas.toBlob(resolve, mime, 0.92)
        })
        blobs.push(blob)

        onProgress((pageNum / pdf.numPages) * 100)
    }

    return blobs
}





