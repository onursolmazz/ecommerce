<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table
                ->string('city', 100)
                ->nullable()
                ->after('phone');

            $table
                ->string('district', 100)
                ->nullable()
                ->after('city');

            $table
                ->text('address')
                ->nullable()
                ->after('district');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'city',
                'district',
                'address',
            ]);
        });
    }
};
