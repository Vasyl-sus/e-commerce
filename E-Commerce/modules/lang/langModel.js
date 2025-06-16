var pool = require('../../utils/mysqlService')
const fs = require('fs')
var path = require('path')
var bluebird = require('bluebird')
var uuid = require('uuid')

const sortBy = require('lodash/sortBy')

var Lang = function () {}

Lang.prototype.getCountry = country => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT *
                        FROM countries
                        WHERE name = ${connection.escape(country)}`

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })

  });
}

Lang.prototype.getDeliveryMethodByCode = code => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT *
                        FROM deliverymethods
                        WHERE code = ${connection.escape(code)}`

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })

  });
}

Lang.prototype.getDeliveryMethodById = code => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT *
                        FROM deliverymethods
                        WHERE id = ${connection.escape(code)}`

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })

  });
}

Lang.prototype.getCountryByFullName = country => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT *
                        FROM countries
                        WHERE full_name = ${connection.escape(country)}`

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })

  });
}

Lang.prototype.getLanguageModules = lang => {
  return new Promise((resolve, reject) => {
  if (lang) {
    lang = lang.toUpperCase()
  }
  var obj
  fs.readFile('./locales/' + lang + '/language.json', 'utf8', function (
    err,
    data,
  ) {
    if (err) {
      return reject(err);
    }
    obj = JSON.parse(data)
    resolve(obj)
  })

  });
}

Lang.prototype.getLangConfig = country => {
  return new Promise((resolve, reject) => {
  var obj
  fs.readFile(
    path.join(__dirname, '../../locales/langConfig.json'),
    'utf8',
    function (err, data) {
      if (err) {
        return reject(err);
      }
      obj = JSON.parse(data)
      resolve(obj[country] || [])
    },
  )

  });
}

Lang.prototype.getFullLangConfig = () => {
  return new Promise((resolve, reject) => {
  var obj
  fs.readFile(
    path.join(__dirname, '../../locales/langConfig.json'),
    'utf8',
    function (err, data) {
      if (err) {
        return reject(err);
      }
      obj = JSON.parse(data)
      resolve(obj || null)
    },
  )

  });
}

Lang.prototype.getLangNames = () => {
  return new Promise((resolve, reject) => {
  var obj
  fs.readFile(
    path.join(__dirname, '../../locales/langNames.json'),
    'utf8',
    function (err, data) {
      if (err) {
        return reject(err);
      }
      obj = JSON.parse(data)
      resolve(obj || null)
    },
  )

  });
}

Lang.prototype.getAllRoutes = () => {
  return new Promise((resolve, reject) => {
  var obj
  //console.log(path.join(__dirname, '../../locales/routes.json'))
  fs.readFile(
    path.join(__dirname, '../../locales/routes.json'),
    'utf8',
    function (err, data) {
      if (err) {
        return reject(err);
      }
      obj = JSON.parse(data)
      resolve(obj)
    },
  )

  });
}

Lang.prototype.getTherapiesByCountrySEO = (country, lang, seo) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `SELECT DISTINCT t.*, tp.product_id, pp.name as product_name, tp.product_quantity, pct.description as product_desc, pct.display_name as product_name_long
        FROM therapies as t
        INNER JOIN therapies_products as tp on tp.therapy_id = t.id
        INNER JOIN productcategories as pc on t.category = pc.name
        INNER JOIN productcategories_translations as pct on pct.category_id = pc.id
        INNER JOIN products as pp on tp.product_id = pp.id
        WHERE t.country=${connection.escape(country)}
        AND t.language=${connection.escape(lang)}
        AND pct.link_name=${connection.escape(seo)}
        AND t.active=1
        AND (tp.product_quantity = 1 OR tp.product_quantity = 2 OR tp.product_quantity = 3) ORDER BY t.total_price ASC`

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      //console.log(JSON.stringify(rows));
      var therapies = rows
      var therapies_ids = therapies.map(therapy => {
        return connection.escape(therapy.id)
      })
      if (therapies[0]) {
        var sql_select_therapies_images = `SELECT ti.* FROM therapies_images as ti WHERE ti.therapy_id IN (${therapies_ids.join()});`
        connection.query(sql_select_therapies_images, (err, rows) => {
          connection.release()
          if (err) {
            return reject(err);
          }

          for (var i = 0; i < therapies.length; i++) {
            for (var h = 0; h < rows.length; ++h) {
              if (therapies[i].id == rows[h].therapy_id) {
                if (rows[h].profile_img == 1) {
                  therapies[i].display_image = {
                    id: rows[h].id,
                    name: rows[h].name,
                    type: rows[h].type,
                    link: rows[h].link,
                  }
                }
                if (rows[h].pattern_img == 1) {
                  therapies[i].pattern_image = {
                    id: rows[h].id,
                    name: rows[h].name,
                    type: rows[h].type,
                    link: rows[h].link,
                  }
                }
                if (rows[h].background_img == 1) {
                  therapies[i].background_image = {
                    id: rows[h].id,
                    name: rows[h].name,
                    type: rows[h].type,
                    link: rows[h].link,
                  }
                }
              }
            }
          }

          resolve(therapies)
        })
      } else {
        connection.release()
        resolve(rows)
      }
    })
  })

  });
}

Lang.prototype.getTherapiesByCountry = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `SELECT t.*
        FROM therapies as t
        INNER JOIN therapies_products as tp on tp.therapy_id = t.id
        WHERE t.country=${connection.escape(country)}
        AND t.language=${connection.escape(lang)}
        AND t.active=1
        AND (tp.product_quantity = 1 OR tp.product_quantity = 2 OR tp.product_quantity = 3) `

    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      //console.log(JSON.stringify(rows));
      var therapies = rows
      var therapies_ids = therapies.map(therapy => {
        return connection.escape(therapy.id)
      })
      if (therapies[0]) {
        var sql_select_therapies_images = `SELECT ti.* FROM therapies_images as ti WHERE ti.therapy_id IN (${therapies_ids.join()});`
        connection.query(sql_select_therapies_images, (err, rows) => {
          connection.release()
          if (err) {
            return reject(err);
          }

          for (var i = 0; i < therapies.length; i++) {
            for (var h = 0; h < rows.length; ++h) {
              if (therapies[i].id == rows[h].therapy_id) {
                if (rows[h].profile_img == 1) {
                  therapies[i].display_image = {
                    id: rows[h].id,
                    name: rows[h].name,
                    type: rows[h].type,
                    link: rows[h].link,
                  }
                }
                if (rows[h].pattern_img == 1) {
                  therapies[i].pattern_image = {
                    id: rows[h].id,
                    name: rows[h].name,
                    type: rows[h].type,
                    link: rows[h].link,
                  }
                }
                if (rows[h].background_img == 1) {
                  therapies[i].background_image = {
                    id: rows[h].id,
                    name: rows[h].name,
                    type: rows[h].type,
                    link: rows[h].link,
                  }
                }
              }
            }
          }

          resolve(therapies)
        })
      } else {
        connection.release()
        resolve(rows)
      }
    })
  })

  });
}

