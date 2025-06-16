var config = require('../config/environment')

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const sesClient = new SESClient({
  region: 'eu-central-1',
  credentials: {
    accessKeyId: config.amazonSes.key,
    secretAccessKey: config.amazonSes.secret,
  },
});


var logger = require('./logger')
const format = require('date-fns/format')

var mailing = function () {}

const getCurrentTime = formatTime => format(new Date(), formatTime)

var images = {
  logo: 'https://E-Commerce.com/static/images/logo.png',
  order_slika: 'https://E-Commerce.com/static/images/mail1.jpg',
  white_arrow: 'https://E-Commerce.com/static/images/arrow-white.png',
  payment_icon: 'https://E-Commerce.com/static/images/payment.png',
  support_icon: 'https://E-Commerce.com/static/images/support.png',
  warranty_icon: 'https://E-Commerce.com/static/images/warranty.png',
  fb: 'https://E-Commerce.com/static/images/fb.png',
  ig: 'https://E-Commerce.com/static/images/ig.png',
}
var info = {
  fb_link: 'https://facebook.com/E-Commerce',
  ig_link: 'https://instagram.com/E-Commerce',
}

mailing.prototype.sendAskUsMail = function (data) {
  var html = `<html>
    <body>
    ${data.name}<br/>
    ${data.email}<br/>
    ${data.content}<br/>
    </body>
  </html>`

  sendMail1(
    'info@lux-cosmetics.com',
    'Lux Cosmetics - ask us',
    'text',
    html,
    {},
    data,
  )
}

