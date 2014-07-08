function imagePath(imgFileName) {
    return App.IMG_PATH + imgFileName;
}

function buildFieldsCollection(propertiesServer, site, fromServer) {
    var item = buildField(propertiesServer, {fromServer: fromServer});
    if (fromServer)
        var p = site.properties;
    else {
        var p = site.properties();
        var files = site.files();
    }
    for (propertyCode in p) {
        if (item.code === propertyCode || parseInt(item["idfield"]) === parseInt(propertyCode)) {
            if (item.widgetType === "photo") {
                item.__value = "";
                if (fromServer)
                    item.__value = imagePath(p[propertyCode]);
                else {
                    var imageId = p[propertyCode];
                    var imageData = files[imageId];
                    item.__value = SiteCamera.dataWithMimeType(imageData);
                }
            }
            else if (item.widgetType === "select_many" || item.widgetType === "select_one") {
                item.__value = p[propertyCode];
                for (var k = 0; k < item.config.options.length; k++) {
                    item.config.options[k]["selected"] = "";
                    if (item.__value == true || item.__value == false) {
                        if (item.config.options[k].id == item.__value) {
                            item.config.options[k]["selected"] = "selected";
                        }
                    } else {
                        for (var j = 0; j < item.__value.length; j++) {
                            if (item.config.options[k].id == item.__value[j]) {
                                item.config.options[k]["selected"] = "selected";
                            }
                        }
                    }
                }
            }
            else if (item.widgetType === "hierarchy") {
                item.__value = p[propertyCode];
                item.displayHierarchy = Hierarchy.generateField(item.config, item.__value);
            }
            else if (item.widgetType === "date") {
                var val = p[propertyCode];
                if (val)
                    item.__value = convertDateWidgetToParam(val);
            }
            else
                item.__value = p[propertyCode];
            break;
        }
    }
    return item;
}

function buildField(fieldObj, options) {
    options = options || {};
    var field = {};
    var id = null;
    var fieldsBuild = [];
    var fieldsWrapper = {
        name_wrapper: fieldObj.name,
        id_wrapper: fieldObj.id,
        cId: localStorage.getItem("cId"),
        userId: getCurrentUser().id,
        fields: fieldsBuild
    };
    $.each(fieldObj.fields, function(key, fields) {
        if (options["fromServer"]) {
            field = fieldObj;
            id = fields.id;
        }
        else {
            field = fieldObj._data;
            id = fields.idfield();
        }
        var kind = fields.kind;
        var widgetType = kind;
        var config = fields.config;
        var slider = "";
        var ctrue = "";
        if (widgetType === "numeric") {
            widgetType = "number";
            config = "";
        }
        if (widgetType === "yes_no") {
            widgetType = "select_one";
            var configOptions = {options: [{"id": 0, "code": "1", "label": "NO"}, {"id": 1, "code": "2", "label": "YES"}]};
            config = configOptions;
            slider = "slider";
            ctrue = "true";
        }
        if (widgetType === "phone") {
            widgetType = "tel";
        }
        fieldsWrapper.fields.push({
            idfield: id,
            name: fields.name,
            kind: kind,
            code: fields.code,
            multiple: (kind === "select_many" ? "multiple" : ""),
            isPhoto: (kind === "photo" ? true : false),
            widgetType: widgetType,
            config: config,
            slider: slider,
            ctrue: ctrue
        });
        if (widgetType === "hierarchy") {
            fieldsWrapper.fields.isHierarchy = true;
            fieldsWrapper.displayHierarchy = Hierarchy.generateField(fieldsWrapper.fields.config, "");
        }
    });

    return fieldsWrapper;
}

function addField(fields) {
    cId = localStorage.getItem("cId");
    var fieldParams = {
        collection_id: cId,
        user_id: getCurrentUser().id,
        name_wrapper: fields.name_wrapper,
        id_wrapper: fields.id_wrapper,
        fields: fields.fields
    };
    var field = new Field(fieldParams);
    persistence.add(field);
    persistence.flush();
}

function queryFieldByCollectionIdOffline(callback) {
    var cId = localStorage.getItem("cId");
    Field.all().filter('collection_id', '=', cId).list(callback);
}

function synFieldForCurrentCollection(newFields) {
    queryFieldByCollectionIdOffline(function(field){
        removeFieldsInLocalDB(collections);
        addFieldsToLocalDB(newCollections);
    })
    var cId = localStorage.getItem("cId");
    Field.all().filter('collection_id', "=", newFields.id_wrapper).one(null, function(field) {
                console.log("field", fields);
                if (field === null) {
                    addField(fields);
                }
            });
    var currentCollection = getCurrentUser();
    Collection.all().filter('user_id', '=', currentUser.id).list(function(collections) {
        removeCollectionsToLocalDB(collections);
        addCollectionsToLocalDB(newCollections);
    });
}

function displayFieldRender(data) {
    var fieldTemplate = Handlebars.compile($("#field_collection-template").html());
    $('#div_field_collection').html(fieldTemplate({field_collections: data}));
    $('#div_field_collection').trigger("create");
}

function displayFieldUpdateTemplate(data) {
    var fieldTemplate = Handlebars.compile($("#update_field_collection-template").html());
    $('#div_update_field_collection').html(fieldTemplate({field_collections: data}));
    $('#div_update_field_collection').trigger("create");
}

function displayFieldUpdateOnlineTemplate(data) {
    var fieldTemplate = Handlebars.compile($("#update_field_collection-online-template").html());
    $('#div_update_field_collection_online').html(fieldTemplate({field_collections: data}));
    $('#div_update_field_collection_online').trigger("create");
}