<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table
                ->string('shipping_name')
                ->nullable()
                ->after('user_id');

            $table
                ->string('shipping_phone', 30)
                ->nullable()
                ->after('shipping_name');

            $table
                ->string('shipping_city', 100)
                ->nullable()
                ->after('shipping_phone');

            $table
                ->string('shipping_district', 100)
                ->nullable()
                ->after('shipping_city');

            $table
                ->text('shipping_address')
                ->nullable()
                ->after('shipping_district');

            $table
                ->text('shipping_note')
                ->nullable()
                ->after('shipping_address');

            $table
                ->string('payment_method', 50)
                ->default('cash_on_delivery')
                ->after('shipping_note');

            $table
                ->string('payment_status', 30)
                ->default('pending')
                ->after('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_name',
                'shipping_phone',
                'shipping_city',
                'shipping_district',
                'shipping_address',
                'shipping_note',
                'payment_method',
                'payment_status',
            ]);
        });
    }
};
