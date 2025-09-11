import Head from 'next/head';
import '../styles/globals.css'; // adapte/retire si besoin

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>mwunh</title>
        <meta name="theme-color" content="#000000" />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="https://images.icon-icons.com/4046/PNG/512/youtube_logo_icon_256969.png"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
