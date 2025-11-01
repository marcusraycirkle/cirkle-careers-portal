// Script to update job assignments with full names
const BACKEND_URL = 'https://cirkle-careers-api.marcusray.workers.dev';

// Name mappings
const NAME_UPDATES = {
  'Marcus': 'Marcus Ray',
  'Teejay': 'Teejay Everil',
  'Sam': 'Sam Caster',
  'Chase Johnson': 'Cos Boonyasak'
};

async function updateJobAssignments() {
  console.log('Fetching all jobs...');
  
  // Get all jobs
  const response = await fetch(`${BACKEND_URL}/api/jobs`);
  const jobs = await response.json();
  
  console.log(`Found ${Object.keys(jobs).length} jobs`);
  
  // Update each job's assigned array
  for (const [firebaseKey, job] of Object.entries(jobs)) {
    if (job.assigned && Array.isArray(job.assigned)) {
      const updatedAssigned = job.assigned.map(name => {
        const trimmedName = name.trim();
        return NAME_UPDATES[trimmedName] || trimmedName;
      });
      
      // Check if any changes were made
      const hasChanges = JSON.stringify(job.assigned) !== JSON.stringify(updatedAssigned);
      
      if (hasChanges) {
        console.log(`\nUpdating job: ${job.title}`);
        console.log(`  Old assigned: [${job.assigned.join(', ')}]`);
        console.log(`  New assigned: [${updatedAssigned.join(', ')}]`);
        
        // Update the job
        job.assigned = updatedAssigned;
        job.firebaseKey = firebaseKey; // Include firebaseKey for proper saving
        
        const updateResponse = await fetch(`${BACKEND_URL}/api/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(job)
        });
        
        if (updateResponse.ok) {
          console.log(`  ✅ Updated successfully`);
        } else {
          console.error(`  ❌ Failed to update: ${updateResponse.status}`);
        }
      } else {
        console.log(`Job "${job.title}" already has correct names, skipping`);
      }
    }
  }
  
  console.log('\n✅ All jobs updated!');
}

updateJobAssignments().catch(console.error);