Lang.prototype.getTherapiesByCountryONE = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `SELECT t.*, tp.product_quantity
        FROM therapies as t
        INNER JOIN therapies_products as tp on tp.therapy_id = t.id
        WHERE t.country=${connection.escape(country)}
        AND t.language=${connection.escape(lang)}
        AND t.active=1
        AND (tp.product_quantity = 1 OR tp.product_quantity = 2 OR tp.product_quantity = 3) `

    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      var therapies = []
      let th1 = rows.find(r => {
        return r.category === 'eyelash' && r.product_quantity === 1
      })
      let th2 = rows.find(r => {
        return r.category === 'cream' && r.product_quantity === 1
      })
      let th3 = rows.find(r => {
        return r.category === 'tattoo' && r.product_quantity === 1
      })
      let th4 = rows.find(r => {
        return r.category === 'caviar' && r.product_quantity === 1
      })
      let th5 = rows.find(r => {
        return r.category === 'aqua' && r.product_quantity === 1
      })
      let th6 = rows.find(r => {
        return r.category === 'royal' && r.product_quantity === 1
      })
      let th7 = rows.find(r => {
        return r.category === 'procollagen' && r.product_quantity === 1
      })

      therapies = [th1, th2, th3, th4, th5, th6, th7]

      var therapies_ids = therapies.map(therapy => {
        if (therapy) return connection.escape(therapy.id)
      })
      if (therapies[0]) {
        var sql_select_therapies_images = `SELECT ti.* FROM therapies_images as ti WHERE ti.therapy_id IN (${therapies_ids.join()});`
        connection.query(sql_select_therapies_images, (err, rows) => {
          connection.release()
          if (err) {
            return reject(err);
          }

          for (var i = 0; i < therapies.length; i++) {
            for (var h = 0; h < rows.length; ++h) {
              if (therapies[i].id == rows[h].therapy_id) {
                if (rows[h].profile_img == 1) {
                  therapies[i].display_image = {
                    id: rows[h].id,
                    name: rows[h].name,
                    type: rows[h].type,
                    link: rows[h].link,
                  }
                }
                if (rows[h].pattern_img == 1) {
                  therapies[i].pattern_image = {
                    id: rows[h].id,
                    name: rows[h].name,
                    type: rows[h].type,
                    link: rows[h].link,
                  }
                }
                if (rows[h].background_img == 1) {
                  therapies[i].background_image = {
                    id: rows[h].id,
                    name: rows[h].name,
                    type: rows[h].type,
                    link: rows[h].link,
                  }
                }
              }
            }
          }

          resolve(therapies)
        })
      } else {
        connection.release()
        resolve(rows)
      }
    })
  })

  });
}

Lang.prototype.getDeliverymethodsByCountry = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT *
                      FROM deliverymethods
                      WHERE country = ${connection.escape(country)}
                      AND active=1 AND is_other = 0`

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      var deliverymethods = rows
      var dm_ids = rows.map(d => {
        return connection.escape(d.id)
      })
      if (dm_ids && dm_ids.length > 0) {
        var sql_select1 = `SELECT * FROM deliverymethods_images WHERE deliverymethod_id IN (${dm_ids.join()})`

        connection.query(sql_select1, (err, rows1) => {
          connection.release()
          if (err) {
            return reject(err);
          }
          for (var i = 0; i < deliverymethods.length; i++) {
            deliverymethods[i].post_image =
              rows1.find(img => {
                return deliverymethods[i].id == img.deliverymethod_id
              }) || null

            if (
              deliverymethods[i] &&
              deliverymethods[i].translations &&
              deliverymethods[i].translations != ''
            ) {
              deliverymethods[i].translations = JSON.parse(
                deliverymethods[i].translations,
              )
            }
            deliverymethods[i].display_code =
              (deliverymethods[i].translations &&
                deliverymethods[i].translations[lang]) ||
              deliverymethods[i].code
            delete deliverymethods[i].translations
          }
          resolve(deliverymethods)
        })
      } else {
        connection.release()
        resolve(deliverymethods)
      }
    })
  })

  });
}

Lang.prototype.getPaymentmethodsByCountry = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT p.*
                      FROM paymentmethods as p
                      INNER JOIN paymentmethods_countries as pc ON p.id=pc.paymentmethod_id
                      INNER JOIN countries as c ON c.id=pc.country_id
                      WHERE c.name = ${connection.escape(country)}
                      AND p.active=1
                      AND p.is_other=0`

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      var paymentmethods = rows
      var pm_ids = rows.map(p => {
        return connection.escape(p.id)
      })
      if (pm_ids && pm_ids.length > 0) {
        var sql_select1 = `SELECT * FROM paymentmethods_images WHERE paymentmethod_id IN (${pm_ids.join()})`

        connection.query(sql_select1, (err, rows1) => {
          connection.release()
          if (err) {
            return reject(err);
          }
          for (var i = 0; i < paymentmethods.length; i++) {
            paymentmethods[i].post_image =
              rows1.find(img => {
                return paymentmethods[i].id == img.paymentmethod_id
              }) || null
            if (
              paymentmethods[i] &&
              paymentmethods[i].translations &&
              paymentmethods[i].translations != ''
            ) {
              paymentmethods[i].translations = JSON.parse(
                paymentmethods[i].translations,
              )
            }

            paymentmethods[i].display_title =
              (paymentmethods[i].translations &&
                paymentmethods[i].translations[lang.toUpperCase()]) ||
              paymentmethods[i].title
            delete paymentmethods[i].translations
          }
          resolve(paymentmethods)
        })
      } else {
        connection.release()
        resolve(paymentmethods)
      }
    })
  })

  });
}

Lang.prototype.getCurrencyByCountry = country => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT curr.*
                      FROM currencies as curr
                      INNER JOIN currencies_countries as cc ON curr.id=cc.currency_id
                      INNER JOIN countries as c ON c.id=cc.country_id
                      WHERE c.name = ${connection.escape(country)}`

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })

  });
}

Lang.prototype.getReviews = route => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT r.* FROM reviews as r
                        INNER JOIN productcategories_translations as pct on pct.link_name = ${connection.escape(
                          route,
                        )}
                        INNER JOIN productcategories as pc on pc.id = pct.category_id
                        INNER JOIN products as p on p.category = pc.name
                        INNER JOIN review_products as rp on rp.product_id = p.id
                        WHERE rp.review_id = r.id  AND r.active = 1 AND pct.lang = r.lang`

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows)
    })
  })

  });
}

Lang.prototype.getTestimonialsProduct = (country, lang, url) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT ut.* FROM user_testimonials as ut
                      WHERE ut.country = ${connection.escape(country)} and ut.lang = ${connection.escape(lang)}
                      and category = (SELECT pc.name
                            FROM productcategories as pc
                            INNER JOIN productcategories_translations as pct ON pc.id = pct.category_id
                      where pct.link_name = '${url}');`
    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows)
    })
  })

  });
}

Lang.prototype.getReviewGrade = route => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    let sql_select_sum = `SELECT SUM(r.grade) / count(r.id) as avg_num, count(r.id) as count FROM reviews as r
                    INNER JOIN productcategories_translations as pct on pct.link_name = ${connection.escape(
                      route,
                    )}
                    INNER JOIN productcategories as pc on pc.id = pct.category_id
                    INNER JOIN products as p on p.category = pc.name
                    INNER JOIN review_products as rp on rp.product_id = p.id
                    WHERE rp.review_id = r.id AND r.active = 1 AND pct.lang = r.lang`
    connection.query(sql_select_sum, (err, rows1) => {
      connection.release()
      if (err) {
        return reject(err);
      }

      resolve({ grade: rows1[0].avg_num, count: rows1[0].count })
    })
  })

  });
}

Lang.prototype.getStickyNote = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT *
                      FROM sticky_notes
                      WHERE country = ${connection.escape(country)}
                      AND language = ${connection.escape(lang)}
                      AND NOW() >= DATE(from_date)
                      AND NOW() <= DATE(to_date)
                      AND active = 1`

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })

  });
}

