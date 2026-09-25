const fs = require('fs');

function deduplicateClasses(file) {
  let content = fs.readFileSync(file, 'utf8');

  // We find all className="<classes>" and fix them
  content = content.replace(/className="([^"]+)"/g, (match, classes) => {
    // Split into individual classes
    let classArray = classes.split(/\s+/);
    
    // We want to keep the LAST occurrence of any prefix like md:grid-cols, lg:grid-cols, etc.
    let prefixMap = new Map();
    let resultClasses = [];

    // Reverse iterate to keep the last one easily?
    // Actually, iterating forward and replacing works too.
    for (let i = 0; i < classArray.length; i++) {
      let cls = classArray[i];
      if (!cls) continue;

      if (cls.match(/^(sm|md|lg|xl|2xl):grid-cols-\d+$/)) {
        let prefix = cls.split(':')[0] + ':grid-cols';
        prefixMap.set(prefix, cls);
      } else {
        // regular class, just add it
        resultClasses.push(cls);
      }
    }

    // Now insert the resolved grid classes
    for (let [prefix, cls] of prefixMap.entries()) {
      resultClasses.push(cls);
    }

    return `className="${resultClasses.join(' ')}"`;
  });

  // Also fix max-w-[500px], max-w-[800px], h-[800px], max-w-[600px], h-[600px], left-[27px]
  content = content.replace(/max-w-\[500px\]/g, 'max-w-125');
  content = content.replace(/max-w-\[800px\]/g, 'max-w-200');
  content = content.replace(/h-\[800px\]/g, 'h-200');
  content = content.replace(/max-w-\[600px\]/g, 'max-w-150');
  content = content.replace(/h-\[600px\]/g, 'h-150');
  content = content.replace(/left-\[27px\]/g, 'left-[6.75rem]');

  fs.writeFileSync(file, content, 'utf8');
}

deduplicateClasses('frontend/src/pages/Contact.jsx');
deduplicateClasses('frontend/src/pages/Services.jsx');
console.log('Fully deduplicated and fixed');
