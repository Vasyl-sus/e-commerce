var config = require('../config/environment/index');
const fs = require('file-system');

var sitemapService = function() {}

sitemapService.prototype.getSitemapObject = path_to_file => {
  return new Promise((resolve, reject) => {
    var array = [];
    var start = 0;
    fs.readFile(path_to_file, 'utf8', function(err, result) {
      if (err) return reject(err);
      while (start != -1) {
        start = result.indexOf('<url>', start);
        if (start == -1) break;
        start = start + '<url>'.length;
        var end = result.indexOf('</url>', start);
        if (end == -1) {
          return reject(new Error("</url> expected"));
        }

        var string = result.substring(start, end);
        end = end + '</url>'.length;

        var start1 = string.indexOf('<loc>');
        if (start1 == -1) {
          return reject(new Error("<loc> expected"));
        }
        var end1 = string.indexOf('</loc>', start1);
        if (end1 == -1) {
          return reject(new Error("</loc> expected"));
        }

        var obj = {
          loc: string.substring(start1 + '<loc>'.length, end1),
          alt: []
        }

        var start2 = end1 + '</loc>'.length;

        while (start2 != -1) {
          start2 = string.indexOf('<xhtml:link rel="alternate" ', start2)
          if (start2 == -1) break;

          start2 = start2 + '<xhtml:link rel="alternate" '.length;
          var end2 = string.indexOf('/>', start2);
          if (end2 == -1) {
            return reject(new Error("/> expected"));
          }

          var string1 = string.substring(start2, end2);

          var elt = {
            rel: "alternate",
            hreflang: string1.substring(10, 15),
            href: string1.substring(23).split("\"")[0]
          }

          obj.alt.push(elt);
          start2 = end2;
        }
        array.push(obj);
        start = end;
      }
      resolve(array);
    });
  });
}

sitemapService.prototype.updateSitemapObject = (sitemap, data) => {

  var pages_map = {
    "/home":1,
    "/for-him":2,
    "/for-her":3,
    "/faq":4
  }

  var hostname = 'https://www.lux-cosmetics.com/';
  if(process.env.NODE_ENV === 'production')
    hostname = config.server.hostname;

  var pageNum = Object.keys(pages_map).length;
  var hreflang = data.hreflang;
  var arr = data.routes.filter(r=>{return Object.keys(pages_map).find(p=>{return p==r.page})});
  arr.sort((a,b)=>{
    return pages_map[a.page]-pages_map[b.page];
  });

  var sitemap1 = JSON.parse(JSON.stringify(sitemap));
  var lang = hreflang.toLowerCase().split("-");
  //if(lang[0]=="sl") lang[0]="si";
  var link_lang = lang[1]+'-'+lang[0];

  var new_elts = [];
  for(var i=0;i<arr.length;i++){
    var page_idx = pages_map[arr[i].page];

    var new_obj = {
      loc: hostname + link_lang + '/' + arr[i].route,
      alt: sitemap1[page_idx].alt
    }
    page_idx = page_idx%pageNum;
    var found_idx;
    var exists = sitemap.find((s,idx) => {
      var x = idx%pageNum;
      if(s.loc.includes(hostname+link_lang+'/') && idx%pageNum==pages_map[arr[i].page]%pageNum){
        found_idx=idx;
        return true;
      }
      return false;
    });
    //console.log(found_idx);

    if(!exists){
      sitemap.push(new_obj);
      for(var j=0;j<sitemap.length;j++){
        if(j==0) continue;
        if(j%pageNum==page_idx){
          sitemap[j].alt.push({
            rel: "alternate",
            hreflang,
            href: new_obj.loc
          });
        }
      }
    } else {
      sitemap[found_idx].loc = new_obj.loc;
      for(var u=0;u<sitemap.length;u++){
        if(u!=0 && u%pageNum==found_idx%pageNum){
          for(var v=0;v<sitemap[u].alt.length;v++){
            if(sitemap[u].alt[v].hreflang==hreflang){
              sitemap[u].alt[v].href=new_obj.loc;
            }
          }
        }
      }
    }
  }

  return sitemap;
}

sitemapService.prototype.stringifySitemapObject = (arr) => {
  var string = `<?xml version="1.0" encoding="UTF-8"?>\r\n`
  string += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\r\n`;

  for(var i=0;i<arr.length;i++){
    string+=`<url>\r\n`;
    string+=`   <loc>${arr[i].loc}</loc>\r\n`;
    for(var j=0;j<arr[i].alt.length;j++){
      string+=`   <xhtml:link rel="alternate" hreflang="${arr[i].alt[j].hreflang}" href="${arr[i].alt[j].href}"/>\r\n`;
    }
    string+=`</url>\r\n`;
  }
  string += `</urlset>`;

  return string;
}

sitemapService.prototype.deleteFromSitemap = (sitemap, country, lang) => {
    var lang = lang.toLowerCase();
    var my_lang = (country+'-'+lang).toLowerCase();
    //if(lang=="si") lang="sl";
    var hreflang = lang +'-'+country.toLowerCase();

    for(var i=0;i<sitemap.length;i++){
        var a = sitemap[i].loc.split('/');
        if(a[3]==my_lang){
            sitemap.splice(i,1);
            i--;
            continue;
        }
        for(var j=0;j<sitemap[i].alt.length;j++){
            if(sitemap[i].alt[j].hreflang==hreflang){
                sitemap[i].alt.splice(j,1);
                j--;
            }
        }
    }

    return sitemap;
}

sitemapService.prototype.deleteFromSitemap1 = (sitemap, country, inputlangs, hreflangs) => {
  var countryU = country.toLowerCase();
  var countryL = country.toLowerCase();

  for(var i=0;i<sitemap.length;i++){
      var a = sitemap[i].loc.split('/');
      var b = a[3].split('-')[0];
      if(b==countryL && !inputlangs.find(il=>{return il==a[3]})){
          sitemap.splice(i,1);
          i--;
          continue;
      }
      for(var j=0;j<sitemap[i].alt.length;j++){
        var c = sitemap[i].alt[j].hreflang.split('-')[1];
        if(c==countryU && !hreflangs.find(hl=>{return hl==sitemap[i].alt[j].hreflang})){
            sitemap[i].alt.splice(j,1);
            j--;
        }
      }
  }

  return sitemap;
}

module.exports = new sitemapService();
