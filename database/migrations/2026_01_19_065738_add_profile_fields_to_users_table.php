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
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('email');
            $table->text('bio')->nullable()->after('avatar_url');
            $table->boolean('email_notifications')->default(true)->after('is_active');
            $table->boolean('push_notifications')->default(true)->after('email_notifications');
            $table->enum('notification_frequency', ['instant', 'daily', 'weekly'])->default('instant')->after('push_notifications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_url', 'bio', 'email_notifications', 'push_notifications', 'notification_frequency']);
        });
    }
};