mailing.prototype.createNewOrder = function (
  data,
  textData,
  status,
  item_id = null,
) {
  var lang = textData[0].data
  var invoice = data
  var DDV = invoice.country_ddv
  var without_ddv = invoice.subtotal
  var ddv_total = invoice.total
  var all_ddv = invoice.total
  var shipping_ddv = invoice.shipping_fee
  var discount_ddv = invoice.discount
  var additional_discount_ddv = 0
  if (invoice.additional_discount_id) {
    additional_discount_ddv = invoice.additional_discount
  }

  data.subtotal = parseFloat(data.subtotal).toFixed(2)
  data.discount = parseFloat(data.discount).toFixed(2)
  data.shipping_fee = parseFloat(data.shipping_fee).toFixed(2)
  data.total = parseFloat(data.total).toFixed(2)

  var order_status = ''
  var title = ''
  var bottom_txt = ''
  order_status = lang.div_top_status21.value
  bottom_txt = lang.order_bottom_p_11.value
  title = `${lang.mail_title1.value} [#${data.order_id2}]`
  if (data.shipping_country == 'SI') data.shipping_country = 'SLOVENIJA'
  if (data.shipping_country == 'SK') data.shipping_country = 'SLOVENSKO'
  if (data.shipping_country == 'HU') data.shipping_country = 'MAGYARORSZÁG'
  if (data.shipping_country == 'HR') data.shipping_country = 'HRVATSKA'
  if (data.shipping_country == 'CZ') data.shipping_country = 'ČESKO'
  var date =
    data.shipping_country == 'HU'
      ? getCurrentTime('MM. dd. yyyy')
      : getCurrentTime('dd. MM. yyyy')
  data.payment = data.payment_method_name
  var html = `<!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title></title>
    <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style type="text/css">
      #outlook a {
        padding: 0;
      }

      .ReadMsgBody {
        width: 100%;
      }

      .ExternalClass {
        width: 100%;
      }

      .ExternalClass * {
        line-height: 100%;
      }

      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }

      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }

      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if !mso]><!-->
    <style type="text/css">
      @media only screen and (max-width:480px) {
        @-ms-viewport {
          width: 320px;
        }

        @viewport {
          width: 320px;
        }
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]><xml>  <o:OfficeDocumentSettings>    <o:AllowPNG/>    <o:PixelsPerInch>96</o:PixelsPerInch>  </o:OfficeDocumentSettings></xml><![endif]-->
    <!--[if lte mso 11]><style type="text/css">  .outlook-group-fix {    width:100% !important;  }</style><![endif]-->
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700" rel="stylesheet" type="text/css">
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700);
    </style>
    <!--<![endif]-->
    <style type="text/css">
      @media only screen and (min-width:480px) {
        .mj-column-per-100 {
          width: 100% !important;
        }

        .mj-column-per-50 {
          width: 50% !important;
        }

        .mj-column-per-60 {
          width: 60% !important;
        }

        .mj-column-per-40 {
          width: 40% !important;
        }
      }
    </style>
  </head>

  <body style="background: #F2F2F2;">
    <div class="mj-container" style="background-color:#F2F2F2;">
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:22px 22px 22px 22px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:282px;"><img alt height="auto" src=${
                                  images.logo
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="282"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:0px 0px 0px 0px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:800px;"><img alt height="auto" src=${
                                  images.order_slika
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="800"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:50px 40px 50px 40px;background-color:#142135;" align="center">
                          <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:22px;line-height:1.5;text-align:center;">
                            <h1 style="line-height: 140%;font-weight:300;font-size:26px;color:#fff;margin:0;">${
                              lang.div_top_status11.value
                            }<br/><b>${order_status}</b></h1>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:14px;line-height:1.5;text-align:center;max-width:400px;">
                            <p>${lang.p_greeting1.value} ${
    data.shipping_first_name.charAt(0).toUpperCase() +
    data.shipping_first_name.slice(1)
  },</p>
                            <p>${lang.p_greeting_t11.value}</p>
                            <p>${lang.p_greeting_t21.value}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;border-bottom:3px solid #142135;">
                            <p style="margin-bottom:3px;font-size:21px;">${
                              lang.heading_order1.value
                            }</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:0 0 0 15px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                            <p style="margin:0;">
                              <b> ${lang.order_info_11.value}: </b>#${
    data.order_id2
  } <br>
                              <b> ${lang.order_info_21.value}: </b>${date}
                            </p>
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;padding:0 15px 0 0;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                            <p style="margin:0;">
                              <b>${lang.order_info_31.value}: </b>${
    data.payment
  } <br>
                              <b>${lang.order_info_41.value}: </b>${
    data.delivery_method_code
  }
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
            <tr>
              <td style="text-align:left;vertical-align:top;direction:ltr;font-size:0px;padding:9px 0px 9px 0px;">
                <div class="mj-column-per-40 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="left">
                          <div style="cursor:auto;color:#000000;background:#eee;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;padding:15px;">
                            <p style="margin:0;">              <b style="text-transform:initial">${
                              lang.order_info_51.value
                            }</b><br>
                                          ${data.shipping_first_name} ${
    data.shipping_last_name
  }<br>
                                          ${data.shipping_address}<br>
                                          ${data.shipping_postcode} ${
    data.shipping_city
  }<br>
                                          ${data.shipping_country}</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0 15px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="2" cellspacing="0" width="100%" border="0">
                    <thead>
                      <th style="text-align:left">${
                        lang.order_table_th_11.value
                      }</th>
                      <th style="text-align:center">${
                        lang.order_table_th_21.value
                      }</th>
                      <th style="text-align:center">${
                        lang.order_table_th_31.value
                      }</th>
                      <th style="text-align:right">${
                        lang.order_table_th_51.value
                      }</th>
                    </thead>
                    <tbody>
                    `
  if (data.therapies) {
    var otoCount = 0
    for (var i = 0; i < data.therapies.length; i++) {
      if (item_id && item_id == data.therapies[i].id && otoCount === 0) {
        otoCount = 1
        var price =
          (data.therapies[i].price - data.additional_discount) *
          data.therapies[i].quantity
      } else {
        var price = data.therapies[i].price * data.therapies[i].quantity
      }

      if (data.therapies[i].isGift) price = 0
      price = parseFloat(price).toFixed(2)

      data.therapies[i].price = parseFloat(price).toFixed(2)

      var without_ddv1 = price / data.therapies[i].quantity
      var osnova_za_ddv = parseFloat(price)
      html += `
                          <tr>
                            <td style="text-align:left;">${
                              data.therapies[i].name
                            }</td>
                            <td style="text-align:center">${
                              data.therapies[i].quantity
                            }</td>
                            <td style="text-align:center">${
                              without_ddv1 && without_ddv1.toFixed(2)
                            } ${data.currency_symbol}</td>
                            <td style="text-align:right">${
                              osnova_za_ddv && osnova_za_ddv.toFixed(2)
                            } ${data.currency_symbol}</td>
                          </tr>
                        `
    }
  }
  if (data.accessories) {
    var otoCount = 0
    for (var i = 0; i < data.accessories.length; i++) {
      var pp = data.accessories[i].price
        ? data.accessories[i].price
        : data.accessories[i].reduced_price
      if (item_id && item_id == data.accessories[i].id && otoCount === 0) {
        otoCount = 1
        var price =
          (pp - data.additional_discount) * data.accessories[i].quantity
      } else {
        var price = pp * data.accessories[i].quantity
      }
      if (data.accessories[i].isGift) {
        price = 0 //data.accessories[i].no_price;
        // discount_ddv += price
      }
      data.accessories[i].price = parseFloat(price).toFixed(2)
      var without_ddv1 = price / data.accessories[i].quantity
      var osnova_za_ddv = parseFloat(price)
      html += `
                          <tr>
                            <td style="text-align:left;">
                            ${data.accessories[i].name} - ${
        data.accessories[i].product_name
      }
                            </td>
                            <td style="text-align:center">1</td>
                            <td style="text-align:center">${
                              without_ddv1 && without_ddv1.toFixed(2)
                            } ${data.currency_symbol}</td>
                            <td style="text-align:right">${
                              osnova_za_ddv && osnova_za_ddv.toFixed(2)
                            } ${data.currency_symbol}</td>
                          </tr>
                        `
    }
  }

  html += `
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;">
                          <div style="font-size:1px;line-height:10px;white-space:nowrap;">&#xA0;</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;"><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:right;vertical-align:top;direction:ltr;font-size:0px;padding:20px 15px;">
                <div class="mj-column-per-40 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:40%;background:#eee;padding:15px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${lang.order_checkout_t_11.value}:
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${without_ddv && without_ddv.toFixed(2)} ${
    data.currency_symbol
  }
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${lang.order_checkout_t_21.value}:
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${shipping_ddv.toFixed(2)} ${data.currency_symbol}
                          </div>
                        </td>
                      </tr>
                      ${
                        discount_ddv
                          ? `  <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${
                          lang.order_checkout_t_31.value
                        }:</div></td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${discount_ddv.toFixed(
                          2,
                        )} ${data.currency_symbol}</div></td>
                      </tr>`
                          : ''
                      }
                      ${
                        data.additional_discount_id && !item_id
                          ? `  <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${
                          lang.order_checkout_t_41.value
                        }:</div></td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${additional_discount_ddv.toFixed(
                          2,
                        )} ${data.currency_symbol}</div></td>
                      </tr>`
                          : ''
                      }
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding-top:12px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-weight:600;font-size:15px;line-height:1.5;text-align:left;">
                          ${lang.order_checkout_t_71.value}
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;padding-top:12px;" align="right">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-weight:600;font-size:15px;line-height:1.5;text-align:left;">
                          ${data.total} ${data.currency_symbol}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 35px 15px;" align="center">
                <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <p style="font-size:13px;">${bottom_txt}</p>
                  <p style="font-size:13px;">${
                    lang.order_bottom_greet1.value
                  }<br>
                  ${lang.order_bottom_team1.value}</p>
                  <div style="text-align:center; margin-top:30px;">
                    <a href="${
                      info.fb_link
                    }" style="margin-right:30px;color:#fff">
                      <img src=${images.fb} width="30" height="30"/>
                    </a>
                     <a href="${info.ig_link}">
                      <img src=${images.ig} width="30" height="30"/>
                     </a>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#142135;color:#fff;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
                <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
                    <tbody>
                      <tr>
                        <td style="width:31%">
                        <p style="text-align:center"><img src=${
                          images.payment_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px;text-align:center;color:#fff">${
                          lang.order_footer_11.value
                        }<br>${lang.order_footer_1_11.value}</p>
                        </td>
                        <td style="width:37%">
                        <p style="text-align:center"><img src=${
                          images.support_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff">${
                          lang.order_footer_21.value
                        }<br><a style="color:#fff" href="tel:${
    lang.order_footer_phone_format.value
  }">${lang.order_footer_2_11.value}</a></p>
                        </td>
                        <td style="width:32%">
                        <p style="text-align:center"><img src=${
                          images.warranty_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff;">${
                          lang.order_footer_31.value
                        }<br>${lang.order_footer_3_11.value}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
    </div>
  </body>
  </html>`

  sendMail(data.shipping_email, title, 'text', html)
}