Lang.prototype.getTestimonialsBYUrl = (country, lang, url) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `select t.*
        FROM testimonials as t
        WHERE country=${connection.escape(country)}
        AND language=${connection.escape(lang)} `
    if (url) {
      sql_select += `AND url=${connection.escape(url)}`
    }

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }

      if (rows[0]) {
        var testimonials = rows
        var testimonial_ids = rows.map(x => {
          return connection.escape(x.id)
        })

        var sql_select_therapies = `SELECT tt.* FROM testimonials_therapies as tt WHERE tt.testimonial_id IN (${testimonial_ids.join()})`

        connection.query(sql_select_therapies, (err, therapies) => {
          if (err) {
            connection.release()
            return reject(err);
          }

          for (var i = 0; i < testimonials.length; ++i) {
            testimonials[i].therapies =
              (therapies &&
                therapies.filter(t => {
                  return testimonials[i].id == t.testimonial_id
                })) ||
              []
          }

          var sql_select_images = `SELECT ti.* FROM testimonials_images as ti WHERE ti.testimonial_id IN (${testimonial_ids.join()})`

          connection.query(sql_select_images, (err, images) => {
            if (err) {
              connection.release()
              return reject(err);
            }

            for (var i = 0; i < testimonials.length; ++i) {
              testimonials[i].images =
                (images &&
                  images.filter(img => {
                    return testimonials[i].id == img.testimonial_id
                  })) ||
                []
            }

            var sql_select_productcategories = `SELECT tt.testimonial_id, tt.therapy_id, pc.id as pc_id, pc.name as pc_name, pc.sort_order, pc.css_class_name, pct.lang, pct.display_name, pct.link_name, pct.description as translation_description
                                                            FROM testimonials_therapies as tt
                                                            INNER JOIN productcategories as pc ON tt.therapy_id = pc.id
                                                            INNER JOIN productcategories_translations as pct ON pc.id = pct.category_id
                                                            WHERE pct.lang = ${connection.escape(
                                                              lang,
                                                            )} AND tt.testimonial_id IN (${testimonial_ids.join()})`

            connection.query(
              sql_select_productcategories,
              (err, productcategories) => {
                if (err) {
                  connection.release()
                  return reject(err);
                }

                if (productcategories[0]) {
                  var productcategories_ids = productcategories.map(pc => {
                    return pc.pc_id
                  })

                  var sql_select_productcategories_images = `SELECT * FROM productcategories_images as pci WHERE pci.category_id IN (${
                    "'" + productcategories_ids.join("','") + "'"
                  })`
                  var sql_select_productcategories_translations = `SELECT * FROM productcategories_translations as pct WHERE pct.lang = ${connection.escape(
                    lang,
                  )} AND pct.category_id IN (${
                    "'" + productcategories_ids.join("','") + "'"
                  })`

                  connection.beginTransaction = bluebird.promisify(
                    connection.beginTransaction,
                  )
                  connection.query = bluebird.promisify(connection.query)
                  connection.rollback = bluebird.promisify(connection.rollback)
                  connection
                    .beginTransaction()
                    .then(() => {
                      var queries = []
                      queries.push(
                        connection.query(sql_select_productcategories_images),
                      )
                      // queries.push(connection.query(sql_select_productcategories_translations));
                      return bluebird.all(queries)
                    })
                    .then(results => {
                      for (var i = 0; i < productcategories.length; ++i) {
                        productcategories[i].images =
                          (results[0] &&
                            results[0]
                              .filter(img => {
                                return (
                                  productcategories[i].pc_id == img.category_id
                                )
                              })
                              .map(img_details => {
                                if (img_details.profile_img == 1) {
                                  img_details.profile_img = 1
                                  img_details.background_img = 0
                                  img_details.pattern_img = 0
                                  img_details.additional_img = 0
                                } else if (img_details.profile_img == 2) {
                                  img_details.profile_img = 0
                                  img_details.background_img = 1
                                  img_details.pattern_img = 0
                                  img_details.additional_img = 0
                                } else if (img_details.profile_img == 3) {
                                  img_details.profile_img = 0
                                  img_details.background_img = 0
                                  img_details.pattern_img = 1
                                  img_details.additional_img = 0
                                } else if (img_details.profile_img == 4) {
                                  img_details.profile_img = 0
                                  img_details.background_img = 0
                                  img_details.pattern_img = 0
                                  img_details.additional_img = 1
                                }

                                return img_details
                              })) ||
                          []
                        // productcategories[i].translations = results[1] && results[1].filter(t=>{return productcategories[i].pc_id == t.category_id}) || [];
                      }
                      for (var i = 0; i < testimonials.length; ++i) {
                        testimonials[i].productcategories =
                          productcategories.filter(pc => {
                            return testimonials[i].id == pc.testimonial_id
                          }) || []
                      }
                      return connection.commit()
                    })
                    .then(() => {
                      connection.release()
                      resolve(testimonials)
                      return
                    })
                    .catch(err => {
                      return connection.rollback().then(() => {
                        connection.release()
                        return reject(err);
                      })
                    })
                } else {
                  for (let i = 0; i < testimonials.length; ++i) {
                    testimonials[i].productcategories = []
                  }
                  connection.release()
                  resolve(testimonials)
                }
              },
            )
          })
        })
      } else {
        connection.release()
        resolve(rows)
      }
    })
  })
  });
}

Lang.prototype.getTestimonials = (country, lang, url, flag = false) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `select t.*
        FROM testimonials as t
        INNER JOIN productcategories as pc on pc.name = t.category
        INNER JOIN productcategories_translations as pct on pct.category_id = pc.id
        WHERE country=${connection.escape(country)}
        AND language=${connection.escape(lang)} `
    if (url) {
      sql_select += `AND pct.link_name=${connection.escape(url)} `
    }
    if (flag) {
      sql_select += `AND t.show_home=1 `
    }
    sql_select += `group by t.id`
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }

      if (rows[0]) {
        var testimonials = rows
        var testimonial_ids = rows.map(x => {
          return connection.escape(x.id)
        })

        var sql_select_therapies = `SELECT tt.* FROM testimonials_therapies as tt WHERE tt.testimonial_id IN (${testimonial_ids.join()})`

        connection.query(sql_select_therapies, (err, therapies) => {
          if (err) {
            connection.release()
            return reject(err);
          }

          for (var i = 0; i < testimonials.length; ++i) {
            testimonials[i].therapies =
              (therapies &&
                therapies.filter(t => {
                  return testimonials[i].id == t.testimonial_id
                })) ||
              []
          }

          var sql_select_images = `SELECT ti.* FROM testimonials_images as ti WHERE ti.testimonial_id IN (${testimonial_ids.join()})`

          connection.query(sql_select_images, (err, images) => {
            if (err) {
              connection.release()
              return reject(err);
            }

            for (var i = 0; i < testimonials.length; ++i) {
              testimonials[i].images =
                (images &&
                  images.filter(img => {
                    return testimonials[i].id == img.testimonial_id
                  })) ||
                []
            }

            var sql_select_productcategories = `SELECT tt.testimonial_id, tt.therapy_id, pc.id as pc_id, pc.name as pc_name, pc.sort_order, pc.css_class_name, pct.lang, pct.display_name, pct.link_name, pct.description as translation_description
                                                            FROM testimonials_therapies as tt
                                                            INNER JOIN productcategories as pc ON tt.therapy_id = pc.id
                                                            INNER JOIN productcategories_translations as pct ON pc.id = pct.category_id
                                                            WHERE pct.lang = ${connection.escape(
                                                              lang,
                                                            )} AND tt.testimonial_id IN (${testimonial_ids.join()})`

            connection.query(
              sql_select_productcategories,
              (err, productcategories) => {
                if (err) {
                  connection.release()
                  return reject(err);
                }

                if (productcategories[0]) {
                  var productcategories_ids = productcategories.map(pc => {
                    return pc.pc_id
                  })

                  var sql_select_productcategories_images = `SELECT * FROM productcategories_images as pci WHERE pci.category_id IN (${
                    "'" + productcategories_ids.join("','") + "'"
                  })`
                  var sql_select_productcategories_translations = `SELECT * FROM productcategories_translations as pct WHERE pct.lang = ${connection.escape(
                    lang,
                  )} AND pct.category_id IN (${
                    "'" + productcategories_ids.join("','") + "'"
                  })`

                  connection.beginTransaction = bluebird.promisify(
                    connection.beginTransaction,
                  )
                  connection.query = bluebird.promisify(connection.query)
                  connection.rollback = bluebird.promisify(connection.rollback)
                  connection
                    .beginTransaction()
                    .then(() => {
                      var queries = []
                      queries.push(
                        connection.query(sql_select_productcategories_images),
                      )
                      // queries.push(connection.query(sql_select_productcategories_translations));
                      return bluebird.all(queries)
                    })
                    .then(results => {
                      for (var i = 0; i < productcategories.length; ++i) {
                        productcategories[i].images =
                          (results[0] &&
                            results[0]
                              .filter(img => {
                                return (
                                  productcategories[i].pc_id == img.category_id
                                )
                              })
                              .map(img_details => {
                                if (img_details.profile_img == 1) {
                                  img_details.profile_img = 1
                                  img_details.background_img = 0
                                  img_details.pattern_img = 0
                                  img_details.additional_img = 0
                                } else if (img_details.profile_img == 2) {
                                  img_details.profile_img = 0
                                  img_details.background_img = 1
                                  img_details.pattern_img = 0
                                  img_details.additional_img = 0
                                } else if (img_details.profile_img == 3) {
                                  img_details.profile_img = 0
                                  img_details.background_img = 0
                                  img_details.pattern_img = 1
                                  img_details.additional_img = 0
                                } else if (img_details.profile_img == 4) {
                                  img_details.profile_img = 0
                                  img_details.background_img = 0
                                  img_details.pattern_img = 0
                                  img_details.additional_img = 1
                                }

                                return img_details
                              })) ||
                          []
                        // productcategories[i].translations = results[1] && results[1].filter(t=>{return productcategories[i].pc_id == t.category_id}) || [];
                      }
                      for (var i = 0; i < testimonials.length; ++i) {
                        testimonials[i].productcategories =
                          productcategories.filter(pc => {
                            return testimonials[i].id == pc.testimonial_id
                          }) || []
                      }
                      return connection.commit()
                    })
                    .then(() => {
                      connection.release()
                      resolve(testimonials)
                      return
                    })
                    .catch(err => {
                      return connection.rollback().then(() => {
                        connection.release()
                        return reject(err);
                      })
                    })
                } else {
                  for (let i = 0; i < testimonials.length; ++i) {
                    testimonials[i].productcategories = []
                  }
                  connection.release()
                  resolve(testimonials)
                }
              },
            )
          })
        })
      } else {
        connection.release()
        resolve(rows)
      }
    })
  })
  });
}

