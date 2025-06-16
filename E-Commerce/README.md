# E-Commerce-v4

- IP serverja ki trenutno laufa E-Commerce: 191.292.184.222
- Login z SSH na: ssh root@191.292.184.222 -p 10022, geslo dobite drugje.
- IP rezervnega serverja: 191.292.184.122
- Login z SSH na: ssh root@91.132.86.105, geslo dobite drugje.
- Za SSL se uporablja Acme.php, navodila za instalacijo in pridobitev ssl certifikata najdemo na https://acmephp.github.io/

- Web server ki se uporablja je NGINX
- Uporablja se tudi Redis za socket connections, ni pa nujno
- Uporablja se PM2 - process manager, inštaliramo z npm i pm2 -g

1. Clone git repository
2. npm install
3. npm run build
4. NODE_ENV=production pm2 start server.js --name E-Commerce --update-env (če se nahajamo v project datoteki).


# NGINX configuration

## Install nginx
```
yum install -y nginx
```
 
## Turn on for reboots
```
systemctl enable nginx
 
mkdir -p /etc/nginx/includes
mkdir -p /etc/nginx/sites-enabled
mkdir -p /etc/nginx/sites-available
```

## Use a conf file to include our sites-enabled conf files
```
cat <<SITESENABLED > /etc/nginx/includes/sites-enabled.conf
include                 /etc/nginx/sites-enabled/*.conf;
```

## Enable httpd in selinux
```
semanage permissive -a httpd_t
```

Potem v /etc/nginx/sites-available, kreiramo E-Commerce.conf

```
upstream E-Commerce {
        #our app will be on localhost port 9236, but you can change this here
        server                  191.292.184.222:9236 fail_timeout=0;
}

server {
        listen                  443;
        server_name             E-Commerce.com;
         
        #lokacija se ustrezno spremeni glede na acme.php in konfiguracijo linuxa
	      ssl    on;
        ssl_certificate    /etc/nginx/ssl/.acmephp/certs/E-Commerce.com/public/fullchain.pem;
        ssl_certificate_key    /etc/nginx/ssl/.acmephp/certs/E-Commerce.com/private/key.private.pem;

        #lokacija se ustrezno spremeni glede na acme.php in konfiguracijo linuxa
        ssl    on;
        ssl_certificate    /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key    /etc/nginx/ssl/key.private.pem;
        
        #lokacija se ustrezno spremeni glede na to ki se nahaja default error page, lahko se tudi zakomentira z #
        error_page 404 500 502 503 504 /custom_404.html;
        location = /custom_404.html {
                root /usr/share/nginx/html;
                internal;
        }


	location / {
                proxy_set_header        Host \$host:\$server_port;
                proxy_set_header        X-Real-IP \$remote_addr;
                proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header        X-Forwarded-Proto \$scheme;

                proxy_pass              http://localhost:9236;
        }
  
  #(to se pusti tak če je redis aktiven, drugač se zakomentira)
	location /socket.io {
                proxy_pass http://io_nodes2;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrad;
                proxy_set_header Connection "upgrad";
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $host;
                proxy_redirect off;
        }
}

server {
    listen	 80;
    server_name  E-Commerce.com;
    return	 301 https://E-Commerce.com$request_uri;
}
server {
    listen	 80;
    server_name  www.E-Commerce.com;
    return	 301 https://E-Commerce.com$request_uri;
}
```

# NGINX_HOST
  
## Link this conf to sites-enabled. it's important to use the full path
```
ln -s /etc/nginx/sites-available/E-Commerce.conf /etc/nginx/sites-enabled/E-Commerce.conf
 
nginx -t && (service nginx status > /dev/null && service nginx restart)
```

Potem če pri domenu na goddady imamo ustrezen ip, stran bo dostopna na E-Commerce.com
