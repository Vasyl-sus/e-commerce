var logger = require('../../utils/logger');
var services = require('../../utils/services');
var bluebird = require('bluebird');
var Cart = require('./cartModel.js');
var Lang = require('../lang/langModel');

var cartController = function () { };

findValue = (array, value) => {
  if (array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].id == value)
        return i;
    }
  }
  return -1;
}

findProductValue = (array, value) => {
  if (array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].product_id == value && !array[i].isGift)
        return i;
    }
  }
  return -1;
}

findProductGiftValue = (array, value) => {
  if (array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].product_id == value && array[i].isFreeProduct)
        // if(array[i].product_id==value && array[i].isGift)
        return i;
    }
  }
  return -1;
}

checkCart = (cart, therapies) => {
  if (cart && cart.therapies && therapies) {
    for (var i = 0; i < therapies.length; i++) {
      var found = cart.therapies.find(t => {
        return t.id == therapies[i].id;
      });
      if (found) {
        return true;
      }
    }
  }
  // events.name = "Page view" || "View content"
  return false;
}

calculateDiscount = (req) => {
  var tip = req.session.cart.discountData.type.toLowerCase();
  if (tip != "shipping") {
    var tip_popusta = req.session.cart.discountData.discount_type.toLowerCase();
    var vrednost_popusta = req.session.cart.discountData.discount_value;
    var min_order_amount = req.session.cart.discountData.min_order_amount;
    if (tip == "individual" && tip_popusta == "percent") {
      req.session.cart.discount = 0;
      req.session.cart.recalculate = false;
      for (var i = 0; i < req.session.cart.discountData.therapies.length; i++) {
        var elt = req.session.cart.discountData.therapies[i].id;
        var tmp = req.session.cart.therapies.find(t => {
          return t.id == elt
        });
        if (tmp) {
          req.session.cart.discount += tmp.quantity * tmp.price * (vrednost_popusta / 100);
        }
      }
      for (var i = 0; i < req.session.cart.discountData.accessories.length; i++) {
        var elt = req.session.cart.discountData.accessories[i].id;
        var tmp1 = req.session.cart.accessories.find(t => {
          return t.id == elt
        });
        if (tmp1) {
          req.session.cart.discount += tmp1.quantity * tmp1.reduced_price * (vrednost_popusta / 100);
        }
      }
    } else if (tip == "individual" && tip_popusta == "amount") {
      req.session.cart.discount = 0;
      req.session.cart.recalculate = false;
      for (var i = 0; i < req.session.cart.discountData.therapies.length; i++) {
        var elt = req.session.cart.discountData.therapies[i].id;
        var tmp = req.session.cart.therapies.find(t => {
          return t.id == elt
        });
        if (tmp) {
          req.session.cart.discount += (tmp.quantity * vrednost_popusta);
        }
      }
    } else if (tip == "general" && tip_popusta == "percent") {
      var therapiesInCart = req.session.cart.therapies || "";
      var bundles = [];
      for (var i = 0; i < therapiesInCart.length; i++) {
        if (therapiesInCart[i].category === 'bundle') {
          bundles.push(therapiesInCart[i]);
        }
      }
      var sumBundle = 0;
      if (bundles) {
        for (var i in bundles) {
          sumBundle += +bundles[i].price * bundles[i].quantity;
        }
      }
      if (min_order_amount == null || (min_order_amount < req.session.cart.subtotal)) {
        req.session.cart.discount = (req.session.cart.subtotal - sumBundle) * (vrednost_popusta / 100);
      } else {
        req.session.cart.discount = 0;
        console.log("Low order amount");
      }
    } else if (tip_popusta == "amount") {
      if (min_order_amount == null || (min_order_amount < req.session.cart.subtotal)) {
        req.session.cart.discount = vrednost_popusta;
      } else {
        req.session.cart.discount = 0;
        console.log("Low order amount");
      }
    } else if (tip == "free product" && !req.session.cart.discountApplied) {
      if (min_order_amount == null || (min_order_amount < req.session.cart.subtotal)) {
        var freeTherapies = req.session.cart.discountData.free_therapies;
        var newTherapies = Array.from(req.session.cart.therapies);
        var freeAccessories = req.session.cart.discountData.free_accessories;
        var newAccessories = Array.from(req.session.cart.accessories);
        var discount = 0;

        if (freeTherapies && freeTherapies.length) {
          freeTherapies.forEach(element => {
            element.product_quantity = 1;
            element.quantity = 1;
            element.isGift = 1;
            element.price = element.total_price;
            element.isFreeTherapy = 1;
            newTherapies.push(element);
            discount += +element.total_price;
          })
        }

        if (freeAccessories && freeAccessories.length) {
          freeAccessories.forEach(element => {
            element.product_quantity = 1;
            element.quantity = 1;
            element.isFreeProduct = 1;
            if (req.body.accessory_product_id) {
              element.product_id = req.body.accessory_product_id;
            } else if (req.body.arr_accessory_product_id) {
              element.product_id = req.body.arr_accessory_product_id.find(a => a.accessory_id === element.id).id
            }
            element.price = element.reduced_price;
            element.isFreeAccessory = 1;
            newAccessories.push(element);
            discount += +element.reduced_price;
          })
        }

        // Calculate the regular discount first (percentage or fixed amount)
      let regularDiscount = 0;
      if (tip_popusta == "percent") {
        req.session.cart.subtotal += discount; // Include the value of free products in the subtotal
        regularDiscount = req.session.cart.subtotal * (vrednost_popusta / 100);
      } else {
        regularDiscount = vrednost_popusta;
      }

      // Add the value of free products to the total discount, but don't modify subtotal
      if (typeof discount == 'number') {
        req.session.cart.discount = regularDiscount + discount;
      } else {
        req.session.cart.discount = regularDiscount;
      }

        req.session.cart.therapies = newTherapies;
        req.session.cart.accessories = newAccessories;

      }


    } else if (tip == "free product" && req.session.cart.discountApplied) {
      if (min_order_amount == null || (min_order_amount < req.session.cart.subtotal)) {

        var freeTherapies = req.session.cart.discountData.free_therapies;
        var newTherapies = req.session.cart.therapies && req.session.cart.therapies.length > 0 ? Array.from(req.session.cart.therapies.filter(t => t.isGift !== 1)) : [];
        var freeAccessories = req.session.cart.discountData.free_accessories;
        var newAccessories = req.session.cart.accessories && req.session.cart.accessories.length > 0 ? Array.from(req.session.cart.accessories.filter(t => t.isFreeProduct !== 1)) : [];
        var discount = 0;

        req.session.cart.therapies = newTherapies;
        req.session.cart.accessories = newAccessories;


        if (freeTherapies && freeTherapies.length) {

          freeTherapies.forEach(element => {
            const findTId = newTherapies && newTherapies.filter(a => a.id === element.id)
            if (findTId && findTId.length === 0) {
              element.product_quantity = 1;
              element.quantity = 1;
              element.isGift = 1;
              element.price = element.total_price;
              element.isFreeTherapy = 1;
              newTherapies.push(element);
              discount += +element.total_price;
            } else if (findTId && findTId.length > 0) {
              newTherapies = [...newTherapies, ...findTId];
            }
          })

        }

        if (freeAccessories && freeAccessories.length) {
          freeAccessories.forEach(element => {
            const findAId = newAccessories && newAccessories.filter(a => a.id === element.id)
            if (findAId && findAId.length === 0) {
              element.product_quantity = 1;
              element.quantity = 1;
              element.isFreeProduct = 1;
              if (req.body.accessory_product_id) {
                element.product_id = req.body.accessory_product_id;
              } else if (req.body.arr_accessory_product_id) {
                element.product_id = req.body.arr_accessory_product_id.find(a => a.accessory_id === element.id).id
              }
              element.price = element.reduced_price;
              element.isFreeAccessory = 1;
              newAccessories.push(element);
              discount += +element.reduced_price;
            } else if (findAId && findAId.length > 0) {
              newAccessories = [...newAccessories, ...findAId];
            }
          })
        }

        // Calculate the regular discount first (percentage or fixed amount)
      let regularDiscount = 0;
      if (tip_popusta == "percent") {
        // Calculate percentage discount on regular items only (excluding free products)
        // Don't add discount to subtotal again when recalculating
        regularDiscount = req.session.cart.subtotal * (vrednost_popusta / 100);
      } else {
        regularDiscount = vrednost_popusta;
      }

      // Add the value of free products to the total discount
      if (typeof discount == 'number') {
        req.session.cart.discount = regularDiscount + discount;
      } else {
        req.session.cart.discount = regularDiscount;
      }


      }
    }

  } else if (tip == "shipping") {
    req.session.cart.discount = req.session.cart.shipping_fee;
  }


  req.session.cart.discount = Math.round(100 * req.session.cart.discount) / 100;
  req.session.cart.total = req.session.cart.subtotal - req.session.cart.discount + req.session.cart.shipping_fee;
  req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;
  if (req.session.cart.total < 0) req.session.cart.total = 0;

  return;
}

