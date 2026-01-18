<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('timezone')->nullable();
            $table->timestamps();
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('name');
            $table->date('exam_date');
            $table->integer('priority_level')->default(3);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('topics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('subject_id');
            $table->string('title');
            $table->integer('difficulty')->default(3);
            $table->float('estimated_hours')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamps();

            $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
        });

        Schema::create('daily_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->date('plan_date');
            $table->float('total_hours')->nullable();
            $table->string('ai_version')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'plan_date']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('daily_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('daily_plan_id');
            $table->uuid('topic_id');
            $table->string('task_title');
            $table->integer('planned_minutes')->nullable();
            $table->integer('task_order')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->foreign('daily_plan_id')->references('id')->on('daily_plans')->onDelete('cascade');
            $table->foreign('topic_id')->references('id')->on('topics')->onDelete('cascade');
        });

        Schema::create('progress_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('topic_id');
            $table->date('log_date');
            $table->integer('minutes_studied');
            $table->string('completion_status');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('topic_id')->references('id')->on('topics')->onDelete('cascade');
        });

        Schema::create('ai_feedback', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->date('plan_date');
            $table->text('input_summary')->nullable();
            $table->text('ai_response_summary')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_feedback');
        Schema::dropIfExists('progress_logs');
        Schema::dropIfExists('daily_tasks');
        Schema::dropIfExists('daily_plans');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('users');
    }
};
