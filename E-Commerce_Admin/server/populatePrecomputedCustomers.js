// Set NODE_ENV to production if running on production server and not already set
if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
  process.env.NODE_ENV = 'production';
}

const Customer = require('./modules/customer/customerModel');
const pool = require('./utils/mysqlService');

async function populatePrecomputedCustomers(criteriaFilter) {
  console.time('Total Time'); // Start total time timer
  try {
    console.time('Clear Precomputed Customers'); // Start timer for clearing precomputed customers
    await Customer.clearPrecomputedCustomers(criteriaFilter);
    console.timeEnd('Clear Precomputed Customers'); // End timer for clearing precomputed customers

    const criteria = [
      { subtract_big: 12, subtract_small: 6, criteria: "=1", filter_criteria: 'filterBaza1' },
      { subtract_big: 24, subtract_small: 6, criteria: ">1", filter_criteria: 'filterBaza2' },
      { subtract_big: 24, subtract_small: 4, criteria: ">2", filter_criteria: 'filterBaza3' },
      { subtract_big: 36, subtract_small: 6, criteria: ">2", filter_criteria: 'filterBaza4' }
    ];

    // Filter criteria based on the provided criteriaFilter
    const filteredCriteria = criteriaFilter
      ? criteria.filter(c => c.filter_criteria === criteriaFilter)
      : criteria;

    console.log('Starting to process criteria:', filteredCriteria);

    for (const criterion of filteredCriteria) {
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
      const batchSize = 2000; // Adjust batch size as needed
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
    // Ensure all operations are completed before closing the pool
    try {
      await pool.end(); // Close the database connection properly
    } catch (err) {
      console.error('Error closing database pool:', err);
    }
    console.timeEnd('Total Time'); // End total time timer
  }
}

// Get the criteria filter from command-line arguments
const criteriaFilter = process.argv[2];

console.log('Criteria Filter:', criteriaFilter);

populatePrecomputedCustomers(criteriaFilter);
