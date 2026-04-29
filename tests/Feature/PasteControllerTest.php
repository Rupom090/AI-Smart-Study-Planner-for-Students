<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Models\File;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;

class PasteControllerTest extends TestCase
{
    use RefreshDatabase, WithoutMiddleware;

    #[Test]
    public function it_can_paste_text_and_save_as_a_document()
    {
        Storage::fake('public');

        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/files/paste', [
            'title' => 'My Paste Title',
            'content' => 'This is the pasted content.'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'file' => ['id', 'filename', 'original_name', 'url']
                ]
            ]);

        $this->assertDatabaseHas('files', [
            'user_id' => $user->id,
            'original_name' => 'My_Paste_Title.txt',
        ]);
    }

    #[Test]
    public function it_rejects_invalid_url_fetch_requests()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/files/paste/fetch-title', [
            'url' => 'not-a-url'
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function it_fetches_readable_content_from_a_valid_url()
    {
        /** @var User $user */
        $user = User::factory()->create();

        Http::fake([
            'https://example.com/article' => Http::response('<html><head><title>Example Article</title></head><body><h1>Heading</h1><p>This is test content for scraping.</p></body></html>', 200),
        ]);

        $response = $this->actingAs($user)->postJson('/api/v1/files/paste/fetch-content', [
            'url' => 'https://example.com/article',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Example Article');

        $this->assertStringContainsString('This is test content for scraping.', $response->json('data.text', ''));
    }
}
