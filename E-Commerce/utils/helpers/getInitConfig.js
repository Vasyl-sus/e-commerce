import axios from 'axios'

export const getInitConfig = async ({ context, link }) => {
  const { asPath: url, query, pathname } = context

  const route = pathname.slice(1)

  const res = await axios.post(link, {
    url,
  })
  return {
    ...res.data.data,
    page_route: route,
    query: query.query,
    locale: context.query.locale,
  }
}
