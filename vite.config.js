import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  base: '/tinymoney/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      registerSW: true,

      manifest: {
        name: 'Tiny Money',
        short_name: 'TinyMoney',
        description: 'Shop sales and product management',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/tinymoney/',
        icons: [
          {
            src: '/tinymoney/logo_true2.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/tinymoney/logo_true2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})