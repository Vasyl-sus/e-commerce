const Busboy = require('busboy');
const bytes = require('bytes');
const debug = require('debug')('busboy-body-parser');

const HARDLIMIT = bytes('250mb');

module.exports = function (settings) {
    settings = settings || {};
    settings.limit = settings.limit || HARDLIMIT;
    settings.multi = settings.multi || false;

    if (typeof settings.limit === 'string') {
        settings.limit = bytes(settings.limit);
    }

    if (settings.limit > HARDLIMIT) {
        console.error('WARNING: busboy-body-parser file size limit set too high');
        console.error('busboy-body-parser can only handle files up to ' + HARDLIMIT + ' bytes');
        console.error('to handle larger files you should use a streaming solution.');
        settings.limit = HARDLIMIT;
    }

    return function multipartBodyParser(req, res, next) {
        if (req.is('multipart/form-data')) {
            let busboy;
            try {
                busboy = Busboy({
                    headers: req.headers,
                    limits: {
                        fileSize: settings.limit
                    }
                });
            } catch (err) {
                return next(err);
            }

            busboy.on('field', (key, value) => {
                debug('Received field %s: %s', key, value);
                if (value === 'null') value = null;
                if (key.length > 2 && key.substring(key.length - 2) === "[]") {
                    const k = key.substring(0, key.length - 2);
                    if (!req.body[k]) {
                        req.body[k] = [];
                    }
                    req.body[k].push(value);
                } else {
                    req.body[key] = value;
                }
            });

            busboy.on('file', (key, file, info) => {
                const { filename, encoding, mimeType } = info;
                const chunks = [];
                file.on('data', (data) => {
                    chunks.push(data);
                });
                file.on('end', () => {
                    const fileData = {
                        data: file.truncated ? null : Buffer.concat(chunks),
                        name: filename || null,
                        encoding: encoding,
                        mimetype: mimeType,
                        truncated: file.truncated,
                        size: file.truncated ? null : Buffer.byteLength(Buffer.concat(chunks), 'binary')
                    };

                    debug('Received file %s', file);

                    if (settings.multi) {
                        req.files[key] = req.files[key] || [];
                        req.files[key].push(fileData);
                    } else {
                        req.files[key] = fileData;
                    }
                });
            });

            let error;
            busboy.on('error', (err) => {
                debug('Error parsing form');
                debug(err);
                error = err;
                next(err);
            });

            busboy.on('finish', () => {
                if (error) return;
                debug('Finished form parsing');
                debug(req.body);
                next();
            });

            req.files = req.files || {};
            req.body = req.body || {};
            req.pipe(busboy);
        } else {
            next();
        }
    };
};