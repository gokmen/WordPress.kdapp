// Compiled by Koding Servers at Wed Feb 20 2013 17:07:14 GMT-0800 (PST) in server time

(function() {

/* KDAPP STARTS */

/* BLOCK STARTS /Source: /Users/gokmen/Applications/WordPress.kdapp/common.coffee */

var Pane, WpApp, WpSplit,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

WpApp = (function(_super) {

  __extends(WpApp, _super);

  function WpApp() {
    var _this = this;
    WpApp.__super__.constructor.apply(this, arguments);
    this.listenWindowResize();
    this.dashboardTabs = new KDTabView({
      hideHandleCloseIcons: true,
      hideHandleContainer: true,
      cssClass: "wp-installer-tabs"
    });
    this.consoleToggle = new KDToggleButton({
      states: [
        "Console", function(callback) {
          this.setClass("toggle");
          split.resizePanel(250, 0);
          return callback(null);
        }, "Console &times;", function(callback) {
          this.unsetClass("toggle");
          split.resizePanel(0, 1);
          return callback(null);
        }
      ]
    });
    this.buttonGroup = new KDButtonGroupView({
      buttons: {
        "Dashboard": {
          cssClass: "clean-gray toggle",
          callback: function() {
            return _this.dashboardTabs.showPaneByIndex(0);
          }
        },
        "Install a new Wordpress": {
          cssClass: "clean-gray",
          callback: function() {
            return _this.dashboardTabs.showPaneByIndex(1);
          }
        }
      }
    });
    this.dashboardTabs.on("PaneDidShow", function(pane) {
      if (pane.name === "dashboard") {
        return _this.buttonGroup.buttonReceivedClick(_this.buttonGroup.buttons.Dashboard);
      } else {
        return _this.buttonGroup.buttonReceivedClick(_this.buttonGroup.buttons["Install a new Wordpress"]);
      }
    });
  }

  WpApp.prototype.viewAppended = function() {
    var dashboard, installPane;
    WpApp.__super__.viewAppended.apply(this, arguments);
    this.dashboardTabs.addPane(dashboard = new DashboardPane({
      cssClass: "dashboard",
      name: "dashboard"
    }));
    this.dashboardTabs.addPane(installPane = new InstallPane({
      name: "install"
    }));
    this.dashboardTabs.showPane(dashboard);
    installPane.on("WordPressInstalled", function(formData) {
      var domain, path;
      domain = formData.domain, path = formData.path;
      dashboard.putNewItem(formData);
      return KD.utils.wait(200, function() {
        return tc.refreshFolder(tc.nodes["/Users/" + nickname + "/Sites/" + domain + "/website"], function() {
          return KD.utils.wait(200, function() {
            return tc.selectNode(tc.nodes["/Users/" + nickname + "/Sites/" + domain + "/website/" + path]);
          });
        });
      });
    });
    return this._windowDidResize();
  };

  WpApp.prototype._windowDidResize = function() {
    console.log("hwowhowhow");
    return this.dashboardTabs.setHeight(this.getHeight() - this.$('>header').height());
  };

  WpApp.prototype.pistachio = function() {
    return "<header>\n  <figure></figure>\n  <article>\n    <h3>Wordpress Installer</h3>\n    <p>This application installs wordpress instances and gives you a dashboard of what is already installed</p>\n  </article>\n  <section>\n  {{> this.buttonGroup}}\n  {{> this.consoleToggle}}\n  </section>\n</header>\n{{> this.dashboardTabs}}";
  };

  return WpApp;

})(JView);

WpSplit = (function(_super) {

  __extends(WpSplit, _super);

  function WpSplit(options, data) {
    this.output = new KDScrollView({
      tagName: "pre",
      cssClass: "terminal-screen"
    });
    this.wpApp = new WpApp;
    options.views = [this.wpApp, this.output];
    WpSplit.__super__.constructor.call(this, options, data);
  }

  WpSplit.prototype.viewAppended = function() {
    WpSplit.__super__.viewAppended.apply(this, arguments);
    return this.panels[1].setClass("terminal-tab");
  };

  return WpSplit;

})(KDSplitView);

Pane = (function(_super) {

  __extends(Pane, _super);

  function Pane() {
    return Pane.__super__.constructor.apply(this, arguments);
  }

  Pane.prototype.viewAppended = function() {
    this.setTemplate(this.pistachio());
    return this.template.update();
  };

  return Pane;

})(KDTabPaneView);


/* BLOCK ENDS */



/* BLOCK STARTS /Source: /Users/gokmen/Applications/WordPress.kdapp/functions.coffee */

var appStorage, checkPath, fc, installWordpress, kc, nickname, parseOutput, prepareDb, tc;

kc = KD.getSingleton("kiteController");

fc = KD.getSingleton("finderController");

tc = fc.treeController;

nickname = KD.whoami().profile.nickname;

appStorage = new AppStorage("wp-installer", "1.0");

parseOutput = function(res, err) {
  var output;
  if (err == null) {
    err = false;
  }
  if (err) {
    res = "<br><cite style='color:red'>[ERROR] " + res + "</cite><br><br><br>";
  }
  output = split.output;
  output.setPartial(res);
  return output.utils.wait(100, function() {
    return output.scrollTo({
      top: output.getScrollHeight(),
      duration: 100
    });
  });
};

prepareDb = function(callback) {
  var _this = this;
  parseOutput("<br>creating a database....<br>");
  return kc.run({
    kiteName: "databases",
    method: "createMysqlDatabase"
  }, function(err, response) {
    if (err) {
      parseOutput(err.message, true);
      return typeof callback === "function" ? callback(err) : void 0;
    } else {
      parseOutput("<br>Database created:<br>\n  Database User: " + response.dbUser + "<br>\n  Database Name: " + response.dbName + "<br>\n  Database Host: " + response.dbHost + "<br>\n  Database Pass: " + response.dbPass + "<br>\n<br>");
      return callback(null, response);
    }
  });
};

checkPath = function(formData, callback) {
  var domain, path;
  path = formData.path, domain = formData.domain;
  if (path === "") {
    return callback(true);
  } else {
    return kc.run("stat /Users/" + nickname + "/Sites/" + domain + "/website/" + path, function(err, response) {
      if (response) {
        parseOutput("Specified path isn't available, please delete it or select another path!", true);
      }
      return typeof callback === "function" ? callback(err, response) : void 0;
    });
  }
};

installWordpress = function(formData, dbinfo, callback) {
  var commands, db, domain, path, runInQueue, timestamp, tmpAppDir, userDir,
    _this = this;
  path = formData.path, domain = formData.domain, timestamp = formData.timestamp, db = formData.db;
  userDir = "/Users/" + nickname + "/Sites/" + domain + "/website/";
  tmpAppDir = "" + userDir + "app." + timestamp;
  commands = ["mkdir -p '" + tmpAppDir + "'", "curl --location 'http://wordpress.org/latest.zip' > '" + tmpAppDir + ".zip'", "unzip '" + tmpAppDir + ".zip' -d '" + tmpAppDir + "'", "rm -f '" + tmpAppDir + ".zip'"];
  if (db) {
    commands.push("cp '" + tmpAppDir + "/wordpress/wp-config-sample.php' '" + tmpAppDir + "/wordpress/wp-config.php'");
    commands.push("printf '%s\n' \"g/put your unique phrase here/d\" a \"$(curl -L https://api.wordpress.org/secret-key/1.1/salt/)\" . w | ed -s " + tmpAppDir + "/wordpress/wp-config.php");
    commands.push("sed -i '' 's/database_name_here/" + dbinfo.dbName + "/g' '" + tmpAppDir + "/wordpress/wp-config.php'");
    commands.push("sed -i '' 's/username_here/" + dbinfo.dbUser + "/g' '" + tmpAppDir + "/wordpress/wp-config.php'");
    commands.push("sed -i '' 's/password_here/" + dbinfo.dbPass + "/g' '" + tmpAppDir + "/wordpress/wp-config.php'");
    commands.push("sed -i '' 's/localhost/" + dbinfo.dbHost + "/g' '" + tmpAppDir + "/wordpress/wp-config.php'");
    commands.push("chmod 700 '" + tmpAppDir + "/wordpress/wp-config.php'");
  }
  if (path === "") {
    commands.push("cp -R " + tmpAppDir + "/wordpress/* " + userDir);
  } else {
    commands.push("mv '" + tmpAppDir + "/wordpress' '" + userDir + path + "'");
  }
  commands.push("rm -rf '" + tmpAppDir + "'");
  runInQueue = function(cmds, index) {
    var command;
    command = cmds[index];
    if (cmds.length === index || !command) {
      parseOutput("<br>#############");
      parseOutput("<br>Wordpress successfully installed to: " + userDir + path);
      parseOutput("<br>#############<br>");
      parseOutput("<br><br><br>");
      appStorage.fetchValue('blogs', function(blogs) {
        blogs || (blogs = []);
        blogs.push(formData);
        return appStorage.setValue("blogs", blogs);
      });
      if (typeof callback === "function") {
        callback(formData);
      }
      return KD.utils.wait(1000, function() {
        return appManager.openFileWithApplication("http://" + nickname + ".koding.com/" + path + "/wp-admin/install.php", "Viewer");
      });
    } else {
      parseOutput("$ " + command + "<br/>");
      return kc.run(command, function(err, res) {
        if (err) {
          return parseOutput(err, true);
        } else {
          parseOutput(res + '<br/>');
          return runInQueue(cmds, index + 1);
        }
      });
    }
  };
  return runInQueue(commands, 0);
};


/* BLOCK ENDS */



/* BLOCK STARTS /Source: /Users/gokmen/Applications/WordPress.kdapp/dashboardpane.coffee */

var DashboardPane, InstalledAppListItem,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

DashboardPane = (function(_super) {

  __extends(DashboardPane, _super);

  function DashboardPane() {
    var _this = this;
    DashboardPane.__super__.constructor.apply(this, arguments);
    this.listController = new KDListViewController({
      lastToFirst: true,
      viewOptions: {
        type: "wp-blog",
        itemClass: InstalledAppListItem
      }
    });
    this.listWrapper = this.listController.getView();
    this.notice = new KDCustomHTMLView({
      tagName: "p",
      cssClass: "why-u-no",
      partial: "y u no create wordpress!!!"
    });
    this.notice.hide();
    this.loader = new KDLoaderView({
      size: {
        width: 60
      },
      cssClass: "loader",
      loaderOptions: {
        color: "#ccc",
        diameter: 30,
        density: 30,
        range: 0.4,
        speed: 1,
        FPS: 24
      }
    });
    this.listController.getListView().on("DeleteLinkClicked", function(listItemView) {
      var command, domain, message, modal, name, path, userDir, warning, _ref;
      _ref = listItemView.getData(), path = _ref.path, domain = _ref.domain, name = _ref.name;
      userDir = "/Users/" + nickname + "/Sites/" + domain + "/website/";
      if (path.trim() === "") {
        path = "";
        message = "Oh, its installed to root! This action will just remove this Wordpress from list, <strong>you need to delete files manually</strong>.";
        command = "";
        warning = "";
      } else {
        message = "<pre>" + userDir + path + "</pre>";
        command = "rm -r '" + userDir + path + "'";
        warning = "<p class='modalformline' style='color:red'>\n   Warning: This will remove everything under that directory!\n</p>";
      }
      return modal = new KDModalView({
        title: "Are you sure want to delete this Wordpress?",
        content: "<div class='modalformline'>\n  <p>" + message + "</p>\n</div>\n" + warning,
        height: "auto",
        overlay: true,
        width: 500,
        buttons: {
          Delete: {
            style: "modal-clean-red",
            loader: {
              color: "#ffffff",
              diameter: 16
            },
            callback: function() {
              _this.removeItem(listItemView);
              if (path === "") {
                modal.buttons.Delete.hideLoader();
                return modal.destroy();
              } else {
                split.resizePanel(250, 0);
                parseOutput("<br><br>Deleting /Users/" + nickname + "/Sites/" + domain + "/website/" + path + "<br><br>");
                parseOutput(command);
                return kc.run({
                  withArgs: {
                    command: command
                  }
                }, function(err, res) {
                  modal.buttons.Delete.hideLoader();
                  modal.destroy();
                  if (err) {
                    parseOutput(err, true);
                    new KDNotificationView({
                      title: "There was an error, you may need to remove it manually!",
                      duration: 3333
                    });
                  } else {
                    parseOutput("<br><br>#############");
                    parseOutput("<br>" + name + " successfully deleted.");
                    parseOutput("<br>#############<br><br>");
                    tc.refreshFolder(tc.nodes["/Users/" + nickname + "/Sites/" + domain + "/website"]);
                  }
                  return _this.utils.wait(1500, function() {
                    return split.resizePanel(0, 1);
                  });
                });
              }
            }
          }
        }
      });
    });
  }

  DashboardPane.prototype.removeItem = function(listItemView) {
    var blogToDelete, blogs,
      _this = this;
    blogs = appStorage.getValue("blogs");
    blogToDelete = listItemView.getData();
    blogs.splice(blogs.indexOf(blogToDelete), 1);
    return appStorage.setValue("blogs", blogs, function() {
      _this.listController.removeItem(listItemView);
      return appStorage.fetchValue("blogs", function(blogs) {
        if (blogs == null) {
          blogs = [];
        }
        if (blogs.length === 0) {
          return _this.notice.show();
        }
      });
    });
  };

  DashboardPane.prototype.putNewItem = function(formData, resizeSplit) {
    var tabs;
    if (resizeSplit == null) {
      resizeSplit = true;
    }
    tabs = this.getDelegate();
    tabs.showPane(this);
    this.listController.addItem(formData);
    this.notice.hide();
    if (resizeSplit) {
      return this.utils.wait(1500, function() {
        return split.resizePanel(0, 1);
      });
    }
  };

  DashboardPane.prototype.viewAppended = function() {
    var _this = this;
    DashboardPane.__super__.viewAppended.apply(this, arguments);
    this.loader.show();
    return appStorage.fetchStorage(function(storage) {
      var blogs;
      _this.loader.hide();
      blogs = appStorage.getValue("blogs") || [];
      if (blogs.length > 0) {
        blogs.sort(function(a, b) {
          if (a.timestamp < b.timestamp) {
            return -1;
          } else {
            return 1;
          }
        });
        return blogs.forEach(function(item) {
          return _this.putNewItem(item, false);
        });
      } else {
        return _this.notice.show();
      }
    });
  };

  DashboardPane.prototype.pistachio = function() {
    return "{{> this.loader}}\n{{> this.notice}}\n{{> this.listWrapper}}";
  };

  return DashboardPane;

})(Pane);

InstalledAppListItem = (function(_super) {

  __extends(InstalledAppListItem, _super);

  function InstalledAppListItem(options, data) {
    var _this = this;
    options.type = "wp-blog";
    InstalledAppListItem.__super__.constructor.call(this, options, data);
    this["delete"] = new KDCustomHTMLView({
      tagName: "a",
      cssClass: "delete-link",
      click: function() {
        return _this.getDelegate().emit("DeleteLinkClicked", _this);
      }
    });
  }

  InstalledAppListItem.prototype.viewAppended = function() {
    var _this = this;
    this.setTemplate(this.pistachio());
    this.template.update();
    return this.utils.wait(function() {
      return _this.setClass("in");
    });
  };

  InstalledAppListItem.prototype.pistachio = function() {
    var domain, name, path, timestamp, url, _ref;
    _ref = this.getData(), path = _ref.path, timestamp = _ref.timestamp, domain = _ref.domain, name = _ref.name;
    url = "http://" + domain + "/" + path;
    return "{{> this[\"delete\"]}}\n<a target='_blank' class='name-link' href='" + url + "'>{{#(name)}}</a>\n<a target='_blank' class='admin-link' href='" + url + (path === "" ? '' : '/') + "wp-admin'>Admin</a>\n<a target='_blank' class='raw-link' href='" + url + "'>" + url + "</a>\n<time datetime='" + (new Date(timestamp)) + "'>" + ($.timeago(new Date(timestamp))) + "</time>";
  };

  return InstalledAppListItem;

})(KDListItemView);


/* BLOCK ENDS */



/* BLOCK STARTS /Source: /Users/gokmen/Applications/WordPress.kdapp/installpane.coffee */

var InstallPane,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

InstallPane = (function(_super) {

  __extends(InstallPane, _super);

  function InstallPane() {
    this.submit = __bind(this.submit, this);

    var domainsPath,
      _this = this;
    InstallPane.__super__.constructor.apply(this, arguments);
    this.form = new KDFormViewWithFields({
      callback: this.submit.bind(this),
      buttons: {
        install: {
          title: "Install Wordpress",
          style: "cupid-green",
          type: "submit",
          loader: {
            color: "#444444",
            diameter: 12
          }
        },
        advanced: {
          itemClass: KDToggleButton,
          style: "transparent",
          states: [
            "Advanced Options", function(callback) {
              var darks;
              _this.form.buttons.advanced.setClass("toggle");
              darks = _this.form.$('.formline.dark');
              darks.addClass("in");
              return typeof callback === "function" ? callback(null) : void 0;
            }, "&times; Advanced Options", function(callback) {
              var darks;
              _this.form.buttons.advanced.unsetClass("toggle");
              darks = _this.form.$('.formline.dark');
              darks.removeClass("in");
              return typeof callback === "function" ? callback(null) : void 0;
            }
          ]
        }
      },
      fields: {
        name: {
          label: "Name of your blog:",
          name: "name",
          placeholder: "type a name for your blog...",
          defaultValue: "My Wordpress",
          validate: {
            rules: {
              required: "yes"
            },
            messages: {
              required: "a name for your wordpress is required!"
            }
          },
          keyup: function() {
            return _this.completeInputs();
          },
          blur: function() {
            return _this.completeInputs();
          }
        },
        domain: {
          label: "Domain :",
          name: "domain",
          itemClass: KDSelectBox,
          defaultValue: "" + nickname + ".koding.com",
          nextElement: {
            pathExtension: {
              label: "/my-wordpress/",
              type: "hidden"
            }
          }
        },
        path: {
          label: "Path :",
          name: "path",
          placeholder: "type a path for your blog...",
          hint: "leave empty if you want your blog to work on your domain root",
          defaultValue: "my-wordpress",
          keyup: function() {
            return _this.completeInputs(true);
          },
          blur: function() {
            return _this.completeInputs(true);
          },
          validate: {
            rules: {
              regExp: /(^$)|(^[a-z\d]+([-][a-z\d]+)*$)/i
            },
            messages: {
              regExp: "please enter a valid path!"
            }
          },
          nextElement: {
            timestamp: {
              name: "timestamp",
              type: "hidden",
              defaultValue: Date.now()
            }
          }
        },
        Database: {
          label: "Create a new database:",
          name: "db",
          cssClass: "dark",
          title: "",
          labels: ["YES", "NO"],
          itemClass: KDOnOffSwitch,
          defaultValue: true
        }
      }
    });
    this.form.on("FormValidationFailed", function() {
      return _this.form.buttons["Install Wordpress"].hideLoader();
    });
    domainsPath = "/Users/" + nickname + "/Sites";
    kc.run("ls " + domainsPath + " -lpva", function(err, response) {
      var domain, files, newSelectOptions;
      if (err) {
        return warn(err);
      } else {
        files = FSHelper.parseLsOutput([domainsPath], response);
        newSelectOptions = [];
        files.forEach(function(domain) {
          return newSelectOptions.push({
            title: domain.name,
            value: domain.name
          });
        });
        domain = _this.form.inputs.domain;
        return domain.setSelectOptions(newSelectOptions);
      }
    });
  }

  InstallPane.prototype.completeInputs = function(fromPath) {
    var name, path, pathExtension, slug, val, _ref;
    if (fromPath == null) {
      fromPath = false;
    }
    _ref = this.form.inputs, path = _ref.path, name = _ref.name, pathExtension = _ref.pathExtension;
    if (fromPath) {
      val = path.getValue();
      slug = KD.utils.slugify(val);
      if (/\//.test(val)) {
        path.setValue(val.replace('/', ''));
      }
    } else {
      slug = KD.utils.slugify(name.getValue());
      path.setValue(slug);
    }
    if (slug) {
      slug += "/";
    }
    return pathExtension.inputLabel.updateTitle("/" + slug);
  };

  InstallPane.prototype.submit = function(formData) {
    var db, domain, failCb, name, path, successCb,
      _this = this;
    split.resizePanel(250, 0);
    path = formData.path, domain = formData.domain, name = formData.name, db = formData.db;
    formData.timestamp = parseInt(formData.timestamp, 10);
    formData.fullPath = "" + domain + "/website/" + path;
    failCb = function() {
      _this.form.buttons["Install Wordpress"].hideLoader();
      return _this.utils.wait(5000, function() {
        return split.resizePanel(0, 1);
      });
    };
    successCb = function(dbinfo) {
      return installWordpress(formData, dbinfo, function(path, timestamp) {
        _this.emit("WordPressInstalled", formData);
        return _this.form.buttons["Install Wordpress"].hideLoader();
      });
    };
    return checkPath(formData, function(err, response) {
      console.log(arguments);
      if (err) {
        if (db) {
          return prepareDb(function(err, dbinfo) {
            if (err) {
              return failCb();
            } else {
              return successCb(dbinfo);
            }
          });
        } else {
          return successCb();
        }
      } else {
        return failCb();
      }
    });
  };

  InstallPane.prototype.pistachio = function() {
    return "{{> this.form}}";
  };

  return InstallPane;

})(Pane);


/* BLOCK ENDS */



/* BLOCK STARTS /Source: /Users/gokmen/Applications/WordPress.kdapp/main.coffee */

var split;

appView.addSubView(split = new WpSplit({
  cssClass: "wp-installer",
  type: "horizontal",
  resizable: false,
  sizes: ["100%", null]
}));


/* BLOCK ENDS */

/* KDAPP ENDS */

}).call();