mailing.prototype.createSentMail = function (
  data,
  textData,
  status,
  item_id = null,
) {
  var lang = textData[0].data
  var invoice = data
  var DDV = invoice.country_ddv
  var without_ddv = invoice.subtotal
  var ddv_total = invoice.total
  var all_ddv = invoice.total
  var shipping_ddv = invoice.shipping_fee
  var discount_ddv = invoice.discount
  var additional_discount_ddv = 0
  if (invoice.additional_discount_id) {
    additional_discount_ddv = invoice.additional_discount
  }

  data.subtotal = parseFloat(data.subtotal).toFixed(2)
  data.discount = parseFloat(data.discount).toFixed(2)
  data.shipping_fee = parseFloat(data.shipping_fee).toFixed(2)
  data.total = parseFloat(data.total).toFixed(2)

  var order_status = ''
  var title = ''
  var bottom_txt = ''
  order_status = lang.div_top_status22.value
  bottom_txt = lang.order_bottom_p_12.value
  title = `${lang.mail_title2.value} [#${data.order_id2}]`
  if (data.shipping_country == 'SI') data.shipping_country = 'SLOVENIJA'
  if (data.shipping_country == 'SK') data.shipping_country = 'SLOVENSKO'
  if (data.shipping_country == 'HU') data.shipping_country = 'MAGYARORSZÁG'
  if (data.shipping_country == 'HR') data.shipping_country = 'HRVATSKA'
  if (data.shipping_country == 'CZ') data.shipping_country = 'ČESKO'
  var date =
    data.shipping_country == 'HU'
      ? getCurrentTime('MM. dd. yyyy')
      : getCurrentTime('dd. MM. yyyy')
  data.payment = data.payment_method_name
  var html = `<!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title></title>
    <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style type="text/css">
      #outlook a {
        padding: 0;
      }

      .ReadMsgBody {
        width: 100%;
      }

      .ExternalClass {
        width: 100%;
      }

      .ExternalClass * {
        line-height: 100%;
      }

      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }

      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }

      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if !mso]><!-->
    <style type="text/css">
      @media only screen and (max-width:480px) {
        @-ms-viewport {
          width: 320px;
        }

        @viewport {
          width: 320px;
        }
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]><xml>  <o:OfficeDocumentSettings>    <o:AllowPNG/>    <o:PixelsPerInch>96</o:PixelsPerInch>  </o:OfficeDocumentSettings></xml><![endif]-->
    <!--[if lte mso 11]><style type="text/css">  .outlook-group-fix {    width:100% !important;  }</style><![endif]-->
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700" rel="stylesheet" type="text/css">
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700);
    </style>
    <!--<![endif]-->
    <style type="text/css">
      @media only screen and (min-width:480px) {
        .mj-column-per-100 {
          width: 100% !important;
        }

        .mj-column-per-50 {
          width: 50% !important;
        }

        .mj-column-per-60 {
          width: 60% !important;
        }

        .mj-column-per-40 {
          width: 40% !important;
        }
      }
    </style>
  </head>

  <body style="background: #F2F2F2;">
    <div class="mj-container" style="background-color:#F2F2F2;">
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:22px 22px 22px 22px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:282px;"><img alt height="auto" src=${
                                  images.logo
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="282"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:0px 0px 0px 0px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:800px;"><img alt height="auto" src=${
                                  images.order_slika
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="800"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:50px 40px 50px 40px;background-color:#142135;" align="center">
                          <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:22px;line-height:1.5;text-align:center;">
                            <h1 style="line-height: 140%;font-weight:300;font-size:26px;color:#fff;margin:0;">${
                              lang.div_top_status12.value
                            }<br/><b>${order_status}</b></h1>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:14px;line-height:1.5;text-align:center;max-width:400px;">
                            <p>${lang.p_greeting2.value} ${
    data.shipping_first_name.charAt(0).toUpperCase() +
    data.shipping_first_name.slice(1)
  },</p>
                            <p>${lang.p_greeting_t12.value}</p>
                            <p>${lang.p_greeting_t22.value}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;border-bottom:3px solid #142135;">
                            <p style="margin-bottom:3px;font-size:21px;">${
                              lang.heading_order2.value
                            }</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:0 0 0 15px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                            <p style="margin:0;">
                              <b> ${lang.order_info_12.value}: </b>#${
    data.order_id2
  } <br>
                              <b> ${lang.order_info_22.value}: </b>${date}
                            </p>
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;padding:0 15px 0 0;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                            <p style="margin:0;">
                              <b>${lang.order_info_32.value}: </b>${
    data.payment
  } <br>
                              <b>${lang.order_info_42.value}: </b>${
    data.delivery_method_code
  }
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
            <tr>
              <td style="text-align:left;vertical-align:top;direction:ltr;font-size:0px;padding:9px 0px 9px 0px;">
                <div class="mj-column-per-40 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="left">
                          <div style="cursor:auto;color:#000000;background:#eee;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;padding:15px;">
                            <p style="margin:0;">              <b style="text-transform:initial">${
                              lang.order_info_52.value
                            }</b><br>
                                          ${data.shipping_first_name} ${
    data.shipping_last_name
  }<br>
                                          ${data.shipping_address}<br>
                                          ${data.shipping_postcode} ${
    data.shipping_city
  }<br>
                                          ${data.shipping_country}</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0 15px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="2" cellspacing="0" width="100%" border="0">
                    <thead>
                      <th style="text-align:left">${
                        lang.order_table_th_12.value
                      }</th>
                      <th style="text-align:center">${
                        lang.order_table_th_22.value
                      }</th>
                      <th style="text-align:center">${
                        lang.order_table_th_32.value
                      }</th>
                      <th style="text-align:right">${
                        lang.order_table_th_52.value
                      }</th>
                    </thead>
                    <tbody>
                    `
  if (data.therapies) {
    var otoCount = 0
    for (var i = 0; i < data.therapies.length; i++) {
      if (item_id && item_id == data.therapies[i].id && otoCount === 0) {
        otoCount = 1
        var price =
          (data.therapies[i].price - data.additional_discount) *
          data.therapies[i].quantity
      } else {
        var price = data.therapies[i].price * data.therapies[i].quantity
      }

      if (data.therapies[i].isGift) price = 0
      price = parseFloat(price).toFixed(2)

      data.therapies[i].price = parseFloat(price).toFixed(2)

      var without_ddv1 = price / data.therapies[i].quantity
      var osnova_za_ddv = parseFloat(price)
      html += `
                          <tr>
                            <td style="text-align:left;">${
                              data.therapies[i].name
                            }</td>
                            <td style="text-align:center">${
                              data.therapies[i].quantity
                            }</td>
                            <td style="text-align:center">${
                              without_ddv1 && without_ddv1.toFixed(2)
                            } ${data.currency_symbol}</td>
                            <td style="text-align:right">${
                              osnova_za_ddv && osnova_za_ddv.toFixed(2)
                            } ${data.currency_symbol}</td>
                          </tr>
                        `
    }
  }
  if (data.accessories) {
    var otoCount = 0
    for (var i = 0; i < data.accessories.length; i++) {
      if (item_id && item_id == data.accessories[i].id && otoCount === 0) {
        otoCount = 1
        var price =
          (data.accessories[i].price - data.additional_discount) *
          data.accessories[i].quantity
      } else {
        var price = data.accessories[i].price * data.accessories[i].quantity
      }
      if (data.accessories[i].isGift) price = 0
      data.accessories[i].price = parseFloat(price).toFixed(2)
      var without_ddv1 = price / data.accessories[i].quantity
      var osnova_za_ddv = parseFloat(price)
      html += `
                          <tr>
                            <td style="text-align:left;">
                            ${data.accessories[i].name} - ${
        data.accessories[i].product_name
      }
                            </td>
                            <td style="text-align:center">1</td>
                            <td style="text-align:center">${
                              without_ddv1 && without_ddv1.toFixed(2)
                            } ${data.currency_symbol}</td>
                            <td style="text-align:right">${
                              osnova_za_ddv && osnova_za_ddv.toFixed(2)
                            } ${data.currency_symbol}</td>
                          </tr>
                        `
    }
  }

  html += `
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;">
                          <div style="font-size:1px;line-height:10px;white-space:nowrap;">&#xA0;</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;"><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:right;vertical-align:top;direction:ltr;font-size:0px;padding:20px 15px;">
                <div class="mj-column-per-40 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:40%;background:#eee;padding:15px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${lang.order_checkout_t_12.value}:
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${without_ddv && without_ddv.toFixed(2)} ${
    data.currency_symbol
  }
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${lang.order_checkout_t_22.value}:
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${shipping_ddv.toFixed(2)} ${data.currency_symbol}
                          </div>
                        </td>
                      </tr>
                      ${
                        discount_ddv
                          ? `  <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${
                          lang.order_checkout_t_32.value
                        }:</div></td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${discount_ddv.toFixed(
                          2,
                        )} ${data.currency_symbol}</div></td>
                      </tr>`
                          : ''
                      }
                      ${
                        data.additional_discount_id && !item_id
                          ? `  <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${
                          lang.order_checkout_t_42.value
                        }:</div></td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${additional_discount_ddv.toFixed(
                          2,
                        )} ${data.currency_symbol}</div></td>
                      </tr>`
                          : ''
                      }
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding-top:12px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-weight:600;font-size:15px;line-height:1.5;text-align:left;">
                          ${lang.order_checkout_t_72.value}
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;padding-top:12px;" align="right">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-weight:600;font-size:15px;line-height:1.5;text-align:left;">
                          ${data.total} ${data.currency_symbol}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 35px 15px;" align="center">
                <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <p style="font-size:13px;">${bottom_txt}</p>
                  <p style="font-size:13px;">${
                    lang.order_bottom_greet2.value
                  }<br>
                  ${lang.order_bottom_team2.value}</p>
                  <div style="text-align:center; margin-top:30px;">
                    <a href="${
                      info.fb_link
                    }" style="margin-right:30px;color:#fff;">
                      <img src=${images.fb} width="30" height="30"/>
                    </a>
                     <a href="${info.ig_link}">
                      <img src=${images.ig} width="30" height="30"/>
                     </a>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#142135;color:#fff;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
                <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
                    <tbody>
                      <tr>
                        <td style="width:31%">
                        <p style="text-align:center"><img src=${
                          images.payment_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px;text-align:center;color:#fff">${
                          lang.order_footer_12.value
                        }<br>${lang.order_footer_1_12.value}</p>
                        </td>
                        <td style="width:37%">
                        <p style="text-align:center"><img src=${
                          images.support_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff">${
                          lang.order_footer_22.value
                        }<br><a style="color:#fff" href="tel:${
    lang.order_footer_phone_format.value
  }">${lang.order_footer_2_12.value}</a></p>
                        </td>
                        <td style="width:32%">
                        <p style="text-align:center"><img src=${
                          images.warranty_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff;">${
                          lang.order_footer_32.value
                        }<br>${lang.order_footer_3_12.value}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
    </div>
  </body>
  </html>`

  sendMail(data.shipping_email, title, 'text', html)
}

