var SiteOfflineController = {
  add: function (data) {
    SiteOffline.add(data);
    SiteHelper.resetForm();
  },
  getByCollectionId: function () {
    var cId = App.DataStore.get("cId");
    var uId = SessionHelper.currentUser().id;
    var offset = SiteOffline.sitePage * SiteOffline.limit;
    SiteOffline.fetchByCollectionIdUserId(cId, uId, offset, function (sites) {
      var siteData = [];
      sites.forEach(function (site) {
        var fullDate = dateToParam(site.created_at());
        siteData.push({
          id: site.id,
          name: site.name(),
          collectionName: "offline",
          date: fullDate,
          link: "#page-update-site"
        });
      });
      SiteOffline.countByCollectionIdUserId(cId, uId, function (count) {
        var siteLength = sites.length + offset;
        var hasMoreSites = false;
        if (siteLength < count) {
          hasMoreSites = true;
        }
        var sitesRender = {
          hasMoreSites: hasMoreSites,
          state: "offline",
          siteList: siteData};
        SiteView.display($('#site-list'), sitesRender);
      });
    });
  },
  getByUserId: function (userId) {
    var offset = SiteOffline.sitePage * SiteOffline.limit;
    SiteOffline.fetchByUserId(userId, offset, function (sites) {
      var siteofflineData = [];
      sites.forEach(function (site) {
        var fullDate = dateToParam(site.created_at());
        var item = {id: site.id,
          name: site.name(),
          collectionName: site.collection_name(),
          date: fullDate,
          link: "#page-update-site"
        };
        SiteList.add(new SiteObj(site.id, site.name()));
        siteofflineData.push(item);
      });
      SiteOffline.countByUserId(userId, function(count){
        var siteLength = sites.length + offset;
        var hasMoreSites = false;
        if (siteLength < count) {
          hasMoreSites = true;
        }
        var sitesRender = {
          hasMoreSites: hasMoreSites,
          state: "all",
          siteList: siteofflineData};
        SiteView.display($('#offlinesite-list'), sitesRender);
      });
    });
  },
  updateBySiteId: function () {
    var sId = App.DataStore.get("sId");
    SiteOffline.fetchBySiteId(sId, function (site) {
      site.name($("#siteName").val());
      site.lat($("#lat").val());
      site.lng($("#lng").val());
      var cId = App.DataStore.get("cId");
      FieldOffline.fetchByCollectionId(cId, function (fields) {
        var propertiesFile = {properties: {}, files: {}};
        fields.forEach(function (field) {
          propertiesFile = FieldController.updateFieldValueBySiteId(propertiesFile, field, false);
        });
        site.properties(propertiesFile.properties);
        site.files(propertiesFile.files);
        persistence.flush();
        PhotoList.clear();
        SearchList.clear();
        App.DataStore.clearAllSiteFormData();
        App.Cache.resetValue();
        App.redirectTo("index.html#page-site-list");
      });
    });
  },
  renderUpdateSiteForm: function () {
    var sId = App.DataStore.get("sId");
    SiteOffline.fetchBySiteId(sId, function (site) {
      var siteUpdateData = {
        name: site.name(),
        lat: site.lat(),
        lng: site.lng()
      };
      SiteView.displayUpdateLatLng("site/updateOffline.html",
          $('#div-site-update-name'), "", siteUpdateData);
      FieldOfflineController.renderUpdate(site);
    });
  },
  deleteBySiteId: function (sId) {
    SiteOffline.deleteBySiteId(sId);
  },
  submitAllToServerByCollectionIdUserId: function () {
    var cId = App.DataStore.get("cId");
    var user = SessionHelper.currentUser();
    SiteOfflineController.processToServerByCollectionIdUserId(cId, user.id);
  },
  submitAllToServerByUserId: function () {
    var currentUser = SessionHelper.currentUser();
    SiteOfflineController.processToServerByUserId(currentUser.id);
  },
  processToServerByCollectionIdUserId: function (cId, uId) {
    if (App.isOnline()) {
      SiteOffline.fetchByCollectionIdUserId(cId, uId, function (sites) {
        if (sites.length > 0)
          SiteOfflineController.processingToServer(sites);
      });
    }
    else
      alert(i18n.t("global.no_internet_connection"));
  },
  processToServerByUserId: function (userId) {
    if (App.isOnline()) {
      SiteOffline.fetchByUserId(userId, function (sites) {
        if (sites.length > 0)
          SiteOfflineController.processingToServer(sites);
      });
    }
    else
      alert(i18n.t("global.no_internet_connection"));
  },
  processingToServer: function (sites) {
    var site = sites[0];
    ViewBinding.setBusy(true);
    var data = {site: {
        device_id: site.device_id(),
        external_id: site.id,
        collection_id: site.collection_id(),
        name: site.name(),
        lat: site.lat(),
        lng: site.lng(),
        properties: site.properties(),
        files: site.files()
      }
    };
    SiteModel.create(data["site"], function () {
      persistence.remove(site);
      persistence.flush();
      $('#sendToServer').show();
      sites.splice(0, 1);
      if (sites.length === 0)
        App.redirectTo("#page-collection-list");
      else
        SiteOfflineController.processingToServer(sites);
    }, function (err) {
      if (err.statusText === "Unauthorized") {
        showElement($("#info_sign_in"));
        App.redirectTo("#page-login");
      } else {
        var error = SiteHelper.buildSubmitError(err["responseJSON"], data["site"]);
        SiteView.displayError("site/errorUpload.html", $('#page-error-submit-site'),
            error);
      }
    });
  },
  countByUserId: function (userId) {
    SiteOffline.countByUserId(userId, function (count) {
      if (count == 0) {
        $('#btn_viewOfflineSite').hide();
      } else {
        $('#btn_viewOfflineSite').show();
      }
    });
  },
  countByCollectionId: function (cId) {
    var currentUser = SessionHelper.currentUser();
    SiteOffline.countByCollectionIdUserId(cId, currentUser.id, function (count) {
      var offline = "#site-list-menu option[value='2']";
      if (count == 0) {
        $(offline).attr('disabled', true);
        $("#site-list-menu").change();
      } else {
        $(offline).removeAttr('disabled');
      }
      $("#site-list-menu").selectmenu("refresh", true);
    });
  }
};