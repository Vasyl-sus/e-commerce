var admingroupValidationMiddleware = function () {};

/***
* ADMIN GROUP VALIDATION MIDDLEWARE
*/
admingroupValidationMiddleware.prototype.validate = function (req, res, next) {
    var admin = req.admin;

    if (!admin) {
        res.status(401).json({ success: false, error: "admin_required" });
        return;
    }
    try{
        var permission_exists = false;
        var permissions = req.admin.adminGroup.permissions;
        var base_url = req.baseUrl;
        var sub_path = "";
        var sub_path1 = "";

        var i = req.url.indexOf("?");
        if(i!=-1){
            sub_path = req.url.substring(0, i);
        } else {
            i = req.url.lastIndexOf("/");
            sub_path = req.url.substring(0, i+1);
            sub_path1 = req.url.substring(0, i);
        }

        var route = base_url + sub_path;
        var route1 = base_url + sub_path1;

        permission_exists = (permissions[route] && permissions[route][req.method]) || 
                            (permissions[route1] && permissions[route1][req.method]) || false;

        if(permission_exists){
            next();
        } else {
            res.status(401).json({ success: false, error: "permission_required" });
            return;
        }
    } catch(err) {
        logger.error("admingroupValidationMiddleware: try-catch - ERROR: "+err.message);
    }

};


module.exports = new admingroupValidationMiddleware();