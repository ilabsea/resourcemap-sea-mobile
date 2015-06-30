LayerMembership = {
  fetch: function(cId, successCallback) {
    var endpoint = getEndPoint();
    $.ajax({
      url: endpoint.URL_SITE + cId + "/layer_memberships?auth_token=" + App.Session.getAuthToken(),
      type: "GET",
      datatype: 'json',
      success: successCallback,
      cache: false,
      error: function(error) {
        console.log("Retriving sites from server : ", error);
      }
    });
  }
};