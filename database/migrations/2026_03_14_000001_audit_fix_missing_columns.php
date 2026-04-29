<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Audit fix migration — adds all columns found missing during the March 2026 codebase audit.
 *
 *  subjects:   + description (text, nullable)
 *              + color       (string, nullable)
 *              + icon        (string, nullable)
 *              exam_date → nullable  (frontend allows creation without an exam date)
 *
 *  topics:     + user_id (uuid, nullable)    required by DashboardController weekly-activity query
 *              + notes   (text, nullable)    used in TopicResource
 *
 *  daily_tasks: back-fill 'pending' → 'not_started' to align with DailyTaskStatus enum
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── subjects ───────────────────────────────────────────────────────────
        Schema::table('subjects', function (Blueprint $table) {
            if (!Schema::hasColumn('subjects', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            if (!Schema::hasColumn('subjects', 'color')) {
                $table->string('color', 30)->nullable()->after('description');
            }
            if (!Schema::hasColumn('subjects', 'icon')) {
                $table->string('icon', 50)->nullable()->after('color');
            }
            // Make exam_date nullable so subjects can be created without a deadline
            $table->date('exam_date')->nullable()->change();
        });

        // ── topics ─────────────────────────────────────────────────────────────
        Schema::table('topics', function (Blueprint $table) {
            if (!Schema::hasColumn('topics', 'user_id')) {
                // Derived from subject.user_id, stored directly for efficient querying
                $table->uuid('user_id')->nullable()->after('id');
                $table->index('user_id');
            }
            if (!Schema::hasColumn('topics', 'notes')) {
                $table->text('notes')->nullable()->after('is_completed');
            }
        });

        // ── daily_tasks: fix legacy 'pending' rows to match DailyTaskStatus enum ──
        DB::statement("UPDATE daily_tasks SET status = 'not_started' WHERE status = 'pending'");
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn(array_filter(['description', 'color', 'icon'], fn($c) => Schema::hasColumn('subjects', $c)));
            $table->date('exam_date')->nullable(false)->change();
        });

        Schema::table('topics', function (Blueprint $table) {
            if (Schema::hasColumn('topics', 'user_id')) {
                $table->dropIndex(['user_id']);
                $table->dropColumn('user_id');
            }
            if (Schema::hasColumn('topics', 'notes')) {
                $table->dropColumn('notes');
            }
        });
    }
};
