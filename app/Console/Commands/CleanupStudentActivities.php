<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StudentActivity;

class CleanupStudentActivities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'student-activities:cleanup {--days=30 : Number of days to keep activities}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old student activities';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = now()->subDays($days);

        $this->info("Cleaning up student activities older than {$days} days...");

        $count = StudentActivity::where('last_activity', '<', $cutoffDate)->count();

        if ($count === 0) {
            $this->info('No old activities found to clean up.');
            return 0;
        }

        if ($this->confirm("This will delete {$count} old activities. Are you sure?")) {
            $deleted = StudentActivity::where('last_activity', '<', $cutoffDate)->delete();
            $this->info("Successfully deleted {$deleted} old activities.");
        } else {
            $this->info('Cleanup cancelled.');
        }

        return 0;
    }
}
