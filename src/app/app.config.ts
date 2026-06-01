import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';

const AppTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{green.50}',
      100: '{green.100}',
      200: '{green.200}',
      300: '{green.300}',
      400: '{green.400}',
      500: '{green.500}',
      600: '{green.600}',
      700: '{green.700}',
      800: '{green.800}',
      900: '{green.900}',
      950: '{green.950}',
    },
  },
  components: {
    select: {
      root: {
        paddingY: '0.75rem',
      },
      dropdown: {
        color: '{primary.700}',
      },
      clearIcon: {
        color: '{primary.700}',
      },
    },
    multiSelect: {
      root: {
        paddingY: '0.75rem',
      },
    },
    autoComplete: {
      root: {
        paddingY: '0.75rem',
      },
    },
    cascadeSelect: {
      root: {
        paddingY: '0.75rem',
      },
    },
    treeSelect: {
      root: {
        paddingY: '0.75rem',
      },
    },
    button: {
      root: {
        paddingY: '0.75rem',
      },
    },
    inputText: {
      root: {
        paddingY: '0.75rem',
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    MessageService,
    providePrimeNG({
      theme: {
        preset: AppTheme,
        options: {
          darkModeSelector: '.dark',
        },
      },
    }),
  ],
};