Lang.prototype.getAllCountries = () => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT *
                      FROM countries`

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      var countries = rows
      var langNames
      fs.readFile(
        path.join(__dirname, '../../locales/langNames.json'),
        'utf8',
        function (err, data) {
          if (err) {
            return reject(err);
          }
          langNames = JSON.parse(data)

          var langConfig
          fs.readFile(
            path.join(__dirname, '../../locales/langConfig.json'),
            'utf8',
            function (err, data, langNames) {
              if (err) {
                return reject(err);
              }
              langConfig = JSON.parse(data)
              for (var i = 0; i < countries.length; i++) {
                countries[i].langs = langConfig[countries[i].name] || []
                for (var j = 0; j < countries[i].langs.length; j++) {
                  countries[i].langs[j] = {
                    name: countries[i].langs[j],
                    full_name: this.langNames[countries[i].langs[j]],
                  }
                }
              }
              resolve(countries)
            }.bind({
              langNames: langNames,
            }),
          )
        },
      )
    })
  })

  });
}

Lang.prototype.getPharmacies = (country, city) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }
    var sql_select = `SELECT *
    FROM pharmacies
    WHERE country=${connection.escape(country)} `
    if (city) {
      sql_select += `AND city=${connection.escape(city)} `
    }
    sql_select += `ORDER BY city, name `

    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      var pharmacies = rows
      var pharmacy_ids = rows.map(x => {
        return connection.escape(x.id)
      })

      //console.log(image_ids);
      if (pharmacies[0]) {
        var sql_select_images = `SELECT * FROM pharmacies_images WHERE pharmacy_id IN (${pharmacy_ids.join()})`
        connection.query(sql_select_images, (err, rows) => {
          connection.release()
          if (err) {
            return reject(err);
          }

          for (var i = 0; i < pharmacies.length; i++) {
            pharmacies[i].post_image = rows.find(y => {
              return y.pharmacy_id == pharmacies[i].id
            })
          }

          resolve(pharmacies)
        })
      } else {
        connection.release()
        resolve(rows)
      }
    })
  })

  });
}

Lang.prototype.getPharmaciesCount = (country, city) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }
    var sql_select = `SELECT COUNT(id) as count
    FROM pharmacies
    WHERE country=${connection.escape(country)} `
    if (city) {
      sql_select += `AND city=${connection.escape(city)} `
    }

    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0].count)
    })
  })

  });
}

Lang.prototype.getPymentMethodByCode = code => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }
    var sql_select = `SELECT *
        FROM paymentmethods
        WHERE code=${connection.escape(code)} `

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })

  });
}

Lang.prototype.getPharmacyCitiesByCountry = country => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT DISTINCT city
    FROM pharmacies
    WHERE country=${connection.escape(country)}`

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }

      var cities = rows.map(r => {
        return r.city
      })
      resolve(cities)
    })
  })

  });
}

Lang.prototype.getMediums = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    var sql_select = `SELECT * FROM mediums
        WHERE country=${connection.escape(
          country,
        )} AND language=${connection.escape(lang)} ORDER BY sort_order`

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      var ids = rows.map(r => {
        return connection.escape(r.id)
      })
      if (ids.length > 0) {
        var sql_select_images = `SELECT * FROM mediums_images WHERE medium_id IN (${ids.join(
          ',',
        )})`
        connection.query(sql_select_images, (err, images) => {
          connection.release()
          if (err) {
            return reject(err);
          }
          for (let i = 0; i < rows.length; i++) {
            let item = rows[i]
            let image = images.find(im => {
              return im.medium_id == item.id && im.profile_img == 1
            })
            let imagess = images.filter(im => {
              return im.medium_id == item.id && im.profile_img == 0
            })
            item.profile_image = image
            item.images = imagess
          }
          resolve(rows)
        })
      } else {
        connection.release()
        for (let i = 0; i < rows.length; i++) {
          let item = rows[i]
          let image = {}
          let imagess = []
          item.profile_image = image
          item.images = imagess
        }
        resolve(rows)
      }
    })
  })

  });
}

Lang.prototype.getCountryByName = name => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }
    var sql_select = `SELECT *
    FROM countries
    WHERE name = ${connection.escape(name)}`
    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })

  });
}

