var SiteOfflineController = {
  add: function (data) {
    SiteOffline.add(data);
    App.redirectTo("#page-site-list");
  },
  getByCollectionId: function (cId) {
    var uId = UserSession.getUser().id;
    var offset = SiteOffline.sitePage * SiteOffline.limit;
    SiteOffline.fetchFieldsByCollectionIdUserId(cId, uId, offset, function (sites) {
      var siteData = $.map(sites, function(site){
        return SiteController.paramsSiteList(site);
      });
      SiteOffline.countByCollectionIdUserId(cId, uId, function (count) {
        CollectionController.nbOfflineSites = count;
        var siteLength = sites.length + offset;
        var hasMoreSites = false;
        if (siteLength < count) {
          hasMoreSites = true;
        }
        var sitesRender = {
          hasMoreSites: hasMoreSites,
          siteList: siteData};
        SiteView.display($('#site-list'), sitesRender);
      });
    });
  },
  getByUserId: function (userId) {
    var offset = SiteOffline.sitePage * SiteOffline.limit;
    SiteOffline.fetchFieldsByUserId(userId, offset, function (sites) {
      var siteofflineData = $.map(sites, function(site){
        return SiteController.paramsSiteList(site);
      });
      SiteOffline.countByUserId(userId, function (count) {
        var siteLength = sites.length + offset;
        var hasMoreSites = false;
        if (siteLength < count) {
          hasMoreSites = true;
        }
        var sitesRender = {
          hasMoreSites: hasMoreSites,
          siteList: siteofflineData};
        SiteView.display($('#offlinesite-list'), sitesRender);
      });
    });
  },
  update: function (data) {
    var sId = SiteController.id;
    SiteOffline.fetchBySiteId(sId, function (site) {
      site.name = data.name;
      site.lat = data.lat;
      site.lng = data.lng;
      site.properties = JSON.stringify(data.properties);
      site.files = JSON.stringify(data.files);
      persistence.flush();
      App.redirectTo("#page-site-list");
    });
  },
  renderUpdateSiteForm: function () {
    var sId = SiteController.id;
    SiteOffline.fetchBySiteId(sId, function (site) {
      var siteData = {
        name: site.name,
        lat: site.lat,
        lng: site.lng
      };
      FieldController.site.properties = JSON.parse(site.properties);
      FieldController.site.files = JSON.parse(site.files);
      SiteView.displayDefaultLayer("site_form", $('#div-site'), siteData);
      FieldOfflineController.renderNewSiteForm();
    });
  },
  deleteBySiteId: function (sId) {
    SiteOffline.deleteBySiteId(sId);
  },
  submitAllToServerByCollectionIdUserId: function () {
    if (App.isOnline()) {
      var cId = CollectionController.id;
      var uId = UserSession.getUser().id;
      SiteOfflineController.totalOffline = CollectionController.nbOfflineSites;
      SiteOfflineController.totalOffline = totalOffline;
      SiteOfflineController.processItem = 1;
      SiteOfflineController.processToServerByCollectionIdUserId();
    }
    else{
      alert(i18n.t("global.no_internet_connection"));
    }
  },
  submitAllToServerByUserId: function () {
    if (App.isOnline()) {
      this.processToServerByUserId();
      var uId = UserSession.getUser().id;
      SiteOffline.countByUserId(uId, function(totalOffline){
        SiteOfflineController.totalOffline = totalOffline;
        SiteOfflineController.processItem = 1;
        SiteOfflineController.processToServerByUserId();
      });
    }
    else{
      alert(i18n.t("global.no_internet_connection"));
    }
  },
  processToServerByCollectionIdUserId: function () {
    var cId = CollectionController.id;
    var uId = UserSession.getUser().id;
    SiteOffline.fetchOneByCollectionIdUserId(cId, uId, function(site){
      if(site){
        SiteOfflineController.progressStatus(true);
        SiteOfflineController.processingToServer(site, function() {
          SiteOfflineController.processItem++;
          SiteOfflineController.processToServerByCollectionIdUserId();
        });
      }
      else{
        SiteOfflineController.progressStatus(false);
        App.redirectTo("#page-collection-list");
      }
    });
  },
  progressStatus: function(status) {
    ViewBinding.setBusy(status);
    if(status){
      var msg = "Progressing " + SiteOfflineController.processItem + " / " + SiteOfflineController.totalOffline;
      $('.ui-loader > h1').text(msg);
    }
  },
  processToServerByUserId: function(){
    var uId = UserSession.getUser().id;
    SiteOffline.fetchOneByUserId(uId, function(site){
      if (site){
        SiteOfflineController.progressStatus(true);
        SiteOfflineController.processingToServer(site, function(){
          SiteOfflineController.processItem++;
          SiteOfflineController.processToServerByUserId();
        });
      }
      else{
        SiteOfflineController.progressStatus(false);
        App.redirectTo("#page-collection-list");
      }
    });
  },
  processingToServer: function (site, callback) {
    var data = {site: {
        device_id: site.device_id,
        external_id: site.id,
        start_entry_date: site.start_entry_date,
        end_entry_date: site.end_entry_date,
        collection_id: site.collection_id,
        name: site.name,
        lat: site.lat,
        lng: site.lng,
        properties: JSON.parse(site.properties),
        files: JSON.parse(site.files)
      }
    };
    SiteModel.create(data["site"], function () {
      persistence.remove(site);
      persistence.flush();
      callback();
    }, function (err) {
      if (err.statusText === "Unauthorized") {
        showElement($("#info_sign_in"));
        App.redirectTo("#page-login");
      } else {
        var error = SiteHelper.buildSubmitError(err["responseJSON"], data["site"]);
        SiteView.displayError("site_errorUpload", $('#page-error-submit-site'),
            error);
      }
    });
  },
  toggleViewOfflineSitesBtn: function () {
    var userId = UserSession.getUser().id;
    SiteOffline.countByUserId(userId, function (count) {
      if (count == 0) {
        $('#btn_viewOfflineSite').hide();
      } else {
        $('#btn_viewOfflineSite').show();
      }
    });
  },
  disabledOptionMenu: function () {
    var currentUser = UserSession.getUser();
    var cId = CollectionController.id;
    var options = [];
    if (App.isOnline())
      options.push({value: 1, label: "View all", selected: "selected"}, {value: 2, label: "View online"});
    if (CollectionController.nbOfflineSites > 0) {
      var optionHash = {value: 3, label: "View offline"};
      if(!App.isOnline()){
        optionHash.selected = "selected";
        $("#btn_sendToServer").show();
      }
      options.push(optionHash);
    }
    SiteView.displaySiteListMenu("site_menu", $("#div-site-list-menu"),{options: options});
  }
};
