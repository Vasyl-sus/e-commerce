
var commonServices = function() {}
var moment = require('moment');

commonServices.prototype.calculateOrder = function(order) {
	var subtotal = order.subtotal;
	var total = 0;
	var discount = 0;
	var shipping = 0;
	var additional_discount = 0;
  console.log(order)
	// for (var i = 0; i < order.therapies.length; i ++) {
	// 	subtotal += order.therapies[i].total_price * order.therapies[i].quantity;
	// }

  // for (var i = 0; i < order.accessories.length; i ++) {
	// 	subtotal += order.accessories[i].reduced_price;
	// }

	if (subtotal < order.delivery_method_to_price) {
		shipping = order.delivery_method_price
	}
	if (order.discount && order.discount.type) {
		if (order.discount.type.toLowerCase() == 'general') {
			if (order.discount.discount_type.toLowerCase() == 'percent') {
				discount = subtotal - (subtotal / ((order.discount.discount_value / 100) + 1))
			} else {
				discount = order.discount.discount_value
			}
		} else if (order.discount.type.toLowerCase() == 'individual') {

			var discountTherapies = order.discount.therapies;
			var pickedTherapies = [];
			var subtotalForDiscount = 0;
			for (var i = 0; i < discountTherapies.length; i++) {
				var th = order.therapies.find(t => {
					return t.id == discountTherapies[i].id
				})
				if (th) {
					subtotalForDiscount += th.total_price * th.quantity;
					if (order.discount.discount_type.toLowerCase() == 'percent') {
						discount = subtotalForDiscount - (subtotalForDiscount / ((order.discount.discount_value / 100) + 1))
					} else {
						discount = order.discount.discount_value
					}
				}
			}
		} else if (order.discount.type.toLowerCase() == 'shipping') {
			if (order.delivery_method_to_price < subtotal) {
				discount = order.delivery_method_price
			}
		}
	}

	if (order.additionalDiscountData && order.additionalDiscountData.type) {
		if (order.additionalDiscountData.type.toLowerCase() == 'general') {
			if (order.additionalDiscountData.discount_type.toLowerCase() == 'percent') {
				additional_discount = subtotal - (subtotal / ((order.additionalDiscountData.discount_value / 100) + 1))
			} else {
				additional_discount = order.additionalDiscountData.discount_value
			}
		} else if (order.additionalDiscountData.type.toLowerCase() == 'individual') {

			var discountTherapies = order.additionalDiscountData.therapies;
			var pickedTherapies = [];
			var subtotalForDiscount = 0;
			for (var i = 0; i < discountTherapies.length; i++) {
				var th = order.therapies.find(t => {
					return t.id == discountTherapies[i].id
				})
				if (th) {
					subtotalForDiscount += th.total_price * th.quantity;
					if (order.additionalDiscountData.discount_type.toLowerCase() == 'percent') {
						additional_discount = subtotalForDiscount - (subtotalForDiscount / ((order.additionalDiscountData.discount_value / 100) + 1))
					} else {
						additional_discount = order.additionalDiscountData.discount_value
					}
				}
			}
		} else if (order.additionalDiscountData.type.toLowerCase() == 'shipping') {
			if (order.delivery_method_to_price < subtotal) {
				additional_discount = order.delivery_method_price
			}
		}
	}
  console.log(subtotal, discount, additional_discount, shipping)
	return {
		discount,
		shipping_fee: shipping,
		subtotal,
		total: subtotal - discount - additional_discount + shipping,
		therapies: order.therapies,
		additional_discount
	}

}