mailing.prototype.createCancelMail = function (
  data,
  textData,
  status,
  item_id,
) {
  var lang = textData[0].data
  var invoice = data
  var DDV = invoice.country_ddv
  var without_ddv = invoice.subtotal
  var ddv_total = invoice.total
  var all_ddv = invoice.total
  var shipping_ddv = invoice.shipping_fee
  var discount_ddv = invoice.discount
  var additional_discount_ddv = 0
  if (invoice.additional_discount_id) {
    additional_discount_ddv = invoice.additional_discount
  }

  data.subtotal = parseFloat(data.subtotal).toFixed(2)
  data.discount = parseFloat(data.discount).toFixed(2)
  data.shipping_fee = parseFloat(data.shipping_fee).toFixed(2)
  data.total = parseFloat(data.total).toFixed(2)

  var order_status = ''
  var title = ''
  var bottom_txt = ''
  order_status = lang.div_top_status23.value
  bottom_txt = lang.order_bottom_p_13.value
  title = `${lang.mail_title3.value} [#${data.order_id2}]`
  if (data.shipping_country == 'SI') data.shipping_country = 'SLOVENIJA'
  if (data.shipping_country == 'SK') data.shipping_country = 'SLOVENSKO'
  if (data.shipping_country == 'HU') data.shipping_country = 'MAGYARORSZÁG'
  if (data.shipping_country == 'HR') data.shipping_country = 'HRVATSKA'
  if (data.shipping_country == 'CZ') data.shipping_country = 'ČESKO'
  var date =
    data.shipping_country == 'HU'
      ? getCurrentTime('MM. dd. yyyy')
      : getCurrentTime('dd. MM. yyyy')
  data.payment = data.payment_method_name
  var html = `<!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title></title>
    <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style type="text/css">
      #outlook a {
        padding: 0;
      }

      .ReadMsgBody {
        width: 100%;
      }

      .ExternalClass {
        width: 100%;
      }

      .ExternalClass * {
        line-height: 100%;
      }

      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }

      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }

      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if !mso]><!-->
    <style type="text/css">
      @media only screen and (max-width:480px) {
        @-ms-viewport {
          width: 320px;
        }

        @viewport {
          width: 320px;
        }
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]><xml>  <o:OfficeDocumentSettings>    <o:AllowPNG/>    <o:PixelsPerInch>96</o:PixelsPerInch>  </o:OfficeDocumentSettings></xml><![endif]-->
    <!--[if lte mso 11]><style type="text/css">  .outlook-group-fix {    width:100% !important;  }</style><![endif]-->
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700" rel="stylesheet" type="text/css">
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700);
    </style>
    <!--<![endif]-->
    <style type="text/css">
      @media only screen and (min-width:480px) {
        .mj-column-per-100 {
          width: 100% !important;
        }

        .mj-column-per-50 {
          width: 50% !important;
        }

        .mj-column-per-60 {
          width: 60% !important;
        }

        .mj-column-per-40 {
          width: 40% !important;
        }
      }
    </style>
  </head>

  <body style="background: #F2F2F2;">
    <div class="mj-container" style="background-color:#F2F2F2;">
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:22px 22px 22px 22px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:282px;"><img alt height="auto" src=${
                                  images.logo
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="282"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:0px 0px 0px 0px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:800px;"><img alt height="auto" src=${
                                  images.order_slika
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="800"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:50px 40px 50px 40px;background-color:#142135;" align="center">
                          <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:22px;line-height:1.5;text-align:center;">
                            <h1 style="line-height: 140%;font-weight:300;font-size:26px;color:#fff;margin:0;">${
                              lang.div_top_status13.value
                            }<br/><b>${order_status}</b></h1>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:14px;line-height:1.5;text-align:center;max-width:400px;">
                            <p>${lang.p_greeting3.value} ${
    data.shipping_first_name.charAt(0).toUpperCase() +
    data.shipping_first_name.slice(1)
  },</p>
                            <p>${lang.p_greeting_t13.value}</p>
                            <p>${lang.p_greeting_t23.value}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:left;border-bottom:3px solid #142135;">
                            <p style="margin-bottom:3px;font-size:21px;">${
                              lang.heading_order3.value
                            }</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:0 0 0 15px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                            <p style="margin:0;">
                              <b> ${lang.order_info_13.value}: </b>#${
    data.order_id2
  } <br>
                              <b> ${lang.order_info_23.value}: </b>${date}
                            </p>
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;padding:0 15px 0 0;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                            <p style="margin:0;">
                              <b>${lang.order_info_33.value}: </b>${
    data.payment
  } <br>
                              <b>${lang.order_info_43.value}: </b>${
    data.delivery_method_code
  }
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
            <tr>
              <td style="text-align:left;vertical-align:top;direction:ltr;font-size:0px;padding:9px 0px 9px 0px;">
                <div class="mj-column-per-40 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="left">
                          <div style="cursor:auto;color:#000000;background:#eee;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;padding:15px;">
                            <p style="margin:0;">              <b style="text-transform:initial">${
                              lang.order_info_53.value
                            }</b><br>
                                          ${data.shipping_first_name} ${
    data.shipping_last_name
  }<br>
                                          ${data.shipping_address}<br>
                                          ${data.shipping_postcode} ${
    data.shipping_city
  }<br>
                                          ${data.shipping_country}</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0 15px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="2" cellspacing="0" width="100%" border="0">
                    <thead>
                      <th style="text-align:left">${
                        lang.order_table_th_13.value
                      }</th>
                      <th style="text-align:center">${
                        lang.order_table_th_23.value
                      }</th>
                      <th style="text-align:center">${
                        lang.order_table_th_33.value
                      }</th>
                      <th style="text-align:right">${
                        lang.order_table_th_53.value
                      }</th>
                    </thead>
                    <tbody>
                    `
  if (data.therapies) {
    var otoCount = 0
    for (var i = 0; i < data.therapies.length; i++) {
      if (item_id && item_id == data.therapies[i].id && otoCount === 0) {
        otoCount = 1
        var price =
          (data.therapies[i].price - data.additional_discount) *
          data.therapies[i].quantity
      } else {
        var price = data.therapies[i].price * data.therapies[i].quantity
      }

      if (data.therapies[i].isGift) price = 0
      price = parseFloat(price).toFixed(2)

      data.therapies[i].price = parseFloat(price).toFixed(2)

      var without_ddv1 = price / data.therapies[i].quantity
      var osnova_za_ddv = parseFloat(price)
      html += `
                          <tr>
                            <td style="text-align:left;">${
                              data.therapies[i].name
                            }</td>
                            <td style="text-align:center">${
                              data.therapies[i].quantity
                            }</td>
                            <td style="text-align:center">${
                              without_ddv1 && without_ddv1.toFixed(2)
                            } ${data.currency_symbol}</td>
                            <td style="text-align:right">${
                              osnova_za_ddv && osnova_za_ddv.toFixed(2)
                            } ${data.currency_symbol}</td>
                          </tr>
                        `
    }
  }
  if (data.accessories) {
    var otoCount = 0
    for (var i = 0; i < data.accessories.length; i++) {
      if (item_id && item_id == data.accessories[i].id && otoCount === 0) {
        otoCount = 1
        var price =
          (data.accessories[i].price - data.additional_discount) *
          data.accessories[i].quantity
      } else {
        var price = data.accessories[i].price * data.accessories[i].quantity
      }
      if (data.accessories[i].isGift) price = 0
      data.accessories[i].price = parseFloat(price).toFixed(2)
      var without_ddv1 = price / data.accessories[i].quantity
      var osnova_za_ddv = parseFloat(price)
      html += `
                          <tr>
                            <td style="text-align:left;">
                            ${data.accessories[i].name} - ${
        data.accessories[i].product_name
      }
                            </td>
                            <td style="text-align:center">1</td>
                            <td style="text-align:center">${
                              without_ddv1 && without_ddv1.toFixed(2)
                            } ${data.currency_symbol}</td>
                            <td style="text-align:right">${
                              osnova_za_ddv && osnova_za_ddv.toFixed(2)
                            } ${data.currency_symbol}</td>
                          </tr>
                        `
    }
  }

  html += `
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;">
                          <div style="font-size:1px;line-height:10px;white-space:nowrap;">&#xA0;</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;"><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:right;vertical-align:top;direction:ltr;font-size:0px;padding:20px 15px;">
                <div class="mj-column-per-40 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:40%;background:#eee;padding:15px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${lang.order_checkout_t_13.value}:
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${without_ddv && without_ddv.toFixed(2)} ${
    data.currency_symbol
  }
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${lang.order_checkout_t_23.value}:
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">
                          ${shipping_ddv.toFixed(2)} ${data.currency_symbol}
                          </div>
                        </td>
                      </tr>
                      ${
                        discount_ddv
                          ? `  <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${
                          lang.order_checkout_t_33.value
                        }:</div></td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${discount_ddv.toFixed(
                          2,
                        )} ${data.currency_symbol}</div></td>
                      </tr>`
                          : ''
                      }
                      ${
                        data.additional_discount_id && !item_id
                          ? `  <tr>
                        <td style="word-wrap:break-word;font-size:0px;" align="left"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${
                          lang.order_checkout_t_43.value
                        }:</div></td>
                        <td style="word-wrap:break-word;font-size:0px;" align="right"><div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:13px;line-height:1.5;text-align:left;">${additional_discount_ddv.toFixed(
                          2,
                        )} ${data.currency_symbol}</div></td>
                      </tr>`
                          : ''
                      }
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding-top:12px;" align="left">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-weight:600;font-size:15px;line-height:1.5;text-align:left;">
                          ${lang.order_checkout_t_73.value}
                          </div>
                        </td>
                        <td style="word-wrap:break-word;font-size:0px;padding-top:12px;" align="right">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-weight:600;font-size:15px;line-height:1.5;text-align:left;">
                          ${data.total} ${data.currency_symbol}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 35px 15px;" align="center">
                <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <p style="font-size:13px;">${bottom_txt}</p>
                  <p style="font-size:13px;">${
                    lang.order_bottom_greet3.value
                  }<br>
                  ${lang.order_bottom_team3.value}</p>
                  <div style="text-align:center; margin-top:30px;">
                  <a href="${
                    info.fb_link
                  }" style="margin-right:30px;color:#fff;">
                    <img src=${images.fb} width="30" height="30" />
                    </a>
                     <a href="${info.ig_link}">
                      <img src=${images.ig} width="30" height="30"/>
                     </a>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#142135;color:#fff;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
                <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
                    <tbody>
                      <tr>
                        <td style="width:31%">
                        <p style="text-align:center"><img src=${
                          images.payment_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px;text-align:center;color:#fff">${
                          lang.order_footer_13.value
                        }<br>${lang.order_footer_1_13.value}</p>

                        </td>
                        <td style="width:37%">
                        <p style="text-align:center"><img src=${
                          images.support_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff">${
                          lang.order_footer_23.value
                        }<br><a style="color:#fff" href="tel:${
    lang.order_footer_phone_format.value
  }">${lang.order_footer_2_13.value}</a></p>

                        </td>
                        <td style="width:32%">
                        <p style="text-align:center"><img src=${
                          images.warranty_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff;">${
                          lang.order_footer_33.value
                        }<br>${lang.order_footer_3_13.value}</p>

                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
    </div>
  </body>
  </html>`

  sendMail(data.shipping_email, title, 'text', html)
}

