/**
 * The angular file upload module
 * @author: nerv
 * @version: 0.5.7, 2014-05-23
 */

// It is attached to an element that catches the event drop file
app.directive('ngFileDrop', ['$fileUploader', function ($fileUploader) {
    'use strict';

    return {
        // don't use drag-n-drop files in IE9, because not File API support
        link: !$fileUploader.isHTML5 ? angular.noop : function (scope, element, attributes) {
          element
            .context.addEventListener('drop', function (event) {
               function traverseFileTree(item, path) {
                path = path || "";
                if (item.isFile) {
                  // Get file
                  item.file(function(file) {
                    file.relativePath=path + file.name;
                    scope.$emit('file:add', file, scope.$eval(attributes.ngFileDrop));
                  });
                } else if (item.isDirectory) {
                  // Get folder contents
                  var dirReader = item.createReader();
                  dirReader.readEntries(function(entries) {
                    for (var i=0; i<entries.length; i++) {
                      traverseFileTree(entries[i], path + item.name + "/");
                    }
                  });
                }
              }
              var items = event.dataTransfer.items;
              for (var i=0; i<items.length; i++) {
                // webkitGetAsEntry is where the magic happens
                var item = items[i].webkitGetAsEntry();
                if (item) {
                  traverseFileTree(item);
                } else {
                  scope.$emit('file:add', items[i], scope.$eval(attributes.ngFileDrop));
                }
              }

              event.preventDefault();
              event.stopPropagation();
              scope.$broadcast('file:removeoverclass');

                });
          element
            .bind('dragover', function (event) {
              var dataTransfer = event.dataTransfer ?
                event.dataTransfer :
                event.originalEvent.dataTransfer; // jQuery fix;

              event.preventDefault();
              event.stopPropagation();
              dataTransfer.dropEffect = 'copy';
              scope.$broadcast('file:addoverclass');
            })
            .bind('dragleave', function (event) {
              if (event.target === element[0]) {
                scope.$broadcast('file:removeoverclass');
              }
            });
        }
    };
}])
