<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use PHPUnit\Framework\Attributes\Test;

class AudioControllerTest extends TestCase
{
    use RefreshDatabase, WithoutMiddleware;

    #[Test]
    public function it_validates_audio_upload_for_transcription()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/files/audio/transcribe', []);

        $response->assertStatus(422);
        $this->assertArrayHasKey('audio', $response->json('error'));

        // Test with wrong file type
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response2 = $this->actingAs($user)->postJson('/api/v1/files/audio/transcribe', [
            'audio' => $file
        ]);

        $response2->assertStatus(422);
        $this->assertArrayHasKey('audio', $response2->json('error'));
    }
}