mailing.prototype.orderDelivered = function (data, textData, status) {
  var lang = textData[0].data

  var order_status = ''
  var title = ''
  var bottom_txt = ''
  order_status = lang.div_top_status24.value
  title = `${lang.mail_title4.value} [#${data.order_id2}]`

  if (data.shipping_country == 'SI') data.shipping_country = 'SLOVENIJA'
  if (data.shipping_country == 'SK') data.shipping_country = 'SLOVENSKO'
  if (data.shipping_country == 'HU') data.shipping_country = 'MAGYARORSZÁG'
  if (data.shipping_country == 'HR') data.shipping_country = 'HRVATSKA'
  if (data.shipping_country == 'CZ') data.shipping_country = 'ČESKO'
  var date =
    data.shipping_country == 'HU'
      ? getCurrentTime('MM. dd. yyyy')
      : getCurrentTime('dd. MM. yyyy')
  data.payment = data.payment_method_name
  var html = `<!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title></title>
    <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style type="text/css">
      #outlook a {
        padding: 0;
      }

      .ReadMsgBody {
        width: 100%;
      }

      .ExternalClass {
        width: 100%;
      }

      .ExternalClass * {
        line-height: 100%;
      }

      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }

      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }

      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if !mso]><!-->
    <style type="text/css">
      @media only screen and (max-width:480px) {
        @-ms-viewport {
          width: 320px;
        }

        @viewport {
          width: 320px;
        }
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]><xml>  <o:OfficeDocumentSettings>    <o:AllowPNG/>    <o:PixelsPerInch>96</o:PixelsPerInch>  </o:OfficeDocumentSettings></xml><![endif]-->
    <!--[if lte mso 11]><style type="text/css">  .outlook-group-fix {    width:100% !important;  }</style><![endif]-->
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700" rel="stylesheet" type="text/css">
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700);
    </style>
    <!--<![endif]-->
    <style type="text/css">
      @media only screen and (min-width:480px) {
        .mj-column-per-100 {
          width: 100% !important;
        }

        .mj-column-per-50 {
          width: 50% !important;
        }

        .mj-column-per-60 {
          width: 60% !important;
        }

        .mj-column-per-40 {
          width: 40% !important;
        }
      }
    </style>
  </head>

  <body style="background: #F2F2F2;">
    <div class="mj-container" style="background-color:#F2F2F2;">
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:22px 22px 22px 22px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:282px;"><img alt height="auto" src=${
                                  images.logo
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="282"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:0px 0px 0px 0px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:800px;"><img alt height="auto" src=${
                                  images.order_slika
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="800"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:50px 40px 50px 40px;background-color:#142135;" align="center">
                          <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:22px;line-height:1.5;text-align:center;">
                            <h1 style="line-height: 140%;font-weight:300;font-size:26px;color:#fff;margin:0;">${
                              lang.div_top_status14.value
                            }<br/><b>${order_status}</b></h1>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:14px;line-height:1.5;text-align:center;max-width:400px;">
                            <p>${lang.p_greeting4.value} ${
    data.shipping_first_name.charAt(0).toUpperCase() +
    data.shipping_first_name.slice(1)
  },</p>
                            <p>${lang.p_greeting_t14.value}</p>
                            <p>${lang.p_greeting_t24.value}</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 35px 15px;" align="center">
                <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <p style="font-size:13px;">${
                    lang.order_bottom_greet4.value
                  }<br>
                  ${lang.order_bottom_team4.value}</p>
                  <div style="text-align:center; margin-top:30px;">
                  <a href="${
                    info.fb_link
                  }" style="margin-right:30px;color:#fff;">
                    <img src=${images.fb} width="30" height="30" />

                    </a>
                     <a href="${info.ig_link}">
                      <img src=${images.ig} width="30" height="30"/>
                     </a>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#142135;color:#fff;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
                <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
                    <tbody>
                      <tr>
                        <td style="width:31%">
                        <p style="text-align:center"><img src=${
                          images.payment_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px;text-align:center;color:#fff">${
                          lang.order_footer_14.value
                        }<br>${lang.order_footer_1_14.value}</p>

                        </td>
                        <td style="width:37%">
                        <p style="text-align:center"><img src=${
                          images.support_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff">${
                          lang.order_footer_24.value
                        }<br><a style="color:#fff" href="tel:${
    lang.order_footer_phone_format.value
  }">${lang.order_footer_2_14.value}</a></p>

                        </td>
                        <td style="width:32%">
                        <p style="text-align:center"><img src=${
                          images.warranty_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff;">${
                          lang.order_footer_34.value
                        }<br>${lang.order_footer_3_14.value}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
    </div>
  </body>
  </html>`

  sendMail(data.shipping_email, title, 'text', html)
}

