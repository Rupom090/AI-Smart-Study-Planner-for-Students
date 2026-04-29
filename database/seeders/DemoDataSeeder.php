<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\StudyMaterial;
use App\Models\DailyPlan;
use App\Models\DailyTask;
use App\Models\File;
use Carbon\Carbon;
use Faker\Factory as Faker;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // 1. Create a Test User that owns the primary data
        $testUser = clone User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'user',
                'is_active' => true,
            ]
        );

        $this->command->info('Creating 20 Demo Subjects & Dependencies for target user...');

        // 2. We'll generate 20 robust hierarchical trees of data for the $testUser
        for ($i = 1; $i <= 20; $i++) {

            // Create a Subject
            $subject = Subject::create([
                'user_id' => $testUser->id,
                'name' => $faker->catchPhrase(),
                'exam_date' => Carbon::now()->addDays($faker->numberBetween(10, 100))->format('Y-m-d'),
                'priority_level' => $faker->numberBetween(1, 4), // 1-4
            ]);

            // Create 3 Topics for each Subject (~60 topics total)
            for ($j = 1; $j <= 3; $j++) {
                $topic = Topic::create([
                    'subject_id' => $subject->id,
                    'title' => $faker->words(3, true),
                    'difficulty' => $faker->numberBetween(1, 5),
                    'estimated_hours' => $faker->randomFloat(1, 0.5, 10),
                    'is_completed' => $faker->boolean(30),
                ]);

                // Create a File Document for each Topic (~60 files total)
                $file = File::create([
                    'user_id' => $testUser->id,
                    'filename' => $faker->uuid() . '.pdf',
                    'original_name' => $faker->words(2, true) . '.pdf',
                    'url' => 'https://example.com/dummy.pdf',
                    'size' => $faker->numberBetween(1024, 10485760), // 1KB to 10MB
                    'mime_type' => 'application/pdf',
                    'file_type' => 'document',
                    'cloud_public_id' => null,
                ]);

                // Create a Study Material node linking topic and file
                StudyMaterial::create([
                    'user_id' => $testUser->id,
                    'subject_id' => $subject->id,
                    'file_id' => $file->id,
                    'title' => 'Reading: ' . $topic->title,
                    'document_type' => 'document',
                    'status' => 'completed',
                ]);

                // Conditionally Create some Past/Future Daily Plans
                if ($i <= 10) { // Make plans for half of the initial 20 loops
                    $planDate = Carbon::now()->addDays($faker->numberBetween(-5, 5));

                    // See if plan for date already exists to prevent duplicate constraint violation
                    $dailyPlan = DailyPlan::firstOrCreate([
                        'user_id' => $testUser->id,
                        'plan_date' => $planDate->format('Y-m-d'),
                    ], [
                        'total_hours' => $faker->randomFloat(1, 1, 6),
                        'ai_version' => '1.0',
                    ]);

                    // Attach 2 tasks to this plan pointing back to the topic
                    for ($k = 1; $k <= 2; $k++) {
                        DailyTask::create([
                            'daily_plan_id' => $dailyPlan->id,
                            'topic_id' => $topic->id,
                            'task_title' => 'Review ' . $topic->title,
                            'planned_minutes' => $faker->numberBetween(15, 60),
                            'task_order' => $k,
                            'status' => $faker->randomElement(['not_started', 'in_progress', 'completed']),
                        ]);
                    }
                }
            }
        }

        $this->command->info('20 Data Sets Created successfully! Login with: test@example.com / password');
    }
}
