<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class SubjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_subject()
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/v1/subjects', [
                'name' => 'Math',
                'description' => 'Mathematics',
                'color' => '#FF0000',
                'exam_date' => '2025-12-31',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('name', 'Math');

        $this->assertDatabaseHas('subjects', ['name' => 'Math']);
    }

    public function test_user_can_list_subjects()
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        Subject::create([
            'user_id' => $user->id,
            'name' => 'History',
            'color' => '#00FF00',
            'exam_date' => '2025-11-15'
        ]);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/v1/subjects');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}
