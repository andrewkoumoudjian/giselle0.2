// theme.js
import { extendTheme } from '@chakra-ui/react'

// This is a minimal theme configuration
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      }
    }
  }
})

export default theme
