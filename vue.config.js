const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
    publicPath : './',
    pluginOptions:{
        electronBuilder:{
            nodeIntegration:true
        }
    }
})