Lang.prototype.getStarredBlogposts = (country, lang, slider) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    if (slider && slider != null && slider != undefined) {
      var sql_select = `SELECT b.*
            FROM blogposts as b
            WHERE b.id IS NOT NULL
            AND b.slider=1
            AND b.country=${connection.escape(country)}
            AND b.language=${connection.escape(lang)} `
    } else {
      var sql_select = `SELECT b.*
            FROM blogposts as b
            WHERE b.id IS NOT NULL
            AND b.starred=1
            AND b.country=${connection.escape(country)}
            AND b.language=${connection.escape(lang)} `
    }

    sql_select += 'ORDER BY b.date_added DESC LIMIT 0,4'

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }

      if (rows[0]) {
        var blogposts = rows
        var blogpost_ids = rows.map(x => {
          return connection.escape(x.id)
        })

        var sql_select_bi = `SELECT * FROM blogposts_images WHERE blogpost_id IN (${blogpost_ids.join()}) `
        var sql_select_bc = `SELECT * FROM blogposts_categories WHERE blogpost_id IN (${blogpost_ids.join()}) `
        var sql_select_bt = `SELECT * FROM blogposts_tags WHERE blogpost_id IN (${blogpost_ids.join()}) `
        var sql_select_ba = `SELECT ba.blogpost_id, a.*, ai.id as img_id, ai.accessory_id, ai.profile_img, ai.name as img_name, ai.type, ai.link FROM blogposts_accessories as ba
                              INNER JOIN accessories as a ON ba.accessory_id = a.id
                              LEFT JOIN accessories_images as ai ON a.id = ai.accessory_id
                              WHERE blogpost_id IN (${blogpost_ids.join()}) `
        var sql_select_bth = `SELECT bt.blogpost_id, t.*, ti.id as img_id,ti.therapy_id, ti.profile_img, ti.name as img_name, ti.type, ti.link, ti.pattern_img, ti.background_img FROM blogposts_therapies as bt
                                INNER JOIN therapies as t ON bt.therapy_id = t.id
                                LEFT JOIN therapies_images as ti ON t.id = ti.therapy_id
                                WHERE blogpost_id IN (${blogpost_ids.join()}) `

        connection.beginTransaction = bluebird.promisify(
          connection.beginTransaction,
        )
        connection.query = bluebird.promisify(connection.query)
        connection.rollback = bluebird.promisify(connection.rollback)
        connection
          .beginTransaction()
          .then(() => {
            var queries = []
            queries.push(connection.query(sql_select_bi))
            queries.push(connection.query(sql_select_bc))
            queries.push(connection.query(sql_select_bt))
            //queries.push(connection.query(sql_select_ba));
            //queries.push(connection.query(sql_select_bth));
            return bluebird.all(queries)
          })
          .then(results => {
            for (var i = 0; i < blogposts.length; i++) {
              blogposts[i].profile_image =
                (results[0] &&
                  results[0].filter(r => {
                    return (
                      r.profile_img == 1 && r.blogpost_id == blogposts[i].id
                    )
                  })) ||
                null
              blogposts[i].big_image =
                (results[0] &&
                  results[0].filter(r => {
                    return (
                      r.profile_img == 2 && r.blogpost_id == blogposts[i].id
                    )
                  })) ||
                null
              blogposts[i].images =
                (results[0] &&
                  results[0].filter(r => {
                    return (
                      r.profile_img == 0 && r.blogpost_id == blogposts[i].id
                    )
                  })) ||
                []
              blogposts[i].categories =
                (results[1] &&
                  results[1]
                    .filter(r => {
                      return r.blogpost_id == blogposts[i].id
                    })
                    .map(r => {
                      return r.category
                    })) ||
                []
              blogposts[i].tags =
                (results[2] &&
                  results[2]
                    .filter(r => {
                      return r.blogpost_id == blogposts[i].id
                    })
                    .map(r => {
                      return r.tag
                    })) ||
                []

              blogposts[i].accessories =
                (results[3] &&
                  results[3].filter(r => {
                    return r.blogpost_id == blogposts[i].id
                  })) ||
                []
              blogposts[i].therapies =
                (results[4] &&
                  results[4].filter(r => {
                    return r.blogpost_id == blogposts[i].id
                  })) ||
                []

              if (blogposts[i].accessories.length > 0) {
                let accessories_ids = [
                  ...new Set(
                    blogposts[i].accessories.map(accessory => accessory.id),
                  ),
                ]
                var accessories_holder = []
                for (var j = 0; j < accessories_ids.length; ++j) {
                  var singleAccessory = {}
                  var singleAccessoryImages = []
                  for (var k = 0; k < blogposts[i].accessories.length; ++k) {
                    if (accessories_ids[j] == blogposts[i].accessories[k].id) {
                      singleAccessory.id = blogposts[i].accessories[k].id
                      singleAccessory.name = blogposts[i].accessories[k].name
                      singleAccessory.description =
                        blogposts[i].accessories[k].description
                      singleAccessory.regular_price =
                        blogposts[i].accessories[k].regular_price
                      singleAccessory.reduced_price =
                        blogposts[i].accessories[k].reduced_price
                      singleAccessory.country =
                        blogposts[i].accessories[k].country
                      singleAccessory.seo_link =
                        blogposts[i].accessories[k].seo_link
                      singleAccessory.meta_title =
                        blogposts[i].accessories[k].meta_title
                      singleAccessory.meta_description =
                        blogposts[i].accessories[k].meta_description
                      singleAccessory.language =
                        blogposts[i].accessories[k].language
                      singleAccessory.product_id =
                        blogposts[i].accessories[k].product_id

                      let img = {
                        id: blogposts[i].accessories[k].img_id,
                        accessory_id: blogposts[i].accessories[k].accessory_id,
                        profile_img: blogposts[i].accessories[k].profile_img,
                        link: blogposts[i].accessories[k].link,
                        type: blogposts[i].accessories[k].type,
                        name: blogposts[i].accessories[k].img_name,
                      }
                      singleAccessoryImages.push(img)
                    }
                  }
                  singleAccessory.images = singleAccessoryImages
                  accessories_holder.push(singleAccessory)
                }
                blogposts[i].accessories = accessories_holder
              }

              if (blogposts[i].therapies.length > 0) {
                let therapies_ids = [
                  ...new Set(blogposts[i].therapies.map(therapy => therapy.id)),
                ]
                var therapies_holder = []
                for (var j = 0; j < therapies_ids.length; ++j) {
                  var singleTherapy = {}
                  var singleTherapyImages = []
                  for (var k = 0; k < blogposts[i].therapies.length; ++k) {
                    if (therapies_ids[j] == blogposts[i].therapies[k].id) {
                      singleTherapy.id = blogposts[i].therapies[k].id
                      singleTherapy.blogpost_id =
                        blogposts[i].therapies[k].blogpost_id
                      singleTherapy.date_added =
                        blogposts[i].therapies[k].date_added
                      singleTherapy.total_price =
                        blogposts[i].therapies[k].total_price
                      singleTherapy.seo_link =
                        blogposts[i].therapies[k].seo_link
                      singleTherapy.country = blogposts[i].therapies[k].country
                      singleTherapy.view_label =
                        blogposts[i].therapies[k].view_label
                      singleTherapy.meta_title =
                        blogposts[i].therapies[k].meta_title
                      singleTherapy.meta_description =
                        blogposts[i].therapies[k].meta_description
                      singleTherapy.language =
                        blogposts[i].therapies[k].language
                      singleTherapy.title_color =
                        blogposts[i].therapies[k].title_color

                      let img = {
                        id: blogposts[i].therapies[k].img_id,
                        therapy_id: blogposts[i].therapies[k].therapy_id,
                        profile_img: blogposts[i].therapies[k].profile_img,
                        pattern_img: blogposts[i].therapies[k].pattern_img,
                        background_img:
                          blogposts[i].therapies[k].background_img,
                        link: blogposts[i].therapies[k].link,
                        type: blogposts[i].therapies[k].type,
                        img_name: blogposts[i].therapies[k].img_name,
                      }
                      singleTherapyImages.push(img)
                    }
                  }
                  singleTherapy.images = singleTherapyImages
                  therapies_holder.push(singleTherapy)
                }
                blogposts[i].therapies = therapies_holder
              }
            }
            return connection.commit()
          })
          .then(() => {
            connection.release()
            resolve(blogposts)
            return
          })
          .catch(err => {
            return connection.rollback().then(() => {
              connection.release()
              return reject(err);
            })
          })
      } else {
        connection.release()
        resolve(rows)
      }
    })
  })

  });
}

Lang.prototype.getActiveBillboard = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }
    var sql_select = `SELECT b.*, bi.id as image_id, bi.name, bi.type, bi.link as image_link FROM billboard as b
                      LEFT JOIN billboard_images as bi ON b.id = bi.billboard_id
                      WHERE b.active = 1
                      AND b.country = ${connection.escape(country)}
                      AND b.lang = ${connection.escape(lang)} `

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows)
    })
  })

  });
}

Lang.prototype.getAccOptions = accessories => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var ids = []
    accessories.map(acc => {
      ids.push(connection.escape(acc.category))
    })

    let sql_select_products_query = `SELECT * FROM products WHERE category IN (${ids.join(
      ',',
    )}) AND active = 1`

    connection.query(sql_select_products_query, (err, rows1) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      let options = rows1

      for (let i = 0; i < accessories.length; i++) {
        let option = options.filter(o => {
          return o.category === accessories[i].category
        })
        accessories[i].options = option
      }
      var ids = rows1.map(r => {
        return connection.escape(r.id)
      })
      let select_product_images = `SELECT * FROM products_images WHERE product_id IN (${ids.join(
        ',',
      )})`
      connection.query(select_product_images, (err, rows3) => {
        connection.release()
        if (err) {
          return reject(err);
        }
        for (let i = 0; i < accessories.length; i++) {
          accessories[i].options.map(option => {
            let product_image = rows3.find(i => {
              return i.product_id === option.id
            })

            if (product_image) {
              option.profile_image = product_image
            }
          })
        }

        resolve(accessories)
      })
    })
  })
  });
}

