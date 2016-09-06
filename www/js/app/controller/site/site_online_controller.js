var SiteOnlineController = {
  add: function (data, callback) {
    ViewBinding.setBusy(true);
    SiteModel.create(data, callback, function () {
      ViewBinding.setAlert("Please send data again.");
    });
  },
  getByCollectionId: function () {
    var cId = CollectionController.id;
    var offset = SiteModel.sitePage * SiteModel.limit;
    ViewBinding.setBusy(true);
    SiteModel.fetch(cId, offset, function (response) {
      var siteOnlineData = [];
      $.map(response["sites"], function (data) {
        var date = data.created_at;
        date = new Date(date);
        date = dateToParam(date);
        var item = {id: data.id,
          name: data.name ? data.name : "\u00A0",
          collection_id: data.collection_id,
          collectionName: "",
          date: date,
          link: "#page-form-site"
        };
        siteOnlineData.push(item);
      });
      var hasMoreSites = false;
      var siteLength = response["sites"].length + offset;
      if (siteLength < response["total"]) {
        hasMoreSites = true;
      }
      var siteData = {
        hasMoreSites: hasMoreSites,
        state: "online",
        siteList: siteOnlineData};
      SiteView.display($('#site-list-online'), siteData);
    });
  },
  updateBySiteId: function () {
    ViewBinding.setBusy(true);
    var data = SiteController.params();
    attr = {
      "_method": "put",
      "site": data
    };
    SiteModel.update(attr, function () {
      App.redirectTo("#page-site-list");
    }, function (err) {
      if (err["responseJSON"]) {
        var error = SiteHelper.buildSubmitError(err["responseJSON"], data, false);
        SiteView.displayError("site_errorUpload", $('#page-error-submit-site'),
            error);
      }
    });
  },
  renderUpdateSiteForm: function () {
    var sId = SiteController.id;
    ViewBinding.setBusy(true);
    SiteModel.fetchOne(sId, function (site) {
      var siteData = {
        name: site.name,
        lat: site.lat,
        lng: site.lng
      };
      FieldController.site.properties = site.properties;
      FieldController.site.files = site.files;
      var btnData = {title: "global.update", isUpdateOffline: false};
      SiteView.displayDefaultLayer("site_form",
          $("#div_default_layer"), siteData);
      SiteView.displayBtnSubmit("site_submit", $("#btn_submit_site"), btnData);
      FieldOnlineController.renderUpdate(site);
    });
  }
};
