var FMApp = angular.module('FMApp', ['ur.file']);

FMApp.controller('FileManagerCtr', ['$scope', '$http', '$location',
  function ($scope, $http, $location) {
    var FM = this;
    FM.curHashPath = '#/';          // hash in browser url
    FM.curFolderPath = '/';         // current relative folder path
    FM.curBreadCrumbPaths = [];     // items in breadcrumb list, for each level folder
    FM.curFiles = [];               // files in current folder

    FM.selecteAll = false;          // if select all files
    FM.selection = [];              // selected files
    FM.renameName = '';             // new name for rename action
    FM.uploadFile = null;           // will upload file
    FM.newFolderName = '';
    FM.successData = '__init__';
    FM.errorData = '__init__';
    FM.updateArchiveName = function() {
      FM.archiveTarget = 'files_' + FM.curFolderPath.substring(1).replace(/\//g, '_') + new Date().toISOString().replace(/:/g, '.') + '.zip';
    };

    var hash2paths = function (relPath) {
      var paths = [];
      var names = relPath.split('/');
      var path = '#/';
      paths.push({name: 'Home', path: path});
      for (var i=0; i<names.length; ++i) {
        var name = names[i];
        if (name) {
          path = path + name + '/';
          paths.push({name: name, path: path});
        }
      }
      return paths;
    };

    var humanSize = function (size) {
      var hz;
      if (size < 1024) hz = size + ' B';
      else if (size < 1024*1024) hz = (size/1024).toFixed(2) + ' KB';
      else if (size < 1024*1024*1024) hz = (size/1024/1024).toFixed(2) + ' MB';
      else hz = (size/1024/1024/1024).toFixed(2) + ' GB';
      return hz;
    };

    var humanTime = function (timestamp) {
      var t = new Date(timestamp);
      return t.toLocaleDateString() + ' ' + t.toLocaleTimeString();
    };

    var setCurFiles = function (relPath) {
      $http.get('api' + relPath)
        .success(function (data) {
          var files = data;
          files.forEach(function (file) {
            file.relPath = relPath + encodeURIComponent(file.name);
            if (file.folder) file.relPath += '/';
            file.selected = false;
            file.humanSize = humanSize(file.size);
            file.humanTime = humanTime(file.mtime);
          });
          FM.curFiles = files;
          console.log('Current Files:');
          console.log(FM.curFiles);
        })
        .error(function (data, status) {
          alert('Error: ' + status + data);
        });
    };

    var handleHashChange = function (hash) {
      if (!hash) {
        return $location.path('/');
      }
      console.log('Hash change: ' + hash);
      var relPath = hash.slice(1);
      FM.curHashPath = hash;
      FM.curFolderPath = relPath;
      FM.curBreadCrumbPaths = hash2paths(relPath);
      setCurFiles(relPath);
    };

    $scope.$watch(function () {
      return location.hash;
    }, function (val) {
      handleHashChange(val);
    });

    // listening on file checkbox
    $scope.$watch('FM.curFiles|filter:{selected:true}', function (nv) {
      FM.selection = nv.map(function (file) {
        return file;
      });
    }, true);

    $scope.$watch('FM.selectAll', function (nv) {
      FM.curFiles.forEach(function (file) {
        file.selected = nv;
      });
    });

    $scope.$watch('FM.successData', function () {
      if (FM.successData === '__init__') return;
      $('#successAlert').show();
      $('#successAlert').fadeIn(3000);
      $('#successAlert').fadeOut(3000);
    });

    $scope.$watch('FM.errorData', function () {
      if (FM.errorData === '__init__') return;
      $('#errorAlert').show();
    });

    var httpRequest = function (method, url, params, data, config) {
      var conf = {
        method: method,
        url: url,
        params: params,
        data: data,
        timeout: 1000000
      };
      for (var k in config) {
        if (config.hasOwnProperty(k)) {
          conf[k] = config[k];
        }
      }
      console.log('request url', url);
      $http(conf)
        .success(function (data) {
          FM.successData = data;
          handleHashChange(FM.curHashPath);
        })
        .error(function (data, status) {
          FM.errorData = ' ' + status + ': ' + data;
        });
    };

    var downloadFile = function (file) {
      window.open('api' + file.relPath);
    };

    FM.clickFile = function (file) {
      if (file.folder) {
        // open folder by setting url hash
        $location.path(decodeURIComponent(file.relPath));
      }
      else {
        // download file
        downloadFile(file);
      }
    };

    FM.download = function () {

      // Technique for downloading multiple files adapted from here:
      //  [1] http://stackoverflow.com/questions/2339440/download-multiple-files-with-a-single-action

      var link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);

      for (var i in FM.selection) {
        link.setAttribute('href', 'api' + FM.selection[i].relPath);
        link.setAttribute('download', FM.selection[i].name);
        link.click();
      }

      document.body.removeChild(link);
    };

    FM.delete = function () {
      for (var i in FM.selection) {
        var relPath = FM.selection[i].relPath;
        var url = 'api' + relPath;
        httpRequest('DELETE', url, null, null);
      }
    };

    FM.move = function (target) {
      var url = 'api' + encodeURI(target);
      var src = FM.selection.map(function (file) {
        return file.relPath;
      });
      httpRequest('PUT', url, {type: 'MOVE'}, {src: src});
    };

    FM.archive = function (archive) {
      if (!archive.match(/\.zip$/)) {
        archive += '.zip';
      }
      var url = 'api' + FM.curFolderPath + encodeURI(archive);
      var src = FM.selection.map(function (file) {
        return file.relPath;
      });
      httpRequest('POST', url, {type: 'CREATE_ARCHIVE'}, {src: src, embedDirs: FM.archiveEmbedDirs});
    };

    FM.rename = function (newName) {
      var url = 'api' + FM.selection[0].relPath;
      var target = FM.curFolderPath + encodeURI(newName);
      console.log('rename target', target);
      httpRequest('PUT', url, {type: 'RENAME'}, {target: target});
    };

    FM.createFolder = function (folderName) {
      var url = 'api' + FM.curFolderPath + encodeURI(folderName);
      httpRequest('POST', url, {type: 'CREATE_FOLDER'}, null);
    };

    FM.upload = function () {
      console.log('Upload File:', FM.uploadFile);
      var formData = new FormData();
      formData.append('upload', FM.uploadFile);
      var url = 'api' + FM.curFolderPath + encodeURI(FM.uploadFile.name);
      httpRequest('POST', url, {type: 'UPLOAD_FILE'}, formData, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      });
    };

    FM.btnDisabled = function (btnName) {
      switch (btnName) {
        case 'download':
          if (FM.selection.length === 0) return true;
          else {
            for (var i in FM.selection) {
              if (FM.selection[i].folder) return true;
            }
            return false;
          }
        case 'delete':
        case 'move':
        case 'archive':
          return FM.selection.length === 0;
        case 'rename':
          return FM.selection.length !== 1;
        case 'upload_file':
        case 'create_folder':
          return false;
        default:
          return true;
      }
    }
  }
]);
