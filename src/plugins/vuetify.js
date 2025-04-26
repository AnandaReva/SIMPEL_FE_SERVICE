/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#346285',   // Biru agak tua
          secondary: '#fbcfe8', // Pink pastel
          base: '#badefa',      // Biru muda pastel (dasar)
          accent: '#fcd34d',    // Kuning pastel (aksen)
          error: '#dc143b',     // Merah lembut
          info: '#60a5fa',      // Biru terang
          success: '#34d399',   // Hijau pastel
          warning: '#facc15',   // Kuning cerah
        },
        variables: {
          'font-family': 'Inter, Roboto, sans-serif',
          'font-size-root': '16px',
          'heading-font-weight': '700',
          'body-font-weight': '400',
          'subtitle-font-size': '1.25rem',
          'title-font-size': '2rem',
          'paragraph-font-size': '1rem',
        },
      },
    },
  },
  defaults: {
    global: {
      style: {
        fontFamily: 'Inter, Roboto, sans-serif',
        fontSize: '16px',
      },
    },
    VTextField: {
      density: 'comfortable',
      variant: 'outlined',
    },
    VBtn: {
      color: 'primary',
      variant: 'flat',
      rounded: 'lg',
    },
    VCard: {
      elevation: 2,
      rounded: 'xl',
    },
    VTypography: {
      style: {
        fontFamily: 'Inter, Roboto, sans-serif',
      },
    },
  },
})

