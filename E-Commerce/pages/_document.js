import Document, { Html, Head, Main, NextScript } from 'next/document'
var config = require('../config/environment/index');
var pageLang;

export default class MyDocument extends Document {
  static async getInitialProps(data) {
    let pageProps = {}
    if (data.query && data.query.locale) {
      pageProps = data.query.locale
    }

    const initialProps = await Document.getInitialProps(data);
    return { ...initialProps, pageProps }
  }

  render () {
    const { pageProps } = this.props

    if (this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.initialProps.pageProps && this.props.__NEXT_DATA__.props.initialProps.pageProps.language && this.props.__NEXT_DATA__.props.initialProps.pageProps.language.language) {
      pageLang = this.props.__NEXT_DATA__.props.initialProps.pageProps.language.language;
    }
    return (
      <Html lang={`${pageLang && pageLang.toLowerCase()}`}>
        <Head>
        <style dangerouslySetInnerHTML={{
          __html: `.async-hide { opacity: 0 !important}`,
        }}></style>
        <script>
        window.dataLayer = window.dataLayer || [];
        </script>
        <script dangerouslySetInnerHTML={{
          __html: `(function(a,s,y,n,c,h,i,d,e){s.className+=' '+y;h.start=1*new Date;
        h.end=i=function(){s.className=s.className.replace(RegExp(' ?'+y),'')};
        (a[n]=a[n]||[]).hide=h;setTimeout(function(){i();h.end=null},c);h.timeout=c;
        })(window,document.documentElement,'async-hide','dataLayer',4000,
        {'${config.tagManager.id}':true});`,
      }}></script>
          <script dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${config.tagManager.id}');`,
          }}></script>
          <script id="mcjs" dangerouslySetInnerHTML={{
            __html: `!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/d2c72e91601fe27ffd5e7e56e/69091d1f2d6eefd489422ed72.js");`}}></script>
        </Head>
        <body className={`${pageLang && pageLang.toLowerCase()}`}>
          <script src="https://www.google.com/recaptcha/api.js" async defer></script>
          <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${config.tagManager.id}`}
            height="0" width="0" style={{display:'none', visibility: 'hidden'}}></iframe></noscript>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.7/es5-shim.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.34.2/es6-shim.min.js"></script>
          <script src="/static/js/jquery.min.js"></script>
		      <script src="/static/js/flipclock.min.js"></script>
          <Main {...pageProps} />
          <NextScript />
        </body>
      </Html>
    )
  }
}
