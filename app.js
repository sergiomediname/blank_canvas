import * as url from 'url'

import data from './data.js'
import fs from 'fs'
import path from 'path'
import glob from 'glob'

import Handlebars from 'handlebars'
import chokidar from 'chokidar'

import sass from 'sass'
import CleanCSS from 'clean-css'
import autoprefixer from 'autoprefixer'
import postcss from 'postcss'

import { rollup } from 'rollup'
import terser from '@rollup/plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'

import clipboard from 'clipboardy'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
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

    // Agregamos la template a portapapeles
    clipboard.writeSync(output)

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

// Task to compile Handlebars templates
const compileJS = async () => {
  try {
    const output = path.join(__dirname, DIST_DIR, 'js')
    const files = glob.sync(`${SOURCE_DIR}/**/!(_)*.js`)

    if (files.length === 0) {
      return
    }

    // Iterate over the files found and compile each one separately
    for (const file of files) {
      const bundle = await rollup({
        input: file,
        plugins: [
          nodeResolve(),
          commonjs(),
          babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env']
          })
        ]
      })

      const fileName = path.basename(file, path.extname(file))
      const outputFile = path.join(output, `${fileName}.js`)

      // Generate the output file without minifying it
      await bundle.write({
        file: outputFile,
        format: 'iife'
      })

      // Generate the output file minified
      const minifiedOutputFile = path.join(output, `${fileName}.min.js`)
      await bundle.write({
        file: minifiedOutputFile,
        format: 'iife',
        plugins: [
          terser()
        ]
      })
    }
  } catch (err) {
    console.error(err)
  }
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
    case '.js':
      compileJS()
      // compileHandlebars(SOURCE_DIR)
      break
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