Lang.prototype.getFullAccessories = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `SELECT * FROM accessories WHERE is_gift = 1 AND country = ${connection.escape(
      country,
    )} AND lang = ${connection.escape(lang)} ORDER BY min_order_total ASC`

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      var accessories = rows
      let sql_select_products_query = `SELECT pt.name as name, p.id, p.date_added, p.category, p.sort_order FROM products as p
                                            INNER JOIN product_translations as pt on pt.product_id = p.id
                                            WHERE pt.lang = ${connection.escape(
                                              lang,
                                            )} AND p.active = 1`
      connection.query(sql_select_products_query, (err, rows1) => {
        if (err) {
          connection.release()
          return reject(err);
        }
        let options = rows1
        let accids = []

        for (let i = 0; i < accessories.length; i++) {
          let option = options.filter(o => {
            return o.category === accessories[i].category
          })
          option = sortBy(option, o => {
            return o.sort_order
          })
          accessories[i].options = option
          accids.push(connection.escape(accessories[i].id))
        }

        var ids = rows1.map(r => {
          return connection.escape(r.id)
        })
        if (accids.length > 0) {
          let sql_select_acc_images = `SELECT * FROM accessories_images WHERE accessory_id IN (${accids.join(
            ',',
          )})`
          connection.query(sql_select_acc_images, (err, rows2) => {
            if (err) {
              connection.release()
              return reject(err);
            }
            for (let i = 0; i < accessories.length; i++) {
              let profile = rows2.find(r => {
                return r.profile_img && r.accessory_id === accessories[i].id
              })
              let other = rows2.filter(r => {
                return !r.profile_img && r.accessory_id === accessories[i].id
              })
              accessories[i].profile_image = profile
              accessories[i].images = other
            }
            if (ids.length > 0) {
              let select_product_images = `SELECT * FROM products_images WHERE product_id IN (${ids.join(
                ',',
              )})`
              connection.query(select_product_images, (err, rows3) => {
                connection.release()
                if (err) {
                  return reject(err);
                }
                for (let i = 0; i < accessories.length; i++) {
                  accessories[i].options.map(option => {
                    let product_image = rows3.find(i => {
                      return i.product_id === option.id
                    })

                    if (product_image) {
                      option.profile_image = product_image
                    }
                  })
                }

                resolve(accessories)
              })
            } else {
              connection.release()
              resolve(accessories)
            }
          })
        } else {
          connection.release()
          resolve(accessories)
        }
      })
    })
  })
  });
}

Lang.prototype.getAccessories = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }
    var sql_select = `SELECT *
        FROM accessories
        WHERE status='1'
        AND country=${connection.escape(country)}
        AND lang=${connection.escape(lang)} order by sort_order`

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }

      if (rows[0]) {
        var accessories = rows
        var accessory_ids = rows.map(x => {
          return connection.escape(x.id)
        })

        var sql_select_ai = `SELECT ai.* FROM accessories_images as ai WHERE ai.accessory_id IN(${accessory_ids.join()}) `
        connection.query(sql_select_ai, (err, rows) => {
          connection.release()
          if (err) {
            return reject(err);
          }

          for (var i = 0; i < accessories.length; i++) {
            accessories[i].profile_image =
              rows.find(r => {
                return r.profile_img == 1 && r.accessory_id == accessories[i].id
              }) || null
            accessories[i].product_image =
              rows.find(r => {
                return (
                  r.product_image == 1 && r.accessory_id == accessories[i].id
                )
              }) || null
            accessories[i].images = rows.filter(r => {
              return r.profile_img == 0 && r.accessory_id == accessories[i].id
            })
          }

          resolve(accessories)
        })
      } else {
        connection.release()
        resolve(rows)
      }
    })
  })

  });
}


Lang.prototype.getIGfeeds = (country, lang) => {
  return new Promise((resolve, reject) => {;
  var igfeedsIds = [];
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_select = `SELECT igf.*
                      FROM instagram_feed as igf
                      INNER JOIN instagram_feed_countries as igc on igc.instagram_feed_id = igf.id
                      WHERE igf.showed=1 AND igc.country = ${connection.escape(country)}
                      LIMIT 0,5;`;

    connection.query(sql_select, (err, igfeeds) => {
      if (err) {
        connection.release();
        return reject(err);
      }

      igfeedsIds = igfeeds.map(f => f.id);

      if (igfeedsIds.length === 0) {
        connection.release();
        resolve([]);
        return;
      }

      var sql_Select_images_i = `SELECT * FROM instagram_feed_images as ifg
            WHERE ifg.ig_feed_id in (${igfeedsIds.map(id => connection.escape(id)).join(',')})`;

      connection.query(sql_Select_images_i, (err, igfeedsimages) => {
        if (err) {
          connection.release();
          return reject(err);
        }

        var sql_select_accessories = `select ifa.instagram_feed_id, ifa.accessory_id as ifa_accessory_id,
                                            a.id as accessory_id, a.name, a.description, a.regular_price, a.reduced_price, a.seo_link, a.meta_title, a.meta_description,
                                            a.category, a.product_id,
                                            ai.id as img_id, ai.accessory_id as img_accessory_id, ai.profile_img, ai.name as img_name, ai.type, ai.link
                                            from instagram_feed_accessories as ifa
                                            inner join accessories as a on ifa.accessory_id = a.id
                                            left join accessories_images as ai on a.id = ai.accessory_id
                                            WHERE a.country = ${connection.escape(country)} AND a.lang = ${connection.escape(lang)} AND  ifa.instagram_feed_id IN (${igfeedsIds.map(id => connection.escape(id)).join(',')})`;

        connection.query(sql_select_accessories, (err, accessories) => {
          if (err) {
            connection.release();
            return reject(err);
          }
          for (var i = 0; i < igfeeds.length; ++i) {
            igfeeds[i].accessories = [];
            igfeeds[i].bigImage = igfeedsimages.find(ig => ig.ig_feed_id === igfeeds[i].id && ig.imageType === 'big');
            igfeeds[i].smallImage = igfeedsimages.find(ig => ig.ig_feed_id === igfeeds[i].id && ig.imageType === 'small');
            let found = accessories.filter(a => a.instagram_feed_id === igfeeds[i].id && a.profile_img === 1);
            if (found) {
              found.map(f => {
                let img = {
                  id: f.img_id,
                  profile_img: f.profile_img,
                  name: f.img_name,
                  type: f.type,
                  link: f.link,
                  accessory_id: f.img_accessory_id,
                };
                f.images = [img];
                delete f.img_id;
                delete f.profile_img;
                delete f.img_name;
                delete f.type;
                delete f.link;
                delete f.img_accessory_id;
                igfeeds[i].accessories.push(f);
              });
            }
          }

          var sql_select_products = `SELECT ift.instagram_feed_id, pc.*, pct.display_name, pct.link_name, pct.description FROM instagram_feed_therapies as ift
                    LEFT JOIN productcategories as pc on pc.id = ift.therapy_id
                    INNER JOIN productcategories_translations as pct on pc.id = pct.category_id
                    WHERE ift.instagram_feed_id IN (${igfeedsIds.map(id => connection.escape(id)).join(',')}) AND pct.lang = ${connection.escape(lang)}`;
          connection.query(sql_select_products, (err, categories) => {
            if (err) {
              connection.release();
              return reject(err);
            }

            var category_ids = categories.map(c => c.id);

            if (categories.length > 0) {
              var sql_select_images = `SELECT pci.*
                            FROM productcategories_images as pci
                            WHERE pci.category_id IN (${category_ids.map(id => connection.escape(id)).join(',')})`;

              connection.query(sql_select_images, (err, rows) => {
                connection.release();
                if (err) {
                  return reject(err);
                }
                for (var i = 0; i < categories.length; i++) {
                  categories[i].profile_image = rows.find(r => r.category_id == categories[i].id && r.profile_img == 1) || null;
                  categories[i].background_image = rows.find(r => r.category_id == categories[i].id && r.profile_img == 2) || null;
                  categories[i].pattern_image = rows.find(r => r.category_id == categories[i].id && r.profile_img == 3) || null;
                  categories[i].additional_image = rows.find(r => r.category_id == categories[i].id && r.profile_img == 4) || null;
                }
                for (var i = 0; i < igfeeds.length; ++i) {
                  let found = categories.filter(c => c.instagram_feed_id == igfeeds[i].id);
                  if (found) igfeeds[i].products = found;
                }
                resolve(igfeeds);
              });
            } else {
              connection.release();
              resolve(igfeeds);
            }
          });
        });
      });
    });
  });

  });;
};