// mailing.prototype.sendStockreminderMail = function (data) {
//   for (var k in data) {
//     var html = `<html>
//     <body> `
//     for (var i = 0; i < data[k].length; i++) {
//       html += `${data[k][i].id}<br/>
//            ${data[k][i].product_id}<br/>
//            ${data[k][i].product_name}<br/>
//            ${data[k][i].critical_value}<br/>
//            ${data[k][i].amount}<br/> `
//     }
//     ;` </body>
//   </html>`
//
//     sendMail(data[k], 'Lux Cosmetics - stockreminder', 'text', html)
//   }
// }
//
// mailing.prototype.sendStockRemindersMails = function (data) {
//   for (var i = 0; i < data.length; ++i) {
//     var html = `<html><body> `
//     for (var j = 0; j < data[i].products.length; j++) {
//       html += `${data[i].products[j].product_id}<br/>
//             ${data[i].products[j].product_name}<br/>
//             ${data[i].products[j].critical_value}<br/>
//             ${data[i].products[j].amount}<br/> `
//     }
//     html += `</body></html>`
//     sendMail(data[i].to, 'Lux Cosmetics - stockreminder', 'text', html)
//   }
// }

mailing.prototype.sendOtoms = function (data) {
  for (var i = 0; i < data.length; i++) {
    //otom language: data[i].otom.data
    var html = `
    <html>
      <head>
        <meta charset="UTF-8">

        <meta name="x-apple-disable-message-reformatting">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <style>
          @font-face {
            font-family: 'Open Sans';
            font-style: normal;
            font-weight: 400;
            src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v15/mem8YaGs126MiZpBA-UFW50bbck.woff2) format('woff2');
            unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
          }
          .box-to a{
            color:black !important;
          }
          a {
            color:white !important;
            text-decoration:none;
          }
          p{
            font-size:16px;
            text-align:center;
          }

          table{
            width: 100%;
            padding: 10px;
            margin-bottom:20px;
          }

          tr{
            padding:15px 0;
          }

          td{
            padding:5px 0;
          }

          @media only screen and (max-device-width: 480px) {
            .main{
              width:100%!important;
              padding-left:10px!important;
            }

            .logo-div{
              width:100% !important;
              text-align:center;
            }

            .logo{
              margin:0 auto !important;
              width:70% !important;
            }

            .to-change{
              font-size:19px !important;
              line-height:22px !important;
              padding:50px 40px !important;
            }

            .main-p{
              padding:0!important;
              text-align:justify !important;
              width: 100%!important;
            }

            .title-order{
              font-size:22px !important;
              padding-bottom:7px !important;
            }

            .float-clear{
              clear:both !important;
              width:100% !important;
              padding:0px !important;
            }

            .gray-box{
              margin-top:120px !important;
              width:60%!important;
            }

            table th, td{
              font-size:11px !important;
            }

            .bottom-gray{
              width:65%!important;
              font-size:12px !important;
            }

            .block{
              display:block!important;
              padding:20px !important;
            }

            .flex-100{
              width:100%!important;
            }

            .for-payment{
              font-size:14px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class='main' style="width:800px; margin:0 auto; padding:25px; font-family: 'Open Sans', sans-serif;">
          <div class="logo-div" style="width:350px; margin:10px auto 30px">
            <img src=${images.logo} class='logo' width="100%"/>
          </div>

          <div style="width:100%; background-color:#142135;">
            <img src=${images.order_slika} width="100%"/>
            <div style="padding:70px 40px;  margin-top:-5px; line-height:32px; color:white; font-size: 26px; text-align:center;" class="to-change">
              ${data[i].otom.label}
            </div>
          </div>
          <div>
            <div style="text-align:center; margin-top:50px; margin-bottom:50px;">
              ${data[i].otom.data}
              <a href="${data[i].link}" style="margin-top:30px; display:block">
                <button style="background-color:#142135; color:white; padding:15px 25px; border:none; outline:none;font-size:16px; cursor:pointer">PREVZEMI POPUST</button>
              </a>
            </div>
            <div style="text-align:center;">
            <a href="${info.fb_link}" style="margin-right:30px;color:#fff;">
              <img src=${images.fb} width="30" height="30" />
              </a>
             <a href="${info.ig_link}">
              <img src=${images.ig} width="60px" height="60px"/>
             </a>
            </div>
          </div>
        </div>
      </body>
    </html>`

    var args = {
      otom_sent_id: data[i].id,
    }

    sendMail(
      data[i].order.shipping_email,
      'Lux Cosmetics - ' + data[i].otom.label,
      'text',
      html,
      args,
    )
  }
}

