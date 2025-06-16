var config = require('../../config/environment/index');
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');


var Blog = function() {};


Blog.prototype.filterBlogposts = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }
        var sql_select = `SELECT DISTINCT b.*
        FROM blogposts as b
        LEFT JOIN blogposts_categories as bc ON b.id=bc.blogpost_id
        LEFT JOIN blogcategories as bcc ON bcc.name = bc.category
        LEFT JOIN blogposts_tags as bt ON b.id=bt.blogpost_id
        WHERE b.id IS NOT NULL `
        if (data.country) {
            sql_select += `AND b.country=${connection.escape(data.country)} `;
        }
        if (data.lang) {
            sql_select += `AND b.language=${connection.escape(data.lang)} `;
        }
        if (data.categories && data.categories.length > 0) {
            sql_select += `AND bcc.sef_link IN (${connection.escape(data.categories)}) `;
        }
        if (data.tags && data.tags.length > 0) {
            sql_select += `AND bt.tag IN (${connection.escape(data.tags)}) `;
        }
        sql_select += 'GROUP BY b.id ORDER BY b.date_added DESC ';
        if (data.pageNumber && data.pageLimit) {
            data.from = (data.pageNumber - 1) * data.pageLimit;
            sql_select += `limit ${data.from}, ${data.pageLimit} `;
        }


        connection.query(sql_select, (err, rows) => {
            if (err) {
                connection.release();
                return reject(err);
            }

            if (rows[0]) {
                var blogposts = rows;
                var blogpost_ids = rows.map(x => {
                    return connection.escape(x.id);
                });

                var sql_select_bi = `SELECT * FROM blogposts_images WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_bc = `SELECT * FROM blogposts_categories WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_bt = `SELECT * FROM blogposts_tags WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_ba = `SELECT ba.blogpost_id, a.*, ai.id as img_id, ai.accessory_id, ai.profile_img, ai.name as img_name, ai.type, ai.link FROM blogposts_accessories as ba
                            INNER JOIN accessories as a ON ba.accessory_id = a.id
                            LEFT JOIN accessories_images as ai ON a.id = ai.accessory_id
                            WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_bth = `SELECT bt.blogpost_id, t.*, ti.id as img_id,ti.therapy_id, ti.profile_img, ti.name as img_name, ti.type, ti.link, ti.pattern_img, ti.background_img FROM blogposts_therapies as bt
                            INNER JOIN therapies as t ON bt.therapy_id = t.id
                            LEFT JOIN therapies_images as ti ON t.id = ti.therapy_id
                            WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
                connection.query = bluebird.promisify(connection.query);
                connection.rollback = bluebird.promisify(connection.rollback);
                connection.beginTransaction().then(() => {
                    var queries = [];
                    queries.push(connection.query(sql_select_bi));
                    queries.push(connection.query(sql_select_bc));
                    queries.push(connection.query(sql_select_bt));
                    queries.push(connection.query(sql_select_ba));
                    queries.push(connection.query(sql_select_bth));
                    return bluebird.all(queries);
                }).then((results) => {
                    for (var i = 0; i < blogposts.length; i++) {
                        blogposts[i].profile_image = results[0] && results[0].filter(r => { return r.profile_img == 1 && r.blogpost_id == blogposts[i].id }) || null;
                        blogposts[i].big_image = results[0] && results[0].filter(r => { return r.profile_img == 2 && r.blogpost_id == blogposts[i].id }) || null;
                        blogposts[i].images = results[0] && results[0].filter(r => { return r.profile_img == 0 && r.blogpost_id == blogposts[i].id }) || [];
                        blogposts[i].categories = results[1] && results[1].filter(r => { return r.blogpost_id == blogposts[i].id }).map(r => { return r.category }) || [];
                        blogposts[i].tags = results[2] && results[2].filter(r => { return r.blogpost_id == blogposts[i].id }).map(r => { return r.tag }) || [];

                        blogposts[i].accessories = results[3] && results[3].filter(r => { return r.blogpost_id == blogposts[i].id }) || [];
                        blogposts[i].therapies = results[4] && results[4].filter(r => { return r.blogpost_id == blogposts[i].id }) || [];

                        if (blogposts[i].accessories.length > 0) {
                            let accessories_ids = [...new Set(blogposts[i].accessories.map(accessory => accessory.id))];
                            var accessories_holder = [];
                            for (var j = 0; j < accessories_ids.length; ++j) {
                                var singleAccessory = {};
                                var singleAccessoryImages = [];
                                for (var k = 0; k < blogposts[i].accessories.length; ++k) {
                                    if (accessories_ids[j] == blogposts[i].accessories[k].id) {
                                        singleAccessory.id = blogposts[i].accessories[k].id;
                                        singleAccessory.name = blogposts[i].accessories[k].name;
                                        singleAccessory.description = blogposts[i].accessories[k].description;
                                        singleAccessory.regular_price = blogposts[i].accessories[k].regular_price;
                                        singleAccessory.reduced_price = blogposts[i].accessories[k].reduced_price;
                                        singleAccessory.country = blogposts[i].accessories[k].country;
                                        singleAccessory.seo_link = blogposts[i].accessories[k].seo_link;
                                        singleAccessory.meta_title = blogposts[i].accessories[k].meta_title;
                                        singleAccessory.meta_description = blogposts[i].accessories[k].meta_description;
                                        singleAccessory.language = blogposts[i].accessories[k].language;
                                        singleAccessory.product_id = blogposts[i].accessories[k].product_id;

                                        let img = {
                                            id: blogposts[i].accessories[k].img_id,
                                            accessory_id: blogposts[i].accessories[k].accessory_id,
                                            profile_img: blogposts[i].accessories[k].profile_img,
                                            link: blogposts[i].accessories[k].link,
                                            type: blogposts[i].accessories[k].type,
                                            name: blogposts[i].accessories[k].img_name
                                        }
                                        singleAccessoryImages.push(img);
                                    }
                                }
                                singleAccessory.images = singleAccessoryImages;
                                accessories_holder.push(singleAccessory);
                            }
                            blogposts[i].accessories = accessories_holder;
                        }

                        if (blogposts[i].therapies.length > 0) {
                            let therapies_ids = [...new Set(blogposts[i].therapies.map(therapy => therapy.id))];
                            var therapies_holder = [];
                            for (var j = 0; j < therapies_ids.length; ++j) {
                                var singleTherapy = {};
                                var singleTherapyImages = [];
                                for (var k = 0; k < blogposts[i].therapies.length; ++k) {
                                    if (therapies_ids[j] == blogposts[i].therapies[k].id) {
                                        singleTherapy.id = blogposts[i].therapies[k].id;
                                        singleTherapy.blogpost_id = blogposts[i].therapies[k].blogpost_id;
                                        singleTherapy.date_added = blogposts[i].therapies[k].date_added;
                                        singleTherapy.total_price = blogposts[i].therapies[k].total_price;
                                        singleTherapy.seo_link = blogposts[i].therapies[k].seo_link;
                                        singleTherapy.country = blogposts[i].therapies[k].country;
                                        singleTherapy.view_label = blogposts[i].therapies[k].view_label;
                                        singleTherapy.meta_title = blogposts[i].therapies[k].meta_title;
                                        singleTherapy.meta_description = blogposts[i].therapies[k].meta_description;
                                        singleTherapy.language = blogposts[i].therapies[k].language;
                                        singleTherapy.title_color = blogposts[i].therapies[k].title_color;

                                        let img = {
                                            id: blogposts[i].therapies[k].img_id,
                                            therapy_id: blogposts[i].therapies[k].therapy_id,
                                            profile_img: blogposts[i].therapies[k].profile_img,
                                            pattern_img: blogposts[i].therapies[k].pattern_img,
                                            background_img: blogposts[i].therapies[k].background_img,
                                            link: blogposts[i].therapies[k].link,
                                            type: blogposts[i].therapies[k].type,
                                            img_name: blogposts[i].therapies[k].img_name
                                        }
                                        singleTherapyImages.push(img);
                                    }
                                }
                                singleTherapy.images = singleTherapyImages;
                                therapies_holder.push(singleTherapy);
                            }
                            blogposts[i].therapies = therapies_holder;
                        }
                    }

                    return connection.commit();
                }).then(() => {
                    connection.release();
                    resolve(blogposts);
                    return;
                }).catch(err => {
                    return connection.rollback().then(() => {
                        connection.release();
                        return reject(err);
                    });
                });
            } else {
                connection.release();
                resolve(rows);
            }
        });
    });
    });
}

Blog.prototype.countFilterBlogposts = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }

        var sql_select = `SELECT count(distinct b.id) as count
        FROM blogposts as b
        LEFT JOIN blogposts_categories as bc ON b.id=bc.blogpost_id
        LEFT JOIN blogcategories as bcc ON bcc.name = bc.category
        LEFT JOIN blogposts_tags as bt ON b.id=bt.blogpost_id
        WHERE b.id IS NOT NULL `
        if (data.country) {
            sql_select += `AND b.country=${connection.escape(data.country)} `;
        }
        if (data.lang) {
            sql_select += `AND b.language=${connection.escape(data.lang)} `;
        }
        if (data.categories && data.categories.length > 0) {
            sql_select += `AND bc.category IN (${connection.escape(data.categories)}) `;
        }
        if (data.tags && data.tags.length > 0) {
            sql_select += `AND bt.tag IN (${connection.escape(data.tags)}) `;
        }

        connection.query(sql_select, (err, rows) => {
            connection.release();
            if (err) {
                return reject(err);
            }
            resolve(rows[0].count);
        });


    });
    });
}

Blog.prototype.getBlogpostDetails = id => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }

        var blogpost;

        var sql_select = `SELECT * FROM blogposts WHERE id = ${connection.escape(id)}`;
        var sql_select1 = `SELECT * FROM blogposts_images WHERE blogpost_id = ${connection.escape(id)}`;
        var sql_select2 = `SELECT * FROM blogposts_categories WHERE blogpost_id = ${connection.escape(id)}`;
        var sql_select3 = `SELECT * FROM blogposts_tags WHERE blogpost_id = ${connection.escape(id)}`;
        var sql_select4 = `SELECT ba.blogpost_id, a.*, ai.id as img_id, ai.accessory_id, ai.profile_img, ai.name as img_name, ai.type, ai.link FROM blogposts_accessories as ba
        INNER JOIN accessories as a ON ba.accessory_id = a.id
        LEFT JOIN accessories_images as ai ON a.id = ai.accessory_id
        WHERE ba.blogpost_id = ${connection.escape(id)}`;
        var sql_select5 = `SELECT bt.blogpost_id, t.*, ti.id as img_id,ti.therapy_id, ti.profile_img, ti.name as img_name, ti.type, ti.link, ti.pattern_img, ti.background_img FROM blogposts_therapies as bt
        INNER JOIN therapies as t ON bt.therapy_id = t.id
        LEFT JOIN therapies_images as ti ON t.id = ti.therapy_id
        WHERE bt.blogpost_id = ${connection.escape(id)}`;

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            var queries = [];
            queries.push(connection.query(sql_select));
            queries.push(connection.query(sql_select1));
            queries.push(connection.query(sql_select2));
            queries.push(connection.query(sql_select3));
            queries.push(connection.query(sql_select4));
            queries.push(connection.query(sql_select5));
            return bluebird.all(queries);
        }).then((results) => {
            blogpost = results[0][0];
            if (blogpost) {
                blogpost.profile_image = results[1] && results[1].filter(r => { return r.profile_img == 1 }) || null;
                blogpost.big_image = results[1] && results[1].filter(r => { return r.profile_img == 2 }) || null;
                blogpost.images = results[1] && results[1].filter(r => { return r.profile_img == 0 }) || [];
                blogpost.categories = results[2] && results[2].map(r => { return r.category }) || [];
                blogpost.tags = results[3] && results[3].map(r => { return r.tag }) || [];
                blogpost.accessories = results[4] && results[4].filter(r => { return r.blogpost_id == blogpost.id }) || [];
                blogpost.therapies = results[5] && results[5].filter(r => { return r.blogpost_id == blogpost.id }) || [];

                if (blogpost.accessories.length > 0) {
                    let accessories_ids = [...new Set(blogpost.accessories.map(accessory => accessory.id))];
                    var accessories_holder = [];
                    for (var j = 0; j < accessories_ids.length; ++j) {
                        var singleAccessory = {};
                        var singleAccessoryImages = [];
                        for (var k = 0; k < blogpost.accessories.length; ++k) {
                            if (accessories_ids[j] == blogpost.accessories[k].id) {
                                singleAccessory.id = blogpost.accessories[k].id;
                                singleAccessory.name = blogpost.accessories[k].name;
                                singleAccessory.description = blogpost.accessories[k].description;
                                singleAccessory.regular_price = blogpost.accessories[k].regular_price;
                                singleAccessory.reduced_price = blogpost.accessories[k].reduced_price;
                                singleAccessory.country = blogpost.accessories[k].country;
                                singleAccessory.seo_link = blogpost.accessories[k].seo_link;
                                singleAccessory.meta_title = blogpost.accessories[k].meta_title;
                                singleAccessory.meta_description = blogpost.accessories[k].meta_description;
                                singleAccessory.language = blogpost.accessories[k].language;
                                singleAccessory.product_id = blogpost.accessories[k].product_id;

                                let img = {
                                    id: blogpost.accessories[k].img_id,
                                    accessory_id: blogpost.accessories[k].accessory_id,
                                    profile_img: blogpost.accessories[k].profile_img,
                                    link: blogpost.accessories[k].link,
                                    type: blogpost.accessories[k].type,
                                    name: blogpost.accessories[k].img_name
                                }
                                singleAccessoryImages.push(img);
                            }
                        }
                        singleAccessory.images = singleAccessoryImages;
                        accessories_holder.push(singleAccessory);
                    }
                    blogpost.accessories = accessories_holder;
                }

                if (blogpost.therapies.length > 0) {
                    let therapies_ids = [...new Set(blogpost.therapies.map(therapy => therapy.id))];
                    var therapies_holder = [];
                    for (var j = 0; j < therapies_ids.length; ++j) {
                        var singleTherapy = {};
                        var singleTherapyImages = [];
                        for (var k = 0; k < blogpost.therapies.length; ++k) {
                            if (therapies_ids[j] == blogpost.therapies[k].id) {
                                singleTherapy.id = blogpost.therapies[k].id;
                                singleTherapy.blogpost_id = blogpost.therapies[k].blogpost_id;
                                singleTherapy.date_added = blogpost.therapies[k].date_added;
                                singleTherapy.total_price = blogpost.therapies[k].total_price;
                                singleTherapy.seo_link = blogpost.therapies[k].seo_link;
                                singleTherapy.country = blogpost.therapies[k].country;
                                singleTherapy.view_label = blogpost.therapies[k].view_label;
                                singleTherapy.meta_title = blogpost.therapies[k].meta_title;
                                singleTherapy.meta_description = blogpost.therapies[k].meta_description;
                                singleTherapy.language = blogpost.therapies[k].language;
                                singleTherapy.title_color = blogpost.therapies[k].title_color;

                                let img = {
                                    id: blogpost.therapies[k].img_id,
                                    therapy_id: blogpost.therapies[k].therapy_id,
                                    profile_img: blogpost.therapies[k].profile_img,
                                    pattern_img: blogpost.therapies[k].pattern_img,
                                    background_img: blogpost.therapies[k].background_img,
                                    link: blogpost.therapies[k].link,
                                    type: blogpost.therapies[k].type,
                                    img_name: blogpost.therapies[k].img_name
                                }
                                singleTherapyImages.push(img);
                            }
                        }
                        singleTherapy.images = singleTherapyImages;
                        therapies_holder.push(singleTherapy);
                    }
                    blogpost.therapies = therapies_holder;
                }
            }
            return connection.commit();
        }).then(() => {
            connection.release();
            resolve(blogpost);
            return;
        }).catch(err => {
            return connection.rollback().then(() => {
                connection.release();
                return reject(err);
            });
        });
    });

    });
}

Blog.prototype.getBlogpostDetailsByUrl = (url, country, lang) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }

        var hostname = "https://E-Commerce.com/"
        if (process.env.NODE_ENV === 'production')
            hostname = config.server.hostname;

        var where_statement = `
            WHERE b.url = ${connection.escape(url)}
            AND b.country = ${connection.escape(country)}
            AND b.language = ${connection.escape(lang)} `

        var blogpost;
        var sql_select = `SELECT b.*
        FROM blogposts as b
        ${where_statement}`;
        var sql_select1 = `SELECT bi.*
        FROM blogposts_images as bi
        INNER JOIN blogposts as b ON b.id=bi.blogpost_id
        ${where_statement}`;
        var sql_select2 = `SELECT bc.*
        FROM blogposts_categories as bc
        INNER JOIN blogposts as b ON b.id=bc.blogpost_id
        ${where_statement}`;
        var sql_select3 = `SELECT bt.*
        FROM blogposts_tags as bt
        INNER JOIN blogposts as b ON b.id=bt.blogpost_id
        ${where_statement}`;
        var sql_select4 = `SELECT b1.url, b1.country, b1.language
        FROM blogposts_linked as bl
        INNER JOIN blogposts as b ON b.id=bl.blogpost_id
        INNER JOIN blogposts as b1 ON b1.id=bl.linked_blogpost_id
        WHERE b.url = ${connection.escape(url)}`;
        var sql_select8 = `SELECT b1.url, b1.country, b1.language
        FROM blogposts_linked as bl
        INNER JOIN blogposts as b ON b.id=bl.linked_blogpost_id
        INNER JOIN blogposts as b1 ON b1.id=bl.blogpost_id
        WHERE b.url = ${connection.escape(url)}`;
        var sql_select5 = `SELECT ba.blogpost_id, a.*, ai.id as img_id, ai.profile_img, ai.name as img_name, ai.type as img_type, ai.link as img_link
        FROM blogposts_accessories as ba
        INNER JOIN blogposts as b ON ba.blogpost_id = b.id
        INNER JOIN accessories as a ON ba.accessory_id = a.id
        LEFT JOIN accessories_images as ai ON (a.id = ai.accessory_id AND ai.profile_img=1)
        ${where_statement}`;
        var sql_select6 = `SELECT bt.blogpost_id, t.*, ti.id as img_id, ti.profile_img, ti.name as img_name, ti.type as img_type, ti.link as img_link
        FROM blogposts_therapies as bt
        INNER JOIN blogposts as b ON bt.blogpost_id = b.id
        INNER JOIN therapies as t ON bt.therapy_id = t.id
        LEFT JOIN therapies_images as ti ON (t.id = ti.therapy_id AND ti.profile_img=1)
        ${where_statement}`;
        var sql_select7 = `select rb.*, rbi.id as img_id, rbi.profile_img, rbi.name as img_name, rbi.type as img_type, rbi.link as img_link, rbi.img_size
        from blogposts as rb
        inner join blogposts_categories as rbc on rb.id = rbc.blogpost_id
        left join blogposts_images as rbi on (rb.id = rbi.blogpost_id AND rbi.profile_img=1)
        WHERE rbc.category IN (select bc.category from blogposts as b
        inner join blogposts_categories as bc on b.id = bc.blogpost_id
        ${where_statement}
        AND b.id<>rb.id)
        AND rb.country = ${connection.escape(country)}
        AND rb.language = ${connection.escape(lang)}
        ORDER BY rb.date_added DESC;`;

        connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
        connection.query = bluebird.promisify(connection.query);
        connection.rollback = bluebird.promisify(connection.rollback);
        connection.beginTransaction().then(() => {
            var queries = [];
            queries.push(connection.query(sql_select));
            queries.push(connection.query(sql_select1));
            queries.push(connection.query(sql_select2));
            queries.push(connection.query(sql_select3));
            queries.push(connection.query(sql_select4));
            queries.push(connection.query(sql_select5));
            queries.push(connection.query(sql_select6));
            queries.push(connection.query(sql_select7));
            //queries.push(connection.query(sql_select8));

            return bluebird.all(queries);
        }).then((results) => {
            blogpost = results[0][0];
            if (blogpost) {
                blogpost.profile_image = results[1] && results[1].filter(r => { return r.profile_img == 1 }) || null;
                blogpost.big_image = results[1] && results[1].filter(r => { return r.profile_img == 2 }) || null;
                blogpost.images = results[1] && results[1].filter(r => { return r.profile_img == 0 }) || [];
                blogpost.categories = results[2] && results[2].map(r => { return r.category }) || [];
                blogpost.tags = results[3] && results[3].map(r => { return r.tag }) || [];
                //var linked_posts = results[4] && results[4].map(r=>{return `${hostname}${(r.country+'-'+r.language).toLowerCase()}/blog/${r.url}`}) || [];

                blogpost.linked_posts = results[4] && results[4].map(r => {
                    return {
                        link: `${hostname}${(r.language+'-'+r.country).toLowerCase()}/blog/${r.url}`,
                        hreflang: `${r.language.toLowerCase()+'-'+r.country.toLowerCase()}`
                    }
                })

                // results[8].map(r => {
                //     blogpost.linked_posts.push({
                //         link: `${hostname}${(r.language+'-'+r.country).toLowerCase()}/blog/${r.url}`,
                //         hreflang: `${r.language.toLowerCase()+'-'+r.country.toLowerCase()}`
                //     })
                // })

                blogpost.accessories = results[5] && results[5].filter(r => { return r.blogpost_id == blogpost.id }) || [];
                blogpost.therapies = results[6] && results[6].filter(r => { return r.blogpost_id == blogpost.id }) || [];
                blogpost.related_blogposts = [];
                var rposts = results[7] || [];
                var post = {};

                for(var i = 0; i < rposts.length; i++){
                    var img = rposts[i].img_id && {
                        id: rposts[i].img_id,
                        profile_img: rposts[i].profile_img,
                        img_size: rposts[i].img_size,
                        name: rposts[i].img_name,
                        type: rposts[i].img_type,
                        link: rposts[i].img_link
                    } || null;

                    if(img){
                        delete rposts[i].img_id;
                        delete rposts[i].profile_img;
                        delete rposts[i].img_name;
                        delete rposts[i].img_type;
                        delete rposts[i].img_link;
                        delete rposts[i].img_size;

                        if(rposts[i].id!=post.id){
                            post = rposts[i];
                            post.profile_image = [];
                        }

                        post.profile_image.push(img);
                    }

                    if(i==rposts.length-1 || post.id!=rposts[i+1].id && blogpost.related_blogposts.length < 5){
                        blogpost.related_blogposts.push(post);
                    }
                }
                /*
                for(var i = 0; i < blogpost.related_blogposts.length; i++){
                    blogpost.related_blogposts[i].profile_image = blogpost.related_blogposts[i].img_id && {
                        id: blogpost.related_blogposts[i].img_id,
                        profile_img: blogpost.related_blogposts[i].profile_img,
                        name: blogpost.related_blogposts[i].img_name,
                        type: blogpost.related_blogposts[i].img_type,
                        link: blogpost.related_blogposts[i].img_link
                    } || null;

                    delete blogpost.related_blogposts[i].img_id;
                    delete blogpost.related_blogposts[i].profile_img;
                    delete blogpost.related_blogposts[i].img_name;
                    delete blogpost.related_blogposts[i].img_type;
                    delete blogpost.related_blogposts[i].img_link;
                }
                */

                for(var i = 0; i < blogpost.accessories.length; i++){
                    blogpost.accessories[i].profile_image = blogpost.accessories[i].img_id && {
                        id: blogpost.accessories[i].img_id,
                        profile_img: blogpost.accessories[i].profile_img,
                        name: blogpost.accessories[i].img_name,
                        type: blogpost.accessories[i].img_type,
                        link: blogpost.accessories[i].img_link
                    } || null;

                    delete blogpost.accessories[i].img_id;
                    delete blogpost.accessories[i].profile_img;
                    delete blogpost.accessories[i].img_name;
                    delete blogpost.accessories[i].img_type;
                    delete blogpost.accessories[i].img_link;
                    delete blogpost.accessories[i].blogpost_id;
                }

                for(var i = 0; i < blogpost.therapies.length; i++){
                    blogpost.therapies[i].profile_image = blogpost.therapies[i].img_id && {
                        id: blogpost.therapies[i].img_id,
                        profile_img: blogpost.therapies[i].profile_img,
                        name: blogpost.therapies[i].img_name,
                        type: blogpost.therapies[i].img_type,
                        link: blogpost.therapies[i].img_link
                    } || null;

                    delete blogpost.therapies[i].img_id;
                    delete blogpost.therapies[i].profile_img;
                    delete blogpost.therapies[i].img_name;
                    delete blogpost.therapies[i].img_type;
                    delete blogpost.therapies[i].img_link;
                    delete blogpost.therapies[i].blogpost_id;
                }
            }
            return connection.commit();
        }).then(() => {
            connection.release();
            resolve(blogpost);
            return;
        }).catch(err => {
            return connection.rollback().then(() => {
                connection.release();
                return reject(err);
            });
        });
    });

    });
}

Blog.prototype.filterBlogCategories = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }
        var sql_select = `SELECT *
        FROM blogcategories `;

        if (data.pageNumber && data.pageLimit) {
            data.from = (data.pageNumber - 1) * data.pageLimit;
            sql_select += `limit ${data.from}, ${data.pageLimit}`;
        }

        connection.query(sql_select, (err, rows) => {
            connection.release();
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });

    });
}

Blog.prototype.countFilterBlogCategories = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }

        var sql_select = `SELECT count(id) as count
        FROM blogcategories `;

        connection.query(sql_select, (err, rows) => {
            connection.release();
            if (err) {
                return reject(err);
            }
            resolve(rows[0].count);
        });
    });

    });
}

Blog.prototype.getSliders = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }
        var sql_select = `SELECT b.*
        FROM blogposts as b
        WHERE b.id IS NOT NULL
        AND b.slider=1
        AND b.country=${connection.escape(data.country)}
        AND b.language=${connection.escape(data.lang)} `;

        sql_select += 'ORDER BY b.date_added DESC';

        connection.query(sql_select, (err, rows) => {
            if (err) {
                connection.release();
                return reject(err);
            }

            if (rows[0]) {
                var blogposts = rows;
                var blogpost_ids = rows.map(x => {
                    return connection.escape(x.id);
                });

                var sql_select_bi = `SELECT * FROM blogposts_images WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_bc = `SELECT * FROM blogposts_categories WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_bt = `SELECT * FROM blogposts_tags WHERE blogpost_id IN (${blogpost_ids.join()}) `;

                connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
                connection.query = bluebird.promisify(connection.query);
                connection.rollback = bluebird.promisify(connection.rollback);
                connection.beginTransaction().then(() => {
                    var queries = [];
                    queries.push(connection.query(sql_select_bi));
                    queries.push(connection.query(sql_select_bc));
                    queries.push(connection.query(sql_select_bt));
                    return bluebird.all(queries);
                }).then((results) => {
                    for (var i = 0; i < blogposts.length; i++) {
                        blogposts[i].profile_image = results[0] && results[0].filter(r => { return r.profile_img == 1 && r.blogpost_id == blogposts[i].id }) || null;
                        blogposts[i].big_image = results[0] && results[0].filter(r => { return r.profile_img == 2 && r.blogpost_id == blogposts[i].id }) || null;
                        blogposts[i].images = results[0] && results[0].filter(r => { return r.profile_img == 0 && r.blogpost_id == blogposts[i].id }) || [];
                        blogposts[i].categories = results[1] && results[1].filter(r => { return r.blogpost_id == blogposts[i].id }).map(r => { return r.category }) || [];
                        blogposts[i].tags = results[2] && results[2].filter(r => { return r.blogpost_id == blogposts[i].id }).map(r => { return r.tag }) || [];
                    }
                    return connection.commit();
                }).then(() => {
                    connection.release();
                    resolve(blogposts);
                    return;
                }).catch(err => {
                    return connection.rollback().then(() => {
                        connection.release();
                        return reject(err);
                    });
                });
            } else {
                connection.release();
                resolve(rows);
            }
        });
    });

    });
}

Blog.prototype.getFavourites = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }
        var sql_select = `SELECT b.*
        FROM blogposts as b
        WHERE b.id IS NOT NULL
        AND b.starred=1
        AND b.country=${connection.escape(data.country)}
        AND b.language=${connection.escape(data.lang)} `;

        sql_select += 'ORDER BY b.date_added DESC LIMIT 0,4';

        connection.query(sql_select, (err, rows) => {
            if (err) {
                connection.release();
                return reject(err);
            }

            if (rows[0]) {
                var blogposts = rows;
                var blogpost_ids = rows.map(x => {
                    return connection.escape(x.id);
                });

                var sql_select_bi = `SELECT * FROM blogposts_images WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_bc = `SELECT * FROM blogposts_categories WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_bt = `SELECT * FROM blogposts_tags WHERE blogpost_id IN (${blogpost_ids.join()}) `;

                connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
                connection.query = bluebird.promisify(connection.query);
                connection.rollback = bluebird.promisify(connection.rollback);
                connection.beginTransaction().then(() => {
                    var queries = [];
                    queries.push(connection.query(sql_select_bi));
                    queries.push(connection.query(sql_select_bc));
                    queries.push(connection.query(sql_select_bt));
                    return bluebird.all(queries);
                }).then((results) => {
                    for (var i = 0; i < blogposts.length; i++) {
                        blogposts[i].profile_image = results[0] && results[0].filter(r => { return r.profile_img == 1 && r.blogpost_id == blogposts[i].id }) || null;
                        blogposts[i].big_image = results[0] && results[0].filter(r => { return r.profile_img == 1 && r.blogpost_id == blogposts[i].id }) || null;
                        blogposts[i].images = results[0] && results[0].filter(r => { return r.profile_img == 0 && r.blogpost_id == blogposts[i].id }) || [];
                        blogposts[i].categories = results[1] && results[1].filter(r => { return r.blogpost_id == blogposts[i].id }).map(r => { return r.category }) || [];
                        blogposts[i].tags = results[2] && results[2].filter(r => { return r.blogpost_id == blogposts[i].id }).map(r => { return r.tag }) || [];
                    }
                    return connection.commit();
                }).then(() => {
                    connection.release();
                    resolve(blogposts);
                    return;
                }).catch(err => {
                    return connection.rollback().then(() => {
                        connection.release();
                        return reject(err);
                    });
                });
            } else {
                connection.release();
                resolve(rows);
            }
        });
    });

    });
}

Blog.prototype.getBlogpostsByTags = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }
        var sql_select = `SELECT b.*, COUNT(bt.id) as matched_tags_count
        FROM blogposts as b
        INNER JOIN blogposts_tags as bt ON b.id=bt.blogpost_id
        WHERE b.id IS NOT NULL
        AND bt.tag IN (${connection.escape(data.tags)})
        AND b.country=${connection.escape(data.country)}
        AND b.language=${connection.escape(data.lang)}
        AND b.id<>${connection.escape(data.blogpost_id)}
        GROUP BY b.id
        ORDER BY matched_tags_count DESC, b.date_added DESC
        LIMIT 0,4 `;
        console.log(sql_select);
        connection.query(sql_select, (err, rows) => {
            if (err) {
                connection.release();
                return reject(err);
            }

            if (rows[0]) {
                var blogposts = rows;
                var blogpost_ids = rows.map(x => {
                    return connection.escape(x.id);
                });

                var sql_select_bi = `SELECT * FROM blogposts_images WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_bc = `SELECT * FROM blogposts_categories WHERE blogpost_id IN (${blogpost_ids.join()}) `;
                var sql_select_bt = `SELECT * FROM blogposts_tags WHERE blogpost_id IN (${blogpost_ids.join()}) `;

                connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
                connection.query = bluebird.promisify(connection.query);
                connection.rollback = bluebird.promisify(connection.rollback);
                connection.beginTransaction().then(() => {
                    var queries = [];
                    queries.push(connection.query(sql_select_bi));
                    queries.push(connection.query(sql_select_bc));
                    queries.push(connection.query(sql_select_bt));
                    return bluebird.all(queries);
                }).then((results) => {
                    for (var i = 0; i < blogposts.length; i++) {
                        blogposts[i].profile_image = results[0] && results[0].filter(r => { return r.profile_img == 1 && r.blogpost_id == blogposts[i].id }) || null;
                        blogposts[i].big_image = results[0] && results[0].filter(r => { return r.profile_img == 2 && r.blogpost_id == blogposts[i].id }) || null;
                        blogposts[i].images = results[0] && results[0].filter(r => { return r.profile_img == 0 && r.blogpost_id == blogposts[i].id }) || [];
                        blogposts[i].categories = results[1] && results[1].filter(r => { return r.blogpost_id == blogposts[i].id }).map(r => { return r.category }) || [];
                        blogposts[i].tags = results[2] && results[2].filter(r => { return r.blogpost_id == blogposts[i].id }).map(r => { return r.tag }) || [];
                    }
                    return connection.commit();
                }).then(() => {
                    connection.release();
                    resolve(blogposts);
                    return;
                }).catch(err => {
                    return connection.rollback().then(() => {
                        connection.release();
                        return reject(err);
                    });
                });
            } else {
                connection.release();
                resolve(rows);
            }
        });
    });

    });
}

Blog.prototype.getBlogCategories = (country, lang) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }

        // var sql_select = `SELECT DISTINCT bc.category
        // FROM blogposts_categories as bc
        // INNER JOIN blogposts as b ON b.id=bc.blogpost_id
        // WHERE b.country=${connection.escape(country)}
        // AND b.language=${connection.escape(lang)} `;
        let sql_select = `SELECT * FROM blogcategories
                        WHERE lang = ${connection.escape(lang)}`

        connection.query(sql_select, (err, rows) => {
            connection.release();
            if (err) {
                return reject(err);
            }

            resolve(rows);
        });
    });

    });
}

Blog.prototype.getBlogTags = (country, lang) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            return reject(err);
        }

        var sql_select = `SELECT DISTINCT bt.tag
        FROM blogposts_tags as bt
        INNER JOIN blogposts as b ON b.id=bt.blogpost_id
        WHERE b.country=${connection.escape(country)}
        AND b.language=${connection.escape(lang)} `;

        connection.query(sql_select, (err, rows) => {
            connection.release();
            if (err) {
                return reject(err);
            }

            var result = rows.map(r => {
                return r.tag;
            })

            resolve(result);
        });
    });

    });
}

module.exports = new Blog();
