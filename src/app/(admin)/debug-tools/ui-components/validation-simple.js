/**
 * Simple Component Validation Script
 * 
 * This can be run directly with Node.js and doesn't require React rendering
 */

// Use dynamic imports for Node.js modules
async function run() {
  const fs = await import('fs');
  const path = await import('path');
  
  console.log('\n=== UI Component Validation ===\n');
  
  try {
    // Check if the component discovery module exists
    const discoveryPath = path.default.resolve('./utils/component-discovery.js');
    if (!fs.default.existsSync(discoveryPath)) {
      console.error('❌ Component discovery module not found at:', discoveryPath);
      process.exit(1);
    }
    
    console.log('✅ Component discovery module found');
    
    // Check if component-registry-utils.js exists
    const registryUtilsPath = path.default.resolve('./utils/component-registry-utils.js');
    if (!fs.default.existsSync(registryUtilsPath)) {
      console.error('❌ Component registry utils module not found at:', registryUtilsPath);
      process.exit(1);
    }
    
    console.log('✅ Component registry utils module found');
    
    // Dynamically import the discovery module
    const { discoverComponents } = await import('./utils/component-discovery.js');
    
    if (typeof discoverComponents !== 'function') {
      console.error('❌ discoverComponents is not a function:', typeof discoverComponents);
      process.exit(1);
    }
    
    console.log('✅ discoverComponents function is available');
    
    // Try to discover components
    try {
      console.log('\nDiscovering components...');
      const components = await discoverComponents();
      
      if (!Array.isArray(components)) {
        console.error('❌ discoverComponents did not return an array:', typeof components);
        process.exit(1);
      }
      
      console.log(`✅ Successfully discovered ${components.length} components\n`);
      
      // Count components by category
      const categories = {};
      components.forEach(component => {
        const category = component.category || 'unknown';
        categories[category] = (categories[category] || 0) + 1;
      });
      
      console.log('Components by category:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`- ${category}: ${count}`);
      });
      
      // Check if some important components exist
      const criticalComponents = ['Button', 'Alert', 'Modal', 'Skeleton'];
      const missingCritical = criticalComponents.filter(name => 
        !components.some(c => c.name === name)
      );
      
      if (missingCritical.length > 0) {
        console.log(`\n⚠️ Missing critical components: ${missingCritical.join(', ')}`);
      } else {
        console.log('\n✅ All critical components were discovered');
      }
      
      // Check API endpoint
      const apiPath = path.default.resolve('../../api/components/discover/route.ts');
      if (fs.default.existsSync(apiPath)) {
        console.log('✅ API endpoint for component discovery exists');
      } else {
        console.log('⚠️ API endpoint for component discovery not found at expected path');
      }
      
      // Overall status
      console.log('\n=== Validation Summary ===\n');
      console.log(`Total components discovered: ${components.length}`);
      console.log(`Critical components available: ${criticalComponents.length - missingCritical.length}/${criticalComponents.length}`);
      
      console.log('\n✅ Validation completed successfully');
      
    } catch (err) {
      console.error('❌ Error running component discovery:', err);
      process.exit(1);
    }
    
  } catch (err) {
    console.error('❌ Validation failed:', err);
    process.exit(1);
  }
}

// Run the validation
run().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}); 