mailing.prototype.sendDeliveryReminder = function (order, text) {
  var lang = text.data

  var order_status = ''
  var title = ''
  var bottom_txt = ''
  order_status = lang.div_top_status2.value
  title = `${lang.mail_title.value} [#${data.order_id2}]`

  if (data.shipping_country == 'SI') data.shipping_country = 'SLOVENIJA'
  if (data.shipping_country == 'SK') data.shipping_country = 'SLOVENSKO'
  if (data.shipping_country == 'HU') data.shipping_country = 'MAGYARORSZÁG'
  if (data.shipping_country == 'HR') data.shipping_country = 'HRVATSKA'
  if (data.shipping_country == 'CZ') data.shipping_country = 'ČESKO'
  var date =
    data.shipping_country == 'HU'
      ? getCurrentTime('MM. dd. yyyy')
      : getCurrentTime('dd. MM. yyyy')
  var html = `<!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title></title>
    <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style type="text/css">
      #outlook a {
        padding: 0;
      }

      .ReadMsgBody {
        width: 100%;
      }

      .ExternalClass {
        width: 100%;
      }

      .ExternalClass * {
        line-height: 100%;
      }

      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }

      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }

      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if !mso]><!-->
    <style type="text/css">
      @media only screen and (max-width:480px) {
        @-ms-viewport {
          width: 320px;
        }

        @viewport {
          width: 320px;
        }
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]><xml>  <o:OfficeDocumentSettings>    <o:AllowPNG/>    <o:PixelsPerInch>96</o:PixelsPerInch>  </o:OfficeDocumentSettings></xml><![endif]-->
    <!--[if lte mso 11]><style type="text/css">  .outlook-group-fix {    width:100% !important;  }</style><![endif]-->
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700" rel="stylesheet" type="text/css">
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,700);
    </style>
    <!--<![endif]-->
    <style type="text/css">
      @media only screen and (min-width:480px) {
        .mj-column-per-100 {
          width: 100% !important;
        }

        .mj-column-per-50 {
          width: 50% !important;
        }

        .mj-column-per-60 {
          width: 60% !important;
        }

        .mj-column-per-40 {
          width: 40% !important;
        }
      }
    </style>
  </head>

  <body style="background: #F2F2F2;">
    <div class="mj-container" style="background-color:#F2F2F2;">
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:22px 22px 22px 22px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:282px;"><img alt height="auto" src=${
                                  images.logo
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="282"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:0px 0px 0px 0px;">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:800px;">      <![endif]-->
                <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:0px 0px 0px 0px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:800px;"><img alt height="auto" src=${
                                  images.order_slika
                                } style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="800"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:50px 40px 50px 40px;background-color:#142135;" align="center">
                          <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:22px;line-height:1.5;text-align:center;">
                            <h1 style="line-height: 140%;font-weight:300;font-size:26px;color:#fff;margin:0;">${
                              lang.div_top_status1.value
                            }<br/><b>${order_status}</b></h1>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                          <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:14px;line-height:1.5;text-align:center;max-width:400px;">
                            <p>${lang.p_greeting.value} ${
    data.shipping_first_name.charAt(0).toUpperCase() +
    data.shipping_first_name.slice(1)
  },</p>
                            <p>${lang.p_greeting_t1.value}</p>
                            <p>${lang.p_greeting_t2.value}</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 35px 15px;" align="center">
                <div style="cursor:auto;color:#000000;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <p style="font-size:13px;">${
                    lang.order_bottom_greet.value
                  }<br>
                  ${lang.order_bottom_team.value}</p>
                  <div style="text-align:center; margin-top:30px;">
                  <a href="${
                    info.fb_link
                  }" style="margin-right:30px;color:#fff;">
                    <img src=${images.fb} width="30" height="30" />

                    </a>
                     <a href="${info.ig_link}">
                      <img src=${images.ig} width="30" height="30"/>
                     </a>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
      <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
      <div style="margin:0px auto;max-width:800px;background:#142135;color:#fff;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
          <tbody>
            <tr>
              <td style="word-wrap:break-word;font-size:0px;padding:15px 15px 15px 15px;" align="center">
                <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="800" align="center" style="width:800px;">        <tr>          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">      <![endif]-->
                <div style="cursor:auto;color:#fff;font-family:'Open Sans', Helvetica, Arial, sans-serif;font-size:11px;line-height:1.5;text-align:center;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#142135;" align="center" border="0">
                    <tbody>
                      <tr>
                        <td style="width:31%">
                        <p style="text-align:center"><img src=${
                          images.payment_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px;text-align:center;color:#fff">${
                          lang.order_footer_1.value
                        }<br>${lang.order_footer_1_1.value}</p>

                        </td>
                        <td style="width:37%">
                        <p style="text-align:center"><img src=${
                          images.support_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff">${
                          lang.order_footer_2.value
                        }<br><a style="color:#fff" href="tel:${
    lang.order_footer_phone_format.value
  }">${lang.order_footer_2_1.value}</a></p>

                        </td>
                        <td style="width:32%">
                        <p style="text-align:center"><img src=${
                          images.warranty_icon
                        } height="30" width="30" style="margin-top: 19px;" align="center"/></p>
                        <p style="font-size:12px; text-align:center;color:#fff;">${
                          lang.order_footer_3.value
                        }<br>${lang.order_footer_3_1.value}</p>

                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
    </div>
  </body>
  </html>`

  var args = {
    delivery_reminder_id: order.mail_id,
  }

  sendMail(order.shipping_email, text.data.mail_title.value, 'text', html, args)
}

sendMail = async function (to, subject, text, html, args) {
  const emailParams = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
        Text: {
          Charset: "UTF-8",
          Data: text,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: '"E-Commerce Cosmetics" <info@lux-cosmetics.com>',
  };

  try {
    const data = await sesClient.send(new SendEmailCommand(emailParams));
    console.log("Email sent successfully", data);
  } catch (err) {
    logger.error(JSON.stringify(err));
  }
}

sendMail1 = async function (to, subject, text, html, args, remail) {
  const emailParams = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
        Text: {
          Charset: "UTF-8",
          Data: text,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: '"E-Commerce Cosmetics" <info@lux-cosmetics.com>',
  };

  try {
    const data = await sesClient.send(new SendEmailCommand(emailParams));
    console.log("Email sent successfully", data);
  } catch (err) {
    logger.error(err.toString());
  }
}

module.exports = new mailing()
