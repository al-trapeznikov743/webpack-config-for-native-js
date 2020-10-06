const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// режим сборки (записан в свойстве NODE_ENV)
const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

const filename = ext => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`

const jsLoaders = () => {
    const loaders = [
        {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env'],
                // "разрешаем" babel использовать вещи не вошедшие в спецификацию (напр: static)
                plugins: ['@babel/plugin-proposal-class-properties']
            }
        }
    ]
    if (isDev) {
        loaders.push('eslint-loader')
    }
    return loaders
}

module.exports = {
    // указываем контекст (директория, за которой смотрит webpack)
    context: path.resolve(__dirname, 'src'),
    // режим: разработка/продакшн по дефолту
    mode: 'development',
    // укажем входные точки для приложения (может указываться объектом)
    entry: ['@babel/polyfill', './index.js'],
    // укажем точки/точку выхода
    output: {
        // в какой файл собираем js-файлы
        filename: filename('js'),
        // куда складываем
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        // какие расширения грузим по дефолту
        extensions: ['.js'],
        // добавляет элиасы для упрощения записи пути
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@core': path.resolve(__dirname, 'src/core')
        }
    },
    // добавляем оригинальные исходники для упрощения взаимодействия
    devtool: isDev ? 'source-map' : false,
    devServer: {
        port: 3000,
        hot: isDev
    },
    plugins: [
        // чистит папку dist
        new CleanWebpackPlugin(),
        new HTMLWebpackPlugin({
            // откуда берём шаблон html (чтобы закинуть его в dist)
            template: 'index.html',
            minify: {
                // удаляем комменты и пробелы в продакшн режиме (if isProd === true)
                removeComments: isProd,
                collapseWhitespace: isProd
            }
        }),
        // копирует файлы из source в нужное нам место
        new CopyPlugin({
            patterns: [{
                from: path.resolve(__dirname, 'src/favicon.ico'),
                to: path.resolve(__dirname, 'dist')
            }]
        }),
        new MiniCssExtractPlugin({
            // куда складываем собранный CSS-файл
            filename: filename('css')
        })
    ],
    module: {
        rules: [
            {
                // "разрешает" webpack работать с css-файлами и файлами препроцессоров через импорт/экспорт
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                            reloadAll: true
                        }
                    },
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            }
        ]
    }
}