calculateShipping = (req) => {
  var sum = 0;
  var therapies = req.session.cart.therapies;
  var accessories = req.session.cart.accessories;

  if (therapies && therapies.length) {
    therapies.forEach(element => {
      if (!element.isFreeTherapy && !element.isGift) {
        sum += +element.price * element.quantity;
      }
    })
  }

  if (accessories && accessories.length) {
    accessories.forEach(element => {
      if (!element.isFreeProduct) {
        // if (!element.isGift) {
        sum += +element.price * element.quantity;
      }
    })
  }

  req.session.cart.summ = sum;

  return sum >= 44 ? 0 : 3.9;
}


calculateDelivery = (req) => {
  var isShippingDiscount = false;
  if (req.session.cart.discountData && req.session.cart.discountData.type.toLowerCase() == "shipping")
    isShippingDiscount = true;

  if (req.session.cart.subtotal > req.session.deliverymethod.to_price || checkCart(req.session.cart, req.session.deliverymethod.therapies)) {
    req.session.cart.shipping_fee = 0;
  }
  if (req.session.cart.subtotal <= req.session.deliverymethod.to_price) {
    req.session.cart.shipping_fee = req.session.deliverymethod.price;
  }

  if (req.session.cart.discountData && req.session.cart.discountData.type.toLowerCase() == "free product") {
    if (req.session.cart.total < req.session.deliverymethod.to_price) {
      req.session.cart.shipping_fee = req.session.deliverymethod.price;
    }
  }

  if (isShippingDiscount) {
    req.session.cart.discount = req.session.cart.shipping_fee;
  } else {
    req.session.cart.total += req.session.cart.shipping_fee;
  }

  req.session.cart.total = req.session.cart.subtotal - req.session.cart.discount + req.session.cart.shipping_fee;
  req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;

  return;
}

