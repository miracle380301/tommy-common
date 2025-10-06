import type { Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from './mocks/handlers'
import '../packages/common/frontend/styles/variables.css';

// MSW 초기화
initialize({
  onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 통과
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    docs: {
      source: {
        type: 'code',
        language: 'tsx',
        format: true,
      },
    },
    msw: {
      handlers: handlers, // 전역 mock handlers
    },
    options: {
      storySort: {
        order: [
          'Common',
          [
            'Level1',
            'Level2',
          ],
        ],
      },
    },
  },
  loaders: [mswLoader], // MSW loader 추가
};

export default preview;