Lang.prototype.getTherapiesBy = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err)
      return reject(err);
    }
    //, IF(meta_title = ${connection.escape(data.meta_title)}, 'product', 'category') AS query_type
    var sql_select = `SELECT t.*, ti.id as img_id, ti.name as img_name, ti.type as img_type, ti.link as img_link
        FROM therapies as t
        LEFT JOIN productcategories as pc on pc.name = t.category
        LEFT JOIN productcategories_translations as pct on (pct.category_id = pc.id AND pct.lang = t.language)
        LEFT JOIN therapies_images as ti ON (ti.therapy_id=t.id AND ti.profile_img=1)
        WHERE t.id IS NOT NULL
        AND t.active = 1
        AND t.country = ${connection.escape(data.country)}
        AND t.language = ${connection.escape(data.language)}
        AND pct.link_name = ${connection.escape(data.seo_link)}`

    // for (var k in data) {
    //     sql_select += `AND t.${k}=${connection.escape(data[k])} `;
    // }

    connection.query(sql_select, function (err, rows) {
      connection.release()
      if (err) {
        return reject(err);
      }
      var therapies = rows
      for (var i = 0; i < therapies.lenth; i++) {
        therapies[i].display_image =
          (therapies[i].img_id && {
            id: therapies[i].img_id,
            name: therapies[i].img_name,
            type: therapies[i].img_type,
            link: therapies[i].img_link,
          }) ||
          null
        delete therapies[i].img_id
        delete therapies[i].img_name
        delete therapies[i].img_type
        delete therapies[i].img_link
      }
      therapies = sortBy(therapies, function (t) {
        return t.total_price
      })
      var sorted = []
      for (var i = 0; i < 3; i++) {
        if (therapies[i]) {
          sorted.push(therapies[i])
        }
      }
      resolve(sorted)
    })
  })

  });
}

Lang.prototype.getOtoTherapiesIdsByOrderId = id => {
  return new Promise((resolve, reject) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `select oth.therapy_id, oth.oto_id, o.time, o.additional_text, o.discount from orders_therapies as ot
        inner join oto_offer_on as oto on ot.therapy_id = oto.therapy_id
        inner join oto_therapies as oth on oto.oto_id = oth.oto_id
        inner join oto_payments as otp on oto.oto_id = otp.oto_id
        inner join oto as o on oth.oto_id = o.id
        inner join orders as ord on ord.id = ${connection.escape(id)}
        where ot.order_id = ${connection.escape(
          id,
        )} AND otp.payment_method_id = ord.payment_method_id`

    connection.query(sql_select, function (err, therapies) {
      connection.release()
      if (err) {
        return reject(err);
      }

      resolve(therapies)
    })
  })

  });
}

Lang.prototype.getTherapiesByIds = ids => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `SELECT t.*, ti.id as img_id, ti.name as img_name, ti.type as img_type, ti.link as img_link
        FROM therapies as t
        LEFT JOIN therapies_images as ti ON (ti.therapy_id=t.id AND ti.profile_img=1)
        WHERE t.id IS NOT NULL AND t.id IN (${"'" + ids.join("','") + "'"})`

    connection.query(sql_select, function (err, rows) {
      connection.release()
      if (err) {
        return reject(err);
      }
      var therapies = rows
      for (var i = 0; i < therapies.lenth; i++) {
        therapies[i].display_image =
          (therapies[i].img_id && {
            id: therapies[i].img_id,
            name: therapies[i].img_name,
            type: therapies[i].img_type,
            link: therapies[i].img_link,
          }) ||
          null
        delete therapies[i].img_id
        delete therapies[i].img_name
        delete therapies[i].img_type
        delete therapies[i].img_link
      }
      resolve(therapies)
    })
  })

  });
}

Lang.prototype.getOtoAccessoriesByOtoIds = ids => {
  return new Promise((resolve, reject) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `select oa.oto_id, oa.accessory_id as oto_accessory_id, a.id, a.name, a.description, a.regular_price, a.reduced_price, a.seo_link, a.category,
        ai.id as img_id, ai.accessory_id as img_accessory_id, ai.profile_img, ai.name as img_name, ai.type, ai.link from accessories as a
        inner join accessories_images as ai on a.id = ai.accessory_id
        inner join oto_accessories as oa on a.id = oa.accessory_id
        where oa.oto_id IN (${"'" + ids.join("','") + "'"})`
    connection.query(sql_select, function (err, accessories) {
      connection.release()
      if (err) {
        return reject(err);
      }

      resolve(accessories)
    })
  })

  });
}

Lang.prototype.getProductCategories = (lang, country) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }
    var sql_select = `SELECT pc.*, pct.display_name, pct.link_name, pct.description
      FROM productcategories as pc
      INNER JOIN productcategories_translations as pct ON pc.id = pct.category_id
      WHERE pct.lang=${connection.escape(lang)}
      ORDER BY pc.sort_order `

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      //var queryLang = (country+"-"+lang).toLowerCase();

      var categories = rows
      var category_ids = categories.map(c => {
        return c.id
      })

      if (categories.length > 0) {
        var sql_select_images = `SELECT pci.*
            FROM productcategories_images as pci
            WHERE pci.category_id IN (${connection.escape(category_ids)}) `

        connection.query(sql_select_images, (err, rows) => {
          connection.release()
          if (err) {
            return reject(err);
          }

          for (var i = 0; i < categories.length; i++) {
            categories[i].profile_image =
              rows.find(r => {
                return r.category_id == categories[i].id && r.profile_img == 1
              }) || null
            categories[i].background_image =
              rows.find(r => {
                return r.category_id == categories[i].id && r.profile_img == 2
              }) || null
            categories[i].pattern_image =
              rows.find(r => {
                return r.category_id == categories[i].id && r.profile_img == 3
              }) || null
            categories[i].additional_image =
              rows.find(r => {
                return r.category_id == categories[i].id && r.profile_img == 4
              }) || null
          }

          resolve(categories)
        })
      } else {
        connection.release()
        resolve(categories)
      }
    })
  })

  });
}

Lang.prototype.getOrderDetailsById = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `SELECT o.*
      FROM orders as o
      WHERE o.id in (${connection.escape(id)}) `
    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows)
    })
  })
  });
}

Lang.prototype.getTherapyById = (id, oto_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `SELECT t.*, (SELECT o.discount FROM oto as o WHERE o.id = ${connection.escape(
      oto_id,
    )}) as discount FROM therapies as t WHERE t.id = ${connection.escape(id)} `

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })
  });
}

Lang.prototype.getAccessoryById = (id, oto_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `SELECT a.*, (SELECT o.discount FROM oto as o WHERE o.id = ${connection.escape(
      oto_id,
    )}) as discount FROM accessories as a WHERE a.id = ${connection.escape(
      id,
    )} `

    connection.query(sql_select, (err, rows) => {
      connection.release()
      if (err) {
        return reject(err);
      }
      resolve(rows[0])
    })
  })
  });
}

