import Navbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

import "../styles/global.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
