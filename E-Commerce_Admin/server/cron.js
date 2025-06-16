// Set NODE_ENV to production if not already set to a known environment
if (!process.env.NODE_ENV || !['production', 'test', 'new-test', 'development'].includes(process.env.NODE_ENV)) {
  process.env.NODE_ENV = 'production';
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'new-test' || process.env.NODE_ENV === 'development') {

  var cron = require('node-cron');
  var Customer = require('./modules/customer/customerModel'); // Ensure Customer is imported
  var pool = require('./utils/mysqlService'); // Ensure pool is imported

  console.log('server/cron.js loaded');

  let isRunning = false; // Define a flag to indicate if the job is running

  // Run every Sunday at 2 AM
  cron.schedule('0 2 * * 0', async () => {
    if (isRunning) {
      console.log('Cron job is already running. Skipping this execution.');
      return; // Skip the execution if the job is already running
    }

    isRunning = true; // Set the flag to indicate that the job is running
    console.time('Total Time'); // Start total time timer
    try {
      console.time('Clear Precomputed Customers'); // Start timer for clearing precomputed customers
      await Customer.clearPrecomputedCustomers();
      console.timeEnd('Clear Precomputed Customers'); // End timer for clearing precomputed customers
  
      const criteria = [
        { subtract_big: 12, subtract_small: 6, criteria: "=1", filter_criteria: 'filterBaza1' },
        { subtract_big: 24, subtract_small: 6, criteria: ">1", filter_criteria: 'filterBaza2' },
        { subtract_big: 24, subtract_small: 4, criteria: ">2", filter_criteria: 'filterBaza3' },
        { subtract_big: 36, subtract_small: 6, criteria: ">2", filter_criteria: 'filterBaza4' }
      ];
  
      for (const criterion of criteria) {
        console.time(`Fetch Customers for ${criterion.filter_criteria}`); // Start timer for fetching customers
        const result = await Customer.filterBazaCustomers({}, criterion);
        const [customers, count] = result;
        console.timeEnd(`Fetch Customers for ${criterion.filter_criteria}`); // End timer for fetching customers
  
        console.log(`Fetched ${count} customers for ${criterion.filter_criteria}`);
  
        // Ensure customers is an array
        if (!Array.isArray(customers)) {
          throw new Error(`Expected an array of customers, but got: ${typeof customers}`);
        }
  
        // Process customers in smaller batches
        const batchSize = 30000; // Adjust batch size as needed
        for (let i = 0; i < customers.length; i += batchSize) {
          const batch = customers.slice(i, i + batchSize);
          console.time(`Insert Precomputed Customers for ${criterion.filter_criteria} - Batch ${i / batchSize + 1}`); // Start timer for inserting precomputed customers
          await Customer.insertPrecomputedCustomers(batch, criterion.filter_criteria);
          console.timeEnd(`Insert Precomputed Customers for ${criterion.filter_criteria} - Batch ${i / batchSize + 1}`); // End timer for inserting precomputed customers
          console.log(`Inserted batch ${i / batchSize + 1} of precomputed customers for ${criterion.filter_criteria}`);
        }
      }
  
      console.log('Precomputed customers table populated successfully.');
    } catch (err) {
      console.error('Error populating precomputed customers table:', err);
    } finally {
      isRunning = false; // Clear the flag to indicate that the job has finished
      console.timeEnd('Total Time'); // End total time timer
    }
  });

  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'new-test') {
    // Additional test-specific cron jobs can be added here
  }
}
