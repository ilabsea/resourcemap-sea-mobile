AppDatabase = {
  connectDB: function(dbName, size) {
    if (window.openDatabase || window.sqlitePlugin)
      persistence.store.websql.config(persistence, dbName, 'database', size);
    else
      alert("Your device must support a database connection");

    AppDatabase.defineSchema();
    persistence.schemaSync();
  },
  defineSchema: function () {
    Collection = persistence.define('collections', {
      idcollection: "INT",
      name: "TEXT",
      description: "TEXT",
      is_visible_location: "BOOL",
      is_visible_name: "BOOL",
      user_id: "INT"
    });

    User = persistence.define('users', {
      email: "TEXT",
      password: "TEXT",
      auth_token: "TEXT"
    });

    Site = persistence.define('sites', {
      idsite: "INT",
      name: "TEXT",
      lat: "INT",
      lng: "INT",
      start_entry_date: "TEXT",
      end_entry_date: "TEXT",
      created_at: "DATE",
      collection_id: "INT",
      collection_name: "TEXT",
      user_id: "INT",
      device_id: "TEXT",
      properties: "TEXT",
      files: "TEXT"
    });

    Field = persistence.define('fields', {
      collection_id: "INT",
      user_id: "INT",
      layer_name: "TEXT",
      layer_id: "INT",
      fields: "JSON"
    });

    LayerMembership = persistence.define('layer_memberships', {
      collection_id: "INT",
      user_id: "INT",
      user_offline_id: "INT",
      layer_id: "INT",
      read: "BOOL",
      write: "BOOL"
    });

    Membership = persistence.define('memberships', {
      collection_id: "INT",
      user_id: "INT",
      user_email: "TEXT",
      admin: "BOOL"
    });
  }
}