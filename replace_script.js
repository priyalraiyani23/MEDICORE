const fs = require('fs');

function clean(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Contact.jsx specific
  content = content.replace(/max-w-\[500px\]/g, 'max-w-125');
  content = content.replace(/lg:grid-cols-1 lg:grid-cols-5/g, 'lg:grid-cols-5');
  content = content.replace(/md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-4/g, 'md:grid-cols-2 lg:grid-cols-4');
  
  // Services.jsx specific
  content = content.replace(/md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3/g, 'md:grid-cols-2 lg:grid-cols-3');
  content = content.replace(/md:grid-cols-1 md:grid-cols-2/g, 'md:grid-cols-2');
  content = content.replace(/md:grid-cols-2 md:grid-cols-2/g, 'md:grid-cols-2');
  content = content.replace(/max-w-\[800px\]/g, 'max-w-200');
  content = content.replace(/h-\[800px\]/g, 'h-200');
  content = content.replace(/max-w-\[600px\]/g, 'max-w-150');
  content = content.replace(/h-\[600px\]/g, 'h-150');
  content = content.replace(/left-\[27px\]/g, 'left-6.75');

  // Generic deduplication
  content = content.replace(/md:grid-cols-1 md:grid-cols-2/g, 'md:grid-cols-2');
  content = content.replace(/lg:grid-cols-1 lg:grid-cols-4/g, 'lg:grid-cols-4');
  content = content.replace(/lg:grid-cols-1 lg:grid-cols-3/g, 'lg:grid-cols-3');

  fs.writeFileSync(file, content, 'utf8');
}

clean('frontend/src/pages/Contact.jsx');
clean('frontend/src/pages/Services.jsx');
console.log('Done');