Lang.prototype.getAccessoriesByCategory = (seo_link, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select = `SELECT * FROM accessories WHERE seo_link = ${connection.escape(
      seo_link,
    )} AND lang = ${connection.escape(lang)} limit 1`

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release()
        return reject(err);
      }
      var accessories = rows[0]
      if (accessories) {
        let acccat = []
        let sql_select_products_query = `SELECT * FROM products WHERE category = ${connection.escape(
          accessories.category,
        )} AND active=1 order by sort_order`

        connection.query(sql_select_products_query, (err, rows1) => {
          if (err) {
            connection.release()
            return reject(err);
          }
          accessories = { ...accessories, options: rows1 }

          let sql_select_acc_images = `SELECT * FROM accessories_images WHERE accessory_id = ${connection.escape(
            accessories.id,
          )}`
          connection.query(sql_select_acc_images, (err, rows2) => {
            if (err) {
              connection.release()
              return reject(err);
            }
            let profile = rows2.find(r => {
              return r.profile_img
            })
            let product = rows2.find(r => {
              return r.product_image
            })
            let other = rows2.filter(r => {
              return !r.profile_img
            })
            accessories = { ...accessories, profile_image: profile }
            accessories = { ...accessories, product_image: product }
            accessories = { ...accessories, images: other }

            var oids = rows1.map(r => {
              return connection.escape(r.id)
            })
            let sql_select_products_t = `SELECT * FROM product_translations WHERE lang = ${connection.escape(
              lang,
            )} AND product_id IN (${oids.join(',')})`
            var ids = rows1.map(r => {
              return connection.escape(r.id)
            })
            if (oids.length > 0) {
              connection.query(sql_select_products_t, (err, t) => {
                if (err) {
                  connection.release()
                  return reject(err);
                }

                t.map(tt => {
                  let found = accessories.options.find(o => {
                    return tt.product_id === o.id
                  })

                  if (found) {
                    found.name = tt.name
                  }
                })

                let select_product_images = `SELECT * FROM products_images WHERE product_id IN (${ids.join(
                  ',',
                )})`
                connection.query(select_product_images, (err, rows3) => {
                  connection.release()
                  if (err) {
                    return reject(err);
                  }

                  accessories.options.map(option => {
                    let product_image = rows3.find(i => {
                      return i.product_id === option.id
                    })

                    if (product_image) {
                      option.profile_image = product_image
                    }
                  })

                  resolve(accessories)
                })
              })
            } else {
              connection.release()
              resolve(accessories)
            }
          })
        })
      } else {
        connection.release()
        resolve({})
      }
    })
  })
  });
}

Lang.prototype.addItemToOrder = (
  order_id,
  item,
  item_type,
  shipping_fee,
  newtotal,
) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }
    connection.beginTransaction = bluebird.promisify(
      connection.beginTransaction,
    )
    connection.query = bluebird.promisify(connection.query)
    connection.rollback = bluebird.promisify(connection.rollback)
    connection
      .beginTransaction()
      .then(() => {
        var queries = []
        if (item_type == 'therapy') {
          var sql_order_therapy = `INSERT INTO orders_therapies (order_id, therapy_id, quantity, oto)
                VALUES (${connection.escape(order_id)}, ${connection.escape(
            item.id,
          )}, 1, 1)`

          var sql_update_order = `UPDATE orders SET subtotal = subtotal + ${connection.escape(
            item.total_price,
          )}, `

          if (newtotal == null) {
            sql_update_order += `total = total + ${connection.escape(
              item.total_price,
            )}`
          } else {
            sql_update_order += `total = total + ${connection.escape(
              item.total_price - newtotal,
            )}`
          }
          if (shipping_fee != null) {
            sql_update_order += `, shipping_fee = 0`
          }

          sql_update_order += ` WHERE id = ${connection.escape(order_id)}`

          queries.push(connection.query(sql_order_therapy))
          queries.push(connection.query(sql_update_order))
        } else if (item_type == 'accessory') {
          var sql_order_accessory = `INSERT INTO orders_accessories (order_id, accessory_id, quantity, oto, accessory_product_id)
                VALUES (${connection.escape(order_id)}, ${connection.escape(
            item.id,
          )}, 1, 1, ${connection.escape(item.product_id)})`

          var sql_update_order = `UPDATE orders SET subtotal = subtotal + ${connection.escape(
            item.reduced_price,
          )}, `

          if (newtotal == null) {
            sql_update_order += `total = total + ${connection.escape(
              item.reduced_price,
            )}`
          } else {
            sql_update_order += `total = total + ${connection.escape(
              item.reduced_price - newtotal,
            )}`
          }

          if (shipping_fee != null) {
            sql_update_order += `, shipping_fee = 0`
          }

          sql_update_order += ` WHERE id = ${connection.escape(order_id)}`

          queries.push(connection.query(sql_order_accessory))
          queries.push(connection.query(sql_update_order))
        }

        return bluebird.all(queries)
      })
      .then(results => {
        return connection.commit()
      })
      .then(() => {
        connection.release()
        resolve()
        return
      })
      .catch(err => {
        return connection.rollback().then(() => {
          connection.release()
          return reject(err);
        })
      })
  })
  });
}

Lang.prototype.createIndividualDiscountForOto = (
  discount,
  item_id,
  item_type,
) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err)
      return reject(err);
    }

    var sql_select_order_history = `SELECT data FROM orderhistory WHERE order_id = ${connection.escape(
      discount.order_id,
    )}`

    connection.query(sql_select_order_history, (err, orderHistory) => {
      if (err) {
        connection.release();
        return reject(err);
      }

      var data = JSON.parse(orderHistory[0].data)

      data.total = Number(data.total) + Number(discount.discount_price)

      data = JSON.stringify(data)

      connection.beginTransaction = bluebird.promisify(
        connection.beginTransaction,
      )
      connection.query = bluebird.promisify(connection.query)
      connection.rollback = bluebird.promisify(connection.rollback)
      connection
        .beginTransaction()
        .then(() => {
          var queries = []
          var additionalDiscountID = uuid.v1()
          var sql_insert_discount = `INSERT INTO discountcodes (id, name, type, active, discount_type, discount_value, isAdditionalDiscount, isOtoCoupon) VALUES (
                                ${connection.escape(additionalDiscountID)},
                                ${connection.escape(discount.name)},
                                ${connection.escape(discount.type)},
                                1,
                                ${connection.escape(discount.discount_type)},
                                ${connection.escape(discount.discount_value)},
                                1,
                                1
                )`

          var sql_update_order = `UPDATE orders SET additional_discount_id = ${connection.escape(
            additionalDiscountID,
          )}, additional_discount = ${
            discount.discount
          } WHERE id = ${connection.escape(discount.order_id)}`
          var sql_update_order_history = `UPDATE orderhistory SET data = ${connection.escape(
            data,
          )} WHERE order_id = ${connection.escape(discount.order_id)}`
          queries.push(connection.query(sql_update_order))
          queries.push(connection.query(sql_update_order_history))
          queries.push(connection.query(sql_insert_discount))
          if (item_type == 'accessory') {
            var sql_insert_accessory = `INSERT INTO discountcodes_accessories (discountcode_id, accessory_id) VALUES (${connection.escape(
              additionalDiscountID,
            )}, ${connection.escape(item_id)})`
            queries.push(connection.query(sql_insert_accessory))
          } else if (item_type == 'therapy') {
            var sql_insert_therapy = `INSERT INTO discountcodes_therapies (discountcode_id, therapy_id) VALUES (${connection.escape(
              additionalDiscountID,
            )}, ${connection.escape(item_id)})`
            queries.push(connection.query(sql_insert_therapy))
          }

          return bluebird.all(queries)
        })
        .then(results => {
          return connection.commit()
        })
        .then(() => {
          connection.release()
          resolve()
          return
        })
        .catch(err => {
          return connection.rollback().then(() => {
            connection.release()
            return reject(err);
          })
        })
    })
  })
  });
}

Lang.prototype.postReview = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err)
      return reject(err);
    }
    let id = uuid.v4()
    let sql_insert = `INSERT INTO reviews (id, review, grade, name) value (${connection.escape(
      id,
    )}, ${connection.escape(data.review)}, ${connection.escape(
      data.grade,
    )}, ${connection.escape(data.name)})`

    let sql_insert_product = `INSERT INTO review_products (product_id, review_id) value (${connection.escape(
      data.product_id,
    )}, ${connection.escape(id)})`

    connection.beginTransaction = bluebird.promisify(
      connection.beginTransaction,
    )
    connection.query = bluebird.promisify(connection.query)
    connection.rollback = bluebird.promisify(connection.rollback)
    connection
      .beginTransaction()
      .then(() => {
        let queries = []

        queries.push(connection.query(sql_insert))
        queries.push(connection.query(sql_insert_product))

        return bluebird.all(queries)
      })
      .then(results => {
        return connection.commit()
      })
      .then(() => {
        connection.release()
        resolve()
        return
      })
      .catch(err => {
        return connection.rollback().then(() => {
          connection.release()
          return reject(err);
        })
      })
  })

  });
}

module.exports = new Lang()