commonServices.prototype.makeInvoiceHtml =  function(invoice) {
  var html = ``;
	var current_year = new Date().getFullYear();
	var order_id = "01-" + invoice.order_id2 + "-" + current_year;
  var DDV = invoice.country_ddv;
  var vithout_ddv = 0;//invoice.subtotal - (invoice.subtotal * (DDV / 100));
  //console.log(vithout_ddv)
  var all_ddv = invoice.total / ((DDV / 100) + 1);
  var ddv_total = invoice.total - (invoice.total / ((DDV / 100) + 1));
  var shipping_ddv = invoice.shipping_fee / ((DDV / 100) + 1);
  var discount_ddv = invoice.ddiscount_value / ((DDV / 100) + 1);
	var discount_name;
	if (invoice.discount_id) {
		discount_name = invoice.discount.name;
	}
  var additional_discount_ddv = 0;
  if (invoice.additional_discount_id) {
    additional_discount_ddv = invoice.additional_discount / ((DDV / 100) + 1);
  }

  let texts = [];
  texts["SI"] = [];
  texts["SI"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | ID za DDV: PL5272861380";
  texts["SI"]["text2"] = "RAČUN";
  texts["SI"]["text3"] = "Datum računa:"
  texts["SI"]["text6"] = "KUPEC";
  texts["SI"]["text7"] = "ID za DDV:"
  texts["SI"]["text8"] = "Naziv izdelka";
  texts["SI"]["text9"] = "Količina";
  texts["SI"]["text10"] = "Cena";
  texts["SI"]["text11"] = "DDV";
  texts["SI"]["text12"] = "Skupaj";
  texts["SI"]["text13"] = "Skupaj:";
  texts["SI"]["text14"] = "Strošek dostave:";
  texts["SI"]["text15"] = "Popust";
  texts["SI"]["text16"] = "Dodatni popust:";
  texts["SI"]["text17"] = "Osnova za DDV:";
  texts["SI"]["text18"] = "DDV (22%):";
  texts["SI"]["text19"] = "Skupni znesek:";
  texts["SI"]["text20"] = "";
  texts["SI"]["text21"] = "01 777 41 07 | www.E-commerce.com | info@E-commerce.com";
  texts["SI"]["text22"] = "Popust";
  texts["SI"]["text23"] = "Št. spletnega naročila:";
  texts["SI"]["text24"] = "PREJEMNIK";

	texts["SL"] = [];
	texts["SL"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | ID za DDV: PL5272861380";
	texts["SL"]["text2"] = "RAČUN";
	texts["SL"]["text3"] = "Datum računa:"
	texts["SL"]["text6"] = "KUPEC";
	texts["SL"]["text7"] = "ID za DDV:"
	texts["SL"]["text8"] = "Naziv izdelka";
	texts["SL"]["text9"] = "Količina";
	texts["SL"]["text10"] = "Cena";
	texts["SL"]["text11"] = "DDV";
	texts["SL"]["text12"] = "Skupaj";
	texts["SL"]["text13"] = "Skupaj:";
	texts["SL"]["text14"] = "Strošek dostave:";
	texts["SL"]["text15"] = "Popust";
	texts["SL"]["text16"] = "Dodatni popust:";
	texts["SL"]["text17"] = "Osnova za DDV:";
	texts["SI"]["text18"] = "DDV (22%):";
	texts["SL"]["text19"] = "Skupni znesek:";
	texts["SL"]["text20"] = "";
	texts["SL"]["text21"] = "01 777 41 07 | www.E-commerce.com | info@E-commerce.com";
	texts["SL"]["text22"] = "Popust";
	texts["SL"]["text23"] = "Št. spletnega naročila:";
  texts["SL"]["text24"] = "PREJEMNIK";

	texts["SK"] = [];
	texts["SK"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | DIČ: PL5272861380";
	texts["SK"]["text2"] = "ÚČET";
	texts["SK"]["text3"] = "Dátum objednávky:"
	texts["SK"]["text6"] = "KUPUJÚCI";
	texts["SK"]["text7"] = "DIČ:"
	texts["SK"]["text8"] = "Produkt";
	texts["SK"]["text9"] = "Množstvo";
	texts["SK"]["text10"] = "Cena";
	texts["SK"]["text11"] = "DPH";
	texts["SK"]["text12"] = "Spolu";
	texts["SK"]["text13"] = "Spolu:";
	texts["SK"]["text14"] = "Náklady na dopravu:";
	texts["SK"]["text15"] = "Zľava";
	texts["SK"]["text16"] = "Dodatočná zľava:";
	texts["SK"]["text17"] = "Základ DPH:";
	texts["SK"]["text18"] = "DPH (20%):";
	texts["SK"]["text19"] = "Celková suma:";
	texts["SK"]["text20"] = "";
	texts["SK"]["text21"] = "(421) 220 922 547 | www.E-commerce.com | info@E-commerce.com";
	texts["SK"]["text22"] = "Zľava";
	texts["SK"]["text23"] = "Číslo objednávky:";
  texts["SK"]["text24"] = "ODBERATEĽ";

	texts["CS"] = [];
	texts["CS"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | Ič pre DPH: PL5272861380";
	texts["CS"]["text2"] = "ÚČET";
	texts["CS"]["text3"] = "Datum:"
	texts["CS"]["text6"] = "KUPUJÍCÍ";
	texts["CS"]["text7"] = "IČ pre DPH:"
	texts["CS"]["text8"] = "Produkt";
	texts["CS"]["text9"] = "Množství";
	texts["CS"]["text10"] = "Cena";
	texts["CS"]["text11"] = "DPH";
	texts["CS"]["text12"] = "Spolu";
	texts["CS"]["text13"] = "Spolu:";
	texts["CS"]["text14"] = "Náklady na dopravu:";
	texts["CS"]["text15"] = "Sleva";
	texts["CS"]["text16"] = "Dodatečná sleva:";
	texts["CS"]["text17"] = "Základ DPH:";
	texts["CS"]["text18"] = "DPH (21%):";
	texts["CS"]["text19"] = "Celková suma:";
	texts["CS"]["text20"] = "";
	texts["CS"]["text21"] = "+420 296 182 861 | www.E-commerce.com | info@E-commerce.com";
	texts["CS"]["text22"] = "Sleva";
	texts["CS"]["text23"] = "Číslo objednávky:";
  texts["CS"]["text24"] = "ODBĚRATEL";

	texts["CZ"] = [];
	texts["CZ"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | Ič pre DPH: PL5272861380";
	texts["CZ"]["text2"] = "ÚČET";
	texts["CZ"]["text3"] = "Datum:"
	texts["CZ"]["text6"] = "KUPUJÍCÍ";
	texts["CZ"]["text7"] = "IČ pre DPH:"
	texts["CZ"]["text8"] = "Produkt";
	texts["CZ"]["text9"] = "Množství";
	texts["CZ"]["text10"] = "Cena";
	texts["CZ"]["text11"] = "DPH";
	texts["CZ"]["text12"] = "Spolu";
	texts["CZ"]["text13"] = "Spolu:";
	texts["CZ"]["text14"] = "Náklady na dopravu:";
	texts["CZ"]["text15"] = "Sleva";
	texts["CZ"]["text16"] = "Dodatečná sleva:";
	texts["CZ"]["text17"] = "Základ DPH:";
	texts["CZ"]["text18"] = "DPH (21%):";
	texts["CZ"]["text19"] = "Celková suma:";
	texts["CZ"]["text20"] = "";
	texts["CZ"]["text21"] = "+420 296 182 861 | www.E-commerce.com | info@E-commerce.com";
	texts["CZ"]["text22"] = "Sleva";
	texts["CZ"]["text23"] = "Číslo objednávky:";
	texts["CZ"]["text24"] = "ODBĚRATEL";

	texts["HU"] = [];
	texts["HU"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | ANUM: PL5272861380";
	texts["HU"]["text2"] = "SZÁMLA";
	texts["HU"]["text3"] = "A rendelés dátuma:"
	texts["HU"]["text6"] = "VEVŐ";
	texts["HU"]["text7"] = "ANUM:"
	texts["HU"]["text8"] = "Név";
	texts["HU"]["text9"] = "Mennyiség";
	texts["HU"]["text10"] = "Ár";
	texts["HU"]["text11"] = "ÁFA";
	texts["HU"]["text12"] = "Összesen";
	texts["HU"]["text13"] = "Összesen:";
	texts["HU"]["text14"] = "Szállítási költség:";
	texts["HU"]["text15"] = "Kedvezmény";
	texts["HU"]["text16"] = "További kedvezmény:";
	texts["HU"]["text17"] = "Adóalap:";
	texts["HU"]["text18"] = "ÁFA (27%):";
	texts["HU"]["text19"] = "Végösszeg:";
	texts["HU"]["text20"] = "";
	texts["HU"]["text21"] = "+36 19 995 353 | www.E-commerce.com | info@E-commerce.com";
	texts["HU"]["text22"] = "Kedvezmény";
	texts["HU"]["text23"] = "A rendelés száma:";
  texts["HU"]["text24"] = "CÍMZETT";

	texts["HR"] = [];
	texts["HR"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | PDV-ID: PL5272861380";
	texts["HR"]["text2"] = "RAČUN";
	texts["HR"]["text3"] = "Datum računa:"
	texts["HR"]["text6"] = "KUPAC";
	texts["HR"]["text7"] = "PDV-ID:"
	texts["HR"]["text8"] = "Ime";
	texts["HR"]["text9"] = "Količina";
	texts["HR"]["text10"] = "Cijena";
	texts["HR"]["text11"] = "PDV";
	texts["HR"]["text12"] = "Ukupno";
	texts["HR"]["text13"] = "Ukupno:";
	texts["HR"]["text14"] = "Troškovi dostave:";
	texts["HR"]["text15"] = "Popust";
	texts["HR"]["text16"] = "Dodatni popust:";
	texts["HR"]["text17"] = "Osnova za PDV:";
	texts["HR"]["text18"] = "PDV (25%):";
	texts["HR"]["text19"] = "Ukupan iznos:";
	texts["HR"]["text20"] = "";
	texts["HR"]["text21"] = "01 330 93 65 | www.E-commerce.com | info@E-commerce.com";
	texts["HR"]["text22"] = "Popust";
	texts["HR"]["text23"] = "Br. narudžbe:";
  texts["HR"]["text24"] = "PRIMATELJ";

	texts["GB"] = [];
	texts["GB"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | VAT ID: PL5272861380";
	texts["GB"]["text2"] = "INVOICE";
	texts["GB"]["text3"] = "Invoice date:"
	texts["GB"]["text6"] = "CUSTOMER";
	texts["GB"]["text7"] = "VAT ID:"
	texts["GB"]["text8"] = "Product Name";
	texts["GB"]["text9"] = "Quantity";
	texts["GB"]["text10"] = "Price";
	texts["GB"]["text11"] = "VAT";
	texts["GB"]["text12"] = "Total";
	texts["GB"]["text13"] = "Total:";
	texts["GB"]["text14"] = "Shipping:";
	texts["GB"]["text15"] = "Discount";
	texts["GB"]["text16"] = "Additional discount:";
	texts["GB"]["text17"] = "VAT basis:";
	texts["GB"]["text18"] = "VAT:";
	texts["GB"]["text19"] = "Total amount:";
	texts["GB"]["text20"] = "According to the Law on Value Added Tax in Hungary, VAT is calculated at a rate of 27%.";
	texts["GB"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
	texts["GB"]["text22"] = "Discount";
	texts["GB"]["text23"] = "Online order no.:";
	texts["GB"]["text24"] = "SHIPPING ADDRESS";

  var new_date = moment(invoice.date_added, "DD.MM.YYYY");
  new_date.add(30, 'days');
  var addedDiscounts = [];
  var header = `<html lang="GB">
    <head>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
      <title>Example 2</title>
      <link rel="stylesheet" href="style.css" media="all" />
      <style>
        html {
          width: 100%;
        }
        @font-face {
          font-family: 'Open Sans';
          font-style: normal;
          font-weight: 400;
          src: url('/fonts/OpenSans-Regular.woff2') format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        body {
          margin: 0 auto;
          color: black;
          background: #FFFFFF;
          font-size: 11px;
          font-family: 'Open Sans', sans-serif;
          border:3px solid #142135;
          padding: 30px 40px 40px;
          margin:30px;
        }

        .logo{
          width:180px;
        }

        .logo-cont{
          margin:0 auto;
          text-align:center
        }

        .right-add{
        }

        .right-add p{
          padding:0;
          margin-top:10px;
          text-align:center
        }

        .container{
          width:100%;
          margin:40px 0px 20px;
          position:relative;
        }

        .title-order{
          font-size:20px;
          border-bottom:2px solid #142135;
          padding-bottom:5px;
          margin-bottom:5px;
        }

        .float-l{
          float:left;
          padding-left:0;
          width:60%;
        }

          .gray-box{
					max-width:50%;
					width:50%;
          background-color:#eee;
          margin-top:20px;
          padding:10px;
          text-transform:uppercase;
          line-height:22px;
        }
           .gray-box b {
        line-height:25px;
        }


        .prod-table{
          margin-top:20px;
        }

        table{
          width: 100%;
          padding: 10px;
          margin-bottom:20px;
        }

        tr{
          line-height:20px;
        }


        td, th {
          font-size: 12px;
        }

        .bottom-gray{
          width:50%;
          float: right;
          background-color:#eee;
          margin-top:0px;
          padding:10px;
          text-transform:uppercase;
          line-height:22px;
          font-size:12px;
          font-weight:normal;
        }

         .for-payment{
            font-size: 13px;
            line-height: 40px;
            font-weight: bold;
        }


        .bottom-text{
          position:absolute;
          bottom:40px;
          text-align:center;
          width:75%;
          font-weight:bold;
          margin:0 auto;
        }

        .small-p{
          font-size: 9px;
        }

        .bottom-content{
          margin-top:160px;
        }

        .bottom-direktor{
          margin-top:40px;
          text-align:right;
        }

        .bottom-direktor img{
          width:100px;
        }
      </style>
    </head>
    <body>
      <div class="logo-cont">
        <img class="logo" src="https://admin.E-commerce.com/images/admin/lux.png">
      </div>
      <div class="right-add">
         <p class="small-p"><b>${texts[invoice.shipping_country]["text1"]}</b></p>
      </div>
      <div class="container">
        <div class='title-order'>${texts[invoice.shipping_country]["text2"]}: #${order_id}</div>
        <div class='float-l'>
          <b> ${texts[invoice.shipping_country]["text3"]} </b> ${moment(invoice.date_added).format('DD. MM. YYYY')}<br/>
        </div>
        <table>
          <tr>
            ${invoice.payment_first_name && `<td >
              <div class='gray-box'>
                <b>${texts[invoice.shipping_country]["text6"]}</b><br>
                ${invoice.payment_first_name} ${invoice.payment_last_name}<br>
                ${invoice.payment_address}<br>
                ${invoice.payment_postcode} ${invoice.payment_city}<br>
                ${invoice.payment_country}
              </div>
            </td>` || ""}
            <td>
              <div class='gray-box'>
                <b>${texts[invoice.shipping_country]["text24"]}</b><br>
                ${invoice.shipping_first_name} ${invoice.shipping_last_name}<br>
                ${invoice.shipping_address}<br>
                ${invoice.shipping_postcode} ${invoice.shipping_city}<br>
                ${invoice.shipping_country}
              </div>
            </td>
          </tr>
        </table>
        <div class="prod-table">
          <table>
            <thead>
              <th style="text-align:left">${texts[invoice.shipping_country]["text8"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text9"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text10"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text22"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text11"]}</th>
              <th style="text-align:right">${texts[invoice.shipping_country]["text12"]}</th>
            </thead>
            <tbody>
              ${invoice.therapies.map(r => {
                var vithout_ddv1 = r.total_price / (((DDV / 100) + 1));
                var osnova_za_ddv = ((r.total_price * r.quantity) / (((DDV / 100) + 1)));
                var withPopust = osnova_za_ddv;

                var popust = 0;
                var count = 0;
                let found1 = addedDiscounts && addedDiscounts.find(a => {
                  return a === r.id
                }) || false
                if(invoice.additionalDiscountData && !found1) {
                  let found = invoice.additionalDiscountData.therapies && invoice.additionalDiscountData.therapies.find(t => {
                    return t.therapy_id === r.id
                  }) || false
                  if (found) {
                    popust = invoice.additionalDiscountData.discount_value
                    withPopust -= invoice.additional_discount;
                    addedDiscounts.push(r.id)
                  }
                }

                vithout_ddv += withPopust;

                return (
                  `<tr>
                    <td style="text-align:left;">${r.name}</td>
                    <td style="text-align:center">${r.quantity}</td>
                    <td style="text-align:center">${vithout_ddv1 && vithout_ddv1.toFixed(2)} ${invoice.currency_symbol} </td>
                    <td style="text-align: center">${popust} %</td>
                    <td style="text-align:center">${DDV} % </td>
                    <td style="text-align:right">${withPopust && withPopust.toFixed(2)} ${invoice.currency_symbol} </td>
                  </tr>`
                )
              }).join('')}
              ${invoice.accessories.map(r => {
                var osnova_za_ddv = r.reduced_price / (((DDV / 100) + 1));
                var popust = 0;
                var withPopust = osnova_za_ddv;
                if (r.isGift) {
                  popust = 100;
                  // discount_ddv += osnova_za_ddv;
                  withPopust = 0.00;
                }



                var count = 0;
                let found1 = addedDiscounts && addedDiscounts.find(a => {
                  return a === r.id
                }) || false
                if(invoice.additionalDiscountData && !found1) {
                  let found = invoice.additionalDiscountData.accessories && invoice.additionalDiscountData.accessories.find(t => {
                    return t.therapy_id === r.id
                  }) || false
                  if (found) {
                    popust = invoice.additionalDiscountData.discount_value
                    withPopust -= invoice.additional_discount;
                    addedDiscounts.push(r.id)
                  }
                }
                vithout_ddv += withPopust * r.quantity;
                return (
                  `<tr>
                    <td style="text-align:left;">${r.acc_name} - ${r.name}</td>
                    <td style="text-align:center">${r.quantity}</td>
                    <td style="text-align:center">${osnova_za_ddv && osnova_za_ddv.toFixed(2)} ${invoice.currency_symbol} </td>
                    <td style="text-align:center">${popust} % </td>
                    <td style="text-align:center">${DDV} % </td>
                    <td style="text-align:right">${withPopust && (withPopust * r.quantity).toFixed(2)} ${invoice.currency_symbol} </td>
                  </tr>`
                )
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class='bottom-gray' >
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text13"]}</div>
            <div style="float:right; width:30%; text-align:right">${vithout_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text14"]}</div>
            <div style="float:right; width:30%; text-align:right">${shipping_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          ${discount_name ?
            `<div class="bottom-pay">
              <div style="float:left; width:70%">${texts[invoice.shipping_country]["text15"]} (${discount_name}):</div>
              <div style="float:right; width:30%; text-align:right">${discount_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
            </div>` : ''
          }
          ${invoice.additional_discount_id  ?
           `<div class="bottom-pay">
              <div style="float:left; width:70%">${texts[invoice.shipping_country]["text16"]}</div>
              <div style="float:right; width:30%; text-align:right">${additional_discount_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
            </div>` : ''
          }
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text17"]}</div>
            <div style="float:right; width:30%; text-align:right">${all_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text18"]}</div>
            <div style="float:right; width:30%; text-align:right">${ddv_total.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          <div class="for-payment">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text19"]}</div>
            <div style="float:right; width:30%; text-align:right">${invoice.total.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
        </div>
        <div class='bottom-content'>
          ${texts[invoice.shipping_country]["text20"]}<br/><br/>
        </div>
      </div>
      <div class="bottom-text">
        ${texts[invoice.shipping_country]["text21"]}
      </div>


    </body>
  </html>
      `;
  // var footer = `</body></html>`
  html += header;
  //html += ``
  // html += footer;

  return html;
}

commonServices.prototype.makeInvoiceHtmlKnjizara =  function(invoice) {
  var html = ``;
	var current_year = new Date().getFullYear();
	var order_id = "01-" + invoice.order_id2 + "-" + current_year;
  var DDV = invoice.country_ddv;
  var vithout_ddv = 0;//invoice.subtotal - (invoice.subtotal * (DDV / 100));
  //console.log(vithout_ddv)
  var all_ddv = invoice.total / ((DDV / 100) + 1);
  var ddv_total = invoice.total - (invoice.total / ((DDV / 100) + 1));
  var shipping_ddv = invoice.shipping_fee / ((DDV / 100) + 1);
  var discount_ddv = invoice.ddiscount_value / ((DDV / 100) + 1);
	var discount_name;
	if (invoice.discount_id) {
		discount_name = invoice.discount.name;
	}
  var additional_discount_ddv = 0;
  if (invoice.additional_discount_id) {
    additional_discount_ddv = invoice.additional_discount / ((DDV / 100) + 1);
  }

  let texts = [];
	texts["SL"] = [];
	texts["SL"]["text1"] = "KNJIŽARA OLIVER d.o.o., Šetalište 150. brigade 8, 10000 Zagreb, Croatia | VAT ID: HR45786092231";
	texts["SL"]["text2"] = "INVOICE";
	texts["SL"]["text3"] = "Invoice date:"
	texts["SL"]["text6"] = "CUSTOMER";
	texts["SL"]["text7"] = "VAT ID:"
	texts["SL"]["text8"] = "Product Name";
	texts["SL"]["text9"] = "Quantity";
	texts["SL"]["text10"] = "Price";
	texts["SL"]["text11"] = "VAT";
	texts["SL"]["text12"] = "Total";
	texts["SL"]["text13"] = "Total:";
	texts["SL"]["text14"] = "Shipping:";
	texts["SL"]["text15"] = "Discount";
	texts["SL"]["text16"] = "Additional discount:";
	texts["SL"]["text17"] = "VAT basis:";
	texts["SL"]["text18"] = "VAT:";
	texts["SL"]["text19"] = "Total amount:";
	texts["SL"]["text20"] = "Knjižara Oliver is the official distributor of E-commerce Cosmetics for Croatian market.";
	texts["SL"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
	texts["SL"]["text22"] = "Discount";
	texts["SL"]["text23"] = "Online order no.:";
	texts["SL"]["text24"] = "SHIPPING ADDRESS";

	texts["SI"] = [];
	texts["SI"]["text1"] = "KNJIŽARA OLIVER d.o.o., Šetalište 150. brigade 8, 10000 Zagreb, Croatia | VAT ID: HR45786092231";
	texts["SI"]["text2"] = "INVOICE";
	texts["SI"]["text3"] = "Invoice date:"
	texts["SI"]["text6"] = "CUSTOMER";
	texts["SI"]["text7"] = "VAT ID:"
	texts["SI"]["text8"] = "Product Name";
	texts["SI"]["text9"] = "Quantity";
	texts["SI"]["text10"] = "Price";
	texts["SI"]["text11"] = "VAT";
	texts["SI"]["text12"] = "Total";
	texts["SI"]["text13"] = "Total:";
	texts["SI"]["text14"] = "Shipping:";
	texts["SI"]["text15"] = "Discount";
	texts["SI"]["text16"] = "Additional discount:";
	texts["SI"]["text17"] = "VAT basis:";
	texts["SI"]["text18"] = "VAT:";
	texts["SI"]["text19"] = "Total amount:";
	texts["SI"]["text20"] = "Knjižara Oliver is the official distributor of E-commerce Cosmetics for Croatian market.";
	texts["SI"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
	texts["SI"]["text22"] = "Discount";
	texts["SI"]["text23"] = "Online order no.:";
	texts["SI"]["text24"] = "SHIPPING ADDRESS";

	texts["CS"] = [];
	texts["CS"]["text1"] = "KNJIŽARA OLIVER d.o.o., Šetalište 150. brigade 8, 10000 Zagreb, Croatia | VAT ID: HR45786092231";
	texts["CS"]["text2"] = "INVOICE";
	texts["CS"]["text3"] = "Invoice date:"
	texts["CS"]["text6"] = "CUSTOMER";
	texts["CS"]["text7"] = "VAT ID:"
	texts["CS"]["text8"] = "Product Name";
	texts["CS"]["text9"] = "Quantity";
	texts["CS"]["text10"] = "Price";
	texts["CS"]["text11"] = "VAT";
	texts["CS"]["text12"] = "Total";
	texts["CS"]["text13"] = "Total:";
	texts["CS"]["text14"] = "Shipping:";
	texts["CS"]["text15"] = "Discount";
	texts["CS"]["text16"] = "Additional discount:";
	texts["CS"]["text17"] = "VAT basis:";
	texts["CS"]["text18"] = "VAT:";
	texts["CS"]["text19"] = "Total amount:";
	texts["CS"]["text20"] = "Knjižara Oliver is the official distributor of E-commerce Cosmetics for Croatian market.";
	texts["CS"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
	texts["CS"]["text22"] = "Discount";
	texts["CS"]["text23"] = "Online order no.:";
	texts["CS"]["text24"] = "SHIPPING ADDRESS";

	texts["SK"] = [];
	texts["SK"]["text1"] = "KNJIŽARA OLIVER d.o.o., Šetalište 150. brigade 8, 10000 Zagreb, Croatia | VAT ID: HR45786092231";
	texts["SK"]["text2"] = "INVOICE";
	texts["SK"]["text3"] = "Invoice date:"
	texts["SK"]["text6"] = "CUSTOMER";
	texts["SK"]["text7"] = "VAT ID:"
	texts["SK"]["text8"] = "Product Name";
	texts["SK"]["text9"] = "Quantity";
	texts["SK"]["text10"] = "Price";
	texts["SK"]["text11"] = "VAT";
	texts["SK"]["text12"] = "Total";
	texts["SK"]["text13"] = "Total:";
	texts["SK"]["text14"] = "Shipping:";
	texts["SK"]["text15"] = "Discount";
	texts["SK"]["text16"] = "Additional discount:";
	texts["SK"]["text17"] = "VAT basis:";
	texts["SK"]["text18"] = "VAT:";
	texts["SK"]["text19"] = "Total amount:";
	texts["SK"]["text20"] = "Knjižara Oliver is the official distributor of E-commerce Cosmetics for Croatian market.";
	texts["SK"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
	texts["SK"]["text22"] = "Discount";
	texts["SK"]["text23"] = "Online order no.:";
	texts["SK"]["text24"] = "SHIPPING ADDRESS";

	texts["HU"] = [];
	texts["HU"]["text1"] = "KNJIŽARA OLIVER d.o.o., Šetalište 150. brigade 8, 10000 Zagreb, Croatia | VAT ID: HR45786092231";
	texts["HU"]["text2"] = "INVOICE";
	texts["HU"]["text3"] = "Invoice date:"
	texts["HU"]["text6"] = "CUSTOMER";
	texts["HU"]["text7"] = "VAT ID:"
	texts["HU"]["text8"] = "Product Name";
	texts["HU"]["text9"] = "Quantity";
	texts["HU"]["text10"] = "Price";
	texts["HU"]["text11"] = "VAT";
	texts["HU"]["text12"] = "Total";
	texts["HU"]["text13"] = "Total:";
	texts["HU"]["text14"] = "Shipping:";
	texts["HU"]["text15"] = "Discount";
	texts["HU"]["text16"] = "Additional discount:";
	texts["HU"]["text17"] = "VAT basis:";
	texts["HU"]["text18"] = "VAT:";
	texts["HU"]["text19"] = "Total amount:";
	texts["HU"]["text20"] = "Knjižara Oliver is the official distributor of E-commerce Cosmetics for Croatian market.";
	texts["HU"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
	texts["HU"]["text22"] = "Discount";
	texts["HU"]["text23"] = "Online order no.:";
	texts["HU"]["text24"] = "SHIPPING ADDRESS";

	texts["CZ"] = [];
	texts["CZ"]["text1"] = "KNJIŽARA OLIVER d.o.o., Šetalište 150. brigade 8, 10000 Zagreb, Croatia | VAT ID: HR45786092231";
	texts["CZ"]["text2"] = "INVOICE";
	texts["CZ"]["text3"] = "Invoice date:"
	texts["CZ"]["text6"] = "CUSTOMER";
	texts["CZ"]["text7"] = "VAT ID:"
	texts["CZ"]["text8"] = "Product Name";
	texts["CZ"]["text9"] = "Quantity";
	texts["CZ"]["text10"] = "Price";
	texts["CZ"]["text11"] = "VAT";
	texts["CZ"]["text12"] = "Total";
	texts["CZ"]["text13"] = "Total:";
	texts["CZ"]["text14"] = "Shipping:";
	texts["CZ"]["text15"] = "Discount";
	texts["CZ"]["text16"] = "Additional discount:";
	texts["CZ"]["text17"] = "VAT basis:";
	texts["CZ"]["text18"] = "VAT:";
	texts["CZ"]["text19"] = "Total amount:";
	texts["CZ"]["text20"] = "Knjižara Oliver is the official distributor of E-commerce Cosmetics for Croatian market.";
	texts["CZ"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
	texts["CZ"]["text22"] = "Discount";
	texts["CZ"]["text23"] = "Online order no.:";
	texts["CZ"]["text24"] = "SHIPPING ADDRESS";

	texts["HR"] = [];
	texts["HR"]["text1"] = "KNJIŽARA OLIVER d.o.o., Šetalište 150. brigade 8, 10000 Zagreb, Croatia | VAT ID: HR45786092231";
	texts["HR"]["text2"] = "INVOICE";
	texts["HR"]["text3"] = "Invoice date:"
	texts["HR"]["text6"] = "CUSTOMER";
	texts["HR"]["text7"] = "VAT ID:"
	texts["HR"]["text8"] = "Product Name";
	texts["HR"]["text9"] = "Quantity";
	texts["HR"]["text10"] = "Price";
	texts["HR"]["text11"] = "VAT";
	texts["HR"]["text12"] = "Total";
	texts["HR"]["text13"] = "Total:";
	texts["HR"]["text14"] = "Shipping:";
	texts["HR"]["text15"] = "Discount";
	texts["HR"]["text16"] = "Additional discount:";
	texts["HR"]["text17"] = "VAT basis:";
	texts["HR"]["text18"] = "VAT:";
	texts["HR"]["text19"] = "Total amount:";
	texts["HR"]["text20"] = "Knjižara Oliver is the official distributor of E-commerce Cosmetics for Croatian market.";
	texts["HR"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
	texts["HR"]["text22"] = "Discount";
	texts["HR"]["text23"] = "Online order no.:";
	texts["HR"]["text24"] = "SHIPPING ADDRESS";

	texts["GB"] = [];
	texts["GB"]["text1"] = "KNJIŽARA OLIVER d.o.o., Šetalište 150. brigade 8, 10000 Zagreb, Croatia | VAT ID: HR45786092231";
	texts["GB"]["text2"] = "INVOICE";
	texts["GB"]["text3"] = "Invoice date:"
	texts["GB"]["text6"] = "CUSTOMER";
	texts["GB"]["text7"] = "VAT ID:"
	texts["GB"]["text8"] = "Product Name";
	texts["GB"]["text9"] = "Quantity";
	texts["GB"]["text10"] = "Price";
	texts["GB"]["text11"] = "VAT";
	texts["GB"]["text12"] = "Total";
	texts["GB"]["text13"] = "Total:";
	texts["GB"]["text14"] = "Shipping:";
	texts["GB"]["text15"] = "Discount";
	texts["GB"]["text16"] = "Additional discount:";
	texts["GB"]["text17"] = "VAT basis:";
	texts["GB"]["text18"] = "VAT:";
	texts["GB"]["text19"] = "Total amount:";
	texts["GB"]["text20"] = "Knjižara Oliver is the official distributor of E-commerce Cosmetics for Croatian market.";
	texts["GB"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
	texts["GB"]["text22"] = "Discount";
	texts["GB"]["text23"] = "Online order no.:";
	texts["GB"]["text24"] = "SHIPPING ADDRESS";


  var new_date = moment(invoice.date_added, "DD.MM.YYYY");
  new_date.add(30, 'days');
  var addedDiscounts = [];
  var header = `<html lang="GB">
    <head>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
      <title>Example 2</title>
      <link rel="stylesheet" href="style.css" media="all" />
      <style>
        html {
          width: 100%;
        }
        @font-face {
          font-family: 'Open Sans';
          font-style: normal;
          font-weight: 400;
          src: url('/fonts/OpenSans-Regular.woff2') format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        body {
          margin: 0 auto;
          color: black;
          background: #FFFFFF;
          font-size: 11px;
          font-family: 'Open Sans', sans-serif;
          border:3px solid #142135;
          padding: 30px 40px 40px;
          margin:30px;
        }

        .logo{
          width:180px;
        }

        .logo-cont{
          margin:0 auto;
          text-align:center
        }

        .right-add{
        }

        .right-add p{
          padding:0;
          margin-top:10px;
          text-align:center
        }

        .container{
          width:100%;
          margin:40px 0px 20px;
          position:relative;
        }

        .title-order{
          font-size:20px;
          border-bottom:2px solid #142135;
          padding-bottom:5px;
          margin-bottom:5px;
        }

        .float-l{
          float:left;
          padding-left:0;
          width:60%;
        }

         .gray-box{
					max-width:50%;
					width:50%;
          background-color:#eee;
          margin-top:20px;
          padding:10px;
          text-transform:uppercase;
          line-height:22px;
        }
           .gray-box b {
        line-height:25px;
        }

        .prod-table{
          margin-top:20px;
        }

        table{
          width: 100%;
          padding: 10px;
          margin-bottom:20px;
        }

        tr{
          line-height:20px;
        }


        td, th {
          font-size: 12px;
        }

       .bottom-gray{
          width:50%;
          float: right;
          background-color:#eee;
          margin-top:0px;
          padding:10px;
          text-transform:uppercase;
          line-height:22px;
          font-size:12px;
          font-weight:normal;
        }

         .for-payment{
            font-size: 13px;
            line-height: 40px;
            font-weight: bold;
        }


        .bottom-text{
          position:absolute;
          bottom:40px;
          text-align:center;
          width:75%;
          font-weight:bold;
          margin:0 auto;
        }

        .small-p{
          font-size:9px;
          margin-top:5px;
        }

        .bottom-content{
          margin-top:160px;
        }

        .bottom-direktor{
          margin-top:40px;
          text-align:right;
        }

        .bottom-direktor img{
          width:100px;
        }
        .flag {
        	height:32px;
        	width:32px;
        	margin:0 auto;
        	display:block;
        }
      </style>
    </head>
    <body>
      <div class="logo-cont">
        <img class="logo" src="https://admin.E-commerce.com/images/admin/lux.png">
      </div>
      <div class="right-add">
        <p class="small-p"><b>${texts[invoice.shipping_country]["text1"]}</b></p>
        <p class="small-p"><b>${texts[invoice.shipping_country]["text20"]}</b></p>
        <img class="flag" src="https://admin.E-commerce.com/images/admin/croatia.png" height="32px" width="32px">
      </div>
      <div class="container">
        <div class='title-order'>${texts[invoice.shipping_country]["text2"]}: #${order_id}</div>
        <div class='float-l'>
          <b> ${texts[invoice.shipping_country]["text3"]} </b> ${moment(invoice.date_added).format('DD. MM. YYYY')}<br/>
        </div>
        <table>
          <tr>
            ${invoice.payment_first_name && `<td >
              <div class='gray-box'>
                <b>${texts[invoice.shipping_country]["text6"]}</b><br>
                ${invoice.payment_first_name} ${invoice.payment_last_name}<br>
                ${invoice.payment_address}<br>
                ${invoice.payment_postcode} ${invoice.payment_city}<br>
                ${invoice.payment_country}
              </div>
            </td>` || ""}
            <td>
              <div class='gray-box'>
                <b>${texts[invoice.shipping_country]["text24"]}</b><br>
                ${invoice.shipping_first_name} ${invoice.shipping_last_name}<br>
                ${invoice.shipping_address}<br>
                ${invoice.shipping_postcode} ${invoice.shipping_city}<br>
                ${invoice.shipping_country}
              </div>
            </td>
          </tr>
        </table>
        <div class="prod-table">
          <table>
            <thead>
              <th style="text-align:left">${texts[invoice.shipping_country]["text8"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text9"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text10"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text22"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text11"]}</th>
              <th style="text-align:right">${texts[invoice.shipping_country]["text12"]}</th>
            </thead>
            <tbody>
              ${invoice.therapies.map(r => {
                var vithout_ddv1 = r.total_price / (((DDV / 100) + 1));
                var osnova_za_ddv = ((r.total_price * r.quantity) / (((DDV / 100) + 1)));
                var withPopust = osnova_za_ddv;

                var popust = 0;
                var count = 0;
                let found1 = addedDiscounts && addedDiscounts.find(a => {
                  return a === r.id
                }) || false
                if(invoice.additionalDiscountData && !found1) {
                  let found = invoice.additionalDiscountData.therapies && invoice.additionalDiscountData.therapies.find(t => {
                    return t.therapy_id === r.id
                  }) || false
                  if (found) {
                    popust = invoice.additionalDiscountData.discount_value
                    withPopust -= invoice.additional_discount;
                    addedDiscounts.push(r.id)
                  }
                }

                vithout_ddv += withPopust;

                return (
                  `<tr>
                    <td style="text-align:left;">${r.name}</td>
                    <td style="text-align:center">${r.quantity}</td>
                    <td style="text-align:center">${vithout_ddv1 && vithout_ddv1.toFixed(2)} ${invoice.currency_symbol} </td>
                    <td style="text-align: center">${popust} %</td>
                    <td style="text-align:center">${DDV} % </td>
                    <td style="text-align:right">${withPopust && withPopust.toFixed(2)} ${invoice.currency_symbol} </td>
                  </tr>`
                )
              }).join('')}
              ${invoice.accessories.map(r => {
                var osnova_za_ddv = r.reduced_price / (((DDV / 100) + 1));
                var popust = 0;
                var withPopust = osnova_za_ddv;
                if (r.isGift) {
                  popust = 100;
                  // discount_ddv += osnova_za_ddv;
                  withPopust = 0.00;
                }



                var count = 0;
                let found1 = addedDiscounts && addedDiscounts.find(a => {
                  return a === r.id
                }) || false
                if(invoice.additionalDiscountData && !found1) {
                  let found = invoice.additionalDiscountData.accessories && invoice.additionalDiscountData.accessories.find(t => {
                    return t.therapy_id === r.id
                  }) || false
                  if (found) {
                    popust = invoice.additionalDiscountData.discount_value
                    withPopust -= invoice.additional_discount;
                    addedDiscounts.push(r.id)
                  }
                }
                vithout_ddv += withPopust * r.quantity;
                return (
                  `<tr>
                    <td style="text-align:left;">${r.acc_name} - ${r.name}</td>
                    <td style="text-align:center">${r.quantity}</td>
                    <td style="text-align:center">${osnova_za_ddv && osnova_za_ddv.toFixed(2)} ${invoice.currency_symbol} </td>
                    <td style="text-align:center">${popust} % </td>
                    <td style="text-align:center">${DDV} % </td>
                    <td style="text-align:right">${withPopust && (withPopust * r.quantity).toFixed(2)} ${invoice.currency_symbol} </td>
                  </tr>`
                )
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class='bottom-gray' >
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text13"]}</div>
            <div style="float:right; width:30%; text-align:right">${vithout_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text14"]}</div>
            <div style="float:right; width:30%; text-align:right">${shipping_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          ${discount_name ?
            `<div class="bottom-pay">
              <div style="float:left; width:70%">${texts[invoice.shipping_country]["text15"]} (${discount_name}):</div>
              <div style="float:right; width:30%; text-align:right">${discount_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
            </div>` : ''
          }
          ${invoice.additional_discount_id  ?
           `<div class="bottom-pay">
              <div style="float:left; width:70%">${texts[invoice.shipping_country]["text16"]}</div>
              <div style="float:right; width:30%; text-align:right">${additional_discount_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
            </div>` : ''
          }
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text17"]}</div>
            <div style="float:right; width:30%; text-align:right">${all_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text18"]}</div>
            <div style="float:right; width:30%; text-align:right">${ddv_total.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          <div class="for-payment">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text19"]}</div>
            <div style="float:right; width:30%; text-align:right">${invoice.total.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
        </div>
      </div>
      <div class="bottom-text">
        ${texts[invoice.shipping_country]["text21"]}
      </div>


    </body>
  </html>
      `;
  // var footer = `</body></html>`
  html += header;
  //html += ``
  // html += footer;

  return html;
}

commonServices.prototype.makeProformaHtml =  function(invoice) {
  var html = ``;
	var current_year = new Date().getFullYear();
	var order_id = "01-" + invoice.order_id2 + "-" + current_year;
  var DDV = invoice.country_ddv;
  var vithout_ddv = 0;//invoice.subtotal - (invoice.subtotal * (DDV / 100));
  //console.log(vithout_ddv)
  var all_ddv = invoice.total / ((DDV / 100) + 1);
  var ddv_total = invoice.total - (invoice.total / ((DDV / 100) + 1));
  var shipping_ddv = invoice.shipping_fee / ((DDV / 100) + 1);
  var discount_ddv = invoice.ddiscount_value / ((DDV / 100) + 1);
	var discount_name;
	if (invoice.discount_id) {
		discount_name = invoice.discount.name;
	}

  var additional_discount_ddv = 0;
  if (invoice.additional_discount_id) {
    additional_discount_ddv = invoice.additional_discount / ((DDV / 100) + 1);
  }

  let texts = [];
  texts["SI"] = [];
	texts["SI"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | ID za DDV: PL5272861380";
  texts["SI"]["text2"] = "PREDRAČUN";
  texts["SI"]["text3"] = "Datum predračuna:"
  texts["SI"]["text6"] = "KUPEC";
  texts["SI"]["text7"] = "ID za DDV:"
  texts["SI"]["text8"] = "Naziv izdelka";
  texts["SI"]["text9"] = "Količina";
  texts["SI"]["text10"] = "Cena";
  texts["SI"]["text11"] = "DDV";
  texts["SI"]["text12"] = "Skupaj";
  texts["SI"]["text13"] = "Skupaj:";
  texts["SI"]["text14"] = "Strošek dostave:";
  texts["SI"]["text15"] = "Popust";
  texts["SI"]["text16"] = "Dodatni popust:";
  texts["SI"]["text17"] = "Osnova za DDV:";
  texts["SI"]["text18"] = "DDV (22%):";
  texts["SI"]["text19"] = "Skupni znesek:";
	texts["SI"]["text26"] = "Skupni znesek v EUR:";
  texts["SI"]["text20"] = "";
  texts["SI"]["text21"] = "01 777 41 07 | www.E-commerce.com | info@E-commerce.com";
  texts["SI"]["text22"] = "Popust";
  texts["SI"]["text23"] = "Št. spletnega naročila:";
  texts["SI"]["text24"] = "PREJEMNIK";
	texts["SI"]["text25"] = `<b>Plačilo na račun</b>:<br/>Magogija d.o.o., Kidriceva ulica 90, 3250 Rogaska Slatina, Slovenija<br/><b>IBAN</b>: BE33 9672 3409 8146<br/><b>SWIFT / BIC</b>: TRWIBEB1<br/><b>Referenca za plačilo</b>: SI00 ${order_id}<br/><b>Koda namena</b>: OTHR`;


	texts["SL"] = [];
	texts["SL"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | ID za DDV: PL5272861380";
	texts["SL"]["text2"] = "PREDRAČUN";
	texts["SL"]["text3"] = "Datum predračuna:"
	texts["SL"]["text6"] = "KUPEC";
	texts["SL"]["text7"] = "ID za DDV:"
	texts["SL"]["text8"] = "Naziv izdelka";
	texts["SL"]["text9"] = "Količina";
	texts["SL"]["text10"] = "Cena";
	texts["SL"]["text11"] = "DDV";
	texts["SL"]["text12"] = "Skupaj";
	texts["SL"]["text13"] = "Skupaj:";
	texts["SL"]["text14"] = "Strošek dostave:";
	texts["SL"]["text15"] = "Popust";
	texts["SL"]["text16"] = "Dodatni popust:";
	texts["SL"]["text17"] = "Osnova za DDV:";
	texts["SL"]["text18"] = "DDV (22%):";
	texts["SL"]["text19"] = "Skupni znesek:";
	texts["SL"]["text26"] = "Skupni znesek v EUR:";
	texts["SL"]["text20"] = "";
	texts["SL"]["text21"] = "01 777 41 07 | www.E-commerce.com | info@E-commerce.com";
	texts["SL"]["text22"] = "Popust";
	texts["SL"]["text23"] = "Št. spletnega naročila:";
  texts["SL"]["text24"] = "PREJEMNIK";
	texts["SL"]["text25"] = `<b>Plačilo na račun</b>:<br/>Magogija d.o.o., Kidriceva ulica 90, 3250 Rogaska Slatina, Slovenija<br/><b>IBAN</b>: BE33 9672 3409 8146<br/><b>SWIFT / BIC</b>: TRWIBEB1XXX<br/><b>Referenca za plačilo</b>: SI00 ${order_id}<br/><b>Koda namena</b>: OTHR`;

	texts["SK"] = [];
	texts["SK"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | DIČ: PL5272861380";
	texts["SK"]["text2"] = "ZÁLOHOVÁ FAKTÚRA";
	texts["SK"]["text3"] = "Dátum:"
	texts["SK"]["text6"] = "KUPUJÚCI";
	texts["SK"]["text7"] = "DIČ:"
	texts["SK"]["text8"] = "Produkt";
	texts["SK"]["text9"] = "Množstvo";
	texts["SK"]["text10"] = "Cena";
	texts["SK"]["text11"] = "DPH";
	texts["SK"]["text12"] = "Spolu";
	texts["SK"]["text13"] = "Spolu:";
	texts["SK"]["text14"] = "Náklady na dopravu:";
	texts["SK"]["text15"] = "Zľava";
	texts["SK"]["text16"] = "Dodatočná zľava:";
	texts["SK"]["text17"] = "Základ DPH:";
	texts["SK"]["text18"] = "DPH (20%):";
	texts["SK"]["text19"] = "Celková suma:";
	texts["SK"]["text26"] = "Celková suma v EUR:";
	texts["SK"]["text20"] = "";
	texts["SK"]["text21"] = "(421) 220 922 547 | www.E-commerce.com | info@E-commerce.com";
	texts["SK"]["text22"] = "Zľava";
	texts["SK"]["text23"] = "Číslo objednávky:";
  texts["SK"]["text24"] = "ODBERATEĽ";
	texts["SK"]["text25"] = `<b>Platba na účet</b>:<br/>Magogija d.o.o., Kidriceva ulica 90, 3250 Rogaska Slatina, Slovenija<br/><b>IBAN</b>: BE33 9672 3409 8146<br/><b>SWIFT / BIC</b>: TRWIBEB1XXX<br/><b>Variabilný symbol</b>: ${order_id}`;

	texts["CS"] = [];
	texts["CS"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | IČ pre DPH: PL5272861380";
	texts["CS"]["text2"] = "PŘEDFAKTURA";
	texts["CS"]["text3"] = "Datum:"
	texts["CS"]["text6"] = "KUPUJÍCÍ";
	texts["CS"]["text7"] = "IČ pre DPH:"
	texts["CS"]["text8"] = "Produkt";
	texts["CS"]["text9"] = "Množství";
	texts["CS"]["text10"] = "Cena";
	texts["CS"]["text11"] = "DPH";
	texts["CS"]["text12"] = "Spolu";
	texts["CS"]["text13"] = "Spolu:";
	texts["CS"]["text14"] = "Náklady na dopravu:";
	texts["CS"]["text15"] = "Sleva";
	texts["CS"]["text16"] = "Dodatečná sleva:";
	texts["CS"]["text17"] = "Základ DPH:";
	texts["CS"]["text18"] = "DPH (21%):";
	texts["CS"]["text19"] = "Celková suma:";
	texts["CS"]["text26"] = "Celková suma EUR:";
	texts["CS"]["text20"] = "";
	texts["CS"]["text21"] = "+420 296 182 861 | www.E-commerce.com | info@E-commerce.com";
	texts["CS"]["text22"] = "Sleva";
	texts["CS"]["text23"] = "Číslo objednávky:";
  texts["CS"]["text24"] = "ODBĚRATEL";
	texts["CS"]["text25"] = `<b>Platba na účet</b>:<br/>Magogija d.o.o., Kidriceva ulica 90, 3250 Rogaska Slatina, Slovenija<br/><b>IBAN</b>: BE33 9672 3409 8146<br/><b>SWIFT / BIC</b>: TRWIBEB1XXX<br/><b>Referenční číslo</b>: CZ00 ${order_id}`;

	texts["CZ"] = [];
	texts["CZ"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | IČ pre DPH: PL5272861380";
	texts["CZ"]["text2"] = "PŘEDFAKTURA";
	texts["CZ"]["text3"] = "Datum:"
	texts["CZ"]["text6"] = "KUPUJÍCÍ";
	texts["CZ"]["text7"] = "IČ pre DPH:"
	texts["CZ"]["text8"] = "Produkt";
	texts["CZ"]["text9"] = "Množství";
	texts["CZ"]["text10"] = "Cena";
	texts["CZ"]["text11"] = "DPH";
	texts["CZ"]["text12"] = "Spolu";
	texts["CZ"]["text13"] = "Spolu:";
	texts["CZ"]["text14"] = "Náklady na dopravu:";
	texts["CZ"]["text15"] = "Sleva";
	texts["CZ"]["text16"] = "Dodatečná sleva:";
	texts["CZ"]["text17"] = "Základ DPH:";
	texts["CZ"]["text18"] = "DPH (21%):";
	texts["CZ"]["text19"] = "Celková suma:";
	texts["CZ"]["text26"] = "Celková suma EUR:";
	texts["CZ"]["text20"] = "";
	texts["CZ"]["text21"] = "+420 296 182 861 | www.E-commerce.com | info@E-commerce.com";
	texts["CZ"]["text22"] = "Sleva";
	texts["CZ"]["text23"] = "Číslo objednávky:";
  texts["CZ"]["text24"] = "ODBĚRATEL";
	texts["CZ"]["text25"] = `<b>Platba na účet</b>:<br/>Magogija d.o.o., Kidriceva ulica 90, 3250 Rogaska Slatina, Slovenija<br/><b>IBAN</b>: BE33 9672 3409 8146<br/><b>SWIFT / BIC</b>: TRWIBEB1XXX<br/><b>Referenční číslo</b>: CZ00 ${order_id}`;



	texts["HU"] = [];
	texts["HU"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | ANUM: PL5272861380";
	texts["HU"]["text2"] = "AZ ELŐSZÁMLA SZÁMA";
	texts["HU"]["text3"] = "Kelt:"
	texts["HU"]["text6"] = "VEVŐ";
	texts["HU"]["text7"] = "ANUM:"
	texts["HU"]["text8"] = "Név";
	texts["HU"]["text9"] = "Mennyiség";
	texts["HU"]["text10"] = "Ár";
	texts["HU"]["text11"] = "ÁFA";
	texts["HU"]["text12"] = "Összesen";
	texts["HU"]["text13"] = "Összesen:";
	texts["HU"]["text14"] = "Szállítási költség:";
	texts["HU"]["text15"] = "Kedvezmény";
	texts["HU"]["text16"] = "További kedvezmény:";
	texts["HU"]["text17"] = "Adóalap:";
	texts["HU"]["text18"] = "ÁFA (27%):";
	texts["HU"]["text19"] = "Végösszeg:";
	texts["HU"]["text26"] = "Végösszeg EUR-ban:";
	texts["HU"]["text20"] = "";
	texts["HU"]["text21"] = "+36 19 995 353 | www.E-commerce.com | info@E-commerce.com";
	texts["HU"]["text22"] = "Kedvezmény";
	texts["HU"]["text23"] = "A rendelés száma:";
  texts["HU"]["text24"] = "CÍMZETT";
	texts["HU"]["text25"] = `<b>Fizetési részletek</b>:<br/>Magogija d.o.o., Kidriceva ulica 90, 3250 Rogaska Slatina, Slovenija<<br/><b>IBAN</b>: BE33 9672 3409 8146<br/><b>SWIFT / BIC</b>: TRWIBEB1XXX<br/><b>Fizetési hivatkozás</b>: ${order_id}`;


	texts["HR"] = [];
	texts["HR"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | PDV-ID: PL5272861380";
	texts["HR"]["text2"] = "PREDRAČUN";
	texts["HR"]["text3"] = "Datum predračuna:"
	texts["HR"]["text6"] = "KUPAC";
	texts["HR"]["text7"] = "PDV-ID:"
	texts["HR"]["text8"] = "Ime";
	texts["HR"]["text9"] = "Količina";
	texts["HR"]["text10"] = "Cijena";
	texts["HR"]["text11"] = "PDV";
	texts["HR"]["text12"] = "Ukupno";
	texts["HR"]["text13"] = "Ukupno:";
	texts["HR"]["text14"] = "Troškovi dostave:";
	texts["HR"]["text15"] = "Popust";
	texts["HR"]["text16"] = "Dodatni popust:";
	texts["HR"]["text17"] = "Osnova za PDV:";
	texts["HR"]["text18"] = "PDV (25%):";
	texts["HR"]["text19"] = "Ukupan iznos:";
	texts["HR"]["text26"] = "Ukupan iznos u EUR:";
	texts["HR"]["text20"] = "";
	texts["HR"]["text21"] = "01 330 93 65 | www.E-commerce.com | info@E-commerce.com";
	texts["HR"]["text22"] = "Popust";
	texts["HR"]["text23"] = "Br. narudžbe:";
  texts["HR"]["text24"] = "PRIMATELJ";
	texts["HR"]["text25"] = `<b>Plaćanje na račun</b>:<br/>Magogija d.o.o., Kidriceva ulica 90, 3250 Rogaska Slatina, Slovenija<br/><b>IBAN</b>: BE33 9672 3409 8146<br/><b>SWIFT / BIC</b>: TRWIBEB1XXX<br/><b>Referenca plaćanja</b>: ${order_id}`;


	texts["GB"] = [];
	texts["GB"]["text1"] = "Combokin Sp. z o.o., Grzybowska 87, 00-844 Warszawa, Poland | VAT ID: PL5272861380";
  texts["GB"]["text2"] = "PROFORMA";
  texts["GB"]["text3"] = "Proforma date:"
  texts["GB"]["text6"] = "CUSTOMER";
  texts["GB"]["text7"] = "VAT ID:"
  texts["GB"]["text8"] = "Product Name";
  texts["GB"]["text9"] = "Quantity";
  texts["GB"]["text10"] = "Price";
  texts["GB"]["text11"] = "VAT";
  texts["GB"]["text12"] = "Total";
  texts["GB"]["text13"] = "Total:";
  texts["GB"]["text14"] = "Shipping:";
  texts["GB"]["text15"] = "Discount";
  texts["GB"]["text16"] = "Additional discount:";
  texts["GB"]["text17"] = "VAT basis:";
  texts["GB"]["text18"] = "VAT:";
  texts["GB"]["text19"] = "Total amount:";
	texts["GB"]["text26"] = "Total amount in EUR:";
  texts["GB"]["text20"] = "According to the Law on Value Added Tax in Slovakia, VAT is calculated at a rate of 27%.";
  texts["GB"]["text21"] = "www.E-commerce.com | info@E-commerce.com";
  texts["GB"]["text22"] = "Discount";
  texts["GB"]["text23"] = "Online order no.:";
  texts["GB"]["text24"] = "SHIPPING ADDRESS";
	texts["GB"]["text25"] = `<b>Payment information</b>:<br/>Magogija d.o.o., Kidriceva ulica 90, 3250 Rogaska Slatina, Slovenija<br/><b>IBAN</b>: BE33 9672 3409 8146<br/><b>SWIFT / BIC</b>: TRWIBEB1XXX<br/><b>Payment reference</b>: ${order_id}`;


  var new_date = moment(invoice.date_added, "DD.MM.YYYY");
  new_date.add(30, 'days');
  var addedDiscounts = [];
  var header = `<html lang="GB">
    <head>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
      <title>Example 2</title>
      <link rel="stylesheet" href="style.css" media="all" />
      <style>
        html {
          width: 100%;
        }
        @font-face {
          font-family: 'Open Sans';
          font-style: normal;
          font-weight: 400;
          src: url('/fonts/OpenSans-Regular.woff2') format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        body {
          margin: 0 auto;
          color: black;
          background: #FFFFFF;
          font-size: 11px;
          font-family: 'Open Sans', sans-serif;
          border:3px solid #142135;
          padding: 30px 40px 40px;
          margin:30px;
        }

        .logo{
          width:180px;
        }

        .logo-cont{
          margin:0 auto;
          text-align:center
        }

        .right-add{
        }

        .right-add p{
          padding:0;
          margin-top:10px;
          text-align:center
        }

        .container{
          width:100%;
          margin:40px 0px 20px;
          position:relative;
        }

        .title-order{
          font-size:20px;
          border-bottom:2px solid #142135;
          padding-bottom:5px;
          margin-bottom:5px;
        }

        .float-l{
          float:left;
          padding-left:0;
          width:60%;
        }

        .gray-box{
					max-width:50%;
					width:50%;
          background-color:#eee;
          margin-top:20px;
          padding:10px;
          text-transform:uppercase;
          line-height:22px;
        }
           .gray-box b {
        line-height:25px;
        }


        .prod-table{
          margin-top:20px;
        }

        table{
          width: 100%;
          padding: 10px;
          margin-bottom:20px;
        }

        tr{
          line-height:20px;
        }


        td, th {
          font-size: 12px;
        }

        .bottom-gray{
          width:50%;
          float: right;
          background-color:#eee;
          margin-top:0px;
          padding:10px;
          text-transform:uppercase;
          line-height:22px;
          font-size:12px;
          font-weight:normal;
        }

         .for-payment{
            font-size: 13px;
            line-height: 40px;
            font-weight: bold;
        }


        .bottom-text{
          position:absolute;
          bottom:40px;
          text-align:center;
          width:75%;
          font-weight:bold;
          margin:0 auto;
        }

        .small-p{
          font-size: 9px;
        }

        .bottom-content{
          margin-top:130px;
        }

        .bottom-direktor{
          margin-top:40px;
          text-align:right;
        }

        .bottom-direktor img{
          width:100px;
        }
      </style>
    </head>
    <body>
      <div class="logo-cont">
        <img class="logo" src="https://admin.E-commerce.com/images/admin/lux.png">
      </div>
      <div class="right-add">
         <p class="small-p"><b>${texts[invoice.shipping_country]["text1"]}</b></p>
      </div>
      <div class="container">
        <div class='title-order'>${texts[invoice.shipping_country]["text2"]}: #${order_id}</div>
        <div class='float-l'>
          <b> ${texts[invoice.shipping_country]["text3"]} </b> ${moment(invoice.date_added).format('DD. MM. YYYY')}<br/>
        </div>
        <table>
          <tr>
            <td>
              <div class='gray-box'>
                <b>${texts[invoice.shipping_country]["text6"]}</b><br>
                ${invoice.payment_first_name} ${invoice.payment_last_name}<br>
                ${invoice.payment_address}<br>
                ${invoice.payment_postcode} ${invoice.payment_city}<br>
                ${invoice.payment_country}
              </div>
            </td>
            <td>
              <div class='gray-box'>
                <b>${texts[invoice.shipping_country]["text24"]}</b><br>
                ${invoice.shipping_first_name} ${invoice.shipping_last_name}<br>
                ${invoice.shipping_address}<br>
                ${invoice.shipping_postcode} ${invoice.shipping_city}<br>
                ${invoice.shipping_country}
              </div>
            </td>
          </tr>
        </table>
        <div class="prod-table">
          <table>
            <thead>
              <th style="text-align:left">${texts[invoice.shipping_country]["text8"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text9"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text10"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text22"]}</th>
              <th style="text-align:center">${texts[invoice.shipping_country]["text11"]}</th>
              <th style="text-align:right">${texts[invoice.shipping_country]["text12"]}</th>
            </thead>
            <tbody>
              ${invoice.therapies.map(r => {
                var vithout_ddv1 = r.total_price / (((DDV / 100) + 1));
                var osnova_za_ddv = ((r.total_price * r.quantity) / (((DDV / 100) + 1)));
                var withPopust = osnova_za_ddv;

                var popust = 0;
                var count = 0;
                let found1 = addedDiscounts && addedDiscounts.find(a => {
                  return a === r.id
                }) || false
                if(invoice.additionalDiscountData && !found1) {
                  let found = invoice.additionalDiscountData.therapies && invoice.additionalDiscountData.therapies.find(t => {
                    return t.therapy_id === r.id
                  }) || false
                  if (found) {
                    popust = invoice.additionalDiscountData.discount_value
                    withPopust -= invoice.additional_discount;
                    addedDiscounts.push(r.id)
                  }
                }

                vithout_ddv += withPopust;

                return (
                  `<tr>
                    <td style="text-align:left;">${r.name}</td>
                    <td style="text-align:center">${r.quantity}</td>
                    <td style="text-align:center">${vithout_ddv1 && vithout_ddv1.toFixed(2)} ${invoice.currency_symbol} </td>
                    <td style="text-align: center">${popust} %</td>
                    <td style="text-align:center">${DDV} % </td>
                    <td style="text-align:right">${withPopust && withPopust.toFixed(2)} ${invoice.currency_symbol} </td>
                  </tr>`
                )
              }).join('')}
              ${invoice.accessories.map(r => {
                var osnova_za_ddv = r.reduced_price / (((DDV / 100) + 1));
                var popust = 0;
                var withPopust = osnova_za_ddv;
                if (r.isGift) {
                  popust = 100;
                  // discount_ddv += osnova_za_ddv;
                  withPopust = 0.00;
                }



                var count = 0;
                let found1 = addedDiscounts && addedDiscounts.find(a => {
                  return a === r.id
                }) || false
                if(invoice.additionalDiscountData && !found1) {
                  let found = invoice.additionalDiscountData.accessories && invoice.additionalDiscountData.accessories.find(t => {
                    return t.therapy_id === r.id
                  }) || false
                  if (found) {
                    popust = invoice.additionalDiscountData.discount_value
                    withPopust -= invoice.additional_discount;
                    addedDiscounts.push(r.id)
                  }
                }
                vithout_ddv += withPopust * r.quantity;
                return (
                  `<tr>
                    <td style="text-align:left;">${r.acc_name} - ${r.name}</td>
                    <td style="text-align:center">${r.quantity}</td>
                    <td style="text-align:center">${osnova_za_ddv && osnova_za_ddv.toFixed(2)} ${invoice.currency_symbol} </td>
                    <td style="text-align:center">${popust} % </td>
                    <td style="text-align:center">${DDV} % </td>
                    <td style="text-align:right">${withPopust && (withPopust * r.quantity).toFixed(2)} ${invoice.currency_symbol} </td>
                  </tr>`
                )
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class='bottom-gray' >
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text13"]}</div>
            <div style="float:right; width:30%; text-align:right">${vithout_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text14"]}</div>
            <div style="float:right; width:30%; text-align:right">${shipping_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          ${discount_name ?
            `<div class="bottom-pay">
                <div style="float:left; width:70%">${texts[invoice.shipping_country]["text15"]} (${discount_name}):</div>
              <div style="float:right; width:30%; text-align:right">${discount_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
            </div>` : ''
          }
          ${invoice.additional_discount_id  ?
           `<div class="bottom-pay">
              <div style="float:left; width:70%">${texts[invoice.shipping_country]["text16"]}</div>
              <div style="float:right; width:30%; text-align:right">${additional_discount_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
            </div>` : ''
          }
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text17"]}</div>
            <div style="float:right; width:30%; text-align:right">${all_ddv.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          <div class="bottom-pay">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text18"]}</div>
            <div style="float:right; width:30%; text-align:right">${ddv_total.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
          <div class="for-payment">
            <div style="float:left; width:70%">${texts[invoice.shipping_country]["text19"]}</div>
            <div style="float:right; width:30%; text-align:right">${invoice.total.toFixed(2)} ${invoice.currency_symbol}</div>
          </div>
					${invoice.currency_symbol != "€" ?
						`<div class="for-payment">
							<div style="float:left; width:70%">${texts[invoice.shipping_country]["text26"]}</div>
							<div style="float:right; width:30%; text-align:right">${invoice.eur_value && invoice.eur_value.toFixed(2)} EUR</div>
						</div>
						` : ''
					}
        </div>
        <div class='bottom-content'>
					${texts[invoice.shipping_country]["text25"]}<br/><br/>
          ${texts[invoice.shipping_country]["text20"]}<br/><br/>
        </div>
      </div>
      <div class="bottom-text">
        ${texts[invoice.shipping_country]["text21"]}
      </div>


    </body>
  </html>
      `;
  html += header;

  return html;
}

module.exports = new commonServices();
