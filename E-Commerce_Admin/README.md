# admin-E-commerce

- IP serverja ki trenutno laufa admin.E-commerce: 194.24.128.67
- Login z SSH na: ssh root@194.24.128.67 -p 10022, geslo dobite drugje.
- IP rezervnega serverja: 201.16.245.122
- Login z SSH na: ssh root@201.16.245.122, geslo dobite drugje.
- Za SSL se uporablja Acme.php, navodila za instalacijo in pridobitev ssl certifikata najdemo na https://acmephp.github.io/

- Web server ki se uporablja je NGINX
- Uporablja se tudi Redis za socket connections, ni pa nujno
- Uporablja se PM2 - process manager, inštaliramo z npm i pm2 -g

1. Clone git repository
2. npm install
3. NODE_ENV=production webpack --progress --colors
4. NODE_ENV=production pm2 start server/server.js --name admin-E-commerce --update-env (če se nahajamo v project datoteki).

/home/scripts/ PREVERI
crontab -l  PREVERI
Certifikati so Certbot!


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
include /etc/nginx/sites-enabled/*.conf;
```

## Enable httpd in selinux
```
semanage permissive -a httpd_t
```

Potem v /etc/nginx/sites-available, kreiramo admin-E-commerce.conf

```
upstream admin.E-commerce {
        # our app will be on localhost port 4326, but you can change this here
        server                  194.24.128.67:4326 fail_timeout=0;
}

server {
        listen                  443;
        server_name             admin.E-commerce.com;

        ssl    on;
        ssl_certificate    /etc/nginx/ssl/acmephp/certs/admin.E-commerce.com/public/fullchain.pem;
        ssl_certificate_key    /etc/nginx/ssl/acmephp/certs/admin.E-commerce.com/private/key.private.pem;

        location / {
                proxy_set_header        Host \$host:\$server_port;
                proxy_set_header        X-Real-IP \$remote_addr;
                proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_set_header        X-Forwarded-Proto \$scheme;

                proxy_pass              http://localhost:4326;
        }

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
    server_name  admin.E-commerce.com;
    return	 301 https://admin.E-commerce.com$request_uri;
}
server {
    listen	 80;
    server_name  www.admin.E-commerce.com;
    return	 301 https://admin.E-commerce.com$request_uri;
}

```

# NGINX_HOST
  
## Link this conf to sites-enabled. it's important to use the full path
```
ln -s /etc/nginx/sites-available/admin-E-commerce.conf /etc/nginx/sites-enabled/admin-E-commerce.conf
 
nginx -t && (service nginx status > /dev/null && service nginx restart)
```

Potem če pri domenu na goddady imamo ustrezen ip, stran bo dostopna na admin.E-commerce.com
