import type { AppProps } from 'next/app';
import '../styles/global.css';
import '../styles/tabs.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}