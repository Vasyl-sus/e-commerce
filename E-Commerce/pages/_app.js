import { Router } from 'next/router'
import React from 'react'
import { useDispatch } from 'react-redux'
import { PageView } from '../actions/facebookActions'
import { LOADING } from '../constants/constants'
import '../public/static/css/bootstrap.min.scss'
import '../public/static/css/global.scss'
import { wrapper } from '../store'
import App from 'next/app'

function Lux_factor({ Component, pageProps, ctx }) {
  const dispatch = useDispatch()

  React.useEffect(() => {
    const start = () => dispatch({ type: LOADING, payload: true })
    const stop = () => dispatch({ type: LOADING, payload: false })

    Router.events.on('routeChangeStart', start)
    Router.events.on('routeChangeComplete', stop)
    Router.events.on('routeChangeError', stop)

    return () => {
      Router.events.off('routeChangeStart', start)
      Router.events.off('routeChangeComplete', stop)
      Router.events.off('routeChangeError', stop)
    }
  }, [])

  return <Component {...pageProps} />
}

Lux_factor.getInitialProps = async ({ Component, ctx, pathname }) => {
  if (ctx.req) {
    PageView(ctx.req.protocol + '://' + ctx.req.get('host') + ctx.req.originalUrl);
  }

  let pageProps = {}
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx)
  }

  return { pageProps }
}

export default wrapper.withRedux(Lux_factor)
