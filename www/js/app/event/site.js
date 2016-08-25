$(function () {

  $(document).delegate('#page-site-list', 'pageshow', function () {
    App.emptyHTML();
    $("#btn_sendToServer").hide();
    var cId = CollectionController.id;
    SiteModel.sitePage = 0;
    SiteOffline.sitePage = 0;
    SiteOfflineController.disabledOptionMenu(cId);
    SiteController.getAllByCollectionId();
    SiteController.setSitesByTermForSiteField();
    FieldController.reset();
    ValidList.clear();
  });

  $(document).delegate('#btn_create_site', 'click', function () {
    SiteController.form = "new";
    $('#form_site')[0].reset();
    SiteController.renderCreate();
  });

  $(document).delegate('#page-site-list #site-list-online li', 'click', function () {
    var sId = $(this).attr('data-id');
    if (sId == "load-more-site-online") {
      $("#" + sId).remove();
      SiteModel.sitePage++;
      SiteOnlineController.getByCollectionId();
    } else {
      SiteController.form = "update_online";
      SiteController.id = sId;
      SiteOnlineController.renderUpdateSiteForm();
    }
  });

  $(document).delegate('#page-site-list #site-list li', 'click', function () {
    var sId = $(this).attr('data-id');
    if (sId == "load-more-site-offline") {
      $("#" + sId).remove();
      SiteOffline.sitePage++;
      SiteOfflineController.getByCollectionId();
    } else {
      SiteController.form = "update_offline";
      SiteController.id = sId
      SiteOfflineController.renderUpdateSiteForm();
    }
  });

  $(document).delegate('#page-site-list-all li', 'click', function () {
    var sId = $(this).attr('data-id');
    var uId = SessionHelper.currentUser().id;
    if (sId == "load-more-site-all") {
      $("#" + sId).remove();
      SiteOffline.sitePage++;
      SiteOfflineController.getByUserId(uId);
    } else {
      SiteController.form = "update_offline_all";
      SiteController.id = sId;
      SiteOfflineController.renderUpdateSiteForm();
    }
  });

  $(document).delegate('#btn_delete-site', 'click', function () {
    var sId = SiteController.id;
    SiteOfflineController.deleteBySiteId(sId);
  });

  $(document).delegate('#page-site-list-all', 'pageshow', function () {
    App.emptyHTML();
    var currentUser = SessionHelper.currentUser();
    SiteOffline.sitePage = 0;
    SiteOfflineController.getByUserId(currentUser.id);
    ValidList.clear();
  });

  $(document).delegate('#page-site-list', 'pagehide', function () {
    if ($.mobile.activePage.is("#page-form-site"))
      ViewBinding.setBusy(true);
  });
});
