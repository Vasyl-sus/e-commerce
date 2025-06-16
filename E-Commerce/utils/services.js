var services = function() {}

services.prototype.findRouteByPage = function(lang, page, all_routes) {

  if (!lang || !page) {
    return false;
  }
  //console.log(lang, `/${route}`)
  var foundRoute = all_routes.find(l => {return l.page == page && l.lang == lang});

  if (!foundRoute) {
    return false;
  }

  return foundRoute;

}

services.prototype.routesWithPages = function(lang, route, all_routes) {

  if (!lang || !route) {
    return { page: '/home', redirect: true }
  }
  
  var foundLang = all_routes.filter(l => {return l.lang == lang});

  if (!foundLang || foundLang.length == 0) {
    return { page: '/home', redirect: true }
  }

  var foundRoute = foundLang.find(l => {return l.route == route});

  if (!foundRoute) {
    return { page: '/home', redirect: true }
  }

  return { page: foundRoute.page, redirect: false }

}

services.prototype.round = (number, exp) => {
  return Number(Math.round(number+('e'+exp))+('e-'+exp));
}

module.exports = new services();