cartController.prototype.addGiftToCart = bluebird.coroutine(function* (req, res) {
  try {
    var accessory_id = req.body.accessory_id;
    var new_quantity = parseInt(req.body.new_quantity);
    var product_id = req.body.product_id;
    var product_name = req.body.product_name;
    if (new_quantity > 0) {
      var tasks = [];
      var accessory = yield Cart.getAccessoryDetails(accessory_id);
      if (accessory) {
        var idx = findValue(req.session.cart.accessories, accessory_id);
        // if(idx==-1){
        accessory.quantity = new_quantity;
        accessory.product_id = product_id
        accessory.product_name = product_name;
        accessory.reduced_price = 0;
        accessory.isGift = 1;
        // console.log(222)
        // accessory.isFreeProduct = 1;
        accessory.no_price = accessory.price;
        accessory.price = 0;
        accessory.reduced_price = 0;
        req.session.cart.accessories.push(accessory);
        // } else {
        //   req.session.cart.accessories[idx].quantity+=new_quantity;
        // }
      } else {
        res.status(404).json({ success: false, message: "Incorrect therapy/accessory id!" });
        return;
      }

      res.status(200).json({ success: true });
    } else {
      res.status(403).json({ success: false, message: "new_quantity must be positive!" });
    }

  } catch (err) {
    logger.error("cartController: addGiftToCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

cartController.prototype.changeQuantity = bluebird.coroutine(function* (req, res) {
  try {
    var therapy_id = req.body.therapy_id;
    var new_quantity = parseInt(req.body.new_quantity);

    if (new_quantity > 0) {

      var tasks = [];
      tasks.push(Cart.getTherapyDetails(therapy_id));
      tasks.push(Cart.getAccessoryDetails(therapy_id));
      var results = yield bluebird.all(tasks);
      var therapy = results[0];
      var accessory = results[1];
      var isMinus = false
      if (therapy || accessory) {
        if (therapy) {
          var idx = findValue(req.session.cart.therapies, therapy_id);
          if (idx > -1) {
            var old_quantity = req.session.cart.therapies[idx].quantity;
            var price_difference = (new_quantity - old_quantity) * req.session.cart.therapies[idx].price;
            req.session.cart.therapies[idx].quantity = new_quantity;
            req.session.cart.subtotal += price_difference;
          }
        }
        let num_therapies = 0;
        req.session.cart.therapies.forEach(therapy => {
          if (!therapy.isFreeTherapy) {
            num_therapies += therapy.quantity * therapy.product_quantity;
          }
        })
        let giftConfig = yield Cart.getGiftConfig(req.session.country, num_therapies, req.session.cart.total || 0);
        let totalTherapiesQuantity = 0
        req.session.cart.therapies.map(t => totalTherapiesQuantity += t.isFreeTherapy === 1 ? 0 : t.quantity)
        if (!giftConfig || (giftConfig && totalTherapiesQuantity < giftConfig.num_therapies)) {
          req.session.cart.accessories = req.session.cart.accessories && req.session.cart.accessories.filter(a => a.isGift !== 1 || a.isGift === undefined)
        }
        if (giftConfig) {
          let giftCount = req.session.cart.accessories.reduce((count, a) => count + (a.isGift === 1 ? 1 : 0), 0);
        
          if (giftConfig.count > giftCount) {
            // Add gifts to the cart
            for (let i = giftCount; i < giftConfig.count; i++) {
              // Add a gift to the cart
              req.session.cart.accessories.push(/* gift item */);
            }
          } else if (giftConfig.count < giftCount) {
            // Remove gifts from the cart
            let giftsToRemove = giftCount - giftConfig.count;
            req.session.cart.accessories = req.session.cart.accessories.filter(a => {
              if (a.isGift === 1 && giftsToRemove > 0) {
                giftsToRemove--;
                return false;
              }
              return true;
            });
          }
        }
        if (accessory) {
           let idx = findValue(req.session.cart.accessories, therapy_id);
           if (idx >= 0) {
             var old_quantity = req.session.cart.accessories[idx].quantity;
             var price_difference = (new_quantity - old_quantity) * req.session.cart.accessories[idx].price;
             req.session.cart.accessories[idx].quantity = new_quantity;
             req.session.cart.subtotal += price_difference;
           }
         }

        if (req.session.cart.discountData) {
          calculateDiscount(req);
        }
        if (req.session.deliverymethod) {
          calculateDelivery(req);
        }

        req.session.cart.subtotal = Math.round(100 * req.session.cart.subtotal) / 100;
        req.session.cart.discount = Math.round(100 * req.session.cart.discount) / 100;
        req.session.cart.total = req.session.cart.subtotal - req.session.cart.discount + req.session.cart.shipping_fee;
        req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;
        if (req.session.cart.total < 0) req.session.cart.total = 0;
        //req.session.save();

        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "Incorrect therapy/accessory id!" });
        return;
      }
    } else {
      res.status(403).json({ success: false, message: "new_quantity must be positive!" });
    }

  } catch (err) {
    console.log(err)
    logger.error("cartController: changeQuantity - ERROR: try-catch: " + err);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

cartController.prototype.addToCart = bluebird.coroutine(function* (req, res) {
  try {
    var therapy_id = req.body.therapy_id;
    var new_quantity = parseInt(req.body.new_quantity);
    var product_id = req.body.product_id;
    var product_name = req.body.product_name;
    if (new_quantity > 0) {
      var tasks = [];
      let lang = req.session.lang || "SL";
      let country = req.session.country || "SI";
      tasks.push(Cart.getTherapyDetails(therapy_id));
      tasks.push(Cart.getAccessoryDetails1(product_id, lang, country));
      var results = yield bluebird.all(tasks);
      var therapy = results[0];
      var accessory = results[1];

      if (therapy || accessory) {
        if (therapy) {
          var idx = findValue(req.session.cart.therapies, therapy_id);
          if (idx == -1) {
            therapy.quantity = new_quantity;
            req.session.cart.therapies.push(therapy);
            req.session.cart.subtotal += new_quantity * therapy.price;
          } else {
            req.session.cart.therapies[idx].quantity += new_quantity;
            req.session.cart.subtotal += new_quantity * req.session.cart.therapies[idx].price;
          }
        }
        if (accessory) {
          let idx = findProductValue(req.session.cart.accessories, product_id);
          if (idx == -1) {
            accessory.quantity = new_quantity;
            accessory.product_id = product_id
            accessory.product_name = product_name;
            req.session.cart.accessories.push(accessory);
            req.session.cart.subtotal += new_quantity * accessory.price;
          } else {
            req.session.cart.accessories[idx].quantity += new_quantity;
            req.session.cart.subtotal += new_quantity * req.session.cart.accessories[idx].price;
          }
        }

        if (req.session.cart.discountData) {
          calculateDiscount(req);
        }
        if (req.session.deliverymethod) {
          calculateDelivery(req);
        }

        req.session.cart.subtotal = Math.round(100 * req.session.cart.subtotal) / 100;
        req.session.cart.discount = Math.round(100 * req.session.cart.discount) / 100;
        req.session.cart.total = req.session.cart.subtotal - req.session.cart.discount + req.session.cart.shipping_fee;
        req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;
        if (req.session.cart.total < 0) req.session.cart.total = 0;
        //req.session.save();
        res.status(200).json({ success: true, therapy });
      } else {
        res.status(404).json({ success: false, message: "Incorrect therapy/accessory id!" });
        return;
      }
    } else {
      res.status(403).json({ success: false, message: "new_quantity must be positive!" });
    }
  } catch (err) {
    logger.error("cartController: addToCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});


cartController.prototype.removeFromCart = bluebird.coroutine(function* (req, res) {
  try {
    var therapy_id = req.params.therapy_id;
    //id, total_price
    var idx = findValue(req.session.cart.therapies, therapy_id);
    var idx1 = findValue(req.session.cart.accessories, therapy_id);
    if (idx > -1 && idx < req.session.cart.therapies.length) {
      req.session.cart.subtotal -= req.session.cart.therapies[idx].quantity * req.session.cart.therapies[idx].price;
      req.session.cart.therapies.splice(idx, 1);
      let num_therapies = 0;
      req.session.cart.therapies.forEach(therapy => {
        if (!therapy.isFreeTherapy) {
          num_therapies += therapy.quantity * therapy.product_quantity;
        }
      })
      let giftConfig = yield Cart.getGiftConfig(req.session.country, num_therapies, req.session.cart.total || 0);
      let totalTherapiesQuantity = 0
      req.session.cart.therapies.map(t => totalTherapiesQuantity += t.isFreeTherapy === 1 ? 0 : t.quantity)
      if (!giftConfig || (giftConfig && totalTherapiesQuantity < giftConfig.num_therapies)) {
        req.session.cart.accessories = req.session.cart.accessories && req.session.cart.accessories.filter(a => a.isGift !== 1 || a.isGift === undefined)
      }
      if (giftConfig) {
        let giftCount = req.session.cart.accessories.reduce((count, a) => count + (a.isGift === 1 ? 1 : 0), 0);
      
        if (giftConfig.count > giftCount) {
          // Add gifts to the cart
          for (let i = giftCount; i < giftConfig.count; i++) {
            // Add a gift to the cart
            req.session.cart.accessories.push(/* gift item */);
          }
        } else if (giftConfig.count < giftCount) {
          // Remove gifts from the cart
          let giftsToRemove = giftCount - giftConfig.count;
          req.session.cart.accessories = req.session.cart.accessories.filter(a => {
            if (a.isGift === 1 && giftsToRemove > 0) {
              giftsToRemove--;
              return false;
            }
            return true;
          });
        }
      }
    } else if (idx1 > -1 && idx1 < req.session.cart.accessories.length) {
      req.session.cart.subtotal -= req.session.cart.accessories[idx1].quantity * req.session.cart.accessories[idx1].price;
      req.session.cart.accessories.splice(idx1, 1);
    } else {
      res.status(404).json({ success: false, message: "Item is not in cart." });
      return;
    }


    if (req.session.cart.discountData) {
      var activeItemsCount = 0;
      for (let i = 0; i < req.session.cart.accessories.length; i++) {
        if (!req.session.cart.accessories[i].isFreeProduct) {
          activeItemsCount++;
        }
      }
      for (let i = 0; i < req.session.cart.therapies.length; i++) {
        if (!req.session.cart.therapies[i].isGift) {
          activeItemsCount++;
        }
      }


      if (!activeItemsCount) {
        req.session.cart.therapies = [];
        req.session.cart.accessories = [];
        req.session.cart.discountData = null;
        req.session.cart.total = 0;
        req.session.cart.subtotal = 0;
        req.session.cart.shipping_fee = 0;
        req.session.cart.discount = 0;
        req.session.cart.recalculate = false;
      }
    }

    if (req.session.cart.discountData) {
      calculateDiscount(req);
    }
    if (req.session.deliverymethod) {
      calculateDelivery(req);
    }

    if (req.session.cart.giftConfig) {
      req.session.cart.accessories = req.session.cart.accessories.filter(a => {
        // return !a.isGift
        return a.id !== therapy_id
      })
      // for (let i = 0; i < req.session.cart.accessories.length; i++) {
      //   console.log('req.session.cart.accessories[i]', req.session.cart.accessories[i])
      //   if (req.session.cart.accessories[i].isFreeProduct) {
      //     req.session.cart.subtotal-=req.session.cart.accessories[i].quantity * req.session.cart.accessories[i].price;
      //   }
      // }

      req.session.cart.therapies = req.session.cart.therapies.filter(t => {
        // return !t.isGift
        return t.id !== therapy_id
      })
      // for (let i = 0; i < req.session.cart.therapies.length; i++) {
      //   console.log('req.session.cart.therapies[i]', req.session.cart.therapies[i])
      //   if (req.session.cart.therapies[i].isGift) {
      //     req.session.cart.subtotal-=req.session.cart.therapies[i].quantity * req.session.cart.therapies[i].price;
      //   }
      // }
      // }
    }

    req.session.cart.total = req.session.cart.subtotal - req.session.cart.discount + req.session.cart.shipping_fee;
    req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;

    res.status(200).json({ success: true, message: "Item removed.", cart: req.session.cart });
  } catch (err) {
    logger.error("cartController: removeFromCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

cartController.prototype.removeGiftFromCart = bluebird.coroutine(function* (req, res) {
  try {
    var therapy_id = req.params.therapy_id;
    //id, total_price
    var idx = findValue(req.session.cart.therapies, therapy_id);
    var idx1 = findProductGiftValue(req.session.cart.accessories, therapy_id);
    if (idx > -1 && idx < req.session.cart.therapies.length) {
      req.session.cart.subtotal -= req.session.cart.therapies[idx].quantity * req.session.cart.therapies[idx].price;
      req.session.cart.therapies.splice(idx, 1);
    } else if (idx1 > -1 && idx1 < req.session.cart.accessories.length) {
      req.session.cart.subtotal -= req.session.cart.accessories[idx1].quantity * req.session.cart.accessories[idx1].price;
      req.session.cart.accessories.splice(idx1, 1);
    } else {
      res.status(404).json({ success: false, message: "Item is not in cart." });
      return;
    }

    if (req.session.cart.discountData) {
      var activeItemsCount = 0;
      for (let i = 0; i < req.session.cart.accessories.length; i++) {
        if (!req.session.cart.accessories[i].isFreeProduct) {
          activeItemsCount++;
        }
      }
      for (let i = 0; i < req.session.cart.therapies.length; i++) {
        if (!req.session.cart.therapies[i].isGift) {
          activeItemsCount++;
        }
      }

      if (!activeItemsCount) {
        req.session.cart.therapies = [];
        req.session.cart.accessories = [];
        req.session.cart.discountData = null;
        req.session.cart.total = 0;
        req.session.cart.subtotal = 0;
        req.session.cart.shipping_fee = 0;
        req.session.cart.discount = 0;
        req.session.cart.recalculate = false;
      }
    }


    if (req.session.cart.discountData) {
      calculateDiscount(req);
    }
    if (req.session.deliverymethod) {
      calculateDelivery(req);
    }

    if (req.session.cart.giftConfig) {
      req.session.cart.accessories = req.session.cart.accessories.filter(a => {
        // return !a.isGift
        // return !a.isFreeProduct
        return a.id !== therapy_id
      })

      // for (let i = 0; i < req.session.cart.accessories.length; i++) {
      //   if (req.session.cart.accessories[i].isFreeProduct) {
      //     req.session.cart.subtotal-=req.session.cart.accessories[i].quantity * req.session.cart.accessories[i].price;
      //   }
      // }

      req.session.cart.therapies = req.session.cart.therapies.filter(t => {
        // return !t.isGift
        return t.id !== therapy_id
      })

      // for (let i = 0; i < req.session.cart.therapies.length; i++) {
      //   if (req.session.cart.therapies[i].isGift) {
      //     req.session.cart.subtotal-=req.session.cart.therapies[i].quantity * req.session.cart.therapies[i].price;
      //   }
      // }
      // }
    }

    req.session.cart.total = req.session.cart.subtotal - req.session.cart.discount + req.session.cart.shipping_fee;
    req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;

    res.status(200).json({ success: true, message: "Item removed.", cart: req.session.cart });
  } catch (err) {
    logger.error("cartController: removeFromCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

cartController.prototype.editQuantity = bluebird.coroutine(function* (req, res) {
  try {
    var therapy_id = req.params.therapy_id;
    var new_quantity = req.body.new_quantity;
    //id, total_price
    if (new_quantity > 0) {
      var idx = findValue(req.session.cart.therapies, therapy_id);
      var idx1 = findValue(req.session.cart.accessories, therapy_id);
      if (idx > -1 && idx < req.session.cart.therapies.length) {
        var k = (new_quantity - req.session.cart.therapies[idx].quantity);
        req.session.cart.therapies[idx].quantity = new_quantity;
        req.session.cart.subtotal += k * req.session.cart.therapies[idx].price;
      } else if (idx1 > -1 && idx1 < req.session.cart.accessories.length) {
        var k1 = (new_quantity - req.session.cart.accessories[idx1].quantity);
        req.session.cart.accessories[idx1].quantity = new_quantity;
        req.session.cart.subtotal += k1 * req.session.cart.accessories[idx1].price;
      } else {
        res.status(404).json({ success: false, message: "Item is not in cart." });
        return;
      }

      if (req.session.cart.discountData) {
        calculateDiscount(req);
      }
      if (req.session.deliverymethod) {
        calculateDelivery(req);
      }

      req.session.cart.total = req.session.cart.subtotal - req.session.cart.discount + req.session.cart.shipping_fee;
      req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;
      //req.session.save();
      res.status(200).json({ success: true, message: "Item quantity updated.", cart: req.session.cart });
      return;

    } else {
      res.status(403).json({ success: false, message: "new_quantity must be positive." });
      return;
    }
  } catch (err) {
    logger.error("cartController: editQuantity - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

cartController.prototype.getTherapyStatuses = bluebird.coroutine(function* (req, res) {
  try {
    // Split the IDs from the query string into an array
    const ids = req.query.ids.split(',');

    // Fetch the statuses for all therapies from the database
    const statuses = yield Cart.getTherapyStatuses(ids);

    if (!statuses || statuses.length === 0) {
      res.status(404).json({ success: false, message: 'Therapies not found.' });
      return;
    }

    res.status(200).json({ success: true, statuses });
  } catch (err) {
    logger.error("cartController: getTherapyStatuses - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

cartController.prototype.getAccessoryStatuses = bluebird.coroutine(function* (req, res) {
  try {
    // Split the IDs from the query string into an array
    const ids = req.query.ids.split(',');

    // Fetch the statuses for all therapies from the database
    const statuses = yield Cart.getAccessoryStatuses(ids);

    if (!statuses || statuses.length === 0) {
      res.status(404).json({ success: false, message: 'Therapies not found.' });
      return;
    }

    res.status(200).json({ success: true, statuses });
  } catch (err) {
    logger.error("cartController: getAccessoryStatuses - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});


cartController.prototype.getCart = bluebird.coroutine(function* (req, res) {
  try {
    if (!req.session.cart) {
      req.session.location = "getCart";
      req.session.cart = {};
      req.session.cart.therapies = [];
      req.session.cart.accessories = [];
      req.session.cart.subtotal = 0;
      req.session.cart.discount = 0;
      req.session.cart.shipping_fee = 0;
      req.session.cart.total = 0;
      req.session.cart.discountApplied = false;
    }


    if (!req.session.cart.therapies.length && !req.session.cart.accessories.length) {
      req.session.cart = {};
      req.session.cart.therapies = [];
      req.session.cart.accessories = [];
      req.session.cart.subtotal = 0;
      req.session.cart.discount = 0;
      req.session.cart.shipping_fee = 0;
      req.session.cart.total = 0;
      req.session.cart.discountApplied = false;
    }

    yield validateDiscount(req);

    if (req.query.oto_id && req.query.order_id) {
      let check = yield Cart.getOtoDiscount(req.query.oto_id, req.query.order_id);

      if (parseInt(check.discount) == 1) {
        req.session.cart.discount = req.session.cart.subtotal * (check.discount_value / 100);
        req.session.cart.discount = services.round(req.session.cart.discount, 2);
        req.session.cart.total = req.session.cart.subtotal - req.session.cart.discount + req.session.cart.shipping_fee;
        req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;
        if (req.session.cart.total < 0) req.session.cart.total = 0;
      }
      else {
        req.session.cart.discount = 0;
        req.session.cart.recalculate = false;
        req.session.cart.total = req.session.cart.subtotal + req.session.cart.shipping_fee;
        req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;
      }
    }

    let giftResult = yield Lang.getFullAccessories(req.session.country, req.session.lang);

    let num_therapies = 0;
    req.session.cart.therapies.forEach(therapy => {
      if (!therapy.isFreeTherapy) {
        num_therapies += therapy.quantity * therapy.product_quantity;
      }
    })


    let giftConfig = yield Cart.getGiftConfig(req.session.country, num_therapies, req.session.cart.total || 0);
    let nextGiftConfig = yield Cart.getNextGiftConfig(req.session.country, num_therapies, req.session.cart.total || 0);

    if (giftConfig) {
      giftConfig['nextGiftConfig'] = nextGiftConfig || 'undefined'
    }
    else {
      giftConfig = {}
      giftConfig['nextGiftConfig'] = nextGiftConfig || 'undefined'
    }
    if (req.session.cart && req.session.cart.recalculate) {
      calculateDiscount(req)
    }
    req.session.cart.giftConfig = giftConfig;
    res.status(200).json({ success: true, cart: req.session.cart, customer: req.session.customer, gifts: giftResult, giftConfig });

  } catch (err) {
    console.log(err)
    logger.error("cartController: getCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});


cartController.prototype.clearCart = bluebird.coroutine(function* (req, res) {
  try {
    //var country = req.query.country;
    req.session.cart = null;
    //req.session.save();
    res.status(200).json({ success: true });
  } catch (err) {
    logger.error("cartController: clearCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

cartController.prototype.getDiscountData = bluebird.coroutine(function* (req, res) {

  try {
    var discountcode = req.params.discountId;
    var used_discount = yield Cart.getFullDiscountByName(discountcode, req.session.country);

    if (used_discount && used_discount.free_accessories && used_discount.free_accessories.length) {
      var productOptions
      if (used_discount.free_accessories) {
        productOptions = yield Cart.getAccessoriesOptions(used_discount.free_accessories, req.session.lang);
      }
      var productOption = yield Cart.getAccessoriesOption(used_discount.free_accessories[0].id, req.session.lang);
      used_discount.free_accessories_option = productOption;
      used_discount.free_accessories_options = productOptions;
    }

    if (used_discount) {
      res.status(200).json({ success: true, cart: used_discount });
      return;
    }
    
    res.status(404).json({ success: false, message: "discount_not_found", country: req.session.country });
    return;

  } catch (err) {
    logger.error("cartController: getDiscountData - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

cartController.prototype.addDiscountToCart = bluebird.coroutine(function* (req, res) {
  try {
    var discountcode = req.body.discountcode;
    var used_discount = yield Cart.getFullDiscountByName(discountcode, req.session.country);
    if (used_discount) {
      req.session.cart.discountData = used_discount;
      calculateDiscount(req);
      req.session.cart.discountApplied = true;

      if (req.session.cart.accessories && req.session.cart.accessories.length) {

        var newAcc = Array.from(req.session.cart.accessories);

        yield Promise.all(newAcc.map(async (element) => {
          if (!element.product_name && req.body.accessory_product_id) {
            var translation = await Cart.getAccessoryTranslation(req.body.accessory_product_id, element.lang || 'SL');
            if (translation) element.product_name = translation.name;
            else element.product_name = '';
          } else if (!element.product_name && req.body.arr_accessory_product_id) {
            var translation = await Cart.getAccessoryTranslation(req.body.arr_accessory_product_id.find(a => a.accessory_id === element.id).id, element.lang || 'SL');
            if (translation) element.product_name = translation.name;
            else element.product_name = '';
          }
        }));
        req.session.cart.accessories = newAcc;
      }


      if (used_discount.utm_medium && used_discount.utm_source && req.session.utm) {
        req.session.utm.medium = used_discount.utm_medium;
        req.session.utm.source = used_discount.utm_source
      }

      //req.session.save();
      res.status(200).json({ success: true, cart: req.session.cart });//"Discount added to cart."
      return;
    }
    //console.log(req.session.cart);
    res.status(404).json({ success: false, message: "discount_not_found", country: req.session.country });
    return;

  } catch (err) {
    logger.error("cartController: addDiscountToCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

const validateDiscount = bluebird.coroutine(function* (req) {
  if (req.session.cart.discountData) {
    const discountName = req.session.cart.discountData.name;
    const used_discount = yield Cart.getFullDiscountByName(discountName, req.session.country);
    if (!used_discount) {
      yield cartController.prototype.removeDiscount(req, null);
    }
  }
});

cartController.prototype.removeDiscount = bluebird.coroutine(function* (req, res) {
  try {
    req.session.cart.total += req.session.cart.discount;

    req.session.cart.discountData = undefined;
    req.session.cart.discount = 0;
    req.session.cart.discount_not_found = 0;
    req.session.cart.recalculate = false;
    var subtotal = 0;

    var newTherapies = Array.from(req.session.cart.therapies).filter(element => {
      if (!element.isFreeTherapy) {
        subtotal += +element.price * element.quantity;
        return element;
      }
    });
    req.session.cart.therapies = newTherapies;

    var newAccessories = Array.from(req.session.cart.accessories).filter(element => {
      if (!element.isFreeAccessory) {
        subtotal += +element.price * element.quantity;
        return element;
      }
    });
    req.session.cart.accessories = newAccessories;

    req.session.cart.discountApplied = false;
    req.session.cart.subtotal = subtotal;
    req.session.cart.subtotal = Math.round(100 * req.session.cart.subtotal) / 100;

    if (req.session.deliverymethod) {
      calculateDelivery(req);
    }

    req.session.cart.total = req.session.cart.subtotal - req.session.cart.discount + req.session.cart.shipping_fee;

    if (res) {
      res.status(200).json({ success: true, cart: req.session.cart });
    }
    return;
  } catch (err) {
    logger.error("cartController: removeDiscount - ERROR: try-catch: " + err.message);
    if (res) {
      res.status(500).json({ success: false, message: err.message });
    }
    return;
  }
});

cartController.prototype.addOtomDiscountToCart = bluebird.coroutine(function* (req, data) {
  try {
    var used_discount = yield Cart.getDiscountByOtom(data);
    if (!used_discount) {
      //console.log(req.session.cart);
      //res.status(404).json({success: false, message: "discount_not_found"});
      console.log("CART: addOtomDiscountToCart: discount not found");
      return;
    }

    req.session.cart.discountData = used_discount;
    req.session.cart.discountData.otom_sent_id = data.otom_sent_id;

    calculateDiscount(req);
    if (req.session.deliverymethod) {
      // calculateDelivery(req);
    }

    // req.session.save();
    //res.status(200).json({success: true, cart: req.session.cart});//"Discount added to cart."
    console.log("CART: addOtomDiscountToCart: discount added to cart");
    return;

  } catch (err) {
    logger.error("cartController: addOtomDiscountToCart - ERROR: try-catch: " + err.message);
    return;
  }
});

cartController.prototype.addDeliverymethodToCart = bluebird.coroutine(function* (req, res) {
  try {
    var deliverymethod_id = req.body.deliverymethod_id;
    if (!deliverymethod_id) {
      req.session.cart.total -= req.session.cart.shipping_fee;
      req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;
      req.session.cart.shipping_fee = 0;
      return;
    }

    var deliverymethod = yield Cart.getDeliverymethod(deliverymethod_id);
    //console.log(deliverymethod)
    if (deliverymethod) {
      if (!req.session.customer)
        req.session.customer = {};
      req.session.customer.delivery_method_id = deliverymethod.id;
      req.session.customer.delivery_method_code = deliverymethod.code;
      req.session.deliverymethod = deliverymethod;
      req.session.cart.total -= req.session.cart.shipping_fee;
      req.session.cart.shipping_fee = deliverymethod.price;

      calculateDelivery(req);

      res.status(200).json({ success: true, message: "Deliverymethod set", cart: req.session.cart, customer: req.session.customer });
      return;
    } else {
      res.status(404).json({ success: false, message: "Invalid deliverymethod_id!" });
      return;
    }

  } catch (err) {
    logger.error("cartController: addDeliverymethodToCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

cartController.prototype.addDeliverymethodPaymentToCart = bluebird.coroutine(function* (req, res) {
  try {
    var deliverymethod_id = req.body.deliverymethod_id;
    var paymentmethod_id = req.body.paymentmethod_id;

    if (!deliverymethod_id) {
      req.session.cart.total -= req.session.cart.shipping_fee;
      req.session.cart.total = Math.round(100 * req.session.cart.total) / 100;
      req.session.cart.shipping_fee = 0;
      return;
    }

    var deliverymethod = yield Cart.getDeliverymethod(deliverymethod_id);
    var paymentmethod = yield Cart.getPaymentmethod(paymentmethod_id);
    //console.log(deliverymethod)
    if (deliverymethod && paymentmethod) {
      if (!req.session.customer)
        req.session.customer = {};
      req.session.customer.delivery_method_id = deliverymethod.id;
      req.session.customer.delivery_method_code = deliverymethod.code;
      req.session.deliverymethod = deliverymethod;
      req.session.cart.total -= req.session.cart.shipping_fee;
      req.session.cart.shipping_fee = deliverymethod.price;

      calculateDelivery(req);

      req.session.customer.payment_method_id = paymentmethod.id;
      req.session.customer.payment_method_code = paymentmethod.code;

      let translations = JSON.parse(paymentmethod.translations) || {};
      let l = req.session.lang && req.session.lang.toUpperCase() || "SI"
      req.session.customer.payment_method_name = translations[l];

      res.status(200).json({ success: true, message: "Deliverymethod and paymentmethod set", cart: req.session.cart, customer: req.session.customer });
      return;
    } else {
      res.status(404).json({ success: false, message: "Invalid deliverymethod_id!" });
      return;
    }
  } catch (err) {
    logger.error("cartController: addDeliverymethodToCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});

cartController.prototype.addPaymentmethodToCart = bluebird.coroutine(function* (req, res) {
  try {
    var paymentmethod_id = req.body.paymentmethod_id;

    var paymentmethod = yield Cart.getPaymentmethod(paymentmethod_id);
    if (paymentmethod) {
      if (!req.session.customer)
        req.session.customer = {};
      req.session.customer.payment_method_id = paymentmethod.id;
      req.session.customer.payment_method_code = paymentmethod.code;

      let translations = JSON.parse(paymentmethod.translations) || {};
      let l = req.session.lang && req.session.lang.toUpperCase() || "SI"
      req.session.customer.payment_method_name = translations[l];

      res.status(200).json({ success: true, message: "Paymentmethod set", cart: req.session.cart, customer: req.session.customer });
      return;
    } else {
      res.status(404).json({ success: false, message: "Invalid paymentmethod_id!" });
      return;
    }

  } catch (err) {
    logger.error("cartController: addPaymentmethodToCart - ERROR: try-catch: " + err.message);
    res.status(500).json({ success: false, message: err.message });
    return;
  }
});


module.exports = new cartController();
