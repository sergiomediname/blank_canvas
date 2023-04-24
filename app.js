// const data = require('./src/data/includable')
const data = require('./data.json')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const Handlebars = require('handlebars')
const chokidar = require('chokidar')

const sass = require('sass')
const CleanCSS = require('clean-css')
const autoprefixer = require('autoprefixer')
const postcss = require('postcss')

const SOURCE_DIR = './src'
const DIST_DIR = './dist'

/**
 * Registrar todos los archivos parciales
 * @param {string} folderPath Ruta de archivos
 */

function registerPartials (folderPath) {
  const files = fs.readdirSync(folderPath)

  files.forEach(file => {
    const filePath = path.join(folderPath, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      // Si la ruta es un directorio, llamamos de nuevo a la función
      registerPartials(filePath)
    } else if (file.endsWith('.hbs') && file.startsWith('_')) {
      const partialName = file.slice(1, -4) // Eliminamos el "_" y ".hbs" del nombre
      const partialTemplate = fs.readFileSync(filePath, 'utf8')

      Handlebars.registerPartial(partialName, partialTemplate)
    }
  })
}

/**
 * Compilar todos los archivos .hbs, ignorando los que empiezan por "_"
 * @param {string} folderPath Ruta de archivos
 */

function compileHandlebars (folderPath) {
  registerPartials(folderPath)

  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.hbs') && !file.startsWith('_'))
  files.forEach(file => {
    console.time(`${file} compiled in`)

    const input = path.join(__dirname, SOURCE_DIR, file)

    const source = fs.readFileSync(input, 'utf8')
    const template = Handlebars.compile(source)

    const output = template(data)
    const filePath = path.join(__dirname, DIST_DIR, `./${file.replace('.hbs', '.xml')}`)

    fs.writeFileSync(filePath, output)
    console.timeEnd(`${file} compiled in`)
  })
}

/**
 * Tarea para compilar archivos SASS
 */
function compileSass () {
  // Buscar todos los archivos .scss en el directorio src/scss, ignorando los que empiezan por "_"
  const files = glob.sync('./src/**/!(_)*.{scss,sass}')

  // Iterar sobre los archivos encontrados y compilar cada uno por separado
  files.forEach(file => {
    const currentFile = path.basename(file)
    console.time(`${currentFile} compiled in`)

    const compiled = sass.compile(file)

    let css = compiled.css.toString()
    css = postcss([autoprefixer]).process(css).css

    const minified = new CleanCSS().minify(css).styles
    const fileName = path.basename(file, path.extname(file))

    const output = path.join(__dirname, DIST_DIR, 'css')
    if (!fs.existsSync(output)) {
      fs.mkdirSync(output, { recursive: true })
    }

    // Escribir el archivo sin comprimir
    const outputFile = path.join(output, `${fileName}.css`)
    fs.writeFileSync(outputFile, css)

    // Escribir el archivo comprimido
    const minifiedOutputFile = path.join(output, `${fileName}.min.css`)
    fs.writeFileSync(minifiedOutputFile, minified)

    console.timeEnd(`${currentFile} compiled in`)
  })
}

// Handlebars helpers
Handlebars.registerHelper('asset', function readFileHelper (filePath) {
  const fullPath = `./dist/${filePath}`

  if (!fs.existsSync(fullPath)) {
    const result = `Error: File ${fullPath} does not exist`
    console.error(result)
    return `/*${result}*/`
  }

  const content = fs.readFileSync(fullPath, 'utf8')
  return new Handlebars.SafeString(content)
})

Handlebars.registerHelper('variable', function (name = 'null', options) {
  const attributes = []

  const Default = {
    description: name,
    type: 'string',
    value: '',
    ...options.hash
  }

  Object.keys(Default).forEach(key => {
    const attribute = Handlebars.escapeExpression(key)
    const value = Handlebars.escapeExpression(Default[key])
    attributes.push(`${attribute}="${value}"`)
  })

  if (!(attributes.includes('type="string"'))) {
    attributes.push(`default="${Default.value}"`)
  }

  const output = `<Variable name="${name}" ${attributes.join(' ')}/>`
  return new Handlebars.SafeString(output)
})

// Escuchar cambios en los archivos y compilarlos
chokidar.watch(SOURCE_DIR, {
  ignored: [
    /(^|[/\\])\../, // Ignorar archivos ocultos y carpetas
    /node_modules/, // Ignorar la carpeta node_modules
    '!**/*.js', // Escuchar archivos .js
    '!**/*.(sa|sc)ss', // Escuchar archivos .sass, .scss
    '!**/*.cjs', // Escuchar archivos .cjs
    '!**/*.hbs' // Escuchar archivos .hbs
  ]
}).on('change', (filePath) => {
  const extension = path.extname(filePath).toLowerCase()

  switch (extension) {
    // case '.js':
    //   compileJS()
    //   break
    case '.scss':
    case '.sass':
      compileSass()
      compileHandlebars(SOURCE_DIR)
      break
    case '.hbs':
      compileHandlebars(SOURCE_DIR)
      break
    default:
      console.error(`El archivo ${extension} no es compatible con ningún compilador.`)
  }
})

console.log('Listening to your changes...')
