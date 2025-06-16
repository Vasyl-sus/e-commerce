module.exports = function thankYouLetter (customer) {

  let defaultForLangs = {
    'HR': {
      'text_1': 'Poštovani',
      'text_2': "zahvaljujemo Vam na povjerenju koji ste iskazali kupnjom naših proizvoda E-commerce Cosmetics.",
      'text_3': "Veseli nas Vaš izbor i vjerujemo kako ćete redovitom upotrebom naših proizvoda postići željeni rezultat. Šaljemo Vam brošuru u kojoj možete vidjeti naše proizvode, način korištenja E-commerce proizvoda i sve rezultate koje postižete korištenjem.",
      'text_4': "Radujemo se Vašem sljedećem posjetu našoj web stranici",
      'text_5': "www.E-commerce.com",
      'text_6': "Lijep pozdrav,",
      'text_9': "ekipa E-commerce.",
      'text_10': ","
    },
    'HU': {
      'text_1': 'Tisztelt',
      'text_2': "Köszönjük, hogy a E-commerce védjegy terméke megvásárlása mellett döntött.",
      'text_3': "Hálásak vagyunk a választásáért, és bízunk benne, hogy a termék rendszeres használata által eléri az elvárt hatást. Egyben küldjük Önnek a termék brosúráját, amelyben még egyszer megtekintheti a E-commerce védjegy termékének optimális használatát és előnyeit.",
      'text_4': "Örömmel várjuk a www.E-commerce.com honlapunk következő látogatását!",
      'text_5': "",
      'text_6': "Üdvözlettel,",
      'text_9': "a E-commerce csapata.",
      'text_10': "!"
    },
    'SI': {
      'text_1': 'Spoštovani',
      'text_2': "zahvaljujemo se vam za zaupanje, ki ste nam ga izkazali ob nakupu produkta znamke E-commerce.",
      'text_3': "Veseli smo vaše izbire in verjamemo, da boste ob redni uporabi produkta dosegli pričakovani učinek. Pošiljamo vam brošuro, v kateri si lahko še enkrat pogledate optimalen način uporabe produkta znamke E-commerce in vse koristi, ki jih prinaša.",
      'text_4': "Veselimo se vašega naslednjega obiska na naši spletni strani",
      'text_5': "www.E-commerce.com",
      'text_6': "Lep pozdrav,",
      'text_9': "ekipa E-commerce.",
      'text_10': ","
    },
    'SK': {
      'text_1': 'Vážená pani/ Vážený pán',
      'text_2': "ďakujeme za Vašu dôveru, ktorú ste nám preukázali zakúpením produktu značky E-commerce.",
      'text_3': "Sme radi, že ste si vybrali práve náš produkt a veríme, že pri jeho pravidelnom používaní dosiahnete očakávaný účinok. Posielame Vám brožúru, v ktorej si môžete znovu prezrieť optimálny spôsob, ako používať produkty značky E-commerce a všetky výhody, ktoré prináša.",
      'text_4': "Tešíme sa na Vašu ďalšiu návštevu našej webovej stránky",
      'text_5': "www.E-commerce.com",
      'text_6': "S priateľským pozdravom,",
      'text_9': "tím E-commerce.",
      'text_10': ","
    },
    'CZ': {
      'text_1': 'Vážená pani/ Vážený pán',
      'text_2': "ďakujeme za Vašu dôveru, ktorú ste nám preukázali zakúpením produktu značky E-commerce.",
      'text_3': "Sme radi, že ste si vybrali práve náš produkt a veríme, že pri jeho pravidelnom používaní dosiahnete očakávaný účinok. Posielame Vám brožúru, v ktorej si môžete znovu prezrieť optimálny spôsob, ako používať produkty značky E-commerce a všetky výhody, ktoré prináša.",
      'text_4': "Tešíme sa na Vašu ďalšiu návštevu našej webovej stránky",
      'text_5': "www.E-commerce.com",
      'text_6': "S priateľským pozdravom,",
      'text_9': "tím E-commerce.",
      'text_10': ","
    }
  }

  let html = '<!DOCTYPE html>'
  + '<html>'
  +'<head>'
  +  '<style type="text/css">'
  +    'p, table, .text {font-family: "arial";}'
  + 'body, td, th, input, select, textarea, option, optgroup, p {'
  +  'font-family: Verdana, Arial, Helvetica, sans-serif;'
  +  'font-size: 13px;'
  +  'color: #000000;'
  + '}'
  +  'h2 {font-family: Verdana, Arial, Helvetica, sans-serif;font-weight: bold;font-size: 16px;}'
  +    '@page {'
  +      'size: auto;'
  +    '}'
  +  'div { page-break-inside:avoid; page-break-after:auto }'
  +  '</style>'
  +'</head>'
  +'<body>';

  html+= '<div style="height: 650px; padding-top: 170px;">'
      + '<p style="padding-left:125px;padding-right:70px;"><span style="font-size:13px;margin-bottom:30px;">'+ defaultForLangs[customer.country].text_1 + ' ' + customer.shipping_first_name + ' ' + customer.shipping_last_name + defaultForLangs[customer.country].text_10 + '</span></p>'
      +  '<div>'
      +    '<p style="padding-left:125px;padding-right:70px;"><span style="margin-bottom:40px;">'+ defaultForLangs[customer.country].text_2 + '</span></p>'
      +    '<p style="padding-left:125px;padding-right:70px;"><span style="margin-bottom:50px;">'+ defaultForLangs[customer.country].text_3 + '</span></p>'
      +    '<p style="padding-left:125px;padding-right:70px;"><span style="">'+ defaultForLangs[customer.country].text_4 + ' <b>'+ defaultForLangs[customer.country].text_5 + '</b></span></p>'
      +    '<p style="padding-left:125px;padding-right:70px;"><span style="margin-bottom:70px;">'+ defaultForLangs[customer.country].text_6 + '</span></p>'
      +    '<div style="text-align:right;padding-left:125px;padding-right:70px;"><span>'+ defaultForLangs[customer.country].text_9 + '</span></div>'
      +  '</div>'
      +  '</div>'

  html += '</body></html>';
  return html;
}
