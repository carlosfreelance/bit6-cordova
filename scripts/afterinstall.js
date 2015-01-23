var fs = require('fs');
var str = 'android.library.reference.2=../../plugins/com.bit6.sdk/lib/android/bit6-sdk\n';

fs.open('platforms/android/project.properties', 'a', 666, function( e, id ) {
  fs.write( id, str, null, 'utf8', function(){
    console.log('Added reference to bit6-sdk in project.properties');
    fs.close(id, function(){
      console.log('afterinstall hook of com.bit6.sdk plugin has been successfully completed');
    });
  });
});
