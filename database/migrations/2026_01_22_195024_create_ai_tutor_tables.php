<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('study_materials');

        Schema::create('study_materials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('file_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->string('document_type')->default('document'); // document, image
            $table->longText('content_extracted')->nullable(); // Raw text extracted
            $table->json('ai_analysis')->nullable(); // Structured analysis (key concepts, questions)
            $table->string('status')->default('pending'); // pending, processing, completed, failed

            $table->timestamps();
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('study_material_id')->constrained('study_materials')->cascadeOnDelete();

            $table->enum('role', ['user', 'assistant']);
            $table->text('content');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('study_materials');
    }
};
