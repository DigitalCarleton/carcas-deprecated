//IMPORTS
const puppeteer = require('puppeteer')
const fs = require("fs")
const path = require("path")

let fetch

const folderList = []

async function generatePosterForModel(modelPath) {

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const parts = modelPath.split("/").slice(-2)
    const shortPath = parts[0]

    const localHtmlPath = path.join("https://3dviewer.sites.carleton.edu/carcas/html-files/", shortPath) 
    console.log(localHtmlPath)
    await page.goto(localHtmlPath)

    await page.waitForFunction(()=>{
        const modelViewer = document.querySelector('model-viewer')
        return modelViewer && modelViewer.modelIsVisible
    })

    const modelViewerElement = await page.$('model-viewer')
    if(modelViewerElement){
        const imageBuffer = await modelViewerElement.screenshot({ type: 'webp' })
         // Save the screenshot to a file next to the model file
        const posterPath = modelPath.replace(/\.[^/.]+$/, "") + "-poster.webp"
        fs.writeFileSync(posterPath, imageBuffer)
        console.log(`Poster saved to ${posterPath}`)
    }else{
        console.log('No model viewer element found')
    } 

    await browser.close()
}

async function showPath(folderPaths) {
    for (const folderPath of folderPaths) {
        const results = fs.readdirSync(folderPath)
        const folders = results.filter(res => fs.lstatSync(path.resolve(folderPath, res)).isDirectory())
        const innerFolderPaths = folders.map(folder => path.resolve(folderPath, folder))

        if (innerFolderPaths.length > 0) {
            await showPath(innerFolderPaths) // Await the recursive call
        }

        folderList.push(...innerFolderPaths)
    }
}

async function processFolders(folderPaths) {
    await showPath(folderPaths) //RECURSIVELY COLLECTS ALL DIRECTORIES IN FOLDERPATHS

    for (const folderPath of folderList) {
        const results = fs.readdirSync(folderPath)
        const glbFiles = results.filter(file => file.endsWith('.glb')) //RETURNS ONLY GLB FILES IN THE FOLDERS
        const finalFiles = glbFiles.filter(file => !file.includes("updated"))
        for (const glbFile of glbFiles) {
            const fullGlbPath = path.join(folderPath, glbFile);
            if (await haveNoPoster(folderPath)) {
                await generatePosterForModel(fullGlbPath) //GENERATE A POSTER WITH THIS GLB PATH
            }
        }
    }
}

async function haveNoPoster(folderPath) {
    const results = fs.readdirSync(folderPath);
    const webpFiles = results.filter(file => file.endsWith('.webp'))
    return webpFiles.length === 0;
}

(async () => {
    const folderPaths = [path.resolve(__dirname, "")]
    await processFolders(folderPaths) // PROCESSES EACH FOLDER AND GENERATES POSTERS
})()
