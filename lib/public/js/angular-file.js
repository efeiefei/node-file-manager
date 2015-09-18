/**
 * ur.file: Native HTML5-based file input bindings for AngularJS
 *
 * @version 0.9a
 * @copyright (c) 2013 Union of RAD, LLC http://union-of-rad.com/
 * @license: BSD
 */


/**
 * The ur.file module implements native support for file uploads in AngularJS.
 */
angular.module('ur.file', []).config(['$provide', function($provide) {

  /**
   * XHR initialization, copied from Angular core, because it's buried inside $HttpProvider.
   */
  var XHR = window.XMLHttpRequest || function() {
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) {}
    throw new Error("This browser does not support XMLHttpRequest.");
  };

  /**
   * Initializes XHR object with parameters from $httpBackend.
   */
  function prepXHR(method, url, headers, callback, withCredentials, type, manager) {
    var xhr = new XHR();
    var status;

    xhr.open(method, url, true);

    if (type) {
      xhr.type = type;
      headers['Content-Type'] = type;
    }

    angular.forEach(headers, function(value, key) {
      (value) ? xhr.setRequestHeader(key, value) : null;
    });

    manager.register(xhr);

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        manager.unregister(xhr);
        var response = xhr.response || xhr.responseText;
        callback(status = status || xhr.status, response, xhr.getAllResponseHeaders());
      }
    };

    if (withCredentials) {
      xhr.withCredentials = true;
    }
    return xhr;
  }

  /**
   * Hook into $httpBackend to intercept requests containing files.
   */
  $provide.decorator('$httpBackend', ['$delegate', '$window', 'uploadManager', function($delegate, $window, uploadManager) {
    return function(method, url, post, callback, headers, timeout, wc) {
      var containsFile = false, result = null, manager = uploadManager;

      if (post && angular.isObject(post)) {
        containsFile = hasFile(post);
      }

      if (angular.isObject(post)) {
        if (post && post.name && !headers['X-File-Name']) {
          headers['X-File-Name'] = encodeURI(post.name);
        }

        angular.forEach({
          size: 'X-File-Size',
          lastModifiedDate: 'X-File-Last-Modified'
        }, function(header, key) {
          if (post && post[key]) {
            if (!headers[header]) headers[header] = post[key];
          }
        });
      }

      if (post && post instanceof Blob) {
        return prepXHR(method, url, headers, callback, wc, post.type, manager).send(post);
      }
      $delegate(method, url, post, callback, headers, timeout, wc);
    };
  }]);

  /**
   * Checks an object hash to see if it contains a File object, or, if legacy is true, checks to
   * see if an object hash contains an <input type="file" /> element.
   */
  var hasFile = function(data) {
    for (var n in data) {
      if (data[n] instanceof Blob) {
        return true;
      }
      if ((angular.isObject(data[n]) || angular.isArray(data[n])) && hasFile(data[n])) {
        return true;
      }
    }
    return false;
  };

  /**
   * Prevents $http from executing its default transformation behavior if the data to be
   * transformed contains file data.
   */
  $provide.decorator('$http', ['$delegate', function($delegate) {
    var transformer = $delegate.defaults.transformRequest[0];

    $delegate.defaults.transformRequest = [function(data) {
      return data instanceof Blob ? data : transformer(data);
    }];
    return $delegate;
  }]);

}]).service('fileHandler', ['$q', '$rootScope', function($q, $rootScope) {

  return {

    /**
     * Loads a file as a data URL and returns a promise representing the file's value.
     */
    load: function(file) {
      var deferred = $q.defer();

      var reader = angular.extend(new FileReader(), {
        onload: function(e) {
          deferred.resolve(e.target.result);
          if (!$rootScope.$$phase) $rootScope.$apply();
        },
        onerror: function(e) {
          deferred.reject(e);
          if (!$rootScope.$$phase) $rootScope.$apply();
        },
        onabort: function(e) {
          deferred.reject(e);
          if (!$rootScope.$$phase) $rootScope.$apply();
        }
        // onprogress: Gee, it'd be great to get some progress support from $q...
      });
      reader.readAsDataURL(file);

      return angular.extend(deferred.promise, {
        abort: function() { reader.abort(); }
      });
    },

    /**
     * Returns the metadata from a File object, including the name, size and last modified date.
     */
    meta: function(file) {
      return {
        name: file.name,
        size: file.size,
        lastModifiedDate: file.lastModifiedDate
      };
    },

    /**
     * Converts a File object or data URL to a Blob.
     */
    toBlob: function(data) {
      var extras = {};

      if (data instanceof File) {
        extras = this.meta(data);
        data = data.toDataURL();
      }
      var parts = data.split(","), headers = parts[0].split(":"), body;

      if (parts.length !== 2 || headers.length !== 2 || headers[0] !== "data") {
        throw new Error("Invalid data URI.");
      }
      headers = headers[1].split(";");
      body = (headers[1] === "base64") ? atob(parts[1]) : decodeURI(parts[1]);
      var length = body.length, buffer = new ArrayBuffer(length), bytes = new Uint8Array(buffer);

      for (var i = 0; i < length; i++) {
        bytes[i] = body.charCodeAt(i);
      }
      return angular.extend(new Blob([bytes], { type: headers[0] }), extras);
    }
  };

}]).service('uploadManager', ['$rootScope', function($rootScope) {

  angular.extend(this, {
    id : null,
    uploads: {},
    capture: function(id) {
      this.id = id;
      this.uploads[id] = {
        loaded: 0,
        total: 0,
        percent: 0,
        object: null
      };
    },
    register: function(xhr) {
      if (this.id === null) {
        return false;
      }
      xhr._idXhr = this.id;
      this.id = null;
      this.uploads[xhr._idXhr]['object'] = xhr;
      var self = this;

      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          self.uploads[xhr._idXhr]['loaded'] = e.loaded;
          self.uploads[xhr._idXhr]['total'] = e.total;
          self.uploads[xhr._idXhr]['percent'] = Math.round(e.loaded / e.total * 100);
          $rootScope.$apply();
        }
      };
      return true;
    },
    unregister: function(xhr) {
      delete this.uploads[xhr._idXhr];
    },
    get: function(id) {
      if (this.uploads[id]) {
        return this.uploads[id];
      }
      return false;
    },
    abort: function(id) {
      if (this.uploads[id]) {
        return this.uploads[id]['object'].abort();
      }
      return false;
    }
  });

}]).directive('type', ['$parse', function urModelFileFactory($parse) {

  /**
   * Binding for file input elements
   */
  return {
    scope: false,
    priority: 1,
    require: "?ngModel",
    link: function urFilePostLink(scope, element, attrs, ngModel) {

      if (attrs.type.toLowerCase() !== 'file' || !ngModel) {
        return;
      }

      element.bind('change', function(e) {
        if (!e.target.files || !e.target.files.length || !e.target.files[0]) {
          return true;
        }
        var index, fileData = attrs.multiple ? e.target.files : e.target.files[0];
        ngModel.$render = function() {};

        scope.$apply(function(scope) {
          index = scope.$index;
          $parse(attrs.ngModel).assign(scope, fileData);
        });
        scope.$index = index;

        // @todo Make sure this can be replaced by ngChange.
        // For that to work, this event handler must have a higher priority than the one
        // defined by ngChange
        attrs.change ? scope.$eval(attrs.change) : null;
      });
    }
  };

}]).directive('dropTarget', ['$parse', 'fileHandler', function urDropTargetFactory($parse, fileHandler) {

  return {
    scope: false,
    restrict: "EAC",
    require: "?ngModel",
    link: function urDropTargetLink(scope, element, attrs, ngModel) {
      var multiple  = attrs.multiple,
          dropExpr  = attrs.drop ? $parse(attrs.drop) : null,
          modelExpr = attrs.ngModel ? $parse(attrs.ngModel) : null;

      if (ngModel) ngModel.$render = function() {};

      function stop(e) {
        e.stopPropagation();
        e.preventDefault();
      }

      var toIgnore = [], isOver = false;

      element.bind("dragenter", function dragEnter(e) {
        stop(e);
        if (e.target === this && !isOver) {
          if (attrs.overClass) element.addClass(attrs.overClass);
          isOver = true;
          return;
        }
        toIgnore.push(e.target);
      });

      element.bind("dragleave", function dragExit(e) {
        stop(e);
        if (toIgnore.length === 0 && isOver) {
          if (attrs.overClass) element.removeClass(attrs.overClass);
          isOver = false;
          return;
        }
        toIgnore.pop();
      });

      element.bind("dragover", function(e) {
        stop(e);
      });

      element.bind("drop", function(e) {
        stop(e);
        if (attrs.overClass) element.removeClass(attrs.overClass);
        isOver = false;
        e = e.originalEvent || e;
        var files = e.dataTransfer.files;

        if (!files.length) return;
        files = multiple ? files : files[0];

        if (modelExpr) modelExpr.assign(scope, files);
        if (!dropExpr) return (scope.$$phase) ? null : scope.$apply();

        var local = { $event: e };
        local['$file' + (multiple ? 's' : '')] = files;
        var result = function() { dropExpr(scope, local); };
        (scope.$$phase) ? result() : scope.$apply(result);
      });
    }
  };

}]);
